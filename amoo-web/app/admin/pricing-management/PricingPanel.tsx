"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Eye,
  Pencil,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { serviceTone, planTypeTone } from "./data";
import { api } from "../../../lib/api";

const tabs = [
  { label: "All Plans", active: true },
  { label: "Service Packages" },
  { label: "Subscriptions" },
  { label: "Offers & Coupons" },
];

const planTypes = ["All Plan Types", "Subscription", "One-time"];
const statuses = ["All Status", "Active", "Inactive"];

export default function PricingPanel() {
  const [list, setList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [services, setServices] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([api.admin.getPackages(), api.admin.getServices()])
      .then(([pkgData, svcData]: any[]) => {
        const pkgItems = pkgData?.data ?? pkgData;
        if (pkgData?.meta?.total) setTotal(pkgData.meta.total);
        if (Array.isArray(pkgItems) && pkgItems.length) {
          const svcItems = Array.isArray(svcData?.data ?? svcData) ? (svcData?.data ?? svcData) : [];
          const svcNames = svcItems.map((s: any) => s.name || s.title).filter(Boolean);
          setServices(svcNames);

          setList(
            pkgItems.map((p: any) => {
              const matchedSvc = svcNames.find((name: string) =>
                name.toLowerCase() === (p.service_name || "").toLowerCase()
              );
              return {
                id: p.id,
                name: p.name,
                sub: p.description,
                img: "/imagesP/aura_scanner.png",
                service: matchedSvc || "All",
                planType: p.plan_type || "Subscription",
                price: `₹ ${Number(p.price).toLocaleString("en-IN")}`,
                duration: p.duration_days ? `${p.duration_days} days` : "-",
                status: p.status,
                bookings: "-",
              };
            })
          );
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const rows = list || [];

  if (loading) return <div className="flex justify-center py-10"><svg className="h-6 w-6 animate-spin text-[#7C3AED]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeLinecap="round" /></svg></div>;
  if (error) return <div className="flex justify-center py-10 text-[#EF4444] text-[13px]">{error}</div>;

  return (
    <section className="rounded-[14px] border border-[#EEEDF4] bg-white shadow-[0_1px_2px_rgba(20,16,40,.04)]">
      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-[#EEEDF4] px-6">
        {tabs.map((t) => (
          <button
            key={t.label}
            type="button"
            className={`shrink-0 border-b-2 pb-[11px] pt-[13px] text-[12px] ${
              t.active
                ? "border-[#7C3AED] font-medium text-[#7C3AED]"
                : "border-transparent font-normal text-[#7C748C] hover:text-[#2E2A3B]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-[18px] px-6 pb-[14px] pt-[16px]">
        <div className="flex h-[34px] w-full max-w-[200px] items-center rounded-[8px] border border-[#E7E5EF] pl-3 pr-2">
          <input
            type="text"
            placeholder="Search plan name..."
            className="h-full w-full bg-transparent text-[11px] text-[#2E2A3B] outline-none placeholder:text-[#A5A2B5]"
          />
          <Search size={14} className="shrink-0 text-[#6B6480]" />
        </div>

        {[
          ["All Services", ...services],
          ...planTypes.map((t) => [t]),
          ...statuses.map((s) => [s]),
        ].map((opts, i) => (
          <button
            key={i}
            type="button"
            className="flex h-[34px] w-[140px] items-center justify-between rounded-[8px] border border-[#E7E5EF] px-3 text-[11px] text-[#3D3752]"
          >
            {opts[0]}
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        ))}

        <button
          type="button"
          className="ml-auto flex h-[34px] items-center gap-[6px] rounded-[8px] border border-[#E7E5EF] px-[14px] text-[11px] text-[#3D3752]"
        >
          <SlidersHorizontal size={13} className="text-[#6B6480]" />
          Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-6">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr className="border-y border-[#EEEDF4] bg-[#FAFAFC]">
              {[
                "Plan Name",
                "Service",
                "Plan Type",
                "Price",
                "Duration",
                "Status",
                "Bookings",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-[11px] text-left text-[10.5px] font-medium text-[#6B6480] first:pl-3 last:pr-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={(r as any).id ?? r.name} className="border-b border-[#F2F1F7]">
                <td className="py-[12px] pl-3 pr-2">
                  <div className="flex items-center gap-[10px]">
                    <Image
                      src={r.img}
                      alt=""
                      width={32}
                      height={32}
                      className="h-[32px] w-[32px] shrink-0 rounded-full object-cover"
                    />
                    <div className="leading-tight">
                      <p className="text-[11.5px] font-semibold text-[#1F1836]">
                        {r.name}
                      </p>
                      <p className="mt-[2px] text-[9.5px] text-[#8B879C]">
                        {r.sub}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-2 py-[12px]">
                  <span
                    className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${serviceTone[r.service]}`}
                  >
                    {r.service}
                  </span>
                </td>

                <td className="px-2 py-[12px]">
                  <span
                    className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${planTypeTone[r.planType]}`}
                  >
                    {r.planType}
                  </span>
                </td>

                <td className="px-2 py-[12px] text-[11.5px] font-semibold text-[#1F1836]">
                  {r.price}
                </td>

                <td className="px-2 py-[12px] text-[11px] text-[#3D3752]">
                  {r.duration}
                </td>

                <td className="px-2 py-[12px]">
                  <span
                    className={`inline-flex items-center rounded-[6px] px-[8px] py-[4px] text-[9.5px] font-medium ${
                      r.status === "Active"
                        ? "bg-[#E6F7EE] text-[#16A34A]"
                        : "bg-[#FDE8E8] text-[#EF4444]"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="px-2 py-[12px] text-[11px] text-[#3D3752]">
                  {r.bookings}
                </td>

                <td className="py-[12px] pl-2 pr-3">
                  <div className="flex items-center gap-[6px]">
                    <button
                      type="button"
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#6B6480] hover:bg-[#F7F6FB]"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      type="button"
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#6B6480] hover:bg-[#F7F6FB]"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#6B6480] hover:bg-[#F7F6FB]"
                    >
                      <MoreVertical size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-[16px] pt-[14px]">
        <p className="text-[10.5px] text-[#8B879C]">
          Showing 1 to 10 of {(total || rows.length).toLocaleString("en-IN")} plans
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-[6px]">
            <button
              type="button"
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C]"
            >
              <ChevronLeft size={13} />
            </button>

            {["1", "2", "3", "4", "5"].map((p) => (
              <button
                key={p}
                type="button"
                className={`grid h-[26px] w-[26px] place-items-center rounded-[6px] text-[10.5px] ${
                  p === "1"
                    ? "bg-[#6D28D9] font-medium text-white"
                    : "border border-[#E7E5EF] text-[#3D3752] hover:bg-[#F7F6FB]"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[10.5px] text-[#3D3752]"
            >
              …
            </button>

            <button
              type="button"
              className="grid h-[26px] w-[26px] place-items-center rounded-[6px] border border-[#E7E5EF] text-[#8B879C]"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          <button
            type="button"
            className="flex h-[28px] w-[110px] items-center justify-between rounded-[8px] border border-[#E7E5EF] px-3 text-[10.5px] text-[#3D3752]"
          >
            10 / page
            <ChevronDown size={14} className="text-[#8B879C]" />
          </button>
        </div>
      </div>
    </section>
  );
}
