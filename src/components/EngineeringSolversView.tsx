import React, { useState } from 'react';
import { ENGINEERING_SOLVERS, SolverDefinition } from '../utils/engineeringSolvers';
import { Cpu, Cog, Flame, Copy, Check } from 'lucide-react';

interface EngineeringSolversViewProps {
  onInsertResultToCalc?: (val: string) => void;
}

export const EngineeringSolversView: React.FC<EngineeringSolversViewProps> = ({
  onInsertResultToCalc,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSolverId, setActiveSolverId] = useState<string>(ENGINEERING_SOLVERS[0].id);
  const [inputValues, setInputValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    ENGINEERING_SOLVERS[0].fields.forEach((f) => {
      init[f.id] = f.defaultValue;
    });
    return init;
  });
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const activeSolver =
    ENGINEERING_SOLVERS.find((s) => s.id === activeSolverId) || ENGINEERING_SOLVERS[0];

  const handleSelectSolver = (solver: SolverDefinition) => {
    setActiveSolverId(solver.id);
    const newInputs: Record<string, number> = {};
    solver.fields.forEach((f) => {
      newInputs[f.id] = f.defaultValue;
    });
    setInputValues(newInputs);
  };

  const handleInputChange = (fieldId: string, val: number) => {
    setInputValues((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const copyVal = (val: string | number, label: string) => {
    navigator.clipboard.writeText(String(val));
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 1500);
  };

  // Run solver calculation
  const computed = activeSolver.calculate(inputValues);

  const filteredSolvers =
    selectedCategory === 'All'
      ? ENGINEERING_SOLVERS
      : ENGINEERING_SOLVERS.filter((s) => s.category === selectedCategory);

  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      {/* Solvers Sidebar / Selector */}
      <div className="w-full md:w-72 shrink-0 flex flex-col gap-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {['All', 'Electrical', 'Mechanical', 'Fluids & Thermal'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 py-1 px-1.5 rounded font-medium transition-colors cursor-pointer truncate ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'Fluids & Thermal' ? 'Fluids' : cat}
            </button>
          ))}
        </div>

        {/* Solver list */}
        <div className="flex flex-col gap-1 max-h-[460px] overflow-y-auto pr-1">
          {filteredSolvers.map((solver) => {
            const isSelected = solver.id === activeSolverId;
            return (
              <button
                key={solver.id}
                onClick={() => handleSelectSolver(solver)}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-xs'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  {solver.category === 'Electrical' && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                  {solver.category === 'Mechanical' && <Cog className="w-3.5 h-3.5 text-amber-400" />}
                  {solver.category === 'Fluids & Thermal' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                  <span>{solver.title}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 truncate w-full mt-0.5">
                  {solver.formula}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Solver Workspace */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col gap-4">
        {/* Title & Formula Header */}
        <div className="pb-3 border-b border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">{activeSolver.title}</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {activeSolver.category}
            </span>
          </div>
          <div className="font-mono text-xs text-cyan-300 bg-slate-950/70 p-2 rounded border border-slate-800/80">
            {activeSolver.formula}
          </div>
          <p className="text-xs text-slate-400 mt-1">{activeSolver.description}</p>
        </div>

        {/* Input Parameters Form */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
            Input Variables:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeSolver.fields.map((field) => (
              <div key={field.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{field.label}</span>
                  <span className="font-mono text-slate-500 text-[11px]">{field.unit}</span>
                </div>
                <input
                  type="number"
                  value={inputValues[field.id] ?? field.defaultValue}
                  onChange={(e) => handleInputChange(field.id, parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-2.5 font-mono text-sm bg-slate-900 border border-slate-800 rounded text-white focus:outline-none focus:border-cyan-500/50"
                />
                <span className="text-[10px] text-slate-500 mt-1 block truncate">
                  {field.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Computed Outputs */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
            Computed Engineering Solutions:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {computed.results.map((res, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{res.label}</span>
                  <button
                    onClick={() => copyVal(res.value, res.label)}
                    className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-400 cursor-pointer"
                  >
                    {copiedLabel === res.label ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedLabel === res.label ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="font-mono text-xl font-bold text-white tracking-tight flex items-baseline gap-1.5 my-1">
                  <span>{res.value}</span>
                  {res.unit && <span className="text-xs text-slate-400 font-normal">{res.unit}</span>}
                </div>

                {res.note && (
                  <span className="text-[11px] font-mono text-cyan-300/80 mt-0.5">
                    ≈ {res.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
