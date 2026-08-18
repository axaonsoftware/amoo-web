import PageHeader from "./PageHeader";
import ChatApp from "./ChatApp";

export const metadata = {
  title: "Messages | Amoo Guru",
};

export default function ChatPage() {
  return (
    <main id="main-content" className="flex-1 px-5 pb-8 pt-[18px] lg:px-6">
      <PageHeader />
      <div className="mt-[18px]">
        <ChatApp />
      </div>
    </main>
  );
}
