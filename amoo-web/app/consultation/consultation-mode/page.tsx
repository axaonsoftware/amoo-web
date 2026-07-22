"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { saveConsultationData } from "../lib/consultation-storage";
import { HomeHeader, OfferBar } from "../../components/home-header";
import Stepper from "./Stepper";
import ModeCards from "./ModeCards";
import TrustRow from "./TrustRow";
import StatsBand from "./StatsBand";

function ModePageInner() {
  const router = useRouter();
  const [service, setService] = useState("Selected Service");
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setService(params.get("service") || "Selected Service");
  }, []);

  const handleContinue = () => {
    if (selectedMode) {
      saveConsultationData({ mode: selectedMode });
      router.push(
        `/consultation/select-date-time?service=${encodeURIComponent(service)}&mode=${encodeURIComponent(selectedMode)}`
      );
    }
  };

  return (
    <>
      <OfferBar />
      <HomeHeader absolute={false} />
      <main className="min-h-screen bg-[#2a1046]">
        <div className="relative z-[1] -mt-[26px] rounded-t-[46px] bg-[#fbf6ef]">
          <Stepper />
          <ModeCards selectedMode={selectedMode} onSelectMode={setSelectedMode} />
          <TrustRow />

          {/* Continue button */}
          {selectedMode && (
            <div className="flex justify-center pb-8">
              <button
                type="button"
                onClick={handleContinue}
                className="flex h-[52px] items-center gap-3 rounded-xl bg-gradient-to-b from-[#f2cd76] to-[#dfa63f] px-10 text-[16px] font-semibold text-[#2b0a3d] shadow-[0_6px_20px_rgba(224,163,62,0.35)] transition-opacity hover:opacity-90"
              >
                Continue with {selectedMode}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <StatsBand />
      </main>
    </>
  );
}

export default function ConsultationModePage() {
  return <ModePageInner />;
}
