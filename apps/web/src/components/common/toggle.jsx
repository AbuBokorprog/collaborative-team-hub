import { cn } from "@/lib/utils";

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-10 h-6 rounded-full transition-colors duration-200",
          checked ? "bg-[var(--accent)]" : "bg-[var(--border)]",
        )}
      >
        <div
          className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
            checked ? "left-5" : "left-1",
          )}
        />
      </div>
      {label && (
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      )}
    </label>
  );
}
