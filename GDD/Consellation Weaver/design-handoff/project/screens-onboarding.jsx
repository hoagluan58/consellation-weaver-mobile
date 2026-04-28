// screens-onboarding.jsx — Splash + 4 onboarding screens

// Ursa Minor 7-star glyph (shared across splash, icon references, IAP)
function UrsaGlyph({ size = 64, color = CW.path.warm, stroke = 1.2 }) {
  const pts = CONST_SHAPES.ursaMinor.points;
  const ls = CONST_SHAPES.ursaMinor.lines;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {ls.map(([a, b], i) => (
        <line key={i}
          x1={pts[a].x * 100} y1={pts[a].y * 100}
          x2={pts[b].x * 100} y2={pts[b].y * 100}
          stroke={color} strokeWidth={stroke} strokeLinecap="round" opacity={0.6}
        />
      ))}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x * 100} cy={p.y * 100} r={4} fill={CW.star.glow} opacity={0.18}/>
          <circle cx={p.x * 100} cy={p.y * 100} r={2} fill={CW.star.core}/>
        </g>
      ))}
    </svg>
  );
}

// Wordmark: fraunces 300, lowercase, letter-spacing +20 (≈ 0.08em at 28pt)
function CWWordmark({ size = 28, color = CW.ink.primary }) {
  return (
    <div style={{
      fontFamily: CW.serif, fontWeight: 300,
      fontSize: size, letterSpacing: '0.08em',
      color, fontStyle: 'normal',
    }}>constellation weaver</div>
  );
}

// ─── 7.1 Splash ──────────────────────────────────────────────
function Splash() {
  return (
    <CWPhone>
      <CWStarfield density={35} seed={7} opacity={0.6} />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 40,
      }}>
        <div style={{ animation: 'cw-twinkle 3s ease-in-out infinite' }}>
          <UrsaGlyph size={72} />
        </div>
        <CWWordmark size={26} />
      </div>
    </CWPhone>
  );
}

// Status dots row
function StatusDots({ active, total = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: 4,
          background: i === active ? CW.ink.primary : CW.ink.tertiary,
          opacity: i === active ? 1 : 0.4,
        }} />
      ))}
    </div>
  );
}

// Mini grid illustration for onboarding 1-3
function MiniGridDemo({ showNumbers = false, pathPct = 1, emphasizeCells = false }) {
  // 3x3 with stars at positions 0, 4, 8 (diagonal corners + center)
  // Path: 0 → 1 → 2 → 5 → 4 → 3 → 6 → 7 → 8 (covers all 9 cells)
  const cells = Array.from({ length: 9 }).map((_, i) => ({
    row: Math.floor(i / 3), col: i % 3, i,
  }));
  const starAt = { 0: 1, 4: 2, 8: 3 };
  const gridSize = 220;
  const cell = gridSize / 3;
  const pad = 20;
  const W = gridSize + pad * 2;

  // Path order through cells
  const pathOrder = [0, 1, 2, 5, 4, 3, 6, 7, 8];
  const toXY = (i) => {
    const r = Math.floor(i / 3), c = i % 3;
    return { x: pad + c * cell + cell / 2, y: pad + r * cell + cell / 2 };
  };
  const totalLen = pathOrder.length - 1;
  const visibleLen = pathPct * totalLen;
  const segs = [];
  for (let s = 0; s < pathOrder.length - 1; s++) {
    const a = toXY(pathOrder[s]);
    const b = toXY(pathOrder[s + 1]);
    if (s + 1 <= visibleLen) {
      segs.push({ a, b, full: true });
    } else if (s < visibleLen) {
      const t = visibleLen - s;
      segs.push({ a, b: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, full: false });
    }
  }
  const visitedStars = new Set();
  pathOrder.slice(0, Math.floor(visibleLen) + 1).forEach(i => { if (starAt[i]) visitedStars.add(i); });
  const headXY = segs.length ? segs[segs.length - 1].b : toXY(pathOrder[0]);

  return (
    <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="cw-onb-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={CW.path.cool} />
          <stop offset="100%" stopColor={CW.path.warm} />
        </linearGradient>
      </defs>
      {/* grid cells */}
      {cells.map(c => (
        <rect key={c.i}
          x={pad + c.col * cell} y={pad + c.row * cell}
          width={cell - 0} height={cell - 0}
          fill="transparent"
          stroke={CW.bg.hair}
          strokeWidth="0.75"
          opacity={emphasizeCells ? 0.9 : 0.5}
        />
      ))}
      {/* drawn path */}
      {segs.map((s, i) => (
        <line key={i}
          x1={s.a.x} y1={s.a.y} x2={s.b.x} y2={s.b.y}
          stroke="url(#cw-onb-grad)" strokeWidth="4" strokeLinecap="round" opacity="0.9"
        />
      ))}
      {/* head glow */}
      {pathPct < 1 && pathPct > 0 && (
        <>
          <circle cx={headXY.x} cy={headXY.y} r="10" fill={CW.path.warm} opacity="0.25"/>
          <circle cx={headXY.x} cy={headXY.y} r="4" fill={CW.path.warm}/>
        </>
      )}
      {/* stars */}
      {Object.entries(starAt).map(([i, n]) => {
        const p = toXY(+i);
        const visited = visitedStars.has(+i);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="14" fill={CW.star.glow} opacity="0.1"/>
            <circle cx={p.x} cy={p.y} r="8" fill={CW.star.glow} opacity="0.25"/>
            <circle cx={p.x} cy={p.y} r="5" fill={CW.star.core}/>
            {showNumbers && (
              <text x={p.x + 13} y={p.y - 10}
                style={{
                  fontFamily: CW.sans, fontWeight: 300, fontSize: 13,
                  fill: visited ? CW.path.warm : CW.ink.primary,
                  fontVariantNumeric: 'tabular-nums',
                }}>{n}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Onboarding layout shell
function OnboardingFrame({ index, illustration, headline, body, ctaLabel = 'Continue', showSkip = true, children }) {
  return (
    <CWPhone>
      <CWStarfield density={24} seed={index + 2} opacity={0.4} />
      {/* status dots + skip */}
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px 24px 0', height: 44,
      }}>
        <StatusDots active={index} total={4} />
        {showSkip && (
          <div style={{
            position: 'absolute', right: 20, top: 14,
            fontFamily: CW.sans, fontWeight: 500, fontSize: 13,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            color: CW.ink.secondary, padding: '8px 12px',
          }}>Skip</div>
        )}
      </div>
      <div style={{
        position: 'absolute', top: 120, left: 0, right: 0, bottom: 110,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 32px',
      }}>
        <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
          {illustration}
        </div>
        <div style={{ flex: '0 0 auto', textAlign: 'center', marginTop: 8 }}>
          {headline && (
            <div style={{
              fontFamily: CW.serif, fontWeight: 400, fontSize: 28,
              color: CW.ink.primary, lineHeight: 1.2, marginBottom: 12,
            }}>{headline}</div>
          )}
          {body && (
            <div style={{
              fontFamily: CW.sans, fontWeight: 400, fontSize: 15,
              color: CW.ink.secondary, lineHeight: 1.5,
              textWrap: 'pretty', maxWidth: 300, margin: '0 auto',
            }}>{body}</div>
          )}
        </div>
      </div>
      {children}
      {ctaLabel && (
        <div style={{ position: 'absolute', bottom: 48, left: 24, right: 24 }}>
          <CWPrimary>{ctaLabel}</CWPrimary>
        </div>
      )}
    </CWPhone>
  );
}

// ─── 7.2 Onboarding 1/4 — Trace ──────────────────────────────
function Onboarding1() {
  return (
    <OnboardingFrame
      index={0}
      illustration={<MiniGridDemo pathPct={0.55} />}
      headline="Trace the stars"
      body="Drag from the first star to the last. Your line must touch every cell."
    />
  );
}

// ─── 7.3 Onboarding 2/4 — In order ───────────────────────────
function Onboarding2() {
  return (
    <OnboardingFrame
      index={1}
      illustration={<MiniGridDemo showNumbers pathPct={0.7} />}
      headline="Stars in order"
      body="Visit star 1 first, then 2, then 3. The order is part of the puzzle."
    />
  );
}

// ─── 7.4 Onboarding 3/4 — Every cell ─────────────────────────
function Onboarding3() {
  return (
    <OnboardingFrame
      index={2}
      illustration={<MiniGridDemo showNumbers pathPct={1} emphasizeCells />}
      headline="Every cell, once"
      body="Cover the whole sky. No cell left empty, no cell visited twice."
    />
  );
}

// ─── 7.5 Onboarding 4/4 — Your first puzzle ──────────────────
function Onboarding4() {
  // Functional-looking 3x3 puzzle, idle state. Chrome is status dots + prompt.
  return (
    <CWPhone>
      <CWStarfield density={24} seed={11} opacity={0.4} />
      <div style={{
        position: 'absolute', top: 70, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <StatusDots active={3} total={4} />
      </div>
      <div style={{
        position: 'absolute', top: 120, left: 0, right: 0,
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: CW.sans, fontWeight: 400, fontSize: 13, letterSpacing: '2px',
          textTransform: 'uppercase', color: CW.ink.tertiary,
        }}>Start at 1 — cover every cell — end at 3</div>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <MiniGridDemo showNumbers pathPct={0} />
      </div>
    </CWPhone>
  );
}

Object.assign(window, {
  Splash, Onboarding1, Onboarding2, Onboarding3, Onboarding4,
  UrsaGlyph, CWWordmark, StatusDots, MiniGridDemo,
});
