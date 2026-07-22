import {
  TrustInstallIcon,
  TrustLotusIcon,
  TrustSecureIcon,
  TrustSupportIcon,
  TrustUpdatesIcon,
  TrustWindowsIcon,
} from "./icons";

const ITEMS = [
  { Icon: TrustLotusIcon, l1: "100% Accurate", l2: "Calculations" },
  { Icon: TrustInstallIcon, l1: "Easy Installation", l2: "& Activation" },
  { Icon: TrustUpdatesIcon, l1: "Regular Updates", l2: "& New Features" },
  { Icon: TrustSupportIcon, l1: "Dedicated Customer", l2: "Support" },
  { Icon: TrustSecureIcon, l1: "Secure &", l2: "Reliable" },
  { Icon: TrustWindowsIcon, l1: "Works on Windows", l2: "(All Versions)" },
];

export default function TrustBar() {
  return (
    <div className="mt-[18px] grid grid-cols-1 rounded-[12px] border border-[#f2e0bd] bg-[#fef4e1] px-[10px] py-[10px] sm:grid-cols-3 lg:grid-cols-6">
      {ITEMS.map(({ Icon, l1, l2 }, i) => (
        <div
          key={l1}
          className={`flex items-center justify-center gap-[13px] px-[10px] py-[8px] ${
            i > 0 ? "lg:border-l lg:border-[#f0dfc0]" : ""
          }`}
        >
          <Icon className="h-[30px] w-[30px] shrink-0 text-[#b95a06]" />
          <span className="text-[12px] leading-[18px]">
            <span className="font-semibold text-[#3f1c6b]">{l1}</span>
            <br />
            <span className="font-normal text-[#4a4750]">{l2}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
