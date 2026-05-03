"use client";
import { Bold, Italic, Link, AtSign } from "lucide-react";
import { useState } from "react";

export default function RichEditor({ value, onChange }) {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  const toolbarBtns = [
    { icon: <Bold className="w-3.5 h-3.5" />, action: () => setBold(!bold), active: bold, title: "Bold" },
    { icon: <Italic className="w-3.5 h-3.5" />, action: () => setItalic(!italic), active: italic, title: "Italic" },
    { icon: <AtSign className="w-3.5 h-3.5" />, action: () => onChange(`${value}@`), title: "Mention" },
    { icon: <Link className="w-3.5 h-3.5" />, action: () => {}, title: "Link" },
  ];

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-transparent">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--border)] bg-[var(--surface-2)]">
        {toolbarBtns.map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            title={btn.title}
            className={`p-1.5 rounded-md transition-colors ${btn.active ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"}`}
          >
            {btn.icon}
          </button>
        ))}
        <div className="ml-auto text-xs text-[var(--text-muted)]">{value.length}/2000</div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share an update with your team... Use @ to mention someone"
        rows={5}
        maxLength={2000}
        className="w-full bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none"
        style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal" }}
      />
    </div>
  );
}
