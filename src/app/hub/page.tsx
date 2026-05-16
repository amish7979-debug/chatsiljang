"use client";

const MENUS = [
  {
    icon: "chat",
    color: "#0f766e",
    bg: "#e0f2f1",
    badge: "학부모용",
    badgeBg: "#e0f2f1",
    badgeColor: "#0f766e",
    title: "AI 상담 위젯",
    desc: "학부모 상담창 미리보기",
    href: "/standalone",
    path: "/standalone",
  },
  {
    icon: "dashboard",
    color: "#1565c0",
    bg: "#e3f2fd",
    badge: "원장님용",
    badgeBg: "#e3f2fd",
    badgeColor: "#1565c0",
    title: "상담 대시보드",
    desc: "상담/예약 관리",
    href: "/dashboard",
    path: "/dashboard",
  },
  {
    icon: "building",
    color: "#5e35b1",
    bg: "#ede7f6",
    badge: "관리자용",
    badgeBg: "#ede7f6",
    badgeColor: "#5e35b1",
    title: "학원 정보 관리",
    desc: "학원 정보 설정",
    href: "/admin",
    path: "/admin",
  },
  {
    icon: "qna",
    color: "#e65100",
    bg: "#fff3e0",
    badge: "관리자용",
    badgeBg: "#fff3e0",
    badgeColor: "#e65100",
    title: "Q&A 관리",
    desc: "자동응답 Q&A 설정",
    href: "/qna",
    path: "/qna",
  },
];

function CardIcon({ icon, color }: { icon: string; color: string }) {
  if (icon === "chat") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (icon === "dashboard") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="2"/>
    </svg>
  );
  if (icon === "building") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M5 21V7l7-4 7 4v14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21v-4h6v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2"/>
      <path d="M9 9a3 3 0 0 1 6 0c0 2-3 3-3 3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="17" r="0.5" fill={color} stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

export default function HubPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ fontFamily: "'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif" }}>
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#0f766e" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-800">상담온</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">소규모 학원 AI 상담 매니저</h1>
          <p className="text-sm text-gray-400">햇살 피아노 학원 · 관리 허브</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {MENUS.map((menu) => (
            <a key={menu.title} href={menu.href} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#0f766e]/40 transition-all block no-underline">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: menu.bg }}>
                <CardIcon icon={menu.icon} color={menu.color} />
              </div>
              <div className="inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium" style={{ background: menu.badgeBg, color: menu.badgeColor }}>
                {menu.badge}
              </div>
              <div className="text-sm font-semibold text-gray-800 mb-1">{menu.title}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{menu.desc}</div>
              <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: menu.color }}>
                <span>{menu.path}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center text-xs text-gray-300">
          상담온 · 소규모 학원 전용 AI 상담 매니저
        </div>
      </div>
    </div>
  );
}
