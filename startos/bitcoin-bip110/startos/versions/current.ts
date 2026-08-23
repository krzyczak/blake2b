import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:4',
  releaseNotes: {
    en_US:
      'Update Bitcoin Knots to v29.4.1.knots20260508rc2 and add selectable dummy, testnet4, signet, and regtest modes with isolated chain data and sync-aware health checks.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
