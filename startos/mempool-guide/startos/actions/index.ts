import { sdk } from '../sdk'
import { selectIndexer } from './selectIndexer'
import { enableLightning } from './enableLightning'
import { indexingAndPerformance } from './indexingAndPerformance'
import { clearBackendCache } from './clearBackendCache'
import { torProxy } from './torProxy'
import { blockWeightLimit } from './blockWeightLimit'

export const actions = sdk.Actions.of()
  .addAction(selectIndexer)
  .addAction(enableLightning)
  .addAction(indexingAndPerformance)
  .addAction(blockWeightLimit)
  .addAction(torProxy)
  .addAction(clearBackendCache)
