import type { NetworkMode } from './file-models/network-settings.json'

export const packageId = 'bitcoin-bip110'
export const rpcHostId = 'rpc'
export const rpcPort = 18443

export const dataDirForNetwork = (network: NetworkMode): string =>
  network === 'dummy' ? '/data' : `/data/networks/${network}`
