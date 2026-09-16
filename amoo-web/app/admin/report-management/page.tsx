"use client";

import { useCallback, useRef, useState } from "react";
import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import ReportsPanel from "./ReportsPanel";
import RightRail from "./RightRail";

type PanelStats = {
  total: number;
  pending: number;
  ready: number;
  rejected: number;
  thisMonth: number;
  avgPerDay: number;
};

type PanelFns = {
  openCompose: () => void;
  stats: PanelStats;
};

export default function ReportManagementPage() {
  const panelRef = useRef<{ openCompose: () => void } | null>(null);

  const [stats, setStats] = useState<PanelStats>({
    total: 0,
    pending: 0,
    ready: 0,
    rejected: 0,
    thisMonth: 0,
    avgPerDay: 0,
  });

  const handlePanelReady = useCallback((fns: PanelFns) => {
    panelRef.current = fns;
    setStats(fns.stats);
  }, []);

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <PageHeader onAdd={() => panelRef.current?.openCompose?.()} />

      <StatsRow />

      <div className="mt-5 flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          <ReportsPanel onReady={handlePanelReady} />
        </div>

        <RightRail stats={stats} />
      </div>
    </main>
  );
}
