import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ACADEMY_ID = "10feabe1-5f62-4e92-b485-6146a7539c5d";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data, error } = await supabase
    .from("faq")
    .select("*")
    .eq("academy_id", ACADEMY_ID);
  if (error) return NextResponse.json({ faq: [], error: error.message });
  return NextResponse.json({ faq: data || [] });
}

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const body = await req.json();
  const { action, item } = body;
  if (action === "add") {
    const { data, error } = await supabase.from("faq").insert({ academy_id: ACADEMY_ID, question: item.question, answer: item.answer, category: item.category || "기타", sort_order: item.sort_order || 0 }).select().single();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, item: data });
  }
  if (action === "update") {
    const { error } = await supabase.from("faq").update({ question: item.question, answer: item.answer, category: item.category }).eq("id", item.id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  if (action === "delete") {
    const { error } = await supabase.from("faq").delete().eq("id", item.id);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 400 });
}