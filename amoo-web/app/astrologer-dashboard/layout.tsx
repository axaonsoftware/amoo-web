"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { RequireExpert, useAuth } from "@/lib/auth-context";
import CallSocketProvider from "../components/call/CallSocketProvider";
import IncomingCall from "../components/call/IncomingCall";

export const metadata = {
  title: "Expert Dashboard | Amoo Guru",
};

export default function AstrologerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <RequireExpert>
      {user?.id && (
        <>
          <CallSocketProvider role="expert" id={user.id} />
          <IncomingCall role="expert" id={user.id} />
        </>
      )}

      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          {children}
        </div>
      </div>
    </RequireExpert>
  );
}