import {
  archivalMin,
  bitcoinConfFile,
  blake2bHeadline,
  defaultDatacarriercost,
  defaultDbbatchsize,
  defaultDbcache,
  defaultMaxtipage,
  diskUsage,
  minPrune,
} from '../fileModels/bitcoin.conf'
import { i2pdConfFile } from '../fileModels/i2pd.conf'
import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'
import { i2PSamAddress } from '../utils'

export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (!kind) return

  // install, update, restore
  await storeJson.merge(effects, {})
  await i2pdConfFile.merge(effects, {})

  if (kind === 'install') {
    await bitcoinConfFile.merge(effects, {
      zmqEnabled: true,
      blockfilters: { blockfilterindex: true },
      dbcache: defaultDbcache(),
      dbbatchsize: defaultDbbatchsize(),
      natpmp: false,
      datacarriercost: defaultDatacarriercost,
      prune: (await diskUsage()).total < archivalMin ? minPrune : 0,
      raw: {
        i2psam: i2PSamAddress,
        // Acknowledges RDTS to the binary, which otherwise warns on every
        // start. Not enforced — see versions/current.ts.
        consensusrules: 'rdts',
        maxtipage: defaultMaxtipage,
        blake2b_headline: blake2bHeadline,
      },
    })
  } else {
    // Preserve the loose tip-age limit on update/restore without replacing a
    // headline the user selected through the package action.
    await bitcoinConfFile.merge(effects, {
      raw: { maxtipage: defaultMaxtipage },
    })
  }
})
