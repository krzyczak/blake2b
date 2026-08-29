import { selectedBitcoinNodeBackend } from './file-models/store.json'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  const backend = await selectedBitcoinNodeBackend(effects)

  if (backend === 'bitcoind') {
    return {
      bitcoind: {
        kind: 'running' as const,
        versionRange: '^#knots:29.4',
        healthChecks: ['bitcoind', 'sync-progress'],
      },
    }
  }

  return {
    'bitcoin-bip110': {
      kind: 'running' as const,
      versionRange: '>=0.1.0:1 <0.2.0',
      healthChecks: ['bitcoind'],
    },
  }
})
