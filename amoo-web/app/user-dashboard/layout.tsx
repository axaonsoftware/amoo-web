import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { RequireAuth } from "../../lib/auth-context";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-[#faf7f2]">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          {children}
        </div>
      </div>
    </RequireAuth>
  );
}
