"use client";

import Link from "next/link";
import { socket } from "@/lib/socket";
import { useAuth } from "@/lib/auth-context";
import {
  Calendar,
  Clock,
  MoreVertical,
  Video,
  CalendarClock,
  ArrowRight,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import StartChatButton from "../chat/StartChatButton";
import { useEffect } from "react";

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

type Booking = {
  id: number;
  booking_ref: string;
  service_name: string;
  user_id: number;
  user_name: string | null;
  expert_id: number | null;
  expert_name: string | null;
  date: string;
  time: string;
  mode: "audio" | "video" | "chat";
  status: string;
  payment: string;
  amount: number | string;
};

export default function UpcomingConsultations() {
  const { user } = useAuth();
  const role: "user" | "expert" = user?.kind === "expert" ? "expert" : "user";
  const currentUserId = user?.id;
  const { data, loading, error } = useApi<{ data: Booking[] }>(() =>
    api.getBookings(),
  );
  const rows: Booking[] = Array.from(
    new Map(
      (data?.data ?? [])
        .filter(
          (b: Booking) =>
            b.status === "upcoming" || b.status === "pending-payment",
        )
        .map((b) => [b.id, b]),
    ).values(),
  );

  // useEffect(() => {
  //   const handleAccepted = (data: {
  //     bookingId: number;
  //     mode: "audio" | "video";
  //   }) => {
  //     window.location.href = `/user-dashboard/consultations-booking/meeting?bookingId=${data.bookingId}&mode=${data.mode}`;
  //   };
  //   const handleRejected = () => {
  //     window.alert("Call rejected.");
  //   };
  //   const handleError = (data: { message: string }) => {
  //     window.alert(data.message);
  //   };
  //   socket.on("call:accepted", handleAccepted);
  //   socket.on("call:rejected", handleRejected);
  //   socket.on("call:error", handleError);
  //   return () => {
  //     socket.off("call:accepted", handleAccepted);
  //     socket.off("call:rejected", handleRejected);
  //     socket.off("call:error", handleError);
  //   };
  // }, []);

  return (
    <section className="rounded-[16px] border border-[#efe6d6] bg-white px-[18px] pb-[18px] pt-[18px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      <h2 className="px-1 font-display text-[19px] font-bold text-[#4c1d95]">
        Upcoming Consultations
      </h2>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#6c6b78]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading consultations...
        </div>
      ) : error ? (
        <p className="mt-4 px-1 text-[13px] text-red-500">{error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 px-1 text-[13px] text-[#6c6b78]">
          No upcoming consultations. Book a session to get started.
        </p>
      ) : (
        <div className="mt-3.5 flex flex-col gap-3.5">
          {rows.map((c) => {
            const displayName =
              role === "expert"
                ? c.user_name || "User"
                : c.expert_name || "Expert";
            const paid = c.payment === "Paid";
            const time = (c.time || "").slice(0, 5);
            return (
              <article
                key={c.id}
                className="relative rounded-[14px] border border-[#f0e9dd] bg-white p-[15px] shadow-[0_1px_2px_rgba(38,17,66,.03)]"
              >
                <button
                  type="button"
                  aria-label="More options"
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center text-[#9a95a5]"
                >
                  <MoreVertical className="h-[18px] w-[18px]" strokeWidth={2} />
                </button>
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start lg:flex-nowrap">
                  <div className="relative h-[98px] w-[98px] shrink-0">
                    <span className="relative block h-full w-full overflow-hidden rounded-[12px] bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]">
                      <span className="flex h-full w-full items-center justify-center text-[26px] font-bold text-white">
                        {(displayName || c.service_name || "C")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </span>
                    <span className="absolute -bottom-[3px] left-[6px] flex h-[16px] w-[16px] items-center justify-center rounded-full border-2 border-white bg-[#22c55e]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[19px] font-bold leading-tight text-[#4c1d95]">
                      {c.service_name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-[13.5px] font-medium text-[#5c4a72]">
                      with {displayName}{" "}
                      <BadgeCheck
                        className="h-[15px] w-[15px] text-[#e0a63f]"
                        strokeWidth={2}
                      />
                    </p>
                    <div className="mt-2.5 flex flex-col gap-[7px]">
                      <p className="flex items-center gap-2 text-[12.5px] text-[#6c6b78]">
                        <Calendar
                          className="h-[15px] w-[15px] shrink-0 text-[#7c4ec4]"
                          strokeWidth={1.9}
                        />
                        {fmtDate(c.date)}
                      </p>
                      <p className="flex items-center gap-2 text-[12.5px] text-[#6c6b78]">
                        <Clock
                          className="h-[15px] w-[15px] shrink-0 text-[#7c4ec4]"
                          strokeWidth={1.9}
                        />
                        {time || "—"} IST
                      </p>
                    </div>
                  </div>

                  <div className="w-[170px] shrink-0">
                    <span
                      className={
                        paid
                          ? "inline-flex items-center rounded-[8px] bg-[#efe7fb] px-3 py-[6px] text-[12px] font-semibold text-[#5b21a8]"
                          : "inline-flex items-center rounded-[8px] bg-[#fdf1dd] px-3 py-[6px] text-[12px] font-semibold text-[#a5762a]"
                      }
                    >
                      {c.status === "upcoming" ? "Confirmed" : "Scheduled"}
                    </span>
                    <div className="mt-3.5">
                      <p className="text-[11px] text-[#9a95a5]">Booking ID</p>
                      <p className="mt-[2px] text-[12.5px] font-medium text-[#3f3a4a]">
                        {c.booking_ref}
                      </p>
                    </div>
                    <div className="mt-2.5">
                      <p className="text-[11px] text-[#9a95a5]">Paid</p>
                      <p className="mt-[2px] text-[12.5px] font-semibold text-[#3f3a4a]">
                        ₹{Number(c.amount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-2.5 md:w-[152px]">
                    {paid ? (
                      c.mode === "audio" || c.mode === "video" ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUserId) {
                              window.alert("User session not available.");
                              return;
                            }
                            socket.emit("call:start", {
                              bookingId: c.id,
                              callerRole: role,
                              callerId: currentUserId,
                            });
                          }}
                          className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#c9b3e6] bg-white text-[13px] font-semibold text-[#5b21a8]"
                        >
                          <Video
                            className="h-[16px] w-[16px]"
                            strokeWidth={1.9}
                          />
                          Join Meeting
                        </button>
                      ) : null
                    ) : (
                      <button
                        type="button"
                        className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#c9b3e6] bg-white text-[13px] font-semibold text-[#5b21a8]"
                      >
                        <CalendarClock
                          className="h-[16px] w-[16px]"
                          strokeWidth={1.9}
                        />{" "}
                        Reschedule
                      </button>
                    )}
                    {c.expert_id && (
                      <StartChatButton
                        variant="secondary"
                        className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#c9b3e6] bg-white text-[13px] font-semibold text-[#5b21a8]"
                      />
                    )}
                    <button
                      type="button"
                      className="flex h-[42px] w-full items-center justify-center rounded-[10px] border border-[#e6dfd3] bg-white text-[13px] font-medium text-[#4a4356]"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <Link
          href="/user-dashboard/consultations-booking"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#5b21a8]"
        >
          View All Upcoming{" "}
          <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  );
}
