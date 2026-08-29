import { sdk } from '../sdk'
import { dashboardCredentials } from './dashboard-credentials'
import { miningIdentity } from './mining-identity'
import { selectBitcoinNode } from './select-bitcoin-node'
import { soloPayoutAddress } from './solo-payout-address'

export const actions = sdk.Actions.of()
  .addAction(selectBitcoinNode)
  .addAction(miningIdentity)
  .addAction(soloPayoutAddress)
  .addAction(dashboardCredentials)
