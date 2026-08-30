import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:12',
  releaseNotes: {
    en_US:
      'Show the exact configured solo payout address on the Coinbaser page and allow arbitrary UTF-8 coinbase tags within DATUM byte limits.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
