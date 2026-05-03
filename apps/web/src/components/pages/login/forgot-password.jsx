"use client";
import { ArrowLeft, Mail, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/services/auth-api";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
  } = useForm({ defaultValues: { email: "" } });

  const handleRequest = async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      setSentEmail(email);
      setSent(true);
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen bg-[var(--background)] flex text-black"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--sidebar-bg)] relative overflow-hidden flex-col p-10">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar-text) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-text) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
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
              <Zap className="w-3 h-3" /> Secure account recovery
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Reset your
              <br />
              password
            </h1>
            <p className="text-[var(--sidebar-muted)] text-base leading-relaxed">
              Enter your email and we&apos;ll send you a link to get back into
              your account.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-5">
                <Mail className="w-8 h-8 text-[var(--accent)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Check your inbox
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-1">
                We sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-6">
                {sentEmail}
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-8">
                Didn&apos;t receive the email? Check your spam folder or try
                again.
              </p>
              <Button
                variant="secondary"
                onClick={() => setSent(false)}
                className="w-full"
              >
                Try a different email
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  Forgot your password?
                </h2>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  No worries, we&apos;ll send you reset instructions.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(handleRequest)}
                className="space-y-4"
              >
                <Input
                  label="Work email"
                  type="email"
                  {...register("email", { required: true })}
                  placeholder="you@company.com"
                  required
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-[var(--accent)] font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
