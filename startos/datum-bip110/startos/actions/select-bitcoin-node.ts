import {
  defaultBitcoinNodeBackend,
  selectedBitcoinNodeBackend,
  storeJson,
} from '../file-models/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { packageId } from '../utils'

const bitcoinNodeInputSpec = sdk.InputSpec.of({
  bitcoinNodeBackend: sdk.Value.select({
    name: i18n('Bitcoin Node'),
    description: i18n('Select the Bitcoin node that supplies mining work.'),
    values: {
      bitcoind: i18n('Bitcoin (official Start9 package)'),
      'bitcoin-bip110': i18n('Bitcoin Blake2b Lab'),
    },
    default: defaultBitcoinNodeBackend,
  }),
})

export const selectBitcoinNode = sdk.Action.withInput(
  'select-bitcoin-node',
  {
    name: i18n('Select Bitcoin Node'),
    description: i18n(
      'Switch the Bitcoin node used for block templates and block submission.',
    ),
    warning: i18n(
      'Switching nodes does not copy blockchain data. Set a payout address for the selected node network before mining.',
    ),
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  },
  bitcoinNodeInputSpec,
  async ({ effects }) => ({
    bitcoinNodeBackend: await selectedBitcoinNodeBackend(effects),
  }),
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      bitcoinNodeBackend: input.bitcoinNodeBackend,
    })

    const status = await sdk.getStatus(effects, { packageId }).once()
    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
    }
  },
)
