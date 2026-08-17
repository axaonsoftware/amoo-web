"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Video,
  CalendarDays,
  Clock,
  Hash,
  CreditCard,
  IndianRupee,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../../lib/api";
import { loadConsultationData } from "../lib/consultation-storage";

type BookingInfo = {
  booking_ref?: string;
  service_name?: string;
  mode?: string;
  date?: string;
  time?: string;
  amount?: number;
  payment?: string;
};

function BookingDetailsInner() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingInfo | null>(null);

  useEffect(() => {
    const stored = loadConsultationData();
    if (!bookingId) {
      if (stored.service) {
        setBooking({
          service_name: stored.service,
          mode: stored.mode || "Video Call",
          date: stored.date,
          time: stored.time,
          amount: undefined,
          payment: "Pending",
        });
      }
      return;
    }
    setLoading(true);
    api.admin
      .getBooking(Number(bookingId))
      .then((data: BookingInfo) => {
        if (data) setBooking(data);
      })
      .catch((err: unknown) =>
        setError("Failed to load booking details. Please try again."),
      )
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#3E1E7A]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const svc = booking?.service_name || "Selected Service";
  const md = booking?.mode || "Video Call";
  const dt = booking?.date
    ? new Date(
        booking.date + "T" + (booking.time || "00:00"),
      ).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "\u2014";
  const tm = booking?.time
    ? new Date("2000-01-01T" + booking.time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "\u2014";
  const ref = booking?.booking_ref || (bookingId ? `AG${bookingId}` : "\u2014");

  const rows = [
    { icon: Video, label: "Consultation Mode", value: md },
    { icon: CalendarDays, label: "Date & Time", value: dt },
    { icon: Clock, label: "Duration", value: "60 Minutes" },
    { icon: Hash, label: "Booking ID", value: ref },
    {
      icon: CreditCard,
      label: "Payment Status",
      value: booking?.payment === "Paid" ? "Paid" : "Confirmed",
      valueClass: "text-green-600",
    },
    {
      icon: IndianRupee,
      label: "Payment Amount",
      value: booking?.amount ? `\u20b9${booking.amount}` : "\u2014",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-8 h-8 rounded-full bg-[#3E1E7A] flex items-center justify-center">
          <Calendar size={15} className="text-white" />
        </span>
        <h3 className="text-[#3E1E7A] font-semibold text-base">
          Booking Details
        </h3>
      </div>

      <div className="flex items-start gap-3 pb-5 mb-5 border-b border-gray-100">
        <span className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-2xl shrink-0">
          🪷
        </span>
        <div>
          <p className="font-semibold text-[#3E1E7A] text-sm">{svc}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Heal your mind, body and soul with divine Reiki energy
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-gray-500">
                <Icon size={15} className="text-[#5B2A9D]" />
                {row.label}
              </span>
              <span
                className={`font-medium text-right ${row.valueClass ?? "text-gray-800"}`}
              >
                {row.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingDetailsCard() {
  return (
    <Suspense fallback={null}>
      <BookingDetailsInner />
    </Suspense>
  );
}
