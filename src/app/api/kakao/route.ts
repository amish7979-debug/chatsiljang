import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function removeMarkdown(text: string): string {
  return text
    .replace(/#{1,6} /g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/---/g, "");
}

function parseReservationInfo(message: string) {
  const nameMatch = message.match(/이름\s*[:：]\s*([^\s\n,]+)/);
  const phoneMatch = message.match(/연락처\s*[:：]\s*([0-9\-]+)/);
  const dateMatch = message.match(/날짜\s*[:：]\s*([^\n,]+)/);
  const classMatch = message.match(/수업\s*[:：]\s*([^\n,]+)/);
  return {
    name: nameMatch?.[1]?.trim() || null,
    phone: phoneMatch?.[1]?.trim() || null,
    date: dateMatch?.[1]?.trim() || null,
    classType: classMatch?.[1]?.trim() || null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage = body.userRequest?.utterance || "";
    const channelId = body.bot?.id || "";
    console.log("카카오 요청 body:", JSON.stringify(body));
    const academyMap: Record<string, string> = {
      "10feabe1-5f62-4e92-b485-6146a7539c5d": "10feabe1-5f62-4e92-b485-6146a7539c5d",
  "69ec58d44609e56adc740ef9": "30333e1b-8ebd-4e19-b17a-f33c7fb22d43",
    };
    const academyId = academyMap[channelId] || "30333e1b-8ebd-4e19-b17a-f33c7fb22d43";

    // FAQ 키워드 매칭
const { data: academyForFaq } = await supabase
  .from("academies")
  .select("faq")
  .eq("id", academyId)
  .single();

if (academyForFaq?.faq && Array.isArray(academyForFaq.faq)) {
  const matchedFaq = academyForFaq.faq.find((item: any) =>
    userMessage.includes(item.question.replace("?", "").replace("？", "").trim().substring(0, 5))
  );
  if (matchedFaq) {
    return NextResponse.json({
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: matchedFaq.answer } }],
      },
    });
  }
}
    const isPriceQuestion = 
  userMessage.includes("수강료") ||
  userMessage.includes("가격") ||
  userMessage.includes("비용") ||
  userMessage.includes("얼마");

if (isPriceQuestion) {
  const { data: academy } = await supabase
    .from("academies")
    .select("name, price_info")
    .eq("id", academyId)
    .single();
  
  const priceInfo = academy?.price_info;
  let priceText = "수강료 정보를 불러오는 중 오류가 발생했습니다.";
  
  if (priceInfo && Array.isArray(priceInfo)) {
    priceText = `📚 ${academy?.name} 수강료 안내\n\n`;
    priceInfo.forEach((item: any) => {
      priceText += `• ${item.class}: ${item.price}\n`;
    });
    priceText += "\n문의: 061-686-8879";
  }
  
  return NextResponse.json({
    version: "2.0",
    template: {
      outputs: [{ simpleText: { text: priceText } }],
    },
  });
}
    // 예약 정보가 포함된 메시지인지 확인
    const hasReservationInfo =
  (userMessage.includes("이름") && userMessage.includes("연락처"));

    // 예약 의도 감지
    const isReservation =
      userMessage.includes("예약") ||
      userMessage.includes("체험") ||
      userMessage.includes("신청");

      // 맞춤수업 추천 의도 감지
      const isRecommendation =
      userMessage.includes("추천") ||
      userMessage.includes("맞춤") ||
      userMessage.includes("어떤 수업");

    // 추천 정보가 포함된 메시지인지 확인
    const hasRecommendationInfo =
  userMessage.includes("학년") || 
  (userMessage.includes("과목") && userMessage.includes("목표"));

    // 맞춤수업 추천 처리
    if (hasRecommendationInfo) {
      const { data: academy } = await supabase
  .from("academies")
  .select("name, address, phone, schedule, price_info, faq")
  .eq("id", academyId)
  .single();

      const recommendPrompt = `당신은 "${academy?.name || "학원"}" 학원의 AI 상담 매니저입니다.
학원 수업 정보: ${JSON.stringify(academy?.price_info || {})}
학부모가 보낸 정보: ${userMessage}
위 정보를 바탕으로 아이에게 맞는 수업을 친절하게 추천해주세요.
마크다운 없이 일반 텍스트와 이모지만 사용하세요.`;

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [{ role: "user", content: recommendPrompt }],
      });

      const rawReply = response.content[0].type === "text"
        ? response.content[0].text
        : "죄송합니다. 다시 시도해주세요.";

      return NextResponse.json({
        version: "2.0",
        template: {
          outputs: [{ simpleText: { text: removeMarkdown(rawReply) } }],
        },
      });
    }

    // 맞춤수업 추천 안내
    if (isRecommendation) {
      return NextResponse.json({
        version: "2.0",
        template: {
          outputs: [{ simpleText: { text: "맞춤 수업을 추천해드릴게요! 😊\n\n아래 형식으로 보내주세요:\n\n학년: 초등 3학년\n과목: 수학\n목표: 기초 다지기" } }],
        },
      });
    }

    // 예약 정보 저장 처리
    if (hasReservationInfo) {
      const info = parseReservationInfo(userMessage);
      if (info.name && info.phone) {
        await supabase.from("reservations").insert({
          academy_id: academyId,
          parent_name: info.name,
          phone: info.phone,
          desired_date: info.date || "미정",
          class_type: info.classType || "체험수업",
          status: "pending",
        });
        return NextResponse.json({
          version: "2.0",
          template: {
            outputs: [{ simpleText: { text: `예약이 완료되었습니다! 🎉\n\n이름: ${info.name}\n연락처: ${info.phone}\n희망날짜: ${info.date || "미정"}\n\n학원에서 곧 연락드리겠습니다. 감사합니다! 😊` } }],
          },
        });
      }
    }

    // 예약 안내
    if (isReservation) {
      return NextResponse.json({
        version: "2.0",
        template: {
          outputs: [{ simpleText: { text: "체험수업 예약을 도와드릴게요! 😊\n\n아래 형식으로 보내주세요:\n\n이름: 홍길동\n연락처: 010-1234-5678\n날짜: 5월 3일\n수업: 수학" } }],
        },
      });
    }

    const { data: academy } = await supabase
      .from("academies")
      .select("*")
      .eq("id", academyId)
      .single();

      const systemPrompt = academy
  ? `"${academy.name}" 학원 AI 상담사입니다.
주소: ${academy.address || "미등록"}
전화: ${academy.phone || "미등록"}
수강료: ${JSON.stringify(academy.price_info || {})}
FAQ: ${JSON.stringify(academy.faq || {})}
학원 상세 안내: ${academy.description || ""}
친절하고 간결하게 답변. 마크다운 금지. 이모지 사용.
반드시 학원 관련 질문에만 답변하세요. 날씨, 맛집, 주식 등 학원과 무관한 질문은 "저는 ${academy.name} 전용 상담 챗봇이라 학원 관련 질문만 답변드릴 수 있어요 😊"라고 안내하세요.`
  : "학원 AI 상담사입니다.";

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawReply = response.content[0].type === "text"
      ? response.content[0].text
      : "죄송합니다. 다시 시도해주세요.";

    const reply = rawReply
      .replace(/#{1,6} /g, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/---/g, "");

    return NextResponse.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: reply,
            },
          },
        ],
      },
    });
  } catch (e) {
    return NextResponse.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "죄송합니다. 잠시 후 다시 시도해주세요.",
            },
          },
        ],
      },
    });
  }
}