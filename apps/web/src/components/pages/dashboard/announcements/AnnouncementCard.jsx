"use client";

import { useState } from "react";
import {
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  Smile,
  Trash2,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

const EMOJI_OPTS = ["🎉", "🔥", "❤️", "👋", "💪", "👀", "🙌", "💬"];

export default function AnnouncementCard({
  ann,
  onReact,
  onEdit,
  onDelete,
  canManage = false,
}) {
  const [showReact, setShowReact] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const commentsCount = ann.commentsCount ?? ann.comments ?? 0;

  const handleReact = (emoji) => {
    onReact?.(ann.id, emoji);
    setShowReact(false);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(ann);
  };

  const handleDelete = () => {
    setShowMenu(false);

    const confirmed = window.confirm("Delete this announcement?");

    if (confirmed) {
      onDelete?.(ann.id);
    }
  };

  const isActiveReaction = (emoji) => ann.myReaction === emoji;

  return (
    <Card
      className={`transition-all ${
        ann.pinned ? "border-(--accent)/30 bg-(--accent-soft)/20" : ""
      }`}
    >
      {ann.pinned && <PinnedBanner />}

      <div className="flex items-start gap-3">
        <Avatar user={ann.author} size="md" />

        <div className="flex-1 min-w-0">
          <Header
            ann={ann}
            canManage={canManage}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <h3 className="font-semibold text-base text-[var(--text-primary)] mt-2 mb-1.5">
            {ann.title}
          </h3>

          <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
            {ann.content}
          </p>

          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(ann.reactions || {}).map(([emoji, count]) => (
                <ReactionButton
                  key={emoji}
                  emoji={emoji}
                  count={count}
                  active={isActiveReaction(emoji)}
                  onClick={() => handleReact(emoji)}
                />
              ))}

              <ReactionPicker
                open={showReact}
                setOpen={setShowReact}
                onSelect={handleReact}
                activeReaction={ann.myReaction}
              />
            </div>

            <CommentsButton count={commentsCount} />
          </div>
        </div>
      </div>
    </Card>
  );
}

/* -------------------------------- */

function PinnedBanner() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-accent font-medium mb-3">
      <Pin className="w-3 h-3" />
      Pinned announcement
    </div>
  );
}

function Header({ ann, canManage, showMenu, setShowMenu, onEdit, onDelete }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-[var(--text-primary)]">
            {ann.author?.name}
          </span>

          {ann.author?.role && (
            <span className="text-xs text-[var(--text-muted)]">
              {ann.author.role}
            </span>
          )}

          <span className="text-xs text-[var(--text-muted)]">·</span>

          <span className="text-xs text-[var(--text-muted)]">
            {formatDate(ann.createdAt)}
          </span>
        </div>

        {ann.audience && ann.audience !== "All" && (
          <Badge color="info" className="mt-1">
            → {ann.audience}
          </Badge>
        )}
      </div>

      {canManage && (
        <ManageMenu
          open={showMenu}
          setOpen={setShowMenu}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

function ManageMenu({ open, setOpen, onEdit, onDelete }) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]"
      >
        <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] p-1">
            <button
              onClick={onEdit}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--surface-2)]"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>

            <button
              onClick={onDelete}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ReactionButton({ emoji, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors border
      ${
        active
          ? "bg-blue-100 text-blue-700 border-blue-300"
          : "bg-[var(--surface-2)] border-transparent hover:bg-[var(--border)]"
      }`}
    >
      <span>{emoji}</span>
      <span className="text-xs font-medium">{count}</span>
    </button>
  );
}

function ReactionPicker({ open, setOpen, onSelect, activeReaction }) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)]"
      >
        <Smile className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute left-0 bottom-full mb-1 z-20 flex gap-1 p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
            {EMOJI_OPTS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className={`p-1.5 rounded-lg text-lg ${
                  activeReaction === emoji
                    ? "bg-blue-100 ring-1 ring-blue-300"
                    : "hover:bg-[var(--surface-2)]"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CommentsButton({ count }) {
  return (
    <button className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
      <MessageCircle className="w-3.5 h-3.5" />
      {count} {count === 1 ? "comment" : "comments"}
    </button>
  );
}
