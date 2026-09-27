/**
 * Types and interfaces for OmniCalc Pro Scientific & Engineering Workstation
 */

export type AngleMode = 'DEG' | 'RAD' | 'GRAD';

export type DisplayNotation = 'NORMAL' | 'SCI' | 'ENG';

export type CalculatorMode = 
  | 'scientific'
  | 'engineering'
  | 'programmer'
  | 'matrix'
  | 'complex'
  | 'grapher'
  | 'solvers'
  | 'converter';

export interface HistoryItem {
  id: string;
  timestamp: number;
  expression: string;
  result: string;
  angleMode: AngleMode;
  notation: DisplayNotation;
  error?: boolean;
}

export type MemoryRegisterKey = 'M' | 'A' | 'B' | 'C' | 'D' | 'X' | 'Y' | 'ANS';

export type MemoryRegisters = Record<MemoryRegisterKey, number>;

export type ProgrammerBase = 'HEX' | 'DEC' | 'OCT' | 'BIN';

export type WordSize = 8 | 16 | 32 | 64;

export interface PhysicalConstant {
  symbol: string;
  name: string;
  value: number;
  unit: string;
  category: 'Universal' | 'Atomic' | 'Phys-Chem' | 'Math' | 'Astrophysics';
  latex?: string;
  description: string;
}

export interface UnitCategory {
  id: string;
  name: string;
  iconName: string;
  baseUnit: string;
  units: {
    symbol: string;
    name: string;
    toBase: (val: number) => number;
    fromBase: (val: number) => number;
  }[];
}

export interface ComplexNumber {
  re: number;
  im: number;
}

export type MatrixData = number[][];
