import { sdk } from '../sdk'
import { dashboardCredentials } from './dashboard-credentials'
import { miningIdentity } from './mining-identity'

export const actions = sdk.Actions.of()
  .addAction(miningIdentity)
  .addAction(dashboardCredentials)
