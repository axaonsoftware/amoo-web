"use client";

import { useState } from "react";
import PageHeader from "./PageHeader";
import UpcomingConsultations from "./UpcomingConsultations";
import WhyBook from "./WhyBook";
import CalendarCard from "./CalendarCard";
import NeedHelp from "./NeedHelp";
import UnlockInsights from "./UnlockInsights";

type Tab =
  | "All"
  | "Upcoming"
  | "Requests"
  | "History"
  | "Cancelled"
  | "Completed";

export default function ConsultationsBookingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  return (
    <main id="main-content" className="flex-1 px-5 pb-8 pt-6 lg:px-[26px]">
      <PageHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        requestCount={0}
      />

      <div className="mt-[25px] grid grid-cols-1 items-start gap-[25px] xl:grid-cols-[1fr_378px]">
        <div className="flex min-w-0 flex-col gap-[25px]">
          <UpcomingConsultations activeTab={activeTab} />
          <WhyBook />
        </div>

        <div className="flex flex-col gap-[25px]">
          <CalendarCard />
          <NeedHelp />
          <UnlockInsights />
        </div>
      </div>
    </main>
  );
}