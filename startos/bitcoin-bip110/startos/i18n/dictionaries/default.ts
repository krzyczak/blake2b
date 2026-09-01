export const DEFAULT_LANG = 'en_US'

const dict = {
  'Bitcoin Blake2b Lab': 0,
  'Bitcoin RPC is starting': 1,
  'Bootstrapping dummy regtest blocks': 2,
  'Ready for mining on ${network} at height ${height}': 3,
  'Synchronizing ${network}: ${blocks}/${headers} blocks': 4,
  Network: 5,
  'Choose the Bitcoin network. Public networks perform a real initial block download; each mode keeps separate chain data.': 6,
  'Isolated dummy regtest': 7,
  'Testnet4 (public BLAKE2b network)': 8,
  'Signet (public)': 9,
  'Regtest (local, unbootstrapped)': 10,
  'Select Network': 11,
  'Select dummy mode, testnet4, signet, or a clean local regtest. Changing networks automatically restarts the service.': 12,
  'Testnet4 and signet download and validate their real public chains. Regtest has no canonical public peer network.': 13,
  Configuration: 14,
  'BLAKE2b Headline': 15,
  'Consensus-critical headline for the isolated dummy chain activation block.': 16,
  'An incorrect headline can make the node reject the BLAKE2b activation block. This is not the explorer-visible miner name.': 17,
  'Use one line of printable ASCII without leading or trailing spaces.': 18,
  'Set BLAKE2b Headline': 19,
  'Set the regtest-only blake2b_headline override for the isolated dummy chain.': 20,
  'Changing it creates a different dummy activation block and can make existing chain data incompatible.': 21,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
