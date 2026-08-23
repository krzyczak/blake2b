import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:3',
  releaseNotes: {
    en_US:
      "Add a StartOS mining-identity action for persistent, explorer-visible DATUM coinbase tags on Justin Filip's BLAKE2b gateway.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
