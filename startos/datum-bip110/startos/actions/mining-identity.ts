import {
  defaultCoinbaseTagPrimary,
  defaultCoinbaseTagSecondary,
  miningSettingsFile,
} from '../file-models/mining-settings.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { packageId } from '../utils'

const tagPattern = {
  regex: '^[A-Za-z0-9][A-Za-z0-9 ._:/+@-]*$',
  description: i18n(
    'Start with a letter or number; use only letters, numbers, spaces, and . _ : / + @ -.',
  ),
}

const miningIdentityInputSpec = sdk.InputSpec.of({
  coinbaseTagPrimary: sdk.Value.text({
    name: i18n('Primary Coinbase Tag'),
    description: i18n(
      'Your miner identity embedded in every solo-mined coinbase. Use a unique value such as /MyMiner/.',
    ),
    default: defaultCoinbaseTagPrimary,
    required: true,
    minLength: 1,
    maxLength: 60,
    patterns: [tagPattern],
  }),
  coinbaseTagSecondary: sdk.Value.text({
    name: i18n('Secondary Coinbase Tag'),
    description: i18n(
      'Additional text embedded after the primary tag, for example Totoro or Testnet4.',
    ),
    default: defaultCoinbaseTagSecondary,
    required: true,
    minLength: 1,
    maxLength: 60,
    patterns: [tagPattern],
  }),
})

export const miningIdentity = sdk.Action.withInput(
  'mining-identity',
  {
    name: i18n('Set Mining Identity'),
    description: i18n(
      'Configure the primary and secondary DATUM coinbase tags written into blocks you mine.',
    ),
    warning: i18n(
      'A public explorer displays a named miner only after its pool registry maps one of these tags to that name.',
    ),
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  },
  miningIdentityInputSpec,
  async () => {
    const settings = await miningSettingsFile.read((value) => value).once()
    return {
      coinbaseTagPrimary:
        settings?.coinbaseTagPrimary ?? defaultCoinbaseTagPrimary,
      coinbaseTagSecondary:
        settings?.coinbaseTagSecondary ?? defaultCoinbaseTagSecondary,
    }
  },
  async ({ effects, input }) => {
    if (
      input.coinbaseTagPrimary.length + input.coinbaseTagSecondary.length >
      88
    ) {
      throw new Error(
        i18n('Primary and secondary coinbase tags may total at most 88 bytes.'),
      )
    }

    await miningSettingsFile.merge(effects, input)

    const status = await sdk.getStatus(effects, { packageId }).once()
    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
    }
  },
)
