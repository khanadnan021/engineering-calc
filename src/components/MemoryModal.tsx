import React from 'react';
import { MemoryRegisters, MemoryRegisterKey } from '../types/calculator';
import { X, CornerDownLeft, RotateCcw, Check, Copy } from 'lucide-react';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  registers: MemoryRegisters;
  currentResult: number | null;
  onStoreToRegister: (key: MemoryRegisterKey, val: number) => void;
  onRecallRegister: (key: MemoryRegisterKey) => void;
  onClearRegister: (key: MemoryRegisterKey) => void;
  onClearAllRegisters: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  registers,
  currentResult,
  onStoreToRegister,
  onRecallRegister,
  onClearRegister,
  onClearAllRegisters,
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const registerKeys: MemoryRegisterKey[] = ['M', 'ANS', 'A', 'B', 'C', 'D', 'X', 'Y'];

  const handleCopy = (key: string, val: number) => {
    navigator.clipboard.writeText(String(val));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Memory Registers</h2>
            <p className="text-xs text-slate-400">Variable storage slots & accumulator</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global actions */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">
            Active Result: <strong className="text-cyan-400">{currentResult ?? '—'}</strong>
          </span>
          <button
            onClick={onClearAllRegisters}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>

        {/* Registers Grid */}
        <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
          {registerKeys.map((key) => {
            const val = registers[key] ?? 0;
            const hasVal = val !== 0;

            return (
              <div
                key={key}
                className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between font-mono text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 flex items-center justify-center rounded bg-slate-900 border border-slate-800 font-bold text-amber-400 text-xs">
                    {key}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-white">{val}</span>
                    <span className="text-[10px] text-slate-500">
                      {key === 'M' ? 'Accumulator' : key === 'ANS' ? 'Previous Answer' : `Variable ${key}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(key, val)}
                    title="Copy value"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {copiedKey === key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Store button */}
                  {currentResult !== null && (
                    <button
                      onClick={() => onStoreToRegister(key, currentResult)}
                      title={`Store active result (${currentResult}) into register ${key}`}
                      className="px-2 py-1 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      STO
                    </button>
                  )}

                  {/* Recall button */}
                  <button
                    onClick={() => {
                      onRecallRegister(key);
                      onClose();
                    }}
                    title={`Insert register ${key} into expression`}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>RCL</span>
                  </button>

                  {/* Clear button */}
                  {hasVal && (
                    <button
                      onClick={() => onClearRegister(key)}
                      title="Clear register"
                      className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
