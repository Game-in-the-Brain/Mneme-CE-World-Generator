import { BookOpen } from 'lucide-react';
// @ts-ignore - lucide-react types

export function Glossary() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-3">
          <BookOpen style={{ color: 'var(--accent-red)' }} size={24} />
          Definitions &amp; Units of Measure
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Reference for all abbreviations, units, and terms used throughout
          the Mneme CE World Generator.
        </p>
      </div>

      <GlossarySection title="Stellar &amp; Orbital Units">
        <GlossaryEntry term="M☉"  unit="Solar Mass"
          def="The mass of Earth's Sun — 1.989 × 10³⁰ kg. Used to express the mass of all
stars generated." />
        <GlossaryEntry term="L☉"  unit="Solar Luminosity"
          def="The total energy output of Earth's Sun — 3.828 × 10²⁶ watts. Used to
express stellar brightness. Determines zone boundaries via √L☉." />
        <GlossaryEntry term="AU"  unit="Astronomical Unit"
          def="The mean distance between Earth and the Sun — 149,597,870 km (≈ 150 million
 km). All orbital distances are expressed in AU." />
        <GlossaryEntry term="√L☉" unit="Square root of luminosity"
          def="The scale factor used to compute zone boundaries. A star twice as luminous
has habitable zones shifted outward by √2 ≈ 1.41×." />
      </GlossarySection>

      <GlossarySection title="Stellar Classification">
        <GlossaryEntry term="Class O" unit="Blue-white supergiant"
          def="Temperature > 30,000 K. Extremely luminous (10⁵–10⁶ L☉). Rare and
short-lived. Intense UV radiation — no stable habitable zone. Generates circumstellar
disks only." />
        <GlossaryEntry term="Class B" unit="Hot blue giant"
          def="Temperature 10,000–30,000 K. Very luminous (10²–10⁵ L☉). Short stellar
lifetime. Generates circumstellar disks only." />
        <GlossaryEntry term="Class A" unit="White main sequence"
          def="Temperature 7,500–10,000 K. Luminous (5–100 L☉). Generates circumstellar
disks only." />
        <GlossaryEntry term="Class F" unit="Yellow-white"
          def="Temperature 6,000–7,500 K. Above-average luminosity (1.5–5 L☉). Habitable
zone possible. Adv+2 on planet count and mass rolls." />
        <GlossaryEntry term="Class G" unit="Yellow (Sun-like)"
          def="Temperature 5,200–6,000 K. Sun-like luminosity (0.6–1.5 L☉). Optimal for
life. Adv+1 on planet count and mass rolls." />
        <GlossaryEntry term="Class K" unit="Orange dwarf"
          def="Temperature 3,700–5,200 K. Below-average luminosity (0.1–0.6 L☉). Good
stable habitable zone. No modifier." />
        <GlossaryEntry term="Class M" unit="Red dwarf"
          def="Temperature < 3,700 K. Dim (< 0.1 L☉). Very common. Narrow habitable zone;
tidally locked planets possible. Dis+1 on planet count and mass rolls." />
        <GlossaryEntry term="Grade" unit="0–9"
          def="Luminosity subdivision within a class. Grade 0 is the most luminous within
the class; Grade 9 is the least. A G0 star is brighter than a G9 star." />
      </GlossarySection>

      <GlossarySection title="Habitability Zones">
        <GlossaryEntry term="Infernal" unit="Zone"
          def="Closest zone to the star. Temperatures extreme; surfaces may be molten.
Class III hot Jupiters form here. Range: 0 to √L☉ × 0.4 AU." />
        <GlossaryEntry term="Hot" unit="Zone"
          def="Inner warm zone. Too hot for liquid water on most surfaces without thick
atmosphere. Class IV/V hot Jupiters form here. Range: √L☉ × 0.4 to 0.8 AU." />
        <GlossaryEntry term="Conservative" unit="Habitable Zone"
          def="The most reliably habitable region — liquid water stable on a rocky surface
 for billions of years. Range: √L☉ × 0.8 to 1.2 AU." />
        <GlossaryEntry term="Cold" unit="Zone (Optimistic Habitable)"
          def="Outer warm zone. Water may exist with greenhouse effect. Range: √L☉ × 1.2
to 4.85 AU." />
        <GlossaryEntry term="Outer" unit="Outer Solar System"
          def="Cold outer reaches. Ice worlds and gas giants Class I–II dominate. Range: ≥
 √L☉ × 4.85 AU." />
      </GlossarySection>

      <GlossarySection title="Physical Properties — Planetary Bodies">
        <GlossaryEntry term="EM"    unit="Earth Mass"
          def="Mass of Earth = 5.972 × 10²⁴ kg. All planetary body masses are expressed in
 EM." />
        <GlossaryEntry term="G"     unit="Surface Gravity"
          def="Surface gravitational acceleration relative to Earth (1 G = 9.81 m/s²).
Values above 1.5 G or below 0.3 G severely reduce habitability." />
        <GlossaryEntry term="g/cm³" unit="Grams per cubic centimetre"
          def="Unit of density. Water = 1 g/cm³. Rocky terrestrial planets average 4–6
g/cm³. Gas giants average 0.3–1.3 g/cm³." />
        <GlossaryEntry term="km"    unit="Kilometres"
          def="Used for radius and diameter of planetary bodies. Earth radius ≈ 6,371 km;
diameter ≈ 12,742 km." />
        <GlossaryEntry term="m/s"   unit="Metres per second"
          def="Unit for escape velocity — the minimum speed needed to leave a body's
surface without further propulsion. Earth escape velocity ≈ 11,186 m/s." />
        <GlossaryEntry term="ΔV"    unit="Delta-V"
          def="Change in velocity required for a manoeuvre. Here used to express escape
velocity — the minimum ΔV to leave the planet's gravity well from the surface." />
      </GlossarySection>

      <GlossarySection title="Body Types">
        <GlossaryEntry term="Disk"         unit="Circumstellar Disk"
          def="A rotating disk of dust, gas, and debris orbiting a star. May be a
protoplanetary disk (planet-forming) or a debris disk (post-formation remnant). No solid
surface." />
        <GlossaryEntry term="Dwarf"        unit="Dwarf Planet / Lesser Earth"
          def="A small rocky body in the 0.001–0.1 EM range. Sub-types: Carbonaceous
(volatile-rich), Silicaceous (rocky), Metallic (iron-rich), Other." />
        <GlossaryEntry term="Terrestrial"  unit="Terrestrial World"
          def="A rocky planet in the 0.1–7 EM range. May have atmosphere, liquid water,
and life. The main world is usually terrestrial." />
        <GlossaryEntry term="Ice Worlds"   unit="Ice World"
          def="A body dominated by water ice, frozen gases, or volatile ices. Found in
cold and outer zones. Density 1.0–2.0 g/cm³." />
        <GlossaryEntry term="Gas I"        unit="Gas World Class I"
          def="Ammonia clouds. Cold outer system. Temp < 150 K. Jupiter-like at large
orbital radii." />
        <GlossaryEntry term="Gas II"       unit="Gas World Class II"
          def="Water clouds. Conservative or cold zone. Temp 150–250 K. Saturn-like." />
        <GlossaryEntry term="Gas III"      unit="Gas World Class III (Hot Jupiter)"
          def="Cloudless hot giant in the Infernal zone. Surface temp > 700 K. Migrated
inward — clears its zone of all other non-disk bodies." />
        <GlossaryEntry term="Gas IV"       unit="Gas World Class IV (Alkali Metals)"
          def="Alkali metal clouds in the Hot zone. Temp 900–1400 K. Hot Jupiter variant."
 />
        <GlossaryEntry term="Gas V"        unit="Gas World Class V (Silicate Clouds)"
          def="Silicate and iron clouds. Extremely hot (> 1400 K) in the Hot zone. Rarest
gas giant class." />
      </GlossarySection>

      <GlossarySection title="Inhabitants &amp; Society">
        <GlossaryEntry term="TL"         unit="Tech Level"
          def="Technology Level — a scale from 7 to 16 representing the society's
technological sophistication. TL 7 = Early Space Age (c.1950–2000); TL 16 =
Self-Sufficient Megastructures." />
        <GlossaryEntry term="PVS"        unit="Port Value Score"
          def="Port Value Score — an internal calculated value used to determine starport
class. Formula: (Habitability ÷ 4) + (TL − 7) + Wealth modifier + Development modifier."
 />
        <GlossaryEntry term="Cr"         unit="Credits"
          def="The standard currency unit. No fixed real-world equivalent — a rough guide
is 1 Cr ≈ modest daily wage at TL 11." />
        <GlossaryEntry term="Cr/week"    unit="Credits per week"
          def="Starport economic output — the total weekly trade volume handled by the
starport. Scales exponentially with Port Value Score (10^PVS)." />
        <GlossaryEntry term="Habitability" unit="Score"
          def="A composite score reflecting how liveable a world is for humans without
technological assistance. Positive = hospitable; negative = hostile. Components: gravity,
atmosphere, temperature, hazard, biochemical resources." />
        <GlossaryEntry term="Green Zone"   unit="Travel Zone"
          def="Safe for travel. No special precautions required beyond normal starfaring
practice." />
        <GlossaryEntry term="Amber Zone"   unit="Travel Zone"
          def="Travellers are warned to be on guard. May indicate active hazards,
political instability, environmental danger, or disease. Proceed with caution." />
        <GlossaryEntry term="Red Zone"     unit="Travel Zone"
          def="Actively dangerous to outsiders. May result from high inequality + violent
political structures, or extreme environmental conditions. Entry not recommended without
specific purpose." />
        <GlossaryEntry term="DM"           unit="Dice Modifier"
          def="A bonus or penalty applied to a dice roll. Positive DM = better outcome;
negative DM = worse outcome. The Governance DM reflects how effectively a society is
administered." />
      </GlossarySection>

      <GlossarySection title="Dice Notation">
        <GlossaryEntry term="2D6"      unit="" def="Roll two six-sided dice and sum them.
Range 2–12." />
        <GlossaryEntry term="5D6"      unit="" def="Roll five six-sided dice and sum them.
 Range 5–30. Used for stellar class and grade." />
        <GlossaryEntry term="Adv+N"    unit="Advantage"
          def="Roll (2+N) dice, keep the best 2. Adv+1 = 3D6 keep 2 highest. Adv+2 = 4D6
keep 2 highest. Shifts results toward higher values." />
        <GlossaryEntry term="Dis+N"    unit="Disadvantage"
          def="Roll (2+N) dice, keep the worst 2. Dis+1 = 3D6 keep 2 lowest. Shifts
results toward lower values." />
        <GlossaryEntry term="2D3"      unit="" def="Roll two three-sided dice (or roll D6
 ÷ 2 rounded up). Range 2–6. Used for disk, ice, and gas world counts." />
      </GlossarySection>
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────

function GlossarySection({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold mb-3 pb-1 border-b"
          style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
        {title}
      </h2>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function GlossaryEntry({ term, unit, def }: {
  term: string;
  unit: string;
  def: string;
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-3 py-2 border-b"
         style={{ borderColor: 'var(--border-color)' }}>
      <div>
        <span className="font-bold text-sm"
              style={{ color: 'var(--text-primary)' }}>{term}</span>
        {unit && (
          <div className="text-xs mt-0.5"
               style={{ color: 'var(--text-secondary)' }}>{unit}</div>
        )}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {def}
      </div>
    </div>
  );
}
