import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:13',
  releaseNotes: {
    en_US:
      'Show the next block height being mined in the Current Job dashboard panel.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
