// Mock import.meta.env before any imports
Object.defineProperty(import.meta, 'env', {
  value: { DEV: false, PROD: true },
  writable: true,
  configurable: true,
});

const { generateStarSystem } = await import('./src/lib/generator.ts');

const system = generateStarSystem({ populated: true });
console.log('Moons count:', system.moons?.length ?? 0);
if (system.moons && system.moons.length > 0) {
  const m = system.moons[0];
  console.log('Moon 0:', {
    id: m.id,
    parentId: m.parentId,
    moonOrbitAU: m.moonOrbitAU,
    distanceAU: m.distanceAU,
    type: m.type,
  });
  
  const parent = [...system.terrestrialWorlds, ...system.iceWorlds, ...system.gasWorlds]
    .find(p => p.id === m.parentId);
  console.log('Parent found:', !!parent);
  if (parent) {
    console.log('Parent:', { id: parent.id, type: parent.type, distanceAU: parent.distanceAU });
  }
}
