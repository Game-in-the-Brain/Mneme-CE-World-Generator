import type { CameraState, Point } from './types';

export function createDefaultCamera(): CameraState {
  return { x: 0, y: 0, zoom: 1 };
}

/**
 * Convert world coordinates (AU) to screen coordinates (px).
 */
export function worldToScreen(point: Point, camera: CameraState, cx: number, cy: number): Point {
  return {
    x: cx + (point.x - camera.x) * camera.zoom,
    y: cy + (point.y - camera.y) * camera.zoom,
  };
}

/**
 * Convert screen coordinates (px) to world coordinates (AU).
 */
export function screenToWorld(point: Point, camera: CameraState, cx: number, cy: number): Point {
  return {
    x: camera.x + (point.x - cx) / camera.zoom,
    y: camera.y + (point.y - cy) / camera.zoom,
  };
}

/**
 * Logarithmic distance scaler so inner and outer bodies both fit.
 * Returns a visual radius in arbitrary world units.
 */
export function logScaleDistance(au: number, scaleFactor = 80): number {
  return Math.log10(au + 1) * scaleFactor;
}
