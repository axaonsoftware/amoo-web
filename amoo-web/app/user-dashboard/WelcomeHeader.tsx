"use client";

import { Flower2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";

function Mandala() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full text-[#e9b85c]" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="96" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" opacity=".8" />
      <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="1" opacity=".45" />
      <circle cx="100" cy="100" r="34" stroke="currentColor" strokeWidth="1" opacity=".6" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos((i * Math.PI) / 12)} y2={100 + 80 * Math.sin((i * Math.PI) / 12)} stroke="currentColor" strokeWidth="0.7" opacity=".35" />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i} cx={100 + 71 * Math.cos((i * Math.PI) / 6 - Math.PI / 2)} cy={100 + 71 * Math.sin((i * Math.PI) / 6 - Math.PI / 2)} r="2.4" fill="currentColor" opacity=".85" />
      ))}
      <circle cx="100" cy="100" r="16" fill="#f6d78e" opacity=".95" />
      <circle cx="100" cy="100" r="26" fill="#e9b85c" opacity=".22" />
    </svg>
  );
}

export default function WelcomeHeader() {
  const { data, loading, error } = useApi(() => api.me());
  const name = data?.user?.name || data?.name || "there";

  if (loading) {
    return (
      <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Flower2 className="mt-[6px] h-8 w-8 shrink-0 text-[#e0983c]" strokeWidth={1.5} />
          <div>
            <p className="text-[14px] font-normal text-[#5c5568]">Welcome back,</p>
            <h1 className="mt-[2px] font-display text-[27px] font-bold leading-none text-[#4a1c7d]">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <Flower2 className="mt-[6px] h-8 w-8 shrink-0 text-[#e0983c]" strokeWidth={1.5} />
          <div>
            <p className="text-[14px] font-normal text-[#5c5568]">Welcome back,</p>
            <h1 className="mt-[2px] font-display text-[27px] font-bold leading-none text-[#4a1c7d]">there</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <Flower2 className="mt-[6px] h-8 w-8 shrink-0 text-[#e0983c]" strokeWidth={1.5} />
        <div>
          <p className="text-[14px] font-normal text-[#5c5568]">Welcome back,</p>
          <h1 className="mt-[2px] font-display text-[27px] font-bold leading-none text-[#4a1c7d]">{name}</h1>
          <p className="mt-2.5 text-[13px] italic text-[#6c6b78]">
            &ldquo;The stars incline us, they do not bind us.&rdquo; <span className="not-italic text-[#8054bf]">— William Shakespeare</span>
          </p>
        </div>
      </div>

      <div className="relative w-full shrink-0 overflow-hidden rounded-[14px] bg-gradient-to-r from-[#1c0733] via-[#2a0f47] to-[#3b1665] px-6 py-5 shadow-[0_10px_30px_rgba(42,17,72,.25)] lg:w-[430px]">
        <div className="stars pointer-events-none absolute inset-0 opacity-50" />
        <div className="pointer-events-none absolute -right-8 -top-6 h-[150px] w-[150px] opacity-90">
          <Mandala />
        </div>
        <div className="relative max-w-[280px]">
          <p className="text-[13px] font-semibold text-[#e9b85c]">Today&apos;s Guidance</p>
          <p className="mt-2 font-display text-[15px] font-semibold leading-[1.55] text-white">
            Trust the timing of your life.
            <br />
            Everything is unfolding as it should.
          </p>
        </div>
      </div>
    </div>
  );
}
