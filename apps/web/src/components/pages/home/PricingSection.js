"use client";

import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for small teams just getting started.",
    cta: "Get started free",
    ctaHref: "/register",
    featured: false,
    features: [
      "Up to 3 members",
      "5 active goals",
      "Kanban task board",
      "Basic announcements",
      "Community support",
      "1 workspace",
    ],
    missing: ["Analytics dashboard", "Multi-workspace", "Priority support"],
  },
  {
    name: "Pro",
    price: { monthly: 12, annual: 9 },
    description: "For growing teams that need more power and flexibility.",
    cta: "Start Pro trial",
    ctaHref: "/register",
    featured: true,
    badge: "Most popular",
    features: [
      "Unlimited members",
      "Unlimited goals & tasks",
      "Advanced analytics",
      "Rich announcements + reactions",
      "Multi-workspace (up to 5)",
      "Dark mode & responsive",
      "Priority email support",
      "10 GB storage",
    ],
    missing: [],
  },
  {
    name: "Business",
    price: { monthly: 28, annual: 22 },
    description: "Enterprise-grade control for organizations that need it all.",
    cta: "Contact sales",
    ctaHref: "/register",
    featured: false,
    features: [
      "Everything in Pro",
      "SSO & SAML",
      "Unlimited workspaces",
      "Audit logs",
      "Custom roles & permissions",
      "Dedicated success manager",
      "SLA guarantees",
      "Unlimited storage",
    ],
    missing: [],
  },
];

function CheckIcon({ color = "#22c55e" }) {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      style={{ color }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0 text-white/15"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function PlanCard({ plan, annual }) {
  const price = annual ? plan.price.annual : plan.price.monthly;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-7 ${
        plan.featured
          ? "bg-violet-600/10 border-2 border-violet-500/50"
          : "bg-[#111110] border border-white/5"
      }`}
    >
      {/* Glow for featured */}
      {plan.featured && (
        <div className="absolute inset-0 rounded-2xl bg-violet-600/5 pointer-events-none" />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-violet-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg shadow-violet-600/30">
            {plan.badge}
          </span>
        </div>
      )}

      <div className="relative">
        {/* Plan name */}
        <p className="text-white/50 text-sm font-semibold uppercase tracking-widest mb-3">
          {plan.name}
        </p>

        {/* Price */}
        <div className="flex items-end gap-1 mb-2">
          <span className="text-white text-4xl font-bold tracking-tight">
            {price === 0 ? "Free" : `$${price}`}
          </span>
          {price > 0 && (
            <span className="text-white/30 text-sm mb-1.5">/member/mo</span>
          )}
        </div>

        {annual && price > 0 && (
          <p className="text-green-400 text-xs font-medium mb-3">
            Save ${(plan.price.monthly - plan.price.annual) * 12}/yr billed
            annually
          </p>
        )}

        <p className="text-white/40 text-sm leading-relaxed mb-6">
          {plan.description}
        </p>

        {/* CTA */}
        <Link
          href={plan.ctaHref}
          className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-150 ${
            plan.featured
              ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-500/40 hover:-translate-y-px"
              : "border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5"
          }`}
        >
          {plan.cta} {plan.featured && "→"}
        </Link>

        {/* Divider */}
        <div className="my-6 h-px bg-white/5" />

        {/* Features */}
        <ul className="space-y-3">
          {plan.features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2.5 text-sm text-white/60"
            >
              <CheckIcon color={plan.featured ? "#a78bfa" : "#22c55e"} />
              {f}
            </li>
          ))}
          {plan.missing.map((f) => (
            <li
              key={f}
              className="flex items-center gap-2.5 text-sm text-white/20 line-through"
            >
              <CrossIcon />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-[#111110] py-28 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-violet-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            Simple, honest pricing
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto leading-relaxed">
            Start free. Scale as your team grows. No hidden fees, ever.
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span
              className={`text-sm font-medium transition-colors ${!annual ? "text-white" : "text-white/30"}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${annual ? "bg-violet-600" : "bg-white/10"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${annual ? "left-7" : "left-1"}`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${annual ? "text-white" : "text-white/30"}`}
            >
              Annual
            </span>
            {annual && (
              <span className="text-green-400 text-xs font-semibold bg-green-400/10 px-2 py-1 rounded-full">
                Save up to 25%
              </span>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} annual={annual} />
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-white/25 text-sm mt-10">
          All plans include a 14-day free trial · No credit card required ·
          Cancel anytime
        </p>
      </div>
    </section>
  );
}
