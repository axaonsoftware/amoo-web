type PackageRow = {
  name: string;
  sub: string;
  img: string;
  type: "Service Package" | "Combo Package" | "Offer";
  services: string;
  price: string | null;
  oldPrice: string | null;
  discount: string;
  validity: string;
  status: "Active" | "Inactive";
};

export const typeTone: Record<PackageRow["type"], string> = {
  "Service Package": "bg-[#F1EAFE] text-[#7C3AED]",
  "Combo Package": "bg-[#FDE9F0] text-[#DB2777]",
  Offer: "bg-[#FEF0DC] text-[#D97706]",
};
