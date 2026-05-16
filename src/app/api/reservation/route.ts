import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { academyId, studentName, phone, notes } = body;
    const desiredDate = body.desiredDate || body.desired_date || "";
    const classType = body.class_type || body.classType || "체험수업";

    if (!academyId || !studentName || !phone) {
      return NextResponse.json({ success: false, message: "필수 항목을 입력해주세요." }, { status: 400 });
    }

    const { error } = await supabase.from("reservations").insert({
      academy_id: academyId,
      parent_name: studentName,
      phone: phone,
      desired_date: desiredDate,
      class_type: classType,
      status: "pending",
    });

    if (error) {
      console.error("예약 저장 오류:", error);
      return NextResponse.json({ success: false, message: "예약 저장에 실패했어요." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "예약이 완료되었습니다!" });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, message: "오류가 발생했어요." }, { status: 500 });
  }
}
