import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:5',
  releaseNotes: {
    en_US:
      'Add a persistent, configurable solo-mining payout address and retain the DATUM monitoring dashboard.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
