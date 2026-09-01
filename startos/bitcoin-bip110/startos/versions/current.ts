import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:8',
  releaseNotes: {
    en_US:
      'Update Bitcoin Knots to v29.4.1.knots20260508rc5, restrict the headline override to dummy regtest, and retain DATUM activation compatibility.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
