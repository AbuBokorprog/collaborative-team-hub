"use client";

import { useState } from "react";
import {
  CornerDownRight,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { MentionInput, MentionText } from "./MentionInput";
import { CommentInput } from "./CommentInput";
import { ReplyRow } from "./ReplyRow";

export function CommentRow({
  comment,
  currentUser,
  users,
  onEdit,
  onDelete,
  onReply,
}) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canManage =
    currentUser?.id === comment.authorId || currentUser?.role === "ADMIN";

  const handleSaveEdit = async () => {
    const trimmed = editBody.trim();
    if (!trimmed || trimmed === comment.body) {
      setEditing(false);
      return;
    }
    setSubmitting(true);
    const result = await onEdit(comment.id, trimmed);
    setSubmitting(false);
    if (result?.ok === false) {
      toast.error(result.error);
    } else {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    setShowMenu(false);
    if (!window.confirm("Delete this comment?")) return;
    const result = await onDelete(comment.id);
    if (result?.ok === false) toast.error(result.error);
  };

  return (
    <div className="group/comment min-w-0">
      <div className="flex gap-2.5 min-w-0">
        <Avatar>
          <AvatarImage src={comment?.author?.avatar} />
          <AvatarFallback>{comment?.author?.name}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* header row */}
          <div className="flex items-center justify-between gap-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="text-xs font-semibold text-foreground truncate">
                {comment.author?.name}
              </span>
              <span className="text-xs text-(--text-muted) shrink-0">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {canManage && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMenu((p) => !p)}
                  className="p-1 rounded opacity-100 sm:opacity-0 sm:group-hover/comment:opacity-100 transition-opacity hover:bg-(--surface-2)"
                  aria-label="Comment options"
                >
                  <MoreHorizontal className="w-3.5 h-3.5 text-(--text-muted)" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl border border-border bg-(--surface) shadow-(--shadow) p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setEditing(true);
                          setEditBody(comment.body);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-(--surface-2)"
                      >
                        <Pencil className="w-3 h-3 shrink-0" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="w-3 h-3 shrink-0" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* body / inline edit */}
          {editing ? (
            <div className="mt-1 flex gap-1.5 min-w-0">
              <MentionInput
                value={editBody}
                onChange={setEditBody}
                users={users}
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-border bg-(--surface-2) focus:outline-none focus:border-accent resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    setEditing(false);
                    setEditBody(comment.body);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={submitting}
                className="shrink-0 p-1.5 rounded-lg bg-accent text-white disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditBody(comment.body);
                }}
                className="shrink-0 p-1.5 rounded-lg hover:bg-(--surface-2) text-(--text-muted)"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-(--text-secondary) mt-0.5 leading-relaxed wrap-break-word">
              <MentionText text={comment.body} />
            </p>
          )}

          {/* reply toggle */}
          <button
            type="button"
            onClick={() => setShowReplyInput((p) => !p)}
            className="mt-1 flex items-center gap-1 text-xs text-(--text-muted) hover:text-accent transition-colors"
          >
            <CornerDownRight className="w-3 h-3" />
            {showReplyInput ? "Cancel reply" : "Reply"}
          </button>

          {/* nested replies */}
          {(comment.replies || []).length > 0 && (
            <div className="mt-2 pl-3 border-l-2 border-border space-y-2.5">
              {(comment.replies || []).map((reply) => (
                <ReplyRow
                  key={reply.id}
                  reply={reply}
                  currentUser={currentUser}
                  users={users}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {/* reply input */}
          {showReplyInput && (
            <div className="mt-2 pl-3 border-l-2 border-(--accent)/40">
              <CommentInput
                users={users}
                placeholder={`Reply to ${comment.author?.name}… use @name to mention`}
                autoFocus
                onSubmit={async (body) => {
                  const result = await onReply(comment.id, body);
                  if (result?.ok === false) {
                    toast.error(result.error);
                  } else {
                    setShowReplyInput(false);
                  }
                }}
                onCancel={() => setShowReplyInput(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
