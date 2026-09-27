import { ProgrammerBase, WordSize } from '../types/calculator';

export function getWordMask(size: WordSize): bigint {
  switch (size) {
    case 8:
      return 0xFFn;
    case 16:
      return 0xFFFFn;
    case 32:
      return 0xFFFFFFFFn;
    case 64:
      return 0xFFFFFFFFFFFFFFFFn;
  }
}

export function maskToWord(val: bigint, size: WordSize): bigint {
  const mask = getWordMask(size);
  return val & mask;
}

export function toSigned(val: bigint, size: WordSize): bigint {
  const masked = maskToWord(val, size);
  const signBit = 1n << BigInt(size - 1);
  if ((masked & signBit) !== 0n) {
    // Negative number in 2's complement
    return masked - (1n << BigInt(size));
  }
  return masked;
}

export function formatBinaryWithGrouping(val: bigint, size: WordSize): string {
  const masked = maskToWord(val, size);
  let bin = masked.toString(2).padStart(size, '0');
  // Group in 4s: e.g. 0000 1101 0101
  const groups: string[] = [];
  for (let i = 0; i < size; i += 4) {
    groups.push(bin.slice(i, i + 4));
  }
  return groups.join(' ');
}

export function formatHexWithGrouping(val: bigint, size: WordSize): string {
  const masked = maskToWord(val, size);
  const hexChars = size / 4;
  let hex = masked.toString(16).toUpperCase().padStart(hexChars, '0');
  // Group in pairs or quads
  return hex;
}

export function formatOctal(val: bigint, size: WordSize): string {
  const masked = maskToWord(val, size);
  return masked.toString(8);
}

export function countSetBits(val: bigint, size: WordSize): number {
  const masked = maskToWord(val, size);
  let count = 0;
  let temp = masked;
  while (temp > 0n) {
    if ((temp & 1n) === 1n) count++;
    temp >>= 1n;
  }
  return count;
}

export function rotateLeft(val: bigint, amount: number, size: WordSize): bigint {
  const masked = maskToWord(val, size);
  const amt = BigInt(amount % size);
  const left = (masked << amt);
  const right = (masked >> (BigInt(size) - amt));
  return maskToWord(left | right, size);
}

export function rotateRight(val: bigint, amount: number, size: WordSize): bigint {
  const masked = maskToWord(val, size);
  const amt = BigInt(amount % size);
  const right = (masked >> amt);
  const left = (masked << (BigInt(size) - amt));
  return maskToWord(right | left, size);
}

export function parseInputBase(input: string, base: ProgrammerBase, size: WordSize): bigint {
  if (!input.trim()) return 0n;
  const clean = input.replace(/[\s_]/g, '');
  try {
    let rad = 10;
    if (base === 'HEX') rad = 16;
    if (base === 'OCT') rad = 8;
    if (base === 'BIN') rad = 2;

    if (rad === 10) {
      return maskToWord(BigInt(clean), size);
    }

    // For hex, oct, bin BigInt parser handles 0x, 0o, 0b or plain
    let prefix = '';
    if (rad === 16) prefix = '0x';
    if (rad === 8) prefix = '0o';
    if (rad === 2) prefix = '0b';

    return maskToWord(BigInt(prefix + clean), size);
  } catch {
    return 0n;
  }
}
