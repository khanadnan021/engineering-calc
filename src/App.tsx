/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AngleMode,
  DisplayNotation,
  CalculatorMode,
  HistoryItem,
  MemoryRegisters,
  MemoryRegisterKey,
} from './types/calculator';
import { evaluateExpression, formatEngineering } from './utils/mathEngine';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { ScientificKeypad } from './components/ScientificKeypad';
import { ProgrammerKeypad } from './components/ProgrammerKeypad';
import { Grapher } from './components/Grapher';
import { MatrixCalculator } from './components/MatrixCalculator';
import { ComplexCalculator } from './components/ComplexCalculator';
import { EngineeringSolversView } from './components/EngineeringSolversView';
import { UnitConverterView } from './components/UnitConverterView';
import { ConstantsDrawer } from './components/ConstantsDrawer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MemoryModal } from './components/MemoryModal';
import { 
  Calculator, 
  Cpu, 
  Binary, 
  LineChart, 
  Grid3X3, 
  Atom, 
  Wrench, 
  ArrowRightLeft,
  Sparkles,
  BookOpen,
  History as HistoryIcon,
  Bookmark
} from 'lucide-react';

const INITIAL_REGISTERS: MemoryRegisters = {
  M: 0,
  ANS: 0,
  A: 0,
  B: 0,
  C: 0,
  D: 0,
  X: 0,
  Y: 0,
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<CalculatorMode>('scientific');
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [numericResult, setNumericResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [notation, setNotation] = useState<DisplayNotation>('NORMAL');
  const [exponentShift, setExponentShift] = useState<number>(0);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('omnica_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [registers, setRegisters] = useState<MemoryRegisters>(() => {
    try {
      const saved = localStorage.getItem('omnica_registers');
      return saved ? JSON.parse(saved) : INITIAL_REGISTERS;
    } catch {
      return INITIAL_REGISTERS;
    }
  });

  // Modal / Drawer visibility
  const [isConstantsOpen, setIsConstantsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);

  // Derived display details
  const [siPrefix, setSiPrefix] = useState<string | undefined>(undefined);
  const [fractionEq, setFractionEq] = useState<string | undefined>(undefined);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('omnica_history', JSON.stringify(history.slice(0, 50)));
    } catch {}
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('omnica_registers', JSON.stringify(registers));
    } catch {}
  }, [registers]);

  // Main evaluation trigger
  const calculateResult = useCallback(() => {
    if (!expression.trim()) return;

    try {
      const evalRes = evaluateExpression(
        expression,
        angleMode,
        notation,
        exponentShift,
        registers
      );

      setResult(evalRes.formatted);
      setNumericResult(evalRes.numericValue);
      setSiPrefix(evalRes.siPrefixString);
      setFractionEq(evalRes.fractionString);
      setError(null);

      // Save to ANS register
      if (evalRes.numericValue !== null) {
        setRegisters((prev) => ({ ...prev, ANS: evalRes.numericValue! }));
      }

      // Add to history
      const newItem: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: Date.now(),
        expression,
        result: evalRes.formatted,
        angleMode,
        notation,
      };

      setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
    } catch (err: any) {
      setError(err.message || 'Syntax Error');
      setNumericResult(null);
    }
  }, [expression, angleMode, notation, exponentShift, registers]);

  // Live evaluation preview as user types
  useEffect(() => {
    if (!expression.trim()) {
      setResult('');
      setNumericResult(null);
      setError(null);
      setSiPrefix(undefined);
      setFractionEq(undefined);
      return;
    }

    try {
      const evalRes = evaluateExpression(
        expression,
        angleMode,
        notation,
        exponentShift,
        registers
      );
      setResult(evalRes.formatted);
      setNumericResult(evalRes.numericValue);
      setSiPrefix(evalRes.siPrefixString);
      setFractionEq(evalRes.fractionString);
      setError(null);
    } catch {
      // In live preview, don't scream error while user is in mid-expression
    }
  }, [expression, angleMode, notation, exponentShift, registers]);

  // Input manipulation
  const handleInsert = (token: string) => {
    setExpression((prev) => prev + token);
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
    setNumericResult(null);
    setError(null);
    setExponentShift(0);
    setSiPrefix(undefined);
    setFractionEq(undefined);
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  // Toggles
  const handleToggleAngleMode = () => {
    setAngleMode((prev) => {
      if (prev === 'DEG') return 'RAD';
      if (prev === 'RAD') return 'GRAD';
      return 'DEG';
    });
  };

  const handleToggleNotation = () => {
    setNotation((prev) => {
      if (prev === 'NORMAL') return 'SCI';
      if (prev === 'SCI') return 'ENG';
      return 'NORMAL';
    });
  };

  const handleShiftEngExponent = (delta: number) => {
    setExponentShift((prev) => prev + delta);
    setNotation('ENG');
  };

  // Memory Actions
  const handleMemoryAction = (action: 'MC' | 'MR' | 'M+' | 'M-' | 'MS') => {
    switch (action) {
      case 'MC':
        setRegisters((prev) => ({ ...prev, M: 0 }));
        break;
      case 'MR':
        setExpression((prev) => prev + registers.M.toString());
        break;
      case 'M+':
        if (numericResult !== null) {
          setRegisters((prev) => ({ ...prev, M: prev.M + numericResult }));
        }
        break;
      case 'M-':
        if (numericResult !== null) {
          setRegisters((prev) => ({ ...prev, M: prev.M - numericResult }));
        }
        break;
      case 'MS':
        if (numericResult !== null) {
          setRegisters((prev) => ({ ...prev, M: numericResult }));
        }
        break;
    }
  };

  const handleStoreRegister = (key: MemoryRegisterKey, val: number) => {
    setRegisters((prev) => ({ ...prev, [key]: val }));
  };

  const handleClearRegister = (key: MemoryRegisterKey) => {
    setRegisters((prev) => ({ ...prev, [key]: 0 }));
  };

  const handleClearAllRegisters = () => {
    setRegisters(INITIAL_REGISTERS);
  };

  // Mode select handler
  const handleSelectMode = (mode: CalculatorMode) => {
    setCurrentMode(mode);
    if (mode === 'engineering') {
      setNotation('ENG');
    }
  };

  // Global physical keyboard listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        handleInsert(e.key);
      } else if (e.key === '.') {
        handleInsert('.');
      } else if (e.key === '+') {
        handleInsert(' + ');
      } else if (e.key === '-') {
        handleInsert(' - ');
      } else if (e.key === '*') {
        handleInsert(' * ');
      } else if (e.key === '/') {
        handleInsert(' / ');
      } else if (e.key === '(' || e.key === ')') {
        handleInsert(e.key);
      } else if (e.key === '^') {
        handleInsert('^');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculateResult();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [calculateResult]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans bg-tech-grid">
      {/* Universal Top Bar */}
      <Header
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
        angleMode={angleMode}
        onToggleAngleMode={handleToggleAngleMode}
        notation={notation}
        onToggleNotation={handleToggleNotation}
        onOpenConstants={() => setIsConstantsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMemory={() => setIsMemoryOpen(true)}
        historyCount={history.length}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-4 lg:p-6 flex flex-col gap-4">
        {/* Mobile & Tablet Mode Tabs */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto pb-1.5 text-xs">
          {[
            { id: 'scientific', label: 'Scientific' },
            { id: 'engineering', label: 'Engineering' },
            { id: 'programmer', label: 'Base-N' },
            { id: 'grapher', label: 'Calculus & Graph' },
            { id: 'matrix', label: 'Matrix' },
            { id: 'complex', label: 'Complex ℂ' },
            { id: 'solvers', label: 'Solvers' },
            { id: 'converter', label: 'Units' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelectMode(tab.id as CalculatorMode)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                currentMode === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Mode Content */}
        {currentMode === 'scientific' || currentMode === 'engineering' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Primary Calculator Station */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              {/* Display Component */}
              <Display
                expression={expression}
                onExpressionChange={setExpression}
                result={result}
                numericResult={numericResult}
                error={error}
                angleMode={angleMode}
                notation={notation}
                hasMemory={registers.M !== 0}
                siPrefix={siPrefix}
                fractionEquivalent={fractionEq}
                onClear={handleClear}
                onBackspace={handleBackspace}
                onSubmit={calculateResult}
              />

              {/* Scientific Keypad */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-xl">
                <ScientificKeypad
                  onInsert={handleInsert}
                  onClear={handleClear}
                  onBackspace={handleBackspace}
                  onCalculate={calculateResult}
                  angleMode={angleMode}
                  onToggleAngleMode={handleToggleAngleMode}
                  notation={notation}
                  onToggleNotation={handleToggleNotation}
                  onShiftEngExponent={handleShiftEngExponent}
                  onMemoryAction={handleMemoryAction}
                  ansValue={registers.ANS}
                />
              </div>
            </div>

            {/* Desktop Side Telemetry & Quick Drawer */}
            <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
              {/* Engineering Quick SI Metric Scale */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    SI Metric Scale
                  </span>
                  <span className="text-[10px] text-cyan-400">Power of 10³</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { p: 'T (tera)', exp: '10¹²' },
                    { p: 'G (giga)', exp: '10⁹' },
                    { p: 'M (mega)', exp: '10⁶' },
                    { p: 'k (kilo)', exp: '10³' },
                    { p: 'm (milli)', exp: '10⁻³' },
                    { p: 'µ (micro)', exp: '10⁻⁶' },
                    { p: 'n (nano)', exp: '10⁻⁹' },
                    { p: 'p (pico)', exp: '10⁻¹²' },
                    { p: 'f (femto)', exp: '10⁻¹⁵' },
                  ].map((si) => (
                    <button
                      key={si.p}
                      onClick={() => handleInsert(si.exp.replace('10¹²', '*1e12').replace('10⁹', '*1e9').replace('10⁶', '*1e6').replace('10³', '*1e3').replace('10⁻³', '*1e-3').replace('10⁻⁶', '*1e-6').replace('10⁻⁹', '*1e-9').replace('10⁻¹²', '*1e-12').replace('10⁻¹⁵', '*1e-15'))}
                      className="p-1 rounded bg-slate-950 border border-slate-800 text-left hover:border-cyan-500/40 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      <div className="font-semibold text-slate-200">{si.p}</div>
                      <div className="text-[10px] text-slate-500">{si.exp}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick History Reel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2 font-mono text-xs max-h-72 overflow-hidden">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Tape Stream
                  </span>
                  <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    View All ({history.length})
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
                  {history.length === 0 ? (
                    <div className="text-slate-500 text-[11px] py-4 text-center">
                      No calculations yet
                    </div>
                  ) : (
                    history.slice(0, 5).map((h) => (
                      <div
                        key={h.id}
                        onClick={() => setExpression(h.expression)}
                        className="bg-slate-950 p-2 rounded border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
                      >
                        <div className="text-[10px] text-slate-500 truncate">{h.expression}</div>
                        <div className="text-xs font-bold text-emerald-400 text-right truncate">
                          = {h.result}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Quick Constants Access */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2 font-mono text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                    Key Physics Constants
                  </span>
                  <button
                    onClick={() => setIsConstantsOpen(true)}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Full Library
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { sym: 'c', val: '2.998e8 m/s', name: 'Light' },
                    { sym: 'h', val: '6.626e-34 J·s', name: 'Planck' },
                    { sym: 'G', val: '6.674e-11 N·m²/kg²', name: 'Grav' },
                    { sym: 'k_B', val: '1.381e-23 J/K', name: 'Boltzmann' },
                  ].map((item) => (
                    <button
                      key={item.sym}
                      onClick={() => handleInsert(item.sym)}
                      className="p-1.5 rounded bg-slate-950 border border-slate-800 text-left hover:border-cyan-500/40 transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-cyan-400">{item.sym}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : currentMode === 'programmer' ? (
          <ProgrammerKeypad onInsertToMain={handleInsert} />
        ) : currentMode === 'grapher' ? (
          <Grapher angleMode={angleMode} />
        ) : currentMode === 'matrix' ? (
          <MatrixCalculator />
        ) : currentMode === 'complex' ? (
          <ComplexCalculator angleMode={angleMode} />
        ) : currentMode === 'solvers' ? (
          <EngineeringSolversView onInsertResultToCalc={handleInsert} />
        ) : currentMode === 'converter' ? (
          <UnitConverterView />
        ) : null}
      </main>

      {/* Slide-over Constants Drawer */}
      <ConstantsDrawer
        isOpen={isConstantsOpen}
        onClose={() => setIsConstantsOpen(false)}
        onInsertConstant={handleInsert}
      />

      {/* Slide-over History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
        onSelectExpression={(expr) => setExpression(expr)}
        onSelectResult={(res) => setExpression((prev) => prev + res)}
      />

      {/* Memory Modal */}
      <MemoryModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        registers={registers}
        currentResult={numericResult}
        onStoreToRegister={handleStoreRegister}
        onRecallRegister={(key) => handleInsert(registers[key].toString())}
        onClearRegister={handleClearRegister}
        onClearAllRegisters={handleClearAllRegisters}
      />
    </div>
  );
}
