import Link from "next/link";

const features = [
  {
    title: "자동응대",
    description:
      "카카오·문자·웹 채널의 문의를 24시간 AI가 1차 응대합니다. 반복 질문은 줄이고 원장님은 본업에 집중하세요.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
  },
  {
    title: "수업추천",
    description:
      "학년·목표·일정을 반영해 적합한 반과 커리큘럼을 제안합니다. 상담원 교육 없이도 일관된 안내가 가능합니다.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
    ),
  },
  {
    title: "예약연결",
    description:
      "체험 수업·레벨 테스트·방문 상담 예약을 안내하고, 캘린더 또는 담당자에게 자연스럽게 연결합니다.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
        />
      </svg>
    ),
  },
  {
    title: "상담리포트",
    description:
      "대화 요약, 관심 과목, 다음 액션을 정리한 리포트로 내부 공유와 후속 연락이 쉬워집니다.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
            챗실장
          </span>
          <Link
            href="#cta"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            시작하기
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-zinc-200/80 dark:border-zinc-800">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.22),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              소규모 학원 전용 AI 상담 매니저
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
              상담 업무를 줄이고,
              <br className="hidden sm:block" /> 학부모 신뢰는 높이세요
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              챗실장은 문의 응대부터 예약 안내까지 학원 맞춤 톤으로 돕습니다. 인력 부담
              없이도 전문적인 첫인상을 유지할 수 있습니다.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="#cta"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                시작하기
              </Link>
              <a
                href="#about"
                className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-base font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                서비스 알아보기
              </a>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="border-b border-zinc-200/80 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                챗실장이 하는 일
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
                소규모 학원은 상담·행정에 쓰는 시간이 곧 수업 품질과 직결됩니다. 챗실장은
                AI가 학원 정보와 상담 스크립트를 학습해, 보호자 문의에 빠르고 정확하게
                응답하고 필요한 경우에만 담당자에게 넘깁니다. 도입 부담을 낮추고, 응대
                품질은 높이는 것이 목표입니다.
              </p>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="py-20 sm:py-24"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2
                id="features-heading"
                className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-3xl"
              >
                주요 기능
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                학원 운영 흐름에 맞춘 네 가지 핵심 기능입니다.
              </p>
            </div>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
              {features.map((f) => (
                <li
                  key={f.title}
                  className="group rounded-2xl border border-zinc-200/90 bg-white p-8 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-900/60"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                    {f.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-white">
                    {f.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {f.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="cta"
          className="border-t border-zinc-200/80 bg-indigo-600 py-16 dark:border-zinc-800 dark:bg-indigo-950"
        >
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              지금 챗실장과 상담 흐름을 정리해 보세요
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-indigo-100">
              계정을 만들고 학원 기본 정보를 등록하면 바로 체험할 수 있습니다.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              시작하기
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/80 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            © {new Date().getFullYear()} 챗실장
          </span>
          <span>소규모 학원을 위한 AI 상담 매니저</span>
        </div>
      </footer>
    </div>
  );
}
