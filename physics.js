/**
 * Physical Constants, Quantum-Orbital Dispersion Equations,
 * and Light & Matter Complex Refractive Index Engine
 */

const CONSTANTS = {
  h: 6.62607015e-34,          // Planck constant (J*s)
  hbar: 1.054571817e-34,      // Reduced Planck constant (J*s)
  hbar_eV: 6.582119569e-16,   // Reduced Planck constant (eV*s)
  c: 299792458,               // Speed of light (m/s)
  e: 1.602176634e-19,         // Elementary charge (C)
  m0: 9.1093837e-31,          // Electron mass (kg)
  eps0: 8.8541878128e-12,     // Vacuum permittivity (F/m)
  NA: 6.02214076e23,          // Avogadro constant (1/mol)
  hc_eV_nm: 1239.841984       // hc in eV * nm
};

/**
 * Calculates atomic concentration (atoms/m^3) and theoretical plasma energy (eV)
 * based on mass density, molar mass, and valence electron count from outer shell.
 */
function deriveOrbitalPlasmaParameters(material) {
  const rho_kg_m3 = (material.density || 1.0) * 1000; // g/cm^3 -> kg/m^3
  const M_kg_mol = (material.molarMass || 1.0) * 1e-3; // g/mol -> kg/mol
  const Nat_m3 = (rho_kg_m3 * CONSTANTS.NA) / M_kg_mol; // atoms / m^3
  
  const z_val = material.valenceElectrons || 1;
  const ne = Nat_m3 * z_val; // conduction electron density (m^-3)
  
  const meff = (material.effectiveMassRatio || 1.0) * CONSTANTS.m0;
  
  // Theoretical plasma frequency: omega_p = sqrt(ne * e^2 / (eps0 * meff))
  const omega_p = Math.sqrt((ne * Math.pow(CONSTANTS.e, 2)) / (CONSTANTS.eps0 * meff));
  const Ep_theoretical = omega_p * CONSTANTS.hbar_eV; // in eV
  
  // Plasma wavelength: lambda_p = hc / Ep (nm)
  const lambda_p = Ep_theoretical > 0 ? (CONSTANTS.hc_eV_nm / Ep_theoretical) : Infinity;

  return {
    Nat_m3,
    Nat_cm3: Nat_m3 * 1e-6,
    ne,
    omega_p,
    Ep_theoretical,
    lambda_p
  };
}

/**
 * Linearly interpolates experimental benchmark (n, k) data if available for material
 */
function getInterpolatedExperimentalNK(material, wavelengthNm) {
  if (!material.experimentalData || material.experimentalData.length === 0) {
    return null;
  }

  const exp = material.experimentalData;
  const minWl = exp[0].wl;
  const maxWl = exp[exp.length - 1].wl;

  if (wavelengthNm < minWl || wavelengthNm > maxWl) {
    return null;
  }

  // Exact match
  for (let i = 0; i < exp.length; i++) {
    if (Math.abs(exp[i].wl - wavelengthNm) < 1e-3) {
      return { n: exp[i].n, k: exp[i].k, isInterpolated: false };
    }
  }

  // Find surrounding points
  let idx = 0;
  while (idx < exp.length - 1 && exp[idx + 1].wl < wavelengthNm) {
    idx++;
  }

  const p1 = exp[idx];
  const p2 = exp[idx + 1];
  const frac = (wavelengthNm - p1.wl) / (p2.wl - p1.wl);

  const n = p1.n + frac * (p2.n - p1.n);
  const k = p1.k + frac * (p2.k - p1.k);

  return { n, k, isInterpolated: true };
}

/**
 * Compute complex permittivity and optical constants (n, k, R, alpha, delta)
 * at a given wavelength (nm) using Drude-Lorentz quantum-orbital model.
 */
function calculateAtWavelength(material, wavelengthNm) {
  const lambda = Math.max(1, wavelengthNm);
  const E = CONSTANTS.hc_eV_nm / lambda; // Photon energy in eV
  
  // Background dielectric constant from deep core electrons and core shell polarization
  let eps1 = material.epsInf !== undefined ? material.epsInf : 1.0;
  let eps2 = 0.0;
  
  const Ep = material.plasmaEnergy || 0.0;
  
  // 1. Drude response of free electrons in conduction band (outer s/p orbitals)
  if (material.drude && material.drude.f > 0 && Ep > 0) {
    const f0 = material.drude.f;
    const gamma0 = material.drude.gamma || 0.05; // collision damping (eV)
    const denom = E * E + gamma0 * gamma0;
    if (denom > 1e-12) {
      eps1 -= (f0 * Ep * Ep) / denom;
      eps2 += (f0 * Ep * Ep * gamma0) / (E * denom);
    }
  }
  
  // 2. Lorentz oscillators: Interband transitions between outer atomic orbitals
  if (material.oscillators && Array.isArray(material.oscillators)) {
    for (const osc of material.oscillators) {
      const E0 = osc.energy; // Transition resonance energy (eV)
      const gamma = Math.max(1e-4, osc.gamma || 0.1); // Spectral damping width (eV)
      
      // Oscillator amplitude: either directly specified or f * Ep^2
      const amp = osc.strength !== undefined ? osc.strength : ((osc.f || 0.05) * Ep * Ep);
      
      const diff = E0 * E0 - E * E;
      const denom = diff * diff + E * E * gamma * gamma;
      if (denom > 1e-14) {
        eps1 += (amp * diff) / denom;
        eps2 += (amp * E * gamma) / denom;
      }
    }
  }
  
  // Bound eps2 to non-negative (causality and passive medium)
  eps2 = Math.max(0, eps2);
  
  // Exact relation between complex permittivity eps = eps1 + i*eps2 and n + i*k:
  // |eps| = sqrt(eps1^2 + eps2^2) = n^2 + k^2
  // eps1 = n^2 - k^2
  // 2*n^2 = |eps| + eps1
  // 2*k^2 = |eps| - eps1
  const modEps = Math.sqrt(eps1 * eps1 + eps2 * eps2);
  const n = Math.sqrt(Math.max(0, (modEps + eps1) / 2));
  const k = Math.sqrt(Math.max(0, (modEps - eps1) / 2));
  
  // Normal incidence Reflectance (Fresnel equation)
  const nPlus1 = n + 1;
  const nMinus1 = n - 1;
  const kSq = k * k;
  const R = (nMinus1 * nMinus1 + kSq) / (nPlus1 * nPlus1 + kSq);
  
  // Absorption coefficient alpha (cm^-1): alpha = 4 * pi * k / lambda
  // lambda in nm = lambda * 1e-7 cm
  const alpha_cm = (4 * Math.PI * k) / (lambda * 1e-7);
  
  // Penetration depth / Skin depth delta (nm): delta = 1 / alpha = lambda / (4 * pi * k)
  const delta_nm = k > 1e-7 ? (lambda / (4 * Math.PI * k)) : Infinity;

  // Experimental reference comparison if available
  const exp = getInterpolatedExperimentalNK(material, lambda);
  const expN = exp ? exp.n : null;
  const expK = exp ? exp.k : null;
  const diffN = expN !== null ? Math.abs(n - expN) : null;
  const diffK = expK !== null ? Math.abs(k - expK) : null;
  
  return {
    wavelengthNm: lambda,
    energy_eV: E,
    eps1,
    eps2,
    modEps,
    n,
    k,
    expN,
    expK,
    diffN,
    diffK,
    reflectance: R,
    reflectancePct: R * 100,
    alpha_cm,
    delta_nm
  };
}

/**
 * Generates an array of computed data points across [minWl, maxWl] with given wavelength step (default 1 nm).
 */
function generateSpectrum(material, minWl, maxWl, stepWl = 1) {
  const points = [];
  const min = Math.max(50, Math.min(minWl, maxWl));
  const max = Math.max(min + 0.1, Math.max(minWl, maxWl));
  let step = Math.max(0.01, parseFloat(stepWl) || 1);

  // Safety guard against memory overflow (cap at 10,000 points)
  const maxAllowedPoints = 10000;
  if ((max - min) / step > maxAllowedPoints) {
    step = (max - min) / maxAllowedPoints;
  }

  let wl = min;
  const epsilon = step * 1e-5;
  while (wl <= max + epsilon) {
    const cleanWl = Math.round(wl * 10000) / 10000;
    points.push(calculateAtWavelength(material, cleanWl));
    wl += step;
  }

  // Ensure exact max wavelength is included if not covered
  if (points.length > 0 && Math.abs(points[points.length - 1].wavelengthNm - max) > epsilon) {
    points.push(calculateAtWavelength(material, max));
  }

  return points;
}

/**
 * Physical spectrum color renderer (CIE 1931 approximation)
 * Maps wavelength 380 - 780 nm to accurate physical sRGB color.
 */
function wavelengthToRGB(wavelength) {
  let r = 0, g = 0, b = 0;
  const wl = wavelength;

  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wl >= 440 && wl < 490) {
    r = 0.0;
    g = (wl - 440) / (490 - 440);
    b = 1.0;
  } else if (wl >= 490 && wl < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wl >= 580 && wl < 645) {
    r = 1.0;
    g = -(wl - 645) / (645 - 580);
    b = 0.0;
  } else if (wl >= 645 && wl <= 780) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  } else if (wl < 380) {
    // Ultraviolet
    const factor = Math.max(0.2, (wl - 100) / 280);
    return `rgba(139, 92, 246, ${factor.toFixed(2)})`; // Purple
  } else {
    // Infrared
    const factor = Math.max(0.2, 1 - (wl - 780) / 3000);
    return `rgba(225, 29, 72, ${factor.toFixed(2)})`; // Deep infrared red
  }

  // Intensity factor drops near visual limits (380-420 and 700-780)
  let factor = 1.0;
  if (wl >= 380 && wl < 420) {
    factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
  } else if (wl >= 700 && wl <= 780) {
    factor = 0.3 + 0.7 * (780 - wl) / (780 - 700);
  }

  const red = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(r * factor, 0.8))));
  const green = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(g * factor, 0.8))));
  const blue = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(b * factor, 0.8))));

  return `rgb(${red}, ${green}, ${blue})`;
}

/**
 * Formats wavelength from nanometers (nm) to micrometers (µm)
 * following refractiveindex.info standards (5 decimals for < 1 µm, 4 decimals for >= 1 µm).
 */
function formatWavelengthUm(wlNm) {
  const um = wlNm / 1000;
  return um < 1 ? um.toFixed(5) : um.toFixed(4);
}

/**
 * Formats data into a CSV string following the official refractiveindex.info standard:
 * Section 1: wl,n
 * [blank line]
 * Section 2: wl,k
 * Wavelengths are in micrometers (µm).
 */
function exportToCSV(data, material) {
  let csv = 'wl,n\n';
  for (const row of data) {
    const wlNm = row.wavelengthNm !== undefined ? row.wavelengthNm : row.wl;
    const wl = formatWavelengthUm(wlNm);
    const n = row.n !== null && row.n !== undefined ? row.n.toFixed(6) : '0.000000';
    csv += `${wl},${n}\n`;
  }
  csv += '\nwl,k\n';
  for (const row of data) {
    const wlNm = row.wavelengthNm !== undefined ? row.wavelengthNm : row.wl;
    const wl = formatWavelengthUm(wlNm);
    const k = row.k !== null && row.k !== undefined ? row.k.toFixed(6) : '0.000000';
    csv += `${wl},${k}\n`;
  }
  return csv;
}

/**
 * Formats data into a tab-separated TXT file following the official refractiveindex.info standard:
 * Section 1: wl\tn
 * [blank line]
 * Section 2: wl\tk
 * Wavelengths are in micrometers (µm).
 */
function exportToTXT(data, material) {
  let txt = 'wl\tn\n';
  for (const row of data) {
    const wlNm = row.wavelengthNm !== undefined ? row.wavelengthNm : row.wl;
    const wl = formatWavelengthUm(wlNm);
    const n = row.n !== null && row.n !== undefined ? row.n.toFixed(6) : '0.000000';
    txt += `${wl}\t${n}\n`;
  }
  txt += '\nwl\tk\n';
  for (const row of data) {
    const wlNm = row.wavelengthNm !== undefined ? row.wavelengthNm : row.wl;
    const wl = formatWavelengthUm(wlNm);
    const k = row.k !== null && row.k !== undefined ? row.k.toFixed(6) : '0.000000';
    txt += `${wl}\t${k}\n`;
  }
  return txt;
}

/**
 * Formats data into a YAML database record following refractiveindex.info database specification.
 * Each data row in 'tabulated nk' has 8 spaces indent and columns: wl n k
 */
function exportToYAML(data, material) {
  const matName = material.name || material.nameEn || material.formula;
  const displayName = matName.includes(material.formula) ? matName : `${matName} (${material.formula})`;
  let yml = `REFERENCES: |\n`;
  yml += `    ${displayName} optical constants.\n`;
  yml += `    Model: Quantum-orbital Drude-Lorentz dispersion model (${material.electronConfig}).\n`;
  if (material.experimentalRef) {
    yml += `    Benchmark reference: ${material.experimentalRef}\n`;
  }
  yml += `COMMENTS: |\n`;
  yml += `    Calculated with Light & Matter (Quantum-Orbital Dispersion Model).\n`;
  yml += `    Density: ${material.density} g/cm3, Molar mass: ${material.molarMass} g/mol.\n`;
  yml += `DATA:\n`;
  yml += `  - type: tabulated nk\n`;
  yml += `    data: |\n`;
  for (const row of data) {
    const wlNm = row.wavelengthNm !== undefined ? row.wavelengthNm : row.wl;
    const wl = formatWavelengthUm(wlNm);
    const n = row.n !== null && row.n !== undefined ? row.n.toFixed(6) : '0.000000';
    const k = row.k !== null && row.k !== undefined ? row.k.toFixed(6) : '0.000000';
    yml += `        ${wl} ${n} ${k}\n`;
  }
  return yml;
}

/**
 * Downloads a string content as a file in the browser
 */
function downloadFile(content, fileName, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
