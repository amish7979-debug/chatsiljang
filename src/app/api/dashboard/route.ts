import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  if (password !== process.env.DASHBOARD_PASSWORD) return NextResponse.json({ error: "인증 실패" }, { status: 401 });

  const { data: reservations } = await supabase
    .from("reservations")
    .select("*")
    .eq("academy_id", "10feabe1-5f62-4e92-b485-6146a7539c5d")
    .order("created_at", { ascending: false });

  return NextResponse.json({ reservations: reservations || [] });
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  if (password !== process.env.DASHBOARD_PASSWORD) return NextResponse.json({ error: "인증 실패" }, { status: 401 });

  const body = await req.json();
  const { id, status, memo } = body;

  const updateData: Record<string, string> = {};
  if (status !== undefined) updateData.status = status;
  if (memo !== undefined) updateData.memo = memo;

  const { error } = await supabase.from("reservations").update(updateData).eq("id", id);
  if (error) return NextResponse.json({ error: "업데이트 실패" }, { status: 500 });

  return NextResponse.json({ success: true });
}
