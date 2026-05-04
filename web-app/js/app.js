import { PuzzleController } from './game.js';
import { LEVELS, MANIFEST } from './levels.js';

// ══════════════════════════════════
// STARFIELD BACKGROUND
// ══════════════════════════════════
class Starfield {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }
  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.generateStars();
  }
  generateStars() {
    this.stars = [];
    const count = Math.floor((window.innerWidth * window.innerHeight) / 2000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.6 + 0.1,
        speed: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
  animate(t) {
    const ctx = this.ctx;
    const w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    for (const s of this.stars) {
      const twinkle = Math.sin(t * 0.001 * s.speed + s.phase) * 0.3 + 0.7;
      ctx.globalAlpha = s.a * twinkle;
      ctx.fillStyle = '#F5F2E8';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(this.animate);
  }
}

// ══════════════════════════════════
// SAVE MANAGER
// ══════════════════════════════════
class SaveManager {
  constructor() {
    this.data = this.load();
  }
  getDefault() {
    return {
      schemaVersion: 1,
      solvedLevels: [],
      solvedConstellations: [],
      dailyStreak: 0,
      graceDaysUsedThisMonth: 0,
      lastDailyDate: null,
      journeyProgress: { chapter: 0, level: 0 },
      settings: { hemisphere: 'N', haptics: true, music: true, sfx: true },
      onboardingDone: false,
    };
  }
  load() {
    try {
      const raw = localStorage.getItem('cw_save');
      if (raw) return { ...this.getDefault(), ...JSON.parse(raw) };
    } catch (e) { /* ignore */ }
    return this.getDefault();
  }
  save() {
    try { localStorage.setItem('cw_save', JSON.stringify(this.data)); } catch (e) { /* ignore */ }
  }
  isSolved(levelId) { return this.data.solvedLevels.includes(levelId); }
  markSolved(levelId, constellation) {
    if (!this.data.solvedLevels.includes(levelId)) this.data.solvedLevels.push(levelId);
    if (constellation && !this.data.solvedConstellations.includes(constellation)) {
      this.data.solvedConstellations.push(constellation);
    }
    this.save();
  }
  getNextJourneyLevel() {
    for (const lvl of LEVELS) {
      if (!this.isSolved(lvl.id)) return lvl;
    }
    return LEVELS[LEVELS.length - 1];
  }
}

// ══════════════════════════════════
// DAILY PUZZLE
// ══════════════════════════════════
function getDailyLevel() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const idx = dayOfYear % LEVELS.length;
  return LEVELS[idx];
}

// ══════════════════════════════════
// SPLASH ANIMATION
// ══════════════════════════════════
function animateSplashConstellation(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 128 * dpr;
  canvas.height = 128 * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Ursa Minor — 7 stars
  const stars = [
    { x: 64, y: 20 }, { x: 70, y: 35 }, { x: 58, y: 48 },
    { x: 72, y: 58 }, { x: 80, y: 72 }, { x: 56, y: 80 }, { x: 64, y: 100 }
  ];
  const lines = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]];
  let progress = 0;
  const dur = 600;
  const start = performance.now();
  function draw(now) {
    progress = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - progress, 3);
    ctx.clearRect(0, 0, 128, 128);
    // Lines
    const totalLines = lines.length;
    const lineProgress = eased * totalLines;
    ctx.strokeStyle = 'rgba(244, 226, 168, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (let i = 0; i < totalLines; i++) {
      if (i >= lineProgress) break;
      const [a, b] = lines[i];
      const segP = Math.min(1, lineProgress - i);
      ctx.beginPath();
      ctx.moveTo(stars[a].x, stars[a].y);
      ctx.lineTo(
        stars[a].x + (stars[b].x - stars[a].x) * segP,
        stars[a].y + (stars[b].y - stars[a].y) * segP
      );
      ctx.stroke();
    }
    // Stars
    for (let i = 0; i < stars.length; i++) {
      const threshold = i / stars.length;
      if (eased < threshold) continue;
      const s = stars[i];
      const a = Math.min(1, (eased - threshold) * 4);
      ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 5);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.5, '#FFF4D6');
      g.addColorStop(1, 'rgba(255, 219, 142, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (progress < 1) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// ══════════════════════════════════
// SCREEN MANAGER
// ══════════════════════════════════
class ScreenManager {
  constructor() {
    this.current = 'screen-splash';
    this.history = [];
  }
  show(id) {
    const prev = document.getElementById(this.current);
    const next = document.getElementById(id);
    if (prev) prev.classList.remove('active');
    if (next) next.classList.add('active');
    this.history.push(this.current);
    this.current = id;
  }
  back() {
    const prevId = this.history.pop();
    if (!prevId) return;
    const curr = document.getElementById(this.current);
    const prev = document.getElementById(prevId);
    if (curr) curr.classList.remove('active');
    if (prev) prev.classList.add('active');
    this.current = prevId;
  }
}

// ══════════════════════════════════
// MAIN APP
// ══════════════════════════════════
class App {
  constructor() {
    this.screens = new ScreenManager();
    this.save = new SaveManager();
    this.puzzle = null;
    this.currentLevel = null;
    this.currentSource = 'daily'; // 'daily' | 'journey'
  }

  init() {
    // Starfield
    new Starfield(document.getElementById('starfield-canvas'));
    // Splash
    animateSplashConstellation(document.getElementById('splash-constellation'));
    setTimeout(() => {
      if (!this.save.data.onboardingDone) {
        this.showOnboarding();
      } else {
        this.showHome();
      }
    }, 2000);
    // Puzzle controller
    this.puzzle = new PuzzleController(document.getElementById('puzzle-canvas'));
    this.puzzle.onSolved = (levelData) => this.handlePuzzleSolved(levelData);
    // Bind events
    this.bindEvents();
  }

  bindEvents() {
    // Home
    document.getElementById('btn-daily-play').addEventListener('click', () => this.playDaily());
    document.getElementById('card-journey').addEventListener('click', () => this.showJourney());
    document.getElementById('btn-settings').addEventListener('click', () => this.screens.show('screen-settings'));
    // Puzzle
    document.getElementById('btn-puzzle-back').addEventListener('click', () => {
      this.puzzle.stopRenderLoop();
      this.showHome();
    });
    // Completion
    document.getElementById('overlay-completion').addEventListener('click', () => {
      document.getElementById('overlay-completion').classList.remove('active');
      this.showHome();
    });
    // Journey back
    document.getElementById('btn-journey-back').addEventListener('click', () => this.showHome());
    // Settings back
    document.getElementById('btn-settings-back').addEventListener('click', () => this.screens.back());
    // Settings toggles
    document.getElementById('toggle-music').addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('active');
      this.save.data.settings.music = e.currentTarget.classList.contains('active');
      this.save.save();
    });
    document.getElementById('toggle-sfx').addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('active');
      this.save.data.settings.sfx = e.currentTarget.classList.contains('active');
      this.save.save();
    });
    document.getElementById('toggle-haptics').addEventListener('click', (e) => {
      e.currentTarget.classList.toggle('active');
      this.save.data.settings.haptics = e.currentTarget.classList.contains('active');
      this.save.save();
    });
    // Onboarding
    document.getElementById('btn-onboarding-next')?.addEventListener('click', () => this.advanceOnboarding());
    document.getElementById('btn-onboarding-skip')?.addEventListener('click', () => {
      this.save.data.onboardingDone = true;
      this.save.save();
      this.showHome();
    });
  }

  // ── HOME ──
  showHome() {
    this.screens.show('screen-home');
    this.updateHomeScreen();
  }

  updateHomeScreen() {
    const daily = getDailyLevel();
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dateStr = `${months[now.getMonth()]} ${now.getDate()}`;
    const solved = this.save.isSolved(`daily_${now.toISOString().slice(0,10)}`);
    const heroCard = document.getElementById('hero-card');
    document.getElementById('hero-eyebrow').textContent = `TONIGHT'S SKY · ${dateStr.toUpperCase()}`;
    document.getElementById('hero-constellation').textContent = daily.constellation;
    document.getElementById('hero-lore').textContent = daily.lore;
    const btn = document.getElementById('btn-daily-play');
    if (solved) {
      heroCard.classList.add('solved');
      btn.textContent = 'Revisit';
    } else {
      heroCard.classList.remove('solved');
      btn.textContent = 'Begin';
    }
    // Streak
    const streak = this.save.data.dailyStreak;
    if (streak > 0) {
      document.getElementById('home-streak-number').textContent = streak;
      document.getElementById('home-streak-label').textContent = streak === 1 ? 'night' : 'nights';
    } else {
      document.getElementById('home-streak-number').textContent = '☽';
      document.getElementById('home-streak-label').textContent = 'Welcome';
    }
    // Journey card
    const next = this.save.getNextJourneyLevel();
    const ch = MANIFEST.chapters.find(c => c.id === next.chapter);
    document.getElementById('journey-card-title').textContent =
      `${ch ? ch.title : 'Journey'} — Level ${next.index}`;
    // Almanac card
    const solvedCount = this.save.data.solvedConstellations.length;
    document.getElementById('almanac-card-title').textContent = `${solvedCount} of 88 constellations`;
  }

  // ── PUZZLE ──
  playDaily() {
    const daily = getDailyLevel();
    this.currentSource = 'daily';
    this.startPuzzle(daily);
  }

  playLevel(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    this.currentSource = 'journey';
    this.startPuzzle(level);
  }

  startPuzzle(levelData) {
    this.currentLevel = levelData;
    this.screens.show('screen-puzzle');
    document.getElementById('puzzle-metadata').textContent =
      this.currentSource === 'daily' ? levelData.constellation : `Level ${levelData.index}`;
    // Delay to allow screen transition, then init puzzle
    setTimeout(() => {
      this.puzzle.loadLevel(levelData);
      this.puzzle.startRenderLoop();
    }, 100);
  }

  handlePuzzleSolved(levelData) {
    this.puzzle.stopRenderLoop();
    // Save
    if (this.currentSource === 'daily') {
      const today = new Date().toISOString().slice(0, 10);
      this.save.markSolved(`daily_${today}`, levelData.constellation);
      this.save.data.dailyStreak++;
      this.save.data.lastDailyDate = today;
    } else {
      this.save.markSolved(levelData.id, levelData.constellation);
    }
    this.save.save();
    // Show completion overlay
    this.showCompletion(levelData);
  }

  showCompletion(levelData) {
    const overlay = document.getElementById('overlay-completion');
    // Draw constellation shape on completion canvas
    this.drawCompletionConstellation(levelData);
    // Set text
    const nameEl = document.getElementById('completion-name');
    const loreEl = document.getElementById('completion-lore');
    const dateEl = document.getElementById('completion-date');
    const hintEl = overlay.querySelector('.completion-tap-hint');
    nameEl.textContent = levelData.constellation;
    loreEl.textContent = levelData.lore;
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    dateEl.textContent = this.currentSource === 'daily'
      ? `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
      : `Journey · Level ${levelData.index}`;
    // Reset animations
    nameEl.classList.remove('show');
    loreEl.classList.remove('show');
    dateEl.classList.remove('show');
    hintEl.classList.remove('show');
    overlay.classList.add('active');
    // Stagger animations
    setTimeout(() => nameEl.classList.add('show'), 400);
    setTimeout(() => loreEl.classList.add('show'), 700);
    setTimeout(() => dateEl.classList.add('show'), 1000);
    setTimeout(() => hintEl.classList.add('show'), 1200);
  }

  drawCompletionConstellation(levelData) {
    const canvas = document.getElementById('completion-canvas');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr;
    canvas.height = 400 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, 400, 400);
    const pad = 60;
    const scaleX = (400 - pad * 2) / (levelData.width - 1 || 1);
    const scaleY = (400 - pad * 2) / (levelData.height - 1 || 1);
    const scale = Math.min(scaleX, scaleY);
    const offX = (400 - (levelData.width - 1) * scale) / 2;
    const offY = (400 - (levelData.height - 1) * scale) / 2;
    function pos(x, y) { return { x: offX + x * scale, y: offY + y * scale }; }
    // Draw solution path as thin line
    const sol = levelData.solution;
    ctx.strokeStyle = 'rgba(244, 226, 168, 0.4)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < sol.length; i++) {
      const p = pos(sol[i][0], sol[i][1]);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    // Draw waypoint stars with glow
    for (const wp of levelData.waypoints) {
      const p = pos(wp.x, wp.y);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      g.addColorStop(0.3, 'rgba(255, 244, 214, 0.7)');
      g.addColorStop(1, 'rgba(255, 219, 142, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = '#FFF4D6';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    // Connect waypoints with bright line
    ctx.strokeStyle = 'rgba(244, 226, 168, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const sorted = [...levelData.waypoints].sort((a, b) => a.order - b.order);
    for (let i = 0; i < sorted.length; i++) {
      const p = pos(sorted[i].x, sorted[i].y);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  // ── JOURNEY ──
  showJourney() {
    this.screens.show('screen-journey');
    this.renderJourney();
  }

  renderJourney() {
    const container = document.getElementById('journey-content');
    container.innerHTML = '';
    for (const chapter of MANIFEST.chapters) {
      const section = document.createElement('div');
      section.className = 'chapter-section';
      const levels = LEVELS.filter(l => l.chapter === chapter.id);
      section.innerHTML = `
        <div class="chapter-header">
          <div class="chapter-eyebrow">${chapter.id === 'tutorial' ? 'TUTORIAL' : 'CHAPTER 1'} — ${chapter.title.toUpperCase()}</div>
          <div class="chapter-title">${chapter.title}</div>
        </div>
        <div class="level-grid" id="grid-${chapter.id}"></div>
      `;
      container.appendChild(section);
      const grid = section.querySelector('.level-grid');
      for (const level of levels) {
        const solved = this.save.isSolved(level.id);
        const btn = document.createElement('button');
        btn.className = `level-node ${solved ? 'solved' : 'unlocked'}`;
        btn.textContent = solved ? '✓' : level.index;
        btn.addEventListener('click', () => this.playLevel(level.id));
        grid.appendChild(btn);
      }
    }
  }

  // ── ONBOARDING ──
  onboardingStep = 0;
  onboardingData = [
    { headline: 'Trace the stars', text: 'Press and drag from star 1. Your line follows your finger across the sky.' },
    { headline: 'Snap into place', text: 'When your line reaches the next star, it locks in. Keep going to the next.' },
    { headline: 'Stars in order', text: 'Visit star 1, then 2, then 3. Reach the final star to complete the constellation.' },
    { headline: 'Come back each night', text: 'A new constellation waits for you every evening. Begin your first night.' },
  ];

  showOnboarding() {
    this.onboardingStep = 0;
    this.screens.show('screen-onboarding');
    this.renderOnboardingStep();
  }

  renderOnboardingStep() {
    const step = this.onboardingData[this.onboardingStep];
    const body = document.getElementById('onboarding-body');
    body.innerHTML = `
      <div class="onboarding-illustration">
        <canvas id="onboarding-canvas" width="400" height="400"></canvas>
      </div>
      <h2 class="onboarding-headline">${step.headline}</h2>
      <p class="onboarding-text">${step.text}</p>
    `;
    // Update dots
    document.querySelectorAll('.onboarding-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === this.onboardingStep);
    });
    // Update button
    const btn = document.getElementById('btn-onboarding-next');
    const skip = document.getElementById('btn-onboarding-skip');
    if (this.onboardingStep >= this.onboardingData.length - 1) {
      btn.textContent = 'Start';
      skip.style.display = 'none';
    } else {
      btn.textContent = 'Continue';
      skip.style.display = '';
    }
    this.drawOnboardingIllustration(this.onboardingStep);
  }

  drawOnboardingIllustration(step) {
    const canvas = document.getElementById('onboarding-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 400 * dpr; canvas.height = 400 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, 400, 400);

    // Each step shows free-positioned stars with a partial / full connecting line
    const layouts = [
      [ {x:120,y:300,n:'1'}, {x:300,y:120,n:'2'} ],                                   // intro
      [ {x:100,y:300,n:'1'}, {x:230,y:170,n:'2'}, {x:320,y:300,n:'3'} ],              // snap
      [ {x:120,y:310,n:'1'}, {x:200,y:130,n:'2'}, {x:280,y:230,n:'3'}, {x:330,y:120,n:'4'} ], // ordered
      [ {x:200,y:100,n:'1'}, {x:130,y:230,n:'2'}, {x:270,y:240,n:'3'}, {x:200,y:330,n:'4'} ], // calm
    ];
    const stars = layouts[Math.min(step, layouts.length - 1)];

    // Connecting line: progressively complete
    // step 0: line halfway between dot 1 and dot 2 (illustrating "drag from")
    // step 1: line through 1→2, dashed toward 3 (snap)
    // step 2: solid line through all in order
    // step 3: solid line forming a small constellation
    ctx.strokeStyle = 'rgba(244, 226, 168, 0.85)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(244, 226, 168, 0.4)';
    ctx.shadowBlur = 10;

    if (step === 0) {
      const a = stars[0], b = stars[1];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + (b.x - a.x) * 0.55, a.y + (b.y - a.y) * 0.55);
      ctx.stroke();
    } else if (step === 1) {
      ctx.beginPath();
      ctx.moveTo(stars[0].x, stars[0].y);
      ctx.lineTo(stars[1].x, stars[1].y);
      ctx.stroke();
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(stars[1].x, stars[1].y);
      ctx.lineTo(stars[2].x, stars[2].y);
      ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.moveTo(stars[0].x, stars[0].y);
      for (let i = 1; i < stars.length; i++) ctx.lineTo(stars[i].x, stars[i].y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Stars
    for (const s of stars) {
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 22);
      g.addColorStop(0, '#FFFFFF');
      g.addColorStop(0.4, '#FFF4D6');
      g.addColorStop(1, 'rgba(255,219,142,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(s.x, s.y, 22, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#FFF4D6';
      ctx.beginPath(); ctx.arc(s.x, s.y, 9, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#050818';
      ctx.font = '300 14px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.n, s.x, s.y + 1);
    }
  }

  advanceOnboarding() {
    this.onboardingStep++;
    if (this.onboardingStep >= this.onboardingData.length) {
      this.save.data.onboardingDone = true;
      this.save.save();
      this.showHome();
    } else {
      this.renderOnboardingStep();
    }
  }
}

// ── BOOT ──
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
