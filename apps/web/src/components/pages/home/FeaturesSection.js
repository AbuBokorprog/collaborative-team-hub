"use client";

import { useRef, useEffect, useState } from "react";

const FEATURES = [
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    accent: "#7c6dff",
    accentBg: "rgba(124, 109, 255, 0.12)",
    title: "Goal Tracking & OKRs",
    description:
      "Set quarterly objectives, track real-time progress, and keep every team member aligned on what truly matters. With status flags and progress sliders.",
    tag: "Goals",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    accent: "#22c55e",
    accentBg: "rgba(34, 197, 94, 0.12)",
    title: "Kanban & List Tasks",
    description:
      "Flexible task management with drag-and-drop Kanban boards or clean list view. Assign priorities, due dates, labels, and team members instantly.",
    tag: "Tasks",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
        />
      </svg>
    ),
    accent: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.12)",
    title: "Team Announcements",
    description:
      "Rich text announcements with @mentions, emoji reactions, pinning, and audience targeting. Keep everyone informed without the Slack chaos.",
    tag: "Comms",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    accent: "#22d3ee",
    accentBg: "rgba(34, 211, 238, 0.12)",
    title: "Advanced Analytics",
    description:
      "Beautiful charts for team velocity, task completion trends, member contributions, and goal progress. Make data-driven decisions effortlessly.",
    tag: "Analytics",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    accent: "#e11d48",
    accentBg: "rgba(225, 29, 72, 0.12)",
    title: "Multi-Workspace",
    description:
      "Manage multiple workspaces from one account. Switch between teams, set roles, invite members, and keep all your work separated but accessible.",
    tag: "Workspace",
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    accent: "#a78bfa",
    accentBg: "rgba(167, 139, 250, 0.12)",
    title: "Dark Mode + Responsive",
    description:
      "Gorgeous on any device, any theme. Toggle dark or light mode, use on mobile or desktop — every pixel is crafted to look sharp everywhere.",
    tag: "UX",
  },
];

function FeatureCard({ feature, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {setVisible(true);}
      },
      { threshold: 0.1 },
    );
    if (ref.current) {observer.observe(ref.current);}
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative bg-[#111110] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms, border-color 0.2s`,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top left, ${feature.accentBg} 0%, transparent 60%)`,
        }}
      />

      {/* Icon */}
      <div
        className="relative w-10 h-10 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: feature.accentBg, color: feature.accent }}
      >
        {feature.icon}
      </div>

      {/* Tag */}
      <span
        className="inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3"
        style={{ backgroundColor: feature.accentBg, color: feature.accent }}
      >
        {feature.tag}
      </span>

      {/* Title */}
      <h3 className="text-white font-semibold text-[15px] mb-2 leading-snug">
        {feature.title}
      </h3>

      {/* Desc */}
      <p className="text-white/40 text-sm leading-relaxed">
        {feature.description}
      </p>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#0d0c0b] py-28 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            Everything your team needs
          </h2>
          <p className="text-white/40 text-lg max-w-lg mx-auto leading-relaxed">
            A complete collaboration suite. No more switching between 5
            different tools every hour.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
