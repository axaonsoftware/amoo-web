import { ShieldCheck, UserCheck, CalendarClock, Award, Flower2 } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "100% Secure & Private",
    desc: "Your information is safe with us.",
  },
  {
    icon: UserCheck,
    title: "Expert Guidance",
    desc: "Consult with experienced spiritual experts.",
  },
  {
    icon: CalendarClock,
    title: "Flexible Rescheduling",
    desc: "Reschedule or change slots with ease.",
  },
  {
    icon: Award,
    title: "Trusted by 25K+",
    desc: "Happy clients across the globe.",
  },
  {
    icon: Flower2,
    title: "Holistic Healing",
    desc: "Empowering you towards a better you.",
  },
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
      {badges.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex flex-col items-center text-center gap-3">
          <span className="w-14 h-14 rounded-full border border-amber-300 flex items-center justify-center">
            <Icon size={22} className="text-amber-600" />
          </span>
          <h4 className="text-[#3E1E7A] font-semibold text-sm">{title}</h4>
          <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}
