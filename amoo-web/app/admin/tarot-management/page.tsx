import PageHeader from "./PageHeader";
import StatsRow from "./StatsRow";
import ReadingsPanel from "./ReadingsPanel";
import RightRail from "./RightRail";

export default function TarotManagementPage() {
  return (
    <main id="main-content" className="flex-1 pb-8">
      <div className="px-6 pt-[18px]">
        <PageHeader />

        <div className="mt-[30px]">
          <StatsRow />
        </div>
      </div>

      <div className="mt-[15px] flex gap-[10px] pl-[10px] pr-6 max-xl:flex-col max-xl:px-6">
        <div className="min-w-0 flex-1">
          <ReadingsPanel />
        </div>

        <aside className="w-[281px] shrink-0 max-xl:w-full">
          <RightRail />
        </aside>
      </div>
    </main>
  );
}
