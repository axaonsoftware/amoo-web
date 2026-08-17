"use client";
import { useState, useRef } from "react";
import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import ExpertPanel from "./ExpertPanel";
import RightRail from "./RightRail";
import { api } from "../../../lib/api";
import type { Expert } from "../../../lib/types";

export default function ExpertManagementPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const panelRef = useRef<{
    openCreate: () => void;
    exportData: () => void;
  } | null>(null);

  const loadExperts = async () => {
    try {
      const res = await api.admin.getExperts();
      const list = Array.isArray(res) ? res : [];
      setExperts(list);
    } catch {
      setExperts([]);
    }
  };

  return (
    <div className="flex flex-1 gap-5 bg-[#F8F7FC] px-6 pb-6">
      <div className="min-w-0 flex-1">
        <div className="pt-6">
          <PageHeader onAdd={() => panelRef.current?.openCreate?.()} />
        </div>
        <StatsRow experts={experts} />
        <ExpertPanel
          onReady={(fns) => {
            panelRef.current = fns;
            loadExperts();
          }}
        />
      </div>
      <RightRail />
    </div>
  );
}
