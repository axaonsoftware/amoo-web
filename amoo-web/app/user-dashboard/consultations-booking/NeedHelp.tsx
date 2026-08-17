import Link from "next/link";
import { PhoneCall, CircleHelp, TicketCheck, ChevronRight } from "lucide-react";

const links = [
  { label: "Contact Support", Icon: PhoneCall, href: "/contact" },
  { label: "View FAQs", Icon: CircleHelp, href: "/contact" },
  { label: "Create a Support Ticket", Icon: TicketCheck, href: "/contact" },
];

export default function NeedHelp() {
  return (
    <section className="rounded-[16px] border border-[#efe6d6] bg-white px-[18px] pb-[18px] pt-[18px] shadow-[0_1px_2px_rgba(38,17,66,.04)]">
      <h2 className="font-display text-[19px] font-bold text-[#4c1d95]">
        Need Help?
      </h2>
      <p className="mt-1.5 text-[12px] text-[#8b8697]">
        We are here to help you with your spiritual journey.
      </p>

      <div className="mt-3.5 flex flex-col gap-2.5">
        {links.map(({ label, Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-[12px] border border-[#f0e9dd] bg-white px-3.5 py-[13px]"
          >
            <Icon
              className="h-[18px] w-[18px] shrink-0 text-[#7c4ec4]"
              strokeWidth={1.8}
            />
            <span className="flex-1 text-[13px] font-medium text-[#3f3a4a]">
              {label}
            </span>
            <ChevronRight
              className="h-[16px] w-[16px] shrink-0 text-[#a8a2b3]"
              strokeWidth={2}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
