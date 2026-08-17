import {
  MessageSquareText,
  PhoneOutgoing,
  Bookmark,
  ShoppingBag,
  Crown,
  BellRing,
  Clock,
  Headphones,
} from "lucide-react";

const items = [
  {
    Icon: MessageSquareText,
    bg: "#F2EAFF",
    color: "#4C1FC7",
    label: "Messages",
    sub: "Chat with astrologers",
  },
  {
    Icon: PhoneOutgoing,
    bg: "#E7F8E9",
    color: "#1B8A3A",
    label: "Call History",
    sub: "View your call history",
  },
  {
    Icon: Bookmark,
    bg: "#EBEFFE",
    color: "#33409E",
    label: "Saved Reports",
    sub: "Access your saved reports anytime",
  },
  {
    Icon: ShoppingBag,
    bg: "#EDF5FF",
    color: "#2E6FD0",
    label: "My Orders",
    sub: "View your all orders",
  },
  {
    Icon: Crown,
    bg: "#FDF2E0",
    color: "#F5871F",
    label: "Subscriptions",
    sub: "Manage your subscriptions",
  },
  {
    Icon: BellRing,
    bg: "#F1E8FD",
    color: "#7028D8",
    label: "Notifications",
    sub: "Stay updated with alerts",
  },
  {
    Icon: Clock,
    bg: "#ECF1FE",
    color: "#2C5BD8",
    label: "Reminders",
    sub: "Get important reminders",
  },
  {
    Icon: Headphones,
    bg: "#EAEDFD",
    color: "#2F4ED4",
    label: "Support",
    sub: "Help center & contact support",
  },
];

export default function MoreFeatures() {
  return (
    <section className="rounded-[18px] border border-[#F0EEF7] bg-[linear-gradient(150deg,#FBFAFD_0%,#FFFFFF_55%)] px-[22px] pb-[18px] pt-[19px] shadow-[0_1px_2px_rgba(45,25,110,0.02)]">
      <h2 className="text-[16px] font-bold leading-[1.3] text-[#241268]">
        10. More Useful Features
      </h2>

      <div className="mt-[19px] grid grid-cols-1 sm:grid-cols-2 gap-x-[10px] gap-y-[22px] sm:grid-cols-4 xl:grid-cols-8">
        {items.map(({ Icon, bg, color, label, sub }) => (
          <div key={label} className="flex flex-col">
            <span
              className="flex h-[45px] w-[45px] items-center justify-center rounded-[14px]"
              style={{ backgroundColor: bg }}
            >
              <Icon
                className="h-[23px] w-[23px]"
                strokeWidth={1.8}
                style={{ color }}
              />
            </span>
            <p className="mt-[15px] text-[13px] font-semibold leading-none text-[#241268]">
              {label}
            </p>
            <p className="mt-[9px] max-w-[104px] text-[11.5px] font-normal leading-[1.75] text-[#6F6B8A]">
              {sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
