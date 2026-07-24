import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Lint was never run in CI before this pass, so the codebase accumulated 433
 * violations unnoticed. `npm run lint` is now a required CI step
 * (.github/workflows/ci.yml), which means the error set has to be one the tree
 * can actually satisfy — otherwise the gate gets disabled again within a week
 * and stops catching anything.
 *
 * Everything that indicated a REAL DEFECT was fixed rather than downgraded:
 *   react-hooks/immutability          4 -> 0  temporal-dead-zone hazards; two
 *                                             also re-ran an effect every render
 *   @next/next/no-html-link-for-pages 1 -> 0  full page reload on an internal link
 *   react-hooks/refs                  1 -> 0  ref written during render
 *
 * The two rules below are demoted to warnings. Both flag style/pattern issues
 * rather than incorrect behaviour, both need file-by-file judgement, and a
 * mechanical sweep of either is actively dangerous — a partial automated
 * `any` -> `unknown` conversion on this codebase produced ~130 type errors in a
 * single pass. They stay visible as warnings and are tracked in
 * docs/PRODUCTION_READINESS_REPORT.md rather than silenced.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      /**
       * ~242 remaining across 93 files. Typing these is worthwhile and has
       * already paid off: `lib/types.ts` now carries the real API entity shapes
       * taken from the backend's own SELECT lists, and applying it to
       * ExpertPanel immediately exposed four fields the component read that the
       * `experts` table does not have (`specialization`, `experience`,
       * `hourly_rate`, `sessions`) — which had silently broken its
       * Specialization filter and exported four empty CSV columns.
       *
       * Migrate incrementally: import the entity from `lib/types.ts`, replace
       * `useState<any[]>` / `(x: any)`, then fix what the compiler reveals.
       * Promote back to "error" once the count reaches zero.
       */
      "@typescript-eslint/no-explicit-any": "warn",

      /**
       * ~51 remaining, all the identical shape:
       *
       *   const load = useCallback(() => { setLoading(true); api.x().then(...) }, [deps]);
       *   useEffect(() => { load(); }, [load]);
       *
       * The rule objects to the synchronous setState inside the effect, which
       * costs one extra render. The pattern is functional and was the standard
       * approach before the React Compiler; React's own guidance is to move data
       * fetching into a framework or a library rather than to restructure the
       * effect body.
       *
       * Fixing it properly means routing these through `lib/useApi.ts` — which
       * already handles generation tracking, race conditions and polling
       * correctly — or adopting a data-fetching library. That is a deliberate
       * architectural change, not a lint cleanup, and blind edits to 51
       * components that cannot be runtime-tested here would risk regressions on
       * pages that currently work.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
