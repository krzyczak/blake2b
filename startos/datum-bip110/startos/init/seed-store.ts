import { storeJson } from '../file-models/store.json'
import { sdk } from '../sdk'

export const seedStore = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  await storeJson.merge(effects, {})
})
