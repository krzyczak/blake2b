import { networkSettingsFile } from '../file-models/network-settings.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { packageId } from '../utils'

const networkInputSpec = sdk.InputSpec.of({
  network: sdk.Value.select({
    name: i18n('Network'),
    description: i18n(
      'Choose the Bitcoin network. Public networks perform a real initial block download; each mode keeps separate chain data.',
    ),
    default: 'dummy',
    values: {
      dummy: i18n('Isolated dummy regtest'),
      testnet4: i18n('Testnet4 (public BLAKE2b network)'),
      signet: i18n('Signet (public)'),
      regtest: i18n('Regtest (local, unbootstrapped)'),
    },
  }),
})

export const networkConfig = sdk.Action.withInput(
  'network-config',
  {
    name: i18n('Select Network'),
    description: i18n(
      'Select dummy mode, testnet4, signet, or a clean local regtest. Changing networks automatically restarts the service.',
    ),
    warning: i18n(
      'Testnet4 and signet download and validate their real public chains. Regtest has no canonical public peer network.',
    ),
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  },
  networkInputSpec,
  async () => ({
    network:
      (await networkSettingsFile.read((settings) => settings.network).once()) ??
      'dummy',
  }),
  async ({ effects, input }) => {
    const previous =
      (await networkSettingsFile.read((settings) => settings.network).once()) ??
      'dummy'

    await networkSettingsFile.merge(effects, { network: input.network })

    if (previous === input.network) return

    const status = await sdk.getStatus(effects, { packageId }).once()
    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
    }
  },
)
