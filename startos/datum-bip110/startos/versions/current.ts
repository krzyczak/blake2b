import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:9',
  releaseNotes: {
    en_US:
      'Add a live pyblock-inspired mining dashboard with automatic refresh, hashrate history, share and template activity, and a responsive mobile layout.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
