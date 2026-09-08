import { randomUUID } from 'node:crypto'
import { rename, rm, writeFile } from 'node:fs/promises'
import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import {
  miningSettingsFile,
  miningSettingsSchema,
} from './mining-settings.json'

export const gatewayConfigFile = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/config.json' },
  z.record(z.string(), z.record(z.string(), z.unknown())),
)

type GatewayConfig = Record<string, Record<string, unknown>>
type MiningSettings = z.infer<typeof miningSettingsSchema>

export const settingsFromGatewayConfig = (
  config: GatewayConfig | null,
  legacy: MiningSettings,
): MiningSettings => {
  if (!config) return legacy
  const { mining = {}, datum = {}, stratum = {} } = config
  return miningSettingsSchema.parse({
    coinbaseTagPrimary:
      mining.coinbase_tag_primary ?? legacy.coinbaseTagPrimary,
    coinbaseTagSecondary:
      mining.coinbase_tag_secondary ?? legacy.coinbaseTagSecondary,
    payoutAddress: mining.pool_address ?? legacy.payoutAddress,
    pool: {
      enabled: !!datum.pool_host,
      host: datum.pool_host || datum['pool_host(old)'] || '',
      port: datum.pool_port ?? legacy.pool.port,
      publicKey: datum.pool_pubkey ?? legacy.pool.publicKey,
      passWorkers: datum.pool_pass_workers ?? legacy.pool.passWorkers,
      passFullUsers: datum.pool_pass_full_users ?? legacy.pool.passFullUsers,
      pooledMiningOnly: datum.pooled_mining_only ?? false,
      vardiffMin: stratum.vardiff_min ?? legacy.pool.vardiffMin,
      targetSharesPerMinute:
        stratum.vardiff_target_shares_min ?? legacy.pool.targetSharesPerMinute,
    },
  })
}

export const updateGatewayConfig = (
  config: GatewayConfig,
  changes: Partial<MiningSettings>,
): GatewayConfig => {
  const updated = structuredClone(config)
  const mining = (updated.mining ??= {})
  if (changes.coinbaseTagPrimary !== undefined)
    mining.coinbase_tag_primary = changes.coinbaseTagPrimary
  if (changes.coinbaseTagSecondary !== undefined)
    mining.coinbase_tag_secondary = changes.coinbaseTagSecondary
  if (changes.payoutAddress !== undefined)
    mining.pool_address = changes.payoutAddress
  if (changes.pool) {
    const pool = changes.pool
    updated.datum = {
      ...updated.datum,
      pool_host: pool.enabled ? pool.host : '',
      'pool_host(old)': pool.host,
      pool_port: pool.port,
      pool_pubkey: pool.publicKey,
      pool_pass_workers: pool.passWorkers,
      pool_pass_full_users: pool.passFullUsers,
      pooled_mining_only: pool.enabled && pool.pooledMiningOnly,
    }
    updated.stratum = {
      ...updated.stratum,
      vardiff_min: pool.enabled ? pool.vardiffMin : 1,
      vardiff_target_shares_min: pool.enabled ? pool.targetSharesPerMinute : 8,
    }
  }
  return updated
}

export const readMiningSettings = async () => {
  const [legacy, config] = await Promise.all([
    miningSettingsFile.read().once(),
    gatewayConfigFile.read().once(),
  ])
  return settingsFromGatewayConfig(
    config,
    legacy ?? miningSettingsSchema.parse({}),
  )
}

export const saveMiningSettings = async (
  effects: Parameters<typeof miningSettingsFile.merge>[0],
  changes: Partial<MiningSettings>,
) => {
  const config = await gatewayConfigFile.read().once()
  if (config) {
    const temporary = `${gatewayConfigFile.path}.${randomUUID()}.tmp`
    try {
      await writeFile(
        temporary,
        JSON.stringify(updateGatewayConfig(config, changes)),
        {
          mode: 0o600,
        },
      )
      await rename(temporary, gatewayConfigFile.path)
    } finally {
      await rm(temporary, { force: true })
    }
  }
  await miningSettingsFile.merge(effects, changes)
}
