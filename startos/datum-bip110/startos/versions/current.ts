import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:7',
  releaseNotes: {
    en_US:
      'Use HTTPS-protected Basic authentication for DATUM dashboard compatibility with Brave, Helium, Chromium, Firefox, and Safari.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
