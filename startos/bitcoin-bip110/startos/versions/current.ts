import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:9',
  releaseNotes: {
    en_US:
      'Update Bitcoin Knots to v29.5.1.knots20260508. This release also updates the testnet4 coinbase maturity schedule.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
