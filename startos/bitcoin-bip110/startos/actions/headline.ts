import { networkSettingsFile } from '../file-models/network-settings.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { defaultHeadlineForNetwork, packageId } from '../utils'

const headlineInputSpec = sdk.InputSpec.of({
  headline: sdk.Value.text({
    name: i18n('BLAKE2b Headline'),
    description: i18n(
      'Consensus-critical headline for the currently selected network. It must exactly match the value announced for that Knots release candidate.',
    ),
    warning: i18n(
      'An incorrect headline can make the node reject the BLAKE2b activation block. This is not the explorer-visible miner name.',
    ),
    default: 'Totoro',
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
  {
    name: i18n('Set BLAKE2b Headline'),
    description: i18n(
      'Set a separate blake2b_headline override for the currently selected network.',
    ),
    warning: i18n(
      'Only change this when the Knots release instructions publish a new exact headline.',
    ),
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  },
  headlineInputSpec,
  async () => {
    const settings = await networkSettingsFile.read((value) => value).once()
    const network = settings?.network ?? 'dummy'
    return {
      headline:
        settings?.headlines[network] ?? defaultHeadlineForNetwork(network),
    }
  },
  async ({ effects, input }) => {
    const settings = await networkSettingsFile.read((value) => value).once()
    const network = settings?.network ?? 'dummy'

    await networkSettingsFile.merge(effects, {
      headlines: {
        ...settings?.headlines,
        [network]: input.headline,
      },
    })

    const status = await sdk.getStatus(effects, { packageId }).once()
    if (status?.desired.main === 'running') {
      await sdk.restart(effects)
    }
  },
)
