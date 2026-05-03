/**
 * Environment detection for wrapper apps (Tauri / Capacitor).
 * Used to decide whether to load the 2D map from the local bundle
 * or from the external GitHub Pages deployment.
 */

export function isWrappedApp(): boolean {
  // Tauri v2 injects __TAURI_INTERNALS__
  const hasTauri = typeof (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__ !== 'undefined';
  // Capacitor injects Capacitor global
  const hasCapacitor = typeof (window as unknown as Record<string, unknown>).Capacitor !== 'undefined';
  return hasTauri || hasCapacitor;
}

/**
 * Return the base URL for the 2D Star System Map.
 * In wrapped apps this points to the locally-bundled copy.
 * In the web/PWA this points to the external deployment.
 */
export function get2DMapBaseUrl(): string {
  if (isWrappedApp()) {
    // Bundled inside dist/ alongside the main app.
    // In Tauri:  https://tauri.localhost/solar-system-2d/index.html
    // In Capacitor: http://localhost/solar-system-2d/index.html
    return 'solar-system-2d/index.html';
  }
  // External deployment (may be newer than the bundled copy)
  return 'https://game-in-the-brain.github.io/2d-star-system-map/';
}

/**
 * Build a full 2D map URL with optional query parameters.
 */
export function get2DMapUrl(params?: { embed?: boolean; starId?: string }): string {
  const base = get2DMapBaseUrl();
  const qs = new URLSearchParams();
  if (params?.embed) qs.set('embed', '1');
  if (params?.starId) qs.set('starId', params.starId);
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}
