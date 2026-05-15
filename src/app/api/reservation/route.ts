import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { academyId, studentName, phone, desiredDate, desiredTime, notes } =
      await req.json();

    if (!academyId || !studentName?.trim() || !phone?.trim() || !desiredDate?.trim()) {
      return NextResponse.json(
        { error: "필수 항목을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const datePart = desiredDate.trim();
    const timePart = desiredTime?.trim();
    const desired_date = timePart ? `${datePart} ${timePart}` : datePart;

    const { error } = await supabase.from("reservations").insert({
      academy_id: academyId,
      parent_name: studentName.trim(),
      phone: phone.trim(),
      desired_date,
      class_type: "체험수업",
      status: "pending",
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
    });

    if (error) {
      console.error("Reservation insert error:", error);
      return NextResponse.json(
        { error: "예약 저장에 실패했어요. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reservation API error:", error);
    return NextResponse.json(
      { error: "오류가 발생했어요." },
      { status: 500 }
    );
  }
}
