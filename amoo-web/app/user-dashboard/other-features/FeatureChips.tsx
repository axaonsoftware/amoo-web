import {
  UserRound,
  ClipboardList,
  ClipboardCheck,
  BookOpenCheck,
  ShieldCheck,
} from "lucide-react";

const chips = [
  {
    Icon: UserRound,
    ring: "#ECE2FE",
    color: "#5030BE",
    title: "Personalized Experience",
    body: "Custom insights based on your birth details & preferences.",
  },
  {
    Icon: ClipboardList,
    ring: "#FDECD3",
    color: "#F5871F",
    title: "Expert Consultations",
    body: "Connect with verified astrologers & healers via chat, call or video.",
  },
  {
    Icon: ClipboardCheck,
    ring: "#E5EDFE",
    color: "#2557D6",
    title: "Accurate Reports",
    body: "AI-powered detailed reports for better decision making.",
  },
  {
    Icon: BookOpenCheck,
    ring: "#D6F2DC",
    color: "#1F9D4D",
    title: "Learn & Grow",
    body: "Courses, articles & spiritual tools to enhance your life.",
  },
  {
    Icon: ShieldCheck,
    ring: "#FDE0E4",
    color: "#E0182C",
    title: "Secure & Private",
    body: "Your data is 100% secure and never shared.",
  },
];

export default function FeatureChips() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px] sm:grid-cols-3 xl:grid-cols-5">
      {chips.map(({ Icon, ring, color, title, body }) => (
        <div
          key={title}
          className="flex min-h-[144px] items-start gap-[17px] rounded-[16px] border border-[#F2F1F9] bg-[linear-gradient(150deg,#FBFAFD_0%,#FFFFFF_60%)] px-[20px] py-[20px] shadow-[0_1px_2px_rgba(45,25,110,0.02)]"
        >
          <span
            className="flex h-[63px] w-[63px] shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: ring }}
          >
            <Icon
              className="h-[30px] w-[30px]"
              strokeWidth={1.8}
              style={{ color }}
            />
          </span>

          <div className="min-w-0 pt-[2px]">
            <h3 className="text-[14px] font-semibold leading-[1.4] text-[#241268]">
              {title}
            </h3>
            <p className="mt-[8px] text-[11.5px] font-normal leading-[1.8] text-[#6F6B8A]">
              {body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
