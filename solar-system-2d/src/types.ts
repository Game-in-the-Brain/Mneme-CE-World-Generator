/**
 * Types for the 2D solar-system map.
 * These mirror the MWG StarSystem shape where needed.
 */

export interface MapPayload {
  starSystem: import('../../src/types/index').StarSystem;
  starfieldSeed: string;
  epoch: {
    year: number;
    month: number;
    day: number;
  };
}

export interface Point {
  x: number;
  y: number;
}

export type BodyType =
  | 'star-primary'
  | 'star-companion'
  | 'disk'
  | 'dwarf'
  | 'terrestrial'
  | 'ice'
  | 'gas-i'
  | 'gas-ii'
  | 'gas-iii'
  | 'gas-iv'
  | 'gas-v';

export interface SceneBody {
  id: string;
  type: BodyType;
  label: string;
  distanceAU: number;
  mass: number;
  radiusPx: number;
  colour: string;
  strokeColour: string;
  angle: number; // radians
  periodDays: number;
  isMainWorld: boolean;
  orbitDelta?: number; // visual nudge if needed
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface AppState {
  ctx: CanvasRenderingContext2D | null;
  canvas: HTMLCanvasElement | null;
  bodies: SceneBody[];
  camera: CameraState;
  isPlaying: boolean;
  isReversed: boolean;
  speed: number; // days per second
  simDayOffset: number; // days from epoch
  epochDate: Date;
  starfieldSeed: string;
  lastFrameTime: number;
  width: number;
  height: number;
}
