"use client";
import { Sun, Moon, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Section } from "./ProfileShared";

const THEMES = [
  {
    key: "light",
    label: "Light",
    icon: <Sun className="w-5 h-5" />,
    preview: "bg-white border-gray-200",
  },
  {
    key: "dark",
    label: "Dark",
    icon: <Moon className="w-5 h-5" />,
    preview: "bg-gray-900 border-gray-700",
  },
  // {
  //   key: "system",
  //   label: "System",
  //   icon: <Monitor className="w-5 h-5" />,
  //   preview: "bg-gradient-to-r from-white to-gray-900 border-gray-400",
  // },
];

const ACCENT_COLORS = [
  { color: "#5b4fff", label: "Violet" },
  { color: "#e11d48", label: "Rose" },
  { color: "#0891b2", label: "Cyan" },
  { color: "#16a34a", label: "Green" },
  { color: "#d97706", label: "Amber" },
  { color: "#7c3aed", label: "Purple" },
  { color: "#db2777", label: "Pink" },
  { color: "#1a1918", label: "Midnight" },
];

export default function AppearanceTab({ theme, toggleTheme }) {
  return (
    <div className="space-y-5">
      <Card>
        <Section
          title="Theme"
          description="Choose your preferred color scheme."
        />
        <div className="grid grid-cols-2 gap-3 mt-5">
          {THEMES.map((t) => {
            const isActive =
              theme === t.key ||
              (t.key === "system" && !["light", "dark"].includes(theme));
            return (
              <button
                key={t.key}
                onClick={() => t.key !== "system" && toggleTheme()}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)] bg-[var(--surface-2)]",
                )}
              >
                <div
                  className={cn("w-full h-14 rounded-xl border", t.preview)}
                />
                <div
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-muted)]",
                  )}
                >
                  {t.icon}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-secondary)]",
                  )}
                >
                  {t.label}
                </span>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <Section
          title="Accent Color"
          description="Personalize your workspace color."
        />
        <div className="flex gap-3 mt-5 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.color}
              title={c.label}
              className="group relative w-8 h-8 rounded-full border-2 border-transparent hover:border-[var(--border-strong)] transition-all hover:scale-110"
              style={{ backgroundColor: c.color }}
            >
              {c.color === "#5b4fff" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* <Card>
        <Section title="Sidebar" description="Customize sidebar behavior." />
        <div className="mt-5 space-y-0">
          <SettingRow
            label="Collapse by default"
            description="Start with a compact sidebar on load"
          >
            <Toggle checked={false} onChange={() => {}} />
          </SettingRow>
          <SettingRow
            label="Show online team members"
            description="Display online teammates in the sidebar"
          >
            <Toggle checked={true} onChange={() => {}} />
          </SettingRow>
        </div>
      </Card> */}

      {/* <Card>
        <Section title="Display Density" description="Adjust how compact the interface feels." />
        <div className="grid grid-cols-3 gap-3 mt-5">
          {["Compact", "Comfortable", "Spacious"].map((d, i) => (
            <button
              key={d}
              className={cn(
                "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all",
                i === 1
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </Card> */}
    </div>
  );
}
