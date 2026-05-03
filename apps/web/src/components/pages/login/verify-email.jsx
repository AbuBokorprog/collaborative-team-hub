"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { authApi } from "@/services/auth-api";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [state, setState] = useState({
    status: token ? "loading" : "error",
    message: token ? "Verifying your email..." : "Verification link is missing.",
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;
    authApi
      .verifyEmail(token)
      .then(() => {
        if (active) {
          setState({
            status: "success",
            message: "Your email is verified. You can continue to Team Hub.",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            status: "error",
            message: error.message || "Unable to verify this email link.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const success = state.status === "success";
  const loading = state.status === "loading";

  return (
    <div
      className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-black"
      style={{ fontFamily: "Outfit, sans-serif" }}
    >
      <div className="w-full max-w-md text-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-[var(--shadow)]">
        <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-5">
          {loading ? (
            <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-8 h-8 text-[var(--success)]" />
          ) : (
            <XCircle className="w-8 h-8 text-[var(--danger)]" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {loading
            ? "Verifying email"
            : success
              ? "Email verified"
              : "Verification failed"}
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          {state.message}
        </p>
        <Link href="/login">
          <Button className="w-full">
            {success ? "Sign in" : "Back to sign in"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
