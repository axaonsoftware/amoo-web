"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, X, Loader2, Search } from "lucide-react";
import { api } from "@/lib/api";
import { sanitize } from "@/lib/sanitize";

type Expert = {
  id: number;
  name: string;
  avatar: string | null;
  role_title: string | null;
  specialties: string | null;
  rating: number | null;
};

type ExpertApiResponse = {
  data?: Expert[];
};

export default function StartChatButton({
  variant = "primary",
  className = "",
}: {
  variant?: "primary" | "secondary" | "icon";
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [startingId, setStartingId] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await api.getExperts()) as ExpertApiResponse;
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? (res as unknown as Expert[])
          : [];
      setExperts(list);
    } catch (e: unknown) {
      setError((e as Error)?.message || "Failed to load experts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchExperts();
      setSearch("");
    }
  }, [open, fetchExperts]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open]);

  const filtered = experts.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      (e.role_title && e.role_title.toLowerCase().includes(q)) ||
      (e.specialties && e.specialties.toLowerCase().includes(q))
    );
  });

  const handleStartChat = useCallback(
    async (expert: Expert) => {
      setStartingId(expert.id);
      try {
        await api.chat.openConversation(expert.id);
        setOpen(false);
        router.push("/user-dashboard/chat");
      } catch (e: unknown) {
        setError(
          (e as Error)?.message || "Failed to start chat. Please try again.",
        );
        setStartingId(null);
      }
    },
    [router],
  );

  if (variant === "icon") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={className || "flex h-10 w-10 items-center justify-center rounded-full bg-[#4a1c7d] text-white transition-colors hover:bg-[#3d1268]"}
          title="Start new chat"
        >
          <MessageSquarePlus className="h-5 w-5" strokeWidth={2} />
        </button>

        {open && <ExpertPickerDialog dialogRef={dialogRef} />}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          (variant === "primary"
            ? "inline-flex h-[34px] items-center gap-2 rounded-lg bg-[#4a1c7d] px-4 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_rgba(74,28,125,0.3)] transition-colors hover:bg-[#3d1268]"
            : "inline-flex h-[34px] items-center gap-2 rounded-lg border border-[#c9b3e6] bg-white px-4 text-[12.5px] font-semibold text-[#5b21a8] transition-colors hover:bg-[#f3ecfb]")
        }
      >
        <MessageSquarePlus className="h-4 w-4" strokeWidth={2} />
        Chat with Expert
      </button>

      {open && <ExpertPickerDialog dialogRef={dialogRef} />}
    </>
  );

  function ExpertPickerDialog({
    dialogRef: _dialogRef,
  }: {
    dialogRef: React.RefObject<HTMLDivElement | null>;
  }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div
          ref={_dialogRef}
          className="flex max-h-[80vh] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(42,17,72,0.2)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#efe6d6] px-5 py-4">
            <div>
              <h3 className="text-[15px] font-bold text-[#2b0f47]">
                Choose an Expert
              </h3>
              <p className="mt-0.5 text-[12px] text-[#8b8697]">
                Select an expert to start chatting
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#8b8697] transition-colors hover:bg-[#f3ecfb] hover:text-[#4a1c7d]"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-[#efe6d6] px-5 py-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a09aab]"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-full border border-[#e7ddcb] bg-white pl-10 pr-4 text-[13px] text-[#2b0f47] placeholder:text-[#a09aab] focus:border-[#6d28d9] focus:outline-none"
              />
            </div>
          </div>

          {/* Expert list */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-[#6d28d9]" />
              </div>
            ) : error ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-[#b42318]">{error}</p>
                <button
                  type="button"
                  onClick={fetchExperts}
                  className="mt-3 text-[12px] font-medium text-[#6d28d9] hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[13px] text-[#8b8697]">
                  {search ? "No experts match your search." : "No experts available."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#f4f1f8]">
                {filtered.map((expert) => (
                  <button
                    key={expert.id}
                    type="button"
                    onClick={() => handleStartChat(expert)}
                    disabled={startingId !== null}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[#faf7f2] disabled:opacity-60"
                  >
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                      {expert.avatar ? (
                        <Image
                          src={expert.avatar}
                          alt={expert.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center rounded-full bg-[#4a1c7d] text-[14px] font-bold text-white">
                          {expert.name?.charAt(0)?.toUpperCase() || "E"}
                        </span>
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-[#2b0f47]">
                        {sanitize(expert.name)}
                      </p>
                      {expert.role_title && (
                        <p className="mt-0.5 truncate text-[11.5px] text-[#8b8697]">
                          {sanitize(expert.role_title)}
                        </p>
                      )}
                    </div>

                    {startingId === expert.id ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#6d28d9]" />
                    ) : (
                      <MessageSquarePlus className="h-4 w-4 shrink-0 text-[#8b8697]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
