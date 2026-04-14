import { notFound } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/service";
import ChatPageClient from "./ChatPageClient";

type PageProps = {
  params: { academyId: string };
};

export default async function ChatAcademyPage({ params }: PageProps) {
  const academyId = params.academyId?.trim();
  if (!academyId) notFound();

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from("academies")
    .select("id,name")
    .eq("id", academyId)
    .single();

  if (error || !data?.id || !data.name) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <ChatPageClient academyId={data.id} academyName={data.name} />
    </div>
  );
}
