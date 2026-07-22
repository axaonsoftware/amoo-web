import Link from "next/link";
import { ChevronRight, Users, Upload, Plus } from "lucide-react";

export default function PageHeader() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-[6px] text-[11.5px] text-[#8B879C]">
        <Link href="/admin/admin-dashboard" className="hover:text-[#5B2497]">
          Dashboard
        </Link>
        <ChevronRight size={12} className="text-[#B7B3C4]" />
        <Link href="/admin/user-management" className="hover:text-[#5B2497]">
          User Management
        </Link>
        <ChevronRight size={12} className="text-[#B7B3C4]" />
        <span className="font-medium text-[#2E2A3B]">All Users</span>
      </nav>

      {/* Title row */}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#4E1C8E] to-[#7A34C4] text-white shadow-[0_6px_16px_rgba(91,36,151,.28)]">
          <Users size={24} />
        </span>

        <div className="min-w-0">
          <h1 className="font-[var(--font-playfair)] text-[25px] font-bold leading-[1.15] text-[#1D1630]">
            User Management
          </h1>
          <p className="mt-[3px] text-[12px] text-[#7C7890]">
            Manage, monitor and control all registered users on the platform.
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-[42px] items-center gap-2 rounded-[10px] border border-[#E2DFEA] bg-white px-[18px] text-[12.5px] font-medium text-[#2E2A3B] hover:bg-[#FAF9FC]"
          >
            <Upload size={15} className="text-[#4A4658]" />
            Export Users
          </button>

          <button
            type="button"
            className="inline-flex h-[42px] items-center gap-2 rounded-[10px] bg-gradient-to-r from-[#4C1D95] to-[#6D28D9] px-[18px] text-[12.5px] font-semibold text-white shadow-[0_6px_16px_rgba(91,36,151,.25)]"
          >
            <Plus size={16} />
            Add New User
          </button>
        </div>
      </div>
    </>
  );
}
