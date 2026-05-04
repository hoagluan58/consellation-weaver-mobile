/* ═══════════════════════════════════════════════
   Constellation Weaver — Free-form Connect-the-Stars
   Drag a single line from star 1; it snaps to each
   next-ordered star when the cursor enters its
   snap radius. Reach the last star to win.
   ═══════════════════════════════════════════════ */

const COLORS = {
  bgVoid: '#050818',
  starCore: '#FFF4D6',
  starGlow: '#FFDB8E',
  pathCool: '#B8D4FF',
  pathWarm: '#F4E2A8',
  inkPrimary: '#F5F2E8',
  inkTertiary: '#5C6580',
  signalSuccess: '#8FE3B0',
};

// ══════════════════════════════════
// BOARD MODEL
// ══════════════════════════════════
export class BoardModel {
  constructor(levelData) {
    this.dots = levelData.waypoints
      .map(wp => ({ x: wp.x, y: wp.y, order: wp.order }))
      .sort((a, b) => a.order - b.order);
    this.boundsW = Math.max(1, (levelData.width ?? 1) - 1);
    this.boundsH = Math.max(1, (levelData.height ?? 1) - 1);
  }
  get firstDot() { return this.dots[0]; }
  get lastDot() { return this.dots[this.dots.length - 1]; }
}

// ══════════════════════════════════
// TRACE MODEL — what the player has drawn
// ══════════════════════════════════
export class TraceModel {
  constructor() {
    this.visited = 0;     // count of dots already snapped (0..dots.length)
    this.cursor = null;   // {x, y} in canvas pixel coords; null when idle
  }
  reset() { this.visited = 0; this.cursor = null; }
}

// ══════════════════════════════════
// PARTICLE SYSTEM
// ══════════════════════════════════
class Particle {
  constructor() { this.reset(0, 0); this.alive = false; }
  reset(x, y) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.life = 1;
    this.decay = 0.02 + Math.random() * 0.03;
    this.size = 2 + Math.random() * 3;
    this.alive = true;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    if (this.life <= 0) this.alive = false;
  }
}

class ParticlePool {
  constructor(size) {
    this.pool = Array.from({ length: size }, () => new Particle());
  }
  emit(x, y, count) {
    let emitted = 0;
    for (const p of this.pool) {
      if (!p.alive && emitted < count) { p.reset(x, y); emitted++; }
    }
  }
  burst(x, y, count = 12) {
    for (const p of this.pool) {
      if (count <= 0) break;
      if (!p.alive) {
        p.reset(x, y);
        p.vx = (Math.random() - 0.5) * 6;
        p.vy = (Math.random() - 0.5) * 6;
        p.size = 2 + Math.random() * 4;
        count--;
      }
    }
  }
  update() { for (const p of this.pool) if (p.alive) p.update(); }
  draw(ctx) {
    for (const p of this.pool) {
      if (!p.alive) continue;
      ctx.globalAlpha = p.life * 0.7;
      ctx.fillStyle = COLORS.pathWarm;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// ══════════════════════════════════
// RENDERER
// ══════════════════════════════════
export class PuzzleRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.particles = new ParticlePool(80);
    this.time = 0;
    this.twinkleTimer = 0;

    // Layout (filled by resize)
    this.canvasSize = 0;
    this.dotPixelPositions = [];
    this.starRadius = 0;
    this.fontSize = 0;
    this.lineWidth = 0;
    this.snapRadius = 0;
    this.startGraceRadius = 0;

    // Completion / state
    this.completionPhase = 0;
    this.completionTime = 0;
    this.solved = false;
  }

  resize(containerWidth, containerHeight, board) {
    const maxSide = Math.max(120, Math.min(containerWidth, containerHeight) - 32);
    const side = Math.min(maxSide, 400);
    this.canvasSize = side;
    this.canvas.style.width = side + 'px';
    this.canvas.style.height = side + 'px';
    this.canvas.width = Math.round(side * this.dpr);
    this.canvas.height = Math.round(side * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const pad = side * 0.16;
    const innerW = side - pad * 2;
    const innerH = side - pad * 2;
    this.dotPixelPositions = board.dots.map(d => ({
      x: pad + (d.x / board.boundsW) * innerW,
      y: pad + (d.y / board.boundsH) * innerH,
    }));

    this.starRadius = Math.max(8, side * 0.038);
    this.fontSize = Math.max(13, side * 0.045);
    this.lineWidth = Math.max(5, side * 0.022);
    this.snapRadius = side * 0.075;            // in-flight snap distance
    this.startGraceRadius = side * 0.11;       // initial-touch lenience
  }

  cursorToCanvas(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  render(board, trace, dt) {
    const ctx = this.ctx;
    const w = this.canvas.width / this.dpr;
    const h = this.canvas.height / this.dpr;
    this.time += dt;
    this.twinkleTimer += dt;
    ctx.clearRect(0, 0, w, h);

    // 1. Pre-snap halo around the next expected dot (during drag)
    this.drawNextDotHalo(trace);

    // 2. Line through snapped dots + current cursor
    this.drawLine(trace);

    // 3. Particles trailing the cursor while drawing
    if (trace.cursor && !this.solved && trace.visited > 0) {
      this.particles.emit(trace.cursor.x, trace.cursor.y, 2);
    }
    this.particles.update();
    this.particles.draw(ctx);

    // 4. Stars on top
    this.drawStars(board, trace);
  }

  drawNextDotHalo(trace) {
    if (this.solved) return;
    if (trace.visited === 0) return;
    if (trace.visited >= this.dotPixelPositions.length) return;
    const next = this.dotPixelPositions[trace.visited];
    const ctx = this.ctx;
    const pulse = 0.5 + 0.5 * Math.sin(this.time * 4);
    const r = this.snapRadius * (0.85 + 0.15 * pulse);
    ctx.save();
    ctx.globalAlpha = 0.18 + 0.18 * pulse;
    ctx.strokeStyle = COLORS.pathCool;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(next.x, next.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawLine(trace) {
    const ctx = this.ctx;
    const points = [];
    for (let i = 0; i < trace.visited; i++) points.push(this.dotPixelPositions[i]);
    if (trace.cursor && trace.visited > 0 && !this.solved) points.push(trace.cursor);
    if (this.solved) {
      // when solved, draw fully through every dot
      points.length = 0;
      for (const p of this.dotPixelPositions) points.push(p);
    }
    if (points.length < 2) return;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const t = points.length > 1 ? i / (points.length - 1) : 0;
      const r = Math.round(184 + (244 - 184) * t);
      const g = Math.round(212 + (226 - 212) * t);
      const b = Math.round(255 + (168 - 255) * t);
      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.lineWidth = this.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.save();
      ctx.shadowColor = `rgba(${r},${g},${b},0.45)`;
      ctx.shadowBlur = this.lineWidth * 1.6;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }

    // Completion pulse layered on top
    if (this.solved && this.completionPhase > 0) {
      const pulseAlpha = Math.sin(this.completionTime * 6) * 0.3 + 0.3;
      ctx.save();
      ctx.globalAlpha = pulseAlpha;
      ctx.strokeStyle = COLORS.pathWarm;
      ctx.lineWidth = this.lineWidth * 1.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = COLORS.starGlow;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(this.dotPixelPositions[0].x, this.dotPixelPositions[0].y);
      for (let i = 1; i < this.dotPixelPositions.length; i++) {
        ctx.lineTo(this.dotPixelPositions[i].x, this.dotPixelPositions[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  drawStars(board, trace) {
    const ctx = this.ctx;
    const startPulse = (trace.visited === 0 && !this.solved);

    for (let i = 0; i < board.dots.length; i++) {
      const dot = board.dots[i];
      const p = this.dotPixelPositions[i];
      const isVisited = i < trace.visited;
      const isStart = i === 0;
      const r = this.starRadius;

      let twinkle = 1;
      if (!isVisited && this.twinkleTimer > 3 && Math.random() < 0.01) {
        twinkle = 0.6 + Math.random() * 0.4;
      }

      // Pulsing ring on the starting dot before the player begins
      if (startPulse && isStart) {
        const pulse = 0.5 + 0.5 * Math.sin(this.time * 3);
        const ringR = r * (2.4 + pulse * 0.6);
        ctx.save();
        ctx.globalAlpha = 0.25 + pulse * 0.35;
        ctx.strokeStyle = COLORS.pathWarm;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Outer glow
      const glowR = r * 2.2;
      const glow = ctx.createRadialGradient(p.x, p.y, r * 0.3, p.x, p.y, glowR);
      glow.addColorStop(0, `rgba(255, 219, 142, ${0.5 * twinkle})`);
      glow.addColorStop(0.5, `rgba(255, 219, 142, ${0.15 * twinkle})`);
      glow.addColorStop(1, 'rgba(255, 219, 142, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Core
      const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      core.addColorStop(0, '#FFFFFF');
      core.addColorStop(0.4, COLORS.starCore);
      core.addColorStop(1, 'rgba(255, 244, 214, 0.4)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Number
      ctx.globalAlpha = isVisited ? 0.35 : 1.0;
      ctx.fillStyle = isVisited ? COLORS.signalSuccess : '#FFFFFF';
      ctx.font = `300 ${this.fontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dot.order.toString(), p.x, p.y + 1);
      ctx.globalAlpha = 1;
    }
  }

  setSolved(solved) {
    this.solved = solved;
    if (solved) {
      this.completionPhase = 1;
      this.completionTime = 0;
    }
  }
}

// ══════════════════════════════════
// TOUCH HANDLER — pure pointer relay
// ══════════════════════════════════
export class TouchHandler {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.active = false;
    this.enabled = true;
    this.onStart = null; // (pos) => boolean (true to begin tracking)
    this.onMove = null;  // (pos) => void
    this.onEnd = null;   // () => void

    canvas.addEventListener('mousedown', e => this.handleStart(e));
    canvas.addEventListener('mousemove', e => this.handleMove(e));
    canvas.addEventListener('mouseup', () => this.handleEnd());
    canvas.addEventListener('mouseleave', () => this.handleEnd());
    canvas.addEventListener('touchstart', e => { e.preventDefault(); this.handleStart(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); this.handleMove(e.touches[0]); }, { passive: false });
    canvas.addEventListener('touchend', e => { e.preventDefault(); this.handleEnd(); }, { passive: false });
    canvas.addEventListener('touchcancel', () => this.handleEnd());
  }

  handleStart(e) {
    if (!this.enabled) return;
    const pos = this.renderer.cursorToCanvas(e.clientX, e.clientY);
    if (this.onStart && this.onStart(pos)) {
      this.active = true;
    }
  }

  handleMove(e) {
    if (!this.active || !this.enabled) return;
    const pos = this.renderer.cursorToCanvas(e.clientX, e.clientY);
    if (this.onMove) this.onMove(pos);
  }

  handleEnd() {
    if (!this.active) return;
    this.active = false;
    if (this.onEnd) this.onEnd();
  }
}

// ══════════════════════════════════
// CONTROLLER
// ══════════════════════════════════
export class PuzzleController {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new PuzzleRenderer(canvas);
    this.touch = new TouchHandler(canvas, this.renderer);
    this.board = null;
    this.trace = new TraceModel();
    this.state = 'IDLE'; // IDLE | DRAWING | SOLVED
    this.levelData = null;
    this.onSolved = null;
    this.onStateChange = null;
    this.animFrame = null;
    this.lastTime = 0;

    this.touch.onStart = (pos) => this.handleStart(pos);
    this.touch.onMove = (pos) => this.handleMove(pos);
    this.touch.onEnd = () => this.handleEnd();
  }

  loadLevel(levelData) {
    this.levelData = levelData;
    this.board = new BoardModel(levelData);
    this.trace.reset();
    this.state = 'IDLE';
    this.renderer.solved = false;
    this.renderer.completionPhase = 0;
    this.touch.enabled = true;
    const container = this.canvas.parentElement;
    this.renderer.resize(container.clientWidth, container.clientHeight, this.board);
  }

  handleStart(pos) {
    if (this.state !== 'IDLE') return false;
    if (!this.board || this.renderer.dotPixelPositions.length === 0) return false;
    const first = this.renderer.dotPixelPositions[0];
    const d = Math.hypot(pos.x - first.x, pos.y - first.y);
    if (d > this.renderer.startGraceRadius) return false;
    this.trace.reset();
    this.trace.visited = 1;
    this.trace.cursor = { x: first.x, y: first.y };
    this.renderer.particles.burst(first.x, first.y, 8);
    this.setState('DRAWING');
    return true;
  }

  handleMove(pos) {
    if (this.state !== 'DRAWING') return;
    this.trace.cursor = pos;
    const nextIdx = this.trace.visited;
    if (nextIdx >= this.board.dots.length) return;
    const next = this.renderer.dotPixelPositions[nextIdx];
    const d = Math.hypot(pos.x - next.x, pos.y - next.y);
    if (d <= this.renderer.snapRadius) {
      this.trace.visited++;
      this.trace.cursor = { x: next.x, y: next.y };
      this.renderer.particles.burst(next.x, next.y, 14);
      if (this.trace.visited === this.board.dots.length) {
        this.setState('SOLVED');
        this.renderer.setSolved(true);
        this.touch.enabled = false;
        if (this.onSolved) {
          setTimeout(() => this.onSolved(this.levelData), 1200);
        }
      }
    }
  }

  handleEnd() {
    if (this.state === 'SOLVED') return;
    if (this.state !== 'DRAWING') return;
    setTimeout(() => {
      this.trace.reset();
      this.setState('IDLE');
    }, 250);
  }

  setState(state) {
    const prev = this.state;
    this.state = state;
    if (this.onStateChange) this.onStateChange(prev, state);
  }

  startRenderLoop() {
    this.lastTime = performance.now();
    const loop = (now) => {
      const dt = (now - this.lastTime) / 1000;
      this.lastTime = now;
      if (this.board) {
        if (this.renderer.solved) this.renderer.completionTime += dt;
        this.renderer.render(this.board, this.trace, dt);
      }
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  stopRenderLoop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  destroy() {
    this.stopRenderLoop();
  }
}
