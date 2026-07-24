# 021 — Frontend test runner and first unit tests

- **Category**: Missing Feature (Test Coverage)
- **Severity**: Medium
- **File(s) affected**:
  - `amoo-web/package.json`
  - `amoo-web/lib/__tests__/format.test.ts` *(new)*
  - `amoo-web/lib/__tests__/errors.test.ts` *(new)*
  - `amoo-web/lib/__tests__/api-helpers.test.ts` *(new)*

## Problem

The frontend `test` script was a placeholder:

```json
"test": "echo \"amoo-web has no test runner yet ...\" && exit 0"
```

So the CI "test" step was green by construction and verified nothing. The pure
utility layer — currency/date formatting, the API response-envelope unwrappers,
error handling — had zero coverage, despite several production bugs having lived
exactly there (the `qs()` missing-`?` bug that produced `/api/userspage=1`;
components calling `.filter()` on an unpaginated envelope and crashing).

## Solution

Use **Node's built-in test runner** with its **native TypeScript type-stripping**
(Node 22.6+/23.6+; confirmed on the Node 25 in this environment). Zero new
dependencies — the same choice the backend already made — and no Jest/Vitest
config to maintain.

```json
"typecheck": "tsc --noEmit",
"test": "node --test \"lib/__tests__/*.test.ts\""
```

37 tests across three suites, targeting the pure, dependency-free helpers:

- **`format.test.ts`** — `toNumber` (the DECIMAL-as-string normaliser),
  `formatCurrency` (never renders `NaN`), Indian digit grouping, `formatCompact`
  (k/L/Cr), date/time formatting with junk-input fallbacks, `titleCase`,
  `initials`.
- **`errors.test.ts`** — the `lib/errors.ts` helpers, specifically the cases the
  old `catch (e: any)` → `e.message` mishandled: strings, plain objects,
  valueless Errors, non-Error throws. Confirms `errorMessage` never returns `""`
  or `undefined`.
- **`api-helpers.test.ts`** — `unwrapList` / `unwrapMeta` for both backend
  response shapes (`ok()` bare value vs `paginated()` envelope) including the
  non-list inputs that used to crash callers, and `qs` including the leading-`?`
  and keep-`0` behaviours.

The suites are colocated under `lib/__tests__/` and import the real modules, so
they break if the helper contracts change.

## Before / After

```diff
-"test": "echo \"amoo-web has no test runner yet ...\" && exit 0"
+"typecheck": "tsc --noEmit",
+"test": "node --test \"lib/__tests__/*.test.ts\""
```

CI (change 017) already calls `npm test`, so this step now actually gates.

## Testing notes

```bash
cd amoo-web && npm test
# ℹ tests 37
# ℹ pass 37
# ℹ fail 0
```

## Risk / impact

- **Coverage is the pure utility layer only.** Component and integration tests
  (React Testing Library / Playwright) are a larger effort and a real gap —
  flagged in the readiness report. This establishes the runner and the habit;
  the highest-value next targets are the checkout flow and the auth context.
- **Relies on Node's native TS stripping.** It runs `.ts` directly with no build
  step, but the files must stay type-strippable (no `enum`, no
  `namespace`, no emit-dependent features) — the helpers are plain functions, so
  this is not a constraint in practice. CI pins Node 20; **type-stripping of
  `.ts` test files requires Node ≥ 22.6**, so the CI Node version must be raised
  to run these there. Noted in the readiness report's manual steps.
- No production code changed.
