import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <p className="text-center text-zinc-600 dark:text-zinc-400">
        로그인 페이지는 준비 중입니다.
      </p>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
      >
        ← 메인으로
      </Link>
    </div>
  );
}
