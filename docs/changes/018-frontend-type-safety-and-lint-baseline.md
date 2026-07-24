# 018 — Frontend type-safety layer and a lint baseline CI can actually hold

- **Category**: Refactor / Bug Fix
- **Severity**: Medium (one real bug fixed; the rest is defence against future bugs)
- **File(s) affected**:
  - `amoo-web/lib/types.ts` *(new)*
  - `amoo-web/lib/errors.ts` *(new)*
  - `amoo-web/eslint.config.mjs`
  - `amoo-web/app/admin/expert-management/ExpertPanel.tsx`
  - `amoo-web/app/admin/pricing-management/PricingPanel.tsx`
  - `amoo-web/app/admin/reiki-management/SessionsPanel.tsx`
  - `amoo-web/app/cancellation/page.tsx`
  - ~15 files via a `catch (e: any)` codemod

## Problem

`npm run lint` had never run in CI, so the frontend had accumulated **433
violations (344 errors)** across 104 files, unseen. The largest buckets:

| Rule | Count | What it means |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | 275 | API rows typed `any` — a renamed/dropped backend field becomes `undefined` at runtime with no build-time signal |
| `react-hooks/set-state-in-effect` | 59 | `setState` synchronous in an effect body — one extra render |
| `@typescript-eslint/no-unused-vars` | 84 | dead bindings |
| `react-hooks/immutability` | 4 | **temporal-dead-zone hazards** |
| `@next/next/no-html-link-for-pages` | 5→1 | `<a href>` to an internal route → full page reload |
| `react-hooks/refs` | 1 | ref written during render |

Two things made this dangerous to "just fix":

1. A **partial automated `any`→`unknown` sweep** (run by a concurrent session
   earlier in this project) produced **~130 TypeScript errors in a single
   pass** and broke the build, because `unknown` requires narrowing that a
   mechanical replace does not add. Blind bulk edits here are not safe.

2. The `any` rows were hiding at least one **real, live bug** (see below), so
   the annotations were not merely cosmetic debt.

## Solution

Fix everything that was a genuine defect; give the two style/pattern rules a
tracked warning baseline; and add the missing type surface so the debt can be
paid down incrementally without another build-breaking sweep.

### Real bugs fixed (not downgraded)

**`react-hooks/immutability` (4→0).** All were the same shape: an
`onReady(...)` effect declared *above* the `handleExport`/`filtered` binding it
referenced, with no dependency array — legal at runtime only because the handler
is never called during render, but a temporal-dead-zone hazard and an
every-render re-invocation of the parent callback. Moving the declarations and
adding deps fixed both.

Fixing `ExpertPanel` this way surfaced a **live bug**: its filter and CSV export
read `e.specialization`, `e.experience`, `e.hourly_rate` and `e.sessions` —
**none of which exist** on the `experts` table (`EXPERT_SELECT` returns
`specialties`, `role_title`, `rating`, `status`, …). So the Specialization
dropdown could never match and always emptied the table, and four CSV columns
exported blank for every row. Corrected to the real column names.

**`@next/next/no-html-link-for-pages` (5→1, then 0).** `<a href="/">` on the
policy pages triggered a full document reload. Switched to `<Link>`. (The four
others were auto-fixed alongside.)

**`react-hooks/refs` (1→0).** A ref written during render in `lib/useApi.ts`,
already addressed as part of the hook's generation-tracking fix.

### The type surface (`lib/types.ts`)

Real entity shapes for every API response, taken from the backend's own SELECT
lists and column types — not guessed. Conventions are documented in the file:
`Decimal = number | string` (mysql2 returns DECIMAL as a string),
`Flag = 0 | 1 | boolean` (TINYINT), date columns as strings. This is the
foundation for retiring the `any`s: import the entity, replace `useState<any[]>`,
fix what the compiler then reveals — exactly how the `ExpertPanel` bug was found.

### Safe error handling (`lib/errors.ts` + codemod)

`errorMessage(e)`, `errorStatus(e)`, `validationDetails(e)`, `isUserCancellation(e)`
replace ~40 `catch (e: any)` sites that read `e.message`. The old access
returned `undefined` (→ a blank error box) whenever a non-Error was thrown. A
narrow codemod rewrote `catch (e: any)` → `catch (e: unknown)` and
`e?.message || "x"` → `errorMessage(e, "x")` in ~15 files; it only touched the
two exact shapes present in the code and reported everything else for manual
review. `lib/errors.ts` has its own unit tests (change 021 / `lib/__tests__`).

### The baseline (`eslint.config.mjs`)

`no-explicit-any` and `set-state-in-effect` are demoted to **warnings**, with a
long comment explaining why each is a warning not an error, and pointing at the
migration path. This is deliberate: CI now *requires* `npm run lint` to pass
(change 017), so the error set has to be one the tree can satisfy today, or the
gate gets disabled within a week and stops catching regressions. Warnings stay
visible (`358 warnings, 0 errors`) and are tracked in the readiness report.

## Before / After

**ExpertPanel — the real bug**
```diff
-const matchSpec = !specializationFilter || e.specialization === specializationFilter;
+const matchSpec =
+  !specializationFilter ||
+  (e.specialties || "").toLowerCase().includes(specializationFilter.toLowerCase());
```
```diff
-Specialization: e.specialization || "",
-Experience: e.experience || "",
-Rate: e.hourly_rate || "",
-Sessions: e.sessions || "",
+Title: e.role_title || "",
+Specialties: e.specialties || "",
+Rating: e.rating ?? "",
+Joined: e.created_at || "",
```

**catch codemod**
```diff
-} catch (err: any) {
-  setApiError(err?.message || "Login failed. Please try again.");
+} catch (err: unknown) {
+  setApiError(errorMessage(err, "Login failed. Please try again."));
```

**eslint.config.mjs**
```diff
+    rules: {
+      "@typescript-eslint/no-explicit-any": "warn",
+      "react-hooks/set-state-in-effect": "warn",
+    },
```

## Testing notes

```bash
cd amoo-web
npx tsc --noEmit     # clean
npm run lint         # 0 errors, 358 warnings, exit 0
npm test             # 37/37 (includes lib/errors.test.ts)
```

The `ExpertPanel` fix is behaviour-visible: on `/admin/expert-management`,
choosing a Specialization now filters the table instead of emptying it, and the
exported CSV's Specialties/Title/Rating/Joined columns carry real values.

## Risk / impact

- **Warnings are not zero.** 358 remain, by design. They are a tracked backlog,
  not a clean bill of health — the readiness report says so explicitly. The plan
  (import `lib/types.ts`, fix per-file) is the safe path; another bulk sweep is
  not.
- **`lib/types.ts` is not yet wired into most components.** It documents the
  contract and is used by the new admin pages; retrofitting the ~90 older
  components is incremental follow-up work.
- **The codemod was conservative** — it skipped anything ambiguous and left it
  for manual review, so a handful of `catch (e: any)` may remain where the body
  did more than read `.message`. Those are warnings, not errors.
- **No runtime behaviour changed** except the two `ExpertPanel` fixes and the
  policy-page links becoming client-side navigations.
