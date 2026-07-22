import { ShieldCheck, Lock, Sparkles, Headphones } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "100% Secure",
    desc: "Encrypted Transactions",
  },
  {
    icon: Lock,
    title: "Privacy Protected",
    desc: "We respect your privacy",
  },
  {
    icon: Sparkles,
    title: "Trusted by 25K+",
    desc: "Happy Clients",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "We are here to help",
  },
];

export default function TrustBadges() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-amber-600" />
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-800 leading-tight">
              {title}
            </p>
            <p className="text-[11px] text-gray-400 leading-tight">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
