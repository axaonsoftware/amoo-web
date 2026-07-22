const STORAGE_KEY = "amoo_consultation";

// TODO: Replace this multi-step form data passing with React Context.
// For now, localStorage/sessionStorage with silent catch guards is used
// since browser storage can throw in private mode or when quota is exceeded.

export type ConsultationData = {
  service?: string;
  mode?: string;
  date?: string;
  time?: string;
};

function getWindow(): any {
  if (typeof window === "undefined") return null;
  return window;
}

function getGlobalStore(): Record<string, string> {
  const w = getWindow();
  if (!w) return {};
  if (!w.__amooData) w.__amooData = {};
  return w.__amooData;
}

export function saveConsultationData(data: ConsultationData) {
  const w = getWindow();
  if (!w) return;

  const store = getGlobalStore();

  // Merge with existing stored data so partial saves don't lose earlier fields
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(store, JSON.parse(raw));
  } catch {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(store, JSON.parse(raw));
  } catch {}

  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && val !== null) store[key] = val;
  }

  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
}

export function loadConsultationData(): ConsultationData {
  const w = getWindow();
  if (!w) return {};

  const global = getGlobalStore();
  if (global.service || global.mode) return global;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) { Object.assign(global, JSON.parse(raw)); return global; }
  } catch {}

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { Object.assign(global, JSON.parse(raw)); return global; }
  } catch {}

  return {};
}
