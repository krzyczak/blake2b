import { networkSettingsFile } from '../file-models/network-settings.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { defaultHeadlineForNetwork, packageId } from '../utils'

const headlineInputSpec = sdk.InputSpec.of({
  headline: sdk.Value.text({
    name: i18n('BLAKE2b Headline'),
    description: i18n(
      'Consensus-critical headline for the isolated dummy chain activation block.',
    ),
    warning: i18n(
      'An incorrect headline can make the node reject the BLAKE2b activation block. This is not the explorer-visible miner name.',
    ),
    default: 'BIP110-LAB',
    required: true,
    minLength: 1,
    maxLength: 90,
    patterns: [
      {
        regex: '^[!-~](?:[ -~]*[!-~])?$',
        description: i18n(
          'Use one line of printable ASCII without leading or trailing spaces.',
        ),
      },
    ],
  }),
})

export const headlineConfig = sdk.Action.withInput(
  'headline-config',
  async () => {
    const network =
      (await networkSettingsFile.read((value) => value.network).once()) ??
      'dummy'

    return {
      name: i18n('Set BLAKE2b Headline'),
      description: i18n(
        'Set the regtest-only blake2b_headline override for the isolated dummy chain.',
      ),
      warning: i18n(
        'Changing it creates a different dummy activation block and can make existing chain data incompatible.',
      ),
      allowedStatuses: 'any',
      group: i18n('Configuration'),
      visibility: network === 'dummy' ? 'enabled' : 'hidden',
    }
  },
  headlineInputSpec,
  async () => {
    const settings = await networkSettingsFile.read((value) => value).once()
    return {
      headline: settings?.headlines.dummy ?? defaultHeadlineForNetwork('dummy'),
    }
  },
  async ({ effects, input }) => {
    const settings = await networkSettingsFile.read((value) => value).once()
    await networkSettingsFile.merge(effects, {
      headlines: {
        ...settings?.headlines,
        dummy: input.headline,
      },
    })

    const status = await sdk.getStatus(effects, { packageId }).once()
    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
    }
  },
)
