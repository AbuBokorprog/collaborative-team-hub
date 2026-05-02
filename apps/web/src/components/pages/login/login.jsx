"use client";
import { Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useAppStore } from "@/store/useAppStore";

export default function Login() {
  const router = useRouter();
  const { login, isAuthenticated, theme, toggleTheme } = useAppStore();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      email: "alex@teamhub.io",
      password: "password123",
    },
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleLogin = async ({ email, password }) => {
    setError("");
    const ok = await login(email, password);
    if (ok) {
      toast.success("Signed in");
      router.push("/dashboard");
      return;
    }

    const message = useAppStore.getState().authError || "Invalid credentials";
    setError(message);
    toast.error(message);
  };

  return (
    <div
      className="min-h-screen bg-[var(--background)] flex text-black"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--sidebar-bg)] relative overflow-hidden flex-col p-10">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5 text-black"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar-text) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-text) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Gradient blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--accent)] rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-600 rounded-full blur-3xl opacity-15" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <span className="text-white text-sm font-bold">TH</span>
            </div>
            <span className="text-white font-semibold">
              Collaborative Team Hub
            </span>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="max-w-sm">
            <div className="inline-flex items-center gap-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full px-3 py-1.5 text-xs font-medium mb-6">
              <Zap className="w-3 h-3" /> Trusted by 500+ teams
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Where great teams
              <br />
              do great work
            </h1>
            <p className="text-[var(--sidebar-muted)] text-base leading-relaxed">
              Manage goals, tasks, and team communication — all in one beautiful
              workspace.
            </p>

            <div className="mt-10 space-y-3">
              {[
                "Track goals with real-time progress",
                "Kanban & list task management",
                "Team analytics & insights",
                "Rich announcements & mentions",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[var(--accent)] text-xs">✓</span>
                  </div>
                  <span className="text-sm text-[var(--sidebar-muted)]">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/5 rounded-2xl p-5 border border-white/10">
          <p className="text-sm text-white/70 italic leading-relaxed">
            &quot;Team Hub transformed how we work. Our productivity is up 40%
            since switching.&quot;
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
              JL
            </div>
            <div>
              <p className="text-xs font-medium text-white">Jamie Lee</p>
              <p className="text-[10px] text-white/40">CTO at Horizon Labs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
                <span className="text-white text-sm font-bold">TH</span>
              </div>
              <span className="font-semibold text-[var(--text-primary)]">
                Team Hub
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Welcome back
            </h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Sign in to your workspace
            </p>
          </div>

          {/* Demo hint */}
          <div className="bg-[var(--accent-soft)] border border-[var(--accent)]/20 rounded-xl p-3 mb-6">
            <p className="text-xs text-[var(--accent)] font-medium">
              🎯 Demo credentials pre-filled — just click Sign In
            </p>
          </div>

          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <Input
              label="Work email"
              type="email"
              {...register("email", { required: true })}
              placeholder="you@company.com"
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password", { required: true })}
                  placeholder="••••••••"
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-[var(--text-muted)]">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isSubmitting}
              icon={!isSubmitting && <ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-[var(--accent)] font-medium hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>

          {/* <div className="mt-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)]">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Google", "GitHub"].map((provider) => (
              <button
                key={provider}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)] transition-all"
              >
                {provider === "Google" ? "🇬" : "🐙"} {provider}
              </button>
            ))}
          </div> */}

          <p className="mt-8 text-center text-[10px] text-[var(--text-muted)]">
            By signing in, you agree to our{" "}
            <a href="#" className="hover:text-[var(--text-secondary)]">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="hover:text-[var(--text-secondary)]">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
