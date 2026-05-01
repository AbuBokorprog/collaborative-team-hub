import { cn } from "@/lib/utils";

export function Textarea({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </label>
      )}
      <textarea
        className={cn(
          "w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none",
          "focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all",
          error && "border-[var(--danger)]",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
