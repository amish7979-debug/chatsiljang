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
    const academyId = "10feabe1-5f62-4e92-b485-6146a7539c5d";

    // 예약 정보가 포함된 메시지인지 확인
    const hasReservationInfo =
      userMessage.includes("이름:") && userMessage.includes("연락처:");

    // 예약 의도 감지
    const isReservation =
      userMessage.includes("예약") ||
      userMessage.includes("체험") ||
      userMessage.includes("신청");

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
      ? `당신은 "${academy.name}" 학원의 AI 상담 매니저 챗실장입니다.
학원 정보:
- 주소: ${academy.address || "미등록"}
- 전화: ${academy.phone || "미등록"}
- 시간표: ${JSON.stringify(academy.schedule || {})}
- 수강료: ${JSON.stringify(academy.price_info || {})}
- FAQ: ${JSON.stringify(academy.faq || {})}
학부모의 질문에 친절하고 정확하게 답변해주세요. 모르는 정보는 학원에 직접 문의를 안내하세요.
답변은 카카오톡 메시지에 적합하게 간결하게 작성해주세요.
마크다운 문법(#, ##, **, -, --- 등)은 절대 사용하지 마세요. 일반 텍스트와 이모지만 사용하세요.`
      : "당신은 학원 AI 상담 매니저입니다.";

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