"use client";
import {
  Plus,
  Pin,
  MessageCircle,
  Smile,
  Bold,
  Italic,
  Link,
  AtSign,
  X,
  Search,
} from "lucide-react";
import { useState } from "react";

import Header from "@/components/common/header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const AUDIENCES = ["All", "Engineering", "Design", "Marketing", "Leadership"];
const EMOJI_OPTS = ["🎉", "🔥", "❤️", "👋", "💪", "👀", "🙌", "💬"];

function AnnouncementCard({ ann, onReact }) {
  const [showReact, setShowReact] = useState(false);

  return (
    <Card
      className={`transition-all ${ann.pinned ? "border-(--accent)/30 bg-(--accent-soft)/20" : ""}`}
    >
      {ann.pinned && (
        <div className="flex items-center gap-1.5 text-xs text-accent font-medium mb-3">
          <Pin className="w-3 h-3" /> Pinned announcement
        </div>
      )}
      <div className="flex items-start gap-3">
        <Avatar user={ann.author} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-[var(--text-primary)]">
                  {ann.author.name}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {ann.author.role}
                </span>
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
          </div>

          <h3 className="font-semibold text-[var(--text-primary)] mt-2 mb-1.5 text-base">
            {ann.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {ann.content}
          </p>

          {/* Reactions + actions */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(ann.reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(ann.id, emoji)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] text-sm transition-colors"
                >
                  {emoji}{" "}
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {count}
                  </span>
                </button>
              ))}
              <div className="relative">
                <button
                  onClick={() => setShowReact(!showReact)}
                  className="p-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text-muted)] transition-colors"
                >
                  <Smile className="w-3.5 h-3.5" />
                </button>
                {showReact && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowReact(false)}
                    />
                    <div className="absolute left-0 bottom-full mb-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-2 shadow-[var(--shadow)] z-20 flex gap-1">
                      {EMOJI_OPTS.map((e) => (
                        <button
                          key={e}
                          onClick={() => {
                            onReact(ann.id, e);
                            setShowReact(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-lg transition-colors"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] ml-auto transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> {ann.comments}{" "}
              {ann.comments === 1 ? "comment" : "comments"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function RichEditor({ value, onChange }) {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);

  const toolbarBtns = [
    {
      icon: <Bold className="w-3.5 h-3.5" />,
      action: () => setBold(!bold),
      active: bold,
      title: "Bold",
    },
    {
      icon: <Italic className="w-3.5 h-3.5" />,
      action: () => setItalic(!italic),
      active: italic,
      title: "Italic",
    },
    {
      icon: <AtSign className="w-3.5 h-3.5" />,
      action: () => onChange(`${value}@`),
      title: "Mention",
    },
    { icon: <Link className="w-3.5 h-3.5" />, action: () => {}, title: "Link" },
  ];

  return (
    <div className="border border-[var(--border)] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-transparent">
      {/* Toolbar */}
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
        <div className="ml-auto text-xs text-[var(--text-muted)]">
          {value.length}/2000
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Share an update with your team... Use @ to mention someone"
        rows={5}
        maxLength={2000}
        className="w-full bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none focus:outline-none"
        style={{
          fontWeight: bold ? 700 : 400,
          fontStyle: italic ? "italic" : "normal",
        }}
      />
    </div>
  );
}

export default function AnnouncementsPage() {
  const { announcements, addAnnouncement, currentUser } = useAppStore();
  const [anns, setAnns] = useState(announcements);
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = anns.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()),
  );

  const handlePost = () => {
    if (!title.trim() || !content.trim()) {return;}
    const newAnn = {
      id: `a${Date.now()}`,
      title,
      content,
      author: currentUser,
      createdAt: new Date().toISOString(),
      pinned: false,
      reactions: {},
      comments: 0,
      audience,
    };
    setAnns([newAnn, ...anns]);
    setTitle("");
    setContent("");
    setComposing(false);
  };

  const handleReact = (annId, emoji) => {
    setAnns((prev) =>
      prev.map((a) => {
        if (a.id !== annId) {return a;}
        const reactions = { ...a.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...a, reactions };
      }),
    );
  };

  const pinned = filtered.filter((a) => a.pinned);
  const rest = filtered.filter((a) => !a.pinned);

  return (
    <>
      <div className="space-y-6 animate-slide-in">
        <Header
          title="Announcements"
          subtitle={`${anns.length} announcements · ${pinned.length} pinned`}
        />
        {/* Compose */}
        {!composing ? (
          <Card>
            <div className="flex items-center gap-3">
              <Avatar user={currentUser} size="md" />
              <button
                onClick={() => setComposing(true)}
                className="flex-1 text-left px-4 py-2.5 bg-[var(--surface-2)] rounded-xl text-sm text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
              >
                Share an update with your team...
              </button>
              <Button
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setComposing(true)}
              >
                New Post
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="border-[var(--accent)]/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">
                New Announcement
              </h3>
              <button
                onClick={() => setComposing(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title..."
                className="w-full text-lg font-semibold bg-transparent border-b border-[var(--border)] pb-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <RichEditor value={content} onChange={setContent} />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-muted)]">
                    Audience:
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {AUDIENCES.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAudience(a)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${audience === a ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--border)]"}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" onClick={() => setComposing(false)}>
                  Discard
                </Button>
                <Button
                  onClick={handlePost}
                  disabled={!title.trim() || !content.trim()}
                >
                  Post Announcement
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
          />
        </div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
              <Pin className="w-3 h-3" /> Pinned
            </p>
            {pinned.map((ann) => (
              <AnnouncementCard key={ann.id} ann={ann} onReact={handleReact} />
            ))}
          </div>
        )}

        {/* All */}
        <div className="space-y-3">
          {pinned.length > 0 && (
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Recent
            </p>
          )}
          {rest.map((ann) => (
            <AnnouncementCard key={ann.id} ann={ann} onReact={handleReact} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📢</p>
            <h3 className="font-semibold text-[var(--text-primary)]">
              No announcements found
            </h3>
          </div>
        )}
      </div>
    </>
  );
}
