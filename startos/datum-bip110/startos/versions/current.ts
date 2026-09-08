import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:15',
  releaseNotes: {
    en_US:
      'Enable authenticated pool configuration in the DATUM web panel, preserve edits across restarts, and share settings with StartOS actions.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
