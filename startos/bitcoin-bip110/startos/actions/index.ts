import { sdk } from '../sdk'
import { networkConfig } from './network'

export const actions = sdk.Actions.of().addAction(networkConfig)
