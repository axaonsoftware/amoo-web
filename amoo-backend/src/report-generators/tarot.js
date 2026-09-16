const path = require("path");
const BaseReportGenerator = require("./base");
const { DISCLAIMER } = require("./base");

const tarotCards = require(path.join(__dirname, "data", "tarot-meanings.json"));

// Pick a random element from an array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Draw n cards; 50 % chance each is reversed
function drawCards(n) {
  const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map((c) => ({
    ...c,
    isReversed: Math.random() < 0.5,
  }));
}

class TarotReportGenerator extends BaseReportGenerator {
  static type = "tarot";
  // Real card-draw logic runs against a curated meanings deck — plausible and
  // self-consistent, but guidance/entertainment, not professional divination.
  static maturity = "heuristic";

  async generate({ userId, serviceId, userName, extras }) {
    // Accept explicit cards, or draw a 3-card past → present → future spread
    const rawCards = Array.isArray(extras?.cards) ? extras.cards : null;
    const drawn = rawCards
      ? rawCards.map((name) => {
          const match = tarotCards.find(
            (c) => c.name.toLowerCase() === name.toLowerCase()
          );
          return {
            ...(match || { name, upright: "Card not found in deck", reversed: "" }),
            isReversed: Math.random() < 0.5,
          };
        })
      : drawCards(3);

    const cardLines = drawn.map(
      (c, i) =>
        `${c.name}${c.isReversed ? " (Reversed)" : ""} — ${
          c.isReversed ? c.reversed : c.upright
        }`
    );

    const spreadLabel = rawCards ? "Cards Drawn" : "3-Card Spread (Past → Present → Future)";

    return {
      title: `Tarot Reading — ${new Date().toLocaleDateString("en-IN")}`,
      content: [
        `Dear ${userName || "Seeker"},`,
        "",
        "Thank you for your tarot consultation. The cards reveal the following guidance.",
        "",
        `─── ${spreadLabel} ───`,
        ...cardLines.map((l) => "  " + l), 
        "",
        "─── OVERALL THEME ───",
        `The energy of this reading is shaped by ${drawn[0]?.name}, ${drawn[1]?.name}, and ${drawn[2]?.name}.`,
        "The cards suggest a journey of awareness — trust your intuition and stay open to the messages that emerge.",
        "",
        DISCLAIMER,
        "",
        `Reading generated for service #${serviceId || "N/A"} — ${new Date().toISOString()}`,
        "",
        "— Amoo Guru",
      ].join("\n"),
    };
  }
}

module.exports = TarotReportGenerator;
