import { setupManifest } from '@start9labs/start-sdk'
import {
  bitcoinBip110DependencyDescription,
  bitcoinDependencyDescription,
  long,
  short,
} from './i18n'

export const manifest = setupManifest({
  id: 'datum-bip110',
  title: 'DATUM BIP110 Gateway',
  license: 'MIT',
  packageRepo: 'https://github.com/krzyczak/blake2b',
  upstreamRepo:
    'https://github.com/Maveth/datum_gateway/tree/e82d7e5422cb3e425ab7f9d9cbe230b1bc7a2f11',
  marketingUrl: 'https://github.com/Maveth/datum_gateway/tree/bip110-pow-v2',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'startos'],
  images: {
    datum: {
      source: {
        dockerBuild: {
          buildArgs: {
            DATUM_COMMIT: 'e82d7e5422cb3e425ab7f9d9cbe230b1bc7a2f11',
            DATUM_TARBALL_SHA256:
              'ed42b3cc8a2e42554c206c7ba8ce06e62adb4c05685c2fc22a2a2b8514d48c2d',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    'bitcoin-bip110': {
      description: bitcoinBip110DependencyDescription,
      optional: true,
      metadata: {
        title: 'Bitcoin Knots BIP110',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/51db7e317f48151a75b270dff49039b397048c80/dep-icon.svg',
      },
    },
    bitcoind: {
      description: bitcoinDependencyDescription,
      optional: true,
      metadata: {
        title: 'Bitcoin',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-knots-startos/refs/heads/29.x/dep-icon.svg',
      },
    },
  },
})
