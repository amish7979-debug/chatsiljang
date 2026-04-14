import dynamic from "next/dynamic";

const AdminPageClient = dynamic(() => import("./AdminPageClient"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
      불러오는 중…
    </div>
  ),
});

export default function AdminPage() {
  return <AdminPageClient />;
}
