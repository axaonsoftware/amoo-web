"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

type Expert = {
  id?: number;
  name?: string;
  total_revenue?: number;
  earnings?: number;
  bookings_count?: number;
};

function fmtAmount(n?: number): string {
  if (!n) return "₹ 0";
  return `₹ ${n.toLocaleString("en-IN")}`;
}

export default function TopEarningAstrologers() {
  const [astrologers, setAstrologers] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.admin.getTopExperts(4)
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setAstrologers(data);
      })
      .catch((e) => { if (!cancelled) { setAstrologers([]); setError(e?.message || "Failed to load"); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1B1630]">
          Top Earning Astrologers
        </h2>
        <Link href="/admin/payments-finance" className="text-[11px] font-medium text-[#7C3AED]">
          View All
        </Link>
      </div>

      {error ? (
        <div className="flex items-center justify-center gap-2 py-8 text-[13px] text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[#6D28D9]" />
        </div>
      ) : astrologers.length === 0 ? (
        <div className="flex justify-center py-8 text-[12px] text-[#A5A2B5]">
          No data yet
        </div>
      ) : (
        <ul className="mt-4 space-y-[14px]">
          {astrologers.map((a) => (
            <li key={a.name || a.id} className="flex items-center gap-[10px]">
              <Image
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
                alt={a.name || "Astrologer"}
                width={30}
                height={30}
                className="h-[30px] w-[30px] shrink-0 rounded-full object-cover"
              />
              <span className="truncate text-[11.5px] text-[#4A3B63]">
                {a.name || "Unknown"}
              </span>
              <span className="ml-auto shrink-0 text-[12px] font-semibold text-[#1B1630]">
                {fmtAmount(a.total_revenue || a.earnings)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
