"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import VerifyEmailBanner from "./VerifyEmailBanner";
import { RequireAuth, useAuth } from "../../lib/auth-context";
import CallSocketProvider from "../components/call/CallSocketProvider";
import IncomingCall from "../components/call/IncomingCall";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <RequireAuth>
      {user?.id && (
        <>
          <CallSocketProvider
            role={user.kind === "expert" ? "expert" : "user"}
            id={Number(user.id)}
          />

          <IncomingCall
            role={user.kind === "expert" ? "expert" : "user"}
            id={Number(user.id)}
          />
        </>
      )}

      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <div className="px-5 pt-4 lg:px-6">
            <VerifyEmailBanner />
          </div>

          {children}
        </div>
      </div>
    </RequireAuth>
  );
}
