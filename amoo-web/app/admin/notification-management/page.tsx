"use client";
import { useRef } from "react";
import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import NotificationsPanel from "./NotificationsPanel";
import RightRail from "./RightRail";

export default function NotificationManagementPage() {
  const panelRef = useRef<any>(null);

  return (
    <main id="main-content" className="flex-1 px-4 pb-8 pt-[18px] sm:px-6">
      <PageHeader onAdd={() => panelRef.current?.openCompose?.()} />
      <StatsRow />
      <div className="mt-5 flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          <NotificationsPanel
            onReady={(fns: any) => {
              panelRef.current = fns;
            }}
          />
        </div>
        <RightRail />
      </div>
    </main>
  );
}
