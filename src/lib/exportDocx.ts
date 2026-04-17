import {
  Document, Packer, Paragraph, TextRun,
  Table, TableRow, TableCell,
  AlignmentType, WidthType,
} from 'docx';
import type { StarSystem, ShipsInAreaResult, BodyAnnotations, PlanetaryBody } from '../types';
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

function buildInhabitants(s: StarSystem, shipsInArea?: ShipsInAreaResult | null): Paragraph[] {
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
    line('Primary Starport',  `Class ${inh.starport.class} (PSS ${inh.starport.pss}, TL cap ${inh.starport.tlCap})`),
    line('Weekly Activity', formatCredits(inh.starport.weeklyActivity)),
    line('Bases',           bases.join(', ') || 'None'),
    line('Travel Zone',     inh.travelZone + (inh.travelZoneReason ? ` — ${inh.travelZoneReason}` : '')),
    line('Culture Traits',  inh.cultureTraits.join(', ') || 'None'),
    blank(),
  );

  if (shipsInArea && shipsInArea.ships.length > 0) {
    sections.push(h2('Ships in the Area'));
    sections.push(line('Budget', formatCredits(shipsInArea.budget)));

    // Orbit and Docked as flat groups; System grouped by body position (QA-024)
    const orbitShips = shipsInArea.ships.filter(s => s.location === 'Orbit');
    const dockedShips = shipsInArea.ships.filter(s => s.location === 'Docked');
    const systemShips = shipsInArea.ships.filter(s => s.location === 'System');

    // Build display groups: Orbit, then System by body index, then Docked
    type DocxGroup = { label: string; ships: typeof orbitShips };
    const groups: DocxGroup[] = [];
    if (orbitShips.length > 0) groups.push({ label: 'In Orbit', ships: orbitShips });
    if (systemShips.length > 0) {
      const byBody = new Map<number, typeof systemShips>();
      for (const ship of systemShips) {
        const pos = ship.systemPosition ?? 1;
        if (!byBody.has(pos)) byBody.set(pos, []);
        byBody.get(pos)!.push(ship);
      }
      for (const [pos, ships] of Array.from(byBody.entries()).sort(([a], [b]) => a - b)) {
        groups.push({ label: `In System — Body ${pos}`, ships });
      }
    }
    if (dockedShips.length > 0) groups.push({ label: 'Docked at Starport', ships: dockedShips });

    for (const { label, ships: locShips } of groups) {
      sections.push(new Paragraph({ children: [run(label, { bold: true, color: BLUE, size: 22 })], spacing: { before: 120, after: 60 } }));

      const counts = new Map<string, { count: number; dt: number; cost: number }>();
      for (const ship of locShips) {
        const existing = counts.get(ship.name);
        if (existing) {
          existing.count++;
          existing.cost += ship.monthlyOperatingCost;
        } else {
          counts.set(ship.name, { count: 1, dt: ship.dt, cost: ship.monthlyOperatingCost });
        }
      }

      for (const [name, info] of counts) {
        sections.push(
          line(
            `${info.count > 1 ? `${info.count}× ` : ''}${name}`,
            `${info.dt} DT — ${formatCredits(info.cost)}`
          )
        );
      }
    }
    sections.push(blank());
  }

  return sections;
}

function getChildTypeLabel(child: { type: string; ringClass?: string }): string {
  if (child.type === 'ring') {
    const rc = child.ringClass;
    if (rc === 'faint') return 'Ring (Faint)';
    if (rc === 'visible') return 'Ring (Visible)';
    if (rc === 'showpiece') return 'Ring (Showpiece)';
    if (rc === 'great') return 'Ring (Great)';
    return 'Ring';
  }
  if (child.type === 'dwarf') return 'Dwarf Moon';
  if (child.type === 'terrestrial') return 'Terrestrial Moon';
  return child.type;
}

function buildPlanetarySystem(s: StarSystem, annotations: BodyAnnotations): (Paragraph | Table)[] {
  const mw = s.mainWorld;
  const mainWorldEntry = {
    id:          `${s.id}-mainworld`,
    type:        mw.type as string,
    typeLabel:   `${mw.type} (Main World)`,
    mass:        mw.size,
    zone:        mw.zone,
    distanceAU:  mw.distanceAU,
    radiusKm:    mw.radius,
    diameterKm:  mw.radius * 2,
    surfaceGravityG: mw.gravity,
    escapeVelocityMs: mw.escapeVelocity * 1000,
    densityGcm3: undefined as number | undefined,
    gasClass:    undefined as string | undefined,
    lesserEarthType: mw.lesserEarthType,
    atmosphere:  mw.atmosphere,
    temperature: mw.temperature,
    habitability: mw.habitability,
    isMainWorld: true,
  };

  const l1Bodies = [
    ...s.circumstellarDisks.map(b   => ({ ...b, typeLabel: 'Disk',        isMainWorld: false, atmosphere: undefined, temperature: undefined, habitability: undefined })),
    ...s.dwarfPlanets.map(b         => ({ ...b, typeLabel: 'Dwarf',       isMainWorld: false, atmosphere: undefined, temperature: undefined, habitability: undefined })),
    ...s.terrestrialWorlds.map(b    => ({ ...b, typeLabel: 'Terrestrial', isMainWorld: false, atmosphere: undefined, temperature: undefined, habitability: undefined })),
    ...s.iceWorlds.map(b            => ({ ...b, typeLabel: 'Ice World',   isMainWorld: false, atmosphere: undefined, temperature: undefined, habitability: undefined })),
    ...s.gasWorlds.map(b            => ({ ...b, typeLabel: `Gas ${b.gasClass}`, isMainWorld: false, atmosphere: undefined, temperature: undefined, habitability: undefined })),
    mainWorldEntry,
  ].sort((a, b) => a.distanceAU - b.distanceAU);

  // FR-044: parent → children map for moons and rings
  const parentChildren = new Map<string, PlanetaryBody[]>();
  for (const moon of (s.moons ?? [])) {
    if (moon.parentId) {
      const arr = parentChildren.get(moon.parentId) ?? [];
      arr.push(moon);
      parentChildren.set(moon.parentId, arr);
    }
  }
  for (const ring of (s.rings ?? [])) {
    if (ring.parentId) {
      const arr = parentChildren.get(ring.parentId) ?? [];
      arr.push(ring);
      parentChildren.set(ring.parentId, arr);
    }
  }
  for (const arr of parentChildren.values()) {
    arr.sort((a, b) => (a.moonOrbitAU ?? 0) - (b.moonOrbitAU ?? 0));
  }

  // Column widths (must sum to 100)
  const W = [5, 16, 14, 13, 13, 18, 21];

  const headerRow = new TableRow({
    tableHeader: true,
    children: ['#', 'Type', 'Zone', 'Dist (AU)', 'Mass', 'Name', 'Notes'].map((h, i) =>
      tHeaderCell(h, W[i]),
    ),
  });

  // Build rows: L1 bodies interleaved with their children
  const bodyRows: TableRow[] = [];
  let rowIdx = 0;
  const allPhysBodies: { body: typeof l1Bodies[number] | PlanetaryBody; idx: number; isMainWorld: boolean }[] = [];

  for (const body of l1Bodies) {
    const ann = annotations[body.id];
    rowIdx++;
    bodyRows.push(new TableRow({
      children: [
        tCell(rowIdx.toString(), W[0]),
        tCell(body.typeLabel,        W[1]),
        tCell(body.zone,             W[2]),
        tCell(`${body.distanceAU}`,  W[3]),
        tCell(`${body.mass}`,        W[4]),
        tCell(ann?.name   ?? '—',    W[5]),
        tCell(ann?.notes  ?? '—',    W[6]),
      ],
    }));
    allPhysBodies.push({ body, idx: rowIdx, isMainWorld: !!body.isMainWorld });

    const children = parentChildren.get(body.id) ?? [];
    for (const child of children) {
      const childAnn = annotations[child.id];
      const childType = getChildTypeLabel(child);
      rowIdx++;
      bodyRows.push(new TableRow({
        children: [
          tCell(`${rowIdx}*`, W[0]),
          tCell(`└─ ${childType}`, W[1]),
          tCell(body.zone,   W[2]),  // inherits parent zone
          tCell(`${child.moonOrbitAU ?? child.distanceAU ?? '?'}`, W[3]),
          tCell(`${child.mass}`, W[4]),
          tCell(childAnn?.name ?? '—', W[5]),
          tCell(childAnn?.notes ?? '—', W[6]),
        ],
      }));
      allPhysBodies.push({ body: child, idx: rowIdx, isMainWorld: false });
    }
  }

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

  // Physical properties detail section — one entry per body that has physics data
  const physSections: Paragraph[] = [];
  allPhysBodies.forEach(({ body, idx, isMainWorld }) => {
    const physBody = body as typeof l1Bodies[number] & PlanetaryBody;
    if (physBody.radiusKm == null) return;
    const ann = annotations[physBody.id];
    const isRing = physBody.type === 'ring';
    const typeLabel = (physBody as typeof l1Bodies[number]).typeLabel ?? getChildTypeLabel(physBody);
    const displayName = ann?.name ? `${ann.name} (${typeLabel})` : typeLabel;
    physSections.push(
      new Paragraph({
        children: [
          run(`${idx}. `, { bold: true, color: GREY, size: 18 }),
          run(displayName, { bold: true, size: 18 }),
          run(`  —  ${physBody.zone ?? body.zone ?? '—'}  ·  ${physBody.distanceAU} AU`, { color: GREY, size: 18 }),
        ],
        spacing: { before: 120, after: 40 },
      }),
    );
    if (physBody.densityGcm3 != null) physSections.push(line('Density', `${physBody.densityGcm3} g/cm³`));
    physSections.push(line('Radius',          `${formatNumber(physBody.radiusKm)} km`));
    physSections.push(line('Diameter',        `${formatNumber(physBody.diameterKm ?? physBody.radiusKm * 2)} km`));
    physSections.push(line('Surface Gravity', `${physBody.surfaceGravityG ?? (physBody as PlanetaryBody).gravity ?? '?'} G`));
    const ev = physBody.escapeVelocityMs ?? (physBody as PlanetaryBody).escapeVelocityMs;
    physSections.push(line('Escape Velocity', `${ev != null ? formatNumber(ev) : '?'} m/s`));
    // QA-DOCX: v2 details for all bodies with physics data
    if (!isRing) {
      const pb = physBody as PlanetaryBody;
      if (pb.composition) {
        physSections.push(line('Composition', pb.composition));
      }
      if (pb.reactivityDM !== undefined) {
        physSections.push(line('Reactivity DM', `${pb.reactivityDM >= 0 ? '+' : ''}${pb.reactivityDM}`));
      }
      if (pb.atmosphereCompositionAbiotic) {
        const atmoLine = pb.atmosphereComposition && pb.atmosphereComposition !== pb.atmosphereCompositionAbiotic
          ? `${pb.atmosphereCompositionAbiotic} → ${pb.atmosphereComposition} (converted)`
          : pb.atmosphereCompositionAbiotic;
        physSections.push(line('Atmosphere Composition', atmoLine));
      }
      if (pb.atmosphereDensityV2) {
        physSections.push(line('Atmosphere Density', pb.atmosphereDensityV2));
      }
      if (pb.temperatureV2) {
        physSections.push(line('Temperature', pb.temperatureV2));
      }
      if (pb.hazardV2 && pb.hazardV2 !== 'None') {
        const intensity = pb.hazardIntensityV2 ?? 'Low';
        physSections.push(line('Hazard', `${pb.hazardV2} — ${intensity}`));
      } else if (pb.hazardV2 === 'None') {
        physSections.push(line('Hazard', 'None'));
      }
      if (pb.biochem) {
        physSections.push(line('Biochem Resources', pb.biochem));
      }
      if (pb.biosphereRating && pb.biosphereRating !== 'B0') {
        const biosphereDetail = pb.biosphereRoll !== undefined && pb.biosphereTN !== undefined
          ? `${pb.biosphereRating} (roll ${pb.biosphereRoll} vs TN ${pb.biosphereTN})`
          : pb.biosphereRating;
        physSections.push(line('Biosphere', biosphereDetail));
      }
      if (isMainWorld && physBody.habitability !== undefined) {
        physSections.push(line('Habitability', `${physBody.habitability}`));
      }
      if (!isMainWorld && pb.baselineHabitability !== undefined) {
        physSections.push(line('Baseline Habitability', `${pb.baselineHabitability >= 0 ? '+' : ''}${pb.baselineHabitability}`));
      }
      if (pb.habitabilityBreakdown) {
        const bd = pb.habitabilityBreakdown;
        const parts: string[] = [];
        parts.push(`Gravity ${bd.gravity >= 0 ? '+' : ''}${bd.gravity}`);
        parts.push(`Atmo ${bd.atmosphereComp >= 0 ? '+' : ''}${bd.atmosphereComp}/${bd.atmosphereDensity >= 0 ? '+' : ''}${bd.atmosphereDensity}`);
        parts.push(`Temp ${bd.temperature >= 0 ? '+' : ''}${bd.temperature}`);
        parts.push(`Hazard ${bd.hazard >= 0 ? '+' : ''}${bd.hazard}/${bd.hazardIntensity >= 0 ? '+' : ''}${bd.hazardIntensity}`);
        parts.push(`Biochem ${bd.biochem >= 0 ? '+' : ''}${bd.biochem}`);
        parts.push(`Biosphere ${bd.biosphere >= 0 ? '+' : ''}${bd.biosphere}`);
        physSections.push(line('Habitability Breakdown', parts.join(' · ')));
      }
    }
    if (ann?.notes) physSections.push(line('Notes', ann.notes));
  });

  return [
    h1('Planetary System'),
    countPara('Circumstellar Disks', s.circumstellarDisks.length),
    countPara('Dwarf Planets',       s.dwarfPlanets.length),
    countPara('Terrestrial Worlds',  s.terrestrialWorlds.length),
    countPara('Ice Worlds',          s.iceWorlds.length),
    countPara('Gas Giants',          s.gasWorlds.length),
    countPara('Moons',               s.moons?.length ?? 0),
    countPara('Rings',               s.rings?.length ?? 0),
    blank(),
    table,
    blank(),
    ...(physSections.length > 0 ? [h2('Physical Properties Detail'), ...physSections, blank()] : []),
  ];
}

// ── Public export ─────────────────────────────────────────────────────────────

export async function exportToDocx(system: StarSystem, annotations: BodyAnnotations, shipsInArea?: ShipsInAreaResult | null): Promise<void> {
  const doc = new Document({
    creator: 'Mneme CE World Generator',
    title:   `${system.primaryStar.class}${system.primaryStar.grade} Star System`,
    sections: [{
      children: [
        ...buildTitle(system),
        ...buildStar(system),
        ...buildZones(system),
        ...buildMainWorld(system),
        ...buildInhabitants(system, shipsInArea),
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
