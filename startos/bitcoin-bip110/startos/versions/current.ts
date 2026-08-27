import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:6',
  releaseNotes: {
    en_US:
      'Update Bitcoin Knots to v29.4.1.knots20260508rc3, including the revised testnet4 BLAKE2b activation height and difficulty rules.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
