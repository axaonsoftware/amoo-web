"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

type Expert = {
  id?: number;
  name?: string;
  total_bookings?: number;
  completed_bookings?: number;
  total_revenue?: number;
  revenue?: number;
  avg_rating?: number;
  rating?: number;
  new_clients?: number;
  repeat_clients?: number;
  total_consultations?: number;
};

function fmtAmount(n?: number): string {
  if (!n) return "₹ 0";
  return `₹ ${n.toLocaleString("en-IN")}`;
}

const fallback: Expert[] = [
  { name: "Asha Verma", total_consultations: 286, completed_bookings: 268, total_revenue: 245780, avg_rating: 4.9, new_clients: 156, repeat_clients: 132 },
  { name: "Meera Iyer", total_consultations: 242, completed_bookings: 231, total_revenue: 210340, avg_rating: 4.8, new_clients: 118, repeat_clients: 113 },
  { name: "Vikram Joshi", total_consultations: 198, completed_bookings: 187, total_revenue: 178950, avg_rating: 4.8, new_clients: 94, repeat_clients: 93 },
  { name: "Raghavendra", total_consultations: 176, completed_bookings: 165, total_revenue: 142600, avg_rating: 4.7, new_clients: 82, repeat_clients: 83 },
  { name: "Neha Patel", total_consultations: 162, completed_bookings: 154, total_revenue: 128760, avg_rating: 4.7, new_clients: 76, repeat_clients: 78 },
];

export default function TopPerformingAstrologers() {
  const [rows, setRows] = useState<Expert[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.getTopExperts(5)
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (data.length > 0) setRows(data);
      })
      .catch((err) => { if (!cancelled) setError(err?.message || "Failed to load top astrologers"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">
        Top Performing Astrologers
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
        <div className="mt-4 -mx-[2px] overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-y border-[#F1EFF6] bg-[#FAFAFC]">
                {["#", "Astrologer", "Total Consultations", "Completed", "Revenue", "Rating", "New Clients", "Repeat Clients"].map((h) => (
                  <th key={h} className="py-[9px] px-2 text-left text-[9.5px] font-semibold whitespace-nowrap text-[#8B879C]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name || r.id || i} className="border-b border-[#F5F3F9]">
                  <td className="py-[10px] pl-2 pr-2 text-[11px] text-[#8B879C]">{i + 1}</td>
                  <td className="py-[10px] pr-2">
                    <div className="flex items-center gap-[8px]">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                        alt={r.name || "Astrologer"}
                        className="h-[26px] w-[26px] shrink-0 rounded-full object-cover"
                        width={26}
                        height={26}
                      />
                      <span className="whitespace-nowrap text-[11px] text-[#2E2A3B]">{r.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="py-[10px] pr-2 text-center text-[11px] text-[#4A3B63]">{r.total_consultations || r.total_bookings || 0}</td>
                  <td className="py-[10px] pr-2 text-center text-[11px] text-[#4A3B63]">{r.completed_bookings || 0}</td>
                  <td className="py-[10px] pr-2 text-center text-[11px] font-medium whitespace-nowrap text-[#1B1630]">
                    {fmtAmount(r.total_revenue || r.revenue)}
                  </td>
                  <td className="py-[10px] pr-2">
                    <span className="flex items-center justify-center gap-[3px] text-[11px] font-medium text-[#1B1630]">
                      {r.avg_rating?.toFixed(1) || r.rating?.toFixed(1) || "0.0"}
                      <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                    </span>
                  </td>
                  <td className="py-[10px] pr-2 text-center text-[11px] text-[#4A3B63]">{r.new_clients || 0}</td>
                  <td className="py-[10px] pr-2 text-center text-[11px] text-[#4A3B63]">{r.repeat_clients || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="inline-flex h-[30px] items-center rounded-full bg-[#F1EAFE] px-4 text-[10.5px] font-medium text-[#5B21B6]"
        >
          View All Astrologers
        </button>
      </div>
    </section>
  );
}
