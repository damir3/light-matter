/**
 * Database of Materials and their Electronic Orbital Configurations
 * 
 * For each material:
 * - Atomic structure & electron configuration (inner core + outer valence shells)
 * - Outer orbitals role: conduction band (free electrons) vs interband transitions (bound valence electrons)
 * - Physical parameters: density, atomic mass, atomic concentration, effective mass ratio
 * - Drude-Lorentz dispersion parameters representing outer orbital dynamics
 * - Calibrated against experimental benchmarks (Johnson & Christy 1972, Palik, Malitson, etc.)
 */

const MATERIALS = [
  // ==================== NOBLE & PLASMONIC METALS ====================
  {
    id: 'gold',
    name: 'Gold (Au)',
    nameEn: 'Gold (Au)',
    formula: 'Au',
    category: 'metal',
    categoryName: 'Noble Metal',
    atomicNumber: 79,
    density: 19.30, // g/cm^3
    molarMass: 196.97, // g/mol
    valenceElectrons: 1, // 6s^1
    effectiveMassRatio: 1.0, // m*/m0
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',
    outerOrbitals: [
      {
        shell: '6s¹',
        type: 'conduction',
        desc: 'The single 6s valence electron is delocalized into the conduction band (free electron gas), providing classical Drude response in red and IR wavelengths with plasma energy Ep ≈ 9.06 eV and collision damping γ₀ = 0.050 eV (relaxation time τ ≈ 26 fs).'
      },
      {
        shell: '5d¹⁰ (core polarization)',
        type: 'core_polarization',
        desc: 'The filled 5d shell has high polarizability, contributing a large positive background permittivity ε∞ ≈ 5.90 that screens the negative free-electron plasma response across optical frequencies.'
      },
      {
        shell: '5d¹⁰ → 6s/6p (interband transitions)',
        type: 'interband',
        thresholdEnergy: 2.4, // eV (~515 nm)
        desc: 'Interband transitions from the 5d band to the Fermi level near the L symmetry point begin above 2.4 eV (λ < 515 nm). This causes steep absorption in blue and UV light (n rises to ~1.4, k ~ 1.9), giving gold its iconic warm yellow luster.'
      }
    ],
    plasmaEnergy: 9.06, // Ep = hbar * omega_p (eV)
    epsInf: 5.90,       // Background permittivity from filled 5d and deeper shells
    drude: { f: 1.0, gamma: 0.050 }, // Collision damping gamma = hbar/tau = 0.050 eV
    oscillators: [
      {
        name: '5d → 6s (interband transition near L-point)',
        energy: 2.72,   // ~455 nm
        strength: 5.8,  // Lorentz oscillator amplitude
        gamma: 0.55,    // Spectral damping width (eV)
        orbitals: '5d → 6s (L-gap)',
        desc: 'Resonant transition of electrons from the top of the 5d band to the Fermi surface along the L direction.'
      },
      {
        name: '5d → 6p (interband transition near X-point)',
        energy: 3.65,   // ~340 nm
        strength: 14.0,
        gamma: 0.95,
        orbitals: '5d → 6p (X-gap)',
        desc: 'Transition from lower 5d subbands to the conduction band near the Brillouin zone boundary.'
      },
      {
        name: 'Deep UV interband continuum',
        energy: 8.50,   // ~146 nm
        strength: 35.0,
        gamma: 3.50,
        orbitals: '5d → higher conduction bands',
        desc: 'Broad continuum excitation of core 5d electrons.'
      }
    ],
    physicsNote: 'Gold\'s yellow color stems directly from relativistic contraction of the 6s orbital and expansion of the 5d shell, shifting the 5d → 6s interband absorption threshold down to 2.4 eV (~515 nm). In the red (633 nm), n ≈ 0.18, k ≈ 3.43 (reflectance R > 94%), whereas in the blue (450 nm), n ≈ 1.38, k ≈ 1.91 (R ≈ 38%).',
    experimentalRef: 'Johnson and Christy, Phys. Rev. B 6, 4370 (1972)',
    experimentalData: [
      { wl: 187.9, n: 1.28, k: 1.188 },
      { wl: 207.3, n: 1.30, k: 1.304 },
      { wl: 226.2, n: 1.31, k: 1.460 },
      { wl: 249.0, n: 1.33, k: 1.631 },
      { wl: 268.9, n: 1.38, k: 1.803 },
      { wl: 292.4, n: 1.49, k: 1.878 },
      { wl: 310.7, n: 1.53, k: 1.893 },
      { wl: 331.5, n: 1.48, k: 1.883 },
      { wl: 354.2, n: 1.50, k: 1.866 },
      { wl: 381.5, n: 1.46, k: 1.933 },
      { wl: 397.4, n: 1.47, k: 1.952 },
      { wl: 413.3, n: 1.46, k: 1.958 },
      { wl: 430.5, n: 1.45, k: 1.948 },
      { wl: 450.9, n: 1.38, k: 1.914 },
      { wl: 471.4, n: 1.31, k: 1.849 },
      { wl: 495.9, n: 1.04, k: 1.833 },
      { wl: 520.9, n: 0.62, k: 2.081 },
      { wl: 548.6, n: 0.43, k: 2.455 },
      { wl: 582.1, n: 0.29, k: 2.863 },
      { wl: 616.8, n: 0.21, k: 3.272 },
      { wl: 632.8, n: 0.18, k: 3.433 },
      { wl: 659.5, n: 0.14, k: 3.697 },
      { wl: 704.5, n: 0.13, k: 4.103 },
      { wl: 756.0, n: 0.14, k: 4.542 },
      { wl: 821.1, n: 0.16, k: 5.083 },
      { wl: 892.0, n: 0.17, k: 5.663 },
      { wl: 984.0, n: 0.22, k: 6.350 },
      { wl: 1088.0, n: 0.27, k: 7.150 },
      { wl: 1216.0, n: 0.35, k: 8.145 },
      { wl: 1393.0, n: 0.43, k: 9.519 },
      { wl: 1610.0, n: 0.56, k: 11.21 },
      { wl: 1937.0, n: 0.92, k: 13.78 }
    ]
  },

  {
    id: 'silver',
    name: 'Silver (Ag)',
    nameEn: 'Silver (Ag)',
    formula: 'Ag',
    category: 'metal',
    categoryName: 'Noble Metal',
    atomicNumber: 47,
    density: 10.49,
    molarMass: 107.87,
    valenceElectrons: 1, // 5s^1
    effectiveMassRatio: 0.96,
    electronConfig: '[Kr] 4d¹⁰ 5s¹',
    outerOrbitals: [
      {
        shell: '5s¹',
        type: 'conduction',
        desc: 'One 5s electron per atom forms a near-ideal Drude electron gas with extraordinarily low collision damping (γ = 0.022 eV, τ ≈ 30 fs), yielding an ultra-low index n ~ 0.04–0.06 in the visible spectrum.'
      },
      {
        shell: '4d¹⁰ (core polarization)',
        type: 'core_polarization',
        desc: 'The polarizability of the filled 4d¹⁰ core provides a screening background permittivity ε∞ ≈ 3.70.'
      },
      {
        shell: '4d¹⁰ → 5s (interband transitions in UV)',
        type: 'interband',
        thresholdEnergy: 3.9, // eV (~318 nm)
        desc: 'Unlike gold, the filled 4d shell lies deep (~3.9 eV below the Fermi surface). Interband transitions occur only in the near-UV (λ < 318 nm).'
      }
    ],
    plasmaEnergy: 9.15,
    epsInf: 3.70,
    drude: { f: 1.0, gamma: 0.022 },
    oscillators: [
      {
        name: '4d → 5s UV interband threshold',
        energy: 4.15,   // ~298 nm
        strength: 5.2,
        gamma: 0.35,
        orbitals: '4d → 5s (L-point)',
        desc: 'Direct dipole transition from the 4d shell to the Fermi level in the UV band.'
      },
      {
        name: '4d → 5p high-energy UV transition',
        energy: 5.20,   // ~238 nm
        strength: 15.0,
        gamma: 1.20,
        orbitals: '4d → 5p (X-point)',
        desc: 'Transitions into higher unoccupied states of the conduction band.'
      }
    ],
    physicsNote: 'Because silver has no interband transitions in the visible band (380–780 nm), it exhibits an extraordinarily low refractive index (n ≈ 0.04–0.06) and high extinction (k ~ 2–5), resulting in record-high reflectance R > 98–99% across the entire visual spectrum.',
    experimentalRef: 'Johnson and Christy, Phys. Rev. B 6, 4370 (1972)',
    experimentalData: [
      { wl: 187.9, n: 1.07, k: 1.212 },
      { wl: 226.2, n: 1.26, k: 1.344 },
      { wl: 261.6, n: 1.35, k: 1.387 },
      { wl: 300.9, n: 1.34, k: 0.964 },
      { wl: 310.7, n: 1.13, k: 0.616 },
      { wl: 320.4, n: 0.81, k: 0.392 },
      { wl: 331.5, n: 0.17, k: 0.829 },
      { wl: 342.5, n: 0.14, k: 1.142 },
      { wl: 354.2, n: 0.10, k: 1.419 },
      { wl: 367.9, n: 0.07, k: 1.657 },
      { wl: 381.5, n: 0.05, k: 1.864 },
      { wl: 400.0, n: 0.05, k: 2.070 },
      { wl: 430.5, n: 0.04, k: 2.462 },
      { wl: 450.9, n: 0.04, k: 2.657 },
      { wl: 471.4, n: 0.05, k: 2.869 },
      { wl: 495.9, n: 0.05, k: 3.093 },
      { wl: 520.9, n: 0.05, k: 3.324 },
      { wl: 548.6, n: 0.06, k: 3.586 },
      { wl: 582.1, n: 0.05, k: 3.858 },
      { wl: 616.8, n: 0.06, k: 4.152 },
      { wl: 632.8, n: 0.055, k: 4.280 },
      { wl: 659.5, n: 0.05, k: 4.483 },
      { wl: 704.5, n: 0.04, k: 4.838 },
      { wl: 756.0, n: 0.03, k: 5.242 },
      { wl: 821.1, n: 0.04, k: 5.727 },
      { wl: 892.0, n: 0.04, k: 6.312 },
      { wl: 984.0, n: 0.04, k: 6.992 },
      { wl: 1088.0, n: 0.04, k: 7.795 },
      { wl: 1216.0, n: 0.09, k: 8.828 },
      { wl: 1393.0, n: 0.13, k: 10.10 },
      { wl: 1610.0, n: 0.15, k: 11.85 },
      { wl: 1937.0, n: 0.24, k: 14.08 }
    ]
  },

  {
    id: 'copper',
    name: 'Copper (Cu)',
    nameEn: 'Copper (Cu)',
    formula: 'Cu',
    category: 'metal',
    categoryName: 'Noble Metal',
    atomicNumber: 29,
    density: 8.96,
    molarMass: 63.55,
    valenceElectrons: 1, // 4s^1
    effectiveMassRatio: 1.01,
    electronConfig: '[Ar] 3d¹⁰ 4s¹',
    outerOrbitals: [
      {
        shell: '4s¹',
        type: 'conduction',
        desc: 'The outer 4s electron forms the Drude conduction band.'
      },
      {
        shell: '3d¹⁰ (core polarization)',
        type: 'core_polarization',
        desc: 'Polarization of the filled 3d shell provides a screening background contribution ε∞ ≈ 5.80.'
      },
      {
        shell: '3d¹⁰ → 4s (interband transitions)',
        type: 'interband',
        thresholdEnergy: 2.15, // eV (~576 nm)
        desc: 'The 3d shell of copper lies very close to the Fermi level (~2.15 eV). Interband absorption begins in the yellow-green region (λ < 580 nm).'
      }
    ],
    plasmaEnergy: 9.35,
    epsInf: 5.80,
    drude: { f: 1.0, gamma: 0.055 },
    oscillators: [
      {
        name: '3d → 4s interband threshold (2.15 eV)',
        energy: 2.15,
        strength: 4.8,
        gamma: 0.38,
        orbitals: '3d → 4s (L-point)',
        desc: 'Electron excitation from the 3d band into unoccupied states above the Fermi surface.'
      },
      {
        name: '3d → 4p optical transition (X-point)',
        energy: 3.20,
        strength: 14.5,
        gamma: 0.95,
        orbitals: '3d → 4p',
        desc: 'Transitions into higher conduction states.'
      },
      {
        name: 'Deep UV continuum',
        energy: 5.20,
        strength: 35.0,
        gamma: 2.50,
        orbitals: '3d → conduction',
        desc: 'Broad UV interband continuum.'
      }
    ],
    physicsNote: 'Interband transitions from 3d to 4s orbitals begin at 2.15 eV (~576 nm). Strong absorption of blue and green wavelengths with high reflectance only for orange and red creates copper\'s distinctive reddish-orange hue.',
    experimentalRef: 'Johnson and Christy, Phys. Rev. B 6, 4370 (1972)',
    experimentalData: [
      { wl: 187.9, n: 0.94, k: 1.337 },
      { wl: 261.6, n: 1.41, k: 1.691 },
      { wl: 342.5, n: 1.36, k: 1.864 },
      { wl: 381.5, n: 1.33, k: 2.045 },
      { wl: 413.3, n: 1.28, k: 2.207 },
      { wl: 450.9, n: 1.24, k: 2.397 },
      { wl: 495.9, n: 1.22, k: 2.564 },
      { wl: 520.9, n: 1.18, k: 2.608 },
      { wl: 548.6, n: 1.02, k: 2.577 },
      { wl: 582.1, n: 0.70, k: 2.704 },
      { wl: 616.8, n: 0.30, k: 3.205 },
      { wl: 632.8, n: 0.25, k: 3.450 },
      { wl: 659.5, n: 0.22, k: 3.747 },
      { wl: 704.5, n: 0.21, k: 4.205 },
      { wl: 756.0, n: 0.24, k: 4.665 },
      { wl: 821.1, n: 0.26, k: 5.180 },
      { wl: 984.0, n: 0.32, k: 6.421 },
      { wl: 1216.0, n: 0.48, k: 8.245 },
      { wl: 1610.0, n: 0.76, k: 11.12 },
      { wl: 1937.0, n: 1.09, k: 13.43 }
    ]
  },

  {
    id: 'aluminum',
    name: 'Aluminium (Al)',
    nameEn: 'Aluminium (Al)',
    formula: 'Al',
    category: 'metal',
    categoryName: 'Simple Metal',
    atomicNumber: 13,
    density: 2.70,
    molarMass: 26.98,
    valenceElectrons: 3, // 3s^2 3p^1
    effectiveMassRatio: 1.03,
    electronConfig: '[Ne] 3s² 3p¹',
    outerOrbitals: [
      {
        shell: '3s² 3p¹',
        type: 'conduction',
        desc: 'Three valence electrons per atom are shared in a high-density free-electron gas (plasma energy Ep ≈ 15.0 eV, extending high reflectance deep into the vacuum UV).'
      },
      {
        shell: 'Parallel bands (3s-3p hybridization)',
        type: 'interband',
        thresholdEnergy: 1.5, // eV (~800 nm)
        desc: 'Near the Brillouin zone boundaries, conduction bands split by 2|V₂₀₀| ~ 1.5 eV, producing a characteristic interband absorption peak in the near-IR (~800 nm).'
      }
    ],
    plasmaEnergy: 14.98,
    epsInf: 1.0,
    drude: { f: 0.65, gamma: 0.055 },
    oscillators: [
      { name: 'W-K parallel band interband transition', energy: 1.500, strength: 52.0, gamma: 0.35, orbitals: '3s/3p parallel bands' },
      { name: 'UV transition to higher bands', energy: 5.000, strength: 40.0, gamma: 2.50, orbitals: '3s/3p → 3d' }
    ],
    physicsNote: 'With 3 valence electrons per atom, aluminium has an extremely high plasma frequency (15 eV), providing brilliant reflectance across all visible and UV wavelengths down to 200 nm, marked only by the ~800 nm parallel-band absorption dip.',
    experimentalRef: 'Rakic, Appl. Opt. 34, 4755 (1995)',
    experimentalData: [
      { wl: 206.6, n: 0.127, k: 2.356 },
      { wl: 248.0, n: 0.181, k: 2.903 },
      { wl: 310.0, n: 0.28, k: 3.708 },
      { wl: 326.3, n: 0.315, k: 3.917 },
      { wl: 364.7, n: 0.399, k: 4.396 },
      { wl: 413.3, n: 0.521, k: 5.001 },
      { wl: 442.8, n: 0.608, k: 5.368 },
      { wl: 476.9, n: 0.728, k: 5.778 },
      { wl: 516.6, n: 0.873, k: 6.242 },
      { wl: 563.6, n: 1.073, k: 6.784 },
      { wl: 619.9, n: 1.366, k: 7.405 },
      { wl: 652.2, n: 1.572, k: 7.735 },
      { wl: 688.8, n: 1.83, k: 8.06 },
      { wl: 729.3, n: 2.161, k: 8.357 },
      { wl: 774.9, n: 2.615, k: 8.491 },
      { wl: 794.8, n: 2.768, k: 8.387 },
      { wl: 815.7, n: 2.767, k: 8.257 },
      { wl: 837.7, n: 2.695, k: 8.188 },
      { wl: 885.6, n: 2.28, k: 8.113 },
      { wl: 911.7, n: 1.974, k: 8.306 },
      { wl: 939.3, n: 1.678, k: 8.597 },
      { wl: 968.6, n: 1.487, k: 9.066 },
      { wl: 999.9, n: 1.436, k: 9.494 },
      { wl: 1033.2, n: 1.4, k: 9.891 },
      { wl: 1127.1, n: 1.328, k: 10.969 },
      { wl: 1239.9, n: 1.316, k: 12.245 },
      { wl: 1377.6, n: 1.39, k: 13.784 },
      { wl: 1549.8, n: 1.578, k: 15.656 },
      { wl: 1771.2, n: 1.921, k: 17.991 },
      { wl: 2066.4, n: 2.474, k: 20.982 }
    ]
  },

  {
    id: 'platinum',
    name: 'Platinum (Pt)',
    nameEn: 'Platinum (Pt)',
    formula: 'Pt',
    category: 'metal',
    categoryName: 'Noble Metal',
    atomicNumber: 78,
    density: 21.45,
    molarMass: 195.08,
    valenceElectrons: 1, // 6s^1
    effectiveMassRatio: 1.2,
    electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹',
    outerOrbitals: [
      {
        shell: '6s¹',
        type: 'conduction',
        desc: 'Conduction electrons experiencing strong scattering into d states.'
      },
      {
        shell: '5d⁹',
        type: 'interband',
        thresholdEnergy: 0.5,
        desc: 'A partially filled, narrow 5d band crosses the Fermi level, creating a continuous spectrum of interband transitions throughout optical and near-IR wavelengths.'
      }
    ],
    plasmaEnergy: 9.88,
    epsInf: 2.5,
    drude: { f: 0.45, gamma: 0.080 },
    oscillators: [
      { name: '5d → Fermi interband transition 1', energy: 0.780, strength: 12.0, gamma: 0.85, orbitals: '5d → 6s' },
      { name: '5d → 6p optical transition', energy: 2.500, strength: 35.0, gamma: 2.20, orbitals: '5d → 6p' },
      { name: 'UV d-transition', energy: 5.200, strength: 75.0, gamma: 3.50, orbitals: '5d → higher' }
    ],
    physicsNote: 'Because the 5d shell is incompletely filled (5d⁹) and intersects the Fermi energy, interband damping is strong across the entire visible spectrum, resulting in moderate reflectance (~70%) and a neutral steel-gray appearance.',
    experimentalRef: 'Werner et al., J. Phys. Chem. Ref. Data 38, 1013 (2009)',
    experimentalData: [
      { wl: 190.7, n: 1.377, k: 1.629 },
      { wl: 206.6, n: 1.288, k: 1.726 },
      { wl: 225.4, n: 1.175, k: 1.907 },
      { wl: 248.0, n: 1.106, k: 2.217 },
      { wl: 261.0, n: 1.145, k: 2.4 },
      { wl: 275.5, n: 1.219, k: 2.512 },
      { wl: 291.7, n: 1.188, k: 2.601 },
      { wl: 310.0, n: 1.151, k: 2.838 },
      { wl: 330.6, n: 1.304, k: 3.105 },
      { wl: 354.2, n: 1.537, k: 3.062 },
      { wl: 381.5, n: 1.288, k: 2.908 },
      { wl: 413.3, n: 0.868, k: 3.213 },
      { wl: 450.9, n: 0.627, k: 3.76 },
      { wl: 495.9, n: 0.512, k: 4.396 },
      { wl: 551.0, n: 0.464, k: 5.121 },
      { wl: 619.9, n: 0.461, k: 5.976 },
      { wl: 708.5, n: 0.501, k: 7.027 },
      { wl: 826.6, n: 0.598, k: 8.382 },
      { wl: 991.9, n: 0.787, k: 10.227 },
      { wl: 1239.8, n: 1.159, k: 12.921 },
      { wl: 1653.1, n: 1.976, k: 17.28 }
    ]
  },

  {
    id: 'titanium',
    name: 'Titanium (Ti)',
    nameEn: 'Titanium (Ti)',
    formula: 'Ti',
    category: 'metal',
    categoryName: 'Transition Metal',
    atomicNumber: 22,
    density: 4.506,
    molarMass: 47.87,
    valenceElectrons: 4, // 3d^2 4s^2
    effectiveMassRatio: 1.3,
    electronConfig: '[Ar] 3d² 4s²',
    outerOrbitals: [
      {
        shell: '4s²',
        type: 'conduction',
        desc: 'Valence 4s electrons form the Drude conduction band.'
      },
      {
        shell: '3d²',
        type: 'interband',
        thresholdEnergy: 0.8,
        desc: 'Partially filled 3d shell gives rise to strong optical interband transitions across visible wavelengths.'
      }
    ],
    plasmaEnergy: 7.29,
    epsInf: 2.0,
    drude: { f: 0.25, gamma: 0.082 },
    oscillators: [
      { name: '3d → 4s/4p interband transition', energy: 0.95, strength: 18.0, gamma: 1.10, orbitals: '3d → 4p' },
      { name: 'Optical d-d resonance', energy: 2.10, strength: 35.0, gamma: 1.95, orbitals: '3d → 3d*' },
      { name: 'UV 3d transition to upper bands', energy: 4.50, strength: 65.0, gamma: 3.50, orbitals: '3d/4s → 4p' }
    ],
    physicsNote: 'Titanium has a complex band structure with partially occupied 3d states, producing high extinction (k ~ 2–3) and ~50–60% reflectance in visible light.',
    experimentalRef: 'Johnson and Christy, Phys. Rev. B 9, 5056 (1974)',
    experimentalData: [
      { wl: 188.0, n: 1.1, k: 1.62 },
      { wl: 192.0, n: 1.16, k: 1.64 },
      { wl: 199.0, n: 1.25, k: 1.68 },
      { wl: 203.0, n: 1.27, k: 1.69 },
      { wl: 212.0, n: 1.31, k: 1.68 },
      { wl: 221.0, n: 1.32, k: 1.66 },
      { wl: 226.0, n: 1.32, k: 1.66 },
      { wl: 237.0, n: 1.3, k: 1.72 },
      { wl: 249.0, n: 1.27, k: 1.83 },
      { wl: 255.0, n: 1.26, k: 1.91 },
      { wl: 269.0, n: 1.27, k: 2.07 },
      { wl: 276.0, n: 1.3, k: 2.17 },
      { wl: 292.0, n: 1.4, k: 2.36 },
      { wl: 311.0, n: 1.5, k: 2.57 },
      { wl: 320.0, n: 1.55, k: 2.66 },
      { wl: 342.0, n: 1.72, k: 2.82 },
      { wl: 368.0, n: 1.9, k: 2.9 },
      { wl: 381.0, n: 1.99, k: 2.93 },
      { wl: 413.0, n: 2.14, k: 2.98 },
      { wl: 451.0, n: 2.27, k: 3.04 },
      { wl: 471.0, n: 2.32, k: 3.1 },
      { wl: 521.0, n: 2.44, k: 3.3 },
      { wl: 549.0, n: 2.54, k: 3.43 },
      { wl: 617.0, n: 2.67, k: 3.72 },
      { wl: 704.0, n: 2.86, k: 3.96 },
      { wl: 756.0, n: 3.0, k: 4.01 },
      { wl: 892.0, n: 3.29, k: 3.96 },
      { wl: 1088.0, n: 3.5, k: 4.02 },
      { wl: 1216.0, n: 3.62, k: 4.15 },
      { wl: 1937.0, n: 3.51, k: 5.19 }
    ]
  },

  {
    id: 'chromium',
    name: 'Chromium (Cr)',
    nameEn: 'Chromium (Cr)',
    formula: 'Cr',
    category: 'metal',
    categoryName: 'Transition Metal',
    atomicNumber: 24,
    density: 7.19,
    molarMass: 52.00,
    valenceElectrons: 6,
    effectiveMassRatio: 1.15,
    electronConfig: '[Ar] 3d⁵ 4s¹',
    outerOrbitals: [
      { shell: '4s¹', type: 'conduction', desc: 'Single 4s conduction electron.' },
      { shell: '3d⁵', type: 'interband', desc: 'Half-filled, stable 3d subshell producing strong interband transitions.' }
    ],
    plasmaEnergy: 10.75,
    epsInf: 2.2,
    drude: { f: 0.22, gamma: 0.055 },
    oscillators: [
      { name: '3d interband resonance 1', energy: 0.85, strength: 16.0, gamma: 0.65, orbitals: '3d → 4s' },
      { name: '3d → 4p optical transition', energy: 2.30, strength: 42.0, gamma: 1.80, orbitals: '3d → 4p' },
      { name: 'UV interband continuum', energy: 4.80, strength: 80.0, gamma: 3.20, orbitals: '3d → 4d' }
    ],
    physicsNote: 'Chromium features a half-filled 3d⁵ subshell, providing brilliant, durable specular reflectance (~65–70%) across the entire spectrum.',
    experimentalRef: 'Johnson and Christy, Phys. Rev. B 9, 5056 (1974)',
    experimentalData: [
      { wl: 188.0, n: 1.28, k: 1.64 },
      { wl: 192.0, n: 1.31, k: 1.65 },
      { wl: 199.0, n: 1.39, k: 1.7 },
      { wl: 203.0, n: 1.43, k: 1.7 },
      { wl: 212.0, n: 1.46, k: 1.72 },
      { wl: 221.0, n: 1.45, k: 1.73 },
      { wl: 226.0, n: 1.43, k: 1.74 },
      { wl: 237.0, n: 1.38, k: 1.8 },
      { wl: 249.0, n: 1.36, k: 1.91 },
      { wl: 255.0, n: 1.37, k: 1.97 },
      { wl: 269.0, n: 1.39, k: 2.08 },
      { wl: 276.0, n: 1.43, k: 2.15 },
      { wl: 292.0, n: 1.48, k: 2.28 },
      { wl: 311.0, n: 1.58, k: 2.4 },
      { wl: 320.0, n: 1.65, k: 2.47 },
      { wl: 342.0, n: 1.76, k: 2.58 },
      { wl: 368.0, n: 1.87, k: 2.69 },
      { wl: 381.0, n: 1.92, k: 2.74 },
      { wl: 413.0, n: 2.08, k: 2.93 },
      { wl: 451.0, n: 2.33, k: 3.14 },
      { wl: 471.0, n: 2.51, k: 3.24 },
      { wl: 521.0, n: 2.94, k: 3.33 },
      { wl: 549.0, n: 3.18, k: 3.33 },
      { wl: 617.0, n: 3.17, k: 3.3 },
      { wl: 704.0, n: 3.05, k: 3.39 },
      { wl: 756.0, n: 3.08, k: 3.42 },
      { wl: 892.0, n: 3.3, k: 3.52 },
      { wl: 1088.0, n: 3.58, k: 3.58 },
      { wl: 1216.0, n: 3.67, k: 3.6 },
      { wl: 1937.0, n: 3.71, k: 5.04 }
    ]
  },

  {
    id: 'nickel',
    name: 'Nickel (Ni)',
    nameEn: 'Nickel (Ni)',
    formula: 'Ni',
    category: 'metal',
    categoryName: 'Transition Metal',
    atomicNumber: 28,
    density: 8.90,
    molarMass: 58.69,
    valenceElectrons: 2,
    effectiveMassRatio: 1.25,
    electronConfig: '[Ar] 3d⁸ 4s²',
    outerOrbitals: [
      { shell: '4s²', type: 'conduction', desc: '4s conduction electrons.' },
      { shell: '3d⁸', type: 'interband', desc: 'Ferromagnetic 3d band with spin-splitting.' }
    ],
    plasmaEnergy: 11.2,
    epsInf: 2.0,
    drude: { f: 0.18, gamma: 0.048 },
    oscillators: [
      { name: '3d interband IR transition', energy: 0.55, strength: 15.0, gamma: 0.70, orbitals: '3d spin-split' },
      { name: '3d → 4p optical transition', energy: 1.55, strength: 38.0, gamma: 1.50, orbitals: '3d → 4p' },
      { name: 'Visible interband transition', energy: 2.80, strength: 55.0, gamma: 2.20, orbitals: '3d → 4p/4d' },
      { name: 'UV transition', energy: 5.10, strength: 90.0, gamma: 3.80, orbitals: '3d → conduction' }
    ],
    physicsNote: 'Nickel exhibits substantial absorption in the visible band due to its dense, spin-split 3d band. Visible reflectance is approximately 60–65%.',
    experimentalRef: 'Johnson and Christy, Phys. Rev. B 9, 5056 (1974)',
    experimentalData: [
      { wl: 188.0, n: 1.26, k: 1.6 },
      { wl: 192.0, n: 1.29, k: 1.64 },
      { wl: 199.0, n: 1.28, k: 1.75 },
      { wl: 203.0, n: 1.28, k: 1.82 },
      { wl: 212.0, n: 1.32, k: 1.96 },
      { wl: 221.0, n: 1.38, k: 2.09 },
      { wl: 226.0, n: 1.43, k: 2.15 },
      { wl: 237.0, n: 1.57, k: 2.25 },
      { wl: 249.0, n: 1.73, k: 2.31 },
      { wl: 255.0, n: 1.82, k: 2.32 },
      { wl: 269.0, n: 1.96, k: 2.29 },
      { wl: 276.0, n: 2.01, k: 2.26 },
      { wl: 292.0, n: 2.03, k: 2.2 },
      { wl: 311.0, n: 2.01, k: 2.18 },
      { wl: 320.0, n: 1.93, k: 2.19 },
      { wl: 342.0, n: 1.78, k: 2.26 },
      { wl: 368.0, n: 1.7, k: 2.4 },
      { wl: 381.0, n: 1.72, k: 2.48 },
      { wl: 413.0, n: 1.7, k: 2.69 },
      { wl: 451.0, n: 1.73, k: 2.95 },
      { wl: 471.0, n: 1.78, k: 3.09 },
      { wl: 521.0, n: 1.85, k: 3.42 },
      { wl: 549.0, n: 1.92, k: 3.61 },
      { wl: 617.0, n: 1.99, k: 4.02 },
      { wl: 704.0, n: 2.06, k: 4.5 },
      { wl: 756.0, n: 2.13, k: 4.73 },
      { wl: 892.0, n: 2.4, k: 5.23 },
      { wl: 1088.0, n: 2.65, k: 5.93 },
      { wl: 1216.0, n: 2.79, k: 6.43 },
      { wl: 1937.0, n: 3.47, k: 9.09 }
    ]
  },

  // ==================== SEMICONDUCTORS ====================
  {
    id: 'silicon',
    name: 'Silicon (Si)',
    nameEn: 'Silicon (Si)',
    formula: 'Si',
    category: 'semiconductor',
    categoryName: 'Semiconductor',
    atomicNumber: 14,
    density: 2.33,
    molarMass: 28.09,
    valenceElectrons: 4, // 3s^2 3p^2 -> sp^3
    effectiveMassRatio: 1.0,
    electronConfig: '[Ne] 3s² 3p²',
    outerOrbitals: [
      {
        shell: '3s² 3p² (sp³ hybridization)',
        type: 'bonding',
        desc: 'In the diamond cubic lattice, outer 3s and 3p orbitals form four tetrahedral bonding sp³ orbitals (valence band) and four antibonding sp³* orbitals (conduction band).'
      },
      {
        shell: 'Indirect bandgap (Eg = 1.12 eV)',
        type: 'bandgap',
        thresholdEnergy: 1.12, // eV (~1100 nm)
        desc: 'Indirect bandgap transition from valence band maximum (Γ₂₅\') to conduction band minimum (Δ₁) mediated by phonons. Transparent for λ > 1.1 μm (k ≈ 0).'
      },
      {
        shell: 'Direct critical points E₁ (3.4 eV) and E₂ (4.25 eV)',
        type: 'direct_transitions',
        thresholdEnergy: 3.4,
        desc: 'Intense direct dipole transitions between parallel branches of sp³ valence and conduction bands along Λ (E₁) and X (E₂) directions in the Brillouin zone.'
      }
    ],
    plasmaEnergy: 0.0,
    epsInf: 1.0,
    drude: { f: 0.0, gamma: 0.0 },
    oscillators: [
      { name: 'Indirect absorption edge (Eg = 1.12 eV)', energy: 1.15, strength: 0.6, gamma: 0.15, orbitals: 'sp³ bonding → antibonding (indirect)' },
      { name: 'Direct transition E₁ (Λ-point, 3.42 eV / 362 nm)', energy: 3.42, strength: 43.5, gamma: 0.38, orbitals: 'L₃\' → L₁ (3p → 3p*)' },
      { name: 'Main transition E₂ (X-point, 4.25 eV / 292 nm)', energy: 4.25, strength: 98.0, gamma: 0.68, orbitals: 'X₄ → X₁ (sp³ σ → σ*)' },
      { name: 'Deep UV transition E₀\' (5.3 eV / 234 nm)', energy: 5.30, strength: 28.0, gamma: 1.25, orbitals: 'Γ₂₅\' → Γ₁₅' }
    ],
    physicsNote: 'In the visible range, silicon possesses a high refractive index (n ~ 3.6–4.5) and metallic luster due to proximity to the direct E₁ and E₂ resonances. In the infrared (λ > 1.1 μm), silicon becomes virtually transparent (n ≈ 3.48, k ≈ 0) — the foundation of infrared optics.',
    experimentalRef: 'Green (2008) / Aspnes (1983)',
    experimentalData: [
      { wl: 250, n: 1.59, k: 3.66 },
      { wl: 300, n: 5.02, k: 3.32 },
      { wl: 350, n: 5.48, k: 2.97 },
      { wl: 365, n: 6.52, k: 2.71 },
      { wl: 400, n: 5.57, k: 0.39 },
      { wl: 450, n: 4.67, k: 0.13 },
      { wl: 500, n: 4.30, k: 0.07 },
      { wl: 550, n: 4.09, k: 0.04 },
      { wl: 600, n: 3.94, k: 0.025 },
      { wl: 632.8, n: 3.88, k: 0.019 },
      { wl: 700, n: 3.78, k: 0.012 },
      { wl: 800, n: 3.69, k: 0.005 },
      { wl: 1000, n: 3.59, k: 0.0001 },
      { wl: 1200, n: 3.52, k: 0.0 },
      { wl: 1550, n: 3.48, k: 0.0 }
    ]
  },

  {
    id: 'germanium',
    name: 'Germanium (Ge)',
    nameEn: 'Germanium (Ge)',
    formula: 'Ge',
    category: 'semiconductor',
    categoryName: 'Semiconductor',
    atomicNumber: 32,
    density: 5.32,
    molarMass: 72.63,
    valenceElectrons: 4,
    effectiveMassRatio: 1.0,
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p²',
    outerOrbitals: [
      { shell: '4s² 4p² (sp³ hybridization)', type: 'bonding', desc: 'Tetrahedral covalent bonds with lower binding energy than silicon.' },
      { shell: 'Indirect gap Eg = 0.66 eV (~1878 nm)', type: 'bandgap', desc: 'Absorption edge shifted deeper into the IR, rendering germanium transparent from 2 to 14 μm.' }
    ],
    plasmaEnergy: 0.0,
    epsInf: 1.0,
    drude: { f: 0.0, gamma: 0.0 },
    oscillators: [
      { name: 'Fundamental absorption edge (0.67 eV)', energy: 0.70, strength: 1.2, gamma: 0.12, orbitals: 'sp³ bonding → antibonding' },
      { name: 'Direct transition E₁ (2.12 eV / 585 nm)', energy: 2.12, strength: 36.0, gamma: 0.35, orbitals: 'L₃\' → L₁' },
      { name: 'Spin-orbit split E₁ + Δ₁ (2.32 eV)', energy: 2.32, strength: 18.0, gamma: 0.40, orbitals: 'Spin-orbit split' },
      { name: 'Main resonance E₂ (4.40 eV / 282 nm)', energy: 4.40, strength: 110.0, gamma: 0.85, orbitals: 'X₄ → X₁' }
    ],
    physicsNote: 'Germanium has one of the highest infrared refractive indices (n ≈ 4.0–4.1 for λ > 2 μm), making it an indispensable material for thermal imaging lenses.',
    experimentalRef: 'Aspnes and Studna, Phys. Rev. B 27, 985 (1983)',
    experimentalData: [
      { wl: 206.6, n: 1.023, k: 2.774 },
      { wl: 213.8, n: 1.209, k: 2.873 },
      { wl: 221.4, n: 1.36, k: 2.846 },
      { wl: 229.6, n: 1.383, k: 2.854 },
      { wl: 238.4, n: 1.364, k: 2.973 },
      { wl: 248.0, n: 1.394, k: 3.197 },
      { wl: 258.3, n: 1.498, k: 3.509 },
      { wl: 269.5, n: 1.72, k: 3.96 },
      { wl: 281.8, n: 2.516, k: 4.669 },
      { wl: 295.2, n: 3.745, k: 4.009 },
      { wl: 310.0, n: 3.905, k: 3.336 },
      { wl: 335.1, n: 3.958, k: 2.863 },
      { wl: 354.2, n: 4.02, k: 2.667 },
      { wl: 375.7, n: 4.128, k: 2.469 },
      { wl: 399.9, n: 4.141, k: 2.215 },
      { wl: 427.5, n: 4.037, k: 2.14 },
      { wl: 459.2, n: 4.082, k: 2.24 },
      { wl: 495.9, n: 4.34, k: 2.384 },
      { wl: 539.1, n: 5.062, k: 2.318 },
      { wl: 590.4, n: 5.748, k: 1.634 },
      { wl: 652.5, n: 5.294, k: 0.638 },
      { wl: 826.6, n: 4.653, k: 0.298 },
      { wl: 1000.0, n: 4.275, k: 0.0 },
      { wl: 1200.0, n: 4.195, k: 0.0 },
      { wl: 1550.0, n: 4.125, k: 0.0 },
      { wl: 2000.0, n: 4.065, k: 0.0 }
    ]
  },

  {
    id: 'gaas',
    name: 'Gallium Arsenide (GaAs)',
    nameEn: 'Gallium Arsenide (GaAs)',
    formula: 'GaAs',
    category: 'semiconductor',
    categoryName: 'Semiconductor',
    atomicNumber: 31,
    density: 5.32,
    molarMass: 144.64,
    valenceElectrons: 4,
    effectiveMassRatio: 0.067,
    electronConfig: 'Ga: [Ar] 3d¹⁰ 4s² 4p¹ + As: [Ar] 3d¹⁰ 4s² 4p³',
    outerOrbitals: [
      { shell: 'Ga(4s² 4p¹) + As(4s² 4p³)', type: 'bonding', desc: 'Polar sp³ bonds in zincblende crystal structure.' },
      { shell: 'Direct bandgap Eg = 1.424 eV (~870 nm)', type: 'bandgap', desc: 'Direct optical bandgap at the center of the Brillouin zone (Γ point).' }
    ],
    plasmaEnergy: 0.0,
    epsInf: 1.0,
    drude: { f: 0.0, gamma: 0.0 },
    oscillators: [
      { name: 'Direct band edge E₀ (1.42 eV / 873 nm)', energy: 1.42, strength: 3.5, gamma: 0.06, orbitals: 'Γ₈v → Γ₆c' },
      { name: 'Spin-orbit split transition E₀ + Δ₀ (1.76 eV)', energy: 1.76, strength: 2.1, gamma: 0.10, orbitals: 'Γ₇v → Γ₆c' },
      { name: 'Direct resonance E₁ (3.02 eV / 410 nm)', energy: 3.02, strength: 42.0, gamma: 0.32, orbitals: 'L₄,₅v → L₆c' },
      { name: 'Main transition E₂ (5.05 eV / 245 nm)', energy: 5.05, strength: 95.0, gamma: 0.75, orbitals: 'X₇v → X₆c' }
    ],
    physicsNote: 'GaAs is a direct bandgap semiconductor. Highly transparent in the near-IR (λ > 900 nm) with n ≈ 3.4–3.6, while absorbing strongly across the visible spectrum.',
    experimentalRef: 'Aspnes et al., J. Appl. Phys. 60, 754 (1986)',
    experimentalData: [
      { wl: 206.6, n: 1.264, k: 2.472 },
      { wl: 213.8, n: 1.311, k: 2.625 },
      { wl: 221.4, n: 1.349, k: 2.815 },
      { wl: 229.6, n: 1.43, k: 3.079 },
      { wl: 238.4, n: 1.599, k: 3.484 },
      { wl: 248.0, n: 2.273, k: 4.084 },
      { wl: 258.3, n: 3.342, k: 3.77 },
      { wl: 269.5, n: 3.769, k: 3.169 },
      { wl: 281.8, n: 4.015, k: 2.563 },
      { wl: 295.2, n: 3.81, k: 2.069 },
      { wl: 310.0, n: 3.601, k: 1.92 },
      { wl: 335.1, n: 3.485, k: 1.931 },
      { wl: 354.2, n: 3.531, k: 2.013 },
      { wl: 375.7, n: 3.709, k: 2.162 },
      { wl: 399.9, n: 4.373, k: 2.146 },
      { wl: 427.5, n: 5.052, k: 1.721 },
      { wl: 459.2, n: 4.694, k: 0.696 },
      { wl: 495.9, n: 4.333, k: 0.441 },
      { wl: 539.1, n: 4.1, k: 0.32 },
      { wl: 590.4, n: 3.94, k: 0.24 },
      { wl: 652.5, n: 3.826, k: 0.179 },
      { wl: 826.6, n: 3.666, k: 0.08 },
      { wl: 900.0, n: 3.59, k: 0.0 },
      { wl: 1064.0, n: 3.48, k: 0.0 },
      { wl: 1310.0, n: 3.415, k: 0.0 },
      { wl: 1550.0, n: 3.375, k: 0.0 },
      { wl: 2000.0, n: 3.34, k: 0.0 }
    ]
  },

  // ==================== DIELECTRICS & OPTICAL OXIDES ====================
  {
    id: 'fused_silica',
    name: 'Fused Silica / Glass (SiO₂)',
    nameEn: 'Fused Silica / Glass (SiO₂)',
    formula: 'SiO₂',
    category: 'dielectric',
    categoryName: 'Dielectric & Oxide',
    atomicNumber: 14,
    density: 2.20,
    molarMass: 60.08,
    valenceElectrons: 8,
    effectiveMassRatio: 1.0,
    electronConfig: 'Si: [Ne] 3s² 3p² | O: [He] 2s² 2p⁴',
    outerOrbitals: [
      {
        shell: 'O(2p) lone pairs → Si(3s/3p) antibonding',
        type: 'bonding',
        desc: 'Si-O bonds exhibit mixed covalent-ionic character (~50% ionicity). The valence band consists primarily of oxygen 2p orbitals, while the conduction band is formed by silicon 3s/3p states.'
      },
      {
        shell: 'Wide bandgap Eg ≈ 9.0 eV (~138 nm)',
        type: 'bandgap',
        thresholdEnergy: 9.0,
        desc: 'Due to high Si-O bond strength, electronic interband transitions occur only in the deep vacuum UV (λ < 160 nm).'
      },
      {
        shell: 'Infrared optical phonon modes',
        type: 'phonon',
        thresholdEnergy: 0.13,
        desc: 'Lattice vibrations: symmetric and asymmetric Si-O stretching modes at 9.3 μm and 21 μm.'
      }
    ],
    plasmaEnergy: 0.0,
    epsInf: 1.0,
    drude: { f: 0.0, gamma: 0.0 },
    oscillators: [
      { name: 'O(2p) → Si(3s/3p) UV resonance 1', energy: 10.66, strength: 46.3, gamma: 0.02, orbitals: 'O(2p) → Si(3s)' },
      { name: 'O(2p) → Si(3p) deep UV 2', energy: 18.00, strength: 225.5, gamma: 0.05, orbitals: 'O(2p) → Si(3p)' },
      { name: 'IR optical phonon Si-O stretch (9.3 μm)', energy: 0.133, strength: 0.016, gamma: 0.006, orbitals: 'Lattice Si-O stretch' }
    ],
    physicsNote: 'Fused silica (SiO₂) is a standard optical benchmark. With its wide ~9 eV bandgap, it is exceptionally transparent (k ≈ 0, n ≈ 1.45–1.47) from the ultraviolet (180 nm) through the mid-infrared (3.5 μm).',
    experimentalRef: 'Malitson, J. Opt. Soc. Am. 55, 1205 (1965)',
    experimentalData: [
      { wl: 200, n: 1.551, k: 0.0 },
      { wl: 250, n: 1.507, k: 0.0 },
      { wl: 300, n: 1.488, k: 0.0 },
      { wl: 350, n: 1.477, k: 0.0 },
      { wl: 400, n: 1.470, k: 0.0 },
      { wl: 450, n: 1.466, k: 0.0 },
      { wl: 500, n: 1.462, k: 0.0 },
      { wl: 550, n: 1.460, k: 0.0 },
      { wl: 600, n: 1.458, k: 0.0 },
      { wl: 632.8, n: 1.457, k: 0.0 },
      { wl: 700, n: 1.455, k: 0.0 },
      { wl: 800, n: 1.453, k: 0.0 },
      { wl: 1000, n: 1.450, k: 0.0 },
      { wl: 1550, n: 1.444, k: 0.0 },
      { wl: 2000, n: 1.438, k: 0.0 }
    ]
  },

  {
    id: 'titanium_dioxide',
    name: 'Titanium Dioxide (TiO₂ - Rutile)',
    nameEn: 'Titanium Dioxide (TiO₂ - Rutile)',
    formula: 'TiO₂',
    category: 'dielectric',
    categoryName: 'Dielectric & Oxide',
    atomicNumber: 22,
    density: 4.23,
    molarMass: 79.87,
    valenceElectrons: 4,
    effectiveMassRatio: 1.0,
    electronConfig: 'Ti: [Ar] 3d² 4s² | O: [He] 2s² 2p⁴',
    outerOrbitals: [
      {
        shell: 'O(2p) valence band → Ti(3d) conduction band',
        type: 'bonding',
        desc: 'Upper valence band formed by oxygen 2p states, lower conduction band by empty titanium Ti⁴⁺ 3d orbitals.'
      },
      {
        shell: 'Bandgap Eg ≈ 3.05–3.20 eV (~387 nm)',
        type: 'bandgap',
        thresholdEnergy: 3.1,
        desc: 'Absorption edge lies at the boundary of violet and near-UV, providing full UV blockage with pristine visible transparency.'
      }
    ],
    plasmaEnergy: 0.0,
    epsInf: 1.0,
    drude: { f: 0.0, gamma: 0.0 },
    oscillators: [
      { name: 'O(2p) → Ti(3d) absorption edge (3.2 eV / 387 nm)', energy: 3.25, strength: 16.5, gamma: 0.25, orbitals: 'O(2p) → Ti(3d, t2g)' },
      { name: 'O(2p) → Ti(3d) eg-state transition (4.2 eV)', energy: 4.20, strength: 52.0, gamma: 0.60, orbitals: 'O(2p) → Ti(3d, eg)' },
      { name: 'Deep UV ligand-to-metal charge transfer (6.5 eV)', energy: 6.50, strength: 95.0, gamma: 1.50, orbitals: 'Ligand-to-metal CT' }
    ],
    physicsNote: 'Titanium dioxide (rutile) features an exceptionally high refractive index (n ≈ 2.5–2.9 in visible light), far exceeding conventional optical glasses.',
    experimentalRef: 'Devore, J. Opt. Soc. Am. 41, 416 (1951) / Siefke (2016)',
    experimentalData: [
      { wl: 250.0, n: 2.436, k: 1.492 },
      { wl: 300.0, n: 3.326, k: 0.888 },
      { wl: 350.0, n: 3.02, k: 0.068 },
      { wl: 380.0, n: 2.85, k: 0.005 },
      { wl: 400.0, n: 2.68, k: 0.001 },
      { wl: 450.0, n: 2.813, k: 0.0 },
      { wl: 500.0, n: 2.711, k: 0.0 },
      { wl: 550.0, n: 2.648, k: 0.0 },
      { wl: 600.0, n: 2.605, k: 0.0 },
      { wl: 632.8, n: 2.584, k: 0.0 },
      { wl: 700.0, n: 2.551, k: 0.0 },
      { wl: 800.0, n: 2.52, k: 0.0 },
      { wl: 1000.0, n: 2.486, k: 0.0 },
      { wl: 1200.0, n: 2.468, k: 0.0 },
      { wl: 1550.0, n: 2.454, k: 0.0 },
      { wl: 2000.0, n: 2.441, k: 0.0 }
    ]
  },

  {
    id: 'sapphire',
    name: 'Sapphire (Al₂O₃)',
    nameEn: 'Sapphire (Al₂O₃)',
    formula: 'Al₂O₃',
    category: 'dielectric',
    categoryName: 'Dielectric & Oxide',
    atomicNumber: 13,
    density: 3.98,
    molarMass: 101.96,
    valenceElectrons: 6,
    effectiveMassRatio: 1.0,
    electronConfig: 'Al: [Ne] 3s² 3p¹ | O: [He] 2s² 2p⁴',
    outerOrbitals: [
      { shell: 'Ionic-covalent Al³⁺ — O²⁻ bonds', type: 'bonding', desc: 'Dense hexagonal corundum lattice with electron transfer from 3s/3p to oxygen 2p.' },
      { shell: 'Wide bandgap Eg ≈ 8.8 eV (~141 nm)', type: 'bandgap', desc: 'Transparent from 150 nm to 5.5 μm.' }
    ],
    plasmaEnergy: 0.0,
    epsInf: 1.0,
    drude: { f: 0.0, gamma: 0.0 },
    oscillators: [
      { name: 'O(2p) → Al(3s) UV resonance 1 (9.5 eV / 130 nm)', energy: 9.50, strength: 68.0, gamma: 0.08, orbitals: 'O(2p) → Al(3s)' },
      { name: 'Deep UV transition 2 (17.5 eV)', energy: 17.50, strength: 240.0, gamma: 0.20, orbitals: 'O(2s) → Al(3p)' },
      { name: 'IR optical phonon Al-O (16 μm)', energy: 0.077, strength: 0.015, gamma: 0.005, orbitals: 'Lattice Al-O vibration' }
    ],
    physicsNote: 'Sapphire (Al₂O₃) is an ultra-hard optical crystal with refractive index n ≈ 1.76–1.77. Its broad transparency window makes it ideal for high-power laser optics and harsh environments.',
    experimentalRef: 'Malitson, J. Opt. Soc. Am. 52, 1377 (1962)',
    experimentalData: [
      { wl: 200.0, n: 1.912, k: 0.0 },
      { wl: 250.0, n: 1.845, k: 0.0 },
      { wl: 300.0, n: 1.814, k: 0.0 },
      { wl: 350.0, n: 1.797, k: 0.0 },
      { wl: 400.0, n: 1.787, k: 0.0 },
      { wl: 450.0, n: 1.779, k: 0.0 },
      { wl: 500.0, n: 1.774, k: 0.0 },
      { wl: 550.0, n: 1.771, k: 0.0 },
      { wl: 600.0, n: 1.768, k: 0.0 },
      { wl: 632.8, n: 1.766, k: 0.0 },
      { wl: 700.0, n: 1.763, k: 0.0 },
      { wl: 800.0, n: 1.76, k: 0.0 },
      { wl: 1000.0, n: 1.756, k: 0.0 },
      { wl: 1200.0, n: 1.752, k: 0.0 },
      { wl: 1550.0, n: 1.746, k: 0.0 },
      { wl: 2000.0, n: 1.738, k: 0.0 }
    ]
  },

  {
    id: 'diamond',
    name: 'Diamond (C)',
    nameEn: 'Diamond (C)',
    formula: 'C',
    category: 'dielectric',
    categoryName: 'Dielectric & Oxide',
    atomicNumber: 6,
    density: 3.51,
    molarMass: 12.011,
    valenceElectrons: 4,
    effectiveMassRatio: 1.0,
    electronConfig: '[He] 2s¹ 2p³ (sp³)',
    outerOrbitals: [
      { shell: '2s-2p (sp³ hybrid covalent σ-bonds)', type: 'bonding', desc: 'Tetrahedral carbon σ-bonds with maximum wavefunction overlap and bond strength.' },
      { shell: 'Indirect gap Eg = 5.47 eV (~227 nm)', type: 'bandgap', desc: 'Electronic transitions from bonding σ to antibonding σ* orbitals.' }
    ],
    plasmaEnergy: 0.0,
    epsInf: 1.0,
    drude: { f: 0.0, gamma: 0.0 },
    oscillators: [
      { name: 'Indirect edge σ → σ* (5.47 eV / 227 nm)', energy: 5.50, strength: 2.5, gamma: 0.15, orbitals: 'sp³ σ → σ* indirect' },
      { name: 'Direct dipole resonance E₁ (7.3 eV / 170 nm)', energy: 7.30, strength: 78.0, gamma: 0.45, orbitals: 'sp³ σ → σ* direct' },
      { name: 'Main valence resonance (12.0 eV)', energy: 12.00, strength: 185.0, gamma: 1.20, orbitals: 'Deep valence → conduction' }
    ],
    physicsNote: 'Diamond features a high refractive index (n ≈ 2.42 in visible light) paired with steep dispersion, creating its famous optical fire and brilliance.',
    experimentalRef: 'Peter, Z. Phys. 15, 358 (1923) / Edwards (1981)',
    experimentalData: [
      { wl: 250.0, n: 2.633, k: 0.0 },
      { wl: 300.0, n: 2.541, k: 0.0 },
      { wl: 350.0, n: 2.493, k: 0.0 },
      { wl: 400.0, n: 2.464, k: 0.0 },
      { wl: 450.0, n: 2.445, k: 0.0 },
      { wl: 500.0, n: 2.432, k: 0.0 },
      { wl: 550.0, n: 2.423, k: 0.0 },
      { wl: 600.0, n: 2.416, k: 0.0 },
      { wl: 632.8, n: 2.412, k: 0.0 },
      { wl: 700.0, n: 2.406, k: 0.0 },
      { wl: 800.0, n: 2.4, k: 0.0 },
      { wl: 1000.0, n: 2.393, k: 0.0 },
      { wl: 1200.0, n: 2.389, k: 0.0 },
      { wl: 1550.0, n: 2.386, k: 0.0 },
      { wl: 2000.0, n: 2.383, k: 0.0 }
    ]
  },

  {
    id: 'calcium_fluoride',
    name: 'Calcium Fluoride (CaF₂)',
    nameEn: 'Calcium Fluoride (CaF₂)',
    formula: 'CaF₂',
    category: 'dielectric',
    categoryName: 'Dielectric & Oxide',
    atomicNumber: 20,
    density: 3.18,
    molarMass: 78.08,
    valenceElectrons: 8,
    effectiveMassRatio: 1.0,
    electronConfig: 'Ca: [Ar] 4s² | F: [He] 2s² 2p⁵',
    outerOrbitals: [
      { shell: 'Ionic Ca²⁺ and F⁻ bond', type: 'bonding', desc: 'Complete electron transfer into closed-shell noble gas configurations.' },
      { shell: 'Giant bandgap Eg ≈ 12.1 eV (~102 nm)', type: 'bandgap', desc: 'Extraordinary wide-bandgap optical crystal.' }
    ],
    plasmaEnergy: 0.0,
    epsInf: 1.0,
    drude: { f: 0.0, gamma: 0.0 },
    oscillators: [
      { name: 'F(2p) → Ca(4s) deep UV transition (12.2 eV / 102 nm)', energy: 12.20, strength: 82.0, gamma: 0.05, orbitals: 'F(2p) → Ca(4s)' },
      { name: 'Excitonic vacuum resonance (16.0 eV)', energy: 16.00, strength: 120.0, gamma: 0.15, orbitals: 'Valence excitation' },
      { name: 'IR lattice phonon Ca-F (38 μm)', energy: 0.033, strength: 0.018, gamma: 0.003, orbitals: 'Lattice Ca-F vibration' }
    ],
    physicsNote: 'Calcium fluoride (CaF₂) exhibits a very low refractive index (n ≈ 1.434) and exceptionally low optical dispersion (Abbe number Vd ≈ 95), making it premier for chromatic aberration correction in apochromatic lenses.',
    experimentalRef: 'Malitson, Appl. Opt. 2, 1103 (1963)',
    experimentalData: [
      { wl: 200.0, n: 1.495, k: 0.0 },
      { wl: 250.0, n: 1.467, k: 0.0 },
      { wl: 300.0, n: 1.454, k: 0.0 },
      { wl: 350.0, n: 1.447, k: 0.0 },
      { wl: 400.0, n: 1.442, k: 0.0 },
      { wl: 450.0, n: 1.439, k: 0.0 },
      { wl: 500.0, n: 1.436, k: 0.0 },
      { wl: 550.0, n: 1.435, k: 0.0 },
      { wl: 600.0, n: 1.434, k: 0.0 },
      { wl: 632.8, n: 1.433, k: 0.0 },
      { wl: 700.0, n: 1.432, k: 0.0 },
      { wl: 800.0, n: 1.431, k: 0.0 },
      { wl: 1000.0, n: 1.429, k: 0.0 },
      { wl: 1200.0, n: 1.428, k: 0.0 },
      { wl: 1550.0, n: 1.426, k: 0.0 },
      { wl: 2000.0, n: 1.424, k: 0.0 }
    ]
  }
];

// Helper to find material by ID
function getMaterialById(id) {
  return MATERIALS.find(m => m.id === id) || MATERIALS[0];
}
