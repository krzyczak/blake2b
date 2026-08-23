import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const defaultCoinbaseTagPrimary = 'Totoro'
export const defaultCoinbaseTagSecondary = 'StartOS-BIP110'
export const defaultPayoutAddress = 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn'

const coinbaseTag = z
  .string()
  .min(1)
  .max(60)
  .regex(/^[A-Za-z0-9][A-Za-z0-9 ._:/+@-]*$/)

const payoutAddress = z
  .string()
  .min(26)
  .max(90)
  .regex(
    /^(?:[123mn2][1-9A-HJ-NP-Za-km-z]{25,34}|(?:bc1|tb1)[023456789ac-hj-np-z]{11,87})$/,
  )

const shape = z.object({
  coinbaseTagPrimary: coinbaseTag.catch(defaultCoinbaseTagPrimary),
  coinbaseTagSecondary: coinbaseTag.catch(defaultCoinbaseTagSecondary),
  payoutAddress: payoutAddress.catch(defaultPayoutAddress),
})

export const miningSettingsFile = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/startos-mining.json',
  },
  shape,
)
