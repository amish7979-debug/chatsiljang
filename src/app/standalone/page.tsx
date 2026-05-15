"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ACADEMY_ID = "10feabe1-5f62-4e92-b485-6146a7539c5d";

const DEFAULT_BUTTONS = [
  { label: "💰 수강료 문의", text: "수강료가 어떻게 되나요?" },
  { label: "🕐 수업 시간", text: "수업 시간이 어떻게 되나요?" },
  { label: "📅 체험수업 예약", text: "체험수업 예약하고 싶어요" },
  { label: "⭐ 수업 추천", text: "우리 아이에게 맞는 수업 추천해주세요" },
];

type MessageRole = "user" | "assistant";
type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
};
type QuickButton = { label: string; text: string };

function formatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  const hour = h % 12 || 12;
  return `${ampm} ${hour}:${m}`;
}

function ChatWidget({ onClose, academyName, quickButtons }: {
  onClose: () => void;
  academyName: string;
  quickButtons: QuickButton[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `안녕하세요! ${academyName} AI 상담 상담온입니다 😊 궁금한 내용을 자유롭게 입력하거나 아래 버튼을 눌러주세요.`,
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      createdAt: new Date(),
    };
    const loadingMsg: ChatMessage = {
      id: "loading",
      role: "assistant",
      content: "...",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), academyId: ACADEMY_ID }),
      });
      const data = await res.json();
      const reply = data.reply || "답변을 가져오지 못했어요.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "loading" ? { ...m, id: Date.now().toString(), content: reply } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "loading"
            ? { ...m, id: Date.now().toString(), content: "오류가 발생했어요. 잠시 후 다시 시도해주세요." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#f0fdfa] overflow-hidden w-full h-full">
      {/* 헤더 */}
      <div className="bg-[#0f766e] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          상
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{academyName}</div>
          <div className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block"></span>
            AI 상담 중
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none px-1">
          ✕
        </button>
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
        <div className="text-center text-xs text-gray-400 my-1">오늘</div>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-[#0f766e] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                상
              </div>
            )}
            <div className={`flex flex-col gap-1 max-w-[70%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#0f766e] text-white rounded-tl-2xl rounded-bl-2xl rounded-br-sm rounded-tr-2xl"
                  : "bg-white text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-sm rounded-tl-2xl shadow-sm"
              }`}>
                {msg.id === "loading" ? (
                  <span className="flex gap-1 items-center px-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </span>
                ) : msg.content}
              </div>
              <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 빠른 버튼 2x2 그리드 */}
      <div className="px-3 py-2 grid grid-cols-2 gap-2 flex-shrink-0 bg-white/50">
        {quickButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={() => sendMessage(btn.text)}
            disabled={isLoading}
            className="text-xs px-2 py-2 rounded-full border border-[#0f766e] text-[#0f766e] bg-white hover:bg-[#f0fdfa] active:scale-95 transition-all disabled:opacity-50 truncate"
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div className="px-3 py-3 flex items-center gap-2 bg-white border-t border-gray-100 flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-9 h-9 rounded-full bg-[#0f766e] flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function StandalonePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [academyName, setAcademyName] = useState("학원 AI 상담");
  const [quickButtons, setQuickButtons] = useState<QuickButton[]>(DEFAULT_BUTTONS);

  useEffect(() => {
    const loadAcademy = async () => {
      const { data } = await supabase
        .from("academies")
        .select("name, faq")
        .eq("id", ACADEMY_ID)
        .single();

      if (data) {
        if (data.name) setAcademyName(data.name);
        if (data.faq && Array.isArray(data.faq) && data.faq.length > 0) {
          const buttons = data.faq.slice(0, 4).map((item: { question: string }) => ({
            label: item.question.length > 12 ? item.question.slice(0, 12) + "…" : item.question,
            text: item.question,
          }));
          setQuickButtons(buttons);
        }
      }
    };
    loadAcademy();
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center"
      style={{ fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}
    >
      <div className="text-center text-gray-400 text-sm">
        <div className="text-2xl font-bold text-[#0f766e] mb-2">상담온</div>
        <div>소규모 학원 전용 AI 상담 매니저</div>
        <div className="mt-2 text-xs">오른쪽 하단 버튼을 눌러 상담을 시작하세요</div>
      </div>

      {/* 채팅창 팝업 */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[380px] h-[600px] rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200"
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          <ChatWidget
            onClose={() => setIsOpen(false)}
            academyName={academyName}
            quickButtons={quickButtons}
          />
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#0f766e] shadow-lg flex items-center justify-center text-white hover:bg-[#0d6460] active:scale-95 transition-all z-50"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}