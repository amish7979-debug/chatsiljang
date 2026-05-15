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
    
    // 1. 질문이 완전히 포함되는 경우
    if (msg.includes(q) || q.includes(msg)) return item.answer;
    
    // 2. 핵심 키워드 2개 이상 동시에 매칭되는 경우만 허용
    const keywords = q.split(/[\s,?!.~]+/).filter(k => k.length > 2);
    const matchCount = keywords.filter(k => msg.includes(k)).length;
    
    if (keywords.length > 0 && matchCount >= Math.min(2, keywords.length)) {
      return item.answer;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { message, academyId } = await req.json();
    if (!message || !academyId) return NextResponse.json({ reply: "요청 정보가 부족해요." }, { status: 400 });

    const { data: academy, error } = await supabase
      .from("academies")
      .select("*")
      .eq("id", academyId)
      .single();

    console.log("academy:", academy?.name, "error:", error);

    if (!academy) return NextResponse.json({ reply: "학원 정보를 찾을 수 없어요." }, { status: 404 });

    if (academy.faq && Array.isArray(academy.faq)) {
      const faqAnswer = findFaqMatch(academy.faq, message);
      if (faqAnswer) return NextResponse.json({ reply: faqAnswer });
    }

    const systemPrompt = `당신은 ${academy.name} 학원의 친절한 AI 상담사입니다.
아래 학원 정보를 바탕으로 학부모 질문에 답변하세요.
마크다운 기호는 절대 사용하지 마세요. 자연스러운 한국어로 짧고 친절하게 답변하세요.

[학원 정보]
학원명: ${academy.name}
전화번호: ${academy.phone || "없음"}
주소: ${academy.address || "없음"}
수강료: ${JSON.stringify(academy.price_info || {})}
시간표: ${JSON.stringify(academy.schedule || {})}
FAQ: ${JSON.stringify(academy.faq || [])}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const reply = removeMarkdown(
      response.content[0].type === "text" ? response.content[0].text : "답변을 생성하지 못했어요."
    );

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ reply: "오류가 발생했어요." }, { status: 500 });
  }
}
