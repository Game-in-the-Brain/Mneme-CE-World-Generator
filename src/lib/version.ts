// Version is auto-generated from git commit count during build
// Format: 1.3.{commitCount}

/// <reference types="vite/client" />

declare const __APP_VERSION__: string
declare const __APP_COMMIT__: string
declare const __APP_DATE__: string
declare const __APP_FULL_VERSION__: string

export const APP_VERSION = __APP_VERSION__
export const APP_COMMIT = __APP_COMMIT__
export const APP_DATE = __APP_DATE__
export const APP_FULL_VERSION = __APP_FULL_VERSION__

// For backwards compatibility
export default {
  version: APP_VERSION,
  commit: APP_COMMIT,
  date: APP_DATE,
  fullVersion: APP_FULL_VERSION
}
