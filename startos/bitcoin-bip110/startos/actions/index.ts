import { sdk } from '../sdk'
import { headlineConfig } from './headline'
import { networkConfig } from './network'

export const actions = sdk.Actions.of()
  .addAction(networkConfig)
  .addAction(headlineConfig)
