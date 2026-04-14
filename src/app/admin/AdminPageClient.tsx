"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type TuitionRow = { id: string; className: string; fee: string };
type ScheduleRow = { id: string; day: string; time: string };
type FaqRow = { id: string; question: string; answer: string };

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"] as const;

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AdminPageClient() {
  const [academyName, setAcademyName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [tuitionRows, setTuitionRows] = useState<TuitionRow[]>([
    { id: newId(), className: "", fee: "" },
  ]);
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([
    { id: newId(), day: "월", time: "" },
  ]);
  const [faqRows, setFaqRows] = useState<FaqRow[]>([
    { id: newId(), question: "", answer: "" },
  ]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTuition = useCallback(() => {
    setTuitionRows((r) => [...r, { id: newId(), className: "", fee: "" }]);
  }, []);
  const removeTuition = useCallback((id: string) => {
    setTuitionRows((r) => (r.length <= 1 ? r : r.filter((x) => x.id !== id)));
  }, []);
  const updateTuition = useCallback(
    (id: string, field: keyof Omit<TuitionRow, "id">, value: string) => {
      setTuitionRows((r) =>
        r.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
      );
    },
    [],
  );

  const addSchedule = useCallback(() => {
    setScheduleRows((r) => [...r, { id: newId(), day: "월", time: "" }]);
  }, []);
  const removeSchedule = useCallback((id: string) => {
    setScheduleRows((r) => (r.length <= 1 ? r : r.filter((x) => x.id !== id)));
  }, []);
  const updateSchedule = useCallback(
    (id: string, field: keyof Omit<ScheduleRow, "id">, value: string) => {
      setScheduleRows((r) =>
        r.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
      );
    },
    [],
  );

  const addFaq = useCallback(() => {
    setFaqRows((r) => [...r, { id: newId(), question: "", answer: "" }]);
  }, []);
  const removeFaq = useCallback((id: string) => {
    setFaqRows((r) => (r.length <= 1 ? r : r.filter((x) => x.id !== id)));
  }, []);
  const updateFaq = useCallback(
    (id: string, field: keyof Omit<FaqRow, "id">, value: string) => {
      setFaqRows((r) =>
        r.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
      );
    },
    [],
  );

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!academyName.trim()) {
        setError("학원 이름을 입력해 주세요.");
        return;
      }

      const payload = {
        academyName: academyName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        tuition: tuitionRows
          .filter((t) => t.className.trim() || t.fee.trim())
          .map(({ className, fee }) => ({ className, fee })),
        schedule: scheduleRows
          .filter((s) => s.time.trim())
          .map(({ day, time }) => ({ day, time })),
        faq: faqRows
          .filter((f) => f.question.trim() || f.answer.trim())
          .map(({ question, answer }) => ({ question, answer })),
      };

      setSaving(true);
      try {
        const res = await fetch("/api/academies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as { error?: string; id?: string };
        if (!res.ok) {
          throw new Error(data.error || "저장에 실패했습니다.");
        }
        setSaved(true);
        window.setTimeout(() => setSaved(false), 4000);
      } catch (err) {
        setSaved(false);
        setError(
          err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.",
        );
      } finally {
        setSaving(false);
      }
    },
    [academyName, phone, address, tuitionRows, scheduleRows, faqRows],
  );

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20";
  const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";
  const cardClass =
    "rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-8";
  const sectionTitle =
    "text-lg font-semibold tracking-tight text-zinc-900 dark:text-white";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ← 메인
            </Link>
            <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
              학원 정보 관리
            </span>
          </div>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            챗실장
          </span>
        </div>
      </header>

      <main className="relative flex-1">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(99,102,241,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            관리자
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            학원 정보 입력
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            AI 상담에 반영될 기본 정보를 등록합니다. 항목은 나중에 언제든 수정할 수
            있습니다.
          </p>

          <form onSubmit={handleSave} className="mt-10 space-y-8">
            <div className={cardClass}>
              <h2 className={sectionTitle}>기본 정보</h2>
              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="academy-name" className={labelClass}>
                    학원 이름
                  </label>
                  <input
                    id="academy-name"
                    type="text"
                    value={academyName}
                    onChange={(e) => setAcademyName(e.target.value)}
                    className={inputClass}
                    placeholder="예: 햇살 영어학원"
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    전화번호
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="예: 02-1234-5678"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="address" className={labelClass}>
                    주소
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`${inputClass} min-h-[88px] resize-y`}
                    placeholder="도로명 또는 지번 주소"
                    rows={3}
                    autoComplete="street-address"
                  />
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className={sectionTitle}>수강료</h2>
                <button
                  type="button"
                  onClick={addTuition}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  + 반 추가
                </button>
              </div>
              <ul className="mt-6 space-y-4">
                {tuitionRows.map((row, i) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/40 sm:flex-row sm:items-end"
                  >
                    <div className="min-w-0 flex-1">
                      <label className={labelClass}>반 이름</label>
                      <input
                        type="text"
                        value={row.className}
                        onChange={(e) =>
                          updateTuition(row.id, "className", e.target.value)
                        }
                        className={inputClass}
                        placeholder={`예: 초등 A반`}
                        aria-label={`수강료 반 이름 ${i + 1}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1 sm:max-w-[200px]">
                      <label className={labelClass}>수강료</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.fee}
                        onChange={(e) =>
                          updateTuition(row.id, "fee", e.target.value)
                        }
                        className={inputClass}
                        placeholder="예: 240,000원"
                        aria-label={`수강료 금액 ${i + 1}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTuition(row.id)}
                      className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-200/80 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      aria-label={`수강료 행 ${i + 1} 삭제`}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cardClass}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className={sectionTitle}>시간표</h2>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  + 시간 추가
                </button>
              </div>
              <ul className="mt-6 space-y-4">
                {scheduleRows.map((row, i) => (
                  <li
                    key={row.id}
                    className="flex flex-col gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/40 sm:flex-row sm:items-end"
                  >
                    <div className="min-w-0 sm:w-36">
                      <label className={labelClass}>요일</label>
                      <select
                        value={row.day}
                        onChange={(e) =>
                          updateSchedule(row.id, "day", e.target.value)
                        }
                        className={inputClass}
                        aria-label={`시간표 요일 ${i + 1}`}
                      >
                        {WEEKDAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}요일
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className={labelClass}>시간</label>
                      <input
                        type="text"
                        value={row.time}
                        onChange={(e) =>
                          updateSchedule(row.id, "time", e.target.value)
                        }
                        className={inputClass}
                        placeholder="예: 16:00–17:30"
                        aria-label={`시간표 시간 ${i + 1}`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSchedule(row.id)}
                      className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition hover:bg-zinc-200/80 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      aria-label={`시간표 행 ${i + 1} 삭제`}
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cardClass}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
                <button
                  type="button"
                  onClick={addFaq}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  + 질문 추가
                </button>
              </div>
              <ul className="mt-6 space-y-5">
                {faqRows.map((row, i) => (
                  <li
                    key={row.id}
                    className="rounded-xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-950/40"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        FAQ {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(row.id)}
                        className="self-start rounded-lg px-2 py-1 text-sm font-medium text-zinc-500 transition hover:bg-zinc-200/80 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 sm:self-auto"
                        aria-label={`FAQ ${i + 1} 삭제`}
                      >
                        삭제
                      </button>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className={labelClass}>질문</label>
                        <input
                          type="text"
                          value={row.question}
                          onChange={(e) =>
                            updateFaq(row.id, "question", e.target.value)
                          }
                          className={inputClass}
                          placeholder="예: 체험 수업이 있나요?"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>답변</label>
                        <textarea
                          value={row.answer}
                          onChange={(e) =>
                            updateFaq(row.id, "answer", e.target.value)
                          }
                          className={`${inputClass} min-h-[80px] resize-y`}
                          placeholder="답변 내용을 입력하세요"
                          rows={3}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-[1.5rem] space-y-1">
                {error ? (
                  <p
                    className="text-sm font-medium text-red-600 dark:text-red-400"
                    role="alert"
                  >
                    {error}
                  </p>
                ) : saved ? (
                  <p
                    className="text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    role="status"
                  >
                    Supabase에 저장되었습니다.
                  </p>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    저장하면 academies 테이블에 새 행이 추가됩니다.
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
              >
                {saving ? "저장 중…" : "저장"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="mt-auto border-t border-zinc-200/80 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            © {new Date().getFullYear()} 챗실장
          </span>
          <Link
            href="/"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            메인으로
          </Link>
        </div>
      </footer>
    </div>
  );
}
