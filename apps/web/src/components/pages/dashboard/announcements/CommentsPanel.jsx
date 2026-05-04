"use client";

import { toast } from "sonner";
import { CommentRow } from "./CommentRow";
import { CommentInput } from "./CommentInput";

export function CommentsPanel({
  comments,
  currentUser,
  users,
  onComment,
  onEditComment,
  onDeleteComment,
  onReply,
}) {
  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4">
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              users={users}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              onReply={onReply}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-(--text-muted) text-center py-2">
          No comments yet. Be the first to comment!
        </p>
      )}

      <CommentInput
        users={users}
        placeholder="Write a comment… use @name to mention"
        onSubmit={async (body) => {
          const result = await onComment(body);
          if (result?.ok === false) toast.error(result.error);
        }}
      />
    </div>
  );
}
