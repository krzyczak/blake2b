import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { configJson } from '../file-models/mempool-config.json'

export const current = VersionInfo.of({
  version: '3.4.0-dev.20260830:3',
  releaseNotes: {
    en_US:
      'Defaults block projections and frontend fill visualization to 800,000 WU, adds a dropdown for restoring the previous 4,000,000 WU limit, and updates the frontend to show every mining pool in the hashrate chart.',
  },
  migrations: {
    up: async ({ effects }) => {
      await configJson.merge(effects, {
        MEMPOOL: { BLOCK_WEIGHT_UNITS: 800_000 },
      })
    },
    down: IMPOSSIBLE,
  },
})
