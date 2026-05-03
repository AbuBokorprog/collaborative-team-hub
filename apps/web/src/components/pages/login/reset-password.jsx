"use client";

import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/services/auth-api";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");

  const handleReset = async ({ newPassword }) => {
    if (!token) {
      toast.error("Reset link is missing or invalid.");
      return;
    }

    try {
      await authApi.resetPassword({ token, newPassword });
      setDone(true);
      toast.success("Password reset successfully");
    } catch (error) {
      toast.error(error.message || "Unable to reset password.");
    }
  };

  return (
    <div
      className="min-h-screen bg-[var(--background)] flex text-black"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--sidebar-bg)] relative overflow-hidden flex-col p-10">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(var(--sidebar-text) 1px, transparent 1px), linear-gradient(90deg, var(--sidebar-text) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-sm font-bold">TH</span>
          </div>
          <span className="text-white font-semibold">
            Collaborative Team Hub
          </span>
        </div>
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm">
          <div className="inline-flex items-center gap-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full px-3 py-1.5 text-xs font-medium mb-6 w-fit">
            <Lock className="w-3 h-3" /> Account recovery
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Choose a new password
          </h1>
          <p className="text-[var(--sidebar-muted)] text-base leading-relaxed">
            Use a strong password that you have not used for Team Hub before.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--success-soft)] flex items-center justify-center mx-auto mb-5">
                <Lock className="w-8 h-8 text-[var(--success)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Password updated
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                You can now sign in with your new password.
              </p>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Go to sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  Reset password
                </h2>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  Enter and confirm your new password.
                </p>
              </div>

              <form onSubmit={handleSubmit(handleReset)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      placeholder="••••••••"
                      className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-[var(--danger)]">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword", {
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={isSubmitting}
                  icon={!isSubmitting && <ArrowRight className="w-4 h-4" />}
                  disabled={!token}
                >
                  {isSubmitting ? "Updating..." : "Update password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
