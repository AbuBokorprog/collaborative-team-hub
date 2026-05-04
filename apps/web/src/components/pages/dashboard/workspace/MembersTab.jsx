"use client";
import { Plus, Crown, Mail, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ROLE_COLORS = {
  ADMIN: "accent",
  MANAGER: "warning",
  MEMBER: "info",
  "Product Lead": "accent",
  Designer: "danger",
  Engineer: "info",
  Marketing: "warning",
};

export default function MembersTab({ users, isAdmin, onInvite }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {users.length} members
        </p>
        {isAdmin && (
          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={onInvite}
          >
            Invite member
          </Button>
        )}
      </div>
      <Card>
        <div className="space-y-1">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--surface)] ${user.online ? "bg-[var(--success)]" : "bg-[var(--border-strong)]"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-[var(--text-primary)]">
                    {user.name}
                  </p>
                  {user.id === 1 && (
                    <Crown className="w-3.5 h-3.5 text-[var(--warning)]" />
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
              </div>
              <Badge color={ROLE_COLORS[user.role] || "neutral"}>
                {user.role}
              </Badge>
              {isAdmin && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)]">
                    <Mail className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)]">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
