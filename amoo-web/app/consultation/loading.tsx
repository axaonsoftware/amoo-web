import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#fdfaf5]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#6d28d9]" />
        <p className="font-display text-sm font-medium text-[#6c6b78]">Loading...</p>
      </div>
    </div>
  );
}
