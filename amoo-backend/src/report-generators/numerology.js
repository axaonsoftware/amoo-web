const path = require("path");
const BaseReportGenerator = require("./base");
const { DISCLAIMER } = require("./base");

const data = require(path.join(__dirname, "data", "numerology-meanings.json"));
const { mapping, numbers } = data;

// Reduce a number to a single digit (or master number)
function reduce(n) {
  if ([11, 22, 33].includes(n)) return n;
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n;
}

// Compute Life Path Number from "YYYY-MM-DD"
function lifePath(dob) {
  const parts = dob.split("-");
  if (parts.length !== 3) return null;
  const sum = parts.join("").split("").reduce((s, d) => s + parseInt(d, 10), 0);
  return reduce(sum);
}

// Map a name to numbers using the Pythagorean table
function nameToNumbers(name) {
  const lookup = {};
  for (const [num, letters] of Object.entries(mapping)) {
    for (const l of letters) lookup[l] = parseInt(num, 10);
  }
  const chars = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("");
  return chars.map((c) => lookup[c] || 0);
}

// Expression Number: full name sum reduced
function expressionNumber(fullName) {
  const nums = nameToNumbers(fullName);
  const total = nums.reduce((s, n) => s + n, 0);
  return reduce(total);
}

// Soul Urge Number: vowels only
const VOWELS = new Set(["A", "E", "I", "O", "U"]);
function soulUrgeNumber(fullName) {
  const chars = fullName.toUpperCase().split("");
  const vowelNums = chars
    .filter((c) => VOWELS.has(c))
    .map((c) => mapping[c] || 0);
  if (vowelNums.length === 0) return null;
  return reduce(vowelNums.reduce((s, n) => s + n, 0));
}

// Birthday Number: day of month reduced
function birthdayNumber(dob) {
  const parts = dob.split("-");
  if (parts.length !== 3) return null;
  return reduce(parseInt(parts[2], 10));
}

// Look up a number's meaning
function meaning(num) {
  return numbers[String(num)] || numbers["1"];
}

class NumerologyReportGenerator extends BaseReportGenerator {
  static type = "numerology";
  // Real Pythagorean numerology (life-path/expression/soul-urge reduction) —
  // deterministic and self-consistent, offered as guidance, not fact.
  static maturity = "heuristic";

  async generate({ userId, serviceId, userName, extras }) {
    const dob = extras?.dob || "1990-01-01";
    const fullName = extras?.fullName || userName || "Unknown";

    const lp = lifePath(dob);
    const expr = expressionNumber(fullName);
    const soul = soulUrgeNumber(fullName);
    const bday = birthdayNumber(dob);

    const sections = [];

    const printNumber = (label, value) => {
      if (value === null) return `${label}: N/A`;
      const m = meaning(value);
      return `${label}: ${value} — ${m.title}\n    Core traits: ${m.positive.join(", ")}\n    Shadow traits: ${m.negative.join(", ")}\n    ${m.description}`;
    };

    sections.push(
      ["─── LIFE PATH NUMBER ───", printNumber("Life Path Number", lp)].join("\n")
    );
    sections.push(
      ["─── EXPRESSION / DESTINY NUMBER ───", printNumber("Expression Number", expr)].join("\n")
    );
    if (soul !== null) {
      sections.push(
        ["─── SOUL URGE / HEART'S DESIRE ───", printNumber("Soul Urge Number", soul)].join("\n")
      );
    }
    if (bday !== null) {
      sections.push(
        ["─── BIRTHDAY NUMBER ───", printNumber("Birthday Number", bday)].join("\n")
      );
    }

    return {
      title: `Numerology Report — ${fullName}`,
      content: [
        `Numerology Profile for ${fullName}`,
        `Date of Birth: ${dob}`,
        "",
        ...sections,
        "",
        "─── SUMMARY ───",
        `Your Life Path ${lp} sets the overall direction, while your Expression ${expr} shapes how you engage with the world.`,
        "",
        DISCLAIMER,
        "",
        `Report generated for service #${serviceId || "N/A"} — ${new Date().toISOString()}`,
        "",
        "— Amoo Guru",
      ].join("\n"),
    };
  }
}

module.exports = NumerologyReportGenerator;
