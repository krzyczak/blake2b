import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bitcoin-bip110',
  title: 'Bitcoin Blake2b Lab',
  license: 'MIT',
  packageRepo: 'https://github.com/krzyczak/blake2b',
  upstreamRepo:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.4.1.knots20260508rc5',
  marketingUrl:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.4.1.knots20260508rc5',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          buildArgs: {
            BITCOIN_COMMIT: '306523a567d5cf17d1939dc485be57a5ae83cfe7',
            BITCOIN_TARBALL_SHA256:
              '887216b39ef40c2b3c003ae0b7fde625174258d9e517ec0fa49775aacb82179f',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
