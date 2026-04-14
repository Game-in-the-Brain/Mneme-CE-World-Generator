import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'

// Get version info from git
function getGitVersion() {
  try {
    // Get total commit count
    const commitCount = execSync('git rev-list --count HEAD').toString().trim()
    // Get short commit hash
    const commitHash = execSync('git rev-parse --short HEAD').toString().trim()
    // Get commit date
    const commitDate = execSync('git log -1 --format=%cs').toString().trim()
    
    return {
      version: `1.3.${commitCount}`,
      commitHash,
      commitDate,
      fullVersion: `1.3.${commitCount}-${commitHash}`
    }
  } catch (_e) {
    // Fallback if git fails
    return {
      version: '1.3.0',
      commitHash: 'unknown',
      commitDate: new Date().toISOString().split('T')[0],
      fullVersion: '1.3.0-unknown'
    }
  }
}

const gitVersion = getGitVersion()

// https://vite.dev/config/
export default defineConfig({
  base: '/Mneme-CE-World-Generator/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mneme CE World Generator',
        short_name: 'Mneme CE',
        description: 'Mneme CE World Generator — Cepheus Engine Star System and World Generator',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/icon-512x512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  define: {
    __APP_VERSION__: JSON.stringify(gitVersion.version),
    __APP_COMMIT__: JSON.stringify(gitVersion.commitHash),
    __APP_DATE__: JSON.stringify(gitVersion.commitDate),
    __APP_FULL_VERSION__: JSON.stringify(gitVersion.fullVersion)
  }
})
