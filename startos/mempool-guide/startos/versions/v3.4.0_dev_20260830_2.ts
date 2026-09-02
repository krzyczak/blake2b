import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v3_4_0_dev_20260830_2 = VersionInfo.of({
  version: '3.4.0-dev.20260830:2',
  releaseNotes: {
    en_US:
      'Imports the Mempool Guide miner-identity registry and automatically reindexes unknown blocks when a package update includes newer pool definitions.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
