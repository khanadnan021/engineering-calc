import React, { useState } from 'react';
import { ProgrammerBase, WordSize } from '../types/calculator';
import {
  formatBinaryWithGrouping,
  formatHexWithGrouping,
  formatOctal,
  maskToWord,
  toSigned,
  countSetBits,
  rotateLeft,
  rotateRight,
  parseInputBase,
} from '../utils/programmerEngine';

interface ProgrammerKeypadProps {
  onInsertToMain?: (val: string) => void;
}

export const ProgrammerKeypad: React.FC<ProgrammerKeypadProps> = () => {
  const [currentVal, setCurrentVal] = useState<bigint>(42n);
  const [activeBase, setActiveBase] = useState<ProgrammerBase>('DEC');
  const [wordSize, setWordSize] = useState<WordSize>(64);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [prevVal, setPrevVal] = useState<bigint | null>(null);
  const [inputBuffer, setInputBuffer] = useState<string>('42');
  const [isNewEntry, setIsNewEntry] = useState(false);

  // Sync current value when buffer or base changes
  const updateVal = (newVal: bigint) => {
    const masked = maskToWord(newVal, wordSize);
    setCurrentVal(masked);
    if (activeBase === 'HEX') setInputBuffer(masked.toString(16).toUpperCase());
    else if (activeBase === 'DEC') setInputBuffer(masked.toString(10));
    else if (activeBase === 'OCT') setInputBuffer(masked.toString(8));
    else setInputBuffer(masked.toString(2));
  };

  const handleBaseSelect = (base: ProgrammerBase) => {
    setActiveBase(base);
    if (base === 'HEX') setInputBuffer(currentVal.toString(16).toUpperCase());
    else if (base === 'DEC') setInputBuffer(currentVal.toString(10));
    else if (base === 'OCT') setInputBuffer(currentVal.toString(8));
    else setInputBuffer(currentVal.toString(2));
  };

  const handleToggleBit = (bitIndex: number) => {
    const bitMask = 1n << BigInt(bitIndex);
    const toggled = currentVal ^ bitMask;
    updateVal(toggled);
  };

  const handleDigit = (char: string) => {
    let nextStr = isNewEntry ? char : (inputBuffer === '0' ? char : inputBuffer + char);
    setIsNewEntry(false);
    setInputBuffer(nextStr);
    const parsed = parseInputBase(nextStr, activeBase, wordSize);
    setCurrentVal(parsed);
  };

  const handleBackspace = () => {
    if (inputBuffer.length <= 1) {
      setInputBuffer('0');
      setCurrentVal(0n);
      return;
    }
    const nextStr = inputBuffer.slice(0, -1);
    setInputBuffer(nextStr);
    const parsed = parseInputBase(nextStr, activeBase, wordSize);
    setCurrentVal(parsed);
  };

  const handleClear = () => {
    setInputBuffer('0');
    setCurrentVal(0n);
    setPendingOp(null);
    setPrevVal(null);
  };

  const handleBitwiseOp = (op: string) => {
    if (op === 'NOT') {
      updateVal(~currentVal);
      return;
    }
    if (op === '2COMP') {
      updateVal(-currentVal);
      return;
    }
    if (op === 'ROL') {
      updateVal(rotateLeft(currentVal, 1, wordSize));
      return;
    }
    if (op === 'ROR') {
      updateVal(rotateRight(currentVal, 1, wordSize));
      return;
    }

    setPendingOp(op);
    setPrevVal(currentVal);
    setIsNewEntry(true);
  };

  const handleEquals = () => {
    if (!pendingOp || prevVal === null) return;
    const a = prevVal;
    const b = currentVal;
    let res = 0n;

    switch (pendingOp) {
      case 'AND':
        res = a & b;
        break;
      case 'OR':
        res = a | b;
        break;
      case 'XOR':
        res = a ^ b;
        break;
      case 'NAND':
        res = ~(a & b);
        break;
      case 'NOR':
        res = ~(a | b);
        break;
      case 'XNOR':
        res = ~(a ^ b);
        break;
      case 'LSH':
        res = a << (b & 0x3Fn);
        break;
      case 'RSH':
        res = a >> (b & 0x3Fn);
        break;
      case '+':
        res = a + b;
        break;
      case '-':
        res = a - b;
        break;
      case '*':
        res = a * b;
        break;
      case '/':
        res = b !== 0n ? a / b : 0n;
        break;
      case 'MOD':
        res = b !== 0n ? a % b : 0n;
        break;
    }

    updateVal(res);
    setPendingOp(null);
    setPrevVal(null);
    setIsNewEntry(true);
  };

  // Check if character is valid for active base
  const isCharDisabled = (char: string): boolean => {
    const isHexDigit = 'ABCDEF'.includes(char);
    const num = parseInt(char, 16);
    if (activeBase === 'BIN') return num > 1;
    if (activeBase === 'OCT') return num > 7;
    if (activeBase === 'DEC') return isHexDigit;
    return false;
  };

  const signedVal = toSigned(currentVal, wordSize);
  const setBits = countSetBits(currentVal, wordSize);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 4-Way Synchronous Base Display */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col gap-1.5 font-mono">
        {/* Word Size & Set Bits Telemetry */}
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Word Size:</span>
            {([64, 32, 16, 8] as WordSize[]).map((size) => (
              <button
                key={size}
                onClick={() => {
                  setWordSize(size);
                  updateVal(currentVal);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  wordSize === size
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {size === 64 ? 'QWORD' : size === 32 ? 'DWORD' : size === 16 ? 'WORD' : 'BYTE'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>PopCount: <strong className="text-cyan-400">{setBits}</strong> bits</span>
            <span>·</span>
            <span>Signed: <strong className="text-amber-400">{signedVal.toString(10)}</strong></span>
          </div>
        </div>

        {/* HEX Row */}
        <div
          onClick={() => handleBaseSelect('HEX')}
          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
            activeBase === 'HEX' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-slate-800/50'
          }`}
        >
          <span className="text-xs font-bold text-cyan-400 w-10">HEX</span>
          <span className="text-sm sm:text-base font-semibold text-slate-100 tracking-wider truncate">
            0x{formatHexWithGrouping(currentVal, wordSize)}
          </span>
        </div>

        {/* DEC Row */}
        <div
          onClick={() => handleBaseSelect('DEC')}
          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
            activeBase === 'DEC' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-slate-800/50'
          }`}
        >
          <span className="text-xs font-bold text-amber-400 w-10">DEC</span>
          <span className="text-sm sm:text-base font-semibold text-white truncate">
            {maskToWord(currentVal, wordSize).toString(10)}
          </span>
        </div>

        {/* OCT Row */}
        <div
          onClick={() => handleBaseSelect('OCT')}
          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
            activeBase === 'OCT' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-slate-800/50'
          }`}
        >
          <span className="text-xs font-bold text-emerald-400 w-10">OCT</span>
          <span className="text-sm sm:text-base font-semibold text-slate-200 truncate">
            {formatOctal(currentVal, wordSize)}
          </span>
        </div>

        {/* BIN Row */}
        <div
          onClick={() => handleBaseSelect('BIN')}
          className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
            activeBase === 'BIN' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'hover:bg-slate-800/50'
          }`}
        >
          <span className="text-xs font-bold text-purple-400 w-10">BIN</span>
          <span className="text-xs sm:text-sm font-semibold text-cyan-300 tracking-widest break-all">
            {formatBinaryWithGrouping(currentVal, wordSize)}
          </span>
        </div>
      </div>

      {/* Interactive 64-Bit Flipper Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1 border-b border-slate-800">
          <span className="font-semibold text-slate-300">Interactive Bitboard (Click to toggle bit)</span>
          <span className="text-slate-500">MSB [63] ──► LSB [0]</span>
        </div>

        {/* Render bit rows in 16-bit segments */}
        {[3, 2, 1, 0].map((rowIdx) => {
          const startBit = (rowIdx + 1) * 16 - 1;
          const endBit = rowIdx * 16;
          if (startBit >= wordSize) return null;

          const bits: number[] = [];
          for (let b = startBit; b >= endBit; b--) {
            bits.push(b);
          }

          return (
            <div key={rowIdx} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-0.5">
                <span>Bit {startBit}</span>
                <span>Bit {endBit}</span>
              </div>
              <div className="grid grid-cols-16 gap-0.5 sm:gap-1">
                {bits.map((b) => {
                  const isSet = (currentVal & (1n << BigInt(b))) !== 0n;
                  return (
                    <button
                      key={b}
                      onClick={() => handleToggleBit(b)}
                      title={`Bit ${b}: ${isSet ? '1' : '0'} (Click to toggle)`}
                      className={`h-7 sm:h-8 flex items-center justify-center font-mono text-xs font-bold rounded transition-all cursor-pointer ${
                        isSet
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {isSet ? '1' : '0'}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bitwise Logic & Shift Operator Keys */}
      <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">
        {(['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', 'XNOR', 'LSH', 'RSH', 'ROL', 'ROR', '2COMP'] as const).map(
          (op) => (
            <button
              key={op}
              onClick={() => handleBitwiseOp(op)}
              className={`h-10 rounded font-mono text-xs font-semibold border transition-all cursor-pointer ${
                pendingOp === op
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              {op}
            </button>
          )
        )}
      </div>

      {/* Hex/Dec Numeric Keypad */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5">
        {/* Hex Digits A-F */}
        {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map((h) => {
          const disabled = isCharDisabled(h);
          return (
            <button
              key={h}
              disabled={disabled}
              onClick={() => handleDigit(h)}
              className={`h-11 rounded font-mono text-sm font-semibold border transition-all ${
                disabled
                  ? 'bg-slate-900/40 text-slate-700 border-slate-900 cursor-not-allowed'
                  : 'bg-cyan-950/30 text-cyan-300 border-cyan-800/40 hover:bg-cyan-900/50 cursor-pointer'
              }`}
            >
              {h}
            </button>
          );
        })}

        {/* Clear & Backspace */}
        <button
          onClick={handleClear}
          className="h-11 rounded font-mono text-xs font-bold bg-rose-950/40 text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 cursor-pointer"
        >
          AC
        </button>
        <button
          onClick={handleBackspace}
          className="h-11 rounded font-mono text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
        >
          DEL
        </button>

        {/* Digits 7,8,9 */}
        {(['7', '8', '9'] as const).map((d) => (
          <button
            key={d}
            disabled={isCharDisabled(d)}
            onClick={() => handleDigit(d)}
            className={`h-11 rounded font-mono text-base font-bold border transition-all ${
              isCharDisabled(d)
                ? 'bg-slate-900/40 text-slate-700 border-slate-900 cursor-not-allowed'
                : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800 cursor-pointer'
            }`}
          >
            {d}
          </button>
        ))}

        {/* Operator + */}
        <button
          onClick={() => handleBitwiseOp('+')}
          className="h-11 rounded font-mono text-base font-semibold bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
        >
          +
        </button>

        {/* Digits 4,5,6 */}
        {(['4', '5', '6'] as const).map((d) => (
          <button
            key={d}
            disabled={isCharDisabled(d)}
            onClick={() => handleDigit(d)}
            className={`h-11 rounded font-mono text-base font-bold border transition-all ${
              isCharDisabled(d)
                ? 'bg-slate-900/40 text-slate-700 border-slate-900 cursor-not-allowed'
                : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800 cursor-pointer'
            }`}
          >
            {d}
          </button>
        ))}

        {/* Operator - */}
        <button
          onClick={() => handleBitwiseOp('-')}
          className="h-11 rounded font-mono text-base font-semibold bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
        >
          −
        </button>

        {/* Digits 1,2,3 */}
        {(['1', '2', '3'] as const).map((d) => (
          <button
            key={d}
            disabled={isCharDisabled(d)}
            onClick={() => handleDigit(d)}
            className={`h-11 rounded font-mono text-base font-bold border transition-all ${
              isCharDisabled(d)
                ? 'bg-slate-900/40 text-slate-700 border-slate-900 cursor-not-allowed'
                : 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800 cursor-pointer'
            }`}
          >
            {d}
          </button>
        ))}

        {/* Operator * */}
        <button
          onClick={() => handleBitwiseOp('*')}
          className="h-11 rounded font-mono text-base font-semibold bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
        >
          ×
        </button>

        {/* Digit 0 */}
        <button
          disabled={isCharDisabled('0')}
          onClick={() => handleDigit('0')}
          className="h-11 rounded font-mono text-base font-bold bg-slate-900 text-white border border-slate-800 hover:bg-slate-800 cursor-pointer"
        >
          0
        </button>

        {/* Modulo */}
        <button
          onClick={() => handleBitwiseOp('MOD')}
          className="h-11 rounded font-mono text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
        >
          MOD
        </button>

        {/* Operator / */}
        <button
          onClick={() => handleBitwiseOp('/')}
          className="h-11 rounded font-mono text-base font-semibold bg-slate-800 text-cyan-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
        >
          ÷
        </button>

        {/* Equals */}
        <button
          onClick={handleEquals}
          className="h-11 col-span-2 rounded font-mono text-base font-bold bg-cyan-500 text-slate-950 border border-cyan-400 hover:bg-cyan-400 shadow-sm cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
};
