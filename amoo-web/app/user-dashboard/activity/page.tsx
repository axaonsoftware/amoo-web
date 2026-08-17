"use client";

import { useState, useEffect } from "react";
import { Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "../../../lib/api";

type ActivityItem = {
  id: number;
  action: string;
  action_details: Record<string, unknown> | null;
  page_or_route: string | null;
  created_at: string;
};

export default function MyActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 20;

  useEffect(() => {
    api
      .getMyActivity(`?page=${page}&pageSize=${pageSize}`)
      .then((res) => {
        const d = res?.data || [];
        setItems(Array.isArray(d) ? d : []);
        const total = res?.meta?.total || 0;
        setTotalPages(
          res?.meta?.totalPages || Math.ceil(total / pageSize) || 1,
        );
      })
      .catch((e) => {
        setItems([]);
        setError(e?.message || "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [page]);

  function actionBadge(action: string) {
    const colors: Record<string, string> = {
      page_view: "bg-blue-100 text-blue-700",
      login: "bg-green-100 text-green-700",
      logout: "bg-gray-100 text-gray-700",
      signup: "bg-purple-100 text-purple-700",
      booking: "bg-amber-100 text-amber-700",
      payment: "bg-emerald-100 text-emerald-700",
      profile_update: "bg-indigo-100 text-indigo-700",
      download: "bg-cyan-100 text-cyan-700",
    };
    const color = colors[action] || "bg-slate-100 text-slate-700";
    return (
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${color}`}
      >
        {action.replace(/_/g, " ")}
      </span>
    );
  }

  return (
    <main id="main-content" className="flex-1 px-5 pb-10 pt-6 lg:px-6">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#2b0f47] font-serif">
          My Activity
        </h1>
        <p className="mt-1 text-[14px] text-[#8b8697]">
          Your recent actions and events
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#4a1c7d]" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-10">
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center text-[14px] text-red-700">
            {error}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8b8697]">
          <Clock className="mb-3 h-12 w-12" strokeWidth={1.5} />
          <p className="text-[15px] font-medium">No activity recorded yet</p>
          <p className="mt-1 text-[13px]">
            Actions you perform will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-[#ece3d5] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#ece3d5] bg-[#faf7f2] text-[12px] font-semibold text-[#6b5f7a]">
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Details</th>
                  <th className="px-4 py-3 hidden md:table-cell">Page</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#f0e8dc] last:border-0 hover:bg-[#faf7f2]"
                  >
                    <td className="px-4 py-3">{actionBadge(item.action)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-[#6b5f7a] max-w-[240px] truncate">
                      {item.action_details
                        ? JSON.stringify(item.action_details).slice(0, 60)
                        : "\u2014"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#6b5f7a]">
                      {item.page_or_route || "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-right text-[#8b8697] whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-[#ece3d5] px-3 py-2 text-[12px] font-medium text-[#4a1c7d] disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="text-[12px] text-[#8b8697]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-[#ece3d5] px-3 py-2 text-[12px] font-medium text-[#4a1c7d] disabled:opacity-40"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
