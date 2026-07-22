import { SITE_NAME } from "../../../lib/constants";

export default function ThankYouBanner() {
  return (
    <div className="w-full bg-[#F4F1FA] rounded-2xl px-6 py-6 flex items-center justify-between relative overflow-hidden">
      <div>
        <h3 className="text-[#3E1E7A] font-serif font-bold text-lg">
          Thank you for trusting {SITE_NAME}!
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          We look forward to guiding you on your journey of healing and
          transformation.
        </p>
      </div>
      <span className="hidden sm:flex w-14 h-14 rounded-full bg-amber-100 items-center justify-center text-2xl shrink-0">
        🪷
      </span>
    </div>
  );
}
