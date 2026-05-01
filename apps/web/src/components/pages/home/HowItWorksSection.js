"use client";

import { useRef, useState, useEffect } from "react";

const STEPS = [
  {
    step: "01",
    title: "Create your workspace",
    description:
      "Sign up in seconds and name your team workspace. Pick a plan, set your role, and configure your preferences — all in under 2 minutes.",
    accent: "#7c6dff",
    accentBg: "rgba(124, 109, 255, 0.12)",
    icon: (
      <svg
        className="w-6 h-6"
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
    detail: "Free 14-day trial, no credit card required",
  },
  {
    step: "02",
    title: "Invite your team",
    description:
      "Add teammates via email, assign roles (Admin / Member / Viewer), and watch them appear in your workspace instantly. Onboarding done.",
    accent: "#22c55e",
    accentBg: "rgba(34, 197, 94, 0.12)",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    detail: "Unlimited invites on all paid plans",
  },
  {
    step: "03",
    title: "Set goals & tasks",
    description:
      "Create OKRs with progress tracking, break them into tasks, assign ownership, and move work through your Kanban board effortlessly.",
    accent: "#f59e0b",
    accentBg: "rgba(245, 158, 11, 0.12)",
    icon: (
      <svg
        className="w-6 h-6"
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
    detail: "Kanban + list view, your preference",
  },
  {
    step: "04",
    title: "Ship & celebrate",
    description:
      "Ship work, post announcements to your team, track velocity with analytics, and celebrate wins — all in one unified workspace.",
    accent: "#22d3ee",
    accentBg: "rgba(34, 211, 238, 0.12)",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M5 3l14 9-14 9V3z"
        />
      </svg>
    ),
    detail: "Real-time updates, no refresh needed",
  },
];

function StepCard({ step, index, total }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex gap-5"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-20px)",
        transition: `opacity 0.5s ease ${index * 100}ms, transform 0.5s ease ${index * 100}ms`,
      }}
    >
      {/* Step indicator + connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
          style={{
            backgroundColor: step.accentBg,
            color: step.accent,
            border: `1px solid ${step.accent}30`,
          }}
        >
          {step.icon}
        </div>
        {index < total - 1 && (
          <div
            className="w-px flex-1 mt-2 mb-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)",
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-12 flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-[11px] font-bold tracking-widest"
            style={{ color: step.accent }}
          >
            STEP {step.step}
          </span>
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
        <p className="text-white/40 text-sm leading-relaxed mb-3">
          {step.description}
        </p>
        <div
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
          style={{ backgroundColor: step.accentBg, color: step.accent }}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {step.detail}
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#111110] py-28 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Steps */}
          <div>
            <span className="inline-block text-violet-400 text-xs font-semibold uppercase tracking-[0.2em] mb-5">
              How it works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Set up in under{" "}
              <span style={{ color: "#7c6dff" }}>5 minutes</span>
            </h2>
            <p className="text-white/40 text-lg mb-12 leading-relaxed">
              No complicated onboarding. No lengthy documentation. Just create,
              invite, and start collaborating.
            </p>

            <div>
              {STEPS.map((step, i) => (
                <StepCard
                  key={step.step}
                  step={step}
                  index={i}
                  total={STEPS.length}
                />
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative hidden lg:block">
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-violet-600/5 rounded-3xl blur-3xl" />

            <div className="relative bg-[#0d0c0b] border border-white/5 rounded-3xl p-8 space-y-4">
              <div className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-6">
                Team activity feed
              </div>

              {/* Mock activity items */}
              {[
                {
                  av: "AC",
                  color: "#7c6dff",
                  action: "completed",
                  item: "Q1 Dashboard redesign",
                  time: "2m ago",
                  icon: "✅",
                },
                {
                  av: "SK",
                  color: "#e11d48",
                  action: "updated goal",
                  item: "Platform v2 → 68%",
                  time: "15m ago",
                  icon: "🎯",
                },
                {
                  av: "MJ",
                  color: "#0891b2",
                  action: "moved to review",
                  item: "Auth 2FA integration",
                  time: "1h ago",
                  icon: "🔄",
                },
                {
                  av: "PP",
                  color: "#22c55e",
                  action: "posted announcement",
                  item: "Design System v3 is live!",
                  time: "3h ago",
                  icon: "📢",
                },
                {
                  av: "TW",
                  color: "#f59e0b",
                  action: "joined workspace",
                  item: "Side Ventures",
                  time: "1d ago",
                  icon: "🎉",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors group"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.av}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70">
                      <span className="text-white font-medium">
                        {item.av === "AC"
                          ? "Alex"
                          : item.av === "SK"
                            ? "Sarah"
                            : item.av === "MJ"
                              ? "Marcus"
                              : item.av === "PP"
                                ? "Priya"
                                : "Tom"}
                      </span>{" "}
                      <span className="text-white/40">{item.action}</span>{" "}
                      <span className="text-white/70">"{item.item}"</span>
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">{item.time}</p>
                  </div>
                  <span className="text-base opacity-50 group-hover:opacity-100 transition-opacity">
                    {item.icon}
                  </span>
                </div>
              ))}

              {/* Online indicator */}
              <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["#7c6dff", "#e11d48", "#22c55e"].map((c, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border border-[#0d0c0b] flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: c }}
                    >
                      {["AC", "SK", "PP"][i]}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-white/30">
                  3 teammates online right now
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse ml-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
