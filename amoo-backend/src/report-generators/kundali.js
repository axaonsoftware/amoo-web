const BaseReportGenerator = require("./base");
const { DISCLAIMER } = require("./base");

/**
 * Kundali (birth chart) report generator — SCAFFOLD.
 *
 * There is no astrology engine behind this yet, so it does NOT compute or
 * invent a chart. It echoes the birth details it was given and states plainly
 * that the full reading is being prepared. It must stay this way until a real
 * calculation source is wired in — see the options below — because a Vedic
 * chart presented with fabricated planet positions is worse than an honest
 * "in preparation" message: a user could make real decisions on invented data.
 *
 * The previous version emitted "*** TODO: Replace with real Vedic astrology
 * calculations ***" and rows of "?" directly into the user-facing report.
 *
 * ─── To graduate this generator ──────────────────────────────────────────
 *   Inputs needed: dob (DATE), tob (TIME), birthplace (VARCHAR) — all now
 *   present on the `users` table (see schema.sql / migration 005), and merged
 *   into `extras` by the reports route.
 *
 *   Calculation, pick one:
 *     A) A Node ephemeris library (e.g. swisseph bindings) — self-hosted,
 *        no per-request cost, requires validating accuracy.
 *     B) A Vedic astrology REST API (JSON Astrology, Vedic Rishi, …) — pass
 *        dob/tob/geocoded birthplace, format the JSON response.
 *   Then set `static maturity = "heuristic"` and render the real chart.
 * ────────────────────────────────────────────────────────────────────────
 */
class KundaliReportGenerator extends BaseReportGenerator {
  static type = "kundali";
  static maturity = "scaffold";

  async generate({ serviceId, userName, extras }) {
    const dob = extras?.dob || null;
    const tob = extras?.tob || null;
    const place = extras?.birthplace || null;

    const haveAll = dob && tob && place;

    const content = [
      `Kundali / Birth Chart — ${userName || "Client"}`,
      "",
      "─── YOUR BIRTH DETAILS ───",
      `Date of Birth: ${dob || "— not provided —"}`,
      `Time of Birth: ${tob || "— not provided —"}`,
      `Birthplace:    ${place || "— not provided —"}`,
      "",
      "─── STATUS ───",
      haveAll
        ? "Thank you — we have your birth details. Your full Vedic birth chart"
        : "We need your date of birth, exact time of birth and birthplace to",
      haveAll
        ? "(ascendant, planetary positions, houses and dasha periods) is being"
        : "prepare your chart. Please add them to your profile or booking and",
      haveAll
        ? "prepared by our astrologer and will appear here shortly."
        : "we will prepare your reading.",
      "",
      "An automated preview cannot responsibly calculate a birth chart, so we",
      "do not show placeholder positions here — your reading is prepared by a",
      "person, not fabricated by the system.",
      "",
      DISCLAIMER,
      "",
      `Requested for service #${serviceId || "N/A"} on ${new Date().toISOString()}.`,
      "",
      "— Amoo Guru",
    ].join("\n");

    return {
      // Marks the report title so the dashboard shows its provisional status
      // rather than presenting it as a completed reading.
      title: `Kundali / Birth Chart (In Preparation) — ${userName || "Client"}`,
      content,
    };
  }
}

module.exports = KundaliReportGenerator;
