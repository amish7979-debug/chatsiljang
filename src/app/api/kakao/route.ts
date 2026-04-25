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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const userMessage = body.userRequest?.utterance || "";
    
    const academyId = "10feabe1-5f62-4e92-b485-6146a7539c5d";

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
마크다운 문법(#, ##, **, -, --- 등)은 절대 사용하지 마세요.
이모지는 자연스럽게 사용해도 됩니다.
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
  .replace(/#{1,6}\s*/g, "")
  .replace(/\*\*(.+?)\*\*/g, "$1")
  .replace(/\*(.+?)\*/g, "$1")
  .replace(/---/g, "")
  .replace(/^\s*[-•]\s/gm, "- ");

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