import { MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Amoo Guru",
};

export default function AstrologerDashboardPage() {
  return (
    <main id="main-content" className="flex-1 px-5 pb-8 pt-[18px] lg:px-6">
      <section>
        <div className="flex items-center gap-4">
          <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[16px] bg-[#f3ecfb]">
            <MessageSquare className="h-[26px] w-[26px] text-[#6d28d9]" strokeWidth={1.7} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[30px] font-bold leading-[1.15] text-[#4c1d95]">
              Welcome back
            </h1>
            <p className="mt-[5px] text-[13px] text-[#6c6b78]">
              Manage your consultations and respond to client messages.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/astrologer-dashboard/chat"
          className="group flex flex-col rounded-[16px] border border-[#efe6d6] bg-white p-6 shadow-[0_2px_12px_rgba(43,15,71,.06)] transition-shadow hover:shadow-[0_4px_20px_rgba(43,15,71,.12)]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3ecfb] transition-colors group-hover:bg-[#4a1c7d]">
            <MessageSquare className="h-6 w-6 text-[#6d28d9] transition-colors group-hover:text-white" strokeWidth={1.8} />
          </div>
          <h2 className="mt-4 text-[16px] font-bold text-[#2b0f47]">Messages</h2>
          <p className="mt-1 text-[13px] text-[#8b8697]">
            Chat with your clients in real time.
          </p>
        </Link>

        <div className="flex flex-col rounded-[16px] border border-[#efe6d6] bg-white p-6 shadow-[0_2px_12px_rgba(43,15,71,.06)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3ecfb]">
            <svg className="h-6 w-6 text-[#6d28d9]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          </div>
          <h2 className="mt-4 text-[16px] font-bold text-[#2b0f47]">My Schedule</h2>
          <p className="mt-1 text-[13px] text-[#8b8697]">
            View and manage your upcoming consultations.
          </p>
        </div>
      </div>
    </main>
  );
}
