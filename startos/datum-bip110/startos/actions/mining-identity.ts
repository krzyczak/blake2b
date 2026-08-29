import {
  defaultCoinbaseTagPrimary,
  defaultCoinbaseTagSecondary,
  miningSettingsFile,
} from '../file-models/mining-settings.json'
import {
  coinbaseTagByteLength,
  coinbaseTagContainsNullByte,
  maxCoinbaseTagBytes,
  maxCombinedCoinbaseTagBytes,
} from '../coinbase-tags'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { packageId } from '../utils'

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
    const primaryBytes = coinbaseTagByteLength(input.coinbaseTagPrimary)
    const secondaryBytes = coinbaseTagByteLength(input.coinbaseTagSecondary)

    if (
      coinbaseTagContainsNullByte(input.coinbaseTagPrimary) ||
      coinbaseTagContainsNullByte(input.coinbaseTagSecondary)
    ) {
      throw new Error(i18n('Coinbase tags cannot contain null bytes.'))
    }

    if (
      primaryBytes > maxCoinbaseTagBytes ||
      secondaryBytes > maxCoinbaseTagBytes
    ) {
      throw new Error(i18n('Each coinbase tag may be at most 60 bytes.'))
    }

    if (primaryBytes + secondaryBytes > maxCombinedCoinbaseTagBytes) {
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
