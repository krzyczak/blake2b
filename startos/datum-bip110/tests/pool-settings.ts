import assert from 'node:assert/strict'
import { miningSettingsSchema } from '../startos/file-models/mining-settings.json'
import {
  defaultPoolSettings,
  poolEnvironment,
  poolSettingsSchema,
} from '../startos/pool-settings'

const solo = poolEnvironment(defaultPoolSettings)
assert.equal(solo.DATUM_POOL_HOST, '')
assert.equal(solo.DATUM_VARDIFF_MIN, '1')
assert.equal(solo.DATUM_POOLED_MINING_ONLY, 'false')

const legacy = {
  coinbaseTagPrimary: 'MyMiner',
  coinbaseTagSecondary: 'Testnet',
  payoutAddress: 'mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn',
}
const migrated = miningSettingsSchema.parse(legacy)
assert.deepEqual(migrated, { ...legacy, pool: defaultPoolSettings })

const pool = poolSettingsSchema.parse({
  enabled: true,
  host: 'stratum.abc.xyz',
  publicKey: 'ab'.repeat(64),
})
assert.deepEqual(
  miningSettingsSchema.parse(JSON.parse(JSON.stringify({ ...migrated, pool }))),
  { ...legacy, pool },
)
assert.equal(
  miningSettingsSchema.safeParse({
    ...legacy,
    pool: { ...pool, publicKey: '' },
  }).success,
  false,
)
assert.deepEqual(poolEnvironment(pool), {
  DATUM_POOL_HOST: 'stratum.abc.xyz',
  DATUM_POOL_PORT: '28915',
  DATUM_POOL_PUBKEY: 'ab'.repeat(64),
  DATUM_POOL_PASS_WORKERS: 'true',
  DATUM_POOL_PASS_FULL_USERS: 'true',
  DATUM_POOLED_MINING_ONLY: 'true',
  DATUM_VARDIFF_MIN: '4096',
  DATUM_VARDIFF_TARGET_SHARES_MIN: '8',
})
assert.equal(poolEnvironment({ ...pool, enabled: false }).DATUM_POOL_HOST, '')
assert.equal(
  poolEnvironment({ ...pool, enabled: false }).DATUM_VARDIFF_MIN,
  '1',
)
assert.equal(
  poolEnvironment({ ...pool, pooledMiningOnly: false })
    .DATUM_POOLED_MINING_ONLY,
  'false',
)

for (const changes of [
  { host: '' },
  { host: 'stratum+tcp://pool.example' },
  { host: 'pool.example:28915' },
  { host: 'pool.example\nother' },
  { host: 'pool.example\n' },
  { publicKey: '' },
  { publicKey: 'ab'.repeat(63) },
  { publicKey: 'z'.repeat(128) },
  { publicKey: 'ab'.repeat(64) + '\n' },
  { port: 0 },
  { port: 65536 },
  { port: 1.5 },
  { vardiffMin: 4095 },
  { vardiffMin: 0 },
  { targetSharesPerMinute: 0 },
  { enabled: 'false' },
])
  assert.equal(
    poolSettingsSchema.safeParse({ ...pool, ...changes }).success,
    false,
  )

for (const host of ['pool.example', '127.0.0.1', '::1', '2001:db8::1']) {
  assert.equal(poolSettingsSchema.safeParse({ ...pool, host }).success, true)
}
console.log(
  'Pool settings: defaults, forwarding, fallback, and validation passed',
)
