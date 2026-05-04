"use client";
import { X, Save, Check, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Section } from "./ProfileShared";

export default function ProfileTab({
  form,
  update,
  editMode,
  setEditMode,
  saved,
  handleSave,
}) {
  return (
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

        {/* <Textarea
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
        </div> */}

        {/* <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Social Links</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">GitHub</label>
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
              <label className="text-sm font-medium text-[var(--text-primary)]">Twitter / X</label>
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
        </div> */}
      </div>
    </Card>
  );
}
