import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const networkModes = ['dummy', 'testnet4', 'signet', 'regtest'] as const

export type NetworkMode = (typeof networkModes)[number]

const shape = z.object({
  network: z.enum(networkModes).catch('dummy'),
})

export const networkSettingsFile = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: '/startos-network.json',
  },
  shape,
)
