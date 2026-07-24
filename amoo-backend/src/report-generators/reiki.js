const path = require("path");
const BaseReportGenerator = require("./base");
const { DISCLAIMER } = require("./base");

const chakras = require(path.join(__dirname, "data", "reiki-chakras.json"));

const CHAKRA_MAP = {};
for (const c of chakras) CHAKRA_MAP[c.name] = c;

class ReikiReportGenerator extends BaseReportGenerator {
  static type = "reiki";
  // Works from a curated chakra dataset. The before/after wording is sampled,
  // so it reads as a session summary — wellness guidance, not a medical claim.
  static maturity = "heuristic";

  async generate({ userId, serviceId, userName, extras }) {
    const requestedNames = Array.isArray(extras?.chakras)
      ? extras.chakras
      : chakras.map((c) => c.name);

    const worked = requestedNames
      .map((n) => CHAKRA_MAP[n.toLowerCase()])
      .filter(Boolean);

    if (worked.length === 0) {
      return {
        title: `Reiki Session Report — ${new Date().toLocaleDateString("en-IN")}`,
        content: [
          `Reiki Session for ${userName || "Client"}`,
          "",
          "No chakra data was provided. Please specify at least one chakra to work on.",
          "",
          `— Amoo Guru`,
        ].join("\n"),
      };
    }

    const chakraData = {};
    const lines = [];

    for (const c of worked) {
      // Simulate a before/after assessment
      const unbalancedSample =
        c.unbalanced[Math.floor(Math.random() * c.unbalanced.length)];
      const balancedSample =
        c.balanced[Math.floor(Math.random() * c.balanced.length)];

      chakraData[c.name] = {
        location: c.location,
        color: c.color,
        element: c.element,
        before: `Blocked or imbalanced — ${unbalancedSample}. Energy flow was restricted.`,
        after: `Cleared and balanced — ${balancedSample}. Energy now flows freely.`,
      };

      lines.push(
        `─── ${c.label} ───`,
        `Location: ${c.location}  |  Color: ${c.color}  |  Element: ${c.element}`,
        `Before: ${chakraData[c.name].before}`,
        `After:  ${chakraData[c.name].after}`,
        `Affirmation: "${c.affirmation}"`,
        `Recommended stones: ${c.stones.join(", ")}`,
        ""
      );
    }

    return {
      title: `Reiki Session Report — ${new Date().toLocaleDateString("en-IN")}`,
      content: [
        `Reiki Session for ${userName || "Client"}`,
        "",
        "─── SESSION OVERVIEW ───",
        `Chakras treated: ${worked.map((c) => c.label).join(", ")}`,
        "",
        ...lines,
        "─── POST-SESSION RECOMMENDATIONS ───",
        "Drink plenty of water to support detoxification.",
        "Rest and allow the energy to integrate over the next 24 hours.",
        "Continue with self-Reiki or meditation to maintain balance.",
        `Repeat the affirmations shared above for each chakra.`,
        "",
        DISCLAIMER,
        "",
        `Session generated for service #${serviceId || "N/A"} — ${new Date().toISOString()}`,
        "",
        "— Amoo Guru",
      ].join("\n"),
      chakra_data: chakraData,
    };
  }
}

module.exports = ReikiReportGenerator;
