import { Award, UserCheck, Lightbulb, Headphones, Target } from "lucide-react";

const points = [
  {
    icon: Award,
    title: "Expertise You Trust",
    desc: "Guidance from experienced Reiki Grand Master & spiritual expert.",
  },
  {
    icon: UserCheck,
    title: "Personalized Guidance",
    desc: "Every session is customized as per your unique energy and concern.",
  },
  {
    icon: Lightbulb,
    title: "Advanced Insights",
    desc: "Deep spiritual insights and accurate guidance for better decisions.",
  },
  {
    icon: Headphones,
    title: "Continuous Support",
    desc: "Post-consultation support and follow-up guidance available.",
  },
  {
    icon: Target,
    title: "Transformative Results",
    desc: "Real healing, clarity and positive transformation in your life.",
  },
];

export default function WhyPricingWorthIt() {
  return (
    <section className="w-full bg-[#FCF9F3] px-6 md:px-10 pb-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="text-amber-500">✦</span>
          <h2 className="text-2xl font-serif font-bold tracking-wide text-[#3E1E7A]">
            WHY OUR PRICING IS WORTH IT
          </h2>
          <span className="text-amber-500">✦</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {points.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-3"
            >
              <span className="w-14 h-14 rounded-full border border-amber-300 flex items-center justify-center">
                <Icon size={22} className="text-[#5B2A9D]" />
              </span>
              <h3 className="text-[#3E1E7A] font-semibold text-sm">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
