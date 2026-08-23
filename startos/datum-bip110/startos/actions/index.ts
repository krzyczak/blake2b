import { sdk } from '../sdk'
import { dashboardCredentials } from './dashboard-credentials'
import { miningIdentity } from './mining-identity'
import { soloPayoutAddress } from './solo-payout-address'

export const actions = sdk.Actions.of()
  .addAction(miningIdentity)
  .addAction(soloPayoutAddress)
  .addAction(dashboardCredentials)
