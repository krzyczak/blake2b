import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:14',
  releaseNotes: {
    en_US:
      'Update DATUM to Maveth 7491a50, add persistent pool settings and ABW block history, and preserve lab activation mining.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
