import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { RequireAdmin } from "../../lib/auth-context";
import { AutoRefreshProvider } from "./AutoRefreshProvider";
import RefreshIndicator from "./RefreshIndicator";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdmin>
      <AutoRefreshProvider>
        <div className="flex min-h-screen bg-[#fbfaFd]">
          <AdminSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar />
            {children}
          </div>
        </div>
        <RefreshIndicator />
      </AutoRefreshProvider>
    </RequireAdmin>
  );
}
