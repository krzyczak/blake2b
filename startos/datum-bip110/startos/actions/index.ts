import { sdk } from '../sdk'
import { dashboardCredentials } from './dashboard-credentials'
import { miningIdentity } from './mining-identity'
import { selectBitcoinNode } from './select-bitcoin-node'
import { soloPayoutAddress } from './solo-payout-address'
import { configurePool } from './pool-settings'

export const actions = sdk.Actions.of()
  .addAction(selectBitcoinNode)
  .addAction(miningIdentity)
  .addAction(soloPayoutAddress)
  .addAction(configurePool)
  .addAction(dashboardCredentials)
