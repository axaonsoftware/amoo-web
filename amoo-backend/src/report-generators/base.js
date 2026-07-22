/**
 * Base class for all report generators.
 *
 * Subclasses must implement the static `type` property and the `generate` method.
 *
 * The `generate` method receives:
 *   { userId, serviceId, userName, userEmail, extras }
 *
 * The `extras` object can carry additional context passed by the caller
 * (e.g. expert_id, related booking info, partial birth details from the
 * request body).  Over time, user birth details (dob, time, place, gender)
 * should be added to the users table and queried inside `generate()` so each
 * generator can read them directly.
 *
 * Returns:
 *   { title: string, content: string, file_url?: string, chakra_data?: object }
 *
 * ─── IMPORTANT ──────────────────────────────────────────────────────
 * This is a **scaffold**.  Every generator below returns placeholder
 * content.  Replace each with real domain logic or a third-party API
 * call when the business rules are defined.
 * ────────────────────────────────────────────────────────────────────
 */
class BaseReportGenerator {
  static type = "";

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
