import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bitcoin-bip110',
  title: 'Bitcoin Blake2b Lab',
  license: 'MIT',
  packageRepo: 'https://github.com/krzyczak/blake2b',
  upstreamRepo:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.4.1.knots20260508rc4',
  marketingUrl:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.4.1.knots20260508rc4',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          buildArgs: {
            BITCOIN_COMMIT: 'dc82be77dd741dfa63e1f816367b15364d55b051',
            BITCOIN_TARBALL_SHA256:
              'ebb740036801b1671c8d771118982ba860ce13f04be9bed633f07342a3121189',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
