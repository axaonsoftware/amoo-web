"use client";

import Link from "next/link";
import { FileText, Download, Heart, Clock, ArrowRight } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = {
  id: number;
  user_id: number;
  service_id: number | null;
  type: string;
  title: string;
  content: string | null;
  file_url: string | null;
  status: string;
  is_favorite: boolean;
  downloaded: boolean;
  chakra_data: unknown;
  deleted_at: string | null;
  created_at: string;
};

type ReportsResponse = {
  success: boolean;
  data: Report[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export default function StatsRow() {
  const { data, loading } = useApi<ReportsResponse>(() => api.getReports());

  const reports = data?.data ?? [];
  const isRecentlyAdded = (createdAt: string, days = 30) => {
    const createdDate = new Date(createdAt).getTime();
    const daysInMs = days * 24 * 60 * 60 * 1000;
    return Date.now() - createdDate <= daysInMs;
  };

  const totalReports = data?.meta?.total ?? reports.length;

  const downloaded = reports.filter(
    (report) => report.downloaded === true,
  ).length;

  const favorites = reports.filter(
    (report) => report.is_favorite === true,
  ).length;

  const recentlyAdded = reports.filter((report) =>
    isRecentlyAdded(report.created_at, 30),
  ).length;

  const stats = [
    {
      label: "Total Reports",
      value: totalReports,
      Icon: FileText,
      tile: "bg-[#f3ecfb]",
      icon: "text-[#7c3aed]",
    },
    {
      label: "Downloaded",
      value: downloaded,
      Icon: Download,
      tile: "bg-[#fdf1dc]",
      icon: "text-[#e0a63f]",
    },
    {
      label: "Favorites",
      value: favorites,
      Icon: Heart,
      tile: "bg-[#fde8ee]",
      icon: "text-[#ef5f8b]",
    },
    {
      label: "Recently Added",
      value: recentlyAdded,
      Icon: Clock,
      tile: "bg-[#e7f8ee]",
      icon: "text-[#2eb872]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-[13px] sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, Icon, tile, icon }) => (
        <div
          key={label}
          className="rounded-[14px] border border-[#f0e7d8] bg-white px-[20px] py-[20px] shadow-[0_1px_2px_rgba(38,17,66,.04)]"
        >
          <div className="flex items-center gap-[16px]">
            <span
              className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] ${tile}`}
            >
              <Icon className={`h-[24px] w-[24px] ${icon}`} strokeWidth={1.8} />
            </span>

            <div className="min-w-0">
              <p className="text-[12.5px] leading-none text-[#7a7686]">
                {label}
              </p>

              <p className="mt-[8px] text-[26px] font-semibold leading-none text-[#2b0f47]">
                {loading ? "..." : value}
              </p>

              <Link
                href="/user-dashboard/my-reports"
                className="mt-[10px] inline-flex items-center gap-[5px] text-[11.5px] font-medium leading-none text-[#7c3aed]"
              >
                View All
                <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
