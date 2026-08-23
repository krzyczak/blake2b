import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const defaultCoinbaseTagPrimary = 'Totoro'
export const defaultCoinbaseTagSecondary = 'StartOS-BIP110'

const coinbaseTag = z
  .string()
  .min(1)
  .max(60)
  .regex(/^[A-Za-z0-9][A-Za-z0-9 ._:/+@-]*$/)

const shape = z.object({
  coinbaseTagPrimary: coinbaseTag.catch(defaultCoinbaseTagPrimary),
  coinbaseTagSecondary: coinbaseTag.catch(defaultCoinbaseTagSecondary),
})

export const miningSettingsFile = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/startos-mining.json',
  },
  shape,
)
