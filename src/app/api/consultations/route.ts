import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "1234";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  const academyId = searchParams.get("academyId");

  if (password !== DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  if (!academyId) {
    return NextResponse.json({ error: "academyId 필요" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("consultations")
    .select("id, question, answer, category, created_at")
    .eq("academy_id", academyId)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ consultations: [], error: error.message });
  }

  return NextResponse.json({ consultations: data || [] });
}