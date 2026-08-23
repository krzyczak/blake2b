import { setupManifest } from '@start9labs/start-sdk'
import { bitcoinDependencyDescription, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'datum-bip110',
  title: 'DATUM BIP110 Gateway',
  license: 'MIT',
  packageRepo: 'https://github.com/krzyczak/blake2b',
  upstreamRepo: 'https://github.com/justinfilip/datum_gateway',
  marketingUrl: 'https://github.com/justinfilip/datum_gateway',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    datum: {
      source: {
        dockerBuild: {
          buildArgs: {
            DATUM_COMMIT: '56c31f40c83c3c8315694617082456677799e43a',
            DATUM_TARBALL_SHA256:
              '4f917f319137a28c37df7cdd0e12e86faa651d8c1892bbc8f04167d93a6e3128',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    'bitcoin-bip110': {
      description: bitcoinDependencyDescription,
      optional: false,
      metadata: {
        title: 'Bitcoin Knots BIP110',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/51db7e317f48151a75b270dff49039b397048c80/dep-icon.svg',
      },
    },
  },
})
