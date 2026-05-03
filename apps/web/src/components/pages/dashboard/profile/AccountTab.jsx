"use client";
import { Lock, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Section, SettingRow } from "./ProfileShared";

export default function AccountTab({
  form,
  update,
  showPass,
  setShowPass,
  passwordForm,
  updatePasswordField,
  changingPassword,
  handleChangePassword,
  setDeleteOpen,
}) {
  return (
    <div className="space-y-5">
      <Card>
        <Section title="Account Settings" description="Manage your login credentials and workspace preferences." />
        <div className="mt-5 space-y-0">
          <SettingRow label="Email address" description="Used for login and notifications">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">{form.email}</span>
              <button className="text-xs text-[var(--accent)] hover:underline">Change</button>
            </div>
          </SettingRow>
          <SettingRow label="Timezone" description="Your local timezone for scheduling">
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
        <Section title="Password" description="Keep your account secure with a strong password." />
        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">Current password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={passwordForm.oldPassword}
                onChange={(e) => updatePasswordField("oldPassword", e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => updatePasswordField("newPassword", e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="Confirm password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => updatePasswordField("confirmPassword", e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            size="sm"
            loading={changingPassword}
            icon={!changingPassword && <Lock className="w-3.5 h-3.5" />}
            onClick={handleChangePassword}
          >
            {changingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Card>

      <Card>
        <Section title="Two-Factor Authentication" description="Add an extra layer of security to your account." />
        <div className="mt-5">
          <SettingRow label="Authenticator app" description="Use an app like 1Password or Google Authenticator">
            <Button variant="outline" size="sm">Enable 2FA</Button>
          </SettingRow>
          <SettingRow label="SMS backup" description="Receive a code via SMS as backup">
            <Button variant="secondary" size="sm">Add phone</Button>
          </SettingRow>
        </div>
      </Card>

      <Card className="border-[var(--danger)]/20">
        <Section title="Danger Zone" description="Irreversible actions. Proceed with caution." />
        <div className="mt-5 space-y-0">
          <SettingRow label="Deactivate account" description="Temporarily disable your account. You can reactivate anytime.">
            <Button variant="outline" size="sm">Deactivate</Button>
          </SettingRow>
          <SettingRow label="Delete account" description="Permanently delete your account and all associated data.">
            <Button variant="danger" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </SettingRow>
        </div>
      </Card>
    </div>
  );
}
