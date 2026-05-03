"use client";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";

export default function SettingsTab({ registerWorkspace, handleWorkspaceSubmit, onSave, saving }) {
  return (
    <div className="space-y-4 animate-fade-in max-w-2xl">
      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Workspace Settings</h3>
        <div className="space-y-4">
          <Input label="Workspace name" {...registerWorkspace("name", { required: true })} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">Description</label>
            <textarea
              rows={3}
              {...registerWorkspace("description")}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            />
          </div>
          <Button loading={saving} onClick={handleWorkspaceSubmit(onSave)}>Save Changes</Button>
        </div>
      </Card>

      <Card className="border-[var(--danger)]/30">
        <h3 className="font-semibold text-[var(--danger)] mb-2">Danger Zone</h3>
        <p className="text-sm text-[var(--text-muted)] mb-4">Once you delete a workspace, there is no going back.</p>
        <Button variant="danger" size="sm" icon={<Trash2 className="w-4 h-4" />}>Delete Workspace</Button>
      </Card>
    </div>
  );
}
