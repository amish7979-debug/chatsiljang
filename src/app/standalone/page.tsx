"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ACADEMY_ID = "10feabe1-5f62-4e92-b485-6146a7539c5d";

const QUICK_BUTTONS = [
  { label: "수업 시간", text: "수업 시간이 어떻게 되나요?" },
  { label: "수강료 문의", text: "수강료가 어떻게 되나요?" },
  { label: "위치/주차", text: "학원 위치와 주차 안내해주세요" },
  { label: "기타문의", text: "원장님께 문의 남기기" },
];

type MessageRole = "user" | "assistant";
type MessageType = "text" | "reservation_form" | "reservation_done" | "inquiry_form" | "inquiry_done";
type ActionButton = { label: string; text: string };
type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  type?: MessageType;
  buttons?: ActionButton[];
  createdAt: Date;
};

function formatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  const hour = h % 12 || 12;
  return `${ampm} ${hour}:${m}`;
}

function isReservationIntent(text: string) {
  return ["체험수업 예약", "체험 예약", "예약하고 싶"].some((kw) => text.includes(kw));
}

function isInquiryIntent(text: string) {
  return ["원장님께 문의", "문의 남기기", "원장님 문의", "기타문의"].some((kw) => text.includes(kw));
}

function ReservationForm({ onSubmit, isLoading }: {
  onSubmit: (data: { studentName: string; grade: string; experience: string; phone: string; desiredTime: string; notes: string }) => void;
  isLoading: boolean;
}) {
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [experience, setExperience] = useState("");
  const [phone, setPhone] = useState("");
  const [desiredTime, setDesiredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ml-9 max-w-[260px]">
      <div className="text-sm font-semibold text-[#0f766e] mb-3">체험수업 예약</div>
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">학생 이름 *</label>
          <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="이름 입력" className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">학년/나이</label>
          <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="예) 초등 2학년, 7세" className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">피아노 경험</label>
          <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]">
            <option value="">선택해주세요</option>
            <option value="처음">처음이에요</option>
            <option value="6개월 미만">6개월 미만</option>
            <option value="1년 이상">1년 이상</option>
            <option value="3년 이상">3년 이상</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">학부모 연락처 *</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">희망 요일/시간 *</label>
          <input type="text" value={desiredTime} onChange={(e) => setDesiredTime(e.target.value)} placeholder="예) 화목 오후 4시 이후" className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">기타 문의</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="궁금한 점을 입력해주세요" className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
        </div>
        <div className="flex items-start gap-2 mt-1">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-[#0f766e]" />
          <label className="text-xs text-gray-400 leading-relaxed">입력하신 정보는 체험수업 상담 및 예약 안내 목적으로만 사용됩니다.</label>
        </div>
        <button onClick={() => { if (studentName && phone && desiredTime && agreed) onSubmit({ studentName, grade, experience, phone, desiredTime, notes }); }} disabled={!studentName || !phone || !desiredTime || !agreed || isLoading} className="w-full bg-[#0f766e] text-white rounded-xl py-2 text-sm font-medium mt-1 disabled:opacity-40 active:scale-95 transition-all">
          {isLoading ? "요청 중..." : "예약 요청하기"}
        </button>
      </div>
    </div>
  );
}

function InquiryForm({ onSubmit, isLoading }: {
  onSubmit: (data: { name: string; phone: string; content: string }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ml-9 max-w-[260px]">
      <div className="text-sm font-semibold text-[#0f766e] mb-3">원장님께 문의</div>
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">이름 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 입력" className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">연락처 *</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">문의 내용 *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="궁금하신 내용을 입력해주세요" rows={3} className="w-full bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#0f766e] resize-none" />
        </div>
        <button onClick={() => name && phone && content && onSubmit({ name, phone, content })} disabled={!name || !phone || !content || isLoading} className="w-full bg-[#0f766e] text-white rounded-xl py-2 text-sm font-medium disabled:opacity-40 active:scale-95 transition-all">
          {isLoading ? "전송 중..." : "문의 보내기"}
        </button>
      </div>
    </div>
  );
}

function ChatWidget({ onClose, academyName }: { onClose: () => void; academyName: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `안녕하세요. ${academyName} 상담온입니다.\n\n수업 중에는 바로 전화 응대가 어려울 수 있어요. 궁금하신 내용을 선택해주시면 먼저 안내드리고, 필요한 경우 원장님께 상담 요청을 전달해드릴게요.`,
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReserving, setIsReserving] = useState(false);
  const [isInquiring, setIsInquiring] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (msg: ChatMessage) => setMessages((prev) => [...prev, msg]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    addMessage({ id: Date.now().toString(), role: "user", content: text.trim(), createdAt: new Date() });
    setInput("");

    if (isReservationIntent(text)) {
      setTimeout(() => {
        addMessage({ id: Date.now().toString(), role: "assistant", content: "체험수업 예약을 도와드릴게요! 아래 양식을 작성해주세요.", createdAt: new Date() });
        addMessage({ id: (Date.now() + 1).toString(), role: "assistant", content: "", type: "reservation_form", createdAt: new Date() });
      }, 300);
      return;
    }

    if (isInquiryIntent(text)) { setTimeout(() => { addMessage({ id: Date.now().toString(), role: "assistant", content: "궁금하신 내용을 편하게 물어보세요! 수업, 선생님, 학원 생활 등 뭐든 답변해드릴게요 😊", createdAt: new Date() }); }, 300); return; }

    setIsLoading(true);
    addMessage({ id: "loading", role: "assistant", content: "...", createdAt: new Date() });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), academyId: ACADEMY_ID }),
      });
      const data = await res.json();
      const reply = data.reply || "답변을 가져오지 못했어요.";
      const buttons = data.buttons || [];
      setMessages((prev) =>
        prev.map((m) => m.id === "loading" ? { ...m, id: Date.now().toString(), content: reply, buttons } : m)
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === "loading" ? { ...m, id: Date.now().toString(), content: "오류가 발생했어요." } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservation = async (data: { studentName: string; grade: string; experience: string; phone: string; desiredTime: string; notes: string }) => {
    setIsReserving(true);
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academyId: ACADEMY_ID, studentName: data.studentName, phone: data.phone, desired_date: data.desiredTime, class_type: `체험수업 / ${data.grade} / 경험: ${data.experience}`, notes: data.notes }),
      });
      const result = await res.json();
      if (result.success) {
        setMessages((prev) => [
          ...prev.filter((m) => m.type !== "reservation_form"),
          { id: Date.now().toString(), role: "assistant", content: `체험수업 요청이 접수되었습니다!\n\n학생: ${data.studentName}\n학년/나이: ${data.grade || "미입력"}\n경험: ${data.experience || "미입력"}\n희망 시간: ${data.desiredTime}\n연락처: ${data.phone}\n\n원장님이 확인 후 연락드릴 예정입니다.`, type: "reservation_done", createdAt: new Date() },
        ]);
      } else {
        alert(result.message || "예약에 실패했어요.");
      }
    } catch {
      alert("오류가 발생했어요.");
    } finally {
      setIsReserving(false);
    }
  };

  const handleInquiry = async (data: { name: string; phone: string; content: string }) => {
    setIsInquiring(true);
    try {
      await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academyId: ACADEMY_ID, studentName: data.name, phone: data.phone, desired_date: "원장님 문의", class_type: "문의", notes: data.content }),
      });
      setMessages((prev) => [
        ...prev.filter((m) => m.type !== "inquiry_form"),
        { id: Date.now().toString(), role: "assistant", content: `문의가 접수되었습니다!\n\n${data.name}님의 문의 내용을 원장님께 전달했어요. 빠른 시일 내에 연락드릴게요.`, type: "inquiry_done", createdAt: new Date() },
      ]);
    } catch {
      alert("오류가 발생했어요.");
    } finally {
      setIsInquiring(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#f0fdfa] overflow-hidden w-full h-full">
      <div className="bg-[#0f766e] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">상</div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm truncate">{academyName}</div>
          <div className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block"></span>
            AI 상담 중
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none px-1">X</button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
        <div className="text-center text-xs text-gray-400 my-1">오늘</div>
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === "reservation_form" ? (
              <ReservationForm onSubmit={handleReservation} isLoading={isReserving} />
            ) : msg.type === "inquiry_form" ? (
              <InquiryForm onSubmit={handleInquiry} isLoading={isInquiring} />
            ) : (
              <div className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#0f766e] flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">상</div>
                )}
                <div className={`flex flex-col gap-1 max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-[#0f766e] text-white rounded-tl-2xl rounded-bl-2xl rounded-br-sm rounded-tr-2xl"
                      : msg.type === "reservation_done" || msg.type === "inquiry_done"
                      ? "bg-[#e0fdf4] text-[#065f46] rounded-tr-2xl rounded-br-2xl rounded-bl-sm rounded-tl-2xl shadow-sm border border-[#6ee7b7]"
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
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full mt-1">
                      {msg.buttons.map((btn) => (
                        <button key={btn.label} onClick={() => sendMessage(btn.text)} className="text-xs px-3 py-2 rounded-xl border border-[#0f766e] text-[#0f766e] bg-white hover:bg-[#f0fdfa] active:scale-95 transition-all text-left">
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-2 grid grid-cols-2 gap-2 flex-shrink-0 bg-white/50">
        {QUICK_BUTTONS.map((btn) => (
          <button key={btn.label} onClick={() => sendMessage(btn.text)} disabled={isLoading} className="text-xs px-2 py-2 rounded-full border border-[#0f766e] text-[#0f766e] bg-white hover:bg-[#f0fdfa] active:scale-95 transition-all disabled:opacity-50 truncate">
            {btn.label}
          </button>
        ))}
      </div>

      <div className="px-3 py-3 flex items-center gap-2 bg-white border-t border-gray-100 flex-shrink-0">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} placeholder="메시지를 입력하세요..." disabled={isLoading} className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none text-gray-800 placeholder-gray-400 disabled:opacity-50" />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className="w-9 h-9 rounded-full bg-[#0f766e] flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all">
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

  useEffect(() => {
    const loadAcademy = async () => {
      const { data } = await supabase
        .from("academies")
        .select("name")
        .eq("id", ACADEMY_ID)
        .single();
      if (data && data.name) setAcademyName(data.name);
    };
    loadAcademy();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
      <div className="text-center text-gray-400 text-sm">
        <div className="text-2xl font-bold text-[#0f766e] mb-2">상담온</div>
        <div>소규모 학원 전용 AI 상담 매니저</div>
        <div className="mt-2 text-xs">오른쪽 하단 버튼을 눌러 상담을 시작하세요</div>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[620px] rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200" style={{ animation: "slideUp 0.3s ease-out" }}>
          <ChatWidget onClose={() => setIsOpen(false)} academyName={academyName} />
        </div>
      )}

      <button onClick={() => setIsOpen((prev) => !prev)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#0f766e] shadow-lg flex items-center justify-center text-white hover:bg-[#0d6460] active:scale-95 transition-all z-50">
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

