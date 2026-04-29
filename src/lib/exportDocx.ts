import { Document, Packer } from 'docx';
import type { StarSystem, ShipsInAreaResult, BodyAnnotations } from '../types';
import { buildTitle, buildStar, buildZones, buildMainWorld, buildInhabitants, buildPlanetarySystem } from './exportDocxBuilders';

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
