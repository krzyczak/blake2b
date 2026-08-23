export const DEFAULT_LANG = 'en_US'

const dict = {
  'BIP110 Stratum': 0,
  'Stratum endpoint for the BIP110 DATUM miner': 1,
  'The BIP110 Stratum endpoint is ready': 2,
  'The BIP110 Stratum endpoint is not ready': 3,
  'Start with a letter or number; use only letters, numbers, spaces, and . _ : / + @ -.': 4,
  'Primary Coinbase Tag': 5,
  'Your miner identity embedded in every solo-mined coinbase. Use a unique value such as /MyMiner/.': 6,
  'Secondary Coinbase Tag': 7,
  'Additional text embedded after the primary tag, for example Totoro or Testnet4.': 8,
  'Set Mining Identity': 9,
  'Configure the primary and secondary DATUM coinbase tags written into blocks you mine.': 10,
  'A public explorer displays a named miner only after its pool registry maps one of these tags to that name.': 11,
  Configuration: 12,
  'Primary and secondary coinbase tags may total at most 88 bytes.': 13,
  'Dashboard Credentials': 14,
  'Display the generated credentials for the DATUM monitoring dashboard.': 15,
  Monitoring: 16,
  'The dashboard password has not been generated': 17,
  'DATUM Dashboard Credentials': 18,
  'Use these credentials when the dashboard requests authentication.': 19,
  Username: 20,
  Password: 21,
  'Monitoring Dashboard': 22,
  'DATUM status, hashrate, share, client, and job monitoring.': 23,
} as const

export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
