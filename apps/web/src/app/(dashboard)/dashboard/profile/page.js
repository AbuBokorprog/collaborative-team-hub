"use client";
import { Award, CheckSquare, Megaphone, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Header from "@/components/common/header";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/services/auth-api";
import { useAppStore } from "@/store/useAppStore";
import ProfileSidebar from "@/components/pages/dashboard/profile/ProfileSidebar";
import ProfileTab from "@/components/pages/dashboard/profile/ProfileTab";
import AccountTab from "@/components/pages/dashboard/profile/AccountTab";
import NotificationsTab from "@/components/pages/dashboard/profile/NotificationsTab";
import AppearanceTab from "@/components/pages/dashboard/profile/AppearanceTab";
import ActivityTab from "@/components/pages/dashboard/profile/ActivityTab";

export default function ProfilePage() {
  const { currentUser, theme, toggleTheme, logout } = useAppStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
    emailMentions: true, emailTasks: true, emailGoals: false, emailWeekly: true,
    pushMentions: true, pushTasks: false, pushAnnouncements: true, desktopSound: false,
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updatePasswordField = (key, value) => setPasswordForm((f) => ({ ...f, [key]: value }));
  const toggleNotif = (k) => setNotifSettings((s) => ({ ...s, [k]: !s[k] }));

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditMode(false); }, 1500);
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
      await authApi.changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (error) {
      toast.error(error.message || "Unable to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const stats = [
    { label: "Tasks Completed", value: 18, icon: <CheckSquare className="w-4 h-4" />, color: "var(--accent)", bg: "var(--accent-soft)" },
    { label: "Goals Owned", value: 4, icon: <Target className="w-4 h-4" />, color: "var(--success)", bg: "var(--success-soft)" },
    { label: "Announcements", value: 3, icon: <Megaphone className="w-4 h-4" />, color: "var(--warning)", bg: "var(--warning-soft)" },
    { label: "Days Active", value: 47, icon: <Award className="w-4 h-4" />, color: "var(--info)", bg: "var(--info-soft)" },
  ];

  const recentActivity = [
    { icon: <CheckSquare className="w-3.5 h-3.5" />, iconBg: "var(--success-soft)", iconColor: "var(--success)", title: 'Completed "Q1 Dashboard redesign"', subtitle: "Tasks · Design", time: "2h ago", badge: { label: "Done", color: "success" } },
    { icon: <Target className="w-3.5 h-3.5" />, iconBg: "var(--accent-soft)", iconColor: "var(--accent)", title: 'Updated goal "Platform v2" to 68%', subtitle: "Goals", time: "5h ago", badge: { label: "On Track", color: "success" } },
    { icon: <Megaphone className="w-3.5 h-3.5" />, iconBg: "var(--warning-soft)", iconColor: "var(--warning)", title: 'Posted "Q1 Planning Week Kickoff"', subtitle: "Announcements · All team", time: "1d ago" },
    { icon: <CheckSquare className="w-3.5 h-3.5" />, iconBg: "var(--info-soft)", iconColor: "var(--info)", title: 'Moved "Onboarding flow" to In Progress', subtitle: "Tasks · Product", time: "2d ago", badge: { label: "In Progress", color: "warning" } },
    { icon: <Target className="w-3.5 h-3.5" />, iconBg: "var(--accent-soft)", iconColor: "var(--accent)", title: 'Created goal "Team Growth to 20 FTEs"', subtitle: "Goals", time: "3d ago" },
    { icon: <CheckSquare className="w-3.5 h-3.5" />, iconBg: "var(--success-soft)", iconColor: "var(--success)", title: 'Completed "User analytics events"', subtitle: "Tasks · Product", time: "5d ago", badge: { label: "Done", color: "success" } },
  ];

  return (
    <div className="animate-slide-in space-y-4">
      <Header title="Profile" subtitle="Manage your account, preferences, and activity" />

      <div className="flex flex-col lg:flex-row gap-6">
        <ProfileSidebar
          currentUser={currentUser}
          form={form}
          stats={stats}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          logout={logout}
        />

        <div className="flex-1 min-w-0 space-y-5">
          {activeTab === "profile" && (
            <ProfileTab form={form} update={update} editMode={editMode} setEditMode={setEditMode} saved={saved} handleSave={handleSave} />
          )}
          {activeTab === "account" && (
            <AccountTab
              form={form}
              update={update}
              showPass={showPass}
              setShowPass={setShowPass}
              passwordForm={passwordForm}
              updatePasswordField={updatePasswordField}
              changingPassword={changingPassword}
              handleChangePassword={handleChangePassword}
              setDeleteOpen={setDeleteOpen}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationsTab notifSettings={notifSettings} toggleNotif={toggleNotif} />
          )}
          {activeTab === "appearance" && (
            <AppearanceTab theme={theme} toggleTheme={toggleTheme} />
          )}
          {activeTab === "activity" && (
            <ActivityTab stats={stats} recentActivity={recentActivity} />
          )}
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => { logout(); setDeleteOpen(false); }}
            >
              Permanently Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="bg-[var(--danger-soft)] border border-[var(--danger)]/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-[var(--danger)] mb-1">⚠️ This action is irreversible</p>
            <p className="text-sm text-[var(--danger)]/80">
              Deleting your account will permanently remove all your data, tasks, goals, and announcements.
            </p>
          </div>
          <Input label="Type your email to confirm" placeholder={form.email} />
        </div>
      </Modal>
    </div>
  );
}
