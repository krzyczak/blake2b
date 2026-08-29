import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:11',
  releaseNotes: {
    en_US:
      'Persist chain-scoped best shares and mined blocks. Add last-block details, mempool.guide links, and a Mined Blocks dashboard page.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
