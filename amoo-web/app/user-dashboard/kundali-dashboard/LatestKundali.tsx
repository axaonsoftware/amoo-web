"use client";

import { ArrowRight, User, Info, Loader2 } from "lucide-react";
import NorthChart from "./NorthChart";
import {
  SunGlyph,
  MoonGlyph,
  MarsGlyph,
  MercuryGlyph,
  JupiterGlyph,
  VenusGlyph,
  SaturnGlyph,
  RahuGlyph,
  KetuGlyph,
} from "./planet-icons";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

type Report = {
  id: number;
  title: string;
  type: string;
  created_at: string;
  content?: string;
};

const DETAIL_ICONS = [
  SunGlyph,
  MoonGlyph,
  MercuryGlyph,
  SaturnGlyph,
  VenusGlyph,
];
const DETAIL_COLORS = [
  "text-[#e0952e]",
  "text-[#7c3fc4]",
  "text-[#a53fc4]",
  "text-[#3f5bd0]",
  "text-[#e04a6a]",
];
const DETAIL_LABELS = [
  "Lagna (Ascendant)",
  "Moon Sign",
  "Nakshatra",
  "Rashi",
  "Sun Sign",
];
const DEFAULT_SIGN_VALUES = ["Leo", "Taurus", "Rohini", "Vrishabha", "Leo"];

const POSITION_ICONS = [
  SunGlyph,
  MoonGlyph,
  MarsGlyph,
  MercuryGlyph,
  JupiterGlyph,
  VenusGlyph,
  SaturnGlyph,
  RahuGlyph,
  KetuGlyph,
];
const POSITION_COLORS = [
  "text-[#e0952e]",
  "text-[#7c3fc4]",
  "text-[#e0384e]",
  "text-[#1f9d55]",
  "text-[#e0952e]",
  "text-[#e0384e]",
  "text-[#3f5bd0]",
  "text-[#2f7fd8]",
  "text-[#7c3fc4]",
];
const POSITION_NAMES = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
];
const DEFAULT_POSITION_SIGNS = [
  "Leo",
  "Taurus",
  "Gemini",
  "Leo",
  "Scorpio",
  "Leo",
  "Aquarius",
  "Cancer",
  "Capricorn",
];

function parseKundaliContent(content?: string): Record<string, string> | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}
  return null;
}

export default function LatestKundali() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() =>
    api.getReports(),
  );
  const kundaliReports = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase().includes("kundali"),
  );
  const latest = kundaliReports[0];
  const kundaliData = parseKundaliContent(latest?.content);
  const signValues = DETAIL_LABELS.map(
    (_, i) =>
      kundaliData?.[`detail_${i}`] ||
      kundaliData?.[DETAIL_LABELS[i].split(" ")[0].toLowerCase()] ||
      DEFAULT_SIGN_VALUES[i],
  );
  const positionSigns = POSITION_NAMES.map(
    (name, i) =>
      kundaliData?.[`planet_${name.toLowerCase()}`] ||
      DEFAULT_POSITION_SIGNS[i],
  );
  return (
    <section className="rounded-[14px] border border-[#f0e7d8] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      {/* Head */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">
          Your Latest Kundali
        </h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View Full Report
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-4 text-[12.5px] text-red-500">{error}</p>
      ) : kundaliReports.length === 0 ? (
        <p className="mt-4 text-[12.5px] text-[#8b8697]">
          No kundali reports yet. Generate your first birth chart to see details
          here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_262px_1fr]">
          {/* Left: person + details */}
          <div>
            <div className="flex items-start gap-3">
              <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#f1e9fc] text-[#7a3fc0]">
                <User className="h-[21px] w-[21px]" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-[#2b0f47]">
                  {latest ? latest.title : "Birth Chart"}
                </p>
                <p className="mt-[3px] text-[11.5px] leading-[1.6] text-[#6c6b78]">
                  {latest
                    ? new Date(latest.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "No kundali data"}
                </p>
              </div>
            </div>

            <ul className="mt-4">
              {DETAIL_LABELS.map((label, i) => {
                const Icon = DETAIL_ICONS[i];
                return (
                  <li
                    key={label}
                    className={`flex items-center gap-2.5 py-[10px] ${
                      i === 0 ? "" : "border-t border-[#f2ecf7]"
                    }`}
                  >
                    {Icon ? (
                      <Icon
                        className={`h-[15px] w-[15px] shrink-0 ${DETAIL_COLORS[i]}`}
                        strokeWidth={1.5}
                      />
                    ) : null}
                    <span className="flex-1 text-[12px] font-medium text-[#4b4757]">
                      {label}
                    </span>
                    <span className="text-[12px] font-semibold text-[#2b0f47]">
                      {signValues[i]}
                    </span>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#5a2296] to-[#3d1268] px-5 py-[11px] text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(61,18,104,.28)]"
            >
              View Full Kundali
              <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.2} />
            </button>
          </div>

          {/* Middle: chart */}
          <div className="flex justify-center">
            <NorthChart />
          </div>

          {/* Right: planetary positions */}
          <div>
            <h3 className="text-[13px] font-semibold text-[#2b0f47]">
              Planetary Positions
            </h3>
            <ul className="mt-2.5">
              {POSITION_NAMES.map((name, i) => {
                const Icon = POSITION_ICONS[i];
                return (
                  <li
                    key={name}
                    className="flex items-center gap-2.5 py-[6.5px]"
                  >
                    {Icon ? (
                      <Icon
                        className={`h-[15px] w-[15px] shrink-0 ${POSITION_COLORS[i]}`}
                        strokeWidth={1.5}
                      />
                    ) : null}
                    <span className="flex-1 text-[12px] font-medium text-[#4b4757]">
                      {name}
                    </span>
                    <span className="text-[12px] font-semibold text-[#2b0f47]">
                      {positionSigns[i]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="mt-4 flex items-center gap-2.5 rounded-[10px] border border-[#efe6d6] bg-[#faf7f2] px-4 py-[11px]">
        <Info
          className="h-[15px] w-[15px] shrink-0 text-[#a08cc0]"
          strokeWidth={1.8}
        />
        <p className="text-[11.5px] text-[#6c6b78]">
          The positions of planets at the time of your birth influence your
          personality, life path and future events.
        </p>
      </div>
    </section>
  );
}
