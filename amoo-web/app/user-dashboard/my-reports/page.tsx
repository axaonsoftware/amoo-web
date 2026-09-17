"use client";

import { useState } from "react";
import PageHeader, { type ReportTab } from "./PageHeader";
import StatsRow from "./StatsRow";
import RecentReports from "./RecentReports";
import FiltersCard from "./FiltersCard";
import ReportCategories from "./ReportCategories";
import UnlockInsights from "./UnlockInsights";

export default function MyReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("All Reports");

  return (
    <main id="main-content" className="flex-1 px-5 pb-7 pt-6 lg:px-[26px]">
      <PageHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-4">
        <StatsRow />
      </div>

      <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1fr_400px]">
        <RecentReports activeTab={activeTab} />

        <div className="flex flex-col gap-[18px]">
          <FiltersCard />
          <ReportCategories />
        </div>
      </div>

      <div className="mt-[18px]">
        <UnlockInsights />
      </div>
    </main>
  );
}
