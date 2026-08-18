import { MessageSquare } from "lucide-react";
import StartChatButton from "./StartChatButton";

export default function PageHeader() {
  return (
    <section>
      <div className="flex items-center gap-4">
        <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[16px] bg-[#f3ecfb]">
          <MessageSquare
            className="h-[26px] w-[26px] text-[#6d28d9]"
            strokeWidth={1.7}
          />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[30px] font-bold leading-[1.15] text-[#4c1d95]">
            Messages
          </h1>
          <p className="mt-[5px] text-[13px] text-[#6c6b78]">
            Chat with your experts in real time.
          </p>
        </div>

        <StartChatButton variant="icon" />
      </div>
    </section>
  );
}
