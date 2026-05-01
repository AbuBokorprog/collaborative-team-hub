"use client";

import Link from "next/link";

export function CTASection() {
  return (
    <section className="bg-[#0d0c0b] py-28 px-6 lg:px-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/8 text-violet-300 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Free 14-day trial, no credit card needed
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 leading-[1.1]">
          Ready to level up{" "}
          <span
            style={{
              background:
                "linear-gradient(135deg, #a78bfa 0%, #6d5aff 50%, #4f8eff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            your team?
          </span>
        </h2>

        <p className="text-white/40 text-xl leading-relaxed mb-10 max-w-xl mx-auto">
          Join 500+ teams already shipping faster with Collaborative Team Hub.
          Setup takes under 5 minutes.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="group flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-all duration-200 shadow-xl shadow-violet-600/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto justify-center"
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
            href="/login"
            className="flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-200 w-full sm:w-auto justify-center"
          >
            Log in to existing workspace
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8 border-t border-white/5">
          {[
            { icon: "🔒", text: "SOC2 compliant" },
            { icon: "⚡", text: "99.9% uptime" },
            { icon: "💳", text: "No credit card" },
            { icon: "🌍", text: "GDPR ready" },
          ].map((b) => (
            <div
              key={b.text}
              className="flex items-center gap-2 text-white/30 text-sm"
            >
              <span className="text-base">{b.icon}</span>
              {b.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FOOTER_LINKS = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Documentation", "API Reference", "Integrations", "Support"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"],
};

export function Footer() {
  return (
    <footer className="bg-[#0d0c0b] border-t border-white/5 px-6 lg:px-10 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Top: Logo + Links */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">TH</span>
              </div>
              <span className="text-white font-semibold">
                Collaborative Team Hub
              </span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed mb-6">
              The modern workspace for teams who move fast and build great
              things together.
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {["Twitter", "GitHub", "LinkedIn"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors text-xs font-medium"
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-white/30 text-sm hover:text-white/70 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
          <p className="text-white/20 text-sm">
            © {new Date().getFullYear()} Collaborative Team Hub, Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/25 text-xs">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
