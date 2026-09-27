import React, { useState } from 'react';
import { UNIT_CATEGORIES, convertUnits } from '../utils/unitConverter';
import { ArrowRightLeft, Copy, Check } from 'lucide-react';

export const UnitConverterView: React.FC = () => {
  const [selectedCatId, setSelectedCatId] = useState<string>('length');
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [copied, setCopied] = useState(false);

  const activeCategory =
    UNIT_CATEGORIES.find((c) => c.id === selectedCatId) || UNIT_CATEGORIES[0];

  const handleCategoryChange = (catId: string) => {
    setSelectedCatId(catId);
    const cat = UNIT_CATEGORIES.find((c) => c.id === catId) || UNIT_CATEGORIES[0];
    setFromUnit(cat.units[0].symbol);
    setToUnit(cat.units[1]?.symbol || cat.units[0].symbol);
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const convertedValue = convertUnits(activeCategory, inputValue, fromUnit, toUnit);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(convertedValue));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCatId === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Conversion Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* FROM side */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase font-semibold">From Unit:</span>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              className="w-full h-11 px-3 font-mono text-xl font-bold bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full h-9 px-2 font-mono text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              {activeCategory.units.map((u) => (
                <option key={u.symbol} value={u.symbol}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* SWAP button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 shadow-sm active:scale-95 cursor-pointer"
              title="Swap units"
            >
              <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
            </button>
          </div>

          {/* TO side */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="uppercase font-semibold text-emerald-400">Converted Output:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="w-full h-11 px-3 font-mono text-xl font-bold bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 flex items-center overflow-x-auto truncate">
              {Number(convertedValue.toPrecision(8))}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full h-9 px-2 font-mono text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              {activeCategory.units.map((u) => (
                <option key={u.symbol} value={u.symbol}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Category Equivalents Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-2">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Instant Equivalents for {inputValue} {fromUnit}:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
          {activeCategory.units.map((u) => {
            const val = convertUnits(activeCategory, inputValue, fromUnit, u.symbol);
            return (
              <div
                key={u.symbol}
                onClick={() => setToUnit(u.symbol)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                  toUnit === u.symbol
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="text-[11px] text-slate-500 truncate">{u.name}</div>
                <div className="font-mono text-sm font-semibold truncate text-white mt-0.5">
                  {Number(val.toPrecision(6))} <span className="text-xs font-normal text-slate-400">{u.symbol}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
