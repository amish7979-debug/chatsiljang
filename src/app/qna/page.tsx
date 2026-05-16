"use client";

import { useState, useEffect } from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

const CATEGORIES = ["전체", "수강료", "수업시간", "체험수업", "선생님", "시설", "기타"];

export default function QnaPage() {
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ question: "", answer: "", category: "기타" });
  const [search, setSearch] = useState("");

  useEffect(() => { fetchFaq(); }, []);

  const fetchFaq = async () => {
    setIsLoading(true);
    const res = await fetch("/api/qna");
    const data = await res.json();
    setFaq(data.faq || []);
    setIsLoading(false);
  };

  const handleAdd = async () => {
    if (!newItem.question || !newItem.answer) return;
    setIsSaving(true);
    await fetch("/api/qna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", item: { ...newItem, sort_order: faq.length } }),
    });
    setNewItem({ question: "", answer: "", category: "기타" });
    setShowAddForm(false);
    await fetchFaq();
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠어요?")) return;
    await fetch("/api/qna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", item: { id } }),
    });
    await fetchFaq();
  };

  const handleEdit = async (item: FaqItem) => {
    setIsSaving(true);
    await fetch("/api/qna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", item }),
    });
    setEditingId(null);
    await fetchFaq();
    setIsSaving(false);
  };

  const filtered = faq
    .filter((f) => selectedCategory === "전체" || f.category === selectedCategory)
    .filter((f) => !search || f.question.includes(search) || f.answer.includes(search));

  const CATEGORY_COLORS: Record<string, string> = {
    수강료: "bg-blue-100 text-blue-700",
    수업시간: "bg-green-100 text-green-700",
    체험수업: "bg-purple-100 text-purple-700",
    선생님: "bg-yellow-100 text-yellow-700",
    시설: "bg-orange-100 text-orange-700",
    기타: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4" style={{ fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xl font-bold text-[#0f766e]">Q&A 관리</div>
            <div className="text-xs text-gray-400 mt-0.5">햇살 피아노 학원 · 자동응답 Q&A 설정</div>
          </div>
          <div className="flex gap-2">
            <a href="/hub" className="text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-1.5">허브로</a>
            <button onClick={() => setShowAddForm(true)} className="text-xs text-white bg-[#0f766e] rounded-lg px-3 py-1.5">+ 질문 추가</button>
          </div>
        </div>

        <div className="mb-3">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="질문 또는 답변 검색" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#0f766e]" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setSelectedCategory(c)} className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${selectedCategory === c ? "bg-[#0f766e] text-white border-[#0f766e]" : "bg-white text-gray-500 border-gray-200"}`}>
              {c}
            </button>
          ))}
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl border border-[#0f766e] p-4 mb-4 shadow-sm">
            <div className="text-sm font-semibold text-[#0f766e] mb-3">새 질문 추가</div>
            <div className="flex flex-col gap-2">
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]">
                {CATEGORIES.filter((c) => c !== "전체").map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="text" value={newItem.question} onChange={(e) => setNewItem({ ...newItem, question: e.target.value })} placeholder="질문을 입력하세요" className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
              <textarea value={newItem.answer} onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })} placeholder="답변을 입력하세요" rows={3} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0f766e] resize-none" />
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={!newItem.question || !newItem.answer || isSaving} className="flex-1 bg-[#0f766e] text-white rounded-xl py-2 text-sm font-medium disabled:opacity-40">
                  {isSaving ? "저장 중..." : "저장"}
                </button>
                <button onClick={() => setShowAddForm(false)} className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-sm">취소</button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-sm text-gray-400 py-12">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm text-gray-400 py-12">Q&A가 없어요. 추가해보세요!</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((item) => (
              <EditableCard
                key={item.id}
                item={item}
                isEditing={editingId === item.id}
                onEdit={() => setEditingId(item.id)}
                onCancel={() => setEditingId(null)}
                onSave={(updated) => handleEdit(updated)}
                onDelete={() => handleDelete(item.id)}
                isSaving={isSaving}
                categoryColors={CATEGORY_COLORS}
              />
            ))}
          </div>
        )}

        <div className="text-center text-xs text-gray-300 mt-6">총 {faq.length}개의 Q&A</div>
      </div>
    </div>
  );
}

function EditableCard({ item, isEditing, onEdit, onCancel, onSave, onDelete, isSaving, categoryColors }: {
  item: FaqItem;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (item: FaqItem) => void;
  onDelete: () => void;
  isSaving: boolean;
  categoryColors: Record<string, string>;
}) {
  const [q, setQ] = useState(item.question);
  const [a, setA] = useState(item.answer);
  const [c, setC] = useState(item.category);
  const CATS = ["수강료", "수업시간", "체험수업", "선생님", "시설", "기타"];

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-[#0f766e] p-4 shadow-sm">
        <div className="flex flex-col gap-2">
          <select value={c} onChange={(e) => setC(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]">
            {CATS.map((cat) => <option key={cat}>{cat}</option>)}
          </select>
          <input type="text" value={q} onChange={(e) => setQ(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0f766e]" />
          <textarea value={a} onChange={(e) => setA(e.target.value)} rows={3} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0f766e] resize-none" />
          <div className="flex gap-2">
            <button onClick={() => onSave({ ...item, question: q, answer: a, category: c })} disabled={isSaving} className="flex-1 bg-[#0f766e] text-white rounded-xl py-2 text-sm font-medium disabled:opacity-40">
              {isSaving ? "저장 중..." : "저장"}
            </button>
            <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-sm">취소</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[item.category] || "bg-gray-100 text-gray-600"}`}>
              {item.category}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-800 mb-1">Q. {item.question}</div>
          <div className="text-sm text-gray-500 leading-relaxed">A. {item.answer}</div>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button onClick={onEdit} className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-[#0f766e] hover:text-[#0f766e]">수정</button>
          <button onClick={onDelete} className="text-xs px-3 py-1 rounded-lg border border-red-100 text-red-400 hover:bg-red-50">삭제</button>
        </div>
      </div>
    </div>
  );
}
