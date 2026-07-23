import { api } from "@/lib/api";

export type ConsultationService = {
  id: number;
  name: string;
  price: number;
  duration?: string;
  sub?: string;
};

// /api/services answers the paginated envelope { data, meta }, and MySQL hands
// DECIMAL columns back as strings ("999.00"), so price needs a Number() here
// rather than at every call site that does arithmetic on it.
function unwrapServices(res: any): ConsultationService[] {
  const rows = Array.isArray(res) ? res : (res?.data ?? []);
  return rows.map((s: any) => ({ ...s, id: Number(s.id), price: Number(s.price) }));
}

/**
 * Resolve the service the user picked to its real row. The booking steps only
 * carry the display name forward, but POST /api/bookings requires `service_id`
 * and cross-checks `amount` against `services.price` — so both have to come
 * from this lookup, never from a constant in the UI.
 *
 * Throws when nothing matches. A fallback id would silently book, and charge
 * for, a service the user never chose.
 */
export async function resolveService(name: string): Promise<ConsultationService> {
  const wanted = (name || "").trim();
  if (!wanted) throw new Error("No service selected. Please go back and pick a service.");

  const rows = unwrapServices(
    await api.getServices(`?search=${encodeURIComponent(wanted)}&limit=100`)
  );
  const lower = wanted.toLowerCase();
  const match =
    rows.find((s) => s.name.trim().toLowerCase() === lower) ||
    rows.find((s) => s.name.trim().toLowerCase().includes(lower)) ||
    rows.find((s) => lower.includes(s.name.trim().toLowerCase()));

  if (!match) {
    throw new Error(
      `We couldn't find "${wanted}" in our service list. Please go back and select your service again.`
    );
  }
  return match;
}

// The API accepts mode as one of "chat" | "video" | "in-person" | "" — the UI's
// labels have to be translated. "Audio Call" has no member in that enum, so it
// maps to "" and the real choice is preserved in `notes` (see modeNote).
const MODE_MAP: Record<string, string> = {
  "video call": "video",
  video: "video",
  chat: "chat",
  "chat consultation": "chat",
  "in-person": "in-person",
  "in person": "in-person",
};

export function toApiMode(display?: string): string {
  return MODE_MAP[(display || "").trim().toLowerCase()] ?? "";
}

export function modeNote(display?: string): string {
  const label = (display || "").trim();
  if (!label || toApiMode(label)) return "";
  return `Preferred mode: ${label}`;
}

const MONTHS: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

// "Tuesday, 10 June 2026" -> "2026-06-10" (the API validates date as ISO).
export function parseDisplayDate(display: string): string {
  const m = (display || "").match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (!m) return new Date().toISOString().slice(0, 10);
  const [, day, monthName, year] = m;
  return `${year}-${MONTHS[monthName] || "01"}-${day.padStart(2, "0")}`;
}

// "08:00 AM" -> "08:00:00"
export function parseDisplayTime(display: string): string {
  const m = (display || "").match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!m) return "09:00:00";
  let h = parseInt(m[1], 10);
  if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
  if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m[2]}:00`;
}
