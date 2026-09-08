import {
  readMiningSettings,
  saveMiningSettings,
} from '../file-models/gateway-config.json'
import { i18n } from '../i18n'
import { defaultPoolSettings, poolSettingsSchema } from '../pool-settings'
import { sdk } from '../sdk'
import { packageId } from '../utils'

const poolInput = sdk.InputSpec.of({
  enabled: sdk.Value.toggle({
    name: i18n('Enable DATUM Pool'),
    description: i18n(
      'Use a DATUM pool on the same BLAKE2b network as the selected node.',
    ),
    default: false,
  }),
  host: sdk.Value.text({
    name: i18n('Pool Host'),
    description: i18n(
      'DATUM hostname or IP address, without a scheme or port.',
    ),
    required: false,
    default: null,
    maxLength: 253,
  }),
  port: sdk.Value.number({
    name: i18n('Pool Port'),
    required: true,
    integer: true,
    min: 1,
    max: 65535,
    default: defaultPoolSettings.port,
  }),
  publicKey: sdk.Value.text({
    name: i18n('Pool Public Key'),
    description: i18n(
      'The 128 hexadecimal characters supplied by the pool operator.',
    ),
    required: false,
    default: null,
    maxLength: 128,
  }),
  passWorkers: sdk.Value.toggle({
    name: i18n('Forward Worker Names'),
    description: i18n(
      'Append worker names to the configured payout address when full usernames are not forwarded.',
    ),
    default: true,
  }),
  passFullUsers: sdk.Value.toggle({
    name: i18n('Forward Full Usernames'),
    description: i18n(
      'Forward miner usernames verbatim. Configure miners with the payout address or account syntax required by the pool.',
    ),
    default: true,
  }),
  pooledMiningOnly: sdk.Value.toggle({
    name: i18n('Pool Mining Only'),
    description: i18n(
      'Stop mining when the pool is unavailable. Disable to fall back to the configured solo payout address.',
    ),
    default: true,
  }),
  vardiffMin: sdk.Value.number({
    name: i18n('Pool Minimum Difficulty'),
    description: i18n('A power of two. Solo mode uses difficulty 1.'),
    required: true,
    integer: true,
    min: 1,
    max: 1073741824,
    default: defaultPoolSettings.vardiffMin,
  }),
  targetSharesPerMinute: sdk.Value.number({
    name: i18n('Target Shares per Minute'),
    required: true,
    integer: true,
    min: 1,
    max: 120,
    default: defaultPoolSettings.targetSharesPerMinute,
  }),
})

export const configurePool = sdk.Action.withInput(
  'configure-pool',
  {
    name: i18n('Configure DATUM Pool'),
    description: i18n(
      'Save the pool connection and share settings, then restart the gateway.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Configuration'),
    visibility: 'enabled',
  },
  poolInput,
  async () => {
    const settings = await readMiningSettings()
    return settings?.pool ?? defaultPoolSettings
  },
  async ({ effects, input }) => {
    const pool = poolSettingsSchema.parse({
      ...input,
      host: input.host?.trim() ?? '',
      publicKey: input.publicKey?.trim() ?? '',
    })
    await saveMiningSettings(effects, { pool })
    const status = await sdk.getStatus(effects, { packageId }).once()
    if (status?.desired.main === 'running') await sdk.restart(effects)
  },
)
