import { setupManifest } from '@start9labs/start-sdk'
import {
  bitcoinBip110DependencyDescription,
  bitcoinDependencyDescription,
  long,
  short,
} from './i18n'

export const manifest = setupManifest({
  id: 'datum-bip110',
  title: 'DATUM Blake2b Lab',
  license: 'MIT',
  packageRepo: 'https://github.com/krzyczak/blake2b',
  upstreamRepo:
    'https://github.com/Maveth/datum_gateway/tree/7491a5099dd5d887a027c812f71de63e0d5986a3',
  marketingUrl: 'https://github.com/Maveth/datum_gateway',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'startos'],
  images: {
    datum: {
      source: {
        dockerBuild: {},
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    'bitcoin-bip110': {
      description: bitcoinBip110DependencyDescription,
      optional: true,
      metadata: {
        title: 'Bitcoin Blake2b Lab',
        icon: 'dependency-icons/bitcoin.svg',
      },
    },
    bitcoind: {
      description: bitcoinDependencyDescription,
      optional: true,
      metadata: {
        title: 'Bitcoin',
        icon: 'dependency-icons/bitcoin.svg',
      },
    },
  },
})
