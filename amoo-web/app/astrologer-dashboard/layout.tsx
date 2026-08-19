import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { RequireExpert } from "@/lib/auth-context";

export const metadata = {
  title: "Expert Dashboard | Amoo Guru",
};

export default function AstrologerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireExpert>
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
