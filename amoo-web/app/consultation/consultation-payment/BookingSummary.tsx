"use client";

import { useState, useEffect } from "react";
import { Video, CalendarDays, Clock, Tag } from "lucide-react";
import { loadConsultationData } from "../lib/consultation-storage";

const MODE_PRICES: Record<string, { price: number }> = {
  "Audio Call": { price: 499 },
  "Video Call": { price: 999 },
  Chat: { price: 349 },
};

export default function BookingSummary({
  service: propService,
  mode: propMode,
  date: propDate,
  time: propTime,
}: {
  service?: string;
  mode?: string;
  date?: string;
  time?: string;
}) {
  const [booking, setBooking] = useState<{ service: string; mode: string; date: string; time: string }>({
    service: propService || "Reiki Healing Session",
    mode: propMode || "Video Call",
    date: propDate || "Tuesday, 10 June 2026",
    time: propTime || "08:00 AM",
  });

  useEffect(() => {
    const stored = loadConsultationData();
    if (stored.service || stored.mode || stored.date || stored.time) {
      setBooking((prev) => ({
        service: stored.service || prev.service,
        mode: stored.mode || prev.mode,
        date: stored.date || prev.date,
        time: stored.time || prev.time,
      }));
    }
  }, []);

  useEffect(() => {
    if (propService || propMode || propDate || propTime) {
      setBooking((prev) => ({
        service: propService || prev.service,
        mode: propMode || prev.mode,
        date: propDate || prev.date,
        time: propTime || prev.time,
      }));
    }
  }, [propService, propMode, propDate, propTime]);

  const { service, mode, date, time } = booking;
  const pricing = MODE_PRICES[mode] || MODE_PRICES["Video Call"];
  const discount = Math.round(pricing.price * 0.1);
  const total = pricing.price - discount;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4" style={{ background: "linear-gradient(90deg,#3E1E7A 0%,#5B2A9D 100%)" }}>
        <span className="text-amber-400">✦</span>
        <h3 className="text-white font-serif font-semibold text-base">Booking Summary</h3>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3 pb-5 border-b border-gray-100">
          <span className="w-11 h-11 rounded-full bg-purple-50 flex items-center justify-center text-xl shrink-0">🪷</span>
          <div>
            <p className="font-semibold text-[#3E1E7A] text-sm">{service}</p>
            <p className="text-xs text-gray-500 mt-0.5">{service} consultation</p>
          </div>
        </div>

        <div className="space-y-4 pt-5 pb-5 border-b border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600"><Video className="w-4 h-4 text-amber-500" />Mode</span>
            <span className="font-semibold text-[#3E1E7A]">{mode}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600"><CalendarDays className="w-4 h-4 text-amber-500" />Date</span>
            <span className="font-semibold text-[#3E1E7A] text-right">{date}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4 text-amber-500" />Time</span>
            <span className="font-semibold text-[#3E1E7A]">{time} (IST)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4 text-amber-500" />Duration</span>
            <span className="font-semibold text-[#3E1E7A]">60 Minutes</span>
          </div>
        </div>

        <div className="space-y-2 pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Consultation Fee</span>
            <span className="font-medium text-[#3E1E7A]">₹{pricing.price}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-600"><Tag className="w-3.5 h-3.5" />Discount (FIRST10)</span>
            <span className="text-green-600 font-medium">- ₹{discount}</span>
          </div>
          <div className="border-t border-dashed border-gray-200 pt-2 flex items-center justify-between">
            <span className="font-bold text-[#3E1E7A]">Total Amount</span>
            <span className="font-bold text-xl text-[#3E1E7A]">₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
