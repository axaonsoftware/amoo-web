import Link from "next/link";
import { LayoutDashboard, ArrowRight } from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link
        href="/user-dashboard"
        className="flex items-center gap-2 border border-gray-200 rounded-lg px-6 py-3 text-sm font-medium text-gray-700 bg-white w-full sm:w-auto justify-center"
      >
        <LayoutDashboard size={16} />
        Go to Dashboard
      </Link>
      <Link
        href="/consultation/booking-summary"
        className="flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-[#3E1E7A] w-full sm:w-auto justify-center"
        style={{
          background: "linear-gradient(90deg,#F3D07A 0%,#C9932F 100%)",
        }}
      >
        Book Another Consultation
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
