import {
  rpcHostId as officialBitcoinRpcHostId,
  rpcPort as officialBitcoinRpcPort,
} from 'bitcoin-knots-startos/startos/utils'
import type { BitcoinNodeBackend } from './file-models/store.json'

export const packageId = 'datum-bip110'
export const stratumHostId = 'stratum'
export const stratumPort = 23334
export const dashboardHostId = 'dashboard'
export const dashboardPort = 7152

export const bitcoinNodeConfig: Record<
  BitcoinNodeBackend,
  {
    packageId: BitcoinNodeBackend
    rpcHostId: string
    rpcPort: number
    cookieFile?: string
    rpcUser?: string
    rpcPassword?: string
  }
> = {
  bitcoind: {
    packageId: 'bitcoind',
    rpcHostId: officialBitcoinRpcHostId,
    rpcPort: officialBitcoinRpcPort,
    cookieFile: '/mnt/bitcoind/.cookie',
  },
  'bitcoin-bip110': {
    packageId: 'bitcoin-bip110',
    rpcHostId: 'rpc',
    rpcPort: 18443,
    rpcUser: 'datum',
    rpcPassword: 'bip110-regtest-lab',
  },
}
