"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ScrollText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import api from "../../../lib/api";

type ActivityItem = {
  id: number;
  actor_id: number;
  actor_type: string;
  action: string;
  entity: string | null;
  action_details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  page_or_route: string | null;
  created_at: string;
};

export default function AdminActivityLogsPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const pageSize = 25;

  // Filters
  const [filterAction, setFilterAction] = useState("");
  const [filterActorType, setFilterActorType] = useState("");
  const [filterActorId, setFilterActorId] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (filterAction) params.set("action", filterAction);
    if (filterActorType) params.set("actor_type", filterActorType);
    if (filterActorId) params.set("actor_id", filterActorId);
    if (filterDateFrom) params.set("date_from", filterDateFrom);
    if (filterDateTo) params.set("date_to", filterDateTo);
    return `?${params.toString()}`;
  }, [page, filterAction, filterActorType, filterActorId, filterDateFrom, filterDateTo]);

  const fetchLogs = useCallback(() => {
    setLoading(true);
    api.admin
      .getAudit(buildQuery())
      .then((res) => {
        const d = res?.data || [];
        setItems(Array.isArray(d) ? d : []);
        const total = res?.meta?.total || 0;
        setTotal(total);
        setTotalPages(res?.meta?.totalPages || Math.ceil(total / pageSize) || 1);
      })
      .catch((e) => { setItems([]); setError(e?.message || "Failed to load") })
      .finally(() => setLoading(false));
  }, [buildQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function clearFilters() {
    setFilterAction("");
    setFilterActorType("");
    setFilterActorId("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setPage(1);
  }

  const hasFilters = filterAction || filterActorType || filterActorId || filterDateFrom || filterDateTo;

  function actionBadge(action: string) {
    const colors: Record<string, string> = {
      page_view: "bg-blue-100 text-blue-700",
      login: "bg-green-100 text-green-700",
      logout: "bg-gray-100 text-gray-700",
      "user.login": "bg-green-100 text-green-700",
      "admin.login": "bg-purple-100 text-purple-700",
      signup: "bg-purple-100 text-purple-700",
      booking: "bg-amber-100 text-amber-700",
      payment: "bg-emerald-100 text-emerald-700",
      "profile.update": "bg-indigo-100 text-indigo-700",
      "profile_update": "bg-indigo-100 text-indigo-700",
      download: "bg-cyan-100 text-cyan-700",
    };
    const color = colors[action] || "bg-slate-100 text-slate-700";
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${color}`}>
        {action.replace(/_/g, " ")}
      </span>
    );
  }

  function actorBadge(type: string) {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-700",
      user: "bg-blue-100 text-blue-700",
      system: "bg-gray-100 text-gray-700",
    };
    return (
      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${colors[type] || "bg-gray-100 text-gray-700"}`}>
        {type}
      </span>
    );
  }

  const filterRow = (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a49bb1]" />
        <input
          type="text"
          placeholder="Actor ID"
          value={filterActorId}
          onChange={(e) => { setFilterActorId(e.target.value); setPage(1); }}
          className="h-[38px] w-[100px] rounded-lg border border-[#ece4f6] pl-9 pr-3 text-[12px] outline-none"
        />
      </div>
      <select
        value={filterActorType}
        onChange={(e) => { setFilterActorType(e.target.value); setPage(1); }}
        className="h-[38px] rounded-lg border border-[#ece4f6] px-3 text-[12px] outline-none"
      >
        <option value="">All types</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="system">System</option>
      </select>
      <input
        type="text"
        placeholder="Action (e.g. login)"
        value={filterAction}
        onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
        className="h-[38px] w-[160px] rounded-lg border border-[#ece4f6] px-3 text-[12px] outline-none"
      />
      <input
        type="date"
        value={filterDateFrom}
        onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }}
        className="h-[38px] rounded-lg border border-[#ece4f6] px-3 text-[12px] outline-none"
        title="From date"
      />
      <input
        type="date"
        value={filterDateTo}
        onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }}
        className="h-[38px] rounded-lg border border-[#ece4f6] px-3 text-[12px] outline-none"
        title="To date"
      />
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex h-[38px] items-center gap-1.5 rounded-lg border border-red-200 px-3 text-[12px] font-medium text-red-600 hover:bg-red-50"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
      <button
        onClick={() => { setPage(1); fetchLogs(); }}
        className="flex h-[38px] items-center gap-1.5 rounded-lg border border-[#ece4f6] px-3 text-[12px] font-medium text-[#3d1a63] hover:bg-[#f8f5fc]"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Refresh
      </button>
    </div>
  );

  return (
    <main className="flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#2a1148] font-serif">Activity Logs</h1>
          <p className="mt-1 text-[13px] text-[#8b8397]">
            {total} total event{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {filterRow}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#6d28d9]" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-10">
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center text-[14px] text-red-700">{error}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#8b8397]">
          <ScrollText className="mb-3 h-12 w-12" strokeWidth={1.5} />
          <p className="text-[15px] font-medium">No activity logs found</p>
          <p className="mt-1 text-[13px]">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#efe9f6] bg-white">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#efe9f6] bg-[#f8f5fc] text-[11px] font-semibold text-[#6b5b83] uppercase tracking-wide">
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Entity</th>
                  <th className="px-4 py-3 hidden md:table-cell">Page</th>
                  <th className="px-4 py-3 hidden lg:table-cell">IP</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-[#f0e8f2] last:border-0 hover:bg-[#f8f5fc]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {actionBadge(item.action)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {actorBadge(item.actor_type)}
                        <span className="text-[#3d1a63]">#{item.actor_id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-[#6b5b83]">
                      {item.entity ? (
                        <span className="font-medium">{item.entity}</span>
                      ) : (
                        "\u2014"
                      )}
                      {item.entity && item.action_details && (
                        <div className="mt-0.5 text-[11px] text-[#a49bb1] truncate max-w-[140px]">
                          {JSON.stringify(item.action_details).slice(0, 50)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#6b5b83] max-w-[120px] truncate">
                      {item.page_or_route || "\u2014"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[#6b5b83] font-mono text-[11px]">
                      {item.ip_address || "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-right text-[#8b8397] whitespace-nowrap">
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
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-[#efe9f6] px-3 py-2 text-[12px] font-medium text-[#3d1a63] disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="text-[12px] text-[#8b8397]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-[#efe9f6] px-3 py-2 text-[12px] font-medium text-[#3d1a63] disabled:opacity-40"
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
