"use client";

import {
  FileText,
  CalendarDays,
  FileHeart,
  Compass,
  ClipboardList,
  HeartHandshake,
  Plus,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

const reportTypes = [
  {
    title: "Full Numerology Report",
    sub: "Complete analysis",
    Icon: FileText,
    iconBg: "bg-[#f1e9fc]",
    iconColor: "text-[#7a3fc0]",
  },
  {
    title: "Birth Number",
    sub: "Reveal your essence",
    Icon: CalendarDays,
    iconBg: "bg-[#fdf0dc]",
    iconColor: "text-[#e0952e]",
  },
  {
    title: "Destiny Number",
    sub: "Life path analysis",
    Icon: FileHeart,
    iconBg: "bg-[#fdeaf0]",
    iconColor: "text-[#e0567f]",
  },
  {
    title: "Name Number",
    sub: "Name vibration",
    Icon: Compass,
    iconBg: "bg-[#e6f6ea]",
    iconColor: "text-[#2f9e56]",
  },
  {
    title: "Personal Year",
    sub: "Yearly predictions",
    Icon: ClipboardList,
    iconBg: "bg-[#e6effb]",
    iconColor: "text-[#3b78cc]",
  },
  {
    title: "Compatibility",
    sub: "Relationship match",
    Icon: HeartHandshake,
    iconBg: "bg-[#f1e9fc]",
    iconColor: "text-[#7a3fc0]",
  },
];

export default function CreateReport() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreate = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      await api.createBooking({
        service: "Numerology Report",
        type: "numerology",
      });
      setMessage("Report created successfully!");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed to create report");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <section className="rounded-[14px] border border-[#ece9f3] bg-white px-5 py-[16px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
        Create New Numerology Report
      </h2>
      <p className="mt-1.5 text-[12px] leading-[1.5] text-[#6c6b78]">
        Choose report type and generate your personalized numerology report.
      </p>

      <div className="mt-3.5 grid grid-cols-2 gap-[10px] sm:grid-cols-3">
        {reportTypes.map(({ title, sub, Icon, iconBg, iconColor }) => (
          <button
            key={title}
            type="button"
            className="flex flex-col items-center rounded-[12px] border border-[#efecf6] bg-white px-2 py-[10px] text-center shadow-[0_1px_2px_rgba(43,15,71,.03)]"
          >
            <span
              className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
            >
              <Icon className="h-[16px] w-[16px]" strokeWidth={1.8} />
            </span>

            <p className="mt-1.5 text-[11px] font-semibold leading-[1.3] text-[#2b0f47]">
              {title}
            </p>
            <p className="mt-[2px] text-[10px] leading-[1.4] text-[#8b8697]">
              {sub}
            </p>
          </button>
        ))}
      </div>

      {message ? (
        <p className="mt-3 text-center text-[12.5px] font-medium text-[#2f9e56]">
          {message}
        </p>
      ) : null}
      <button
        type="button"
        disabled={submitting}
        onClick={handleCreate}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#3b0f6d] via-[#4c1d95] to-[#6d28d9] px-4 py-[11px] text-[13px] font-semibold text-white shadow-[0_6px_18px_rgba(76,29,149,.3)] disabled:opacity-60"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-[16px] w-[16px]" strokeWidth={2.4} />
        )}
        {submitting ? "Creating..." : "Create New Report"}
      </button>
    </section>
  );
}
