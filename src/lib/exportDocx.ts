import {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell,
  AlignmentType, WidthType,
} from 'docx';
import type { StarSystem } from '../types';
import type { BodyAnnotations } from '../types';
import { formatNumber, formatPopulation, formatCredits } from './format';

// ── Colour palette (visible on white paper) ──────────────────────────────────
const RED  = '8B2635';
const BLUE = '1A237E';
const GREY = '757575';

// ── Low-level helpers ─────────────────────────────────────────────────────────

function run(
  text: string,
  opts: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {},
): TextRun {
  return new TextRun({
    text,
    bold:    opts.bold,
    color:   opts.color,
    size:    opts.size ?? 20,
    italics: opts.italics,
  });
}

function h1(text: string): Paragraph {
  return new Paragraph({
    children: [run(text, { bold: true, color: RED, size: 36 })],
    spacing:  { before: 400, after: 160 },
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    children: [run(text, { bold: true, color: BLUE, size: 26 })],
    spacing:  { before: 280, after: 120 },
  });
}

function line(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      run(label + ': ', { bold: true, color: GREY }),
      run(value),
    ],
    spacing: { before: 40, after: 40 },
  });
}

function blank(): Paragraph {
  return new Paragraph({ children: [run('')], spacing: { before: 80, after: 80 } });
}

function tCell(text: string, widthPct: number, bold = false): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [run(text, { bold, size: 18 })] })],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
  });
}

function tHeaderCell(text: string, widthPct: number): TableCell {
  return new TableCell({
    children: [new Paragraph({ children: [run(text, { bold: true, color: BLUE, size: 18 })] })],
    width: { size: widthPct, type: WidthType.PERCENTAGE },
  });
}

// ── Section builders ──────────────────────────────────────────────────────────

function buildTitle(s: StarSystem): Paragraph[] {
  const date = new Date(s.createdAt).toLocaleString();
  return [
    blank(),
    new Paragraph({
      children:  [run(`${s.primaryStar.class}${s.primaryStar.grade} Star System`, { bold: true, color: RED, size: 56 })],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children:  [run('Mneme CE — World Generator', { color: GREY, size: 22 })],
      alignment: AlignmentType.CENTER,
      spacing:   { after: 80 },
    }),
    new Paragraph({
      children:  [run(`Generated: ${date}`, { color: GREY, size: 18, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing:   { after: 400 },
    }),
  ];
}

function buildStar(s: StarSystem): Paragraph[] {
  const sections: Paragraph[] = [
    h1('Primary Star'),
    line('Spectral Class', `${s.primaryStar.class}${s.primaryStar.grade}`),
    line('Mass',           `${formatNumber(s.primaryStar.mass)} M☉`),
    line('Luminosity',     `${s.primaryStar.luminosity} L☉`),
    line('Color',          s.primaryStar.color),
    line('Companions',     s.companionStars.length.toString()),
  ];

  if (s.companionStars.length > 0) {
    sections.push(h2('Companion Stars'));
    s.companionStars.forEach((star, i) => {
      sections.push(
        new Paragraph({
          children: [run(`Companion ${i + 1}: ${star.class}${star.grade}`, { bold: true, size: 20 })],
          spacing:  { before: 80, after: 40 },
        }),
        line('Mass',       `${formatNumber(star.mass)} M☉`),
        line('Luminosity', `${star.luminosity} L☉`),
        line('Distance',   `${star.orbitDistance ?? '?'} AU from ${star.orbits ?? 'primary'}`),
      );
    });
  }

  sections.push(blank());
  return sections;
}

function buildZones(s: StarSystem): Paragraph[] {
  const z = s.zones;
  return [
    h1('Habitable Zones'),
    line('Infernal',      `0 – ${z.infernal.max.toFixed(2)} AU`),
    line('Hot',           `${z.hot.min.toFixed(2)} – ${z.hot.max.toFixed(2)} AU`),
    line('Conservative',  `${z.conservative.min.toFixed(2)} – ${z.conservative.max.toFixed(2)} AU`),
    line('Cold',          `${z.cold.min.toFixed(2)} – ${z.cold.max.toFixed(2)} AU`),
    line('Outer',         `≥ ${z.outer.min.toFixed(2)} AU`),
    line('Main World',    `${s.mainWorld.zone} Zone at ${s.mainWorld.distanceAU} AU`),
    blank(),
  ];
}

function buildMainWorld(s: StarSystem): Paragraph[] {
  const w = s.mainWorld;
  return [
    h1('Main World'),
    h2('Physical Characteristics'),
    line('Type',            w.type),
    line('Size',            `${formatNumber(w.size)} km`),
    line('Gravity',         `${w.gravity} G`),
    line('Radius',          `${formatNumber(w.radius)} km`),
    line('Escape Velocity', `${formatNumber(w.escapeVelocity)} km/s`),
    h2('Environment'),
    line('Atmosphere',      `${w.atmosphere} (TL ${w.atmosphereTL})`),
    line('Temperature',     `${w.temperature} (TL ${w.temperatureTL})`),
    line('Hazard',          w.hazard !== 'None'
      ? `${w.hazard} — ${w.hazardIntensity} (TL ${w.hazardIntensityTL})`
      : 'None'),
    line('Resources',       w.biochemicalResources),
    line('Habitability',    w.habitability.toString()),
    blank(),
  ];
}

function buildInhabitants(s: StarSystem): Paragraph[] {
  const inh = s.inhabitants;
  if (inh.populated === false) {
    return [
      h1('Inhabitants'),
      new Paragraph({
        children: [run('Unpopulated World — no permanent inhabitants.', { italics: true, color: GREY })],
      }),
      blank(),
    ];
  }

  const bases: string[] = [];
  if (inh.starport.hasNavalBase)  bases.push('Naval');
  if (inh.starport.hasScoutBase)  bases.push('Scout');
  if (inh.starport.hasPirateBase) bases.push('Pirate');

  const govSign = inh.governance >= 0 ? `+${inh.governance}` : `${inh.governance}`;

  const sections: Paragraph[] = [
    h1('Inhabitants'),
    line('Tech Level',      `TL ${inh.techLevel}`),
    line('Population',      formatPopulation(inh.population)),
  ];
  if (inh.habitatType) {
    sections.push(line('Habitat Type', `${inh.habitatType} — Artificial Habitat`));
  }
  sections.push(
    line('Wealth',          inh.wealth),
    line('Development',     inh.development),
    line('Power Structure', inh.powerStructure),
    line('Source of Power', inh.sourceOfPower),
    line('Governance DM',   govSign),
    line('Starport Class',  `Class ${inh.starport.class}`),
    line('Weekly Output',   formatCredits(inh.starport.output)),
    line('Bases',           bases.join(', ') || 'None'),
    line('Travel Zone',     inh.travelZone + (inh.travelZoneReason ? ` — ${inh.travelZoneReason}` : '')),
    line('Culture Traits',  inh.cultureTraits.join(', ') || 'None'),
    blank(),
  );
  return sections;
}

function buildPlanetarySystem(s: StarSystem, annotations: BodyAnnotations): (Paragraph | Table)[] {
  const allBodies = [
    ...s.circumstellarDisks.map(b   => ({ ...b, typeLabel: 'Disk' })),
    ...s.dwarfPlanets.map(b         => ({ ...b, typeLabel: 'Dwarf' })),
    ...s.terrestrialWorlds.map(b    => ({ ...b, typeLabel: 'Terrestrial' })),
    ...s.iceWorlds.map(b            => ({ ...b, typeLabel: 'Ice World' })),
    ...s.gasWorlds.map(b            => ({ ...b, typeLabel: `Gas ${b.gasClass}` })),
  ].sort((a, b) => a.distanceAU - b.distanceAU);

  // Column widths (must sum to 100)
  const W = [5, 16, 14, 13, 13, 18, 21];

  const headerRow = new TableRow({
    tableHeader: true,
    children: ['#', 'Type', 'Zone', 'Dist (AU)', 'Mass', 'Name', 'Notes'].map((h, i) =>
      tHeaderCell(h, W[i]),
    ),
  });

  const bodyRows = allBodies.map((body, idx) => {
    const ann = annotations[body.id];
    return new TableRow({
      children: [
        tCell((idx + 1).toString(), W[0]),
        tCell(body.typeLabel,        W[1]),
        tCell(body.zone,             W[2]),
        tCell(`${body.distanceAU}`,  W[3]),
        tCell(`${body.mass}`,        W[4]),
        tCell(ann?.name   ?? '—',    W[5]),
        tCell(ann?.notes  ?? '—',    W[6]),
      ],
    });
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...bodyRows],
  });

  const countPara = (label: string, n: number) =>
    new Paragraph({
      children: [
        run(label + ': ', { bold: true, size: 20 }),
        run(n.toString(), { size: 20 }),
      ],
      spacing: { before: 40, after: 40 },
    });

  return [
    h1('Planetary System'),
    countPara('Circumstellar Disks', s.circumstellarDisks.length),
    countPara('Dwarf Planets',       s.dwarfPlanets.length),
    countPara('Terrestrial Worlds',  s.terrestrialWorlds.length),
    countPara('Ice Worlds',          s.iceWorlds.length),
    countPara('Gas Giants',          s.gasWorlds.length),
    blank(),
    table,
    blank(),
  ];
}

// ── Public export ─────────────────────────────────────────────────────────────

export async function exportToDocx(system: StarSystem, annotations: BodyAnnotations): Promise<void> {
  const doc = new Document({
    creator: 'Mneme CE World Generator',
    title:   `${system.primaryStar.class}${system.primaryStar.grade} Star System`,
    sections: [{
      children: [
        ...buildTitle(system),
        ...buildStar(system),
        ...buildZones(system),
        ...buildMainWorld(system),
        ...buildInhabitants(system),
        ...buildPlanetarySystem(system, annotations),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `mneme-system-${system.id.slice(0, 8)}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
