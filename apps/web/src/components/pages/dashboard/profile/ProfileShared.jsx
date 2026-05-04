import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Edit2, Lock, Bell, Palette } from "lucide-react";

export const PROFILE_TABS = [
  { id: "profile", icon: <Edit2 className="w-4 h-4" />, label: "Profile" },
  {
    id: "account",
    icon: <Lock className="w-4 h-4" />,
    label: "Account & Security",
  },
  {
    id: "notifications",
    icon: <Bell className="w-4 h-4" />,
    label: "Notifications",
  },
  {
    id: "appearance",
    icon: <Palette className="w-4 h-4" />,
    label: "Appearance",
  },
  // { id: "activity", icon: <Clock className="w-4 h-4" />, label: "Activity" },
];

export function Section({ title, description, children, className }) {
  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-[var(--border)] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function ActivityItem({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  time,
  badge,
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[var(--border)] last:border-0">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {title}
        </p>
        <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge && <Badge color={badge.color}>{badge.label}</Badge>}
        <span className="text-xs text-[var(--text-muted)]">{time}</span>
      </div>
    </div>
  );
}
