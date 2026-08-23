import {
  defaultPayoutAddress,
  miningSettingsFile,
} from '../file-models/mining-settings.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { packageId } from '../utils'

const payoutAddressPattern = {
  regex:
    '^(?:[123mn2][1-9A-HJ-NP-Za-km-z]{25,34}|(?:bc1|tb1)[023456789ac-hj-np-z]{11,87})$',
  description: i18n(
    'Enter a supported Bitcoin or Testnet address beginning with 1, 3, m, n, 2, bc1, or tb1.',
  ),
}

const soloPayoutAddressInputSpec = sdk.InputSpec.of({
  payoutAddress: sdk.Value.text({
    name: i18n('Solo Payout Address'),
    description: i18n(
      'The entire block subsidy and transaction fees are paid to this address when this gateway mines without an upstream DATUM pool.',
    ),
    default: defaultPayoutAddress,
    required: true,
    minLength: 26,
    maxLength: 90,
    patterns: [payoutAddressPattern],
  }),
})

export const soloPayoutAddress = sdk.Action.withInput(
  'solo-payout-address',
  {
    name: i18n('Set Solo Payout Address'),
    description: i18n(
      'Configure the address written into solo-mined coinbase transaction outputs.',
    ),
    warning: i18n(
      'Use an address for the selected node network whose private key you control. A wrong-network or unowned address can make a mined reward inaccessible.',
    ),
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  },
  soloPayoutAddressInputSpec,
  async () => {
    const settings = await miningSettingsFile.read((value) => value).once()
    return {
      payoutAddress: settings?.payoutAddress ?? defaultPayoutAddress,
    }
  },
  async ({ effects, input }) => {
    await miningSettingsFile.merge(effects, {
      payoutAddress: input.payoutAddress,
    })

    const status = await sdk.getStatus(effects, { packageId }).once()
    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
    }
  },
)
