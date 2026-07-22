"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Phone, Video, Loader2, AlertCircle } from "lucide-react";
import { api } from "../../../lib/api";

const STATIC_ROWS = [
  { icon: MessageSquare, mode: "Chat Consultation", prices: ["₹349", "₹549", "₹749", "₹999"], bestFor: "Quick questions, written guidance" },
  { icon: Phone, mode: "Audio Call Consultation", prices: ["₹499", "₹799", "₹1,099", "₹1,499"], bestFor: "Clear answers, instant clarity" },
  { icon: Video, mode: "Video Call Consultation", prices: ["₹799", "₹1,199", "₹1,699", "₹2,299"], bestFor: "In-depth discussion, better connection" },
];

const MODE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Chat: MessageSquare,
  Audio: Phone,
  Video,
};

export default function PricingTable() {
  const [services, setServices] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getServices()
      .then((res: any) => {
        const items = res?.data ?? Array.isArray(res) ? res : [];
        if (items.length) setServices(items);
      })
      .catch((err) => setError("Failed to load pricing. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const rows = services && services.length
    ? services.map((svc: any) => {
        const Icon = MODE_ICONS[svc.type] || MODE_ICONS[Object.keys(MODE_ICONS).find(k => svc.name?.includes(k)) || ""] || MessageSquare;
        const price = svc.price ? `₹${Number(svc.price).toLocaleString("en-IN")}` : "—";
        return { icon: Icon, mode: svc.name || "Service", prices: [price, price, price, price], bestFor: svc.sub || svc.description || "" };
      })
    : STATIC_ROWS;

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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-[#150b21] text-white/80 text-xs">
              <th className="text-left px-5 py-3 font-medium">Mode</th>
              <th className="text-center px-3 py-3 font-medium">15 Min</th>
              <th className="text-center px-3 py-3 font-medium">30 Min</th>
              <th className="text-center px-3 py-3 font-medium">45 Min</th>
              <th className="text-center px-3 py-3 font-medium">60 Min</th>
              <th className="text-left px-5 py-3 font-medium">Best For</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, i: number) => {
              const Icon = row.icon;
              return (
                <tr
                  key={row.mode}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-5 py-3.5 flex items-center gap-2 text-gray-700 font-medium">
                    <Icon size={14} className="text-[#5B2A9D]" />
                    {row.mode}
                  </td>
                  {row.prices.map((p: string, idx: number) => (
                    <td key={idx} className="text-center px-3 py-3.5 text-[#3E1E7A] font-semibold">{p}</td>
                  ))}
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{row.bestFor}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
