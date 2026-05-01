import { cn } from "@/lib/utils";

export function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) {
    return null;
  }
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-(--surface) rounded-2xl border border-border shadow-(--shadow-lg) w-full animate-slide-in",
          sizes[size],
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-(--text-primary)">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-(--surface-2) text-(--text-muted) transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
