"use client";

import { useRef, useState, useEffect } from "react";

const TESTIMONIALS = [
  {
    quote:
      "Team Hub transformed how we work. Our productivity jumped 40% since switching. The Kanban board alone saved us from 3 different tools.",
    name: "Jamie Lee",
    role: "CTO",
    company: "Horizon Labs",
    initials: "JL",
    color: "#7c6dff",
    rating: 5,
    featured: true,
  },
  {
    quote:
      "Finally — one tool that does goals, tasks, and comms. We dropped Asana, Notion, and our Slack channels overnight.",
    name: "Riya Nair",
    role: "Head of Product",
    company: "Aether",
    initials: "RN",
    color: "#e11d48",
    rating: 5,
    featured: false,
  },
  {
    quote:
      "The analytics dashboard gave us insights we never had before. Our sprint reviews now take 10 minutes instead of an hour.",
    name: "David Kim",
    role: "Engineering Lead",
    company: "Vortex",
    initials: "DK",
    color: "#0891b2",
    rating: 5,
    featured: false,
  },
  {
    quote:
      "Onboarding new hires used to take days. With Team Hub they're contributing to goals and tasks on day one. It's that intuitive.",
    name: "Maya Osei",
    role: "People Ops Lead",
    company: "Flint",
    initials: "MO",
    color: "#22c55e",
    rating: 5,
    featured: false,
  },
  {
    quote:
      "The dark mode and responsiveness are genuinely beautiful. Our design team said it was the first SaaS tool they actually enjoyed using daily.",
    name: "Luca Ferreira",
    role: "Design Director",
    company: "Studio Arc",
    initials: "LF",
    color: "#f59e0b",
    rating: 5,
    featured: false,
  },
  {
    quote:
      "Multi-workspace support is a game changer for agencies. We manage 4 client teams from one login. Couldn't go back.",
    name: "Priya Mehta",
    role: "Agency Owner",
    company: "Craft Digital",
    initials: "PM",
    color: "#a78bfa",
    rating: 5,
    featured: false,
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-amber-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialCard({ item, index }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative bg-[#111110] border rounded-2xl p-6 flex flex-col gap-4 ${
        item.featured ? "border-violet-500/30" : "border-white/5"
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms`,
      }}
    >
      {/* Featured glow */}
      {item.featured && (
        <div className="absolute inset-0 rounded-2xl bg-violet-600/5 pointer-events-none" />
      )}

      <StarRating count={item.rating} />

      <p className="text-white/60 text-sm leading-relaxed flex-1">
        "{item.quote}"
      </p>

      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: item.color }}
        >
          {item.initials}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{item.name}</p>
          <p className="text-white/30 text-xs">
            {item.role} · {item.company}
          </p>
        </div>
        {item.featured && (
          <div className="ml-auto">
            <span className="text-[10px] font-semibold text-violet-400 bg-violet-400/10 px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-[#0d0c0b] py-28 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-violet-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            Loved by teams everywhere
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto leading-relaxed">
            Don't take our word for it — hear from the teams using Team Hub
            every single day.
          </p>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((item, i) => (
            <TestimonialCard key={item.name} item={item} index={i} />
          ))}
        </div>

        {/* Brand logos row */}
        <div className="mt-16 pt-12 border-t border-white/5">
          <p className="text-center text-white/25 text-xs uppercase tracking-widest mb-8">
            Trusted by teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {[
              "Horizon Labs",
              "Aether",
              "Vortex",
              "Flint",
              "Studio Arc",
              "Craft Digital",
            ].map((name) => (
              <span
                key={name}
                className="text-white/20 font-semibold text-sm tracking-tight hover:text-white/40 transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
