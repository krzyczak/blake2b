import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bitcoin-bip110',
  title: 'Bitcoin Knots BIP110',
  license: 'MIT',
  packageRepo: 'https://github.com/krzyczak/blake2b',
  upstreamRepo:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.4.1.knots20260508rc2',
  marketingUrl:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.4.1.knots20260508rc2',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          buildArgs: {
            BITCOIN_COMMIT: 'c25ad6bcd18fa65cd78f176a52be062411507741',
            BITCOIN_TARBALL_SHA256:
              '4b7ac71af9e8989bc8882d44edcd51fa1bf200d375a5996109d72fe74dc8ecfe',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
