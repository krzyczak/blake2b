import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v3_4_0_dev_20260830_2 } from './v3.4.0_dev_20260830_2'
import { v3_4_0_dev_20260830_3 } from './v3.4.0_dev_20260830_3'

export const versionGraph = VersionGraph.of({
  current,
  other: [v3_4_0_dev_20260830_3, v3_4_0_dev_20260830_2],
})
