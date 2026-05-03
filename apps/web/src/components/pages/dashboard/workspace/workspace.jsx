"use client";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import Header from "@/components/common/header";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import WorkspaceHeader from "./WorkspaceHeader";
import OverviewTab from "./OverviewTab";
import MembersTab from "./MembersTab";
import SettingsTab from "./SettingsTab";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "MEMBER", label: "Member" },
];

export default function Workspace() {
  const {
    activeWorkspace,
    createWorkspace,
    inviteMember,
    loadWorkspaceActivity,
    loadWorkspaceDetails,
    updateWorkspace,
    workspaceActivity,
    workspaceStats,
    workspaces,
    users,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createWsOpen, setCreateWsOpen] = useState(false);

  const {
    formState: { isSubmitting: creatingWs },
    handleSubmit: handleCreateWsSubmit,
    register: registerCreateWs,
    reset: resetCreateWs,
  } = useForm({ defaultValues: { name: "", description: "" } });

  const {
    formState: { isSubmitting: inviting },
    control: inviteControl,
    handleSubmit: handleInviteSubmit,
    register: registerInvite,
    reset: resetInvite,
    setValue: setInviteValue,
  } = useForm({ defaultValues: { email: "", role: "MEMBER" } });

  const {
    formState: { isSubmitting: savingWorkspace },
    handleSubmit: handleWorkspaceSubmit,
    register: registerWorkspace,
    reset: resetWorkspace,
  } = useForm({
    defaultValues: {
      name: activeWorkspace?.name || "",
      description: activeWorkspace?.description || "",
    },
  });

  const inviteRole = useWatch({ control: inviteControl, name: "role" });

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    resetWorkspace({
      name: activeWorkspace.name || "",
      description: activeWorkspace.description || "",
    });
    loadWorkspaceDetails(activeWorkspace.id).then((result) => {
      if (result?.ok === false) toast.error(result.error);
    });
    loadWorkspaceActivity(activeWorkspace.id);
  }, [
    activeWorkspace,
    loadWorkspaceActivity,
    loadWorkspaceDetails,
    resetWorkspace,
  ]);

  const handleCreateWorkspace = async (values) => {
    const result = await createWorkspace(values);
    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }
    toast.success("Workspace created");
    resetCreateWs();
    setCreateWsOpen(false);
  };

  const handleInvite = async (values) => {
    const result = await inviteMember(values);
    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }
    toast.success("Member invited");
    resetInvite();
    setInviteOpen(false);
  };

  const handleSaveWorkspace = async (values) => {
    const result = await updateWorkspace(values);
    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }
    toast.success("Workspace updated");
  };

  const stats = [
    {
      label: "Members",
      value: workspaceStats?.members ?? users.length,
      icon: "👥",
    },
    { label: "Projects", value: workspaces?.length, icon: "📁" },
    { label: "Tasks", value: workspaceStats?.tasks ?? 0, icon: "✅" },
    { label: "Goals", value: workspaceStats?.goals ?? 0, icon: "🎯" },
  ];

  const isAdmin = activeWorkspace?.role === "ADMIN";

  return (
    <>
      <div className="space-y-6 animate-slide-in">
        <Header
          title="Workspace"
          subtitle={`${activeWorkspace?.name} · ${activeWorkspace?.plan} Plan`}
        />

        <WorkspaceHeader
          activeWorkspace={activeWorkspace}
          users={users}
          stats={stats}
          isAdmin={isAdmin}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onInvite={() => setInviteOpen(true)}
        />

        {activeTab === "overview" && (
          <OverviewTab
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            workspaceActivity={workspaceActivity}
            users={users}
            onCreateWorkspace={() => setCreateWsOpen(true)}
          />
        )}
        {activeTab === "members" && (
          <MembersTab
            users={users}
            isAdmin={isAdmin}
            onInvite={() => setInviteOpen(true)}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            registerWorkspace={registerWorkspace}
            handleWorkspaceSubmit={handleWorkspaceSubmit}
            onSave={handleSaveWorkspace}
            saving={savingWorkspace}
          />
        )}
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={inviting}
              onClick={handleInviteSubmit(handleInvite)}
            >
              Send Invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            {...registerInvite("email", { required: true })}
            placeholder="colleague@company.com"
          />
          <Select
            value={inviteRole}
            onValueChange={(value) => setInviteValue("role", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="bg-[var(--surface-2)] rounded-xl p-3">
            <p className="text-xs text-[var(--text-muted)]">
              They&apos;ll receive an email invitation to join{" "}
              <strong className="text-[var(--text-primary)]">
                {activeWorkspace?.name}
              </strong>
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        open={createWsOpen}
        onClose={() => setCreateWsOpen(false)}
        title="Create New Workspace"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateWsOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={creatingWs}
              onClick={handleCreateWsSubmit(handleCreateWorkspace)}
            >
              Create Workspace
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Workspace name"
            {...registerCreateWs("name", { required: true })}
            placeholder="e.g. Marketing Team"
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Description
            </label>
            <textarea
              rows={3}
              {...registerCreateWs("description")}
              placeholder="What is this workspace for?"
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
