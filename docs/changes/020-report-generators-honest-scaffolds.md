# 020 — Report generators: stop presenting scaffolds as real readings

- **Category**: Bug Fix / Documentation
- **Severity**: Medium
- **File(s) affected**:
  - `amoo-backend/src/report-generators/base.js`
  - `amoo-backend/src/report-generators/kundali.js`
  - `amoo-backend/src/report-generators/tarot.js`
  - `amoo-backend/src/report-generators/numerology.js`
  - `amoo-backend/src/report-generators/reiki.js`

> Per the project decision, the generators stay as scaffolds — the domain logic
> (real Vedic astrology, professional numerology) is not something to invent.
> The requirement was to make the placeholder status **explicit**, so a user is
> never shown a fabricated reading as if it were real. This change does that.

## Problem

`POST /api/reports` auto-generates report content from these four generators.
Their maturity varied wildly, but nothing said so:

- **Kundali** had no calculation at all and emitted its own dev TODOs straight
  into the user-facing report:

  ```
  ─── CHART DATA (Placeholder) ───
  *** TODO: Replace with real Vedic astrology calculations ***
  Ascendant (Lagna):    ?
  Moon Sign (Rashi):    ?
  Planet Positions:     Sun ?, Moon ?, Mars ?, ...
  ```

  A customer requesting a birth chart received a document full of `?` and
  `*** TODO ***`. That is the worst outcome — either it looks broken, or (if the
  `?`s were ever filled with plausible-looking values) a user makes real
  decisions on invented astrology.

- **Tarot, numerology, reiki** *do* run real deterministic logic (a card draw
  against a meanings deck, Pythagorean life-path/expression reduction, a chakra
  dataset). Their output is plausible and self-consistent — but it was presented
  with no indication that it is automated guidance rather than a professional
  consultation, and each ended with a bespoke, inconsistent "NOTE" line (or
  none).

## Solution

A maturity model on the base class, an honest shared disclaimer on every report,
and an honest kundali that refuses to fabricate.

**`base.js`** gains:
- `static maturity` — `"heuristic"` (real logic runs) or `"scaffold"` (no
  calculation yet). Defaults to `"scaffold"` so a new generator is treated as
  unproven until it declares otherwise. `static get isScaffold()` derives from
  it.
- A shared `DISCLAIMER` constant appended to every report: *"generated
  automatically for guidance and self-reflection … not a substitute for
  professional … advice."*

**Kundali** (`maturity = "scaffold"`) no longer fabricates or leaks TODOs. It
echoes the birth details it was given, states that the full chart is being
prepared (or asks for missing details), and says plainly that *"an automated
preview cannot responsibly calculate a birth chart, so we do not show
placeholder positions."* Its title carries **"(In Preparation)"** so the
dashboard shows the provisional status. The graduation path — birth columns now
exist on `users`; wire an ephemeris library or a Vedic API, then set
`maturity = "heuristic"` — is documented in the file.

**Tarot / numerology / reiki** (`maturity = "heuristic"`) keep their logic; each
now ends with the shared `DISCLAIMER` in place of its ad-hoc note.

## Before / After

**Kundali — before** (shipped to the user)
```
─── CHART DATA (Placeholder) ───
*** TODO: Replace with real Vedic astrology calculations ***
Ascendant (Lagna):    ?
Current Dasha:        ?
─── INTERPRETATION (Placeholder) ───
*** TODO: Interpret the chart data ***
```

**Kundali — after**
```
─── STATUS ───
Thank you — we have your birth details. Your full Vedic birth chart
(ascendant, planetary positions, houses and dasha periods) is being
prepared by our astrologer and will appear here shortly.

An automated preview cannot responsibly calculate a birth chart, so we
do not show placeholder positions here — your reading is prepared by a
person, not fabricated by the system.

─── PLEASE NOTE ───
This report is generated automatically for guidance and self-reflection.
...
```
Title: `Kundali / Birth Chart (In Preparation) — <name>`

**base.js — new surface**
```js
static maturity = "scaffold";                 // subclasses override
static get isScaffold() { return this.maturity === "scaffold"; }

const DISCLAIMER = [
  "─── PLEASE NOTE ───",
  "This report is generated automatically for guidance and self-reflection.",
  "It is not a substitute for professional financial, medical, legal or",
  "psychological advice. Your choices shape your path.",
].join("\n");
```

**tarot/numerology/reiki — footer**
```diff
-"─── NOTE ───",
-"This reading is for guidance and reflection. Your future is shaped by your own choices.",
+DISCLAIMER,
```

## Testing notes

Direct generator check (no DB needed):
```bash
node -e "const {getGenerator}=require('./src/report-generators');(async()=>{
  for (const t of ['tarot','numerology','reiki','kundali']) {
    const g = getGenerator(t);
    const o = await g.generate({userId:1,serviceId:1,userName:'Test',extras:{dob:'1990-05-15',fullName:'Test User'}});
    console.log(t, 'scaffold='+g.constructor.isScaffold,
                'disclaimer='+o.content.includes('PLEASE NOTE'),
                'leaksTODO='+/TODO|\\*\\*\\*|Placeholder/.test(o.content));
  }})()"
```
Result — every generator carries the disclaimer, none leak TODO markers, and
only kundali reports `scaffold=true`:
```
tarot       scaffold=false disclaimer=true leaksTODO=false
numerology  scaffold=false disclaimer=true leaksTODO=false
reiki       scaffold=false disclaimer=true leaksTODO=false
kundali     scaffold=true  disclaimer=true leaksTODO=false
```

Backend `npm test` 73/73.

## Risk / impact

- **`getGenerator(type).constructor.isScaffold`** is now available to the
  reports route and any admin UI that wants to badge scaffold reports
  ("Preview" / "In Preparation") beyond the title marker. Not yet consumed by
  the frontend — flagged in the readiness report.
- **The heuristic generators are still guidance/entertainment, not certified
  advice.** The disclaimer states this; it is a content decision, not a code
  one, whether that is acceptable for the product.
- **Kundali produces no chart until a real engine is wired in.** That is the
  intended, honest behaviour. A customer who paid for a birth chart gets an
  "in preparation" report and an expert follows up — so **operationally, someone
  must actually prepare these** until the generator graduates. This is a
  business/process note, not just a code gap; it is in the readiness report.
- No schema change; `reports.status` is unchanged. If you want scaffold reports
  to sit in a distinct state, add a status value and set it when
  `isScaffold` — deferred as it needs a product decision.
