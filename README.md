# Light & Matter: Complex Refractive Index ($\tilde{n} = n + ik$)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?logo=github)](https://damir3.github.io/light-matter/)

> **Online Demo:** [https://damir3.github.io/light-matter/](https://damir3.github.io/light-matter/)

**Light-Matter** is an interactive web application built with pure Vanilla JS, HTML5, and CSS3 for modeling and analyzing the complex refractive index $\tilde{n}(\lambda) = n(\lambda) + ik(\lambda)$ of various materials (metals, semiconductors, and dielectrics) across the optical (380–780 nm), ultraviolet (UV), and infrared (IR) spectral bands.

Calculations are based on a **quantum-orbital Drude-Lorentz dispersion model** incorporating the **outer valence electron shells** of atoms and calibrated against experimental benchmarks.

---

## Project Objective

The primary objective of this project is to develop, validate, and refine physically grounded analytical equations that accurately capture the underlying quantum and electromagnetic processes in matter, achieving the highest possible fidelity with real-world experimental measurement data.

Rather than relying on arbitrary empirical polynomial fitting or black-box interpolation tables, the project bridges atomic structure and macroscopic optical behavior by:
- **Deriving dispersion from electronic orbitals:** Direct modeling of free conduction electrons (Drude response) and localized interband transitions (Lorentz oscillators) between outer atomic subshells ($s, p, d$).
- **Connecting material constants to microscopic parameters:** Calculating plasma frequencies and collision rates from actual physical properties (density $\rho$, molar mass $M$, valence electron count $Z_{\text{val}}$).
- **Experimental benchmark verification:** Ensuring maximum fidelity across broadband spectra (deep UV through infrared) by verifying calculated values of $n(\lambda)$, $k(\lambda)$, $\varepsilon_1$, $\varepsilon_2$, and reflectance against standard experimental benchmarks.

---

## Optical Physics & Computer Graphics

In modern physically based rendering (PBR), wave optics, and spectral ray tracing, **the fundamental optical behavior of any isotropic material is completely determined by the spectral dependence of $n$ and $k$ on wavelength**:

$$
\tilde{n}(\lambda) = n(\lambda) + i k(\lambda)
$$

From these two wavelength-dependent optical constants, all macroscopic light-matter interactions are derived:
- **Fresnel Reflection & Apparent Color:** Under any angle of incidence $\theta$, reflection is governed by Fresnel's equations. For metals ($k \gg 0$), the spectral profiles $n(\lambda)$ and $k(\lambda)$ dictate their hue, reflectance, and metallic luster (e.g. why gold reflects yellow-red light but absorbs blue, while silver reflects uniformly across visible wavelengths).
- **Volumetric Absorption & Transparency:** The extinction coefficient $k(\lambda)$ governs light absorption inside the material via the Bouguer-Lambert law: $\alpha(\lambda) = \frac{4\pi k(\lambda)}{\lambda}$.
- **Chromatic Dispersion:** Variations in $n(\lambda)$ across wavelengths produce prismatic rainbow splitting, dispersion fringing, and caustics in transparent dielectrics (diamond, glass, crystals).

While surface roughness is modeled geometrically via microfacet distributions, **at every micro-interface specular reflection and refraction are dictated strictly by $n(\lambda)$ and $k(\lambda)$**. By providing physically grounded, continuous $(n, k)$ spectra directly from electronic orbital structures, **Light-Matter** serves as a first-principles foundation for physical material shaders, spectral rendering, and wave-optics simulations.

---

## Physical Model: Connecting Outer Electronic Orbitals to $n$ and $k$

The optical dispersion of matter is determined by the collective and resonant response of **outer valence electrons** to the oscillating electromagnetic field of light waves:

### 1. Complex Permittivity $\tilde{\varepsilon}$ and Refractive Index $\tilde{n}$

$$
\tilde{\varepsilon}(\omega) = \varepsilon_1 + i\varepsilon_2 = (n + ik)^2 = (n^2 - k^2) + i(2nk)
$$

Inverting the relationship yields exact analytical equations for the real refractive index $n$ (phase velocity) and extinction coefficient $k$ (attenuation):

$$
n = \sqrt{ \frac{\sqrt{\varepsilon_1^2 + \varepsilon_2^2} + \varepsilon_1}{2} }
$$

$$
k = \sqrt{ \frac{\sqrt{\varepsilon_1^2 + \varepsilon_2^2} - \varepsilon_1}{2} }
$$

### 2. Free Electrons and Core Polarization (Drude Model for Metals)

Delocalized outer electrons (e.g. $6s^1$ in Au, $5s^1$ in Ag, $4s^1$ in Cu, $3s^2 3p^1$ in Al) form a conduction-band electron gas characterized by the plasma frequency:

$$
\omega_p^2 = \frac{n_e e^2}{\varepsilon_0 m^*}, \quad n_e = Z_{\text{val}} \cdot N_{\text{at}} = Z_{\text{val}} \cdot \frac{\rho N_A}{M}
$$

$$
\varepsilon_{\text{Drude}}(\omega) = \varepsilon_\infty - \frac{f_0 \omega_p^2}{\omega(\omega + i\gamma_0)}
$$

where $\varepsilon_\infty$ accounts for the high-frequency core screening polarization of filled inner/d-shells (e.g. $\varepsilon_\infty \approx 5.9$ in Au, $\varepsilon_\infty \approx 3.7$ in Ag).

### 3. Bound Electrons and Interband Transitions (Lorentz Oscillators)

Describes transitions from filled valence orbitals to unoccupied states above the Fermi level (e.g. $3d \to 4s$ in Cu, $5d \to 6s/6p$ in Au, covalent $sp^3$ bonding-antibonding transitions in Si and diamond C, ligand-to-metal charge transfer in TiO₂, and $\text{O}(2p) \to \text{Si}(3s/3p)$ transitions in SiO₂):

$$
\tilde{\varepsilon}_{\text{Lorentz}}(E) = \sum_{j} \frac{S_j}{(E_{0,j}^2 - E^2) - i E \Gamma_j}
$$

Separating into real ($\varepsilon_1$) and imaginary ($\varepsilon_2$) components:

$$
\varepsilon_{1,\text{Lorentz}}(E) = \sum_{j} \frac{S_j (E_{0,j}^2 - E^2)}{(E_{0,j}^2 - E^2)^2 + E^2 \Gamma_j^2}
$$

$$
\varepsilon_{2,\text{Lorentz}}(E) = \sum_{j} \frac{S_j E \Gamma_j}{(E_{0,j}^2 - E^2)^2 + E^2 \Gamma_j^2}
$$

where $E_{0,j} = \hbar \omega_{0,j}$ is the resonance transition energy, $S_j$ is the oscillator amplitude strength ($S_j = f_j E_p^2$), and $\Gamma_j$ is the spectral broadening / collision damping.

### 4. Reflectance and Absorption

**Normal Incidence Reflectance (Fresnel formula):**

$$
R(\lambda) = \frac{(n - 1)^2 + k^2}{(n + 1)^2 + k^2}
$$

**Bouguer-Lambert Absorption Coefficient:**

$$
\alpha(\lambda) = \frac{4\pi k}{\lambda} \quad [\text{cm}^{-1}]
$$

**Optical Penetration / Skin Depth:**

$$
\delta(\lambda) = \frac{\lambda}{4\pi k}
$$

---

## Materials Database

1. **Noble & Plasmonic Metals:**
   - **Gold (Au):** $[Xe] 4f^{14} 5d^{10} 6s^1$ — $5d \to 6s$ interband threshold at 2.4 eV (~515 nm) explains its iconic warm yellow color.
   - **Silver (Ag):** $[Kr] 4d^{10} 5s^1$ — interband transitions occur only in the near-UV (3.9 eV / 318 nm), yielding an ultra-low index $n \approx 0.04\text{--}0.06$ and reflectance $R > 98\text{--}99\%$ across the entire visible spectrum.
   - **Copper (Cu):** $[Ar] 3d^{10} 4s^1$ — $3d \to 4s$ threshold at 2.15 eV (~576 nm), producing intense absorption of blue/green light and a characteristic reddish-orange reflection.
   - **Platinum (Pt):** $[Xe] 4f^{14} 5d^9 6s^1$ — partially occupied $5d$ band creates strong interband damping and a neutral steel-gray appearance.
2. **Simple & Transition Metals:**
   - **Aluminium (Al):** $[Ne] 3s^2 3p^1$ — 3 valence electrons, $E_p \approx 15\text{ eV}$, with parallel-band absorption near 800 nm.
   - **Titanium (Ti):** $[Ar] 3d^2 4s^2$
   - **Chromium (Cr):** $[Ar] 3d^5 4s^1$
   - **Nickel (Ni):** $[Ar] 3d^8 4s^2$
3. **Semiconductors:**
   - **Silicon (Si):** $[Ne] 3s^2 3p^2$ ($sp^3$) — direct critical points $E_1$ (3.4 eV) and $E_2$ (4.25 eV); opaque in visible light, highly transparent in the infrared ($\lambda > 1.1\ \mu\text{m}$).
   - **Germanium (Ge):** $[Ar] 3d^{10} 4s^2 4p^2$ — high-index infrared optical material ($n \approx 4.0$).
   - **Gallium Arsenide (GaAs):** direct bandgap semiconductor ($E_g = 1.42\text{ eV}$).
4. **Dielectrics & Optical Oxides:**
   - **Fused Silica / Glass ($\text{SiO}_2$):** $E_g \approx 9\text{ eV}$, transparency window 160–3500 nm ($n \approx 1.45\text{--}1.47$).
   - **Titanium Dioxide ($\text{TiO}_2$, Rutile):** $E_g \approx 3.2\text{ eV}$, high index $n \approx 2.5\text{--}2.9$.
   - **Sapphire ($\text{Al}_2\text{O}_3$):** ultra-hard crystal with $n \approx 1.76$.
   - **Diamond (C):** tetrahedral $sp^3$ network, $n \approx 2.42$, steep dispersion and optical brilliance.
   - **Calcium Fluoride ($\text{CaF}_2$):** wide-bandgap crystal ($E_g \approx 12\text{ eV}$) with ultra-low dispersion ($V_d \approx 95$).
5. **Custom Material Editor:**
   - Define custom density, valence electron count, plasma frequency, and orbital transitions to model any alloy or dielectric.

---

## User Interface Features

- **One-Click Spectral Presets:**
  - Visible spectrum: `380 – 780 nm` (default)
  - UV + Visible: `200 – 780 nm`
  - Visible + NIR: `380 – 2500 nm`
  - Broadband: `180 – 3000 nm`
  - Deep UV–MIR: `100 – 5000 nm`
  - Manual numerical input for custom boundaries and wavelength step (default: 1 nm).
- **Interactive High-Resolution Canvas Chart:**
  - Dual Y-axes: $n(\lambda)$ (cyan) and $k(\lambda)$ (neon pink).
  - Physical spectral ribbon rendered with CIE 1931 color approximation.
  - Multi-mode display: $n$ & $k$, $\varepsilon_1$ & $\varepsilon_2$, $R(\lambda)$ (reflectance %), and $\alpha(\lambda)$ (absorption $\text{cm}^{-1}$).
  - Logarithmic scale toggle for $k$ and $\alpha$.
  - Experimental benchmark overlays with dashed curves and comparison markers.
  - Interactive crosshairs and live inspector readout.
- **Interactive Spectral Data Table:**
  - Full-resolution data table synchronized with the chosen spectral range and step.
  - Columns for wavelength $\lambda$, spectral band, photon energy $E$ (eV), calculated and benchmark $n$ and $k$, complex permittivity ($\varepsilon_1, \varepsilon_2$), reflectance $R$, absorption coefficient $\alpha$ ($\text{cm}^{-1}$), and skin depth $\delta$ (nm).
- **Outer Orbitals & Physics Dashboard:**
  - Material identification (atomic number $Z$, chemical formula, category, and density $\rho$).
  - Full electron configuration and detailed breakdown of outer valence subshells ($s, p, d$).
  - Derived plasma parameters: electron density $N_{\text{at}}$, plasma energy $E_p$, and plasma wavelength $\lambda_p$.
  - Real-time comparison with experimental benchmark references.
- **Data Export ([refractiveindex.info](https://refractiveindex.info/) standards):**
  - **CSV Export:** Official format with separate `wl,n` and `wl,k` data blocks, wavelength $\lambda$ in micrometers ($\mu\text{m}$), fully compatible with refractiveindex.info tools and simulation software (Lumerical, COMSOL, FDTD).
  - **TXT Export:** Standard tab-separated format (`wl\tn` and `wl\tk` in $\mu\text{m}$) for MATLAB, Python, and Origin.
  - **YAML Database Record (.yml):** Full refractiveindex.info database record schema (`tabulated nk`, metadata, quantum-orbital model references).

---

## Project Structure

- `index.html` — Semantic web page layout and controls.
- `styles.css` — Modern scientific laboratory dark theme design system.
- `materials.js` — Database of materials, orbital configurations, and dispersion parameters.
- `physics.js` — Mathematical calculation engine for dielectric functions, $(n, k)$, reflectance, skin depth, and file export formatting.
- `chart.js` — Dual-axis Canvas renderer with Retina DPI support and experimental curve overlays.
- `app.js` — Application controller, state management, and user interaction handlers.
