import { networkSettingsFile } from '../file-models/network-settings.json'
import { sdk } from '../sdk'

export const seedNetworkSettings = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  // Existing installations did not have this file and retain dummy mode.
  await networkSettingsFile.merge(effects, {})
})
