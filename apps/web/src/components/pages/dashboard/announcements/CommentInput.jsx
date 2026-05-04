"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";
import { MentionInput } from "./MentionInput";

export function CommentInput({
  users = [],
  placeholder = "Write a comment… use @name to mention",
  onSubmit,
  autoFocus = false,
  onCancel,
}) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSubmitting(true);
    await onSubmit(trimmed);
    setSubmitting(false);
    setBody("");
  };

  return (
    <div className="flex gap-2 items-center mt-1">
      <MentionInput
        value={body}
        onChange={setBody}
        users={users}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="flex-1 text-sm px-3 py-2 rounded-xl border border-border bg-(--surface-2) focus:outline-none focus:border-accent resize-none min-h-9.5 max-h-32 transition-colors w-full"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape" && onCancel) onCancel();
        }}
      />

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 p-1.5 rounded-lg hover:bg-(--surface-2) text-(--text-muted)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!body.trim() || submitting}
        className="shrink-0 p-2 rounded-xl bg-accent text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
