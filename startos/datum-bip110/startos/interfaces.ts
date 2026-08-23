import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  dashboardHostId,
  dashboardPort,
  stratumHostId,
  stratumPort,
} from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const stratumMulti = sdk.MultiHost.of(effects, stratumHostId)
  const stratumOrigin = await stratumMulti.bindPort(stratumPort, {
    protocol: null,
    preferredExternalPort: stratumPort,
    addSsl: null,
    secure: { ssl: false },
  })
  const stratum = sdk.createInterface(effects, {
    name: i18n('BIP110 Stratum'),
    id: 'stratum',
    description: i18n('Stratum endpoint for the BIP110 DATUM miner'),
    type: 'api',
    masked: false,
    schemeOverride: { ssl: 'stratum+tcp', noSsl: 'stratum+tcp' },
    username: null,
    path: '',
    query: {},
  })
  const dashboardMulti = sdk.MultiHost.of(effects, dashboardHostId)
  const dashboardOrigin = await dashboardMulti.bindPort(dashboardPort, {
    protocol: 'http',
  })
  const dashboard = sdk.createInterface(effects, {
    name: i18n('Monitoring Dashboard'),
    id: 'dashboard',
    description: i18n(
      'DATUM status, hashrate, share, client, and job monitoring.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: 'admin',
    path: '',
    query: {},
  })

  return [
    await stratumOrigin.export([stratum]),
    await dashboardOrigin.export([dashboard]),
  ]
})
