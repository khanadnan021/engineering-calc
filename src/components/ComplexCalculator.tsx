import React, { useState, useRef, useEffect } from 'react';
import * as math from 'mathjs';
import { AngleMode } from '../types/calculator';
import { toRadians, fromRadians } from '../utils/mathEngine';

interface ComplexCalculatorProps {
  angleMode: AngleMode;
}

export const ComplexCalculator: React.FC<ComplexCalculatorProps> = ({ angleMode }) => {
  const [re1, setRe1] = useState<number>(3);
  const [im1, setIm1] = useState<number>(4);
  const [re2, setRe2] = useState<number>(1);
  const [im2, setIm2] = useState<number>(-2);

  const [activeOp, setActiveOp] = useState<string>('add');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Parse complex numbers
  const z1 = math.complex(re1, im1);
  const z2 = math.complex(re2, im2);

  let zResult: math.Complex | null = null;
  let scalarResult: { label: string; value: string } | null = null;
  let errorMsg: string | null = null;

  try {
    switch (activeOp) {
      case 'add':
        zResult = math.add(z1, z2) as math.Complex;
        break;
      case 'sub':
        zResult = math.subtract(z1, z2) as math.Complex;
        break;
      case 'mul':
        zResult = math.multiply(z1, z2) as math.Complex;
        break;
      case 'div':
        if (z2.re === 0 && z2.im === 0) {
          errorMsg = 'Division by zero';
        } else {
          zResult = math.divide(z1, z2) as math.Complex;
        }
        break;
      case 'conj1':
        zResult = math.conj(z1) as math.Complex;
        break;
      case 'abs1': {
        const mag = math.abs(z1);
        scalarResult = { label: '|z₁| (Magnitude)', value: Number(mag.toFixed(6)).toString() };
        break;
      }
      case 'arg1': {
        const rad = math.arg(z1);
        const ang = fromRadians(rad, angleMode);
        scalarResult = { label: `arg(z₁) (Phase in ${angleMode})`, value: `${Number(ang.toFixed(6))}°` };
        break;
      }
      case 'sqrt1':
        zResult = math.sqrt(z1) as math.Complex;
        break;
      case 'recip1':
        zResult = math.divide(1, z1) as math.Complex;
        break;
    }
  } catch (err: any) {
    errorMsg = err.message;
  }

  // Format polar string
  const formatPolar = (z: math.Complex) => {
    const r = math.abs(z);
    const rad = math.arg(z);
    const ang = fromRadians(rad, angleMode);
    return `${Number(r.toFixed(5))} ∠ ${Number(ang.toFixed(4))}°`;
  };

  // Draw Argand diagram on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    // Determine scale based on max coordinate
    const maxVal = Math.max(
      Math.abs(re1),
      Math.abs(im1),
      Math.abs(re2),
      Math.abs(im2),
      zResult ? Math.abs(zResult.re) : 0,
      zResult ? Math.abs(zResult.im) : 0,
      5
    );
    const scale = (Math.min(w, h) * 0.4) / (maxVal * 1.15);

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Grid circles (polar grid)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const circleStep = Math.max(1, Math.round(maxVal / 4));
    for (let r = circleStep; r <= maxVal * 1.2; r += circleStep) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('Re', w - 20, cy - 6);
    ctx.fillText('Im', cx + 6, 16);

    // Vector drawing helper
    const drawVector = (x: number, y: number, color: string, label: string) => {
      const px = cx + x * scale;
      const py = cy - y * scale;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(label, px + 6, py - 4);
    };

    // Draw z1
    drawVector(re1, im1, '#06b6d4', 'z₁');

    // Draw z2 (if op uses z2)
    if (['add', 'sub', 'mul', 'div'].includes(activeOp)) {
      drawVector(re2, im2, '#f59e0b', 'z₂');
    }

    // Draw result vector
    if (zResult) {
      drawVector(zResult.re, zResult.im, '#10b981', 'Ans');
    }
  }, [re1, im1, re2, im2, zResult, activeOp]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Input Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* z1 card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-cyan-400 font-mono">Complex Number z₁ = a + bi</span>
            <span className="text-xs font-mono text-slate-400">{formatPolar(z1)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Real Part (a)</label>
              <input
                type="number"
                value={re1}
                onChange={(e) => setRe1(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 font-mono text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Imaginary Part (b)</label>
              <input
                type="number"
                value={im1}
                onChange={(e) => setIm1(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 font-mono text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>

        {/* z2 card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <span className="text-xs font-bold text-amber-400 font-mono">Complex Number z₂ = c + di</span>
            <span className="text-xs font-mono text-slate-400">{formatPolar(z2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Real Part (c)</label>
              <input
                type="number"
                value={re2}
                onChange={(e) => setRe2(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 font-mono text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Imaginary Part (d)</label>
              <input
                type="number"
                value={im2}
                onChange={(e) => setIm2(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 font-mono text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operations Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md flex flex-col gap-2">
        <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Operations:</span>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {[
            { id: 'add', label: 'z₁ + z₂' },
            { id: 'sub', label: 'z₁ − z₂' },
            { id: 'mul', label: 'z₁ × z₂' },
            { id: 'div', label: 'z₁ ÷ z₂' },
            { id: 'conj1', label: 'z₁* (Conj)' },
            { id: 'abs1', label: '|z₁| (Mag)' },
            { id: 'arg1', label: 'arg(z₁)' },
            { id: 'sqrt1', label: '√z₁' },
            { id: 'recip1', label: '1 / z₁' },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setActiveOp(op.id)}
              className={`h-9 rounded font-mono text-xs font-semibold border transition-all cursor-pointer ${
                activeOp === op.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-xs'
                  : 'bg-slate-800/80 text-slate-200 border-slate-700/60 hover:bg-slate-700'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Output & Argand Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Output card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider pb-2 border-b border-slate-800">
              Result Specification
            </div>

            {errorMsg ? (
              <div className="text-rose-400 font-mono text-base py-4">✖ {errorMsg}</div>
            ) : scalarResult ? (
              <div className="py-4">
                <span className="text-xs font-mono text-slate-400 block mb-1">{scalarResult.label}</span>
                <span className="font-mono text-3xl font-bold text-emerald-400">{scalarResult.value}</span>
              </div>
            ) : zResult ? (
              <div className="py-4 flex flex-col gap-3">
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-1">Cartesian Form (a + bi):</span>
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400">
                    {Number(zResult.re.toFixed(6))} {zResult.im >= 0 ? '+' : '−'} {Math.abs(Number(zResult.im.toFixed(6)))}i
                  </span>
                </div>
                <div>
                  <span className="text-xs font-mono text-slate-400 block mb-1">Polar Phasor Form (r ∠ θ):</span>
                  <span className="font-mono text-lg font-semibold text-cyan-300">
                    {formatPolar(zResult)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-800">
            Legend: <span className="text-cyan-400">■ z₁</span> · <span className="text-amber-400">■ z₂</span> · <span className="text-emerald-400">■ Result</span>
          </div>
        </div>

        {/* Argand Diagram Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
            Complex Argand Plane
          </div>
          <div className="w-full h-56 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
            <canvas ref={canvasRef} className="w-full h-full block" />
          </div>
        </div>
      </div>
    </div>
  );
};
