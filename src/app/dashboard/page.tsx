"use client";

import { useState, useEffect } from "react";

type Reservation = {
  id: string;
  parent_name: string;
  phone: string;
  desired_date: string;
  class_type: string;
  status: string;
  memo: string;
  created_at: string;
};

type Consultation = {
  id: string;
  question: string;
  answer: string;
  category: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "신규",
  contacted: "연락완료",
  trial: "체험예약",
  registered: "등록후보",
  done: "완료",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  trial: "bg-purple-100 text-purple-700",
  registered: "bg-green-100 text-green-700",
  done: "bg-gray-100 text-gray-500",
};

const CATEGORY_COLORS: Record<string, string> = {
  수강료: "bg-blue-50 text-blue-600",
  수업시간: "bg-green-50 text-green-600",
  체험수업: "bg-purple-50 text-purple-600",
  위치: "bg-orange-50 text-orange-600",
  선생님: "bg-yellow-50 text-yellow-600",
  기타: "bg-gray-50 text-gray-500",
};

const ACADEMY_ID = "10feabe1-5f62-4e92-b485-6146a7539c5d";

export default function DashboardPage() {
  const [inputPw, setInputPw] = useState("");
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [error, setError] = useState("");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [memoInput, setMemoInput] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"reservations" | "consultations">("reservations");

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?password=${inputPw}`);
      if (res.status === 401) { setError("비밀번호가 틀렸어요."); setIsLoading(false); return; }
      const data = await res.json();
      setReservations(data.reservations || []);
      setPassword(inputPw);
      setIsAuth(true);
      fetchConsultations(inputPw);
    } catch { setError("오류가 발생했어요."); }
    finally { setIsLoading(false); }
  };

  const fetchData = async () => {
    const res = await fetch(`/api/dashboard?password=${password}`);
    const data = await res.json();
    setReservations(data.reservations || []);
    fetchConsultations(password);
  };

  const fetchConsultations = async (pw: string) => {
    try {
      const res = await fetch(`/api/consultations?password=${pw}&academyId=${ACADEMY_ID}`);
      const data = await res.json();
      setConsultations(data.consultations || []);
    } catch { console.error("상담 내역 조회 실패"); }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/dashboard?password=${password}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const saveMemo = async (id: string) => {
    await fetch(`/api/dashboard?password=${password}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, memo: memoInput[id] || "" }),
    });
    fetchData();
  };

  const today = new Date().toDateString();
  const todayCount = reservations.filter((r) => new Date(r.created_at).toDateString() === today).length;
  const todayConsultations = consultations.filter((c) => new Date(c.created_at).toDateString() === today);

  const stats = {
    today: todayCount,
    pending: reservations.filter((r) => r.status === "pending").length,
    trial: reservations.filter((r) => r.status === "trial").length,
    todayChat: todayConsultations.length,
  };

  const filtered = reservations
    .filter((r) => selectedStatus === "전체" || STATUS_LABELS[r.status] === selectedStatus)
    .filter((r) => !search || r.parent_name.includes(search) || r.phone.includes(search));

  const selected = reservations.find((r) => r.id === selectedId);

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-[#0f766e] mb-1">상담온</div>
            <div className="text-sm text-gray-400">원장님 전용 대시보드</div>
          </div>
          <div className="flex flex-col gap-3">
            <input type="password" value={inputPw} onChange={(e) => setInputPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} placeholder="비밀번호를 입력하세요" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0f766e]" />
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <button onClick={handleLogin} disabled={isLoading} className="w-full bg-[#0f766e] text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40">
              {isLoading ? "확인 중..." : "로그인"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
      <div className="max-w-4xl mx-auto p-4">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xl font-bold text-[#0f766e]">상담온 대시보드</div>
            <div className="text-xs text-gray-400 mt-0.5">햇살 피아노 학원 · 원장님 전용</div>
          </div>
          <button onClick={fetchData} className="text-xs text-[#0f766e] border border-[#0f766e] rounded-lg px-3 py-1.5">새로고침</button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {[
            { label: "오늘 예약요청", value: stats.today, color: "text-[#0f766e]" },
            { label: "신규", value: stats.pending, color: "text-blue-600" },
            { label: "체험예약", value: stats.trial, color: "text-purple-600" },
            { label: "오늘 상담 수", value: stats.todayChat, color: "text-orange-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === "reservations" ? "border-[#0f766e] text-[#0f766e]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            예약 요청
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === "reservations" ? "bg-[#ccfbf1] text-[#0f766e]" : "bg-gray-100 text-gray-400"}`}>
              {stats.pending}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("consultations")}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all ${activeTab === "consultations" ? "border-[#0f766e] text-[#0f766e]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            오늘 상담 내역
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === "consultations" ? "bg-[#ccfbf1] text-[#0f766e]" : "bg-gray-100 text-gray-400"}`}>
              {stats.todayChat}
            </span>
          </button>
        </div>

        {/* 예약 요청 탭 */}
        {activeTab === "reservations" && (
          <>
            <div className="mb-3">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름 또는 연락처 검색" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#0f766e]" />
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {["전체", "신규", "연락완료", "체험예약", "등록후보", "완료"].map((s) => (
                <button key={s} onClick={() => setSelectedStatus(s)} className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${selectedStatus === s ? "bg-[#0f766e] text-white border-[#0f766e]" : "bg-white text-gray-500 border-gray-200"}`}>
                  {s}
                </button>
              ))}
            </div>

            <div className={`flex gap-4 ${selectedId ? "items-start" : ""}`}>
              <div className={`flex flex-col gap-3 ${selectedId ? "w-1/2" : "w-full"}`}>
                {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">예약 내역이 없어요.</div>
                ) : (
                  filtered.map((r) => (
                    <div key={r.id} onClick={() => { setSelectedId(r.id === selectedId ? null : r.id); setMemoInput((prev) => ({ ...prev, [r.id]: r.memo || "" })); }} className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all ${selectedId === r.id ? "border-[#0f766e]" : "border-gray-100 hover:border-[#0f766e]/30"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-600"}`}>
                              {STATUS_LABELS[r.status] || r.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(r.created_at).toLocaleDateString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-800 mb-1">{r.parent_name}</div>
                          <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                            <span>📞 {r.phone}</span>
                            <span>📅 {r.desired_date}</span>
                            <span>🎵 {r.class_type}</span>
                            {r.memo && <span className="text-[#0f766e] mt-1">📝 {r.memo}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <button key={key} onClick={(e) => { e.stopPropagation(); updateStatus(r.id, key); }} className={`text-xs px-2 py-1 rounded-lg border transition-all ${r.status === key ? "bg-[#0f766e] text-white border-[#0f766e]" : "bg-white text-gray-500 border-gray-200 hover:border-[#0f766e] hover:text-[#0f766e]"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selected && (
                <div className="w-1/2 bg-white rounded-2xl border border-[#0f766e] p-4 shadow-sm sticky top-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-[#0f766e]">상담 상세</div>
                    <button onClick={() => setSelectedId(null)} className="text-gray-400 text-lg">✕</button>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-gray-700 mb-4">
                    <div><span className="text-gray-400 text-xs">이름</span><div className="font-medium">{selected.parent_name}</div></div>
                    <div><span className="text-gray-400 text-xs">연락처</span><div>{selected.phone}</div></div>
                    <div><span className="text-gray-400 text-xs">희망 시간</span><div>{selected.desired_date}</div></div>
                    <div><span className="text-gray-400 text-xs">수업 유형</span><div>{selected.class_type}</div></div>
                    <div><span className="text-gray-400 text-xs">접수 시간</span><div>{new Date(selected.created_at).toLocaleString("ko-KR")}</div></div>
                    <div><span className="text-gray-400 text-xs">상태</span><div><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[selected.status]}`}>{STATUS_LABELS[selected.status]}</span></div></div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">원장님 메모</div>
                    <textarea
                      value={memoInput[selected.id] ?? selected.memo ?? ""}
                      onChange={(e) => setMemoInput((prev) => ({ ...prev, [selected.id]: e.target.value }))}
                      placeholder="예) 5/16 오후 다시 연락, 토요일만 가능..."
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0f766e] resize-none"
                    />
                    <button onClick={() => saveMemo(selected.id)} className="w-full mt-2 bg-[#0f766e] text-white rounded-xl py-2 text-sm font-medium active:scale-95 transition-all">
                      메모 저장
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 오늘 상담 내역 탭 */}
        {activeTab === "consultations" && (
          <div className="flex flex-col gap-3">
            {todayConsultations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-400">
                오늘 상담 내역이 없어요.
              </div>
            ) : (
              todayConsultations.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[c.category] || "bg-gray-50 text-gray-500"}`}>
                      {c.category}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-800 mb-1">Q. {c.question}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">A. {c.answer.length > 100 ? c.answer.slice(0, 100) + "..." : c.answer}</div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

