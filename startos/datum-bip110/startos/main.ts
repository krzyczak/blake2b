import { manifest as officialBitcoinManifest } from 'bitcoin-knots-startos/startos/manifest'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  defaultCoinbaseTagPrimary,
  defaultCoinbaseTagSecondary,
  defaultPayoutAddress,
  miningSettingsFile,
} from './file-models/mining-settings.json'
import { dashboardPasswordFile } from './file-models/dashboard-password'
import { selectedBitcoinNodeBackend } from './file-models/store.json'
import { bitcoinNodeConfig, stratumPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const miningSettings = await miningSettingsFile.read((value) => value).once()
  const dashboardPassword = await dashboardPasswordFile.read().once()
  if (!dashboardPassword) {
    throw new Error('DATUM dashboard password is unavailable')
  }
  const backend = await selectedBitcoinNodeBackend(effects)
  const bitcoinNode = bitcoinNodeConfig[backend]
  const rpcAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: bitcoinNode.packageId,
      hostId: bitcoinNode.rpcHostId,
      internalPort: bitcoinNode.rpcPort,
      ssl: false,
    })
    .const()

  if (!rpcAddress) {
    throw new Error(`Selected Bitcoin RPC binding is unavailable: ${backend}`)
  }

  let mounts = sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/data',
    readonly: false,
  })

  if (backend === 'bitcoind') {
    mounts = mounts.mountDependency<typeof officialBitcoinManifest>({
      dependencyId: 'bitcoind',
      volumeId: 'main',
      subpath: null,
      mountpoint: '/mnt/bitcoind',
      readonly: true,
    })
  }

  const datumSub = await sdk.SubContainer.eager(
    effects,
    { imageId: 'datum' },
    mounts,
    'datum-sub',
  )

  return sdk.Daemons.of(effects).addDaemon('datum', {
    subcontainer: datumSub,
    exec: {
      command: ['/usr/local/bin/datum-bip110-entrypoint', rpcAddress],
      env: {
        DATUM_COINBASE_TAG_PRIMARY:
          miningSettings?.coinbaseTagPrimary ?? defaultCoinbaseTagPrimary,
        DATUM_COINBASE_TAG_SECONDARY:
          miningSettings?.coinbaseTagSecondary ?? defaultCoinbaseTagSecondary,
        DATUM_POOL_ADDRESS:
          miningSettings?.payoutAddress ?? defaultPayoutAddress,
        DATUM_DASHBOARD_ADMIN_PASSWORD: dashboardPassword,
        DATUM_NODE_PACKAGE_ID: bitcoinNode.packageId,
        ...(bitcoinNode.cookieFile
          ? { DATUM_RPC_COOKIE_FILE: bitcoinNode.cookieFile }
          : {
              DATUM_RPC_USER: bitcoinNode.rpcUser!,
              DATUM_RPC_PASSWORD: bitcoinNode.rpcPassword!,
            }),
      },
      sigtermTimeout: 30_000,
    },
    ready: {
      display: i18n('BIP110 Stratum'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, stratumPort, {
          successMessage: i18n('The BIP110 Stratum endpoint is ready'),
          errorMessage: i18n('The BIP110 Stratum endpoint is not ready'),
        }),
    },
    requires: [],
  })
})
