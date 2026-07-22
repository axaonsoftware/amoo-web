const BaseReportGenerator = require("./base");

/**
 * Kundali (birth chart) report generator.
 *
 * ─── TODO: Real logic ───────────────────────────────────────────────
 * Replace the placeholder below with actual Vedic astrology calculations.
 * This is the most complex generator and will likely need a third-party
 * library or API:
 *
 *   Option A — Library (self-hosted calculation)
 *     Use a Node.js library like `drik-panchanga` or `vedic-astro` to
 *     compute planet positions, houses, and dashes from date/time/place.
 *     Verify the library's accuracy for professional use.
 *
 *   Option B — External API (recommended for v1)
 *     Call a service like:
 *       - https://jsonastrology.com
 *       - https://vedicrishi.com/api
 *       - https://rapidapi.com (search "Vedic astrology")
 *     Pass DOB, TOB, birthplace and receive JSON with planet positions,
 *     ascendant, nakshatra, etc.  Format the response into a readable
 *     report.
 *
 *   Regardless of approach, the generator needs the user's birth details:
 *   - date of birth  (needs a `dob` column on `users` — does NOT exist)
 *   - time of birth  (needs a `tob` column — does NOT exist)
 *   - birthplace     (needs a `birthplace` column — does NOT exist)
 *
 *   Add these columns to the users table in a migration, then query them
 *   inside `generate()` so the caller doesn't have to pass them manually.
 *   Until then, accept them via `extras`.
 * ────────────────────────────────────────────────────────────────────
 */
class KundaliReportGenerator extends BaseReportGenerator {
  static type = "kundali";

  async generate({ userId, serviceId, userName, extras }) {
    const dob = extras?.dob || "date of birth not provided";
    const tob = extras?.tob || "time of birth not provided";
    const place = extras?.birthplace || "birthplace not provided";

    return {
      title: `Kundali / Birth Chart — ${userName || "Client"}`,
      content: [
        `Birth Chart for ${userName || "Client"}`,
        "",
        "─── INPUT DATA (Placeholder) ───",
        `Date of Birth: ${dob}`,
        `Time of Birth: ${tob}`,
        `Birthplace:    ${place}`,
        "",
        "─── CHART DATA (Placeholder) ───",
        "*** TODO: Replace with real Vedic astrology calculations ***",
        "Ascendant (Lagna):    ?",
        "Moon Sign (Rashi):    ?",
        "Nakshatra:            ?",
        "Planet Positions:     Sun ?, Moon ?, Mars ?, ...",
        "Houses:               1st House ?, 2nd House ?, ...",
        "Current Dasha:        ?",
        "",
        "─── INTERPRETATION (Placeholder) ───",
        "*** TODO: Interpret the chart data ***",
        "Describe what each house and planet placement means for the",
        "individual's personality, career, relationships, and health.",
        "",
        "Options for calculation engine:",
        "  A) drik-panchanga npm library",
        "  B) JSON Astrology REST API",
        "  C) Vedic Rishi API",
        "",
        "Generated on " + new Date().toISOString(),
        "for service #" + (serviceId || "N/A") + ".",
        "",
        "— Amoo Guru",
      ].join("\n"),
    };
  }
}

module.exports = KundaliReportGenerator;
