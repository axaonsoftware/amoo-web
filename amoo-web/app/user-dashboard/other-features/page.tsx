import PageHeader from "./PageHeader";
import FeatureChips from "./FeatureChips";
import FeatureGrid from "./FeatureGrid";
import MoreFeatures from "./MoreFeatures";
import BottomRow from "./BottomRow";

export default function OtherUserFeaturesPage() {
  return (
    <main
      id="main-content"
      className="flex-1 px-4 sm:px-6 lg:px-8 pb-6 pt-7 sm:pt-[31px]"
    >
      <PageHeader />

      <div className="mt-[24px]">
        <FeatureChips />
      </div>

      <div className="mt-[36px]">
        <FeatureGrid />
      </div>

      <div className="mt-[25px]">
        <MoreFeatures />
      </div>

      <div className="mt-[24px]">
        <BottomRow />
      </div>
    </main>
  );
}
