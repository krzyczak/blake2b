import { sdk } from '../sdk'
import { miningIdentity } from './mining-identity'

export const actions = sdk.Actions.of().addAction(miningIdentity)
