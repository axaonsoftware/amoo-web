import Image from "next/image";
import { HERO_FEATURES } from "./data";

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[700px]">
      <Image
        src="/numerology.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center]"
      />

      <div className="absolute inset-0 bg-black/35" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative">
        {/* breadcrumb */}

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* left copy */}

          {/* right portrait + wheel */}
          <div className="relative min-h-[420px] flex items-center justify-center">
            <div className="absolute left-2 bottom-2 flex flex-col items-center">
              <svg viewBox="0 0 120 100" className="w-28 h-24">
                <polygon
                  points="60,5 115,95 5,95"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                />
              </svg>
              <div className="-mt-16 text-amber-300 text-[10px] font-semibold grid grid-cols-3 gap-1 text-center">
                <span>1</span>
                <span>4</span>
                <span>7</span>
                <span>2</span>
                <span>5</span>
                <span>8</span>
                <span>3</span>
                <span>6</span>
                <span>9</span>
              </div>
              <p className="text-amber-300 text-[10px] mt-2 text-center leading-tight">
                Numbers
                <br />
                Reveal Destiny
              </p>
            </div>

            <div className="absolute right-0 bottom-0 w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-700 rounded-lg rotate-12 opacity-90" />
          </div>

          <div className="ml-auto lg:max-w-md">
            <h1 className="text-2xl sm:text-5xl font-extrabold leading-tight mb-1">
              <span className="text-amber-400">NUMEROLOGY</span>
              <br />
              <span className="text-white">SERVICES</span>
            </h1>
            <p className="text-gray-100 mt-5 max-w-md leading-relaxed">
              Numbers are not just digits – they are the language of the
              universe that reveal your true path.
            </p>
            <p className="text-gray-100 mt-4 max-w-md leading-relaxed text-sm">
              Discover the hidden patterns in your name, birth date and numbers
              to unlock your potential and create a more balanced and successful
              life.
            </p>

            <div className="flex gap-8 flex-wrap">
              {HERO_FEATURES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center gap-2 w-20"
                >
                  <span className="w-12 h-12 rounded-full border border-amber-500/50 flex items-center justify-center text-amber-400">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-gray-300 text-xs whitespace-pre-line leading-tight">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
