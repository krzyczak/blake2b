import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '3.4.0-dev.20260830:4',
  releaseNotes: {
    en_US:
      'Restores block indexing and projected blocks with Bitcoin Knots 29.4.2 by accepting the BLAKE2b difficulty RPC field and replacing the removed getdifficulty call.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
