import { GiftIcon } from "../../components/home-icons";
import { PROMO_CODE } from "../../../lib/constants";

export default function OfferBar() {
  return (
    <div className="relative z-40 flex h-[46px] w-full items-center justify-center bg-[#12051f] px-5">
      <div className="flex items-center gap-2.5">
        <GiftIcon className="h-[15px] w-[15px] shrink-0 text-gold" />
        <p className="text-[13px] text-white">
          <span className="font-semibold text-gold">Special Offer:</span> Get
          15% OFF on All Consultations This Week Only!
        </p>
        <span className="ml-2 hidden h-[26px] items-center rounded-[6px] border border-gold/70 px-3 text-[12.5px] font-medium text-white sm:flex">
          Use Code:&nbsp;
          <span className="font-bold text-gold">{PROMO_CODE}</span>
        </span>
      </div>
    </div>
  );
}
