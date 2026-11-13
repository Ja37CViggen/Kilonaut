/**
 * Kilonaut: Space Science Mission Control & Academy
 * Interactive Visual Simulations Engine
 * High-detail Canvas rendering for all 8 planets, major moons, moving galactic marker, and cosmic labs.
 */

class SimulationEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animId = null;
    this.currentStageId = null;
    this.state = {};
    this.time = 0;
  }

  mount(canvasElement, stageId) {
    this.stop();
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.currentStageId = stageId;
    this.time = 0;
    this.initStageState(stageId);
    this.resize();
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width || 600;
    this.height = rect.height || 400;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  initStageState(stageId) {
    this.state = {
      paused: false,
      speed: 1,
      selectedPlanet: null,
      sliderVal: 0.5,
      // Asteroids for S1_2
      asteroids: Array.from({ length: 90 }, () => ({
        dist: 120 + Math.random() * 45,
        angle: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.003,
        size: 1.5 + Math.random() * 2.5,
        color: Math.random() > 0.8 ? '#D4D4D8' : '#71717A'
      })),
      // Stars for S3_1 (Milky Way)
      mwStars: Array.from({ length: 240 }, () => {
        const arm = Math.floor(Math.random() * 4);
        const dist = 25 + Math.random() * 165;
        const angle = arm * (Math.PI / 2) + (dist * 0.02) + (Math.random() - 0.5) * 0.45;
        return {
          dist,
          angle,
          speed: 0.006 / (1 + dist * 0.006),
          size: 1 + Math.random() * 2.2,
          color: Math.random() > 0.7 ? '#38BDF8' : (Math.random() > 0.4 ? '#FDE68A' : '#FFFFFF')
        };
      })
    };
  }

  loop() {
    if (!this.state.paused) {
      this.time += 0.02 * this.state.speed;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    switch (this.currentStageId) {
      case 's1_1': this.renderSolarOrrery(); break;
      case 's1_2': this.renderAsteroidsAndGiants(); break;
      case 's1_3': this.renderPlanetaryExpeditions(); break;
      case 's2_1': this.renderMajorMoons(); break;
      case 's2_2': this.renderBlackHoleSpacetime(); break;
      case 's2_3': this.renderJamesWebbMirror(); break;
      case 's3_1': this.renderMilkyWay(); break;
      case 's3_2': this.renderStellarLifeCycles(); break;
      case 's3_3': this.renderExoplanetGoldilocks(); break;
      default: this.renderFallback();
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }

  // --- 1. S1_1: Solar Orrery with ALL 8 Planets in High Detail ---
  renderSolarOrrery() {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Detailed Blazing Sun with Solar Flares
    const sunGrad = this.ctx.createRadialGradient(cx, cy, 3, cx, cy, 26);
    sunGrad.addColorStop(0, '#FFFFFF');
    sunGrad.addColorStop(0.25, '#FEF08A');
    sunGrad.addColorStop(0.65, '#F59E0B');
    sunGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

    this.ctx.fillStyle = sunGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    this.ctx.fill();

    // Solar Prominence / Flares
    for (let f = 0; f < 6; f++) {
      const fAngle = this.time * 0.8 + (f * Math.PI) / 3;
      const fLen = 22 + Math.sin(this.time * 4 + f) * 4;
      const fx = cx + Math.cos(fAngle) * fLen;
      const fy = cy + Math.sin(fAngle) * fLen;
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(fx, fy);
      this.ctx.stroke();
    }

    // ALL 8 PLANETS: Detailed characteristics
    const planets = [
      { name: 'Mercury', r: 36, size: 4, speed: 4.15, au: '0.39 AU', type: 'mercury' },
      { name: 'Venus',   r: 58, size: 6.5, speed: 1.62, au: '0.72 AU', type: 'venus' },
      { name: 'Earth',   r: 84, size: 7, speed: 1.00, au: '1.00 AU', type: 'earth', hasMoon: true },
      { name: 'Mars',    r: 110, size: 5, speed: 0.53, au: '1.52 AU', type: 'mars' },
      { name: 'Jupiter', r: 148, size: 13, speed: 0.22, au: '5.20 AU', type: 'jupiter' },
      { name: 'Saturn',  r: 188, size: 10, speed: 0.14, au: '9.58 AU', type: 'saturn', hasRings: true },
      { name: 'Uranus',  r: 226, size: 7.5, speed: 0.08, au: '19.2 AU', type: 'uranus', hasFaintRings: true },
      { name: 'Neptune', r: 260, size: 7.5, speed: 0.05, au: '30.1 AU', type: 'neptune' }
    ];

    planets.forEach(p => {
      // Orbit Path
      this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
      this.ctx.stroke();

      // Planet Orbital Position
      const theta = this.time * p.speed;
      const px = cx + Math.cos(theta) * p.r;
      const py = cy + Math.sin(theta) * p.r;

      // Draw Detailed Planet Bodies
      this.drawDetailedPlanet(px, py, p);

      // Label (name & AU)
      this.ctx.fillStyle = '#CBD5E1';
      this.ctx.font = '9px monospace';
      this.ctx.fillText(`${p.name} (${p.au})`, px + p.size + 4, py + 3);
    });

    this.drawHUD('KILONAUT SOLAR ORRERY • ALL 8 PLANETS • SCALED ORBITAL FREQUENCIES');
  }

  // Draw rich visual planet textures for kids
  drawDetailedPlanet(x, y, p) {
    this.ctx.save();
    this.ctx.translate(x, y);

    switch (p.type) {
      case 'mercury':
        // Cratered Rocky Texture
        this.ctx.fillStyle = '#9CA3AF';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        // Tiny craters
        this.ctx.fillStyle = '#6B7280';
        this.ctx.beginPath();
        this.ctx.arc(-1, -1, 1.2, 0, Math.PI * 2);
        this.ctx.arc(1.2, 1, 0.9, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'venus':
        // Sulfuric Runaway Clouds
        const vGrad = this.ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
        vGrad.addColorStop(0, '#FDE68A');
        vGrad.addColorStop(0.5, '#F59E0B');
        vGrad.addColorStop(1, '#D97706');
        this.ctx.fillStyle = vGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'earth':
        // Deep blue oceans with continents & swirling clouds
        this.ctx.fillStyle = '#0284C7';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        // Green landmasses
        this.ctx.fillStyle = '#10B981';
        this.ctx.beginPath();
        this.ctx.arc(-2, -1, 3, 0, Math.PI * 2);
        this.ctx.arc(2.5, 1.5, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        // White polar ice caps & cloud wisps
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        this.ctx.beginPath();
        this.ctx.arc(0, -p.size + 1.2, 1.8, 0, Math.PI * 2);
        this.ctx.fill();

        // Orbiting Moon
        const mAngle = this.time * 8;
        const mx = Math.cos(mAngle) * 14;
        const my = Math.sin(mAngle) * 14;
        this.ctx.fillStyle = '#E2E8F0';
        this.ctx.beginPath();
        this.ctx.arc(mx, my, 2, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'mars':
        // Rust-red with dark volcanic plains & polar ice cap
        this.ctx.fillStyle = '#EA580C';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        // Dark volcanic basalt patches
        this.ctx.fillStyle = '#9A3412';
        this.ctx.beginPath();
        this.ctx.arc(1, 0, 2.2, 0, Math.PI * 2);
        this.ctx.fill();
        // White polar cap
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(0, -p.size + 1, 1.4, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'jupiter':
        // Cloud bands and Great Red Spot
        const jGrad = this.ctx.createLinearGradient(0, -p.size, 0, p.size);
        jGrad.addColorStop(0, '#D97706');
        jGrad.addColorStop(0.3, '#FEF3C7');
        jGrad.addColorStop(0.5, '#B45309');
        jGrad.addColorStop(0.75, '#FDE68A');
        jGrad.addColorStop(1, '#92400E');
        this.ctx.fillStyle = jGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        // Great Red Spot
        this.ctx.fillStyle = '#DC2626';
        this.ctx.beginPath();
        this.ctx.ellipse(3, 3, 3, 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        break;

      case 'saturn':
        // Golden body & tilted prominent rings
        this.ctx.fillStyle = '#FDE047';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        // 3D Tilted Rings with Cassini Division gap
        this.ctx.strokeStyle = 'rgba(253, 224, 71, 0.7)';
        this.ctx.lineWidth = 3.5;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size * 2.2, p.size * 0.7, -0.3, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size * 1.6, p.size * 0.5, -0.3, 0, Math.PI * 2);
        this.ctx.stroke();
        break;

      case 'uranus':
        // Cyan-aquamarine ice giant with subtle vertical ring
        this.ctx.fillStyle = '#22D3EE';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Tilted ring
        this.ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size * 0.6, p.size * 1.8, 0.2, 0, Math.PI * 2);
        this.ctx.stroke();
        break;

      case 'neptune':
        // Azure blue supersonic storm world
        this.ctx.fillStyle = '#1D4ED8';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        // White atmospheric storm streak
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(0, 1, p.size - 1.5, 0.2, Math.PI - 0.2);
        this.ctx.stroke();
        break;
    }

    this.ctx.restore();
  }

  // --- 2. S1_2: Asteroids & Gas Giants ---
  renderAsteroidsAndGiants() {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Inner Sun
    this.ctx.fillStyle = '#F59E0B';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    this.ctx.fill();

    // Asteroid Belt Particles
    this.state.asteroids.forEach(ast => {
      ast.angle += ast.speed;
      const ax = cx + Math.cos(ast.angle) * ast.dist;
      const ay = cy + Math.sin(ast.angle) * ast.dist;
      this.ctx.fillStyle = ast.color;
      this.ctx.beginPath();
      this.ctx.arc(ax, ay, ast.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Ceres Highlight
    const ceresAngle = this.time * 0.4;
    const ceresX = cx + Math.cos(ceresAngle) * 138;
    const ceresY = cy + Math.sin(ceresAngle) * 138;
    this.ctx.fillStyle = '#E4E4E7';
    this.ctx.shadowColor = '#38BDF8';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(ceresX, ceresY, 4.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = '#38BDF8';
    this.ctx.font = '11px sans-serif';
    this.ctx.fillText('Dwarf Planet Ceres', ceresX + 8, ceresY + 4);

    // Jupiter
    const jupAngle = this.time * 0.18;
    const jupX = cx + Math.cos(jupAngle) * 190;
    const jupY = cy + Math.sin(jupAngle) * 190;

    const jGrad = this.ctx.createLinearGradient(jupX - 16, jupY, jupX + 16, jupY);
    jGrad.addColorStop(0, '#D97706');
    jGrad.addColorStop(0.3, '#FDE68A');
    jGrad.addColorStop(0.7, '#B45309');
    jGrad.addColorStop(1, '#78350F');
    this.ctx.fillStyle = jGrad;
    this.ctx.beginPath();
    this.ctx.arc(jupX, jupY, 18, 0, Math.PI * 2);
    this.ctx.fill();

    // Great Red Spot
    this.ctx.fillStyle = '#DC2626';
    this.ctx.beginPath();
    this.ctx.ellipse(jupX + 5, jupY + 4, 4.5, 2.8, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#F59E0B';
    this.ctx.font = '11px sans-serif';
    this.ctx.fillText('Jupiter (Great Red Spot)', jupX + 22, jupY);

    this.drawHUD('ASTEROID BELT & GAS GIANTS • CERES 2.77 AU • JUPITER 5.20 AU');
  }

  // --- 3. S1_3: Planetary Expeditions Simulator ---
  renderPlanetaryExpeditions() {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Display multi-planet expedition radar array
    const planets7 = [
      { name: 'Mercury', color: '#9CA3AF', r: 35, icon: '⚪' },
      { name: 'Venus',   color: '#F59E0B', r: 65, icon: '🟡' },
      { name: 'Mars',    color: '#EF4444', r: 95, icon: '🔴' },
      { name: 'Jupiter', color: '#D97706', r: 130, icon: '🪐' },
      { name: 'Saturn',  color: '#FCD34D', r: 165, icon: '✨' },
      { name: 'Uranus',  color: '#38BDF8', r: 200, icon: '🌐' },
      { name: 'Neptune', color: '#3B82F6', r: 235, icon: '🔵' }
    ];

    planets7.forEach((p, i) => {
      const angle = this.time * (0.8 / (i + 1)) + i;
      const px = cx + Math.cos(angle) * p.r;
      const py = cy + Math.sin(angle) * (p.r * 0.6);

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      this.ctx.fillStyle = '#CBD5E1';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(p.name, px + 8, py + 3);
    });

    this.drawHUD('SOLAR SYSTEM EXPEDITIONS • 7 WORLDS • SCIENTIFIC LABS & FINAL FACT CHALLENGE');
  }

  // --- 4. S2_1: Major Moons with High Visual Details ---
  renderMajorMoons() {
    const cy = this.height / 2;

    const moons = [
      { name: "Earth's Moon", planet: 'Earth', color: '#CBD5E1', feature: 'Impact Basins & Regolith', r: 18, type: 'moon' },
      { name: 'Europa', planet: 'Jupiter', color: '#E0F2FE', feature: 'Subsurface Ocean & Fractures', r: 20, type: 'europa' },
      { name: 'Titan', planet: 'Saturn', color: '#F59E0B', feature: 'Methane Lakes & Golden Haze', r: 22, type: 'titan' },
      { name: 'Io', planet: 'Jupiter', color: '#EAB308', feature: '400+ Sulfur Volcanoes', r: 19, type: 'io' },
      { name: 'Enceladus', planet: 'Saturn', color: '#FFFFFF', feature: 'Cryovolcanic Ice Plumes', r: 16, type: 'enceladus' },
      { name: 'Ganymede', planet: 'Jupiter', color: '#94A3B8', feature: 'Largest Moon in Solar System', r: 24, type: 'ganymede' }
    ];

    const spacing = (this.width - 20) / moons.length;
    moons.forEach((m, idx) => {
      const mx = 20 + idx * spacing + spacing / 2;
      const my = cy - 10;

      this.ctx.save();
      this.ctx.translate(mx, my);

      // Detailed textures
      if (m.type === 'moon') {
        this.ctx.fillStyle = '#CBD5E1';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, m.r, 0, Math.PI * 2);
        this.ctx.fill();
        // Craters & dark maria
        this.ctx.fillStyle = '#64748B';
        this.ctx.beginPath();
        this.ctx.arc(-4, -3, 5, 0, Math.PI * 2);
        this.ctx.arc(5, 4, 3.5, 0, Math.PI * 2);
        this.ctx.arc(-2, 6, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (m.type === 'europa') {
        this.ctx.fillStyle = '#F0F9FF';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, m.r, 0, Math.PI * 2);
        this.ctx.fill();
        // Red-brown ice fractures (lineae)
        this.ctx.strokeStyle = '#B45309';
        this.ctx.lineWidth = 1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(-m.r * 0.7, -4); this.ctx.lineTo(m.r * 0.7, 5);
        this.ctx.moveTo(-2, -m.r * 0.8); this.ctx.lineTo(5, m.r * 0.8);
        this.ctx.stroke();
      } else if (m.type === 'titan') {
        this.ctx.fillStyle = '#F59E0B';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, m.r, 0, Math.PI * 2);
        this.ctx.fill();
        // Dark methane polar lakes
        this.ctx.fillStyle = '#78350F';
        this.ctx.beginPath();
        this.ctx.arc(0, -m.r + 4, 4, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (m.type === 'io') {
        this.ctx.fillStyle = '#FACC15';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, m.r, 0, Math.PI * 2);
        this.ctx.fill();
        // Red & black volcanic calderas
        this.ctx.fillStyle = '#DC2626';
        this.ctx.beginPath();
        this.ctx.arc(-5, 2, 3, 0, Math.PI * 2);
        this.ctx.arc(4, -4, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        // Erupting sulfur plume
        const plumeH = 12 + Math.sin(this.time * 5) * 4;
        this.ctx.strokeStyle = '#EF4444';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -m.r);
        this.ctx.lineTo(0, -m.r - plumeH);
        this.ctx.stroke();
      } else if (m.type === 'enceladus') {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.shadowColor = '#38BDF8';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, m.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        // South pole cryogeysers spewing water vapor
        const geyserLen = 14 + Math.sin(this.time * 6) * 5;
        this.ctx.strokeStyle = '#38BDF8';
        this.ctx.lineWidth = 1.8;
        this.ctx.beginPath();
        this.ctx.moveTo(-3, m.r); this.ctx.lineTo(-6, m.r + geyserLen);
        this.ctx.moveTo(3, m.r);  this.ctx.lineTo(6, m.r + geyserLen * 0.9);
        this.ctx.stroke();
      } else if (m.type === 'ganymede') {
        this.ctx.fillStyle = '#94A3B8';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, m.r, 0, Math.PI * 2);
        this.ctx.fill();
        // Magnetic field grooves
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, m.r - 4, 0.4, 2.2);
        this.ctx.stroke();
      }

      this.ctx.restore();

      // Labels
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(m.name, mx, my + m.r + 18);

      this.ctx.fillStyle = '#94A3B8';
      this.ctx.font = '10px monospace';
      this.ctx.fillText(m.planet, mx, my + m.r + 32);
    });

    this.ctx.textAlign = 'left';
    this.drawHUD('MAJOR MOONS LAB • DETAILED TEXTURES, VOLCANOES, AND CRYOVOLCANISM');
  }

  // --- 5. S2_2: Black Hole & Spacetime Grid ---
  renderBlackHoleSpacetime() {
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
    this.ctx.lineWidth = 1;

    for (let r = 25; r < 200; r += 20) {
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, r, r * 0.55, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      const gx = cx + Math.cos(a) * 200;
      const gy = cy + Math.sin(a) * 110;
      this.ctx.lineTo(gx, gy);
      this.ctx.stroke();
    }

    const diskGrad = this.ctx.createRadialGradient(cx, cy, 28, cx, cy, 75);
    diskGrad.addColorStop(0, '#FFFFFF');
    diskGrad.addColorStop(0.3, '#F59E0B');
    diskGrad.addColorStop(0.7, '#A855F7');
    diskGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(-0.2);
    this.ctx.scale(1, 0.35);

    this.ctx.fillStyle = diskGrad;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 75, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    this.ctx.fillStyle = '#000000';
    this.ctx.shadowColor = '#EC4899';
    this.ctx.shadowBlur = 18;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 26, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.strokeStyle = '#FDE68A';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 29, 0, Math.PI * 2);
    this.ctx.stroke();

    this.drawHUD('BLACK HOLE • EVENT HORIZON R_s = 2GM/c^2 • RELATIVISTIC ACCRETION DISK');
  }

  // --- 6. S2_3: James Webb Optical Beam Lab ---
  renderJamesWebbMirror() {
    const cx = this.width / 2;
    const cy = this.height / 2;

    const hexRadius = 24;
    const offsets = [
      [0, 0],
      [1, 0], [0.5, 0.866], [-0.5, 0.866], [-1, 0], [-0.5, -0.866], [0.5, -0.866],
      [2, 0], [1.5, 0.866], [1, 1.732], [0, 1.732], [-1, 1.732], [-1.5, 0.866],
      [-2, 0], [-1.5, -0.866], [-1, -1.732], [0, -1.732], [1, -1.732], [1.5, -0.866]
    ];

    const step = hexRadius * 1.75;
    offsets.forEach(([ox, oy], i) => {
      if (i === 0) return;
      const hx = cx + ox * step;
      const hy = cy + oy * step;

      this.ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const a = (s * 60) * Math.PI / 180;
        const x = hx + Math.cos(a) * hexRadius;
        const y = hy + Math.sin(a) * hexRadius;
        if (s === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      }
      this.ctx.closePath();

      const shimmer = Math.sin(this.time * 2 + i) * 0.15;
      this.ctx.fillStyle = `rgb(${245 + shimmer * 10}, ${158 + shimmer * 20}, 11)`;
      this.ctx.fill();
      this.ctx.strokeStyle = '#1E293B';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Optical beam pointing towards central detector
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.35)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(hx, hy);
      this.ctx.lineTo(cx, cy);
      this.ctx.stroke();
    });

    // Secondary tripod
    this.ctx.strokeStyle = '#94A3B8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy); this.ctx.lineTo(cx - 90, cy + 90);
    this.ctx.moveTo(cx, cy); this.ctx.lineTo(cx + 90, cy + 90);
    this.ctx.moveTo(cx, cy); this.ctx.lineTo(cx, cy - 100);
    this.ctx.stroke();

    // Central detector focal point
    this.ctx.fillStyle = '#F59E0B';
    this.ctx.shadowColor = '#FDE68A';
    this.ctx.shadowBlur = 12;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.drawHUD('JWST DEEP-SPACE INFRARED SPECTROSCOPY LAB • EXOPLANET ATMOSPHERIC ANALYSIS & DEEP-FIELD TARGET LOCK');
  }

  // --- 7. S3_1: Milky Way 3D Galaxy with DYNAMICALLY MOVING "You Are Here" ---
  renderMilkyWay() {
    const cx = this.width / 2;
    const cy = this.height / 2;

    // Glowing Galactic Core
    const coreGrad = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, 45);
    coreGrad.addColorStop(0, '#FFFFFF');
    coreGrad.addColorStop(0.2, '#FDE68A');
    coreGrad.addColorStop(0.6, '#A855F7');
    coreGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

    this.ctx.fillStyle = coreGrad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    this.ctx.fill();

    // Central supermassive black hole: Sagittarius A*
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#EC4899';
    this.ctx.font = '10px monospace';
    this.ctx.fillText('Sagittarius A*', cx + 8, cy - 6);

    // Dynamic Starfield on Spiral Arms
    this.state.mwStars.forEach(st => {
      st.angle += st.speed;
      const sx = cx + Math.cos(st.angle) * st.dist;
      const sy = cy + Math.sin(st.angle) * (st.dist * 0.65);
      this.ctx.fillStyle = st.color;
      this.ctx.beginPath();
      this.ctx.arc(sx, sy, st.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // DYNAMICALLY MOVING SUN / "YOU ARE HERE" (Orion Spur)
    // Speed tuned so it visibly and smoothly revolves with the spiral arm!
    const sunDist = 95;
    const sunAngle = this.time * 0.16 + 1.8; // Now moves visibly like the other stars!
    const sunX = cx + Math.cos(sunAngle) * sunDist;
    const sunY = cy + Math.sin(sunAngle) * (sunDist * 0.65);

    // Glowing marker for our Sun
    this.ctx.strokeStyle = '#F59E0B';
    this.ctx.lineWidth = 1.8;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, 8 + Math.sin(this.time * 5) * 2.5, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = '#FBBF24';
    this.ctx.shadowColor = '#F59E0B';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = '#38BDF8';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.fillText('📍 YOU ARE HERE: Sun (Orion Arm)', sunX + 14, sunY + 4);

    this.drawHUD('MILKY WAY GALAXY • DIAMETER 100,000 LY • SUN ORBITING SAGITTARIUS A* AT 230 KM/S');
  }

  // --- 8. S3_2: Stellar Life Cycles ---
  renderStellarLifeCycles() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const yTop = cy - 70;
    const yBottom = cy + 70;

    this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    this.ctx.lineWidth = 2;

    const nX = 60;
    this.ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
    this.ctx.beginPath();
    this.ctx.arc(nX, cy, 26, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#E2E8F0';
    this.ctx.font = 'bold 10px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Stellar Nebula', nX, cy + 38);

    this.ctx.beginPath();
    this.ctx.moveTo(nX + 26, cy); this.ctx.lineTo(130, yTop);
    this.ctx.moveTo(nX + 26, cy); this.ctx.lineTo(130, yBottom);
    this.ctx.stroke();

    const sunPhases = [
      { name: 'Yellow Dwarf', color: '#FBBF24', r: 12 },
      { name: 'Red Giant',   color: '#EF4444', r: 20 },
      { name: 'Planetary Nebula', color: '#38BDF8', r: 16 },
      { name: 'White Dwarf',  color: '#FFFFFF', r: 6 }
    ];

    sunPhases.forEach((p, i) => {
      const px = 150 + i * 95;
      if (i > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(px - 65, yTop); this.ctx.lineTo(px - p.r, yTop);
        this.ctx.stroke();
      }
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(px, yTop, p.r, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.fillStyle = '#94A3B8';
      this.ctx.font = '9px sans-serif';
      this.ctx.fillText(p.name, px, yTop + p.r + 14);
    });

    const massPhases = [
      { name: 'Blue Giant',    color: '#38BDF8', r: 16 },
      { name: 'Red Supergiant',color: '#DC2626', r: 24 },
      { name: 'SUPERNOVA!',   color: '#F59E0B', r: 20, pulse: true },
      { name: 'Neutron Star / Black Hole', color: '#A855F7', r: 8 }
    ];

    massPhases.forEach((p, i) => {
      const px = 150 + i * 95;
      if (i > 0) {
        this.ctx.beginPath();
        this.ctx.moveTo(px - 65, yBottom); this.ctx.lineTo(px - p.r, yBottom);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = p.color;
      if (p.pulse) {
        this.ctx.shadowColor = '#F59E0B';
        this.ctx.shadowBlur = 12 + Math.sin(this.time * 6) * 6;
      }
      this.ctx.beginPath();
      this.ctx.arc(px, yBottom, p.r, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      this.ctx.fillStyle = '#94A3B8';
      this.ctx.font = '9px sans-serif';
      this.ctx.fillText(p.name, px, yBottom + p.r + 14);
    });

    this.ctx.textAlign = 'left';
    this.drawHUD('STELLAR ALCHEMY • CORE NUCLEAR FUSION REACTOR: H ➔ He ➔ C ➔ O ➔ SUPERNOVA Fe & Au');
  }

  // --- 9. S3_3: Exoplanet Goldilocks Zone ---
  renderExoplanetGoldilocks() {
    const cx = this.width / 2;
    const cy = this.height / 2;

    this.ctx.fillStyle = '#EF4444';
    this.ctx.shadowColor = '#EF4444';
    this.ctx.shadowBlur = 20;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 75, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 135, 0, Math.PI * 2);
    this.ctx.arc(cx, cy, 80, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 185, 0, Math.PI * 2);
    this.ctx.stroke();

    const planetR = 108;
    const pAngle = this.time * 0.8;
    const px = cx + Math.cos(pAngle) * planetR;
    const py = cy + Math.sin(pAngle) * planetR;

    this.ctx.fillStyle = '#10B981';
    this.ctx.shadowColor = '#10B981';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    this.ctx.arc(px, py, 7, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '10px sans-serif';
    this.ctx.fillText('Cadet Prime (Orbiting)', px + 10, py - 4);

    this.drawHUD('EXOPLANET LAB • TRAPPIST-1 RED DWARF • HABITABLE GOLDILOCKS ZONE DETERMINATION');
  }

  drawHUD(telemetryText) {
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.fillRect(8, this.height - 28, this.width - 16, 22);
    this.ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
    this.ctx.strokeRect(8, this.height - 28, this.width - 16, 22);

    this.ctx.fillStyle = '#38BDF8';
    this.ctx.font = '10px monospace';
    this.ctx.fillText(telemetryText, 16, this.height - 14);
  }

  renderFallback() {
    this.ctx.fillStyle = '#94A3B8';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Kilonaut Telemetry Stream Active...', 20, 40);
  }
}

window.simEngine = new SimulationEngine();
