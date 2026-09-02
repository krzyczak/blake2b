import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  acknowledge: Value.toggle({
    name: i18n('I acknowledge'),
    description: null,
    default: false,
  }),
})

export const activateRDTS = sdk.Action.withInput(
  // id
  'activate-rdts',

  // metadata
  async ({ effects }) => ({
    name: i18n('RDTS Chain Opt-In'),
    description: '',
    warning: i18n(
      'The BIP-110 Reduced Data Temporary Softfork ("RDTS") split from the chain followed by Bitcoin Core at block 961,632. This package follows that separate chain. Bitcoin Knots v29.4.1.knots20260508 changes its proof of work to BLAKE2b header v2 from block 961,640 and requires the consensus headline "8-30 NYPost Deride And Conquer". Upgrading an existing RDTS node can cause a deep reorganization away from SHA256d blocks after 961,639. The two chains have no replay protection: a transaction broadcast on one can be replayed on the other. Use Bitcoin Core or Bitcoin Knots (pre-RDTS) to follow their chain instead.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),

  // input spec
  inputSpec,

  // optionally pre-fill form
  async ({ effects }) => ({}),

  // execution function
  async ({ effects, input }) => {
    if (!input.acknowledge) {
      throw new Error(i18n('Please acknowledge'))
    }
    await storeJson.merge(effects, { rdtsAcknowledged: true })
  },
)
