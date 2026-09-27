import React, { useState } from 'react';
import { AngleMode, DisplayNotation } from '../types/calculator';

interface ScientificKeypadProps {
  onInsert: (token: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onCalculate: () => void;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  notation: DisplayNotation;
  onToggleNotation: () => void;
  onShiftEngExponent: (delta: number) => void;
  onMemoryAction: (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => void;
  ansValue?: number;
}

export const ScientificKeypad: React.FC<ScientificKeypadProps> = ({
  onInsert,
  onClear,
  onBackspace,
  onCalculate,
  angleMode,
  onToggleAngleMode,
  notation,
  onToggleNotation,
  onShiftEngExponent,
  onMemoryAction,
}) => {
  const [isShift, setIsShift] = useState(false);
  const [isHyp, setIsHyp] = useState(false);

  // Common button styling helper
  const baseKey =
    'h-11 sm:h-12 flex flex-col items-center justify-center font-mono rounded-lg transition-all duration-150 select-none active:scale-[0.98] cursor-pointer text-xs sm:text-sm font-medium';
  
  const fnKey = `${baseKey} bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700/60 hover:border-slate-600 shadow-xs`;
  const numKey = `${baseKey} bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 text-sm sm:text-base font-semibold shadow-xs`;
  const opKey = `${baseKey} bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/40 hover:border-cyan-700/60 font-semibold`;
  const accentKey = `${baseKey} bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold border border-cyan-400 shadow-sm text-base sm:text-lg`;
  const dangerKey = `${baseKey} bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 hover:border-rose-700/60 font-semibold`;
  const memKey = `${baseKey} h-8 text-[11px] sm:text-xs bg-slate-900/80 hover:bg-slate-800 text-amber-300/90 border border-slate-800 hover:border-amber-500/30`;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Top Engineering & Memory Bar */}
      <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
        <button
          onClick={() => setIsShift(!isShift)}
          className={`${memKey} ${
            isShift ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : ''
          }`}
          title="Second function toggle"
        >
          2nd
        </button>
        <button
          onClick={() => setIsHyp(!isHyp)}
          className={`${memKey} ${
            isHyp ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' : ''
          }`}
          title="Hyperbolic trigonometric functions"
        >
          hyp
        </button>
        <button
          onClick={onToggleAngleMode}
          className={`${memKey} text-cyan-400 font-semibold`}
          title="Toggle Angle Unit"
        >
          {angleMode}
        </button>
        <button
          onClick={onToggleNotation}
          className={`${memKey} text-amber-400 font-semibold`}
          title="Toggle Display Notation"
        >
          {notation}
        </button>
        <button
          onClick={() => onShiftEngExponent(-3)}
          className={memKey}
          title="ENG Shift Exponent -3 (e.g. k -> M)"
        >
          ENG◄
        </button>
        <button
          onClick={() => onShiftEngExponent(3)}
          className={memKey}
          title="ENG Shift Exponent +3 (e.g. k -> 1)"
        >
          ENG►
        </button>
        <button onClick={() => onMemoryAction('MC')} className={memKey} title="Memory Clear">
          MC
        </button>
        <button onClick={() => onMemoryAction('MR')} className={memKey} title="Memory Recall">
          MR
        </button>
        <button onClick={() => onMemoryAction('M+')} className={`${memKey} hidden sm:flex`} title="Memory Add">
          M+
        </button>
        <button onClick={() => onMemoryAction('MS')} className={`${memKey} hidden sm:flex`} title="Memory Store">
          MS
        </button>
      </div>

      {/* Main Scientific Matrix */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
        {/* Row 1 */}
        <button
          onClick={() => onInsert(isHyp ? (isShift ? 'asinh(' : 'sinh(') : (isShift ? 'asin(' : 'sin('))}
          className={fnKey}
        >
          <span className="text-[10px] text-cyan-400/70">{isShift ? 'sin⁻¹' : isHyp ? 'sinh' : ''}</span>
          <span>{isHyp ? (isShift ? 'asinh' : 'sinh') : (isShift ? 'asin' : 'sin')}</span>
        </button>

        <button
          onClick={() => onInsert(isHyp ? (isShift ? 'acosh(' : 'cosh(') : (isShift ? 'acos(' : 'cos('))}
          className={fnKey}
        >
          <span className="text-[10px] text-cyan-400/70">{isShift ? 'cos⁻¹' : isHyp ? 'cosh' : ''}</span>
          <span>{isHyp ? (isShift ? 'acosh' : 'cosh') : (isShift ? 'acos' : 'cos')}</span>
        </button>

        <button
          onClick={() => onInsert(isHyp ? (isShift ? 'atanh(' : 'tanh(') : (isShift ? 'atan(' : 'tan('))}
          className={fnKey}
        >
          <span className="text-[10px] text-cyan-400/70">{isShift ? 'tan⁻¹' : isHyp ? 'tanh' : ''}</span>
          <span>{isHyp ? (isShift ? 'atanh' : 'tanh') : (isShift ? 'atan' : 'tan')}</span>
        </button>

        <button
          onClick={() => onInsert(isShift ? 'e^(' : 'log(')}
          className={fnKey}
          title={isShift ? 'Exponential e^x' : 'Natural Logarithm ln(x)'}
        >
          <span className="text-[10px] text-cyan-400/70">{isShift ? 'eˣ' : ''}</span>
          <span>{isShift ? 'eˣ' : 'ln'}</span>
        </button>

        <button
          onClick={() => onInsert(isShift ? '10^(' : 'log10(')}
          className={fnKey}
          title={isShift ? '10 to the power x' : 'Logarithm base 10'}
        >
          <span className="text-[10px] text-cyan-400/70">{isShift ? '10ˣ' : ''}</span>
          <span>{isShift ? '10ˣ' : 'log'}</span>
        </button>

        <button onClick={onClear} className={`${dangerKey} hidden sm:flex`} title="All Clear">
          AC
        </button>

        {/* Row 2 */}
        <button
          onClick={() => onInsert(isShift ? '^3' : '^2')}
          className={fnKey}
          title={isShift ? 'Cube x³' : 'Square x²'}
        >
          <span>{isShift ? 'x³' : 'x²'}</span>
        </button>

        <button
          onClick={() => onInsert('^')}
          className={fnKey}
          title="x to the power y"
        >
          <span>xʸ</span>
        </button>

        <button
          onClick={() => onInsert(isShift ? 'cbrt(' : 'sqrt(')}
          className={fnKey}
          title={isShift ? 'Cube root' : 'Square root'}
        >
          <span>{isShift ? '∛x' : '√x'}</span>
        </button>

        <button
          onClick={() => onInsert('1/(')}
          className={fnKey}
          title="Reciprocal 1/x"
        >
          <span>1/x</span>
        </button>

        <button
          onClick={() => onInsert(isShift ? 'fact(' : '!')}
          className={fnKey}
          title="Factorial n!"
        >
          <span>{isShift ? 'n!' : 'x!'}</span>
        </button>

        <button onClick={onBackspace} className={`${opKey} hidden sm:flex`} title="Backspace">
          DEL
        </button>

        {/* Row 3 */}
        <button onClick={() => onInsert('(')} className={fnKey}>
          (
        </button>
        <button onClick={() => onInsert(')')} className={fnKey}>
          )
        </button>
        <button
          onClick={() => onInsert(isShift ? 'nPr(' : 'nCr(')}
          className={fnKey}
          title={isShift ? 'Permutations nPr' : 'Combinations nCr'}
        >
          <span>{isShift ? 'nPr' : 'nCr'}</span>
        </button>
        <button onClick={() => onInsert('pi')} className={fnKey} title="Archimedes constant π">
          π
        </button>
        <button onClick={() => onInsert('e')} className={fnKey} title="Euler's number e">
          e
        </button>
        <button onClick={() => onInsert(' / ')} className={opKey} title="Divide">
          ÷
        </button>

        {/* Numbers & Arithmetic: Row 4 */}
        <button onClick={() => onInsert('7')} className={numKey}>
          7
        </button>
        <button onClick={() => onInsert('8')} className={numKey}>
          8
        </button>
        <button onClick={() => onInsert('9')} className={numKey}>
          9
        </button>
        <button onClick={() => onInsert(' * ')} className={opKey} title="Multiply">
          ×
        </button>
        <button onClick={onClear} className={`${dangerKey} sm:hidden`}>
          AC
        </button>
        <button onClick={() => onInsert(' % ')} className={`${fnKey} hidden sm:flex`} title="Modulo">
          mod
        </button>

        {/* Row 5 */}
        <button onClick={() => onInsert('4')} className={numKey}>
          4
        </button>
        <button onClick={() => onInsert('5')} className={numKey}>
          5
        </button>
        <button onClick={() => onInsert('6')} className={numKey}>
          6
        </button>
        <button onClick={() => onInsert(' - ')} className={opKey} title="Subtract">
          −
        </button>
        <button onClick={onBackspace} className={`${opKey} sm:hidden`}>
          DEL
        </button>
        <button onClick={() => onInsert(' * 10^(')} className={`${fnKey} hidden sm:flex`} title="Scientific exponent ×10^x">
          EE
        </button>

        {/* Row 6 */}
        <button onClick={() => onInsert('1')} className={numKey}>
          1
        </button>
        <button onClick={() => onInsert('2')} className={numKey}>
          2
        </button>
        <button onClick={() => onInsert('3')} className={numKey}>
          3
        </button>
        <button onClick={() => onInsert(' + ')} className={opKey} title="Add">
          +
        </button>
        <button onClick={() => onInsert('ans')} className={`${fnKey} sm:hidden`} title="Previous Answer">
          Ans
        </button>
        <button onClick={() => onInsert('ans')} className={`${fnKey} hidden sm:flex`} title="Previous Answer">
          Ans
        </button>

        {/* Row 7 */}
        <button onClick={() => onInsert('0')} className={numKey}>
          0
        </button>
        <button onClick={() => onInsert('.')} className={numKey}>
          .
        </button>
        <button
          onClick={() => onInsert('(-1)*')}
          className={numKey}
          title="Negate sign ±"
        >
          ±
        </button>
        <button onClick={onCalculate} className={`${accentKey} col-span-2 sm:col-span-3`} title="Calculate result (Enter)">
          =
        </button>
      </div>
    </div>
  );
};
