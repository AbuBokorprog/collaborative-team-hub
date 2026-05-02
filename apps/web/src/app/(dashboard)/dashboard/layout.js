"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import Sidebar from "@/components/common/sidebar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { authLoading, hydrateSession, isAuthenticated, theme, sidebarOpen } =
    useAppStore();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let active = true;

    hydrateSession().finally(() => {
      if (active) {
        setSessionChecked(true);
      }
    });

    return () => {
      active = false;
    };
  }, [hydrateSession]);

  useEffect(() => {
    if (sessionChecked && !authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router, sessionChecked]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  if (!sessionChecked || authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300",
          "lg:ml-60",
          !sidebarOpen && "lg:ml-16",
        )}
      >
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-screen-2xl p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
