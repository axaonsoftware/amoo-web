import { ShieldCheck, MapPin, Award, Headphones } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "100% Secure",
    desc: "Your data is safe with us",
  },
  {
    icon: MapPin,
    title: "Trusted by 25K+",
    desc: "Users across the globe",
  },
  {
    icon: Award,
    title: "Expert Guidance",
    desc: "From verified professionals",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    desc: "We are here to assist you",
  },
];

export default function TrustBar() {
  return (
    <div className="w-full bg-[#F4F1FA] rounded-2xl mt-6 py-6 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3E1E7A] flex items-center justify-center shrink-0">
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
