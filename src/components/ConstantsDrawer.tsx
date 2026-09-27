import React, { useState } from 'react';
import { PHYSICAL_CONSTANTS } from '../utils/constants';
import { PhysicalConstant } from '../types/calculator';
import { X, Search, Copy, Check, CornerDownLeft } from 'lucide-react';

interface ConstantsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertConstant: (symbol: string) => void;
}

export const ConstantsDrawer: React.FC<ConstantsDrawerProps> = ({
  isOpen,
  onClose,
  onInsertConstant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Universal', 'Atomic', 'Phys-Chem', 'Math', 'Astrophysics'];

  const filtered = PHYSICAL_CONSTANTS.filter((c) => {
    const matchesCat = selectedCat === 'All' || c.category === selectedCat;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyVal = (c: PhysicalConstant) => {
    navigator.clipboard.writeText(String(c.value));
    setCopiedSymbol(c.symbol);
    setTimeout(() => setCopiedSymbol(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-4 sm:p-5 overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Constants Library</h2>
            <p className="text-xs text-slate-400">CODATA & Mathematical fundamental constants</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-2 my-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search constants (e.g. speed of light, c, h, pi)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Constant Cards List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-slate-500">
              No constants matching "{searchTerm}"
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.symbol}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {c.symbol}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyVal(c)}
                      title="Copy numeric value"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedSymbol === c.symbol ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        onInsertConstant(c.symbol);
                        onClose();
                      }}
                      title="Insert symbol into expression"
                      className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <CornerDownLeft className="w-3 h-3" />
                      <span>Insert</span>
                    </button>
                  </div>
                </div>

                <div className="font-mono text-xs text-white tracking-wider flex items-baseline gap-1.5">
                  <span className="font-bold text-emerald-400">{c.value.toExponential(8)}</span>
                  <span className="text-[11px] text-slate-400">{c.unit}</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  {c.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
