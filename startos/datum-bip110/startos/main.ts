import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  defaultCoinbaseTagPrimary,
  defaultCoinbaseTagSecondary,
  defaultPayoutAddress,
  miningSettingsFile,
} from './file-models/mining-settings.json'
import { dashboardPasswordFile } from './file-models/dashboard-password'
import {
  bitcoinPackageId,
  bitcoinRpcHostId,
  bitcoinRpcPort,
  stratumPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  const miningSettings = await miningSettingsFile.read((value) => value).once()
  const dashboardPassword = await dashboardPasswordFile.read().once()
  if (!dashboardPassword) {
    throw new Error('DATUM dashboard password is unavailable')
  }
  const rpcAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: bitcoinPackageId,
      hostId: bitcoinRpcHostId,
      internalPort: bitcoinRpcPort,
    })
    .const()

  if (!rpcAddress) {
    throw new Error('Bitcoin BIP110 RPC binding is unavailable')
  }

  const datumSub = await sdk.SubContainer.eager(
    effects,
    { imageId: 'datum' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
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
