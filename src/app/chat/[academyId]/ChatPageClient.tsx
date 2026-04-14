"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatBubble = { role: "user" | "assistant"; content: string };

const STORAGE_PREFIX = "chatsiljang:consultation:";

function getStoredConsultationId(academyId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}${academyId}`);
  } catch {
    return null;
  }
}

function setStoredConsultationId(academyId: string, id: string) {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${academyId}`, id);
  } catch {
    /* ignore */
  }
}

type Props = {
  academyId: string;
  academyName: string;
};

export default function ChatPageClient({ academyId, academyName }: Props) {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState("");
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = getStoredConsultationId(academyId);
    setConsultationId(stored);
    if (!stored) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/chat?academyId=${encodeURIComponent(academyId)}&consultationId=${encodeURIComponent(stored)}`,
        );
        const data = (await res.json()) as {
          error?: string;
          messages?: ChatBubble[];
        };
        if (!res.ok || cancelled) return;
        if (Array.isArray(data.messages) && data.messages.length) {
          setMessages(data.messages);
        }
      } catch {
        /* ignore restore failure */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [academyId]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academyId,
          consultationId: consultationId ?? undefined,
          content: text,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        reply?: string;
        consultationId?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "응답을 받지 못했습니다.");
      }

      if (data.consultationId) {
        setConsultationId(data.consultationId);
        setStoredConsultationId(academyId, data.consultationId);
      }

      const reply = data.reply ?? "";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((m) => m.slice(0, -1));
      setInput(text);
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [academyId, consultationId, input, loading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#b2c7d9]">
      <header className="sticky top-0 z-10 grid h-[52px] shrink-0 grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-black/6 bg-[#3c1e1e] px-2 shadow-sm">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/90 hover:bg-white/10"
          aria-label="홈으로"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-[15px] font-semibold text-white">{academyName}</h1>
          <p className="text-[11px] text-white/75">AI 상담 · 챗실장</p>
        </div>
        <span aria-hidden className="inline-block w-10" />
      </header>

      <div
        ref={listRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-4 pb-2"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && !loading && (
          <p className="mx-auto max-w-[280px] rounded-lg bg-black/10 px-3 py-2 text-center text-[13px] leading-relaxed text-[#2f3a45]">
            안녕하세요. {academyName} 챗실장입니다.
            <br />
            궁금한 점을 편하게 남겨 주세요.
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={`${i}-${msg.role}-${msg.content.slice(0, 12)}`}
            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={
                msg.role === "user"
                  ? "max-w-[min(78%,20rem)] rounded-[14px] rounded-tr-sm bg-[#fee500] px-3 py-2.5 text-[15px] leading-snug text-[#191919] shadow-sm"
                  : "max-w-[min(82%,22rem)] rounded-[14px] rounded-tl-sm bg-white px-3 py-2.5 text-[15px] leading-snug text-[#191919] shadow-sm"
              }
            >
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[14px] rounded-tl-sm bg-white px-4 py-3 text-[14px] text-[#555] shadow-sm">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-flex gap-0.5" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8a8a8a] [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8a8a8a] [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#8a8a8a] [animation-delay:300ms]" />
                </span>
                답변 생성 중...
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="shrink-0 px-3 pb-1">
          <p
            className="rounded-lg bg-red-600/90 px-3 py-2 text-center text-[13px] text-white"
            role="alert"
          >
            {error}
          </p>
        </div>
      )}

      <div className="shrink-0 border-t border-black/8 bg-[#ececec] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-lg items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="메시지를 입력하세요"
            rows={1}
            disabled={loading}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[22px] border border-black/10 bg-white px-4 py-3 text-[15px] text-[#191919] shadow-inner outline-none placeholder:text-[#8e8e8e] focus:border-[#fee500]/80 focus:ring-2 focus:ring-[#fee500]/40 disabled:opacity-60"
            aria-label="메시지 입력"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={loading || !input.trim()}
            className="mb-0.5 flex h-11 min-w-[52px] items-center justify-center rounded-full bg-[#fee500] px-4 text-[14px] font-semibold text-[#191919] shadow-sm transition hover:bg-[#ebd300] disabled:pointer-events-none disabled:opacity-45"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
