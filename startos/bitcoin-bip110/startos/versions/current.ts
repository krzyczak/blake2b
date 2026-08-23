import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:5',
  releaseNotes: {
    en_US:
      'Add a StartOS action for safe, per-network blake2b_headline overrides while retaining the RC2 defaults for existing installations.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
