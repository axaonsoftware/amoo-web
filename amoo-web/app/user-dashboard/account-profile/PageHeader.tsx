import { UserRound, Flower2 } from "lucide-react";
import Mandala from "./Mandala";

export default function PageHeader() {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      {/* Title */}
      <div className="flex items-center gap-4">
        <span className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full bg-[#ece7fb]">
          <UserRound
            className="h-[30px] w-[30px] text-[#6b3fa0]"
            strokeWidth={1.7}
          />
        </span>
        <div>
          <h1 className="font-display text-[28px] font-bold leading-none text-[#2b0f47]">
            My Profile
          </h1>
          <p className="mt-[9px] text-[14px] text-[#6c6b78]">
            Manage your personal information and account settings
          </p>
        </div>
      </div>

      {/* Keep profile updated */}
      <div className="relative w-full overflow-hidden rounded-[16px] border border-[#f4e4cd] bg-gradient-to-r from-[#fdf2e4] to-[#fbe9d4] px-5 py-[18px] xl:w-[520px]">
        <Mandala className="pointer-events-none absolute -right-8 top-1/2 h-[150px] w-[150px] -translate-y-1/2 text-[#dd9a3f] opacity-30" />
        <div className="relative flex items-center gap-4">
          <Flower2
            className="h-[38px] w-[38px] shrink-0 text-[#e08a2b]"
            strokeWidth={1.7}
          />
          <div>
            <h3 className="text-[15px] font-bold text-[#2b0f47]">
              Keep Your Profile Updated
            </h3>
            <p className="mt-[3px] text-[13px] leading-[1.5] text-[#6c6b78]">
              Accurate information helps us provide
              <br />
              better &amp; personalized guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
