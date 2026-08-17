import { ConsultationProvider } from "./lib/consultation-context";

export default function ConsultationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConsultationProvider>{children}</ConsultationProvider>;
}
