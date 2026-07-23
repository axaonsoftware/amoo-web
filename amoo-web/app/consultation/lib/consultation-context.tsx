"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { saveConsultationData, loadConsultationData, type ConsultationData } from "./consultation-storage";

type ConsultationContextType = {
  data: ConsultationData;
  updateData: (partial: Partial<ConsultationData>) => void;
  clearData: () => void;
};

const ConsultationContext = createContext<ConsultationContextType | null>(null);

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ConsultationData>(() => {
    if (typeof window === "undefined") return {};
    return loadConsultationData();
  });

  const updateData = useCallback((partial: Partial<ConsultationData>) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      saveConsultationData(next);
      return next;
    });
  }, []);

  const clearData = useCallback(() => {
    setData({});
    saveConsultationData({});
  }, []);

  return (
    <ConsultationContext.Provider value={{ data, updateData, clearData }}>
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultation() {
  const ctx = useContext(ConsultationContext);
  if (!ctx) throw new Error("useConsultation must be used within ConsultationProvider");
  return ctx;
}
