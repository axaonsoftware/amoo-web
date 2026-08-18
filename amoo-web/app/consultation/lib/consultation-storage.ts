const STORAGE_KEY = "amoo_consultation";

/**
 * Scratch storage for the multi-step consultation booking form.
 *
 * PRIVACY: this holds directly identifying personal data — full name, email,
 * phone, date of birth, gender, marital status, and a free-text "concern" that
 * is typically health- or relationship-related. It was previously written to
 * BOTH sessionStorage and localStorage, and never cleared. localStorage has no
 * expiry, so on a shared or public machine every one of those fields stayed
 * readable by any later visitor (and by any script on the origin) indefinitely,
 * long after the booking completed.
 *
 * It is now sessionStorage only — scoped to the tab, dropped when it closes —
 * and `clearConsultationData()` is called once checkout succeeds.
 *
 * The in-memory mirror exists because sessionStorage throws in Safari private
 * mode and when the quota is exceeded; the flow must not break in either case.
 * It is intentionally NOT a durability mechanism.
 */

export type ConsultationData = {
  service?: string;
  mode?: string;
  date?: string;
  time?: string;
  slot_id?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  language?: string;
  foundUs?: string;
  concern?: string;
  specialRequests?: string;
};

type Store = Record<string, string>;

declare global {
  var __amooConsultation: Store | undefined;
}

function memoryStore(): Store {
  if (!globalThis.__amooConsultation) globalThis.__amooConsultation = {};
  return globalThis.__amooConsultation;
}

function readSession(): Store | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Store) : null;
  } catch {
    // Private mode, disabled storage, or malformed JSON — fall back to memory.
    return null;
  }
}

export function saveConsultationData(data: ConsultationData): void {
  if (typeof window === "undefined") return;

  const store = memoryStore();
  Object.assign(store, readSession() ?? {});

  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && val !== null && val !== "")
      store[key] = String(val);
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota or private mode: the in-memory copy still carries the flow within
    // this tab, which is all the booking steps need.
  }
}

export function loadConsultationData(): ConsultationData {
  if (typeof window === "undefined") return {};
  const store = memoryStore();
  Object.assign(store, readSession() ?? {});
  return { ...store } as ConsultationData;
}

/**
 * Drop everything once the booking is confirmed, or when the user abandons it.
 * Also removes any legacy localStorage copy written by the previous version, so
 * existing visitors stop carrying their details around after one more visit.
 */
export function clearConsultationData(): void {
  if (typeof window === "undefined") return;
  globalThis.__amooConsultation = {};
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — memory copy is already cleared */
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ditto */
  }
}
