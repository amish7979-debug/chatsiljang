import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function removeMarkdown(text: string): string {
  return text.replace(/##|###|\*\*|__|--|~~|\*/g, "").trim();
}

function findFaqMatch(faq: {question: string; answer: string}[], message: string): string | null {
  const msg = message.toLowerCase().trim();
  for (const item of faq) {
    const q = item.question.toLowerCase().trim();
    if (msg === q || msg.includes(q) || q.includes(msg)) return item.answer;
    const keywords = q.split(/[\s,?!.~]+/).filter(k => k.length > 1);
    const matchCount = keywords.filter(k => msg.includes(k)).length;
    const score = matchCount / keywords.length;
    if (matchCount >= 2 && score >= 0.7) return item.answer;
  }
  return null;
}

const ACTION_BUTTONS = [
  { label: "체험수업 예약하기", text: "체험수업 예약하고 싶어요" },
];

export async function POST(req: NextRequest) {
  try {
    const { message, academyId } = await req.json();
    if (!message || !academyId) return NextResponse.json({ reply: "요청 정보가 부족해요." }, { status: 400 });

    const { data: academy } = await supabase
      .from("academies")
      .select("name, phone, address, price_info, schedule")
      .eq("id", academyId)
      .single();

    const { data: faqData } = await supabase
      .from("faq")
      .select("question, answer, category")
      .eq("academy_id", academyId)
      .order("sort_order");

    if (!academy) return NextResponse.json({ reply: "학원 정보를 찾을 수 없어요." }, { status: 404 });

    const faq = faqData || [];

    const faqAnswer = findFaqMatch(faq, message);
    if (faqAnswer) {
      return NextResponse.json({
        reply: faqAnswer + "\n\n학원 등록 정보 기준으로 안내드렸어요.",
        buttons: ACTION_BUTTONS
      });
    }

    const systemPrompt = `당신은 ${academy.name} 학원의 친절한 AI 상담사입니다.
반드시 아래 학원 정보와 Q&A만 근거로 답변하세요.
수강료, 시간표, 보강, 할인, 등록 가능 여부는 절대 추측하지 마세요.
정보가 없으면 "원장님 확인 후 안내드리겠습니다"라고 답하세요.
답변은 4~6문장 이내로 작성하세요.
마크다운 기호는 절대 사용하지 마세요.
자연스러운 한국어로 짧고 친절하게 답변하세요.

[학원 정보]
학원명: ${academy.name}
전화번호: ${academy.phone || "없음"}
주소: ${academy.address || "없음"}
수강료: ${JSON.stringify(academy.price_info || {})}
시간표: ${JSON.stringify(academy.schedule || {})}
FAQ: ${JSON.stringify(faq)}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const aiText = response.content[0].type === "text" ? response.content[0].text : "";
    const isUncertain = aiText.includes("원장님 확인") || aiText.includes("정보가 없") || aiText.includes("확인이 필요");
    const reply = removeMarkdown(aiText || "답변을 생성하지 못했어요.");
    const finalReply = reply + "\n\n햇살피아노의 등록된 상담 정보를 바탕으로 답변드렸습니다.";

    const buttons = isUncertain
      ? [
          { label: "원장님께 문의", text: "원장님께 문의 남기기" },
          { label: "체험수업 예약하기", text: "체험수업 예약하고 싶어요" },
        ]
      : ACTION_BUTTONS;

    return NextResponse.json({ reply: finalReply, buttons });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ reply: "오류가 발생했어요." }, { status: 500 });
  }
}
