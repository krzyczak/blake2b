import { networkSettingsFile } from './file-models/network-settings.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { dataDirForNetwork, defaultHeadlineForNetwork } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const settings = await networkSettingsFile.read((value) => value).once()
  const network = settings?.network ?? 'dummy'
  const headline =
    settings?.headlines[network] ?? defaultHeadlineForNetwork(network)
  const dataDir = dataDirForNetwork(network)

  const bitcoindSub = await sdk.SubContainer.eager(
    effects,
    { imageId: 'bitcoind' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'bitcoind-sub',
  )

  return sdk.Daemons.of(effects).addDaemon('bitcoind', {
    subcontainer: bitcoindSub,
    exec: {
      command: ['/usr/local/bin/bitcoin-bip110-entrypoint'],
      env: {
        BITCOIN_NETWORK_MODE: network,
        BITCOIN_BLAKE2B_HEADLINE: headline,
      },
      sigtermTimeout: 120_000,
    },
    ready: {
      display: i18n('Bitcoin Knots BIP110'),
      fn: async () => {
        try {
          const result = await bitcoindSub.exec([
            'bitcoin-cli',
            `-datadir=${dataDir}`,
            'getblockchaininfo',
          ])

          if (result.exitCode !== 0) {
            return {
              message: i18n('Bitcoin RPC is starting'),
              result: 'starting' as const,
            }
          }

          const info = JSON.parse(String(result.stdout)) as {
            blocks: number
            headers: number
            initialblockdownload: boolean
          }

          if (network === 'dummy' && info.blocks < 19) {
            return {
              message: i18n('Bootstrapping dummy regtest blocks'),
              result: 'loading' as const,
            }
          }

          if (network !== 'dummy' && info.initialblockdownload) {
            return {
              message: i18n(
                'Synchronizing ${network}: ${blocks}/${headers} blocks',
                {
                  // StartOS may set LANG=C.UTF-8, which Intl rejects.
                  network,
                  blocks: String(info.blocks),
                  headers: String(info.headers),
                },
              ),
              result: 'loading' as const,
            }
          }

          return {
            message: i18n(
              'Ready for mining on ${network} at height ${height}',
              {
                network,
                height: String(info.blocks),
              },
            ),
            result: 'success' as const,
          }
        } catch {
          return {
            message: i18n('Bitcoin RPC is starting'),
            result: 'starting' as const,
          }
        }
      },
    },
    requires: [],
  })
})
