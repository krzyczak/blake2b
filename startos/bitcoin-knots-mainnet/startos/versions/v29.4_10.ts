import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const v29_4_10 = VersionInfo.of({
  version: '#knots:29.4:10',
  releaseNotes: {
    en_US: `- Update Bitcoin Knots to v29.4.1.knots20260508rc4.
- Activate BLAKE2b header-v2 proof of work from mainnet block 961,640.
- Enforce the consensus headline "8-30 NYPost Deride And Conquer".`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
  .satisfies('29.4:14')
  .satisfies('28.4:27')
