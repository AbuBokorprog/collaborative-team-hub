"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/common/sidebar";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, theme, sidebarOpen } = useAppStore();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.replace("/login");
  //   }
  // }, [isAuthenticated, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // if (!isAuthenticated) return null;

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
