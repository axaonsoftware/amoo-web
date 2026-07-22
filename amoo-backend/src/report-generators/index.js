const BaseReportGenerator = require("./base");
const TarotReportGenerator = require("./tarot");
const NumerologyReportGenerator = require("./numerology");
const KundaliReportGenerator = require("./kundali");
const ReikiReportGenerator = require("./reiki");

/**
 * Registry of all available report generators.
 * Map keys are the `type` values stored in the reports table.
 */
const generators = {};

function register(GeneratorClass) {
  const type = GeneratorClass.type;
  if (!type) {
    throw new Error(
      `[ReportGeneratorRegistry] ${GeneratorClass.name} is missing a static 'type' property`
    );
  }
  if (generators[type]) {
    throw new Error(
      `[ReportGeneratorRegistry] Duplicate generator type: "${type}"`
    );
  }
  generators[type] = new GeneratorClass();
}

// Register all known generators
register(TarotReportGenerator);
register(NumerologyReportGenerator);
register(KundaliReportGenerator);
register(ReikiReportGenerator);

/**
 * Return the generator for a report type, or null if none is registered.
 * @param {string} type - lowercase report type (e.g. "tarot", "numerology")
 * @returns {BaseReportGenerator|null}
 */
function getGenerator(type) {
  const normalised = (type || "").toLowerCase().trim();
  return generators[normalised] || null;
}

/**
 * List all registered generator type names.
 * @returns {string[]}
 */
function listTypes() {
  return Object.keys(generators);
}

module.exports = { getGenerator, listTypes, register };
