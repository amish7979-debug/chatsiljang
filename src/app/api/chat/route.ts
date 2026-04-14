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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const academyId = searchParams.get("academyId");
  const consultationId = searchParams.get("consultationId");

  if (!consultationId) return NextResponse.json({ messages: [] });

  const { data } = await supabase
    .from("consultations")
    .select("messages")
    .eq("id", consultationId)
    .eq("academy_id", academyId)
    .single();

  return NextResponse.json({ messages: data?.messages ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const { academyId, consultationId, content } = await req.json();

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
학부모의 질문에 친절하고 정확하게 답변해주세요.`
      : "당신은 학원 AI 상담 매니저입니다.";

    let history: { role: "user" | "assistant"; content: string }[] = [];

    if (consultationId) {
      const { data } = await supabase
        .from("consultations")
        .select("messages")
        .eq("id", consultationId)
        .single();

      if (data?.messages) {
        history = data.messages;
      }
    }

    const messages = [
      ...history,
      { role: "user" as const, content },
    ];

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const reply = response.content[0].type === "text" 
      ? response.content[0].text 
      : "";

    const newMessages = [
      ...history,
      { role: "user", content },
      { role: "assistant", content: reply },
    ];

    let outConsultationId = consultationId;

    if (consultationId) {
      await supabase
        .from("consultations")
        .update({ messages: newMessages, updated_at: new Date().toISOString() })
        .eq("id", consultationId);
    } else {
      const { data: inserted } = await supabase
        .from("consultations")
        .insert({ academy_id: academyId, messages: newMessages, updated_at: new Date().toISOString() })
        .select("id")
        .single();
      outConsultationId = inserted?.id;
    }

    return NextResponse.json({ reply, consultationId: outConsultationId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "서버 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}