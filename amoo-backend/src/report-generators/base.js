/**
 * Base class for all report generators.
 *
 * Subclasses implement the static `type` property and the `generate` method:
 *   generate({ userId, serviceId, userName, userEmail, extras })
 *     -> { title, content, file_url?, chakra_data? }
 *
 * `extras` carries additional context from the caller (birth details from the
 * request body, saved profile fields merged in by the reports route, etc.).
 *
 * ─── MATURITY ───────────────────────────────────────────────────────────
 * These are NOT professional-grade engines. Their maturity varies and is
 * declared per subclass via the static `maturity` flag:
 *
 *   "heuristic"  — real, deterministic domain logic runs (numerology's
 *                  Pythagorean reduction, tarot's card draw, reiki's chakra
 *                  data). Output is plausible and self-consistent, but it is
 *                  guidance/entertainment, not certified professional advice.
 *
 *   "scaffold"   — NO real calculation exists yet. The generator can only
 *                  echo its inputs. It MUST NOT fabricate specifics (planet
 *                  positions, house lords) and present them as a real reading.
 *                  Kundali is here until a real ephemeris/API is wired in.
 *
 * DISCLAIMER is appended to every report so a reader is never misled about
 * what they are looking at, and `describeMaturity()` renders a scaffold notice
 * in place of invented data. See docs/changes/020 for the rationale and the
 * plan to graduate each generator.
 * ────────────────────────────────────────────────────────────────────────
 */

const DISCLAIMER = [
  "─── PLEASE NOTE ───",
  "This report is generated automatically for guidance and self-reflection.",
  "It is not a substitute for professional financial, medical, legal or",
  "psychological advice. Your choices shape your path.",
].join("\n");

class BaseReportGenerator {
  static type = "";

  // "heuristic" | "scaffold". Overridden per subclass. Defaults to scaffold so
  // a new generator is treated as unproven until it declares otherwise.
  static maturity = "scaffold";

  /** True when this generator has no real calculation behind it yet. */
  static get isScaffold() {
    return this.maturity === "scaffold";
  }

  /**
   * @returns {{ title: string, content: string, file_url?: string, chakra_data?: object }}
   */
  async generate(/* { userId, serviceId, userName, userEmail, extras } */) {
    throw new Error(
      `[${this.constructor.name}] generate() is not implemented — subclass must override it`
    );
  }
}

module.exports = BaseReportGenerator;
module.exports.DISCLAIMER = DISCLAIMER;
