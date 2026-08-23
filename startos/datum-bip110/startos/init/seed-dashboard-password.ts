import { randomBytes } from 'node:crypto'
import { dashboardPasswordFile } from '../file-models/dashboard-password'
import { sdk } from '../sdk'

export const seedDashboardPassword = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  const existing = await dashboardPasswordFile.read().once()
  if (existing) return

  await dashboardPasswordFile.write(
    effects,
    randomBytes(24).toString('base64url'),
  )
})
