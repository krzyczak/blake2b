import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:8',
  releaseNotes: {
    en_US:
      'Update to Maveth DATUM e82d7e5 for Knots RC3, including activation-headline injection and current BLAKE2b share and time validation fixes.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
