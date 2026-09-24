import Image from "next/image";
import { HERO_FEATURES } from "./data";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden sm:min-h-[700px]">
      {/* Image */}
      <div className="relative h-[300px] w-full sm:absolute sm:inset-0 sm:h-full">
        <Image
          src="/numerology.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[15%_center] sm:object-[70%_center]"
        />
      </div>

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 hidden bg-black/35 sm:block" />

      <div className="relative mx-auto w-full max-w-7xl px-0 sm:px-6">
        <div className="relative bg-[#1b0c30] px-5 py-8 sm:bg-transparent sm:px-0 sm:py-10">
          <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
            {/* Left copy / decorative area */}
            <div className="relative hidden min-h-[420px] items-center justify-center lg:flex">
              <div className="absolute bottom-2 left-2 flex flex-col items-center">
                <svg viewBox="0 0 120 100" className="h-24 w-28">
                  <polygon
                    points="60,5 115,95 5,95"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="1.5"
                  />
                </svg>

                <div className="-mt-16 grid grid-cols-3 gap-1 text-center text-[10px] font-semibold text-amber-300">
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

                <p className="mt-2 text-center text-[10px] leading-tight text-amber-300">
                  Numbers
                  <br />
                  Reveal Destiny
                </p>
              </div>

              <div className="absolute right-0 bottom-0 h-16 w-16 rotate-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-700 opacity-90" />
            </div>

            {/* Right content */}
            <div className="w-full lg:ml-auto lg:max-w-md">
              <h1 className="text-3xl leading-[1.1] font-extrabold sm:text-5xl">
                <span className="text-amber-400">NUMEROLOGY</span>
                <br />
                <span className="text-white">SERVICES</span>
              </h1>

              <p className="mt-4 max-w-md text-[14px] leading-[1.6] text-gray-100 sm:mt-5 sm:text-base sm:leading-relaxed">
                Numbers are not just digits – they are the language of the
                universe that reveal your true path.
              </p>

              <p className="mt-3 max-w-md text-[13px] leading-[1.6] text-gray-100 sm:mt-4 sm:text-sm sm:leading-relaxed">
                Discover the hidden patterns in your name, birth date and
                numbers to unlock your potential and create a more balanced and
                successful life.
              </p>

              <div className="mt-6 flex w-full flex-wrap justify-center gap-x-5 gap-y-6 sm:gap-x-8 lg:justify-start">
                {HERO_FEATURES.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex w-[calc(50%-10px)] flex-col items-center gap-2 text-center sm:w-20"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/50 text-amber-400">
                      <Icon className="h-5 w-5" />
                    </span>

                    <span className="text-xs leading-tight whitespace-pre-line text-gray-300">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
