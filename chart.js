/**
 * High-Precision Scientific Canvas Chart Engine for Optical Dispersion
 * Supports dual Y-axes (n & k, eps1 & eps2), spectral color ribbons,
 * log/linear scales, interactive crosshairs, high-DPI rendering,
 * and overlay of benchmark experimental data (Johnson & Christy / Palik).
 */

class OpticalSpectrumChart {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    
    this.options = Object.assign({
      mode: 'nk', // 'nk', 'eps', 'reflectance', 'alpha'
      logScaleK: false,
      showExperimental: true, // Show experimental benchmark overlay
      onHover: null,
      onLeave: null
    }, options);

    this.data = [];
    this.material = null;
    this.hoverPoint = null;
    this.hoverPixelX = null;

    // Canvas padding
    this.padding = { top: 36, right: 65, bottom: 58, left: 65 };

    this.initEvents();
    this.resize();
  }

  setMode(mode) {
    this.options.mode = mode;
    this.render();
  }

  setLogScaleK(isLog) {
    this.options.logScaleK = isLog;
    this.render();
  }

  setShowExperimental(show) {
    this.options.showExperimental = show;
    this.render();
  }

  setData(data, material) {
    this.data = data || [];
    this.material = material || null;
    this.render();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.width = rect.width || 800;
    this.height = rect.height || 450;

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.plotWidth = this.width - this.padding.left - this.padding.right;
    this.plotHeight = this.height - this.padding.top - this.padding.bottom;

    this.render();
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.data || this.data.length === 0) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseX < this.padding.left || mouseX > this.width - this.padding.right ||
          mouseY < this.padding.top || mouseY > this.height - this.padding.bottom) {
        if (this.hoverPoint) {
          this.hoverPoint = null;
          this.hoverPixelX = null;
          this.render();
          if (this.options.onLeave) this.options.onLeave();
        }
        return;
      }

      // Find nearest data point based on X position
      const xFrac = (mouseX - this.padding.left) / this.plotWidth;
      const minWl = this.data[0].wavelengthNm;
      const maxWl = this.data[this.data.length - 1].wavelengthNm;
      const targetWl = minWl + xFrac * (maxWl - minWl);

      let closest = this.data[0];
      let minDiff = Math.abs(closest.wavelengthNm - targetWl);

      for (let i = 1; i < this.data.length; i++) {
        const diff = Math.abs(this.data[i].wavelengthNm - targetWl);
        if (diff < minDiff) {
          minDiff = diff;
          closest = this.data[i];
        }
      }

      this.hoverPoint = closest;
      this.hoverPixelX = mouseX;
      this.render();

      if (this.options.onHover) {
        this.options.onHover(closest, mouseX, mouseY);
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverPoint = null;
      this.hoverPixelX = null;
      this.render();
      if (this.options.onLeave) this.options.onLeave();
    });
  }

  render() {
    if (!this.ctx || !this.data || this.data.length === 0) return;

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const pad = this.padding;
    const pw = this.plotWidth;
    const ph = this.plotHeight;

    // Clear background
    ctx.clearRect(0, 0, w, h);

    // Plot area background
    ctx.fillStyle = 'rgba(11, 17, 32, 0.75)';
    ctx.fillRect(pad.left, pad.top, pw, ph);

    const minWl = this.data[0].wavelengthNm;
    const maxWl = this.data[this.data.length - 1].wavelengthNm;

    // Helper to map wavelength to canvas X
    const getX = (wl) => pad.left + ((wl - minWl) / (maxWl - minWl)) * pw;

    // 1. Draw Visible Spectrum Underlay if in view
    this.drawVisibleBandHighlight(ctx, minWl, maxWl, getX, pad, ph);

    // 2. Draw Spectrum Gradient Bar at the bottom
    this.drawSpectrumBar(ctx, minWl, maxWl, getX, pad, ph, pw);

    // 3. Render curves and axes based on selected mode
    switch (this.options.mode) {
      case 'nk':
        this.renderNK(ctx, minWl, maxWl, getX, pad, pw, ph);
        break;
      case 'eps':
        this.renderEpsilon(ctx, minWl, maxWl, getX, pad, pw, ph);
        break;
      case 'reflectance':
        this.renderReflectance(ctx, minWl, maxWl, getX, pad, pw, ph);
        break;
      case 'alpha':
        this.renderAlpha(ctx, minWl, maxWl, getX, pad, pw, ph);
        break;
    }

    // 4. Draw Crosshair & Points on hover
    if (this.hoverPoint && this.hoverPixelX !== null) {
      this.drawCrosshair(ctx, this.hoverPoint, getX, pad, pw, ph);
    }
  }

  drawVisibleBandHighlight(ctx, minWl, maxWl, getX, pad, ph) {
    const visStart = Math.max(minWl, 380);
    const visEnd = Math.min(maxWl, 780);

    if (visStart < visEnd) {
      const x1 = getX(visStart);
      const x2 = getX(visEnd);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.fillRect(x1, pad.top, x2 - x1, ph);

      // Subtle border for visible light boundary
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      if (visStart > minWl) {
        ctx.moveTo(x1, pad.top);
        ctx.lineTo(x1, pad.top + ph);
      }
      if (visEnd < maxWl) {
        ctx.moveTo(x2, pad.top);
        ctx.lineTo(x2, pad.top + ph);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  drawSpectrumBar(ctx, minWl, maxWl, getX, pad, ph, pw) {
    const barY = pad.top + ph + 8;
    const barHeight = 8;

    const grad = ctx.createLinearGradient(pad.left, 0, pad.left + pw, 0);
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const wl = minWl + frac * (maxWl - minWl);
      grad.addColorStop(frac, wavelengthToRGB(wl));
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(pad.left, barY, pw, barHeight, 4);
    ctx.fill();

    ctx.font = '10px Inter, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.textAlign = 'center';

    if (minWl < 380) {
      const uvMid = Math.max(minWl, (minWl + Math.min(maxWl, 380)) / 2);
      ctx.fillText('UV', getX(uvMid), barY + barHeight + 13);
    }
    if (maxWl >= 380 && minWl <= 780) {
      const visMid = (Math.max(minWl, 380) + Math.min(maxWl, 780)) / 2;
      ctx.fillText('Visible', getX(visMid), barY + barHeight + 13);
    }
    if (maxWl > 780) {
      const irMid = (Math.max(minWl, 780) + maxWl) / 2;
      ctx.fillText('IR', getX(irMid), barY + barHeight + 13);
    }
  }

  renderNK(ctx, minWl, maxWl, getX, pad, pw, ph) {
    // 1. Calculate Y ranges for n and k
    let maxN = -Infinity, minN = Infinity;
    let maxK = -Infinity, minK = Infinity;

    for (const d of this.data) {
      if (d.n > maxN) maxN = d.n;
      if (d.n < minN) minN = d.n;
      if (d.k > maxK) maxK = d.k;
      if (d.k < minK) minK = d.k;

      // Include experimental points in scale if shown
      if (this.options.showExperimental) {
        if (d.expN !== null && d.expN > maxN) maxN = d.expN;
        if (d.expN !== null && d.expN < minN) minN = d.expN;
        if (d.expK !== null && d.expK > maxK) maxK = d.expK;
        if (d.expK !== null && d.expK < minK) minK = d.expK;
      }
    }

    // Floor and Ceiling with buffer
    minN = Math.max(0, Math.floor(minN * 0.95 * 10) / 10);
    maxN = Math.ceil(maxN * 1.05 * 10) / 10 || 2.0;
    if (maxN - minN < 0.2) maxN = minN + 0.5;

    minK = 0;
    maxK = Math.max(0.1, Math.ceil(maxK * 1.1 * 10) / 10);

    const isLogK = this.options.logScaleK;
    let minLogK = -4; // 10^-4
    let maxLogK = Math.ceil(Math.log10(Math.max(0.01, maxK)));
    if (isLogK) {
      maxLogK = Math.max(0, maxLogK);
    }

    const getYN = (n) => pad.top + ph - ((n - minN) / (maxN - minN)) * ph;
    const getYK = (k) => {
      if (!isLogK) {
        return pad.top + ph - ((k - minK) / (maxK - minK)) * ph;
      }
      const val = Math.max(1e-4, k);
      const logVal = Math.log10(val);
      const frac = (logVal - minLogK) / (maxLogK - minLogK);
      return pad.top + ph - Math.max(0, Math.min(1, frac)) * ph;
    };

    // Store coordinate transformers for crosshairs
    this.currentGetX = getX;
    this.currentGetY1 = getYN;
    this.currentGetY2 = getYK;
    this.currentVal1Key = 'n';
    this.currentVal2Key = 'k';

    // Draw Grid
    this.drawGrid(ctx, pad, pw, ph, minWl, maxWl, minN, maxN, isLogK ? null : minK, isLogK ? null : maxK);

    // Left Axis (n) ticks & label
    this.drawLeftAxis(ctx, pad, ph, minN, maxN, 'n (Refractive Index)', '#00f0ff');

    // Right Axis (k) ticks & label
    if (isLogK) {
      this.drawRightAxisLog(ctx, pad, pw, ph, minLogK, maxLogK, 'k (Extinction Coeff.) [log]', '#ff2a6d');
    } else {
      this.drawRightAxis(ctx, pad, pw, ph, minK, maxK, 'k (Extinction Coeff.)', '#ff2a6d');
    }

    // Draw Calculated Curve: n (Cyan)
    this.drawCurve(ctx, this.data, getX, getYN, 'n', '#00f0ff', 2.5, 'rgba(0, 240, 255, 0.08)');

    // Draw Calculated Curve: k (Rose / Neon pink)
    this.drawCurve(ctx, this.data, getX, getYK, 'k', '#ff2a6d', 2.5, 'rgba(255, 42, 109, 0.08)');

    // Overlay Experimental Data Points (Johnson & Christy / Palik) if available and enabled
    const hasExp = this.material && this.material.experimentalData && this.options.showExperimental;
    if (hasExp) {
      this.drawExperimentalPoints(ctx, this.material.experimentalData, minWl, maxWl, getX, getYN, getYK);
    }

    // Legend
    const legendItems = [
      { label: 'n (Drude-Lorentz model)', color: '#00f0ff', dash: false },
      { label: isLogK ? 'k (calc, log)' : 'k (calculated extinction)', color: '#ff2a6d', dash: false }
    ];

    if (hasExp) {
      legendItems.push({ label: 'n (exp. benchmark)', color: '#38bdf8', dash: true, dot: true });
      legendItems.push({ label: 'k (exp. benchmark)', color: '#fb7185', dash: true, dot: true });
    }

    this.drawLegend(ctx, legendItems);
  }

  drawExperimentalPoints(ctx, expData, minWl, maxWl, getX, getYN, getYK) {
    const validExp = expData.filter(d => d.wl >= minWl && d.wl <= maxWl);
    if (validExp.length === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.padding.left, this.padding.top, this.plotWidth, this.plotHeight);
    ctx.clip();

    // 1. Draw dashed line for experimental n
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(getX(validExp[0].wl), getYN(validExp[0].n));
    for (let i = 1; i < validExp.length; i++) {
      ctx.lineTo(getX(validExp[i].wl), getYN(validExp[i].n));
    }
    ctx.stroke();

    // 2. Draw dashed line for experimental k
    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(getX(validExp[0].wl), getYK(validExp[0].k));
    for (let i = 1; i < validExp.length; i++) {
      ctx.lineTo(getX(validExp[i].wl), getYK(validExp[i].k));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Draw circle points for experimental n and k
    validExp.forEach(pt => {
      const x = getX(pt.wl);
      const yn = getYN(pt.n);
      const yk = getYK(pt.k);

      // exp n marker
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, yn, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // exp k marker
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, yk, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  renderEpsilon(ctx, minWl, maxWl, getX, pad, pw, ph) {
    let minE1 = Infinity, maxE1 = -Infinity;
    let minE2 = Infinity, maxE2 = -Infinity;

    for (const d of this.data) {
      if (d.eps1 < minE1) minE1 = d.eps1;
      if (d.eps1 > maxE1) maxE1 = d.eps1;
      if (d.eps2 < minE2) minE2 = d.eps2;
      if (d.eps2 > maxE2) maxE2 = d.eps2;
    }

    minE1 = Math.floor(minE1 * 1.1);
    maxE1 = Math.ceil(maxE1 * 1.1) || 5;
    minE2 = 0;
    maxE2 = Math.ceil(maxE2 * 1.1) || 5;

    const getYE1 = (e1) => pad.top + ph - ((e1 - minE1) / (maxE1 - minE1)) * ph;
    const getYE2 = (e2) => pad.top + ph - ((e2 - minE2) / (maxE2 - minE2)) * ph;

    this.currentGetX = getX;
    this.currentGetY1 = getYE1;
    this.currentGetY2 = getYE2;
    this.currentVal1Key = 'eps1';
    this.currentVal2Key = 'eps2';

    this.drawGrid(ctx, pad, pw, ph, minWl, maxWl, minE1, maxE1, minE2, maxE2);

    // Zero-line for eps1 if within range
    if (minE1 < 0 && maxE1 > 0) {
      const zeroY = getYE1(0);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(pad.left, zeroY);
      ctx.lineTo(pad.left + pw, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.font = '10px monospace';
      ctx.fillText('ε₁ = 0 (plasma resonance)', pad.left + 8, zeroY - 4);
    }

    this.drawLeftAxis(ctx, pad, ph, minE1, maxE1, 'ε₁ (Re ε)', '#10b981');
    this.drawRightAxis(ctx, pad, pw, ph, minE2, maxE2, 'ε₂ (Im ε)', '#f59e0b');

    this.drawCurve(ctx, this.data, getX, getYE1, 'eps1', '#10b981', 2.5);
    this.drawCurve(ctx, this.data, getX, getYE2, 'eps2', '#f59e0b', 2.5);

    this.drawLegend(ctx, [
      { label: 'ε₁ = n² - k² (polarization / Re)', color: '#10b981' },
      { label: 'ε₂ = 2nk (loss / absorption / Im)', color: '#f59e0b' }
    ]);
  }

  renderReflectance(ctx, minWl, maxWl, getX, pad, pw, ph) {
    const minR = 0;
    const maxR = 100;

    const getYR = (rPct) => pad.top + ph - (rPct / maxR) * ph;

    this.currentGetX = getX;
    this.currentGetY1 = getYR;
    this.currentGetY2 = null;
    this.currentVal1Key = 'reflectancePct';
    this.currentVal2Key = null;

    this.drawGrid(ctx, pad, pw, ph, minWl, maxWl, minR, maxR, null, null);
    this.drawLeftAxis(ctx, pad, ph, minR, maxR, 'Reflectance R (%)', '#a855f7');

    this.drawCurve(ctx, this.data, getX, getYR, 'reflectancePct', '#a855f7', 2.5, 'rgba(168, 85, 247, 0.18)');

    this.drawLegend(ctx, [
      { label: 'R(λ) = ((n-1)² + k²) / ((n+1)² + k²)', color: '#a855f7' }
    ]);
  }

  renderAlpha(ctx, minWl, maxWl, getX, pad, pw, ph) {
    let minAlpha = 1e-1; // 0.1 cm^-1
    let maxAlpha = 1e7;

    for (const d of this.data) {
      if (d.alpha_cm > maxAlpha) maxAlpha = d.alpha_cm;
    }
    maxAlpha = Math.pow(10, Math.ceil(Math.log10(maxAlpha) + 0.3));

    const minLog = 0; // 10^0
    const maxLog = Math.log10(maxAlpha);

    const getYAlpha = (a) => {
      const val = Math.max(1, a);
      const logVal = Math.log10(val);
      const frac = (logVal - minLog) / (maxLog - minLog);
      return pad.top + ph - Math.max(0, Math.min(1, frac)) * ph;
    };

    this.currentGetX = getX;
    this.currentGetY1 = getYAlpha;
    this.currentGetY2 = null;
    this.currentVal1Key = 'alpha_cm';
    this.currentVal2Key = null;

    this.drawGrid(ctx, pad, pw, ph, minWl, maxWl, 0, maxLog, null, null);
    this.drawLeftAxisLog(ctx, pad, ph, minLog, maxLog, 'Absorption Coeff. α (cm⁻¹) [log]', '#fb923c');

    this.drawCurve(ctx, this.data, getX, getYAlpha, 'alpha_cm', '#fb923c', 2.5, 'rgba(251, 146, 60, 0.15)');

    this.drawLegend(ctx, [
      { label: 'α(λ) = 4πk / λ (absorption coefficient)', color: '#fb923c' }
    ]);
  }

  drawGrid(ctx, pad, pw, ph, minWl, maxWl, min1, max1, min2, max2) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Vertical grid lines (wavelength)
    const numXDivs = 8;
    for (let i = 0; i <= numXDivs; i++) {
      const frac = i / numXDivs;
      const x = pad.left + frac * pw;
      const wl = Math.round(minWl + frac * (maxWl - minWl));

      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + ph);
      ctx.stroke();

      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${wl}`, x, pad.top + ph + 22);
    }

    // Horizontal grid lines
    const numYDivs = 6;
    for (let i = 0; i <= numYDivs; i++) {
      const frac = i / numYDivs;
      const y = pad.top + frac * ph;

      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + pw, y);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeRect(pad.left, pad.top, pw, ph);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Wavelength λ (nm)', pad.left + pw / 2, pad.top + ph + 44);
  }

  drawLeftAxis(ctx, pad, ph, minVal, maxVal, labelText, color) {
    ctx.fillStyle = color;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    const numTicks = 6;
    for (let i = 0; i <= numTicks; i++) {
      const frac = i / numTicks;
      const y = pad.top + ph - frac * ph;
      const val = minVal + frac * (maxVal - minVal);
      ctx.fillText(val.toFixed(2), pad.left - 8, y + 4);
    }

    ctx.save();
    ctx.translate(pad.left - 44, pad.top + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, 0, 0);
    ctx.restore();
  }

  drawRightAxis(ctx, pad, pw, ph, minVal, maxVal, labelText, color) {
    ctx.fillStyle = color;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    const numTicks = 6;
    for (let i = 0; i <= numTicks; i++) {
      const frac = i / numTicks;
      const y = pad.top + ph - frac * ph;
      const val = minVal + frac * (maxVal - minVal);
      ctx.fillText(val.toFixed(2), pad.left + pw + 8, y + 4);
    }

    ctx.save();
    ctx.translate(pad.left + pw + 48, pad.top + ph / 2);
    ctx.rotate(Math.PI / 2);
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, 0, 0);
    ctx.restore();
  }

  drawRightAxisLog(ctx, pad, pw, ph, minLog, maxLog, labelText, color) {
    ctx.fillStyle = color;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    for (let exp = minLog; exp <= maxLog; exp++) {
      const frac = (exp - minLog) / (maxLog - minLog);
      const y = pad.top + ph - frac * ph;
      ctx.fillText(`10^${exp}`, pad.left + pw + 8, y + 4);
    }

    ctx.save();
    ctx.translate(pad.left + pw + 48, pad.top + ph / 2);
    ctx.rotate(Math.PI / 2);
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, 0, 0);
    ctx.restore();
  }

  drawLeftAxisLog(ctx, pad, ph, minLog, maxLog, labelText, color) {
    ctx.fillStyle = color;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';

    for (let exp = minLog; exp <= maxLog; exp += 1) {
      const frac = (exp - minLog) / (maxLog - minLog);
      const y = pad.top + ph - frac * ph;
      ctx.fillText(`10^${exp}`, pad.left - 8, y + 4);
    }

    ctx.save();
    ctx.translate(pad.left - 44, pad.top + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(labelText, 0, 0);
    ctx.restore();
  }

  drawCurve(ctx, data, getX, getY, key, strokeColor, lineWidth = 2.5, fillColor = null) {
    if (data.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(this.padding.left, this.padding.top, this.plotWidth, this.plotHeight);
    ctx.clip();

    ctx.beginPath();
    ctx.moveTo(getX(data[0].wavelengthNm), getY(data[0][key]));

    for (let i = 1; i < data.length; i++) {
      const x = getX(data[i].wavelengthNm);
      const y = getY(data[i][key]);
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.stroke();

    if (fillColor) {
      const lastX = getX(data[data.length - 1].wavelengthNm);
      const firstX = getX(data[0].wavelengthNm);
      const bottomY = this.padding.top + this.plotHeight;

      ctx.lineTo(lastX, bottomY);
      ctx.lineTo(firstX, bottomY);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    ctx.restore();
  }

  drawCrosshair(ctx, point, getX, pad, pw, ph) {
    const x = getX(point.wavelengthNm);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, pad.top + ph);
    ctx.stroke();
    ctx.setLineDash([]);

    if (this.currentGetY1 && this.currentVal1Key) {
      const y1 = this.currentGetY1(point[this.currentVal1Key]);
      ctx.fillStyle = this.options.mode === 'nk' ? '#00f0ff' : (this.options.mode === 'eps' ? '#10b981' : '#a855f7');
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y1, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (this.currentGetY2 && this.currentVal2Key) {
      const y2 = this.currentGetY2(point[this.currentVal2Key]);
      ctx.fillStyle = this.options.mode === 'nk' ? '#ff2a6d' : '#f59e0b';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  drawLegend(ctx, items) {
    const pad = this.padding;
    let currX = pad.left + 10;
    const y = pad.top - 14;

    ctx.font = '11px Inter, sans-serif';
    ctx.textBaseline = 'middle';

    for (const item of items) {
      if (item.dash) {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(currX, y);
        ctx.lineTo(currX + 16, y);
        ctx.stroke();
        ctx.setLineDash([]);

        if (item.dot) {
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = item.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(currX + 8, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, currX + 22, y);

        const metrics = ctx.measureText(item.label);
        currX += metrics.width + 36;
      } else {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(currX + 5, y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'left';
        ctx.fillText(item.label, currX + 14, y);

        const metrics = ctx.measureText(item.label);
        currX += metrics.width + 30;
      }
    }
  }

  exportToPNG(fileName = 'spectrum_chart.png') {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = this.canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
