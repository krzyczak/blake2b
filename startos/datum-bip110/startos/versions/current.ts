import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:4',
  releaseNotes: {
    en_US:
      'Add the DATUM monitoring dashboard with persistent, generated StartOS credentials.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
