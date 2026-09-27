import { UnitCategory } from '../types/calculator';

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length & Distance',
    iconName: 'Ruler',
    baseUnit: 'm',
    units: [
      { symbol: 'm', name: 'Meter', toBase: v => v, fromBase: v => v },
      { symbol: 'km', name: 'Kilometer', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { symbol: 'cm', name: 'Centimeter', toBase: v => v * 0.01, fromBase: v => v / 0.01 },
      { symbol: 'mm', name: 'Millimeter', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      { symbol: 'µm', name: 'Micrometer', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { symbol: 'nm', name: 'Nanometer', toBase: v => v * 1e-9, fromBase: v => v / 1e-9 },
      { symbol: 'in', name: 'Inch', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { symbol: 'ft', name: 'Foot', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { symbol: 'yd', name: 'Yard', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      { symbol: 'mi', name: 'Mile (statute)', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
      { symbol: 'nmi', name: 'Nautical Mile', toBase: v => v * 1852, fromBase: v => v / 1852 },
      { symbol: 'ly', name: 'Light Year', toBase: v => v * 9.46073e15, fromBase: v => v / 9.46073e15 },
    ]
  },
  {
    id: 'mass',
    name: 'Mass & Weight',
    iconName: 'Weight',
    baseUnit: 'kg',
    units: [
      { symbol: 'kg', name: 'Kilogram', toBase: v => v, fromBase: v => v },
      { symbol: 'g', name: 'Gram', toBase: v => v * 0.001, fromBase: v => v / 0.001 },
      { symbol: 'mg', name: 'Milligram', toBase: v => v * 1e-6, fromBase: v => v / 1e-6 },
      { symbol: 'µg', name: 'Microgram', toBase: v => v * 1e-9, fromBase: v => v / 1e-9 },
      { symbol: 't', name: 'Metric Ton', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { symbol: 'lb', name: 'Pound (avdp)', toBase: v => v * 0.45359237, fromBase: v => v / 0.45359237 },
      { symbol: 'oz', name: 'Ounce (avdp)', toBase: v => v * 0.0283495231, fromBase: v => v / 0.0283495231 },
      { symbol: 'slug', name: 'Slug', toBase: v => v * 14.593903, fromBase: v => v / 14.593903 },
      { symbol: 'st', name: 'Stone (UK)', toBase: v => v * 6.350293, fromBase: v => v / 6.350293 },
    ]
  },
  {
    id: 'pressure',
    name: 'Pressure',
    iconName: 'Gauge',
    baseUnit: 'Pa',
    units: [
      { symbol: 'Pa', name: 'Pascal (N/m²)', toBase: v => v, fromBase: v => v },
      { symbol: 'kPa', name: 'Kilopascal', toBase: v => v * 1e3, fromBase: v => v / 1e3 },
      { symbol: 'MPa', name: 'Megapascal', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { symbol: 'bar', name: 'Bar', toBase: v => v * 1e5, fromBase: v => v / 1e5 },
      { symbol: 'mbar', name: 'Millibar', toBase: v => v * 100, fromBase: v => v / 100 },
      { symbol: 'psi', name: 'Pound per sq inch', toBase: v => v * 6894.757, fromBase: v => v / 6894.757 },
      { symbol: 'atm', name: 'Atmosphere (standard)', toBase: v => v * 101325, fromBase: v => v / 101325 },
      { symbol: 'torr', name: 'Torr (mmHg @ 0°C)', toBase: v => v * 133.322368, fromBase: v => v / 133.322368 },
      { symbol: 'inHg', name: 'Inch of Mercury', toBase: v => v * 3386.389, fromBase: v => v / 3386.389 },
    ]
  },
  {
    id: 'energy',
    name: 'Energy, Work & Heat',
    iconName: 'Zap',
    baseUnit: 'J',
    units: [
      { symbol: 'J', name: 'Joule', toBase: v => v, fromBase: v => v },
      { symbol: 'kJ', name: 'Kilojoule', toBase: v => v * 1e3, fromBase: v => v / 1e3 },
      { symbol: 'MJ', name: 'Megajoule', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { symbol: 'cal', name: 'Calorie (thermochemical)', toBase: v => v * 4.184, fromBase: v => v / 4.184 },
      { symbol: 'kcal', name: 'Kilocalorie (food cal)', toBase: v => v * 4184, fromBase: v => v / 4184 },
      { symbol: 'Wh', name: 'Watt-hour', toBase: v => v * 3600, fromBase: v => v / 3600 },
      { symbol: 'kWh', name: 'Kilowatt-hour', toBase: v => v * 3.6e6, fromBase: v => v / 3.6e6 },
      { symbol: 'eV', name: 'Electronvolt', toBase: v => v * 1.602176634e-19, fromBase: v => v / 1.602176634e-19 },
      { symbol: 'BTU', name: 'British Thermal Unit (ISO)', toBase: v => v * 1055.056, fromBase: v => v / 1055.056 },
      { symbol: 'ft·lbf', name: 'Foot-pound force', toBase: v => v * 1.355818, fromBase: v => v / 1.355818 },
    ]
  },
  {
    id: 'power',
    name: 'Power',
    iconName: 'Activity',
    baseUnit: 'W',
    units: [
      { symbol: 'W', name: 'Watt', toBase: v => v, fromBase: v => v },
      { symbol: 'kW', name: 'Kilowatt', toBase: v => v * 1e3, fromBase: v => v / 1e3 },
      { symbol: 'MW', name: 'Megawatt', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { symbol: 'hp', name: 'Horsepower (Mechanical/Imp)', toBase: v => v * 745.69987, fromBase: v => v / 745.69987 },
      { symbol: 'hp(M)', name: 'Horsepower (Metric PS)', toBase: v => v * 735.49875, fromBase: v => v / 735.49875 },
      { symbol: 'BTU/h', name: 'BTU per hour', toBase: v => v * 0.293071, fromBase: v => v / 0.293071 },
      { symbol: 'ft·lb/s', name: 'Foot-pound/sec', toBase: v => v * 1.355818, fromBase: v => v / 1.355818 },
    ]
  },
  {
    id: 'temperature',
    name: 'Temperature',
    iconName: 'Thermometer',
    baseUnit: 'K',
    units: [
      { symbol: 'K', name: 'Kelvin', toBase: v => v, fromBase: v => v },
      { symbol: '°C', name: 'Celsius', toBase: v => v + 273.15, fromBase: v => v - 273.15 },
      { symbol: '°F', name: 'Fahrenheit', toBase: v => ((v - 32) * 5) / 9 + 273.15, fromBase: v => ((v - 273.15) * 9) / 5 + 32 },
      { symbol: '°R', name: 'Rankine', toBase: v => (v * 5) / 9, fromBase: v => (v * 9) / 5 },
    ]
  },
  {
    id: 'force',
    name: 'Force',
    iconName: 'ArrowUpRight',
    baseUnit: 'N',
    units: [
      { symbol: 'N', name: 'Newton', toBase: v => v, fromBase: v => v },
      { symbol: 'kN', name: 'Kilonewton', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { symbol: 'lbf', name: 'Pound-force', toBase: v => v * 4.448222, fromBase: v => v / 4.448222 },
      { symbol: 'kgf', name: 'Kilogram-force (kp)', toBase: v => v * 9.80665, fromBase: v => v / 9.80665 },
      { symbol: 'dyn', name: 'Dyne', toBase: v => v * 1e-5, fromBase: v => v / 1e-5 },
    ]
  },
  {
    id: 'velocity',
    name: 'Velocity & Speed',
    iconName: 'Compass',
    baseUnit: 'm/s',
    units: [
      { symbol: 'm/s', name: 'Meter per second', toBase: v => v, fromBase: v => v },
      { symbol: 'km/h', name: 'Kilometer per hour', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
      { symbol: 'mph', name: 'Miles per hour', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { symbol: 'knot', name: 'Knot (nautical mi/h)', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
      { symbol: 'ft/s', name: 'Foot per second', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { symbol: 'Mach', name: 'Mach (dry air @ 20°C)', toBase: v => v * 343, fromBase: v => v / 343 },
    ]
  },
  {
    id: 'data',
    name: 'Data Storage',
    iconName: 'HardDrive',
    baseUnit: 'B',
    units: [
      { symbol: 'B', name: 'Byte', toBase: v => v, fromBase: v => v },
      { symbol: 'KB', name: 'Kilobyte (10³)', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { symbol: 'MB', name: 'Megabyte (10⁶)', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { symbol: 'GB', name: 'Gigabyte (10⁹)', toBase: v => v * 1e9, fromBase: v => v / 1e9 },
      { symbol: 'TB', name: 'Terabyte (10¹²)', toBase: v => v * 1e12, fromBase: v => v / 1e12 },
      { symbol: 'KiB', name: 'Kibibyte (2¹⁰)', toBase: v => v * 1024, fromBase: v => v / 1024 },
      { symbol: 'MiB', name: 'Mebibyte (2²⁰)', toBase: v => v * 1048576, fromBase: v => v / 1048576 },
      { symbol: 'GiB', name: 'Gibibyte (2³⁰)', toBase: v => v * 1073741824, fromBase: v => v / 1073741824 },
      { symbol: 'TiB', name: 'Tebibyte (2⁴⁰)', toBase: v => v * 1099511627776, fromBase: v => v / 1099511627776 },
    ]
  }
];

export function convertUnits(
  category: UnitCategory,
  value: number,
  fromSymbol: string,
  toSymbol: string
): number {
  if (fromSymbol === toSymbol) return value;
  const fromU = category.units.find(u => u.symbol === fromSymbol);
  const toU = category.units.find(u => u.symbol === toSymbol);
  if (!fromU || !toU) return value;

  const inBase = fromU.toBase(value);
  return toU.fromBase(inBase);
}
