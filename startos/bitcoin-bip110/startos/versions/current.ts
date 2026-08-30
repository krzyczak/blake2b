import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:7',
  releaseNotes: {
    en_US:
      'Update Bitcoin Knots to v29.4.1.knots20260508rc4, including the revised BLAKE2b and RDTS consensus parameters.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
