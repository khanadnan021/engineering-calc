import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AngleMode } from '../types/calculator';
import { numericalDerivative, numericalIntegral, createMathScope, preprocessExpression } from '../utils/mathEngine';
import * as math from 'mathjs';
import { ZoomIn, ZoomOut, RotateCcw, FunctionSquare, Layers } from 'lucide-react';

interface GrapherProps {
  initialFunction?: string;
  angleMode: AngleMode;
}

export const Grapher: React.FC<GrapherProps> = ({
  initialFunction = 'sin(x)',
  angleMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [funcExpr, setFuncExpr] = useState(initialFunction);
  const [showDerivative, setShowDerivative] = useState(false);
  const [showIntegral, setShowIntegral] = useState(false);
  const [integralA, setIntegralA] = useState(-2);
  const [integralB, setIntegralB] = useState(2);
  const [computedIntegral, setComputedIntegral] = useState<number | null>(null);

  // Viewport bounds
  const [viewport, setViewport] = useState({
    xMin: -10,
    xMax: 10,
    yMin: -6,
    yMax: 6,
  });

  const [mousePos, setMousePos] = useState<{ x: number; y: number; curveY: number | null } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; vXMin: number; vXMax: number; vYMin: number; vYMax: number }>({
    x: 0,
    y: 0,
    vXMin: -10,
    vXMax: 10,
    vYMin: -6,
    vYMax: 6,
  });

  const [detectedRoots, setDetectedRoots] = useState<number[]>([]);

  // Function presets for engineering & physics
  const presets = [
    { label: 'Sine Wave', expr: 'sin(x)' },
    { label: 'Damped Oscillation', expr: 'exp(-0.2*x) * sin(3*x)' },
    { label: 'Sinc (Filter)', expr: 'sin(pi*x) / (pi*x)' },
    { label: 'Gaussian Bell', expr: 'exp(-x^2)' },
    { label: 'RLC Resonance', expr: '1 / sqrt((1 - x^2)^2 + (0.2*x)^2)' },
    { label: 'Cubic Spline', expr: 'x^3 - 3*x + 1' },
  ];

  // Evaluate function at x
  const evalFunc = useCallback((expr: string, xVal: number): number | null => {
    try {
      const scope = createMathScope(angleMode);
      scope.x = xVal;
      const compiled = math.compile(preprocessExpression(expr, angleMode));
      const res = compiled.evaluate(scope);
      if (typeof res === 'number' && isFinite(res) && !isNaN(res)) {
        return res;
      }
      return null;
    } catch {
      return null;
    }
  }, [angleMode]);

  // Compute integral when bounds or function change
  useEffect(() => {
    if (showIntegral) {
      try {
        const val = numericalIntegral(funcExpr, integralA, integralB, angleMode);
        setComputedIntegral(val);
      } catch {
        setComputedIntegral(null);
      }
    }
  }, [funcExpr, integralA, integralB, angleMode, showIntegral]);

  // Scan for roots in current viewport
  useEffect(() => {
    const roots: number[] = [];
    const steps = 150;
    const dx = (viewport.xMax - viewport.xMin) / steps;
    let prevX = viewport.xMin;
    let prevY = evalFunc(funcExpr, prevX);

    for (let i = 1; i <= steps; i++) {
      const x = viewport.xMin + i * dx;
      const y = evalFunc(funcExpr, x);
      if (prevY !== null && y !== null) {
        if (prevY === 0) {
          roots.push(prevX);
        } else if (prevY * y < 0) {
          // Bisection refinement
          let a = prevX;
          let b = x;
          for (let iter = 0; iter < 15; iter++) {
            const mid = (a + b) / 2;
            const midY = evalFunc(funcExpr, mid);
            if (midY === 0 || (b - a) < 1e-5) {
              roots.push(mid);
              break;
            }
            const yA = evalFunc(funcExpr, a);
            if (yA !== null && midY !== null && yA * midY < 0) {
              b = mid;
            } else {
              a = mid;
            }
          }
        }
      }
      prevX = x;
      prevY = y;
    }
    setDetectedRoots(roots.slice(0, 10));
  }, [funcExpr, viewport, evalFunc]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Coordinate conversions
    const toScreenX = (x: number) => ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * w;
    const toScreenY = (y: number) => h - ((y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * h;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Grid spacing calculation
    const xSpan = viewport.xMax - viewport.xMin;
    const ySpan = viewport.yMax - viewport.yMin;

    const calcStep = (span: number) => {
      const rough = span / 10;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
      const rel = rough / magnitude;
      if (rel < 2) return magnitude;
      if (rel < 5) return 2 * magnitude;
      return 5 * magnitude;
    };

    const xStep = calcStep(xSpan);
    const yStep = calcStep(ySpan);

    // Draw grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#1e293b';

    const startX = Math.floor(viewport.xMin / xStep) * xStep;
    for (let x = startX; x <= viewport.xMax; x += xStep) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
      ctx.stroke();
    }

    const startY = Math.floor(viewport.yMin / yStep) * yStep;
    for (let y = startY; y <= viewport.yMax; y += yStep) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(w, sy);
      ctx.stroke();
    }

    // Draw main axes (x=0 and y=0)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569';

    const zeroX = toScreenX(0);
    const zeroY = toScreenY(0);

    // Y Axis (x=0)
    if (zeroX >= 0 && zeroX <= w) {
      ctx.beginPath();
      ctx.moveTo(zeroX, 0);
      ctx.lineTo(zeroX, h);
      ctx.stroke();
    }

    // X Axis (y=0)
    if (zeroY >= 0 && zeroY <= h) {
      ctx.beginPath();
      ctx.moveTo(0, zeroY);
      ctx.lineTo(w, zeroY);
      ctx.stroke();
    }

    // Draw Axis Tick Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let x = startX; x <= viewport.xMax; x += xStep) {
      if (Math.abs(x) < 1e-6) continue;
      const sx = toScreenX(x);
      const labelY = Math.min(Math.max(zeroY + 4, 12), h - 16);
      ctx.fillText(Number(x.toPrecision(4)).toString(), sx, labelY);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = startY; y <= viewport.yMax; y += yStep) {
      if (Math.abs(y) < 1e-6) continue;
      const sy = toScreenY(y);
      const labelX = Math.min(Math.max(zeroX - 4, 30), w - 4);
      ctx.fillText(Number(y.toPrecision(4)).toString(), labelX, sy);
    }

    // Draw Integral Shaded Area if enabled
    if (showIntegral) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      const aScreen = toScreenX(integralA);
      const bScreen = toScreenX(integralB);
      ctx.moveTo(aScreen, zeroY);

      const intSteps = 100;
      for (let i = 0; i <= intSteps; i++) {
        const xVal = integralA + (i / intSteps) * (integralB - integralA);
        const yVal = evalFunc(funcExpr, xVal);
        if (yVal !== null) {
          ctx.lineTo(toScreenX(xVal), toScreenY(yVal));
        }
      }
      ctx.lineTo(bScreen, zeroY);
      ctx.closePath();
      ctx.fill();

      // Bounds indicator lines
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(aScreen, 0);
      ctx.lineTo(aScreen, h);
      ctx.moveTo(bScreen, 0);
      ctx.lineTo(bScreen, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Derivative Curve f'(x) if enabled
    if (showDerivative) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      let started = false;

      const pxStep = 2;
      for (let px = 0; px <= w; px += pxStep) {
        const xVal = viewport.xMin + (px / w) * xSpan;
        try {
          const dy = numericalDerivative(funcExpr, xVal, angleMode);
          if (isFinite(dy)) {
            const py = toScreenY(dy);
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        } catch {
          started = false;
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Primary Curve f(x)
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    let started = false;

    const pxStep = 1;
    for (let px = 0; px <= w; px += pxStep) {
      const xVal = viewport.xMin + (px / w) * xSpan;
      const yVal = evalFunc(funcExpr, xVal);

      if (yVal !== null && !isNaN(yVal)) {
        const py = toScreenY(yVal);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          // Break line if asymptote jump
          if (Math.abs(py) > h * 2) {
            started = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();

    // Draw Detected Roots
    detectedRoots.forEach((rootX) => {
      const sx = toScreenX(rootX);
      const sy = toScreenY(0);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Active Crosshair & Probe
    if (mousePos && mousePos.curveY !== null) {
      const sx = toScreenX(mousePos.x);
      const sy = toScreenY(mousePos.curveY);

      // Vertical guide
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, h);
      ctx.stroke();

      // Intersection ring
      ctx.setLineDash([]);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }
  }, [
    viewport,
    funcExpr,
    angleMode,
    showDerivative,
    showIntegral,
    integralA,
    integralB,
    mousePos,
    detectedRoots,
    evalFunc,
  ]);

  // Mouse pan handling
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      vXMin: viewport.xMin,
      vXMax: viewport.xMax,
      vYMin: viewport.yMin,
      vYMax: viewport.yMax,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const xVal = viewport.xMin + (px / rect.width) * (viewport.xMax - viewport.xMin);
    const curveY = evalFunc(funcExpr, xVal);

    setMousePos({ x: xVal, y: 0, curveY });

    if (isDragging) {
      const dxPx = e.clientX - dragStartRef.current.x;
      const dyPx = e.clientY - dragStartRef.current.y;

      const xSpan = dragStartRef.current.vXMax - dragStartRef.current.vXMin;
      const ySpan = dragStartRef.current.vYMax - dragStartRef.current.vYMin;

      const dxUnits = (dxPx / rect.width) * xSpan;
      const dyUnits = (dyPx / rect.height) * ySpan;

      setViewport({
        xMin: dragStartRef.current.vXMin - dxUnits,
        xMax: dragStartRef.current.vXMax - dxUnits,
        yMin: dragStartRef.current.vYMin + dyUnits,
        yMax: dragStartRef.current.vYMax + dyUnits,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 0.85;
    zoom(factor);
  };

  const zoom = (factor: number) => {
    setViewport((prev) => {
      const xCenter = (prev.xMin + prev.xMax) / 2;
      const yCenter = (prev.yMin + prev.yMax) / 2;
      const xHalf = ((prev.xMax - prev.xMin) * factor) / 2;
      const yHalf = ((prev.yMax - prev.yMin) * factor) / 2;
      return {
        xMin: xCenter - xHalf,
        xMax: xCenter + xHalf,
        yMin: yCenter - yHalf,
        yMax: yCenter + yHalf,
      };
    });
  };

  const resetView = () => {
    setViewport({ xMin: -10, xMax: 10, yMin: -6, yMax: 6 });
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Function input */}
        <div className="flex items-center gap-2 flex-1">
          <span className="font-mono text-cyan-400 font-bold text-sm shrink-0">f(x) =</span>
          <input
            type="text"
            value={funcExpr}
            onChange={(e) => setFuncExpr(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 font-mono text-sm text-white focus:outline-none focus:border-cyan-500/50"
            placeholder="e.g. sin(x), exp(-x^2), x^3 - 3*x"
          />
        </div>

        {/* Viewport Zoom & Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => zoom(0.8)}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoom(1.25)}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Reset Viewport"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Function Presets Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-slate-500 shrink-0">Presets:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setFuncExpr(p.expr)}
            className={`px-2.5 py-1 rounded font-mono text-xs whitespace-nowrap transition-colors cursor-pointer ${
              funcExpr === p.expr
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setMousePos(null);
          }}
          onWheel={handleWheel}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Telemetry HUD floating badge */}
        {mousePos && mousePos.curveY !== null && (
          <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-700/80 rounded-md px-2.5 py-1 text-xs font-mono text-slate-300 pointer-events-none backdrop-blur-md shadow-md flex items-center gap-2">
            <span>x: <strong className="text-white">{Number(mousePos.x.toPrecision(5))}</strong></span>
            <span>·</span>
            <span>y: <strong className="text-cyan-400">{Number(mousePos.curveY.toPrecision(5))}</strong></span>
          </div>
        )}

        {/* Floating Root Finder Indicators */}
        {detectedRoots.length > 0 && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-800 rounded-md px-2 py-1 text-[11px] font-mono text-slate-400 backdrop-blur-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Roots found:</span>
            {detectedRoots.slice(0, 3).map((r, idx) => (
              <span key={idx} className="text-emerald-300 font-semibold">
                {Number(r.toPrecision(4))}{idx < Math.min(2, detectedRoots.length - 1) ? ',' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Calculus & Analysis Tooling Tray */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Derivative Analysis Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-xs text-slate-200">Derivative Curve f'(x)</span>
            </div>
            <button
              onClick={() => setShowDerivative(!showDerivative)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                showDerivative
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showDerivative ? 'Visible' : 'Hidden'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Plots instantaneous rate of change curve using numerical 5-point centered difference stencil.
          </p>
        </div>

        {/* Definite Integral Tool */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FunctionSquare className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-xs text-slate-200">Definite Integral ∫ [a, b]</span>
            </div>
            <button
              onClick={() => setShowIntegral(!showIntegral)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                showIntegral
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showIntegral ? 'Active' : 'Off'}
            </button>
          </div>

          {showIntegral && (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">a:</span>
                <input
                  type="number"
                  value={integralA}
                  onChange={(e) => setIntegralA(parseFloat(e.target.value) || 0)}
                  className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-white"
                />
                <span className="text-slate-400">b:</span>
                <input
                  type="number"
                  value={integralB}
                  onChange={(e) => setIntegralB(parseFloat(e.target.value) || 0)}
                  className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-white"
                />
              </div>

              <div className="text-xs font-mono text-right">
                <span className="text-slate-400">Area: </span>
                <strong className="text-cyan-400">
                  {computedIntegral !== null ? Number(computedIntegral.toPrecision(6)) : '—'}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
