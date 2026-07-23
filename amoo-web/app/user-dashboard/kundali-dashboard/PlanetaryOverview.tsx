"use client";

import { ArrowRight, Loader2 } from "lucide-react";
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

const PLANET_ICONS =[SunGlyph, MoonGlyph, MarsGlyph, MercuryGlyph, JupiterGlyph, VenusGlyph, SaturnGlyph, RahuGlyph, KetuGlyph];
const PLANET_NAMES = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const BG_COLORS = ["bg-[#fdf0dc]", "bg-[#e7effb]", "bg-[#fdeaea]", "bg-[#e6f6ea]", "bg-[#fdf0dc]", "bg-[#fdeaf0]", "bg-[#e7effb]", "bg-[#e7effb]", "bg-[#f1e9fc]"];
const TEXT_COLORS = ["text-[#e0952e]", "text-[#3f5bd0]", "text-[#e0384e]", "text-[#2f9e56]", "text-[#e0952e]", "text-[#e0384e]", "text-[#3f5bd0]", "text-[#2f7fd8]", "text-[#7c3fc4]"];
const DEFAULT_SIGNS = ["Leo", "Taurus", "Gemini", "Leo", "Scorpio", "Leo", "Aquarius", "Cancer", "Capricorn"];

type Report = { id: number; title: string; type: string; created_at: string; content?: string };

function parseKundaliContent(content?: string): Record<string, string> | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {}
  return null;
}

export default function PlanetaryOverview() {
  const { data, loading, error } = useApi<{ data: Report[] }>(() => api.getReports());
  const kundaliReports = (data?.data ?? []).filter(
    (r) => r.type && r.type.toLowerCase().includes("kundali")
  );
  const latest = kundaliReports[0];
  const kundaliData = parseKundaliContent(latest?.content);
  const planets = PLANET_NAMES.map((name, i) => ({
    name,
    sign: kundaliData?.[`planet_${name.toLowerCase()}`] || DEFAULT_SIGNS[i],
    Icon: PLANET_ICONS[i],
    bg: BG_COLORS[i],
    color: TEXT_COLORS[i],
  }));
  return (
    <section className="rounded-[14px] border border-[#f0e7d8] bg-white px-5 py-[18px] shadow-[0_1px_3px_rgba(43,15,71,.04)]">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[19px] font-bold text-[#2b0f47]">Planetary Overview</h2>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#7a3fc0]"
        >
          View Details
          <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
        </button>
      </div>

      {loading ? (
        <div className="mt-3.5 flex items-center justify-center gap-2 py-6 text-[13px] text-[#8b8697]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <p className="mt-3.5 text-[12.5px] text-red-500">{error}</p>
      ) : kundaliReports.length === 0 ? (
        <p className="mt-3.5 text-[12.5px] text-[#8b8697]">No kundali data available. Generate a kundali to see planetary positions.</p>
      ) : (
      <div className="mt-3.5 grid grid-cols-3 border-t border-l border-[#f0e7d8]">
        {planets.map(({ name, sign, Icon, bg, color }) => (
          <div
            key={name}
            className="flex items-center gap-2.5 border-b border-r border-[#f0e7d8] px-3 py-[14px]"
          >
            <span
              className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
            >
              <Icon className="h-[16px] w-[16px]" strokeWidth={1.5} />
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] font-semibold text-[#2b0f47]">{name}</span>
              <span className="block text-[11px] text-[#8b8697]">{sign}</span>
            </span>
          </div>
        ))}
      </div>
      )}
    </section>
  );
}
