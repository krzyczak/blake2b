import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:2',
  releaseNotes: {
    en_US:
      "Switch to Justin Filip's integrated BLAKE2b gateway for Bitcoin Knots RC2, with automatic template-rule negotiation, canonical Sia-style jobs, current header packing, and testnet4-compatible solo mining.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
