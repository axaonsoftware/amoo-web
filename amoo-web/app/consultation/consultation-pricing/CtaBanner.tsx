import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { WHATSAPP_URL } from "../../../lib/constants";

export default function CtaBanner() {
  return (
    <section className="w-full px-6 md:px-10 pb-14 bg-[#FCF9F3]">
      <div
        className="max-w-6xl mx-auto rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 0% 50%, #241535 0%, #150b21 60%, #0d0616 100%)",
        }}
      >
        <div className="hidden md:block text-6xl opacity-80 select-none">
          🕯️🔮
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-white font-serif font-bold text-2xl leading-snug">
            Ready to Get Your Answers &amp; Transform Your Life?
          </h2>
          <p className="text-white/70 text-sm mt-2">
            Book your personalized consultation with Reiki Grand Master
            Surinder Kaur Sehgal today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/consultation/select-service"
            className="flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-[#3E1E7A] whitespace-nowrap"
            style={{
              background: "linear-gradient(90deg,#F3D07A 0%,#C9932F 100%)",
            }}
          >
            Book Consultation Now
            <ArrowRight size={15} />
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white border border-white/30 whitespace-nowrap"
          >
            <MessageCircle size={15} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
