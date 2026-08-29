import { FileHelper, T, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const bitcoinNodeBackends = ['bitcoin-bip110', 'bitcoind'] as const
export type BitcoinNodeBackend = (typeof bitcoinNodeBackends)[number]
export const defaultBitcoinNodeBackend: BitcoinNodeBackend = 'bitcoin-bip110'

const shape = z.object({
  bitcoinNodeBackend: z
    .enum(bitcoinNodeBackends)
    .catch(defaultBitcoinNodeBackend),
})

export const storeJson = FileHelper.json(
  {
    base: sdk.volumes.startos,
    subpath: '/store.json',
  },
  shape,
)

export async function selectedBitcoinNodeBackend(
  effects: T.Effects,
): Promise<BitcoinNodeBackend> {
  return (
    (await storeJson
      .read((store) => store.bitcoinNodeBackend)
      .const(effects)) ?? defaultBitcoinNodeBackend
  )
}
