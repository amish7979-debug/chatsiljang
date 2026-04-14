import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type TuitionItem = { className: string; fee: string };
type ScheduleItem = { day: string; time: string };
type FaqItem = { question: string; answer: string };

type Body = {
  academyName?: string;
  phone?: string;
  address?: string;
  tuition?: TuitionItem[];
  schedule?: ScheduleItem[];
  faq?: FaqItem[];
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  const name = typeof body.academyName === "string" ? body.academyName.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "학원 이름은 필수입니다." }, { status: 400 });
  }

  const phone =
    typeof body.phone === "string" ? body.phone.trim() || null : null;
  const address =
    typeof body.address === "string" ? body.address.trim() || null : null;

  const tuition = Array.isArray(body.tuition)
    ? body.tuition.map((t) => ({
        className: String(t.className ?? "").trim(),
        fee: String(t.fee ?? "").trim(),
      }))
    : [];
  const schedule = Array.isArray(body.schedule)
    ? body.schedule.map((s) => ({
        day: String(s.day ?? "").trim(),
        time: String(s.time ?? "").trim(),
      }))
    : [];
  const faq = Array.isArray(body.faq)
    ? body.faq.map((f) => ({
        question: String(f.question ?? "").trim(),
        answer: String(f.answer ?? "").trim(),
      }))
    : [];

  try {
    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("academies")
      .insert({
        name,
        phone,
        address,
        price_info: tuition,
        schedule,
        faq,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[academies] insert error", error);
      return NextResponse.json(
        { error: error.message || "데이터베이스 저장에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ id: data?.id });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "서버 설정 또는 저장 중 오류가 발생했습니다.";
    console.error("[academies] POST", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
