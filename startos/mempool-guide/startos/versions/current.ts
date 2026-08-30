import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.4.0-dev.20260830:1',
  releaseNotes: {
    en_US:
      'Updates Retropex/mempool to commit c4aa9002e8122b9121499f3bfcf23a3dfe1f5a81. Widens stored block headers for BLAKE2b header v2 blocks and displays their additional fields.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
