import ExpertChatApp from "./ChatApp";

export const metadata = {
  title: "Messages | Amoo Guru",
};

export default function ExpertChatPage() {
  return (
    <main id="main-content" className="flex-1 px-5 pb-8 pt-[18px] lg:px-6">
      <section>
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[30px] font-bold leading-[1.15] text-[#4c1d95]">
              Messages
            </h1>
            <p className="mt-[5px] text-[13px] text-[#6c6b78]">
              Chat with your clients in real time.
            </p>
          </div>
        </div>
      </section>
      <div className="mt-[18px]">
        <ExpertChatApp />
      </div>
    </main>
  );
}
