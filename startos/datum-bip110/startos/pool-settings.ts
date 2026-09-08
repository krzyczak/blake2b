import { isIP } from 'node:net'
import { z } from '@start9labs/start-sdk'

export const isPoolHost = (value: string): boolean =>
  value.length <= 253 &&
  !/\s/.test(value) &&
  (isIP(value) !== 0 ||
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.?$/.test(
      value,
    ))

export const poolSettingsSchema = z
  .object({
    enabled: z.boolean().default(false),
    host: z.string().default(''),
    port: z.number().int().min(1).max(65535).default(28915),
    publicKey: z.string().max(128).default(''),
    passWorkers: z.boolean().default(true),
    passFullUsers: z.boolean().default(true),
    pooledMiningOnly: z.boolean().default(true),
    vardiffMin: z
      .number()
      .int()
      .min(1)
      .max(1073741824)
      .refine((value) => Number.isInteger(Math.log2(value)), {
        message: 'Minimum difficulty must be a power of two.',
      })
      .default(4096),
    targetSharesPerMinute: z.number().int().min(1).max(120).default(8),
  })
  .superRefine((value, context) => {
    if ((value.enabled || value.host !== '') && !isPoolHost(value.host)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['host'],
        message:
          'Enter a DATUM hostname or IP address without a scheme or port.',
      })
    }
    if (
      (value.enabled || value.publicKey !== '') &&
      !/^[a-fA-F0-9]{128}$/.test(value.publicKey)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publicKey'],
        message:
          'The pool public key must contain exactly 128 hexadecimal characters.',
      })
    }
  })

export const defaultPoolSettings = poolSettingsSchema.parse({})
export type PoolSettings = z.infer<typeof poolSettingsSchema>

export const poolEnvironment = (settings: PoolSettings) => {
  const pool = poolSettingsSchema.parse(settings)
  return {
    DATUM_POOL_HOST: pool.enabled ? pool.host : '',
    DATUM_POOL_PORT: String(pool.port),
    DATUM_POOL_PUBKEY: pool.publicKey,
    DATUM_POOL_PASS_WORKERS: String(pool.enabled && pool.passWorkers),
    DATUM_POOL_PASS_FULL_USERS: String(pool.enabled && pool.passFullUsers),
    DATUM_POOLED_MINING_ONLY: String(pool.enabled && pool.pooledMiningOnly),
    DATUM_VARDIFF_MIN: String(pool.enabled ? pool.vardiffMin : 1),
    DATUM_VARDIFF_TARGET_SHARES_MIN: String(
      pool.enabled ? pool.targetSharesPerMinute : 8,
    ),
  }
}
