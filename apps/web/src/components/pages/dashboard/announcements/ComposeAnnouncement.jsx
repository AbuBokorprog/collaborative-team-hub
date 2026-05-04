"use client";
import { Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import RichEditor from "./RichEditor";

const AUDIENCES = ["All", "Engineering", "Design", "Marketing", "Leadership"];

export default function ComposeAnnouncement({
  composing,
  setComposing,
  currentUser,
  register,
  content,
  setValue,
  audience,
  setAudience,
  onPost,
  isSubmitting,
}) {
  if (!composing) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback>{currentUser?.name}</AvatarFallback>
          </Avatar>
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
    );
  }

  return (
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
          {...register("title", { required: true })}
          placeholder="Announcement title..."
          className="w-full text-lg font-semibold bg-transparent border-b border-[var(--border)] pb-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <RichEditor
          value={content}
          onChange={(value) => setValue("content", value)}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-muted)]">Audience:</span>
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
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" onClick={() => setComposing(false)}>
            Discard
          </Button>
          <Button
            onClick={onPost}
            disabled={!content?.trim()}
            loading={isSubmitting}
          >
            Post Announcement
          </Button>
        </div>
      </div>
    </Card>
  );
}
