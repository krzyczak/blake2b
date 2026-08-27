import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'bitcoin-bip110',
  title: 'Bitcoin Knots BIP110',
  license: 'MIT',
  packageRepo: 'https://github.com/krzyczak/blake2b',
  upstreamRepo:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.4.1.knots20260508rc3',
  marketingUrl:
    'https://github.com/bitcoinknots/bitcoin/tree/v29.4.1.knots20260508rc3',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    bitcoind: {
      source: {
        dockerBuild: {
          buildArgs: {
            BITCOIN_COMMIT: 'afbe91c299e16519f03902939fdbda8af9bd527d',
            BITCOIN_TARBALL_SHA256:
              '2758d73bb5a0ec9d8dcf8b808dd738c83699f6da1f5b20825c900ef3646c076d',
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {},
})
