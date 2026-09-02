import { configJson } from '../file-models/mempool-config.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import type { BlockWeightLimit } from '../utils'
import { BLOCK_WEIGHT_LIMITS, DEFAULT_BLOCK_WEIGHT_UNITS } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  blockWeightLimit: Value.select({
    name: i18n('Maximum Block Weight'),
    description: i18n(
      'Applied to projected-block construction, fee estimation, and how full mined blocks appear in the frontend.',
    ),
    default: 'reduced',
    values: {
      reduced: i18n('800,000 WU (Mempool Guide default)'),
      standard: i18n('4,000,000 WU (standard Bitcoin)'),
    },
  }),
})

function selectionFor(units: number): BlockWeightLimit {
  return units === BLOCK_WEIGHT_LIMITS.standard ? 'standard' : 'reduced'
}

export const blockWeightLimit = sdk.Action.withInput(
  'block-weight-limit',

  {
    name: i18n('Block Weight Limit'),
    description: i18n(
      'Select the maximum block weight used by backend projections and frontend block-fill visualization. The reduced 800,000 WU limit matches Mempool Guide; 4,000,000 WU restores the previous standard Bitcoin limit. Changes apply on the next service restart.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async ({ effects }) => {
    const units =
      (await configJson
        .read((config) => config.MEMPOOL.BLOCK_WEIGHT_UNITS)
        .once()) ?? DEFAULT_BLOCK_WEIGHT_UNITS

    return { blockWeightLimit: selectionFor(units) }
  },

  async ({ effects, input }) =>
    configJson.merge(effects, {
      MEMPOOL: {
        BLOCK_WEIGHT_UNITS: BLOCK_WEIGHT_LIMITS[input.blockWeightLimit],
      },
    }),
)
