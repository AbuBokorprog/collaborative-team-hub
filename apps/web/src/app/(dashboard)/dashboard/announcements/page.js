"use client";

import { Pin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import Header from "@/components/common/header";
import ComposeAnnouncement from "@/components/pages/dashboard/announcements/ComposeAnnouncement";
import AnnouncementCard from "@/components/pages/dashboard/announcements/AnnouncementCard";
import { useAppStore } from "@/store/useAppStore";

export default function AnnouncementsPage() {
  const {
    activeWorkspace,
    currentUser,
    announcements,
    announcementMeta,
    announcementsLoading,
    loadAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    reactToAnnouncement,
  } = useAppStore();

  const loaderRef = useRef(null);
  const topRef = useRef(null);
  const [composing, setComposing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState("All");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const content = useWatch({
    control,
    name: "content",
  });

  useEffect(() => {
    if (!activeWorkspace?.id) return;

    loadAnnouncements(activeWorkspace.id).then((res) => {
      if (res?.ok === false) {
        toast.error(res.error);
      }
    });
  }, [activeWorkspace?.id, loadAnnouncements]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];

        if (!entry.isIntersecting) return;

        if (announcementsLoading) return;

        if (!announcementMeta) return;

        const { page, totalPages } = announcementMeta;

        if (page >= totalPages) return;

        const nextPage = page + 1;

        const result = await loadAnnouncements(
          activeWorkspace.id,
          nextPage,
          10,
          search,
        );

        if (result?.ok === false) {
          toast.error(result.error);
        }
      },
      {
        threshold: 1,
      },
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [
    activeWorkspace?.id,
    announcementsLoading,
    announcementMeta,
    loadAnnouncements,
    search,
  ]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return announcements;

    return announcements.filter(
      (item) =>
        item.title?.toLowerCase().includes(q) ||
        item.content?.toLowerCase().includes(q),
    );
  }, [search, announcements]);

  const pinned = filtered.filter((item) => item.pinned);

  const recent = filtered.filter((item) => !item.pinned);

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      content: values.content,
      audience,
    };

    const result = editingId
      ? await updateAnnouncement({
          id: editingId,
          ...payload,
        })
      : await addAnnouncement(payload);

    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }

    toast.success(editingId ? "Announcement updated" : "Announcement posted");

    resetForm();
  };

  const resetForm = () => {
    reset({
      title: "",
      content: "",
    });

    setEditingId(null);
    setComposing(false);
    setAudience("All");
  };

  const handleEdit = (ann) => {
    window.scrollTo(0, 0);
    setEditingId(ann.id);
    setComposing(true);

    setValue("title", ann.title);

    setValue("content", ann.content);

    setAudience(ann.audience || "All");

    topRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDelete = async (id) => {
    const result = await deleteAnnouncement(id);

    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }

    toast.success("Announcement deleted");
  };

  const handleReact = async (id, emoji) => {
    const result = await reactToAnnouncement(id, emoji);

    if (result?.ok === false) {
      toast.error(result.error);
    }
  };

  const canManage = (ann) => {
    return currentUser?.id === ann.authorId || currentUser?.role === "ADMIN";
  };

  return (
    <div className="space-y-6 animate-slide-in" ref={topRef}>
      <Header
        title="Announcements"
        subtitle={`${announcementMeta?.total || 0} announcements · ${pinned.length} pinned`}
      />

      {currentUser?.role === "ADMIN" && (
        <ComposeAnnouncement
          composing={composing}
          setComposing={setComposing}
          currentUser={currentUser}
          register={register}
          content={content}
          setValue={setValue}
          audience={audience}
          setAudience={setAudience}
          onPost={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          editing={!!editingId}
          onCancelEdit={resetForm}
        />
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]"
        />
      </div>

      {pinned.length > 0 && (
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
            <Pin className="w-3 h-3" />
            Pinned
          </p>

          {pinned.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              ann={ann}
              onReact={handleReact}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canManage={canManage(ann)}
            />
          ))}
        </section>
      )}

      <section className="space-y-3">
        {recent.map((ann) => (
          <AnnouncementCard
            key={ann.id}
            ann={ann}
            onReact={handleReact}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canManage={canManage(ann)}
          />
        ))}
      </section>

      {/* LOAD MORE TRIGGER */}
      {announcementMeta?.page < announcementMeta?.totalPages && (
        <div
          ref={loaderRef}
          className="py-8 text-center text-sm text-[var(--text-muted)]"
        >
          {announcementsLoading ? "Loading more..." : "Scroll to load more"}
        </div>
      )}

      {/* EMPTY */}
      {filtered.length === 0 && !announcementsLoading && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📢</p>
          <h3 className="font-semibold">No announcements found</h3>
        </div>
      )}
    </div>
  );
}
