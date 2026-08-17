export default function HeroImageCard() {
  return (
    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative">
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, #3E1E7A 0%, #241535 55%, #150b21 100%)",
        }}
      >
        {/* mandala ring */}
        <div className="absolute w-56 h-56 rounded-full border border-amber-500/30" />
        <div className="absolute w-40 h-40 rounded-full border border-amber-500/20" />
        {/* glow */}
        <div
          className="absolute w-28 h-28 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,180,120,0.9) 0%, rgba(180,90,220,0.4) 60%, transparent 80%)",
            filter: "blur(6px)",
          }}
        />
        <span className="relative z-10 text-7xl select-none">🪷</span>
        <span className="absolute left-8 bottom-8 text-3xl select-none">
          🕯️
        </span>
        <span className="absolute right-8 bottom-8 text-3xl select-none">
          🕯️
        </span>
        <span className="absolute left-6 top-10 text-2xl select-none opacity-80">
          🔮
        </span>
        <span className="absolute right-6 top-10 text-2xl select-none opacity-80">
          🔮
        </span>
      </div>
    </div>
  );
}
