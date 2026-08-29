export const maxCoinbaseTagBytes = 60
export const maxCombinedCoinbaseTagBytes = 88

export const coinbaseTagByteLength = (value: string): number =>
  Buffer.byteLength(value, 'utf8')

export const coinbaseTagContainsNullByte = (value: string): boolean =>
  value.includes('\0')

export const isValidCoinbaseTag = (value: string): boolean =>
  value.length > 0 &&
  !coinbaseTagContainsNullByte(value) &&
  coinbaseTagByteLength(value) <= maxCoinbaseTagBytes
