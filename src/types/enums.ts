// =====================
// Simple Type Aliases / Enums
// =====================

export type StellarClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';
export type StellarGrade = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Zone = 'Infernal' | 'Hot' | 'Conservative' | 'Cold' | 'Outer';

export type WorldType = 'Habitat' | 'Dwarf' | 'Terrestrial';
export type LesserEarthType = 'Carbonaceous' | 'Silicaceous' | 'Metallic' | 'Other';

export type AtmosphereType = 'Average' | 'Thin' | 'Trace' | 'Dense' | 'Crushing';
export type TemperatureType = 'Average' | 'Cold' | 'Freezing' | 'Hot' | 'Inferno';
export type HazardType = 'None' | 'Polluted' | 'Corrosive' | 'Biohazard' | 'Toxic' | 'Radioactive';
export type HazardIntensityType = 'Very Mild' | 'Mild' | 'Serious' | 'High' | 'Intense';
export type HazardIntensity = 'Trace' | 'Light' | 'Moderate' | 'Heavy' | 'Extreme';
export type ResourceLevel = 'Scarce' | 'Rare' | 'Uncommon' | 'Abundant' | 'Inexhaustible';

// FR-041: v2 composition / atmosphere / biosphere types
export type CompositionTerrestrial = 'Exotic' | 'Iron-Dominant' | 'Iron-Silicate' | 'Silicate-Basaltic' | 'Hydrous' | 'Carbonaceous' | 'Ceramic';
export type CompositionDwarf = 'Exotic' | 'Metallic' | 'Silicaceous' | 'Hydrous' | 'Carbonaceous' | 'Rubble-Pile' | 'Volatile-Rich';
export type AtmosphereComp = 'H-He' | 'Methane-Ammonia' | 'Nitrogen-Inert' | 'Carbon-Dioxide' | 'Water-Steam' | 'Sulfuric' | 'Exotic' | 'None';
export type AtmoDensity = 'Trace' | 'Thin' | 'Average' | 'Dense' | 'Crushing';
export type BiochemTier = 'Scarce' | 'Rare' | 'Uncommon' | 'Poor' | 'Deficient' | 'Common' | 'Abundant' | 'Rich' | 'Bountiful' | 'Prolific' | 'Inexhaustible';
export type BiosphereRating = 'B0' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6';
export type RingProminence = 'faint' | 'moderate' | 'prominent' | 'brilliant' | 'massive';

export type WealthLevel = 'Average' | 'Better-off' | 'Prosperous' | 'Affluent';
export type PowerStructure = 'Anarchy' | 'Confederation' | 'Federation' | 'Unitary State';
export type DevelopmentLevel = 'UnderDeveloped' | 'Developing' | 'Mature' | 'Developed' | 'Well Developed' | 'Very Developed';
export type PowerSource = 'Aristocracy' | 'Ideocracy' | 'Kratocracy' | 'Democracy' | 'Meritocracy';
export type StarportClass = 'X' | 'E' | 'D' | 'C' | 'B' | 'A';
export type TravelZone = 'Green' | 'Amber' | 'Red';

export type GasWorldClass = 'I' | 'II' | 'III' | 'IV' | 'V';
export type BodyType = 'star' | 'disk' | 'dwarf' | 'terrestrial' | 'ice' | 'gas' | 'ring';
export type OrbitLevel = 0 | 1 | 2;
