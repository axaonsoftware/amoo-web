"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, BadgeCheck } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type Booking = {
  id: number;
  booking_ref: string;
  service_name: string;
  expert_name: string | null;
  date: string;
  time: string;
  status: string;
  payment: string;
  amount: number | string;
};

export default function UpcomingConsultation() {
  const { data, loading, error } = useApi<{ data: Booking[] }>(() =>
    api.getBookings(),
  );
  const rows: Booking[] = data?.data ?? [];
  const next =
    rows.find(
      (b) => b.status === "upcoming" || b.status === "pending-payment",
    ) ?? rows[0];

  if (loading) {
    return (
      <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#1d0735] via-[#2b0f4a] to-[#1a0631] px-6 pb-5 pt-4 shadow-[0_12px_34px_rgba(42,17,72,.28)]">
        <div className="stars pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex items-center justify-between">
          <h2 className="font-display text-[17px] font-bold text-white">
            Upcoming Consultation
          </h2>
        </div>
        <p className="relative mt-6 text-[14px] text-white/80">
          Loading bookings...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#1d0735] via-[#2b0f4a] to-[#1a0631] px-6 pb-5 pt-4 shadow-[0_12px_34px_rgba(42,17,72,.28)]">
        <div className="stars pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex items-center justify-between">
          <h2 className="font-display text-[17px] font-bold text-white">
            Upcoming Consultation
          </h2>
          <Link
            href="/consultation/select-service"
            className="text-[12px] font-medium text-[#e9b85c]"
          >
            Book Now
          </Link>
        </div>
        <p className="relative mt-6 text-[14px] text-white/80">
          Could not load booking data.
        </p>
      </section>
    );
  }

  if (!next) {
    return (
      <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#1d0735] via-[#2b0f4a] to-[#1a0631] px-6 pb-5 pt-4 shadow-[0_12px_34px_rgba(42,17,72,.28)]">
        <div className="stars pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex items-center justify-between">
          <h2 className="font-display text-[17px] font-bold text-white">
            Upcoming Consultation
          </h2>
          <Link
            href="/consultation/select-service"
            className="text-[12px] font-medium text-[#e9b85c]"
          >
            Book Now
          </Link>
        </div>
        <p className="relative mt-6 text-[14px] text-white/80">
          You have no upcoming consultations. Book one to get started.
        </p>
      </section>
    );
  }

  const time = (next.time || "").slice(0, 5);
  const expert = next.expert_name || "Expert";
  const paid = next.payment === "Paid";

  return (
    <section className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#1d0735] via-[#2b0f4a] to-[#1a0631] px-6 pb-5 pt-4 shadow-[0_12px_34px_rgba(42,17,72,.28)]">
      <div className="stars pointer-events-none absolute inset-0 opacity-60" />

      <div className="pointer-events-none absolute right-4 top-8 hidden h-[200px] w-[250px] sm:block">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(233,184,92,.35),rgba(233,184,92,0)_62%)] blur-[8px]" />
        <Image
          src="https://images.unsplash.com/photo-1598919021353-e3f39f3ecbab?w=250&q=80"
          alt="Tarot cards"
          width={250}
          height={200}
          className="relative h-full w-full rounded-[10px] object-contain"
        />
      </div>

      <div className="relative flex items-center justify-between">
        <h2 className="font-display text-[17px] font-bold text-white">
          Upcoming Consultation
        </h2>
        <Link
          href="/user-dashboard/consultations-booking"
          className="text-[12px] font-medium text-[#e9b85c]"
        >
          View All
        </Link>
      </div>

      <div className="relative mt-3.5 flex items-start gap-5">
        <div className="min-w-0 max-w-full sm:max-w-[58%] flex-1">
          <div className="flex items-start gap-4">
            <span className="relative block h-[62px] w-[62px] shrink-0">
              <span className="relative block h-full w-full overflow-hidden rounded-full ring-2 ring-[#e9b85c]">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=124&q=80"
                  alt={expert}
                  fill
                  sizes="62px"
                  className="object-cover"
                />
              </span>
              <span className="absolute bottom-[3px] right-[3px] h-[11px] w-[11px] rounded-full border-2 border-[#1d0735] bg-[#3ddc84]" />
            </span>

            <div className="min-w-0 pt-0.5">
              <h3 className="font-display text-[21px] font-bold leading-none text-white">
                {next.service_name}
              </h3>
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-white/75">
                with{" "}
                <span className="font-semibold text-[#f0c877]">{expert}</span>
                <BadgeCheck
                  className="h-4 w-4 text-[#e9b85c]"
                  strokeWidth={1.8}
                />
              </p>
              <p className="mt-3.5 flex items-center gap-2 text-[12.5px] text-white/80">
                <Calendar
                  className="h-[15px] w-[15px] text-[#e9b85c]"
                  strokeWidth={1.8}
                />
                {fmtDate(next.date)}
              </p>
              <p className="mt-2 flex items-center gap-2 text-[12.5px] text-white/80">
                <Clock
                  className="h-[15px] w-[15px] text-[#e9b85c]"
                  strokeWidth={1.8}
                />
                {time || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-between gap-4">
        <span className="text-[12px] text-white/80">
          Booking {next.booking_ref}
        </span>
        <span
          className={`rounded-[8px] px-3 py-1.5 text-[12px] font-semibold ${paid ? "bg-[#e7f7ee] text-[#16a34a]" : "bg-[#fdf3e2] text-[#b7791f]"}`}
        >
          {paid ? "Paid" : "Pay Now"}
        </span>
      </div>
    </section>
  );
}
