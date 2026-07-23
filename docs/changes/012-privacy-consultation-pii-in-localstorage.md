# 012 — Consultation form kept personal data in localStorage forever

- **Category**: Security (Privacy)
- **Severity**: Medium
- **File(s) affected**:
  - `amoo-web/app/consultation/lib/consultation-storage.ts`
  - `amoo-web/app/consultation/consultation-payment/BottomActionBar.tsx`

## Problem

The multi-step consultation booking form carried its state between pages in
browser storage — writing to **both** `sessionStorage` and `localStorage`:

```ts
try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
```

The stored object is not incidental UI state. Per its own type:

```ts
export type ConsultationData = {
  fullName?: string;  email?: string;    phone?: string;
  dob?: string;       gender?: string;   maritalStatus?: string;
  concern?: string;   specialRequests?: string;
  // ...
};
```

That is name, email, phone number, date of birth, gender, marital status, and a
free-text "concern" field — which on an astrology and spiritual-healing platform
routinely contains health, relationship, financial or bereavement details.

`localStorage` has **no expiry**. It survives tab closure, browser restart, and
reboot, and is readable by any script on the origin. It was never cleared:
nothing called a delete after the booking completed, and no such function
existed.

Concretely: someone books a consultation on a shared laptop, a library machine,
or a family tablet. Their name, phone number, date of birth and the personal
problem they wrote about remain readable in devtools by the next person to use
that browser — indefinitely. It also enlarges the blast radius of any XSS on the
origin from "steal a session" to "steal every visitor's booking history".

Under India's DPDP Act and GDPR this is retention of sensitive personal data
without purpose or limit, on the client, by default.

Two lesser problems in the same file:

- **Empty strings were stored.** The guard was `if (val !== undefined && val !== null)`,
  so clearing a field wrote `""` rather than removing it, and `loadConsultationData`
  would then return `""` where callers expected "absent".
- **`loadConsultationData` returned the live mutable store object**, so a caller
  mutating the result silently corrupted the shared state.

## Solution

`sessionStorage` only — scoped to the tab, dropped when it closes — plus an
explicit `clearConsultationData()` called on successful checkout.

The in-memory mirror is kept, because `sessionStorage` throws in Safari private
mode and on quota exhaustion and the booking flow must not break there. It is
now documented as a resilience fallback, not a persistence layer.

`clearConsultationData()` also removes the **legacy `localStorage` key**, so
existing visitors who already have data stored are cleaned up on their next
completed booking rather than carrying it forever.

## Before / After

**Before**
```ts
export function saveConsultationData(data: ConsultationData) {
  const store = getGlobalStore();
  try { const raw = sessionStorage.getItem(STORAGE_KEY); if (raw) Object.assign(store, JSON.parse(raw)); } catch {}
  try { const raw = localStorage.getItem(STORAGE_KEY);   if (raw) Object.assign(store, JSON.parse(raw)); } catch {}

  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && val !== null) store[key] = val;      // stores ""
  }

  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}   // ← never expires
}

export function loadConsultationData(): ConsultationData {
  const global = getGlobalStore();
  if (global.service || global.mode) return global;               // returns the live object
  // ...
}
// (no clear function existed)
```

**After**
```ts
export function saveConsultationData(data: ConsultationData): void {
  if (typeof window === "undefined") return;

  const store = memoryStore();
  Object.assign(store, readSession() ?? {});

  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined && val !== null && val !== "") store[key] = String(val);
  }

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota or private mode: the in-memory copy still carries the flow.
  }
}

export function loadConsultationData(): ConsultationData {
  if (typeof window === "undefined") return {};
  const store = memoryStore();
  Object.assign(store, readSession() ?? {});
  return { ...store } as ConsultationData;          // a copy, not the live object
}

export function clearConsultationData(): void {
  if (typeof window === "undefined") return;
  globalThis.__amooConsultation = {};
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
  try { localStorage.removeItem(STORAGE_KEY); } catch {}   // clean up legacy writes
}
```

**Call site** — `BottomActionBar.tsx`, after `verifyPayment` succeeds:
```tsx
// The multi-step form data has served its purpose; holding personal
// details in browser storage after checkout is an unnecessary risk.
clearConsultationData();
router.push(`/consultation/booking-confirmation?bookingId=${booking.id}`);
```

## Testing notes

1. Walk the booking flow entering real-looking details. At the payment step,
   devtools → Application → Storage:
   - **Session Storage** contains `amoo_consultation`. ✅ expected
   - **Local Storage** contains nothing under that key. ✅ (previously it did)
2. Complete a payment. Both stores must now be empty of `amoo_consultation`.
3. Close the tab mid-flow and reopen the site — the details must be gone
   (previously `localStorage` restored them).
4. Legacy cleanup: seed the old key by hand, then complete a booking —
   ```js
   localStorage.setItem("amoo_consultation", JSON.stringify({ fullName: "Legacy" }));
   ```
   after checkout, `localStorage.getItem("amoo_consultation")` must be `null`.
5. Private-mode resilience: in a Safari/Firefox private window, complete the
   multi-step form — the values must still carry across steps via the in-memory
   mirror.

`tsc --noEmit` clean.

## Risk / impact

- **Behaviour change**: an in-progress booking no longer survives closing the
  tab. That is the intended trade-off. The earlier steps are quick to redo, and
  a half-finished booking is not worth persisting personal data indefinitely.
- **Data is still not cleared on abandonment** — only on successful checkout and
  tab close. A user who fills the form and walks away leaves it in
  sessionStorage until the tab closes. Acceptable for tab-scoped storage;
  calling `clearConsultationData()` from an explicit "Cancel booking" control
  would close the gap if one is added.
- **The booking-confirmation page reads nothing from this store** (it fetches by
  `bookingId`), so clearing before navigation is safe. Verified against
  `BookingDetailsCard.tsx`.
- **Double-check**: no privacy policy text was updated. If
  `amoo-web/app/privacy/page.tsx` describes client-side storage, it should now
  say session-scoped rather than persistent. Listed in the final report's manual
  steps.
