import React, { useState } from 'react';
import * as math from 'mathjs';
import { Copy, RefreshCw } from 'lucide-react';

export const MatrixCalculator: React.FC = () => {
  const [dim, setDim] = useState<number>(3);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [1, 2, 3],
    [0, 1, 4],
    [5, 6, 0],
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [2, 0, -1],
    [1, 3, 2],
    [0, -2, 1],
  ]);
  const [scalarK, setScalarK] = useState<number>(2);

  const [resultMatrix, setResultMatrix] = useState<number[][] | null>(null);
  const [scalarResult, setScalarResult] = useState<{ label: string; value: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resize matrices when dim changes
  const handleDimChange = (newDim: number) => {
    setDim(newDim);
    const newA: number[][] = [];
    const newB: number[][] = [];
    for (let i = 0; i < newDim; i++) {
      newA[i] = [];
      newB[i] = [];
      for (let j = 0; j < newDim; j++) {
        newA[i][j] = matrixA[i]?.[j] ?? (i === j ? 1 : 0);
        newB[i][j] = matrixB[i]?.[j] ?? (i === j ? 1 : 0);
      }
    }
    setMatrixA(newA);
    setMatrixB(newB);
    setResultMatrix(null);
    setScalarResult(null);
    setErrorMsg(null);
  };

  const updateCell = (target: 'A' | 'B', row: number, col: number, val: number) => {
    if (target === 'A') {
      const next = matrixA.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? val : c))
      );
      setMatrixA(next);
    } else {
      const next = matrixB.map((r, rIdx) =>
        r.map((c, cIdx) => (rIdx === row && cIdx === col ? val : c))
      );
      setMatrixB(next);
    }
  };

  const clearOutputs = () => {
    setResultMatrix(null);
    setScalarResult(null);
    setErrorMsg(null);
  };

  // Matrix operations using mathjs
  const handleAdd = () => {
    clearOutputs();
    try {
      const res = math.add(matrixA, matrixB) as number[][];
      setResultMatrix(res);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleSub = () => {
    clearOutputs();
    try {
      const res = math.subtract(matrixA, matrixB) as number[][];
      setResultMatrix(res);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleMultiply = () => {
    clearOutputs();
    try {
      const res = math.multiply(matrixA, matrixB) as number[][];
      setResultMatrix(res);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDetA = () => {
    clearOutputs();
    try {
      const d = math.det(matrixA);
      setScalarResult({ label: 'det(A)', value: Number(d.toFixed(6)) });
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleInverseA = () => {
    clearOutputs();
    try {
      const inv = math.inv(matrixA) as number[][];
      // Round small precision float artifacts
      const cleaned = inv.map(r => r.map(c => Number(c.toFixed(6))));
      setResultMatrix(cleaned);
    } catch (err: any) {
      setErrorMsg(err.message || 'Matrix is singular (det = 0), cannot invert');
    }
  };

  const handleTransposeA = () => {
    clearOutputs();
    try {
      const t = math.transpose(matrixA) as number[][];
      setResultMatrix(t);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleTraceA = () => {
    clearOutputs();
    let sum = 0;
    for (let i = 0; i < dim; i++) {
      sum += matrixA[i][i];
    }
    setScalarResult({ label: 'Trace(A)', value: sum });
  };

  const handleScalarMultA = () => {
    clearOutputs();
    try {
      const res = math.multiply(matrixA, scalarK) as number[][];
      setResultMatrix(res);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleSquareA = () => {
    clearOutputs();
    try {
      const res = math.multiply(matrixA, matrixA) as number[][];
      setResultMatrix(res);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleSetIdentity = (target: 'A' | 'B') => {
    const next: number[][] = [];
    for (let i = 0; i < dim; i++) {
      next[i] = [];
      for (let j = 0; j < dim; j++) {
        next[i][j] = i === j ? 1 : 0;
      }
    }
    if (target === 'A') setMatrixA(next);
    else setMatrixB(next);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top bar: dimension picker & presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 font-semibold uppercase">Matrix Dimension:</span>
          {[2, 3, 4].map((d) => (
            <button
              key={d}
              onClick={() => handleDimChange(d)}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                dim === d
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {d} × {d}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSetIdentity('A')}
            className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Reset A (Identity)
          </button>
          <button
            onClick={() => handleSetIdentity('B')}
            className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Reset B (Identity)
          </button>
        </div>
      </div>

      {/* Matrices A and B side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Matrix A */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-cyan-400 font-mono">Matrix [A] ({dim}×{dim})</span>
          </div>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
          >
            {matrixA.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`a-${r}-${c}`}
                  type="number"
                  value={val}
                  onChange={(e) => updateCell('A', r, c, parseFloat(e.target.value) || 0)}
                  className="h-10 text-center font-mono text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-cyan-500/50"
                />
              ))
            )}
          </div>
        </div>

        {/* Matrix B */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 font-mono">Matrix [B] ({dim}×{dim})</span>
          </div>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${dim}, minmax(0, 1fr))` }}
          >
            {matrixB.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`b-${r}-${c}`}
                  type="number"
                  value={val}
                  onChange={(e) => updateCell('B', r, c, parseFloat(e.target.value) || 0)}
                  className="h-10 text-center font-mono text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500/50"
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Operations Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2.5">
        <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Matrix Operations:</span>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2">
          <button
            onClick={handleAdd}
            className="h-9 px-2 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            A + B
          </button>
          <button
            onClick={handleSub}
            className="h-9 px-2 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            A − B
          </button>
          <button
            onClick={handleMultiply}
            className="h-9 px-2 rounded bg-cyan-950/40 text-xs font-mono font-semibold text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900/60 cursor-pointer"
          >
            A × B
          </button>
          <button
            onClick={handleDetA}
            className="h-9 px-2 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            det(A)
          </button>
          <button
            onClick={handleInverseA}
            className="h-9 px-2 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            A⁻¹
          </button>
          <button
            onClick={handleTransposeA}
            className="h-9 px-2 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            Aᵀ
          </button>
          <button
            onClick={handleTraceA}
            className="h-9 px-2 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            Tr(A)
          </button>
          <button
            onClick={handleSquareA}
            className="h-9 px-2 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            A²
          </button>
        </div>

        {/* Scalar multiplication */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-mono text-slate-400">Scalar k:</span>
          <input
            type="number"
            value={scalarK}
            onChange={(e) => setScalarK(parseFloat(e.target.value) || 0)}
            className="w-16 h-8 text-center font-mono text-xs bg-slate-950 border border-slate-800 rounded text-white"
          />
          <button
            onClick={handleScalarMultA}
            className="h-8 px-3 rounded bg-slate-800 text-xs font-mono font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            Calculate k · A
          </button>
        </div>
      </div>

      {/* Result Display */}
      {(resultMatrix || scalarResult || errorMsg) && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-4 shadow-xl flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-cyan-400 font-mono">Calculation Output:</span>
            {resultMatrix && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMatrixA(resultMatrix)}
                  className="text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  Store into [A]
                </button>
                <span>·</span>
                <button
                  onClick={() => setMatrixB(resultMatrix)}
                  className="text-xs font-mono text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  Store into [B]
                </button>
              </div>
            )}
          </div>

          {errorMsg ? (
            <div className="text-rose-400 font-mono text-sm py-2">✖ Error: {errorMsg}</div>
          ) : scalarResult ? (
            <div className="font-mono text-xl text-white py-2">
              <span className="text-cyan-400">{scalarResult.label}</span> ={' '}
              <strong className="text-emerald-400">{scalarResult.value}</strong>
            </div>
          ) : resultMatrix ? (
            <div
              className="grid gap-2 max-w-md mx-auto py-2"
              style={{ gridTemplateColumns: `repeat(${resultMatrix[0].length}, minmax(0, 1fr))` }}
            >
              {resultMatrix.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`res-${r}-${c}`}
                    className="h-10 flex items-center justify-center font-mono text-sm font-bold bg-slate-950/80 border border-cyan-500/20 rounded-md text-cyan-200"
                  >
                    {val}
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
