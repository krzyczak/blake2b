import { miningSettingsFile } from '../file-models/mining-settings.json'
import { sdk } from '../sdk'

export const seedMiningSettings = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  await miningSettingsFile.merge(effects, {})
})
