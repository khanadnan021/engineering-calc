import * as math from 'mathjs';
import { AngleMode, DisplayNotation } from '../types/calculator';
import { PHYSICAL_CONSTANTS } from './constants';

export interface EvaluationResult {
  raw: any;
  formatted: string;
  numericValue: number | null;
  engineeringString?: string;
  scientificString?: string;
  siPrefixString?: string;
  fractionString?: string;
  isComplex?: boolean;
  isMatrix?: boolean;
}

// SI Metric Prefixes
export const SI_PREFIXES: { exp: number; prefix: string; name: string }[] = [
  { exp: 24, prefix: 'Y', name: 'yotta' },
  { exp: 21, prefix: 'Z', name: 'zetta' },
  { exp: 18, prefix: 'E', name: 'exa' },
  { exp: 15, prefix: 'P', name: 'peta' },
  { exp: 12, prefix: 'T', name: 'tera' },
  { exp: 9, prefix: 'G', name: 'giga' },
  { exp: 6, prefix: 'M', name: 'mega' },
  { exp: 3, prefix: 'k', name: 'kilo' },
  { exp: 0, prefix: '', name: 'unit' },
  { exp: -3, prefix: 'm', name: 'milli' },
  { exp: -6, prefix: 'µ', name: 'micro' },
  { exp: -9, prefix: 'n', name: 'nano' },
  { exp: -12, prefix: 'p', name: 'pico' },
  { exp: -15, prefix: 'f', name: 'femto' },
  { exp: -18, prefix: 'a', name: 'atto' },
  { exp: -21, prefix: 'z', name: 'zepto' },
  { exp: -24, prefix: 'y', name: 'yocto' },
];

/**
 * Convert angle based on active mode to radians
 */
export function toRadians(angle: number, mode: AngleMode): number {
  if (mode === 'DEG') return (angle * Math.PI) / 180;
  if (mode === 'GRAD') return (angle * Math.PI) / 200;
  return angle;
}

/**
 * Convert radians to active angle mode
 */
export function fromRadians(rad: number, mode: AngleMode): number {
  if (mode === 'DEG') return (rad * 180) / Math.PI;
  if (mode === 'GRAD') return (rad * 200) / Math.PI;
  return rad;
}

/**
 * Format a number into Engineering notation with an optional exponent shift
 */
export function formatEngineering(num: number, exponentShift: number = 0, sigFigs: number = 6): {
  coefficient: string;
  exponent: number;
  fullString: string;
  siPrefix: string;
} {
  if (num === 0 || !isFinite(num) || isNaN(num)) {
    return { coefficient: '0', exponent: 0, fullString: '0', siPrefix: '' };
  }

  const sign = num < 0 ? '-' : '';
  const abs = Math.abs(num);
  const rawExp = Math.floor(Math.log10(abs));
  
  // Base 3 exponent
  let engExp = Math.floor(rawExp / 3) * 3 + exponentShift;
  let mantissa = abs / Math.pow(10, engExp);

  // Clean rounding
  const coeffStr = Number(mantissa.toPrecision(sigFigs)).toString();
  const fullStr = `${sign}${coeffStr} × 10^${engExp}`;

  // Find matching SI prefix
  const prefixObj = SI_PREFIXES.find(p => p.exp === engExp);
  const siPrefix = prefixObj ? prefixObj.prefix : '';

  return {
    coefficient: `${sign}${coeffStr}`,
    exponent: engExp,
    fullString: fullStr,
    siPrefix,
  };
}

/**
 * Rational approximation of floating point (e.g. 0.3333333 -> 1/3)
 */
export function toFractionString(val: number, tolerance: number = 1e-9): string | null {
  if (!isFinite(val) || Math.abs(val) > 1e9) return null;
  if (Math.abs(val - Math.round(val)) < tolerance) {
    return null; // Already integer
  }

  let sign = val < 0 ? -1 : 1;
  let x = Math.abs(val);

  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = x;

  for (let i = 0; i < 20; i++) {
    let a = Math.floor(b);
    let auxH = a * h1 + h2;
    let auxK = a * k1 + k2;

    h2 = h1;
    h1 = auxH;
    k2 = k1;
    k1 = auxK;

    if (k1 > 10000) break; // Avoid overly giant denominators
    let approx = h1 / k1;
    if (Math.abs(x - approx) <= tolerance * x || Math.abs(x - approx) < 1e-11) {
      if (k1 === 1) return null;
      return `${sign * h1}/${k1}`;
    }

    let diff = b - a;
    if (Math.abs(diff) < 1e-12) break;
    b = 1 / diff;
  }

  return null;
}

/**
 * Preprocess expression string to normalize standard scientific symbols
 */
export function preprocessExpression(expr: string, angleMode: AngleMode): string {
  let cleaned = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\u03C0/g, 'pi') // Greek π
    .replace(/\u221A/g, 'sqrt') // √
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/ln\(/g, 'log(') // mathjs log(x) is natural log
    .replace(/log10\(/g, 'log10(');

  return cleaned;
}

/**
 * Create custom MathJS scope with angle-aware trigonometry and engineering constants
 */
export function createMathScope(angleMode: AngleMode, customRegisters: Record<string, number> = {}) {
  const scope: Record<string, any> = {
    ...customRegisters,
    ans: customRegisters.ANS || 0,
  };

  // Populate physical constants into scope
  PHYSICAL_CONSTANTS.forEach(c => {
    scope[c.symbol] = c.value;
  });

  // Angle-aware trig functions
  scope.sin = (x: any) => {
    if (typeof x === 'number') {
      const rad = toRadians(x, angleMode);
      // clean floating point inaccuracies for sin(pi) or sin(180 deg)
      if (angleMode === 'DEG' && x % 180 === 0) return 0;
      return Math.sin(rad);
    }
    return math.sin(x);
  };

  scope.cos = (x: any) => {
    if (typeof x === 'number') {
      const rad = toRadians(x, angleMode);
      if (angleMode === 'DEG' && (x - 90) % 180 === 0) return 0;
      return Math.cos(rad);
    }
    return math.cos(x);
  };

  scope.tan = (x: any) => {
    if (typeof x === 'number') {
      if (angleMode === 'DEG' && (x - 90) % 180 === 0) {
        throw new Error(`tan(${x}°) is undefined (asymptote)`);
      }
      return Math.tan(toRadians(x, angleMode));
    }
    return math.tan(x);
  };

  scope.asin = (x: any) => {
    const res = math.asin(x);
    if (typeof res === 'number') return fromRadians(res, angleMode);
    return res;
  };

  scope.acos = (x: any) => {
    const res = math.acos(x);
    if (typeof res === 'number') return fromRadians(res, angleMode);
    return res;
  };

  scope.atan = (x: any) => {
    const res = math.atan(x);
    if (typeof res === 'number') return fromRadians(res, angleMode);
    return res;
  };

  // Additional engineering / math functions
  scope.nCr = (n: number, r: number) => math.combinations(n, r);
  scope.nPr = (n: number, r: number) => {
    if (r > n) return 0;
    return math.combinations(n, r) * math.factorial(r);
  };
  scope.fact = (n: number) => math.factorial(n);
  scope.sinc = (x: number) => (x === 0 ? 1 : Math.sin(x) / x);
  scope.erf = (x: number) => math.erf(x);
  scope.gamma = (x: number) => math.gamma(x);

  return scope;
}

/**
 * Main Evaluation Engine
 */
export function evaluateExpression(
  expression: string,
  angleMode: AngleMode,
  notation: DisplayNotation = 'NORMAL',
  exponentShift: number = 0,
  registers: Record<string, number> = {}
): EvaluationResult {
  if (!expression.trim()) {
    return {
      raw: 0,
      formatted: '0',
      numericValue: 0,
    };
  }

  const preprocessed = preprocessExpression(expression, angleMode);
  const scope = createMathScope(angleMode, registers);

  try {
    const compiled = math.compile(preprocessed);
    const result = compiled.evaluate(scope);

    let numericVal: number | null = null;
    let formattedStr = '';
    let isComplex = false;
    let isMatrix = false;
    let engStr = '';
    let sciStr = '';
    let siStr = '';
    let fracStr: string | null = null;

    if (result && typeof result === 'object' && 'isComplex' in result) {
      isComplex = true;
      const re = Number(result.re.toFixed(10));
      const im = Number(result.im.toFixed(10));
      const sign = im >= 0 ? '+' : '-';
      formattedStr = `${re} ${sign} ${Math.abs(im)}i`;
    } else if (result && (Array.isArray(result) || (result.isMatrix && typeof result.toArray === 'function'))) {
      isMatrix = true;
      const arr = Array.isArray(result) ? result : result.toArray();
      formattedStr = JSON.stringify(arr);
    } else if (typeof result === 'number' || (result && typeof result.valueOf === 'function' && typeof result.valueOf() === 'number')) {
      const val = typeof result === 'number' ? result : result.valueOf();
      numericVal = val;

      if (!isFinite(val)) {
        formattedStr = val > 0 ? 'Infinity' : '-Infinity';
      } else if (isNaN(val)) {
        formattedStr = 'NaN';
      } else {
        // Engineering calculation
        const engData = formatEngineering(val, exponentShift);
        engStr = engData.fullString;
        siStr = engData.siPrefix ? `${engData.coefficient} ${engData.siPrefix}` : engData.coefficient;
        sciStr = val.toExponential(6);
        fracStr = toFractionString(val);

        if (notation === 'ENG') {
          formattedStr = engStr;
        } else if (notation === 'SCI') {
          formattedStr = sciStr;
        } else {
          // Normal display: format cleanly without floating point noise
          if (Math.abs(val) !== 0 && (Math.abs(val) >= 1e14 || Math.abs(val) < 1e-7)) {
            formattedStr = val.toExponential(6);
          } else {
            // Trim precision
            formattedStr = Number(val.toPrecision(12)).toString();
          }
        }
      }
    } else {
      formattedStr = String(result);
    }

    return {
      raw: result,
      formatted: formattedStr,
      numericValue: numericVal,
      engineeringString: engStr,
      scientificString: sciStr,
      siPrefixString: siStr,
      fractionString: fracStr || undefined,
      isComplex,
      isMatrix,
    };
  } catch (err: any) {
    throw new Error(err.message || 'Syntax Error');
  }
}

/**
 * Numerical 5-Point Centered Derivative: f'(x)
 */
export function numericalDerivative(
  funcExpr: string,
  x0: number,
  angleMode: AngleMode
): number {
  const h = 1e-4;
  const scope = createMathScope(angleMode);
  const compiled = math.compile(preprocessExpression(funcExpr, angleMode));

  const f = (x: number) => {
    scope.x = x;
    return compiled.evaluate(scope);
  };

  const f1 = f(x0 + 2 * h);
  const f2 = f(x0 + h);
  const f3 = f(x0 - h);
  const f4 = f(x0 - 2 * h);

  return (-f1 + 8 * f2 - 8 * f3 + f4) / (12 * h);
}

/**
 * Composite Simpson's Rule for Definite Integral: ∫_a^b f(x) dx
 */
export function numericalIntegral(
  funcExpr: string,
  a: number,
  b: number,
  angleMode: AngleMode,
  intervals: number = 200
): number {
  if (a === b) return 0;
  const n = intervals % 2 === 0 ? intervals : intervals + 1; // Must be even
  const h = (b - a) / n;
  const scope = createMathScope(angleMode);
  const compiled = math.compile(preprocessExpression(funcExpr, angleMode));

  const f = (x: number) => {
    scope.x = x;
    const res = compiled.evaluate(scope);
    return isFinite(res) ? res : 0;
  };

  let sum = f(a) + f(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * f(x);
  }

  return (h / 3) * sum;
}
