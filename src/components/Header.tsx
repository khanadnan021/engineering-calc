import React from 'react';
import { CalculatorMode, AngleMode, DisplayNotation } from '../types/calculator';
import { 
  Calculator, 
  Cpu, 
  Binary, 
  LineChart, 
  Grid3X3, 
  Atom, 
  Wrench, 
  ArrowRightLeft, 
  History, 
  Bookmark, 
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  notation: DisplayNotation;
  onToggleNotation: () => void;
  onOpenConstants: () => void;
  onOpenHistory: () => void;
  onOpenMemory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  angleMode,
  onToggleAngleMode,
  notation,
  onToggleNotation,
  onOpenConstants,
  onOpenHistory,
  onOpenMemory,
  historyCount,
}) => {
  const modes: { id: CalculatorMode; label: string; icon: React.ReactNode }[] = [
    { id: 'scientific', label: 'Scientific', icon: <Calculator className="w-3.5 h-3.5" /> },
    { id: 'engineering', label: 'Engineering', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'programmer', label: 'Base-N', icon: <Binary className="w-3.5 h-3.5" /> },
    { id: 'grapher', label: 'Calculus & Graph', icon: <LineChart className="w-3.5 h-3.5" /> },
    { id: 'matrix', label: 'Matrix', icon: <Grid3X3 className="w-3.5 h-3.5" /> },
    { id: 'complex', label: 'Complex ℂ', icon: <Atom className="w-3.5 h-3.5" /> },
    { id: 'solvers', label: 'Solvers', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'converter', label: 'Units', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="flex items-center justify-between px-4 lg:px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Zone 1: Single text wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Calculator className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">
          OmniCalc Pro
        </span>
      </div>

      {/* Zone 2: Navigation Links / Segmented Mode Switcher */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800/80">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Quick Action Buttons & Telemetry toggles */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Angle mode quick toggle */}
        <button
          onClick={onToggleAngleMode}
          title="Toggle Angle Unit: Degrees, Radians, Gradians"
          className="px-2 py-1 text-xs font-mono font-medium rounded border border-slate-700 bg-slate-800/80 text-cyan-400 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {angleMode}
        </button>

        {/* Notation quick toggle */}
        <button
          onClick={onToggleNotation}
          title="Toggle Display Notation: Normal, Scientific, Engineering"
          className="px-2 py-1 text-xs font-mono font-medium rounded border border-slate-700 bg-slate-800/80 text-amber-400 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {notation}
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Physical Constants Button */}
        <button
          onClick={onOpenConstants}
          title="Physical & Mathematical Constants Library"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Constants</span>
        </button>

        {/* Memory Registers Button */}
        <button
          onClick={onOpenMemory}
          title="Inspect & Store Memory Registers"
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Memory</span>
        </button>

        {/* Calculation History Tape */}
        <button
          onClick={onOpenHistory}
          title="Calculation History Tape"
          className="relative flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="text-[10px] font-mono px-1 rounded bg-slate-700 text-slate-300">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
