import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const networkModes = ['dummy', 'testnet4', 'signet', 'regtest'] as const

export type NetworkMode = (typeof networkModes)[number]

const headline = z
  .string()
  .min(1)
  .max(90)
  .regex(/^[!-~](?:[ -~]*[!-~])?$/)

const shape = z.object({
  network: z.enum(networkModes).catch('dummy'),
  headlines: z
    .object({
      dummy: headline.optional().catch(undefined),
      testnet4: headline.optional().catch(undefined),
      signet: headline.optional().catch(undefined),
      regtest: headline.optional().catch(undefined),
    })
    .catch({}),
})

export const networkSettingsFile = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/startos-network.json',
  },
  shape,
)
