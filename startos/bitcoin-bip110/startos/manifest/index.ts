import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bitcoin-bip110',
  title: 'Bitcoin Blake2b Lab',
  license: 'MIT',
  packageRepo: 'https://github.com/krzyczak/blake2b',
  upstreamRepo:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.5.1.knots20260508',
  marketingUrl:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.5.1.knots20260508',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          buildArgs: {
            BITCOIN_COMMIT: 'b4c8f9f4aa5715c98d0d550fc1395c2cc7a416f1',
            BITCOIN_TARBALL_SHA256:
              '1aa37d87d35657c88d96e2bf9c0a2e5adceb512e9d7938fa7db2a8582a9bda3f',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
