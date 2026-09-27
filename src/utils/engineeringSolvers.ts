export interface SolverField {
  id: string;
  label: string;
  unit: string;
  defaultValue: number;
  description: string;
}

export interface SolverDefinition {
  id: string;
  category: 'Electrical' | 'Mechanical' | 'Fluids & Thermal';
  title: string;
  formula: string;
  description: string;
  fields: SolverField[];
  calculate: (inputs: Record<string, number>) => {
    results: { label: string; value: number | string; unit: string; note?: string }[];
  };
}

export const ENGINEERING_SOLVERS: SolverDefinition[] = [
  // 1. Ohm's Law & Power
  {
    id: 'ohms-law',
    category: 'Electrical',
    title: "Ohm's Law & DC Power",
    formula: 'V = I · R  |  P = V · I = I² · R = V² / R',
    description: 'Calculate voltage, current, resistance, or power in DC circuits.',
    fields: [
      { id: 'v', label: 'Voltage (V)', unit: 'V', defaultValue: 12, description: 'Potential difference' },
      { id: 'r', label: 'Resistance (R)', unit: 'Ω', defaultValue: 220, description: 'Circuit electrical resistance' },
    ],
    calculate: (inputs) => {
      const v = inputs.v;
      const r = inputs.r;
      if (r === 0) return { results: [{ label: 'Error', value: 'Resistance cannot be zero', unit: '' }] };
      const i = v / r;
      const p = v * i;
      return {
        results: [
          { label: 'Current (I)', value: Number(i.toPrecision(6)), unit: 'A', note: `${Number((i * 1000).toPrecision(6))} mA` },
          { label: 'Power Dissipation (P)', value: Number(p.toPrecision(6)), unit: 'W', note: `${Number((p * 1000).toPrecision(6))} mW` },
        ]
      };
    }
  },

  // 2. RC Low-Pass Filter
  {
    id: 'rc-filter',
    category: 'Electrical',
    title: 'RC Low-Pass Filter & Time Constant',
    formula: 'f_c = 1 / (2π · R · C)  |  τ = R · C',
    description: 'Calculates -3dB cutoff frequency and charging time constant for an RC circuit.',
    fields: [
      { id: 'r', label: 'Resistance (R)', unit: 'Ω', defaultValue: 10000, description: 'Filter resistor' },
      { id: 'c', label: 'Capacitance (C)', unit: 'F', defaultValue: 1e-7, description: 'Filter capacitor (e.g. 100nF = 1e-7)' },
    ],
    calculate: (inputs) => {
      const r = inputs.r;
      const c = inputs.c;
      if (r <= 0 || c <= 0) return { results: [{ label: 'Error', value: 'R and C must be positive', unit: '' }] };
      const tau = r * c;
      const fc = 1 / (2 * Math.PI * tau);
      return {
        results: [
          { label: 'Cutoff Frequency (fc)', value: Number(fc.toPrecision(6)), unit: 'Hz', note: `${Number((fc / 1000).toPrecision(6))} kHz` },
          { label: 'Time Constant (τ)', value: Number(tau.toPrecision(6)), unit: 's', note: `${Number((tau * 1000).toPrecision(6))} ms` },
          { label: '5τ Settle Time (99.3%)', value: Number((5 * tau).toPrecision(6)), unit: 's' }
        ]
      };
    }
  },

  // 3. LC Resonant Frequency
  {
    id: 'lc-resonance',
    category: 'Electrical',
    title: 'LC Tank Resonant Frequency',
    formula: 'f₀ = 1 / (2π · √(L · C))',
    description: 'Calculates the resonant frequency of an inductor-capacitor tuned tank circuit.',
    fields: [
      { id: 'l', label: 'Inductance (L)', unit: 'H', defaultValue: 10e-3, description: 'Inductor value (10mH = 0.01H)' },
      { id: 'c', label: 'Capacitance (C)', unit: 'F', defaultValue: 100e-9, description: 'Capacitor value (100nF = 1e-7F)' },
    ],
    calculate: (inputs) => {
      const l = inputs.l;
      const c = inputs.c;
      if (l <= 0 || c <= 0) return { results: [{ label: 'Error', value: 'L and C must be positive', unit: '' }] };
      const f0 = 1 / (2 * Math.PI * Math.sqrt(l * c));
      const omega = 2 * Math.PI * f0;
      return {
        results: [
          { label: 'Resonant Frequency (f₀)', value: Number(f0.toPrecision(6)), unit: 'Hz', note: `${Number((f0 / 1000).toPrecision(6))} kHz` },
          { label: 'Angular Frequency (ω₀)', value: Number(omega.toPrecision(6)), unit: 'rad/s' },
          { label: 'Characteristic Impedance (Z₀)', value: Number(Math.sqrt(l / c).toPrecision(6)), unit: 'Ω' }
        ]
      };
    }
  },

  // 4. Voltage Divider
  {
    id: 'voltage-divider',
    category: 'Electrical',
    title: 'Resistive Voltage Divider',
    formula: 'V_out = V_in · (R₂ / (R₁ + R₂))',
    description: 'Calculate unloaded output voltage and attenuation ratio.',
    fields: [
      { id: 'vin', label: 'Input Voltage (V_in)', unit: 'V', defaultValue: 5, description: 'Source voltage' },
      { id: 'r1', label: 'Top Resistor (R₁)', unit: 'Ω', defaultValue: 10000, description: 'Resistor between input and output' },
      { id: 'r2', label: 'Bottom Resistor (R₂)', unit: 'Ω', defaultValue: 10000, description: 'Resistor between output and ground' },
    ],
    calculate: (inputs) => {
      const { vin, r1, r2 } = inputs;
      if (r1 + r2 === 0) return { results: [{ label: 'Error', value: 'Total resistance cannot be zero', unit: '' }] };
      const vout = vin * (r2 / (r1 + r2));
      const ratio = r2 / (r1 + r2);
      const db = 20 * Math.log10(ratio);
      return {
        results: [
          { label: 'Output Voltage (V_out)', value: Number(vout.toPrecision(6)), unit: 'V' },
          { label: 'Division Ratio', value: Number(ratio.toPrecision(5)), unit: '' },
          { label: 'Attenuation', value: Number(db.toPrecision(4)), unit: 'dB' },
          { label: 'Total Current', value: Number(((vin / (r1 + r2)) * 1000).toPrecision(5)), unit: 'mA' }
        ]
      };
    }
  },

  // 5. Stress, Strain & Young's Modulus
  {
    id: 'stress-strain',
    category: 'Mechanical',
    title: "Stress, Strain & Hooke's Law",
    formula: 'σ = F / A  |  ε = ΔL / L₀  |  E = σ / ε',
    description: 'Calculate normal mechanical stress, axial strain, and resulting deformation under load.',
    fields: [
      { id: 'f', label: 'Axial Force (F)', unit: 'N', defaultValue: 25000, description: 'Applied tensile or compressive load' },
      { id: 'a', label: 'Cross-Section Area (A)', unit: 'm²', defaultValue: 0.0005, description: 'Cross sectional area (e.g. 500 mm² = 0.0005 m²)' },
      { id: 'e', label: "Young's Modulus (E)", unit: 'Pa', defaultValue: 200e9, description: 'Material elastic modulus (Structural Steel ≈ 200 GPa = 200e9)' },
      { id: 'l0', label: 'Original Length (L₀)', unit: 'm', defaultValue: 2.0, description: 'Original member length' }
    ],
    calculate: (inputs) => {
      const { f, a, e, l0 } = inputs;
      if (a <= 0 || e <= 0 || l0 <= 0) return { results: [{ label: 'Error', value: 'Area, E, and length must be positive', unit: '' }] };
      const sigma = f / a;
      const epsilon = sigma / e;
      const deltaL = epsilon * l0;
      return {
        results: [
          { label: 'Normal Stress (σ)', value: Number((sigma / 1e6).toPrecision(6)), unit: 'MPa', note: `${Number(sigma.toPrecision(6))} Pa` },
          { label: 'Axial Strain (ε)', value: Number(epsilon.toPrecision(6)), unit: 'strain', note: `${Number((epsilon * 100).toPrecision(4))} %` },
          { label: 'Elongation (ΔL)', value: Number((deltaL * 1000).toPrecision(6)), unit: 'mm', note: `${Number(deltaL.toPrecision(6))} m` }
        ]
      };
    }
  },

  // 6. Cantilever Beam Deflection
  {
    id: 'beam-deflection',
    category: 'Mechanical',
    title: 'Cantilever Beam End-Point Deflection',
    formula: 'δ_max = (F · L³) / (3 · E · I)',
    description: 'Calculates maximum tip deflection and bending moment for a fixed-end cantilever beam with end point load.',
    fields: [
      { id: 'f', label: 'Applied Point Load (F)', unit: 'N', defaultValue: 1000, description: 'Vertical force at tip' },
      { id: 'l', label: 'Beam Length (L)', unit: 'm', defaultValue: 1.5, description: 'Unsupported cantilever span' },
      { id: 'e', label: "Young's Modulus (E)", unit: 'Pa', defaultValue: 210e9, description: 'Modulus of elasticity (Steel ≈ 210 GPa)' },
      { id: 'i', label: 'Area Moment of Inertia (I)', unit: 'm⁴', defaultValue: 4.5e-6, description: 'Second moment of area of cross section' },
    ],
    calculate: (inputs) => {
      const { f, l, e, i } = inputs;
      if (l <= 0 || e <= 0 || i <= 0) return { results: [{ label: 'Error', value: 'Dimensions and properties must be positive', unit: '' }] };
      const delta = (f * Math.pow(l, 3)) / (3 * e * i);
      const moment = f * l;
      return {
        results: [
          { label: 'Max Deflection (δ_max)', value: Number((delta * 1000).toPrecision(6)), unit: 'mm', note: `${Number(delta.toPrecision(6))} m` },
          { label: 'Max Bending Moment (M_max)', value: Number(moment.toPrecision(6)), unit: 'N · m' },
          { label: 'End Slope (θ)', value: Number(((f * Math.pow(l, 2)) / (2 * e * i)).toPrecision(5)), unit: 'rad' }
        ]
      };
    }
  },

  // 7. Torque & Rotational Power
  {
    id: 'torque-power',
    category: 'Mechanical',
    title: 'Torque, RPM & Shaft Power',
    formula: 'P = τ · ω = τ · (2π · N / 60)',
    description: 'Calculate shaft mechanical power from motor rotational speed and torque.',
    fields: [
      { id: 'tau', label: 'Torque (τ)', unit: 'N · m', defaultValue: 150, description: 'Rotational shaft torque' },
      { id: 'rpm', label: 'Rotational Speed (N)', unit: 'RPM', defaultValue: 3000, description: 'Revolutions per minute' },
    ],
    calculate: (inputs) => {
      const { tau, rpm } = inputs;
      const omega = (2 * Math.PI * rpm) / 60;
      const powerWatts = tau * omega;
      const hp = powerWatts / 745.69987;
      return {
        results: [
          { label: 'Mechanical Power (P)', value: Number((powerWatts / 1000).toPrecision(6)), unit: 'kW', note: `${Number(powerWatts.toPrecision(6))} W` },
          { label: 'Horsepower', value: Number(hp.toPrecision(5)), unit: 'HP' },
          { label: 'Angular Velocity (ω)', value: Number(omega.toPrecision(6)), unit: 'rad / s' }
        ]
      };
    }
  },

  // 8. Reynolds Number (Fluid Mechanics)
  {
    id: 'reynolds-number',
    category: 'Fluids & Thermal',
    title: 'Reynolds Number (Pipe Flow)',
    formula: 'Re = (ρ · v · D) / μ = (v · D) / ν',
    description: 'Determine whether internal fluid flow is laminar, transitional, or turbulent.',
    fields: [
      { id: 'rho', label: 'Fluid Density (ρ)', unit: 'kg / m³', defaultValue: 998.2, description: 'Water @ 20°C ≈ 998 kg/m³' },
      { id: 'v', label: 'Flow Velocity (v)', unit: 'm / s', defaultValue: 1.5, description: 'Mean flow velocity' },
      { id: 'd', label: 'Pipe Internal Diameter (D)', unit: 'm', defaultValue: 0.05, description: 'Internal pipe diameter (e.g. 50mm = 0.05m)' },
      { id: 'mu', label: 'Dynamic Viscosity (μ)', unit: 'Pa · s', defaultValue: 0.001002, description: 'Water @ 20°C ≈ 1.002e-3 Pa·s' },
    ],
    calculate: (inputs) => {
      const { rho, v, d, mu } = inputs;
      if (rho <= 0 || d <= 0 || mu <= 0) return { results: [{ label: 'Error', value: 'Density, diameter, and viscosity must be positive', unit: '' }] };
      const re = (rho * v * d) / mu;
      let regime = 'Laminar (Re < 2,300)';
      if (re > 4000) {
        regime = 'Turbulent (Re > 4,000)';
      } else if (re >= 2300) {
        regime = 'Transitional (2,300 ≤ Re ≤ 4,000)';
      }
      return {
        results: [
          { label: 'Reynolds Number (Re)', value: Number(Math.round(re)), unit: 'dimensionless' },
          { label: 'Flow Regime', value: regime, unit: '' },
          { label: 'Kinematic Viscosity (ν)', value: (mu / rho).toExponential(4), unit: 'm² / s' }
        ]
      };
    }
  },

  // 9. Ideal Gas Law
  {
    id: 'ideal-gas-law',
    category: 'Fluids & Thermal',
    title: 'Ideal Gas Law (P · V = n · R · T)',
    formula: 'P = (n · R · T) / V',
    description: 'Calculate pressure of an ideal gas given volume, temperature, and amount of substance.',
    fields: [
      { id: 'v', label: 'Volume (V)', unit: 'm³', defaultValue: 0.05, description: 'Container volume (50 L = 0.05 m³)' },
      { id: 'n', label: 'Moles of Gas (n)', unit: 'mol', defaultValue: 2.0, description: 'Amount of substance' },
      { id: 't_c', label: 'Temperature (T)', unit: '°C', defaultValue: 25, description: 'Gas temperature in Celsius' },
    ],
    calculate: (inputs) => {
      const { v, n, t_c } = inputs;
      if (v <= 0 || n <= 0) return { results: [{ label: 'Error', value: 'Volume and moles must be positive', unit: '' }] };
      const R = 8.314462618;
      const t_k = t_c + 273.15;
      if (t_k <= 0) return { results: [{ label: 'Error', value: 'Temperature below absolute zero', unit: '' }] };
      const p_pa = (n * R * t_k) / v;
      const p_bar = p_pa / 1e5;
      const p_atm = p_pa / 101325;
      const p_psi = p_pa / 6894.757;
      return {
        results: [
          { label: 'Pressure (P)', value: Number((p_pa / 1000).toPrecision(6)), unit: 'kPa', note: `${Number(p_pa.toPrecision(6))} Pa` },
          { label: 'In Bar', value: Number(p_bar.toPrecision(5)), unit: 'bar' },
          { label: 'In Atmospheres', value: Number(p_atm.toPrecision(5)), unit: 'atm' },
          { label: 'In PSI', value: Number(p_psi.toPrecision(5)), unit: 'psi' }
        ]
      };
    }
  }
];
