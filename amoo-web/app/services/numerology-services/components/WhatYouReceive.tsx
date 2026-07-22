import { MessageCircle } from "lucide-react";
import { RECEIVE_ITEMS } from "./data";

export default function WhatYouReceive() {
  return (
    <section className="bg-[#FBF6EE] pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto bg-[#2a0f3f] rounded-2xl px-6 sm:px-10 py-10 grid lg:grid-cols-[1.6fr_1fr] gap-8 items-center">
        <div>
          <h3 className="text-amber-400 text-xl sm:text-2xl font-bold text-center lg:text-left mb-8">
            What You Will Receive
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {RECEIVE_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <span className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-gray-300 text-[11px] whitespace-pre-line leading-tight">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#3a1656]/60 border border-purple-800/60 rounded-xl p-6 text-center">
          <p className="text-amber-400 font-semibold mb-1">Not Sure Which Service</p>
          <p className="text-amber-400 font-semibold mb-3">is Right for You?</p>
          <p className="text-gray-300 text-sm mb-5">
            Talk to our expert and get free guidance.
          </p>
          <button className="bg-amber-500 hover:bg-amber-400 text-[#2a0f3f] font-semibold rounded px-6 py-2.5 text-sm flex items-center gap-2 mx-auto">
            <MessageCircle className="w-4 h-4" />
            Chat on WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}
