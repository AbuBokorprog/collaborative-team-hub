"use client";

import {
  Camera,
  Edit2,
  Save,
  Lock,
  Bell,
  Palette,
  Globe,
  LogOut,
  Trash2,
  Check,
  X,
  Link,
  Code2,
  AtSign,
  Moon,
  Sun,
  Monitor,
  Eye,
  EyeOff,
  ChevronRight,
  Award,
  CheckSquare,
  Target,
  Megaphone,
  Clock,
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

import Header from "@/components/common/header";
import { Modal } from "@/components/common/modal";
import { Textarea } from "@/components/common/textArea";
import { Toggle } from "@/components/common/toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { authApi } from "@/services/auth-api";
import { useAppStore } from "@/store/useAppStore";

/* ─── Section wrapper ─────────────────────────────── */
function Section({ title, description, children, className }) {
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

/* ─── Setting row ─────────────────────────────────── */
function SettingRow({ label, description, children }) {
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

/* ─── Activity item ───────────────────────────────── */
function ActivityItem({
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

/* ─── Sidebar tabs ────────────────────────────────── */
const TABS = [
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
  { id: "activity", icon: <Clock className="w-4 h-4" />, label: "Activity" },
];

/* ─── Page ────────────────────────────────────────── */
export default function ProfilePage() {
  const { currentUser, theme, toggleTheme, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: currentUser?.name || "Alex Chen",
    email: currentUser?.email || "alex@teamhub.io",
    role: currentUser?.role || "Product Lead",
    bio: "Product lead at TeamHub. Passionate about building tools that help teams do their best work. Previously @Linear.",
    location: "San Francisco, CA",
    website: "https://alexchen.dev",
    github: "alexchen",
    twitter: "@alexchen",
    timezone: "America/Los_Angeles",
    language: "English (US)",
  });

  const [notifSettings, setNotifSettings] = useState({
    emailMentions: true,
    emailTasks: true,
    emailGoals: false,
    emailWeekly: true,
    pushMentions: true,
    pushTasks: false,
    pushAnnouncements: true,
    desktopSound: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updatePasswordField = (key, value) =>
    setPasswordForm((form) => ({ ...form, [key]: value }));
  const toggleNotif = (k) => setNotifSettings((s) => ({ ...s, [k]: !s[k] }));

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setEditMode(false);
    }, 1500);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error("Current and new password are required.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password updated");
    } catch (error) {
      toast.error(error.message || "Unable to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const stats = [
    {
      label: "Tasks Completed",
      value: 18,
      icon: <CheckSquare className="w-4 h-4" />,
      color: "var(--accent)",
      bg: "var(--accent-soft)",
    },
    {
      label: "Goals Owned",
      value: 4,
      icon: <Target className="w-4 h-4" />,
      color: "var(--success)",
      bg: "var(--success-soft)",
    },
    {
      label: "Announcements",
      value: 3,
      icon: <Megaphone className="w-4 h-4" />,
      color: "var(--warning)",
      bg: "var(--warning-soft)",
    },
    {
      label: "Days Active",
      value: 47,
      icon: <Award className="w-4 h-4" />,
      color: "var(--info)",
      bg: "var(--info-soft)",
    },
  ];

  const recentActivity = [
    {
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      iconBg: "var(--success-soft)",
      iconColor: "var(--success)",
      title: 'Completed "Q1 Dashboard redesign"',
      subtitle: "Tasks · Design",
      time: "2h ago",
      badge: { label: "Done", color: "success" },
    },
    {
      icon: <Target className="w-3.5 h-3.5" />,
      iconBg: "var(--accent-soft)",
      iconColor: "var(--accent)",
      title: 'Updated goal "Platform v2" to 68%',
      subtitle: "Goals",
      time: "5h ago",
      badge: { label: "On Track", color: "success" },
    },
    {
      icon: <Megaphone className="w-3.5 h-3.5" />,
      iconBg: "var(--warning-soft)",
      iconColor: "var(--warning)",
      title: 'Posted "Q1 Planning Week Kickoff"',
      subtitle: "Announcements · All team",
      time: "1d ago",
    },
    {
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      iconBg: "var(--info-soft)",
      iconColor: "var(--info)",
      title: 'Moved "Onboarding flow" to In Progress',
      subtitle: "Tasks · Product",
      time: "2d ago",
      badge: { label: "In Progress", color: "warning" },
    },
    {
      icon: <Target className="w-3.5 h-3.5" />,
      iconBg: "var(--accent-soft)",
      iconColor: "var(--accent)",
      title: 'Created goal "Team Growth to 20 FTEs"',
      subtitle: "Goals",
      time: "3d ago",
    },
    {
      icon: <CheckSquare className="w-3.5 h-3.5" />,
      iconBg: "var(--success-soft)",
      iconColor: "var(--success)",
      title: 'Completed "User analytics events"',
      subtitle: "Tasks · Product",
      time: "5d ago",
      badge: { label: "Done", color: "success" },
    },
  ];

  return (
    <div className="animate-slide-in space-y-4">
      <Header
        title="Profile"
        subtitle="Manage your account, preferences, and activity"
      />

      <div className="flex flex-col lg:flex-row gap-6 ">
        {/* ── Left sidebar ────────────────────────── */}
        <aside className="lg:w-64 shrink-0 space-y-4">
          {/* Avatar card */}
          <Card className="text-center">
            <div className="relative inline-block mb-4">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto"
                style={{ backgroundColor: currentUser?.color }}
              >
                {currentUser?.avatar}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center shadow-md hover:bg-[var(--accent-hover)] transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </div>

            <h3 className="font-semibold text-[var(--text-primary)]">
              {form.name}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">{form.role}</p>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
              <span className="text-xs text-[var(--success)] font-medium">
                Online
              </span>
            </div>

            {/* Stat pills */}
            <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-[var(--border)]">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-2.5 text-center"
                  style={{ backgroundColor: s.bg }}
                >
                  <p className="text-lg font-bold" style={{ color: s.color }}>
                    {s.value}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Nav tabs */}
          <Card className="p-2">
            <nav className="space-y-0.5">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                    activeTab === tab.id
                      ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  )}
                </button>
              ))}
            </nav>
          </Card>

          {/* Danger */}
          <Card className="p-3">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </Card>
        </aside>

        {/* ── Main content ─────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* ── PROFILE TAB ──────────────────────────── */}
          {activeTab === "profile" && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <Section
                  title="Public Profile"
                  description="This information is visible to your team."
                />
                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<X className="w-3.5 h-3.5" />}
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        loading={saved}
                        icon={
                          saved ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )
                        }
                        onClick={handleSave}
                      >
                        {saved ? "Saved!" : "Save"}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Edit2 className="w-3.5 h-3.5" />}
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    disabled={!editMode}
                  />
                  <Input
                    label="Role / Title"
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    disabled={!editMode}
                  />
                </div>

                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  disabled={!editMode}
                />

                <Textarea
                  label="Bio"
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  disabled={!editMode}
                  rows={3}
                  placeholder="Tell your team a bit about yourself..."
                  className={!editMode ? "opacity-70 cursor-default" : ""}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                      Location
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        disabled={!editMode}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 pl-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-70"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                      Website
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        value={form.website}
                        onChange={(e) => update("website", e.target.value)}
                        disabled={!editMode}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 pl-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-70"
                        placeholder="https://yoursite.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-3">
                    Social Links
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--text-primary)]">
                        GitHub
                      </label>
                      <div className="relative">
                        <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                          value={form.github}
                          onChange={(e) => update("github", e.target.value)}
                          disabled={!editMode}
                          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 pl-10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-70"
                          placeholder="username"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-[var(--text-primary)]">
                        Twitter / X
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                          value={form.twitter}
                          onChange={(e) => update("twitter", e.target.value)}
                          disabled={!editMode}
                          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 pl-10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-70"
                          placeholder="@handle"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* ── ACCOUNT & SECURITY TAB ────────────────── */}
          {activeTab === "account" && (
            <div className="space-y-5">
              <Card>
                <Section
                  title="Account Settings"
                  description="Manage your login credentials and workspace preferences."
                />
                <div className="mt-5 space-y-0">
                  <SettingRow
                    label="Email address"
                    description="Used for login and notifications"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--text-muted)]">
                        {form.email}
                      </span>
                      <button className="text-xs text-[var(--accent)] hover:underline">
                        Change
                      </button>
                    </div>
                  </SettingRow>
                  <SettingRow
                    label="Timezone"
                    description="Your local timezone for scheduling"
                  >
                    <select
                      value={form.timezone}
                      onChange={(e) => update("timezone", e.target.value)}
                      className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <option>America/Los_Angeles</option>
                      <option>America/New_York</option>
                      <option>Europe/London</option>
                      <option>Asia/Tokyo</option>
                      <option>Asia/Dhaka</option>
                    </select>
                  </SettingRow>
                  <SettingRow label="Language" description="Interface language">
                    <select
                      value={form.language}
                      onChange={(e) => update("language", e.target.value)}
                      className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    >
                      <option>English (US)</option>
                      <option>Bengali</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                    </select>
                  </SettingRow>
                </div>
              </Card>

              <Card>
                <Section
                  title="Password"
                  description="Keep your account secure with a strong password."
                />
                <div className="mt-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={passwordForm.oldPassword}
                        onChange={(e) =>
                          updatePasswordField("oldPassword", e.target.value)
                        }
                        placeholder="••••••••"
                        className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      >
                        {showPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="New password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        updatePasswordField("newPassword", e.target.value)
                      }
                      placeholder="••••••••"
                    />
                    <Input
                      label="Confirm password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        updatePasswordField("confirmPassword", e.target.value)
                      }
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    size="sm"
                    loading={changingPassword}
                    icon={
                      !changingPassword && <Lock className="w-3.5 h-3.5" />
                    }
                    onClick={handleChangePassword}
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </Card>

              <Card>
                <Section
                  title="Two-Factor Authentication"
                  description="Add an extra layer of security to your account."
                />
                <div className="mt-5">
                  <SettingRow
                    label="Authenticator app"
                    description="Use an app like 1Password or Google Authenticator"
                  >
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </SettingRow>
                  <SettingRow
                    label="SMS backup"
                    description="Receive a code via SMS as backup"
                  >
                    <Button variant="secondary" size="sm">
                      Add phone
                    </Button>
                  </SettingRow>
                </div>
              </Card>

              <Card className="border-[var(--danger)]/20">
                <Section
                  title="Danger Zone"
                  description="Irreversible actions. Proceed with caution."
                />
                <div className="mt-5 space-y-0">
                  <SettingRow
                    label="Deactivate account"
                    description="Temporarily disable your account. You can reactivate anytime."
                  >
                    <Button variant="outline" size="sm">
                      Deactivate
                    </Button>
                  </SettingRow>
                  <SettingRow
                    label="Delete account"
                    description="Permanently delete your account and all associated data."
                  >
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                  </SettingRow>
                </div>
              </Card>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ─────────────────────── */}
          {activeTab === "notifications" && (
            <div className="space-y-5">
              <Card>
                <Section
                  title="Email Notifications"
                  description="Choose which emails you'd like to receive."
                />
                <div className="mt-5 space-y-0">
                  {[
                    {
                      key: "emailMentions",
                      label: "@Mentions",
                      description:
                        "When someone mentions you in a comment or announcement",
                    },
                    {
                      key: "emailTasks",
                      label: "Task assignments",
                      description: "When a task is assigned to you or updated",
                    },
                    {
                      key: "emailGoals",
                      label: "Goal updates",
                      description:
                        "Progress changes on goals you own or follow",
                    },
                    {
                      key: "emailWeekly",
                      label: "Weekly digest",
                      description:
                        "A summary of your workspace activity every Monday",
                    },
                  ].map((n) => (
                    <SettingRow
                      key={n.key}
                      label={n.label}
                      description={n.description}
                    >
                      <Toggle
                        checked={notifSettings[n.key]}
                        onChange={() => toggleNotif(n.key)}
                      />
                    </SettingRow>
                  ))}
                </div>
              </Card>

              <Card>
                <Section
                  title="Push Notifications"
                  description="In-app and browser push notifications."
                />
                <div className="mt-5 space-y-0">
                  {[
                    {
                      key: "pushMentions",
                      label: "Mentions & replies",
                      description: "Instant push when you are @mentioned",
                    },
                    {
                      key: "pushTasks",
                      label: "Task due dates",
                      description: "24h reminder before a task is due",
                    },
                    {
                      key: "pushAnnouncements",
                      label: "New announcements",
                      description: "When a team announcement is posted",
                    },
                    {
                      key: "desktopSound",
                      label: "Notification sound",
                      description: "Play a sound for desktop notifications",
                    },
                  ].map((n) => (
                    <SettingRow
                      key={n.key}
                      label={n.label}
                      description={n.description}
                    >
                      <Toggle
                        checked={notifSettings[n.key]}
                        onChange={() => toggleNotif(n.key)}
                      />
                    </SettingRow>
                  ))}
                </div>
              </Card>

              <Card>
                <Section
                  title="Notification Schedule"
                  description="Pause notifications during off-hours."
                />
                <div className="mt-5 space-y-0">
                  <SettingRow
                    label="Focus mode"
                    description="Silence all notifications and show DND status"
                  >
                    <Toggle checked={false} onChange={() => {}} />
                  </SettingRow>
                  <SettingRow
                    label="Working hours"
                    description="Only receive notifications Mon–Fri, 9am–6pm"
                  >
                    <Toggle checked={true} onChange={() => {}} />
                  </SettingRow>
                </div>
              </Card>
            </div>
          )}

          {/* ── APPEARANCE TAB ─────────────────────────── */}
          {activeTab === "appearance" && (
            <div className="space-y-5">
              <Card>
                <Section
                  title="Theme"
                  description="Choose your preferred color scheme."
                />
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {[
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
                    {
                      key: "system",
                      label: "System",
                      icon: <Monitor className="w-5 h-5" />,
                      preview:
                        "bg-gradient-to-r from-white to-gray-900 border-gray-400",
                    },
                  ].map((t) => {
                    const isActive =
                      theme === t.key ||
                      (t.key === "system" &&
                        !["light", "dark"].includes(theme));
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
                          className={cn(
                            "w-full h-14 rounded-xl border",
                            t.preview,
                          )}
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
                  {[
                    { color: "#5b4fff", label: "Violet" },
                    { color: "#e11d48", label: "Rose" },
                    { color: "#0891b2", label: "Cyan" },
                    { color: "#16a34a", label: "Green" },
                    { color: "#d97706", label: "Amber" },
                    { color: "#7c3aed", label: "Purple" },
                    { color: "#db2777", label: "Pink" },
                    { color: "#1a1918", label: "Midnight" },
                  ].map((c) => (
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

              <Card>
                <Section
                  title="Sidebar"
                  description="Customize sidebar behavior."
                />
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
              </Card>

              <Card>
                <Section
                  title="Display Density"
                  description="Adjust how compact the interface feels."
                />
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
              </Card>
            </div>
          )}

          {/* ── ACTIVITY TAB ──────────────────────────── */}
          {activeTab === "activity" && (
            <div className="space-y-5">
              {/* Contribution summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <Card key={s.label} className="text-center py-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      {s.icon}
                    </div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                      {s.value}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {s.label}
                    </p>
                  </Card>
                ))}
              </div>

              {/* Progress toward goals */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  Your Goal Ownership
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Launch v2.0 Platform",
                      progress: 68,
                      color: "var(--accent)",
                    },
                    {
                      title: "Reach 10K Active Users",
                      progress: 42,
                      color: "var(--danger)",
                    },
                    {
                      title: "Team Growth to 20 FTEs",
                      progress: 60,
                      color: "var(--info)",
                    },
                  ].map((g) => (
                    <div key={g.title} className="space-y-1.5">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {g.title}
                        </p>
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {g.progress}%
                        </span>
                      </div>
                      <Progress value={g.progress} color={g.color} height={6} />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent activity */}
              <Card>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Recent Activity
                  </h3>
                  <Badge color="neutral">{recentActivity.length} actions</Badge>
                </div>
                <div>
                  {recentActivity.map((item, i) => (
                    <ActivityItem key={i} {...item} />
                  ))}
                </div>
              </Card>

              {/* Badges / Achievements */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">
                  Achievements
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { emoji: "🚀", label: "Early Adopter", earned: true },
                    { emoji: "✅", label: "10 Tasks Done", earned: true },
                    { emoji: "🎯", label: "Goal Setter", earned: true },
                    { emoji: "📢", label: "First Post", earned: true },
                    { emoji: "🔥", label: "7-day Streak", earned: false },
                    { emoji: "💯", label: "100 Tasks", earned: false },
                    { emoji: "🏆", label: "Top Contributor", earned: false },
                    { emoji: "⚡", label: "Speed Demon", earned: false },
                  ].map((b) => (
                    <div
                      key={b.label}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                        b.earned
                          ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                          : "border-[var(--border)] opacity-40 grayscale",
                      )}
                    >
                      <span className="text-2xl">{b.emoji}</span>
                      <span className="text-[11px] font-medium text-[var(--text-primary)] leading-tight">
                        {b.label}
                      </span>
                      {b.earned && (
                        <span className="text-[10px] text-[var(--accent)] font-semibold">
                          Earned
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Delete account modal */}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                logout();
                setDeleteOpen(false);
              }}
            >
              Permanently Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-[var(--danger)] mb-1">
              ⚠️ This action is irreversible
            </p>
            <p className="text-sm text-[var(--danger)]/80">
              Deleting your account will permanently remove all your data,
              tasks, goals, and announcements.
            </p>
          </div>
          <Input label="Type your email to confirm" placeholder={form.email} />
        </div>
      </Modal>
    </div>
  );
}
