/**
 * Main Application Controller for Light & Matter
 * Handles user interactions, state management, calculation pipelines,
 * chart and table rendering, and file exports.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    currentMaterial: MATERIALS[0], // Gold default
    minWl: 380,
    maxWl: 780,
    stepWl: 1,
    chartMode: 'nk',
    logScaleK: false,
    showExperimental: true,
    spectrumData: [],
    categoryFilter: 'all'
  };

  // DOM Elements
  const materialSelect = document.getElementById('materialSelect');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const presetChips = document.querySelectorAll('.preset-chip');
  const minWlInput = document.getElementById('minWlInput');
  const maxWlInput = document.getElementById('maxWlInput');
  const stepWlInput = document.getElementById('stepWlInput');
  const applyRangeBtn = document.getElementById('applyRangeBtn');
  
  const modePills = document.querySelectorAll('.mode-pill');
  const logScaleToggle = document.getElementById('logScaleToggle');
  const expOverlayToggle = document.getElementById('expOverlayToggle');
  
  const downloadCsvTopBtn = document.getElementById('downloadCsvTopBtn');
  const downloadTxtTopBtn = document.getElementById('downloadTxtTopBtn');
  const downloadYmlTopBtn = document.getElementById('downloadYmlTopBtn');
  
  const dataTableBody = document.getElementById('dataTableBody');
  const tableRowsCount = document.getElementById('tableRowsCount');

  // Theory Accordion
  const theoryToggle = document.getElementById('theoryAccordionToggle');
  const theoryContent = document.getElementById('theoryAccordionContent');
  const accordionArrow = document.getElementById('accordionArrow');

  // Custom Material Modal
  const openCustomModalBtn = document.getElementById('openCustomModalBtn');
  const customModal = document.getElementById('customMaterialModal');
  const closeCustomModalBtn = document.getElementById('closeCustomModalBtn');
  const cancelCustomBtn = document.getElementById('cancelCustomBtn');
  const saveCustomMatBtn = document.getElementById('saveCustomMatBtn');

  // Initialize Canvas Chart
  const canvasElement = document.getElementById('spectrumCanvas');
  const chart = new OpticalSpectrumChart(canvasElement, {
    mode: state.chartMode,
    logScaleK: state.logScaleK,
    showExperimental: state.showExperimental,
    onHover: (point) => updateInspectorBar(point),
    onLeave: () => {
      if (state.spectrumData.length > 0) {
        const midIdx = Math.floor(state.spectrumData.length / 2);
        updateInspectorBar(state.spectrumData[midIdx]);
      }
    }
  });

  // ==================== INITIALIZATION ====================
  function init() {
    populateMaterialSelect();
    setupEventListeners();
    recalculate();
  }

  // Populate <select> dropdown with materials
  function populateMaterialSelect() {
    materialSelect.innerHTML = '';

    const filtered = state.categoryFilter === 'all' 
      ? MATERIALS 
      : MATERIALS.filter(m => m.category === state.categoryFilter);

    // Group materials
    const groups = {};
    filtered.forEach(mat => {
      const cat = mat.categoryName || mat.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(mat);
    });

    for (const [catName, mats] of Object.entries(groups)) {
      const optGroup = document.createElement('optgroup');
      optGroup.label = catName;
      mats.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat.id;
        option.textContent = `${mat.name || mat.nameEn || mat.formula} — ${mat.formula}`;
        if (mat.id === state.currentMaterial.id) {
          option.selected = true;
        }
        optGroup.appendChild(option);
      });
      materialSelect.appendChild(optGroup);
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Material change
    materialSelect.addEventListener('change', (e) => {
      const mat = getMaterialById(e.target.value);
      if (mat) {
        state.currentMaterial = mat;
        recalculate();
      }
    });

    // Category filter buttons
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.categoryFilter = btn.dataset.category;
        populateMaterialSelect();

        const isPresent = Array.from(materialSelect.options).some(opt => opt.value === state.currentMaterial.id);
        if (!isPresent && materialSelect.options.length > 0) {
          state.currentMaterial = getMaterialById(materialSelect.options[0].value);
          materialSelect.value = state.currentMaterial.id;
          recalculate();
        }
      });
    });

    // Range Preset Chips
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        state.minWl = parseFloat(chip.dataset.min);
        state.maxWl = parseFloat(chip.dataset.max);

        minWlInput.value = state.minWl;
        maxWlInput.value = state.maxWl;

        recalculate();
      });
    });

    // Manual range and step inputs apply
    applyRangeBtn.addEventListener('click', () => {
      const min = parseFloat(minWlInput.value);
      const max = parseFloat(maxWlInput.value);
      const step = parseFloat(stepWlInput.value);

      if (isNaN(min) || isNaN(max) || min <= 0 || max <= min) {
        showToast('Please enter a valid wavelength range (λ min < λ max).');
        return;
      }

      state.minWl = min;
      state.maxWl = max;
      state.stepWl = Math.max(0.01, isNaN(step) || step <= 0 ? 1 : step);
      stepWlInput.value = state.stepWl;

      presetChips.forEach(c => c.classList.remove('active'));
      recalculate();
    });

    [minWlInput, maxWlInput, stepWlInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') applyRangeBtn.click();
        });
      }
    });

    // Chart Mode Pills
    modePills.forEach(pill => {
      pill.addEventListener('click', () => {
        modePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.chartMode = pill.dataset.mode;
        chart.setMode(state.chartMode);

        const logLabel = document.getElementById('logScaleToggleWrap');
        const expLabel = document.getElementById('expOverlayToggleWrap');

        if (state.chartMode === 'nk') {
          expLabel.style.display = 'inline-flex';
          logLabel.style.display = 'inline-flex';
        } else if (state.chartMode === 'reflectance') {
          expLabel.style.display = 'none';
          logLabel.style.display = 'none';
        } else {
          expLabel.style.display = 'none';
          logLabel.style.display = 'inline-flex';
        }
      });
    });

    // Experimental overlay toggle
    if (expOverlayToggle) {
      expOverlayToggle.addEventListener('change', (e) => {
        state.showExperimental = e.target.checked;
        chart.setShowExperimental(state.showExperimental);
      });
    }

    // Log scale toggle
    logScaleToggle.addEventListener('change', (e) => {
      state.logScaleK = e.target.checked;
      chart.setLogScaleK(state.logScaleK);
    });

    // File Downloads (CSV / TXT / YAML) in refractiveindex.info formats
    const triggerCsvDownload = () => {
      const csv = exportToCSV(state.spectrumData, state.currentMaterial);
      const fileName = `${state.currentMaterial.formula}_refractiveindex_${state.minWl}-${state.maxWl}nm.csv`;
      downloadFile(csv, fileName, 'text/csv');
      showToast(`RefractiveIndex.INFO CSV saved: ${fileName}`);
    };

    const triggerTxtDownload = () => {
      const txt = exportToTXT(state.spectrumData, state.currentMaterial);
      const fileName = `${state.currentMaterial.formula}_refractiveindex_${state.minWl}-${state.maxWl}nm.txt`;
      downloadFile(txt, fileName, 'text/plain');
      showToast(`RefractiveIndex.INFO TXT saved: ${fileName}`);
    };

    const triggerYmlDownload = () => {
      const yml = exportToYAML(state.spectrumData, state.currentMaterial);
      const fileName = `${state.currentMaterial.formula}_refractiveindex_${state.minWl}-${state.maxWl}nm.yml`;
      downloadFile(yml, fileName, 'text/yaml');
      showToast(`RefractiveIndex.INFO YAML saved: ${fileName}`);
    };

    if (downloadCsvTopBtn) downloadCsvTopBtn.addEventListener('click', triggerCsvDownload);
    if (downloadTxtTopBtn) downloadTxtTopBtn.addEventListener('click', triggerTxtDownload);
    if (downloadYmlTopBtn) downloadYmlTopBtn.addEventListener('click', triggerYmlDownload);

    // Theory Accordion
    theoryToggle.addEventListener('click', () => {
      const isOpen = theoryContent.classList.toggle('open');
      theoryToggle.setAttribute('aria-expanded', isOpen);
      accordionArrow.textContent = isOpen ? '▲' : '▼';
    });

    // Custom Material Modal Dialog
    openCustomModalBtn.addEventListener('click', () => {
      customModal.classList.add('open');
    });

    const closeModal = () => customModal.classList.remove('open');
    closeCustomModalBtn.addEventListener('click', closeModal);
    cancelCustomBtn.addEventListener('click', closeModal);
    customModal.addEventListener('click', (e) => {
      if (e.target === customModal) closeModal();
    });

    // Save Custom Material
    saveCustomMatBtn.addEventListener('click', () => {
      const name = document.getElementById('customMatName').value.trim() || 'Custom Material';
      const formula = document.getElementById('customMatFormula').value.trim() || 'Custom';
      const density = parseFloat(document.getElementById('customMatDensity').value) || 5.0;
      const molarMass = parseFloat(document.getElementById('customMatMolar').value) || 50.0;
      const valenceElectrons = parseInt(document.getElementById('customMatValence').value, 10) || 1;
      const type = document.getElementById('customMatType').value;
      const Ep = parseFloat(document.getElementById('customMatEp').value) || 9.0;
      const f0 = parseFloat(document.getElementById('customMatDrudeF').value) || 1.0;
      const gamma0 = parseFloat(document.getElementById('customMatDrudeGamma').value) || 0.05;
      const epsInf = parseFloat(document.getElementById('customMatEpsInf').value) || 5.9;
      const configStr = document.getElementById('customMatConfig').value.trim() || 'Outer valence subshells s, p, d';

      const oscE1 = parseFloat(document.getElementById('customOscE1').value) || 2.7;
      const oscF1 = parseFloat(document.getElementById('customOscF1').value) || 5.5;
      const oscG1 = parseFloat(document.getElementById('customOscG1').value) || 0.5;

      const customId = `custom_${Date.now()}`;
      const newMat = {
        id: customId,
        name: name,
        nameEn: name,
        formula: formula,
        category: type,
        categoryName: 'Custom Materials',
        atomicNumber: '—',
        density: density,
        molarMass: molarMass,
        valenceElectrons: valenceElectrons,
        effectiveMassRatio: 1.0,
        electronConfig: configStr,
        outerOrbitals: [
          {
            shell: 'Valence Shell',
            type: type === 'metal' ? 'conduction' : 'bonding',
            desc: type === 'metal' 
              ? 'Drude conduction electrons'
              : 'Bonding valence orbitals of dielectric'
          },
          {
            shell: `Orbital Resonance (${oscE1} eV)`,
            type: 'interband',
            thresholdEnergy: oscE1,
            desc: `Interband optical transition between valence and conduction states at ${(1239.84 / oscE1).toFixed(1)} nm.`
          }
        ],
        plasmaEnergy: Ep,
        epsInf: epsInf,
        drude: type === 'metal' ? { f: f0, gamma: gamma0 } : { f: 0, gamma: 0 },
        oscillators: [
          { name: 'Custom Oscillator 1', energy: oscE1, strength: oscF1, gamma: oscG1, orbitals: 'Outer valence transition' }
        ],
        physicsNote: 'Material modeled using user-defined atomic parameters and orbital transitions.'
      };

      MATERIALS.push(newMat);
      state.currentMaterial = newMat;
      closeModal();
      populateMaterialSelect();
      recalculate();
      showToast(`Material "${name}" created and calculated successfully!`);
    });
  }

  // ==================== RECALCULATION PIPELINE ====================
  function recalculate() {
    const mat = state.currentMaterial;

    // 1. Update Sidebar Physics & Orbital Info
    updateSidebar(mat);

    // 2. Generate Spectrum Data Points with stepWl
    state.spectrumData = generateSpectrum(mat, state.minWl, state.maxWl, state.stepWl);

    // 3. Update Chart
    chart.setData(state.spectrumData, mat);

    // 4. Update Inspector Bar with central or first point
    if (state.spectrumData.length > 0) {
      const defaultIdx = Math.floor(state.spectrumData.length / 2);
      updateInspectorBar(state.spectrumData[defaultIdx]);
    }

    // 5. Populate Data Table
    renderDataTable(state.spectrumData);
  }

  // Update orbital physics card with material's electronic orbital details
  function updateSidebar(mat) {
    const derived = deriveOrbitalPlasmaParameters(mat);

    document.getElementById('matFormulaBadge').textContent = mat.formula;
    document.getElementById('elemZ').textContent = mat.atomicNumber || '—';
    document.getElementById('elemSymbol').textContent = mat.formula;
    document.getElementById('elemName').textContent = `${mat.name || mat.nameEn || mat.formula}`;
    document.getElementById('elemCategory').textContent = mat.categoryName || mat.category;
    document.getElementById('elemConfig').textContent = mat.electronConfig;

    // Render outer orbitals breakdown
    const orbitalsContainer = document.getElementById('orbitalsContainer');
    orbitalsContainer.innerHTML = '';

    if (mat.outerOrbitals && mat.outerOrbitals.length > 0) {
      mat.outerOrbitals.forEach(orb => {
        const item = document.createElement('div');
        item.className = 'orbital-item';

        const roleText = orb.type === 'conduction' ? '⚡ Conduction Band' 
          : (orb.type === 'core_polarization' ? '🛡️ Core Polarization'
          : (orb.type === 'interband' ? `🌀 Interband Transitions (${orb.thresholdEnergy ? orb.thresholdEnergy + ' eV' : ''})` 
          : (orb.type === 'phonon' ? '🔊 Phonon Modes' : '🔒 Valence Bonding')));

        item.innerHTML = `
          <div class="orbital-item-header">
            <span class="orbital-badge">${orb.shell}</span>
            <span class="orbital-role-badge">${roleText}</span>
          </div>
          <p class="orbital-desc">${orb.desc}</p>
        `;
        orbitalsContainer.appendChild(item);
      });
    }

    // Derived metrics
    document.getElementById('metricDensity').textContent = `${mat.density} g/cm³`;
    document.getElementById('metricNat').textContent = `${(derived.Nat_m3 / 1e28).toFixed(2)} × 10²⁸ m⁻³`;
    
    if (mat.plasmaEnergy && mat.plasmaEnergy > 0) {
      document.getElementById('metricEp').textContent = `${mat.plasmaEnergy.toFixed(2)} eV`;
      const lp = CONSTANTS.hc_eV_nm / mat.plasmaEnergy;
      document.getElementById('metricLambdaP').textContent = `${lp.toFixed(1)} nm`;
    } else {
      document.getElementById('metricEp').textContent = '— (Dielectric)';
      document.getElementById('metricLambdaP').textContent = '— (Transparent in IR)';
    }

    // Benchmark card comparison
    const benchmarkRef = document.getElementById('benchmarkRefName');
    const benchmarkSummary = document.getElementById('benchmarkPointsSummary');
    if (mat.experimentalRef) {
      benchmarkRef.textContent = mat.experimentalRef.split(',')[0];
      const r633 = calculateAtWavelength(mat, 632.8);
      const r550 = calculateAtWavelength(mat, 550.0);

      let summaryHtml = '';
      if (r633.expN !== null) {
        summaryHtml += `<strong>He-Ne (632.8 nm):</strong> calc n=${r633.n.toFixed(3)}, k=${r633.k.toFixed(3)} | exp n=${r633.expN.toFixed(3)}, k=${r633.expK.toFixed(3)} (Δn=${r633.diffN.toFixed(3)}, Δk=${r633.diffK.toFixed(3)})<br>`;
      }
      if (r550.expN !== null) {
        summaryHtml += `<strong>Green (550 nm):</strong> calc n=${r550.n.toFixed(3)}, k=${r550.k.toFixed(3)} | exp n=${r550.expN.toFixed(3)}, k=${r550.expK.toFixed(3)} (Δn=${r550.diffN.toFixed(3)}, Δk=${r550.diffK.toFixed(3)})`;
      }
      benchmarkSummary.innerHTML = summaryHtml || 'Benchmark data available for comparison.';
    } else {
      benchmarkRef.textContent = 'Theoretical Model';
      benchmarkSummary.textContent = 'Quantum-orbital dispersion model constructed for this material.';
    }

    document.getElementById('matPhysicsNote').textContent = mat.physicsNote || '';
  }

  // Update hover inspector bar
  function updateInspectorBar(point) {
    if (!point) return;

    const rgb = wavelengthToRGB(point.wavelengthNm);
    document.getElementById('inspColorDot').style.backgroundColor = rgb;
    document.getElementById('inspWl').textContent = `${point.wavelengthNm.toFixed(1)} nm`;
    document.getElementById('inspEnergy').textContent = `${point.energy_eV.toFixed(3)} eV`;
    
    // n display
    if (point.expN !== null) {
      document.getElementById('inspN').innerHTML = `${point.n.toFixed(3)} <span style="font-size:11px;color:var(--text-muted);font-weight:normal;">(exp ${point.expN.toFixed(3)}, Δ=${point.diffN.toFixed(3)})</span>`;
    } else {
      document.getElementById('inspN').textContent = point.n.toFixed(3);
    }

    // k display
    const kFormatted = point.k < 1e-4 ? point.k.toExponential(2) : point.k.toFixed(3);
    if (point.expK !== null) {
      const expKFormatted = point.expK < 1e-4 ? point.expK.toExponential(2) : point.expK.toFixed(3);
      document.getElementById('inspK').innerHTML = `${kFormatted} <span style="font-size:11px;color:var(--text-muted);font-weight:normal;">(exp ${expKFormatted}, Δ=${point.diffK.toFixed(3)})</span>`;
    } else {
      document.getElementById('inspK').textContent = kFormatted;
    }
    
    document.getElementById('inspEps').textContent = `${point.eps1.toFixed(2)} / ${point.eps2.toFixed(2)}`;
    document.getElementById('inspR').textContent = `${point.reflectancePct.toFixed(1)}%`;
    
    const deltaStr = Number.isFinite(point.delta_nm) 
      ? (point.delta_nm > 10000 ? '> 10 μm' : `${point.delta_nm.toFixed(1)} nm`)
      : '∞ (Transparent)';
    document.getElementById('inspDelta').textContent = deltaStr;
  }

  // Render Data Table rows with experimental comparison columns
  function renderDataTable(data) {
    dataTableBody.innerHTML = '';
    const matName = state.currentMaterial.name || state.currentMaterial.nameEn || state.currentMaterial.formula;
    tableRowsCount.textContent = `Showing ${data.length} spectral data points (step ${state.stepWl} nm) for ${matName}`;

    const fragment = document.createDocumentFragment();

    data.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.id = `row_wl_${Math.round(row.wavelengthNm)}`;
      tr.dataset.index = idx;

      const rgb = wavelengthToRGB(row.wavelengthNm);
      const deltaText = Number.isFinite(row.delta_nm) ? row.delta_nm.toFixed(1) : '∞';

      const expNText = row.expN !== null ? row.expN.toFixed(3) : '—';
      const expKText = row.expK !== null ? (row.expK < 1e-4 ? row.expK.toExponential(2) : row.expK.toFixed(3)) : '—';
      const kCalcText = row.k < 1e-4 ? row.k.toExponential(3) : row.k.toFixed(4);

      tr.innerHTML = `
        <td style="font-weight: 600;">${row.wavelengthNm.toFixed(1)}</td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <span class="color-dot" style="background-color: ${rgb}; width: 14px; height: 14px;"></span>
          </span>
        </td>
        <td>${row.energy_eV.toFixed(4)}</td>
        <td style="color: var(--color-cyan); font-weight: 600;">${row.n.toFixed(4)}</td>
        <td style="color: #38bdf8; font-size: 12px;">${expNText}</td>
        <td style="color: var(--color-pink); font-weight: 600;">${kCalcText}</td>
        <td style="color: #fb7185; font-size: 12px;">${expKText}</td>
        <td style="color: #10b981;">${row.eps1.toFixed(3)}</td>
        <td style="color: #f59e0b;">${row.eps2.toFixed(3)}</td>
        <td style="color: var(--color-violet); font-weight: 600;">${row.reflectancePct.toFixed(2)}%</td>
        <td>${row.alpha_cm.toExponential(3)}</td>
        <td>${deltaText}</td>
      `;

      tr.addEventListener('mouseenter', () => updateInspectorBar(row));
      fragment.appendChild(tr);
    });

    dataTableBody.appendChild(fragment);
  }

  // Toast notification helper
  function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    toastMsg.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Run init
  init();
});
