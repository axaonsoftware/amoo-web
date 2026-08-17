"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown, Eye, Pencil, Loader2 } from "lucide-react";
import { api, qs } from "../../../lib/api";
import { sanitize } from "../../../lib/sanitize";
import { formatDate, initials } from "../../../lib/format";
import { EmptyRow, ErrorRow, TableSkeletonRows } from "../../components/states";

/**
 * Per-expert slot utilisation.
 *
 * This table used to call `GET /api/slots`, which returns individual slot ROWS
 * (id, expert_id, date, start_time, end_time, status) — not per-expert
 * aggregates. It then read fields that endpoint has never returned and invented
 * the rest:
 *
 *   const total  = s.total_slots  || s.slots  || 24;
 *   const booked = s.booked_slots || s.booked || Math.floor(total * 0.6);
 *   chips: [allChips[Math.floor(Math.random() * allChips.length)]]   // random icon each render
 *   days:  s.available_days  || "Mon - Sun"
 *   hours: s.available_hours || "09:00 AM - 06:00 PM"
 *   <Image src="https://images.unsplash.com/photo-1507003211169-..." />  // one stock photo for everyone
 *
 * So every astrologer showed "24 slots, 60% booked" over invented working hours
 * under a stranger's face. It now reads GET /api/slots/availability, which
 * aggregates in SQL.
 */

type AvailabilityRow = {
  id: number;
  name: string;
  avatar: string | null;
  specialties: string | null;
  status: string;
  rating: number | string | null;
  total_slots: number;
  booked_slots: number;
  available_slots: number;
  blocked_slots: number;
  first_slot_date: string | null;
  last_slot_date: string | null;
  utilisation_pct: number;
};

const statusStyles: Record<string, string> = {
  active: "border-[#d3ecd6] bg-[#ebf8ec] text-[#2f8f5b]",
  inactive: "border-[#e6e6ec] bg-[#f4f4f7] text-[#8a86a0]",
};

const STATUS_OPTIONS = [
  { label: "All Status", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function AvailabilityTable() {
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.admin
      .getSlotAvailability(qs({ search: debouncedSearch, status }))
      .then((data: unknown) => {
        setRows(Array.isArray(data) ? (data as AvailabilityRow[]) : []);
      })
      .catch((e: Error) =>
        setError(e?.message || "Failed to load availability."),
      )
      .finally(() => setLoading(false));
  }, [debouncedSearch, status]);

  useEffect(() => {
    load();
  }, [load]);

  const COLS = 7;

  return (
    <section className="rounded-[14px] border border-[#ecebf1] bg-white shadow-[0_1px_2px_rgba(23,16,45,.03)]">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 px-5 pt-4">
        <div className="relative flex h-[36px] w-full max-w-[206px] items-center">
          <label htmlFor="availability-search" className="sr-only">
            Search astrologer by name
          </label>
          <input
            id="availability-search"
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search astrologer by name..."
            className="h-full w-full rounded-[8px] border border-[#e4e2ec] bg-white pl-3 pr-8 text-[11px] font-light text-[#3f3d56] outline-none placeholder:text-[#a5a2b3] focus:border-[#c9bfe4]"
          />
          <Search
            className="pointer-events-none absolute right-2.5 h-[14px] w-[14px] text-[#6f6b85]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div className="relative flex h-[36px] items-center">
          <label htmlFor="availability-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="availability-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-[36px] w-[126px] appearance-none rounded-[8px] border border-[#e4e2ec] bg-white pl-2.5 pr-7 text-[11px] text-[#3f3d56] outline-none focus:border-[#c9bfe4]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 h-[14px] w-[14px] text-[#8a86a0]"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        {/* Replaces a hardcoded "01 May 2025 - 18 May 2025" label: the endpoint
            defaults to today onward, so say that rather than invent a range. */}
        <span className="text-[11px] text-[#8a86a0]">
          Upcoming slots (today onward)
        </span>

        {loading && rows.length > 0 && (
          <Loader2
            className="ml-auto h-4 w-4 animate-spin text-[#7C3AED]"
            aria-label="Refreshing"
          />
        )}
      </div>

      <div className="overflow-x-auto px-5 pb-4 pt-2">
        <table className="w-full min-w-[760px] border-collapse">
          <caption className="sr-only">
            Astrologer slot availability and booking utilisation
          </caption>
          <thead>
            <tr className="border-b border-[#ecebf1]">
              <th
                scope="col"
                className="whitespace-nowrap py-2.5 pr-2 text-left text-[11px] font-medium text-[#6f6b85]"
              >
                Astrologer
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2.5 text-left text-[11px] font-medium text-[#6f6b85]"
              >
                Specialties
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2.5 text-left text-[11px] font-medium text-[#6f6b85]"
              >
                Slot Window
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2.5 text-left text-[11px] font-medium text-[#6f6b85]"
              >
                Available
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2.5 text-left text-[11px] font-medium text-[#6f6b85]"
              >
                Booked / Total
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-2 py-2.5 text-center text-[11px] font-medium text-[#6f6b85]"
              >
                Status
              </th>
              <th
                scope="col"
                className="whitespace-nowrap py-2.5 pl-2 text-center text-[11px] font-medium text-[#6f6b85]"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 ? (
              <TableSkeletonRows rows={5} cols={COLS} />
            ) : error ? (
              <ErrorRow colSpan={COLS} message={error} onRetry={load} />
            ) : rows.length === 0 ? (
              <EmptyRow
                colSpan={COLS}
                title="No astrologers found"
                message="Add an astrologer, or clear the filters above."
              />
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[#f2f1f6] last:border-b-0"
                >
                  <td className="py-3.5 pr-2">
                    <div className="flex items-center gap-2.5">
                      {r.avatar ? (
                        <Image
                          src={r.avatar}
                          alt=""
                          width={72}
                          height={72}
                          unoptimized
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        // Initials rather than a stock photo of an unrelated
                        // person, which is what every row previously showed.
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[11px] font-bold text-white"
                        >
                          {initials(r.name)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium leading-tight text-[#241f3d]">
                          {sanitize(r.name)}
                        </p>
                        <p className="mt-0.5 text-[10px] font-light leading-tight text-[#a5a2b3]">
                          {r.rating
                            ? `★ ${Number(r.rating).toFixed(1)}`
                            : "Not yet rated"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3.5">
                    <p
                      className="max-w-[160px] truncate text-[11px] text-[#3f3d56]"
                      title={sanitize(r.specialties) || undefined}
                    >
                      {sanitize(r.specialties) || "—"}
                    </p>
                  </td>

                  <td className="px-2 py-3.5">
                    {r.total_slots > 0 ? (
                      <>
                        <p className="whitespace-nowrap text-[11px] leading-tight text-[#3f3d56]">
                          {formatDate(r.first_slot_date)}
                        </p>
                        <p className="mt-1 whitespace-nowrap text-[10.5px] font-light leading-tight text-[#8a86a0]">
                          to {formatDate(r.last_slot_date)}
                        </p>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#a5a2b3]">
                        No slots scheduled
                      </span>
                    )}
                  </td>

                  <td className="px-2 py-3.5">
                    <span className="whitespace-nowrap text-[11.5px] font-medium text-[#241f3d]">
                      {r.available_slots}
                    </span>
                    {r.blocked_slots > 0 && (
                      <span className="ml-1 text-[10px] text-[#a5a2b3]">
                        ({r.blocked_slots} blocked)
                      </span>
                    )}
                  </td>

                  <td className="px-2 py-3.5">
                    <div className="w-[104px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-normal text-[#3f3d56]">
                          {r.booked_slots} / {r.total_slots}
                        </span>
                        <span className="text-[10px] font-medium text-[#6f6b85]">
                          {r.utilisation_pct}%
                        </span>
                      </div>
                      <div
                        className="mt-1.5 h-[4px] w-full rounded-full bg-[#eeecf4]"
                        role="progressbar"
                        aria-valuenow={r.utilisation_pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${sanitize(r.name)} slot utilisation`}
                      >
                        <div
                          className="h-full rounded-full bg-[#4c159f]"
                          style={{ width: `${r.utilisation_pct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-[3px] text-[10px] font-medium capitalize ${
                        statusStyles[r.status] || statusStyles.inactive
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3.5 pl-2">
                    <div className="flex items-center justify-center gap-1">
                      <Link
                        href={`/admin/expert-management?expert=${r.id}`}
                        aria-label={`View ${sanitize(r.name)}`}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[#e4e2ec] text-[#6f6b85] hover:bg-[#f7f6fb]"
                      >
                        <Eye
                          className="h-[13px] w-[13px]"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </Link>
                      <Link
                        href={`/admin/expert-management?expert=${r.id}&edit=1`}
                        aria-label={`Edit ${sanitize(r.name)}`}
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] border border-[#e4e2ec] text-[#6f6b85] hover:bg-[#f7f6fb]"
                      >
                        <Pencil
                          className="h-[13px] w-[13px]"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
