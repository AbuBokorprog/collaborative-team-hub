"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  Smile,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { CommentsPanel } from "./CommentsPanel";

const EMOJI_OPTS = ["🎉", "🔥", "❤️", "👋", "💪", "👀", "🙌", "💬"];

export default function AnnouncementCard({
  ann,
  onReact,
  onEdit,
  onDelete,
  canManage = false,
}) {
  const {
    currentUser,
    users,
    announcementComments,
    loadAnnouncementComments,
    commentOnAnnouncement,
    editComment,
    deleteComment,
    replyToComment,
  } = useAppStore();

  const [showReact, setShowReact] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const comments = announcementComments[ann.id] || [];
  const commentsCount =
    ann.commentsCount ?? ann._count?.comments ?? ann.comments ?? 0;

  const handleReact = (emoji) => {
    onReact?.(ann.id, emoji);
    setShowReact(false);
  };

  const toggleComments = async () => {
    setShowComments((p) => !p);
    if (!commentsLoaded) {
      setCommentsLoaded(true);
      await loadAnnouncementComments(ann.id);
    }
  };

  return (
    <Card
      className={`transition-all ${
        ann.pinned ? "border-(--accent)/30 bg-(--accent-soft)/20" : ""
      }`}
    >
      {ann.pinned && <PinnedBanner />}

      <div className="flex items-start gap-3 min-w-0">
        <Avatar>
          <AvatarImage src={ann?.author?.avatar} />
          <AvatarFallback>{ann?.author?.name}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <CardHeader
            ann={ann}
            canManage={canManage}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onEdit={() => {
              setShowMenu(false);
              onEdit?.(ann);
            }}
            onDelete={() => {
              setShowMenu(false);
              if (window.confirm("Delete this announcement?"))
                onDelete?.(ann.id);
            }}
          />

          <h3 className="font-semibold text-base text-foreground mt-2 mb-1.5 wrap-break-word">
            {ann.title}
          </h3>

          <p className="text-sm leading-relaxed text-(--text-secondary) whitespace-pre-wrap wrap-break-word">
            {ann.content}
          </p>

          {/* reactions + comment toggle */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
              {Object.entries(ann.reactions || {}).map(([emoji, count]) => (
                <ReactionChip
                  key={emoji}
                  emoji={emoji}
                  count={count}
                  active={ann.myReaction === emoji}
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

            <button
              type="button"
              onClick={toggleComments}
              className="shrink-0 flex items-center gap-1.5 text-xs text-(--text-muted) hover:text-(--text-secondary) transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>
                {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
              </span>
              {showComments ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {showComments && (
            <CommentsPanel
              comments={comments}
              currentUser={currentUser}
              users={users}
              onComment={(body) => commentOnAnnouncement(ann.id, body)}
              onEditComment={(commentId, body) =>
                editComment(ann.id, commentId, body)
              }
              onDeleteComment={(commentId) => deleteComment(ann.id, commentId)}
              onReply={(commentId, body) =>
                replyToComment(ann.id, commentId, body)
              }
            />
          )}
        </div>
      </div>
    </Card>
  );
}

/* ── sub-components ─────────────────────────────── */

function PinnedBanner() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-accent font-medium mb-3">
      <Pin className="w-3 h-3 shrink-0" />
      Pinned announcement
    </div>
  );
}

function CardHeader({
  ann,
  canManage,
  showMenu,
  setShowMenu,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex items-start justify-between gap-2 min-w-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground truncate">
            {ann.author?.name}
          </span>
          {ann.author?.role && (
            <span className="text-xs text-(--text-muted) shrink-0">
              {ann.author.role}
            </span>
          )}
          <span className="text-xs text-(--text-muted)">·</span>
          <span className="text-xs text-(--text-muted) shrink-0">
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
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowMenu((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-(--surface-2)"
            aria-label="Announcement options"
          >
            <MoreHorizontal className="w-4 h-4 text-(--text-muted)" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl border border-border bg-(--surface) shadow-(--shadow) p-1">
                <button
                  type="button"
                  onClick={onEdit}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-(--surface-2)"
                >
                  <Pencil className="w-4 h-4 shrink-0" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ReactionChip({ emoji, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors border ${
        active
          ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700"
          : "bg-(--surface-2) border-transparent hover:bg-border"
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
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="p-1.5 rounded-lg bg-(--surface-2) hover:bg-border"
        aria-label="Add reaction"
      >
        <Smile className="w-3.5 h-3.5 text-(--text-muted)" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 bottom-full mb-1 z-20 flex gap-1 p-2 rounded-xl border border-border bg-(--surface) shadow-(--shadow) flex-wrap max-w-[calc(100vw-2rem)]">
            {EMOJI_OPTS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onSelect(emoji)}
                className={`p-1.5 rounded-lg text-lg transition-colors ${
                  activeReaction === emoji
                    ? "bg-blue-100 ring-1 ring-blue-300 dark:bg-blue-900/40"
                    : "hover:bg-(--surface-2)"
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
