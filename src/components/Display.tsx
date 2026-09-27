import React, { useRef, useEffect } from 'react';
import { AngleMode, DisplayNotation } from '../types/calculator';
import { Copy, Check, Delete, RotateCcw } from 'lucide-react';

interface DisplayProps {
  expression: string;
  onExpressionChange: (val: string) => void;
  result: string;
  numericResult: number | null;
  error: string | null;
  angleMode: AngleMode;
  notation: DisplayNotation;
  hasMemory: boolean;
  siPrefix?: string;
  fractionEquivalent?: string;
  onClear: () => void;
  onBackspace: () => void;
  onSubmit: () => void;
  cursorPos?: number;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  onExpressionChange,
  result,
  numericResult,
  error,
  angleMode,
  notation,
  hasMemory,
  siPrefix,
  fractionEquivalent,
  onClear,
  onBackspace,
  onSubmit,
}) => {
  const [copied, setCopied] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    const textToCopy = error ? expression : result || expression;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    // Keep input focused or auto-scroll end
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [expression]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClear();
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Top telemetry ribbon */}
      <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-2 font-mono">
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400 text-[11px] font-semibold">
            {angleMode}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400 text-[11px] font-semibold">
            {notation}
          </span>
          {hasMemory && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-semibold">
              M
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            title="Clear all (Esc)"
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onBackspace}
            title="Backspace (Delete)"
            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Delete className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            title="Copy result to clipboard"
            className="flex items-center gap-1 px-1.5 py-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer ml-1"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="text-[10px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Expression input line */}
      <div className="w-full relative my-1">
        <input
          ref={inputRef}
          type="text"
          value={expression}
          onChange={(e) => onExpressionChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="0"
          spellCheck={false}
          className="w-full bg-transparent text-right font-mono text-base sm:text-lg text-slate-300 placeholder-slate-600 focus:outline-none tracking-wide select-all"
        />
      </div>

      {/* Main result readout */}
      <div className="w-full text-right mt-1.5 min-h-[44px] flex items-center justify-end overflow-x-auto overflow-y-hidden">
        {error ? (
          <div className="text-rose-400 font-mono text-sm sm:text-base font-medium flex items-center justify-end gap-1.5 animate-pulse">
            <span>✖</span>
            <span>{error}</span>
          </div>
        ) : (
          <div className="font-mono tabular-nums text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white select-all">
            {result || '0'}
          </div>
        )}
      </div>

      {/* Secondary engineering / math insights */}
      {numericResult !== null && !error && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            {siPrefix && (
              <span className="text-cyan-300">
                SI: <span className="font-semibold text-white">{siPrefix}</span>
              </span>
            )}
            {fractionEquivalent && (
              <span className="text-emerald-300">
                Frac: <span className="font-semibold text-white">{fractionEquivalent}</span>
              </span>
            )}
          </div>
          <div className="text-slate-500 text-[11px]">
            {Number.isInteger(numericResult) && numericResult >= 0 && numericResult <= 0xFFFFFFFF && (
              <span>
                HEX: 0x{numericResult.toString(16).toUpperCase()} · BIN: {numericResult.toString(2)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
