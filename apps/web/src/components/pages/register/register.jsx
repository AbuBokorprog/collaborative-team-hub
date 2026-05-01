"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { Check, ArrowRight, Users, Target, BarChart2 } from "lucide-react";

const STEPS = ["Account", "Workspace", "Team"];

export default function RegisterPage() {
  const router = useRouter();
  const { login, theme, toggleTheme } = useAppStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    workspace: "",
    role: "",
    invite: "",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const nextStep = async () => {
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    login(form.email, form.password);
    router.push("/dashboard");
  };

  const features = [
    { icon: <Users className="w-5 h-5" />, text: "Unlimited team members" },
    { icon: <Target className="w-5 h-5" />, text: "Goal tracking & OKRs" },
    { icon: <BarChart2 className="w-5 h-5" />, text: "Advanced analytics" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/login" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white text-sm font-bold">TH</span>
            </div>
            <span className="font-semibold text-[var(--text-primary)]">
              Team Hub
            </span>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                  i < step
                    ? "bg-[var(--success)] text-white"
                    : i === step
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--border)] text-[var(--text-muted)]",
                )}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  i === step
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)]",
                )}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px",
                    i < step ? "bg-[var(--success)]" : "bg-[var(--border)]",
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow)]">
          {step === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Create your account
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Start your free 14-day trial
                </p>
              </div>
              <Input
                label="Full name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Alex Chen"
              />
              <Input
                label="Work email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="alex@company.com"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Password
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded"
                  defaultChecked
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-[var(--text-muted)]"
                >
                  I agree to the{" "}
                  <a href="#" className="text-[var(--accent)]">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-[var(--accent)]">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Set up your workspace
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  This will be your team's home in Team Hub
                </p>
              </div>
              <Input
                label="Workspace name"
                value={form.workspace}
                onChange={(e) => update("workspace", e.target.value)}
                placeholder="Acme Inc."
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Your role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                >
                  <option value="">Select your role</option>
                  <option>CEO / Founder</option>
                  <option>Product Manager</option>
                  <option>Engineering Lead</option>
                  <option>Designer</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Team size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["1–5", "6–20", "20+"].map((s) => (
                    <button
                      key={s}
                      className="py-2 px-3 rounded-xl border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Invite your team
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  Great work is always a team effort
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-primary)]">
                  Email addresses
                </label>
                <textarea
                  value={form.invite}
                  onChange={(e) => update("invite", e.target.value)}
                  placeholder="teammate@company.com, another@company.com"
                  rows={3}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Separate multiple emails with commas
                </p>
              </div>
              <div className="bg-[var(--surface-2)] rounded-xl p-4 space-y-2.5">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  What's included
                </p>
                {features.map((f) => (
                  <div
                    key={f.text}
                    className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--success)]">{f.icon}</span>
                    {f.text}
                  </div>
                ))}
              </div>
              <button className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                Skip for now →
              </button>
            </div>
          )}

          <Button
            onClick={nextStep}
            className="w-full mt-6"
            size="lg"
            loading={loading}
            icon={!loading && <ArrowRight className="w-4 h-4" />}
          >
            {step < 2
              ? "Continue"
              : loading
                ? "Setting up..."
                : "Launch my workspace"}
          </Button>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--accent)] font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
