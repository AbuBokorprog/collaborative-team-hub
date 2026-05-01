"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const STATS = [
  { value: "500+", label: "Teams using it" },
  { value: "40%", label: "Productivity boost" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "4.9★", label: "User rating" },
];

// Mini dashboard preview data
const PREVIEW_STATS = [
  { num: "42", label: "Total Tasks", accent: "#7c6dff" },
  { num: "5", label: "Active Goals", accent: "#22c55e" },
  { num: "3/5", label: "Team Online", accent: "#22d3ee" },
  { num: "78%", label: "Velocity", accent: "#f59e0b" },
];

const TEAM_MEMBERS = [
  { initials: "AC", color: "#7c6dff", name: "Alex", online: true },
  { initials: "SK", color: "#e11d48", name: "Sarah", online: true },
  { initials: "MJ", color: "#0891b2", name: "Marcus", online: false },
  { initials: "PP", color: "#22c55e", name: "Priya", online: true },
  { initials: "TW", color: "#f59e0b", name: "Tom", online: false },
];

const BAR_HEIGHTS = [45, 62, 55, 78, 90, 82];

function MiniDashboard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
      {/* Browser chrome */}
      <div className="bg-[#1a1918] px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 bg-[#0d0c0b] rounded-md px-3 py-1.5 text-center text-[11px] text-white/30">
          app.teamhub.io/dashboard
        </div>
      </div>

      {/* Dashboard UI */}
      <div className="flex bg-[#111110]" style={{ height: 320 }}>
        {/* Sidebar */}
        <div className="w-44 bg-[#0d0c0b] border-r border-white/5 p-3 flex flex-col gap-1 flex-shrink-0">
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">TH</span>
            </div>
            <span className="text-white/80 text-[11px] font-semibold">
              Team Hub
            </span>
          </div>
          {[
            { label: "Dashboard", active: true },
            { label: "Goals", active: false },
            { label: "Tasks", active: false },
            { label: "Announcements", active: false },
            { label: "Analytics", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] font-medium ${
                item.active
                  ? "bg-violet-600 text-white"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-white" : "bg-white/20"}`}
              />
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 overflow-hidden">
          <p className="text-white/80 text-[12px] font-semibold mb-3">
            Good morning, Alex 👋
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PREVIEW_STATS.map((s) => (
              <div
                key={s.label}
                className="bg-[#1c1b1a] rounded-xl p-2.5 border border-white/5"
              >
                <p
                  className="text-white font-bold text-[15px]"
                  style={{ color: s.accent }}
                >
                  {s.num}
                </p>
                <p className="text-white/30 text-[9px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Chart + team */}
          <div className="grid grid-cols-5 gap-2">
            {/* Bar chart */}
            <div className="col-span-3 bg-[#1c1b1a] rounded-xl p-3 border border-white/5">
              <p className="text-white/40 text-[9px] mb-2">
                Task Completion · 6 months
              </p>
              <div className="flex items-end gap-1.5 h-16">
                {BAR_HEIGHTS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      background: `rgba(124, 109, 255, ${0.3 + i * 0.12})`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Team */}
            <div className="col-span-2 bg-[#1c1b1a] rounded-xl p-3 border border-white/5">
              <p className="text-white/40 text-[9px] mb-2">Team Status</p>
              <div className="space-y-1.5">
                {TEAM_MEMBERS.map((m) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        backgroundColor: m.color,
                        fontSize: 7,
                        fontWeight: 700,
                      }}
                    >
                      {m.initials}
                    </div>
                    <span className="text-white/50 text-[10px] flex-1">
                      {m.name}
                    </span>
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: m.online ? "#22c55e" : "#3d3c39",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const gradRef = useRef(null);

  useEffect(() => {
    const el = gradRef.current;
    if (!el) return;
    let frame;
    let t = 0;
    const animate = () => {
      t += 0.003;
      const x = 50 + Math.sin(t) * 15;
      const y = 50 + Math.cos(t * 0.8) * 10;
      el.style.background = `radial-gradient(ellipse 80% 60% at ${x}% ${y}%, rgba(109, 90, 255, 0.18) 0%, rgba(79, 62, 220, 0.08) 40%, transparent 70%)`;
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center bg-[#0d0c0b] overflow-hidden">
      {/* Animated gradient bg */}
      <div ref={gradRef} className="absolute inset-0 pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            New: Kanban boards + Analytics now live
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6 max-w-4xl mx-auto">
          Where great teams{" "}
          <span
            className="inline-block"
            style={{
              background:
                "linear-gradient(135deg, #a78bfa 0%, #6d5aff 50%, #4f8eff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            do great work
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-center text-lg md:text-xl text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
          Goals, tasks, announcements, and analytics — all in one beautiful
          workspace. Built for teams who move fast.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/register"
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all duration-200 shadow-xl shadow-violet-600/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0"
          >
            Start for free
            <svg
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            See live demo
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mb-20 pb-10 border-b border-white/5">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-white/40 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Dashboard preview */}
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-white/30 mb-4 tracking-wide uppercase font-medium">
            Your new command center
          </p>
          <MiniDashboard />
        </div>
      </div>
    </section>
  );
}
