import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:10',
  releaseNotes: {
    en_US:
      "Add a Bitcoin node selector. DATUM can now switch between the official Start9 Bitcoin Knots package and the companion Bitcoin Knots BIP110 lab package without moving either node's blockchain data.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
