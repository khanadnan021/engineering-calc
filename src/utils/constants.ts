import { PhysicalConstant } from '../types/calculator';

export const PHYSICAL_CONSTANTS: PhysicalConstant[] = [
  // Universal
  {
    symbol: 'c',
    name: 'Speed of Light in Vacuum',
    value: 299792458,
    unit: 'm / s',
    category: 'Universal',
    latex: 'c',
    description: 'Exact fundamental constant representing the speed of electromagnetic radiation in a vacuum.'
  },
  {
    symbol: 'h',
    name: 'Planck Constant',
    value: 6.62607015e-34,
    unit: 'J · s',
    category: 'Universal',
    latex: 'h',
    description: 'Quantum of electromagnetic action relating energy to frequency (E = hν).'
  },
  {
    symbol: 'hbar',
    name: 'Reduced Planck Constant',
    value: 1.054571817e-34,
    unit: 'J · s',
    category: 'Universal',
    latex: '\\hbar = h / 2\\pi',
    description: 'Dirac constant, fundamental to quantum mechanics and angular momentum.'
  },
  {
    symbol: 'G',
    name: 'Newtonian Constant of Gravitation',
    value: 6.67430e-11,
    unit: 'm³ / (kg · s²)',
    category: 'Universal',
    latex: 'G',
    description: 'Empirical physical constant involved in calculation of gravitational effects.'
  },
  {
    symbol: 'eps0',
    name: 'Vacuum Electric Permittivity (ε₀)',
    value: 8.8541878128e-12,
    unit: 'F / m',
    category: 'Universal',
    latex: '\\varepsilon_0',
    description: 'Permittivity of free space, connecting electric charge to mechanical forces.'
  },
  {
    symbol: 'mu0',
    name: 'Vacuum Magnetic Permeability (μ₀)',
    value: 1.25663706212e-6,
    unit: 'N / A²',
    category: 'Universal',
    latex: '\\mu_0',
    description: 'Magnetic permeability in classical vacuum (μ₀ = 1 / (ε₀ c²)).'
  },
  {
    symbol: 'Z0',
    name: 'Characteristic Impedance of Vacuum',
    value: 376.730313668,
    unit: 'Ω',
    category: 'Universal',
    latex: 'Z_0 = \\sqrt{\\mu_0 / \\varepsilon_0}',
    description: 'Wave impedance for plane electromagnetic waves in free space.'
  },

  // Atomic & Nuclear
  {
    symbol: 'e',
    name: 'Elementary Charge',
    value: 1.602176634e-19,
    unit: 'C',
    category: 'Atomic',
    latex: 'e',
    description: 'Electric charge carried by a single proton or electron.'
  },
  {
    symbol: 'm_e',
    name: 'Electron Rest Mass',
    value: 9.1093837015e-31,
    unit: 'kg',
    category: 'Atomic',
    latex: 'm_e',
    description: 'Invariant mass of a stationary electron.'
  },
  {
    symbol: 'm_p',
    name: 'Proton Rest Mass',
    value: 1.67262192369e-27,
    unit: 'kg',
    category: 'Atomic',
    latex: 'm_p',
    description: 'Invariant mass of a stationary proton.'
  },
  {
    symbol: 'm_n',
    name: 'Neutron Rest Mass',
    value: 1.67492749804e-27,
    unit: 'kg',
    category: 'Atomic',
    latex: 'm_n',
    description: 'Invariant mass of a stationary neutron.'
  },
  {
    symbol: 'alpha',
    name: 'Fine-Structure Constant',
    value: 7.2973525693e-3,
    unit: 'dimensionless (≈ 1/137)',
    category: 'Atomic',
    latex: '\\alpha',
    description: 'Coupling constant characterizing strength of electromagnetic interaction.'
  },
  {
    symbol: 'a0',
    name: 'Bohr Radius',
    value: 5.29177210903e-11,
    unit: 'm',
    category: 'Atomic',
    latex: 'a_0',
    description: 'Most probable distance between the nucleus and the electron in a hydrogen atom in ground state.'
  },
  {
    symbol: 'Rydberg',
    name: 'Rydberg Constant',
    value: 10973731.568160,
    unit: 'm⁻¹',
    category: 'Atomic',
    latex: 'R_\\infty',
    description: 'Physical constant relating to atomic spectra.'
  },

  // Phys-Chem & Thermodynamic
  {
    symbol: 'N_A',
    name: 'Avogadro Constant',
    value: 6.02214076e23,
    unit: 'mol⁻¹',
    category: 'Phys-Chem',
    latex: 'N_A',
    description: 'Number of constituent particles in one mole of any substance.'
  },
  {
    symbol: 'k_B',
    name: 'Boltzmann Constant',
    value: 1.380649e-23,
    unit: 'J / K',
    category: 'Phys-Chem',
    latex: 'k_B',
    description: 'Proportionality factor relating average kinetic energy to thermodynamic temperature.'
  },
  {
    symbol: 'R_gas',
    name: 'Universal Gas Constant',
    value: 8.314462618,
    unit: 'J / (mol · K)',
    category: 'Phys-Chem',
    latex: 'R = N_A \\cdot k_B',
    description: 'Molar gas constant in ideal gas law PV = nRT.'
  },
  {
    symbol: 'Faraday',
    name: 'Faraday Constant',
    value: 96485.33212,
    unit: 'C / mol',
    category: 'Phys-Chem',
    latex: 'F = e \\cdot N_A',
    description: 'Magnitude of electric charge per mole of electrons.'
  },
  {
    symbol: 'sigma_SB',
    name: 'Stefan-Boltzmann Constant',
    value: 5.670374419e-8,
    unit: 'W / (m² · K⁴)',
    category: 'Phys-Chem',
    latex: '\\sigma',
    description: 'Constant of proportionality in the Stefan–Boltzmann law for black-body radiation.'
  },
  {
    symbol: 'b_Wien',
    name: 'Wien Displacement Constant',
    value: 2.897771955e-3,
    unit: 'm · K',
    category: 'Phys-Chem',
    latex: 'b',
    description: 'Relationship between black body temperature and peak wavelength.'
  },

  // Engineering & Earth
  {
    symbol: 'g',
    name: 'Standard Acceleration of Gravity',
    value: 9.80665,
    unit: 'm / s²',
    category: 'Astrophysics',
    latex: 'g_0',
    description: 'Nominal gravitational acceleration of an object in a vacuum near the surface of the Earth.'
  },
  {
    symbol: 'atm',
    name: 'Standard Atmospheric Pressure',
    value: 101325,
    unit: 'Pa',
    category: 'Phys-Chem',
    latex: '1 \\text{ atm}',
    description: 'Standard sea-level atmospheric pressure (101.325 kPa or 760 mmHg).'
  },

  // Mathematical
  {
    symbol: 'pi',
    name: 'Pi (Archimedes Constant)',
    value: Math.PI,
    unit: 'dimensionless',
    category: 'Math',
    latex: '\\pi \\approx 3.1415926535...',
    description: 'Ratio of a circle\'s circumference to its diameter.'
  },
  {
    symbol: 'e_const',
    name: 'Euler\'s Number',
    value: Math.E,
    unit: 'dimensionless',
    category: 'Math',
    latex: 'e \\approx 2.7182818284...',
    description: 'Base of the natural logarithm; limit of (1 + 1/n)^n as n approaches infinity.'
  },
  {
    symbol: 'phi',
    name: 'Golden Ratio',
    value: (1 + Math.sqrt(5)) / 2,
    unit: 'dimensionless',
    category: 'Math',
    latex: '\\phi = (1 + \\sqrt{5})/2 \\approx 1.6180339...',
    description: 'Two quantities are in the golden ratio if their ratio is the same as the ratio of their sum to the larger of the two.'
  }
];
