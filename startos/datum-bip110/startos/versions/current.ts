import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:6',
  releaseNotes: {
    en_US:
      'Improve DATUM dashboard login compatibility with Chromium and other browsers.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
