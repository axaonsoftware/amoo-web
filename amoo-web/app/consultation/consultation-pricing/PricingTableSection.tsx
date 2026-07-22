import PricingTable from "./PricingTable";
import WhatsAppConfirmationCard from "./WhatsAppConfirmationCard";

export default function PricingTableSection() {
  return (
    <section className="w-full bg-[#FCF9F3] px-6 md:px-10 pb-14">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-amber-500">✦</span>
          <h2 className="text-xl font-serif font-bold tracking-wide text-[#3E1E7A]">
            CONSULTATION PRICING TABLE (AT A GLANCE)
          </h2>
          <span className="text-amber-500">✦</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-stretch">
          <PricingTable />
          <WhatsAppConfirmationCard />
        </div>
      </div>
    </section>
  );
}
