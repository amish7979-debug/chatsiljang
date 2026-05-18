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
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm ml-9 max-w-[260px] flex flex-col" style={{ maxHeight: "340px" }}>
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="#0f766e" strokeWidth="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke="#0f766e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-semibold text-slate-800">체험수업 예약 요청</div>
            <div className="text-[11px] text-slate-400">원장님 확인 후 연락드립니다.</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        <div>
          <label className="text-[11px] font-medium text-slate-600 mb-1 block">학생 이름 <span className="text-red-400">*</span></label>
          <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="예) 김하늘" className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 mb-1 block">학년/나이 <span className="text-red-400">*</span></label>
          <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="예) 초등 2학년, 7세" className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 mb-1 block">피아노 경험 <span className="text-red-400">*</span></label>
          <select value={experience} onChange={(e) => setExperience(e.target.value)} className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500">
            <option value="">선택해주세요</option>
            <option value="처음">처음이에요</option>
            <option value="6개월 미만">조금 배웠어요</option>
            <option value="1년 이상">꽤 쳤어요</option>
            <option value="3년 이상">3년 이상</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 mb-1 block">학부모 연락처 <span className="text-red-400">*</span></label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 mb-1 block">희망 요일/시간 <span className="text-red-400">*</span></label>
          <input type="text" value={desiredTime} onChange={(e) => setDesiredTime(e.target.value)} placeholder="예) 화목 오후 4시 이후" className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500" />
        </div>
        <button type="button" onClick={() => setShowNotes(!showNotes)} className="flex items-center justify-between w-full text-[11px] text-slate-400 py-1">
          <span>+ 기타 문의 남기기</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: showNotes ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <path d="M6 9l6 6 6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {showNotes && (
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="궁금한 점을 입력해주세요" className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500" />
        )}
        <div className="flex items-start gap-2 pt-1">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-teal-700" />
          <label className="text-[11px] text-slate-400 leading-relaxed">개인정보 수집 및 이용 동의 (필수)</label>
        </div>
      </div>
      <div className="flex-shrink-0 px-4 pb-3 pt-2">
        <button
          onClick={() => { if (studentName && phone && desiredTime && agreed) onSubmit({ studentName, grade, experience, phone, desiredTime, notes }); }}
          disabled={!studentName || !phone || !desiredTime || !agreed || isLoading}
          className="w-full bg-teal-700 text-white rounded-xl py-2 text-[13px] font-semibold disabled:opacity-40 active:scale-95 transition-all hover:bg-teal-800"
        >
          {isLoading ? "요청 중..." : "예약 요청하기 →"}
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 ml-9 max-w-[260px]">
      <div className="text-[13px] font-semibold text-teal-700 mb-3">원장님께 문의</div>
      <div className="flex flex-col gap-2">
        <div>
          <label className="text-[11px] font-medium text-slate-600 mb-1 block">이름 *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름 입력" className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 mb-1 block">연락처 *</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500" />
        </div>
        <div>
          <label className="text-[11px] font-medium text-slate-600 mb-1 block">문의 내용 *</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="궁금하신 내용을 입력해주세요" rows={3} className="w-full bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-teal-500 resize-none" />
        </div>
        <button onClick={() => name && phone && content && onSubmit({ name, phone, content })} disabled={!name || !phone || !content || isLoading} className="w-full bg-teal-700 text-white rounded-xl py-2 text-[13px] font-semibold disabled:opacity-40 active:scale-95 transition-all hover:bg-teal-800">
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

    if (isInquiryIntent(text)) {
      setTimeout(() => {
        addMessage({ id: Date.now().toString(), role: "assistant", content: "궁금하신 내용을 편하게 물어보세요! 수업, 선생님, 학원 생활 등 뭐든 답변해드릴게요 😊", createdAt: new Date() });
      }, 300);
      return;
    }

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
    <div className="flex flex-col bg-white overflow-hidden w-full h-full">
      {/* 흰색 헤더 */}
      <div className="h-[68px] bg-white px-5 flex items-center justify-between flex-shrink-0 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">상</div>
          <div>
            <div className="text-slate-800 font-semibold text-[16px] leading-tight">{academyName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
              <span className="text-slate-500 text-[12px]">AI 상담 중</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none px-1">×</button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 flex flex-col gap-3">
        <div className="text-center text-[11px] text-slate-400 mb-1">오늘</div>
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === "reservation_form" ? (
              <ReservationForm onSubmit={handleReservation} isLoading={isReserving} />
            ) : msg.type === "inquiry_form" ? (
              <InquiryForm onSubmit={handleInquiry} isLoading={isInquiring} />
            ) : (
              <div className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-teal-700 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-1">상</div>
                )}
                <div className={`flex flex-col gap-1 max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 text-[14px] leading-6 whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-teal-700 text-white rounded-tl-2xl rounded-bl-2xl rounded-br-sm rounded-tr-2xl"
                      : msg.type === "reservation_done" || msg.type === "inquiry_done"
                      ? "bg-teal-50 text-teal-800 rounded-tr-2xl rounded-br-2xl rounded-bl-sm rounded-tl-2xl border border-teal-200"
                      : "bg-white text-slate-800 rounded-tr-2xl rounded-br-2xl rounded-bl-sm rounded-tl-2xl shadow-sm border border-slate-200"
                  }`}>
                    {msg.id === "loading" ? (
                      <span className="flex gap-1 items-center px-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </span>
                    ) : msg.content}
                  </div>
                  {msg.buttons && msg.buttons.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-full mt-1">
                      {msg.buttons.map((btn) => (
                        <button key={btn.label} onClick={() => sendMessage(btn.text)} className="text-[13px] px-3 py-1.5 rounded-xl border border-teal-200 text-teal-700 bg-white hover:bg-teal-50 active:scale-95 transition-all text-left">
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-[11px] text-slate-400 px-1">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 빠른 버튼 */}
      <div className="px-4 py-3 grid grid-cols-2 gap-2 flex-shrink-0 bg-white border-t border-slate-100">
        {QUICK_BUTTONS.map((btn) => (
          <button key={btn.label} onClick={() => sendMessage(btn.text)} disabled={isLoading} className="h-10 rounded-full border border-slate-200 bg-white text-[13px] font-medium text-slate-600 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 active:scale-95 transition-all disabled:opacity-50 truncate px-3">
            {btn.label}
          </button>
        ))}
      </div>

      {/* 입력창 */}
      <div className="px-4 py-3 flex items-center gap-2 bg-white border-t border-slate-100 flex-shrink-0">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} placeholder="메시지를 입력하세요..." disabled={isLoading} className="flex-1 h-11 bg-slate-100 rounded-full px-4 text-[14px] outline-none text-slate-700 placeholder-slate-400 disabled:opacity-50" />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className="w-11 h-11 rounded-full bg-teal-700 flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all hover:bg-teal-800">
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
        <div className="fixed bottom-20 right-6 w-[400px] h-[640px] rounded-3xl shadow-2xl overflow-hidden z-50 border border-teal-400" style={{ animation: "slideUp 0.3s ease-out" }}>
          <ChatWidget onClose={() => setIsOpen(false)} academyName={academyName} />
        </div>
      )}

      <button onClick={() => setIsOpen((prev) => !prev)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-700 shadow-xl flex items-center justify-center text-white hover:bg-teal-800 active:scale-95 transition-all z-50">
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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