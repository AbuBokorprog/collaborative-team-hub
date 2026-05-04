"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";

export function MentionText({ text = "" }) {
  const parts = text.split(/(@[\w.]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="text-accent font-medium">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

export function MentionInput({
  value,
  onChange,
  users = [],
  placeholder,
  autoFocus,
  className,
  onKeyDown,
}) {
  const [mentionQuery, setMentionQuery] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const textareaRef = useRef(null);

  const filtered =
    mentionQuery !== null
      ? users
          .filter(
            (u) =>
              u.name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
              u.email?.toLowerCase().startsWith(mentionQuery.toLowerCase()),
          )
          .slice(0, 6)
      : [];

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);

    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const match = textBefore.match(/@([\w.]*)$/);

    if (match) {
      setMentionQuery(match[1]);
      setSelectedIdx(0);
    } else {
      setMentionQuery(null);
    }
  };

  const insertMention = (user) => {
    const ta = textareaRef.current;
    if (!ta) return;

    const cursor = ta.selectionStart;
    const before = value.slice(0, cursor);
    const after = value.slice(cursor);
    const replaced = before.replace(/@([\w.]*)$/, `@${user.name} `);
    onChange(replaced + after);
    setMentionQuery(null);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(replaced.length, replaced.length);
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (mentionQuery !== null && filtered.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => (i + 1) % filtered.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => (i - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filtered[selectedIdx]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        return;
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div className="relative flex-1 min-w-0">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={1}
        className={className}
        style={{ overflowY: "hidden" }}
        onInput={(e) => {
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      />

      {mentionQuery !== null && filtered.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setMentionQuery(null)}
          />
          <div className="absolute z-30 bottom-full mb-1 left-0 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-(--surface) shadow-(--shadow) py-1 overflow-hidden">
            {filtered.map((user, idx) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(user);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors ${
                  idx === selectedIdx
                    ? "bg-accent text-white"
                    : "hover:bg-(--surface-2)"
                }`}
              >
                <Avatar user={user} size="xs" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{user.name}</div>
                  <div
                    className={`text-xs truncate ${
                      idx === selectedIdx
                        ? "text-white/70"
                        : "text-(--text-muted)"
                    }`}
                  >
                    {user.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
