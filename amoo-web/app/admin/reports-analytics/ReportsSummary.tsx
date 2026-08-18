"use client";
import { BarChart3, Sparkles, Hash, HandHeart, FileText } from "lucide-react";
import api from "../../../lib/api";
import { useAutoRefreshApi } from "../../../lib/useAutoRefreshApi";
import { EmptyState, ErrorState, Skeleton } from "../../components/states";
import { formatNumber, titleCase, toNumber } from "../../../lib/format";

type ReportTypeRow = {
  type: string;
  total: number | string;
  ready: number | string;
  pending: number | string;
};

/**
 * Backed by `GET /api/dashboard/reports/by-type`, which groups the `reports`
 * table by its real `type` column.
 *
 * The previous version listed five invented categories (Sales / User / Service
 * / Finance / Astrologer Reports) and derived their counts by multiplying one
 * total by hardcoded percentages (0.25, 0.17, 0.21, 0.19, 0.15). Those
 * categories do not exist in the schema — `reports.type` holds the astrology
 * report kinds the generators in report-generators/ produce.
 */

// report-generators/: kundali.js, numerology.js, tarot.js, reiki.js
const STYLE: Record<
  string,
  { Icon: typeof BarChart3; iconWrap: string; iconColor: string; desc: string }
> = {
  kundali: {
    Icon: Sparkles,
    iconWrap: "bg-[#F1EAFE]",
    iconColor: "text-[#7C3AED]",
    desc: "Birth chart and planetary analysis",
  },
  numerology: {
    Icon: Hash,
    iconWrap: "bg-[#FEF1E3]",
    iconColor: "text-[#F59E0B]",
    desc: "Life path and destiny numbers",
  },
  tarot: {
    Icon: BarChart3,
    iconWrap: "bg-[#E3F7EA]",
    iconColor: "text-[#16A34A]",
    desc: "Card spreads and interpretations",
  },
  reiki: {
    Icon: HandHeart,
    iconWrap: "bg-[#E7F0FE]",
    iconColor: "text-[#3B82F6]",
    desc: "Chakra balance and healing plans",
  },
};

const DEFAULT_STYLE = {
  Icon: FileText,
  iconWrap: "bg-[#F1EFF6]",
  iconColor: "text-[#6B6480]",
  desc: "Generated reports",
};

function styleFor(type: string) {
  const key = Object.keys(STYLE).find((k) => type.toLowerCase().includes(k));
  return key ? STYLE[key] : DEFAULT_STYLE;
}

export default function ReportsSummary() {
  const { data, loading, error, refetch } = useAutoRefreshApi<ReportTypeRow[]>(() =>
    api.admin.getReportsByType(), [], 30_000,
  );

  const rows = data ?? [];

  return (
    <section className="flex h-full flex-col rounded-[14px] border border-[#EFEDF4] bg-white p-[18px] shadow-[0_1px_2px_rgba(16,12,40,0.03)]">
      <h2 className="text-[14px] font-semibold text-[#1B1630]">
        Reports Summary
      </h2>

      {loading ? (
        <ul className="mt-4 flex flex-1 flex-col justify-between gap-[14px]">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex items-center gap-[10px]">
              <Skeleton className="h-[32px] w-[32px] shrink-0 rounded-[9px]" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-[11px] w-[45%]" />
                <Skeleton className="mt-[5px] h-[9px] w-[65%]" />
              </div>
              <Skeleton className="h-[10px] w-[52px] shrink-0" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <ErrorState className="mt-[14px]" message={error} onRetry={refetch} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No reports generated"
          message="Counts appear here as users and admins generate reports."
        />
      ) : (
        <ul className="mt-4 flex flex-1 flex-col justify-between gap-[14px]">
          {rows.map((r) => {
            const st = styleFor(r.type);
            const pending = toNumber(r.pending);
            return (
              <li key={r.type} className="flex items-center gap-[10px]">
                <div
                  className={`grid h-[32px] w-[32px] shrink-0 place-items-center rounded-[9px] ${st.iconWrap}`}
                >
                  <st.Icon size={16} className={st.iconColor} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-[#1B1630]">
                    {titleCase(r.type)}
                  </p>
                  <p className="truncate text-[9.5px] text-[#A5A2B5]">
                    {pending > 0
                      ? `${formatNumber(pending)} pending generation`
                      : st.desc}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-[10px] text-[#8B879C]">
                  {formatNumber(r.total)} Reports
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
