"use client";
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

type Booking = {
  id?: number;
  service_name?: string;
  service_type?: string;
  [key: string]: unknown;
};

type ServiceCount = { label: string; count: number };

function computeTop(bookings: Booking[]): ServiceCount[] {
  const map = new Map<string, number>();
  for (const b of bookings) {
    const name = b.service_name || b.service_type || "Others";
    map.set(name, (map.get(name) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

const fallbackServices = [
  { label: "Kundali Reading", count: 632, width: 90 },
  { label: "Tarot Reading", count: 512, width: 73 },
  { label: "Numerology Report", count: 342, width: 49 },
  { label: "Reiki Healing", count: 198, width: 28 },
  { label: "Vastu Consultation", count: 126, width: 18 },
  { label: "Others", count: 46, width: 7 },
];

export default function TopServicesByBookings() {
  const [services, setServices] = useState(fallbackServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.getBookings()
      .then((res) => {
        if (cancelled) return;
        const bookings = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (bookings.length > 0) {
          const top = computeTop(bookings);
          const maxCount = top[0]?.count || 1;
          setServices(top.map((s) => ({
            ...s,
            width: Math.max(5, Math.round((s.count / maxCount) * 100)),
          })));
        }
      })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load top services"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">
        Top Services by Bookings
      </h2>

      {error ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-red-50 p-3 text-[12px] text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#6D28D9]" />
        </div>
      ) : (
        <ul className="mt-[18px] space-y-[15px]">
          {services.map((s) => (
            <li key={s.label} className="relative">
              <p className="text-[11px] text-[#4A3B63]">{s.label}</p>
              <span
                className="absolute top-0 whitespace-nowrap text-[10.5px] font-semibold text-[#1B1630]"
                style={{ left: `max(46px, calc(${s.width}% + 8px))` }}
              >
                {s.count}
              </span>
              <div className="mt-[6px] h-[6px] w-full rounded-full bg-[#F1EFF6]">
                <div
                  className="h-full rounded-full bg-[#4C1D95]"
                  style={{ width: `${s.width}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
