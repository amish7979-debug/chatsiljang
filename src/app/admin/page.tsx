"use client";

import { useState } from "react";
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
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "1234") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("비밀번호가 틀렸습니다.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md dark:bg-zinc-900">
          <h1 className="mb-6 text-center text-2xl font-bold text-zinc-800 dark:text-zinc-100">
            🔒 상담온 관리자
          </h1>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-3 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          {error && (
            <p className="mb-3 text-center text-sm text-red-500">{error}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return <AdminPageClient />;
}