// tokens.jsx — Constellation Weaver design tokens + shared primitives

const CW = {
  // Night palette
  bg: {
    void: '#050818',
    nav: '#0A1025',
    elev: '#121A33',
    hair: '#1C2547',
  },
  ink: {
    primary: '#F5F2E8',
    secondary: '#A8AFC4',
    tertiary: '#5C6580',
  },
  star: {
    core: '#FFF4D6',
    glow: '#FFDB8E',
  },
  path: {
    cool: '#B8D4FF',
    warm: '#F4E2A8',
  },
  accent: {
    gold: '#E8C77A',
  },
  signal: {
    success: '#8FE3B0',
    danger: '#E89C8F',
  },
  // Type families
  serif: '"Fraunces", "Cormorant Garamond", Georgia, serif',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
};

// Font loader — injects Google Fonts once
if (typeof document !== 'undefined' && !document.getElementById('cw-fonts')) {
  const link = document.createElement('link');
  link.id = 'cw-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@300;400;500&display=swap';
  document.head.appendChild(link);

  const s = document.createElement('style');
  s.textContent = `
    @keyframes cw-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.015); } }
    @keyframes cw-twinkle { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    @keyframes cw-drift { 0% { transform: translateY(0); } 100% { transform: translateY(-8px); } }
    @keyframes cw-draw { from { stroke-dashoffset: var(--len); } to { stroke-dashoffset: 0; } }
    @keyframes cw-rotate { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
    @keyframes cw-glow-ring { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
    .cw-pulse { animation: cw-pulse 1.6s ease-in-out infinite; }
    .cw-twinkle { animation: cw-twinkle 2.4s ease-in-out infinite; }
    .cw-glow-ring { animation: cw-glow-ring 3s ease-in-out infinite; }
    .cw-draw-path { stroke-dasharray: var(--len); animation: cw-draw 1.2s ease-out forwards; }
  `;
  document.head.appendChild(s);
}

// ─────────────────────────────────────────────────────────────
// Phone frame — minimal, not platform-specific iOS chrome.
// The spec calls for "top bar 44pt effective height" + safe area.
// 390 × 844 iPhone 14 Pro logical.
// ─────────────────────────────────────────────────────────────
function CWPhone({ children, label, width = 390, height = 844, bg = CW.bg.void, showStatus = true, time = '10:24' }) {
  return (
    <div style={{
      width, height,
      background: bg,
      borderRadius: 44,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 40px 80px rgba(5,8,24,0.6), 0 0 0 1px rgba(255,255,255,0.06), 0 0 0 9px #0b0d1a, 0 0 0 10px #1a1f2e',
      fontFamily: CW.sans,
      color: CW.ink.primary,
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Dynamic island */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, borderRadius: 22, background: '#000', zIndex: 80,
      }} />
      {/* Status bar */}
      {showStatus && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 54,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 28px 0', zIndex: 70, pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: CW.ink.primary, fontFeatureSettings: '"tnum"' }}>{time}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
            <svg width="18" height="11" viewBox="0 0 18 11">
              <rect x="0" y="7" width="3" height="4" rx="0.6" fill={CW.ink.primary}/>
              <rect x="4.5" y="4.8" width="3" height="6.2" rx="0.6" fill={CW.ink.primary}/>
              <rect x="9" y="2.4" width="3" height="8.6" rx="0.6" fill={CW.ink.primary}/>
              <rect x="13.5" y="0" width="3" height="11" rx="0.6" fill={CW.ink.primary}/>
            </svg>
            <svg width="16" height="11" viewBox="0 0 16 11">
              <path d="M8 3c2.2 0 4.2.9 5.6 2.3l1-1C13 2.7 10.6 1.5 8 1.5 5.4 1.5 3 2.7 1.4 4.3l1 1C3.8 3.9 5.8 3 8 3z" fill={CW.ink.primary}/>
              <path d="M8 6.4c1.3 0 2.5.5 3.4 1.4l1-1c-1.2-1.2-2.8-2-4.4-2-1.6 0-3.2.8-4.4 2l1 1C5.5 6.9 6.7 6.4 8 6.4z" fill={CW.ink.primary}/>
              <circle cx="8" cy="10" r="1.3" fill={CW.ink.primary}/>
            </svg>
            <svg width="25" height="11" viewBox="0 0 25 11">
              <rect x="0.5" y="0.5" width="21" height="10" rx="2.5" stroke={CW.ink.primary} strokeOpacity="0.4" fill="none"/>
              <rect x="2" y="2" width="18" height="7" rx="1.2" fill={CW.ink.primary}/>
              <path d="M22.5 4v3c.7-.2 1.2-.9 1.2-1.5s-.5-1.3-1.2-1.5z" fill={CW.ink.primary} fillOpacity="0.5"/>
            </svg>
          </div>
        </div>
      )}
      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {children}
      </div>
      {/* Home indicator */}
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 100,
        background: 'rgba(245,242,232,0.45)',
        zIndex: 80,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Star-field background — subtle parallax-ready dots
// ─────────────────────────────────────────────────────────────
function CWStarfield({ density = 40, seed = 1, opacity = 1 }) {
  // deterministic pseudo-random
  const rand = (i) => {
    const x = Math.sin((i + seed) * 9301.37) * 43758.5453;
    return x - Math.floor(x);
  };
  const stars = [];
  for (let i = 0; i < density; i++) {
    const x = rand(i * 2) * 100;
    const y = rand(i * 2 + 1) * 100;
    const r = rand(i * 2 + 17) * 0.9 + 0.3;
    const o = rand(i * 2 + 31) * 0.6 + 0.15;
    stars.push({ x, y, r, o });
  }
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity }} viewBox="0 0 100 100" preserveAspectRatio="none">
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.15} fill={CW.ink.primary} opacity={s.o} />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Top bar — 44pt effective, flush with background, no bottom border
// ─────────────────────────────────────────────────────────────
function CWTopBar({ title, onBack = true, rightIcon = null, offsetTop = 54 }) {
  return (
    <div style={{
      position: 'relative',
      height: 44, marginTop: offsetTop,
      display: 'flex', alignItems: 'center',
      padding: '0 16px',
    }}>
      {onBack && (
        <button style={{
          width: 44, height: 44, background: 'transparent', border: 'none',
          color: CW.ink.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0, marginLeft: -8,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      {title && (
        <div style={{
          fontFamily: CW.serif, fontWeight: 400, fontSize: 24, letterSpacing: 0,
          color: CW.ink.primary, marginLeft: onBack ? 4 : 8,
        }}>{title}</div>
      )}
      <div style={{ flex: 1 }} />
      {rightIcon && (
        <button style={{
          width: 44, height: 44, background: 'transparent', border: 'none',
          color: CW.ink.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', padding: 0, marginRight: -8,
        }}>{rightIcon}</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Buttons
// ─────────────────────────────────────────────────────────────
function CWPrimary({ children, full = true, style = {} }) {
  return (
    <div style={{
      height: 52, borderRadius: 12,
      background: CW.ink.primary, color: CW.bg.void,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: CW.sans, fontWeight: 500, fontSize: 15, letterSpacing: '0.4px',
      textTransform: 'uppercase',
      width: full ? '100%' : 'auto', padding: full ? 0 : '0 28px',
      cursor: 'pointer', userSelect: 'none',
      ...style,
    }}>{children}</div>
  );
}
function CWSecondary({ children, full = true, style = {} }) {
  return (
    <div style={{
      height: 52, borderRadius: 12,
      background: 'transparent', color: CW.ink.primary,
      border: `1px solid ${CW.bg.hair}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: CW.sans, fontWeight: 500, fontSize: 15, letterSpacing: '0.4px',
      textTransform: 'uppercase',
      width: full ? '100%' : 'auto', padding: full ? 0 : '0 28px',
      cursor: 'pointer', userSelect: 'none',
      ...style,
    }}>{children}</div>
  );
}
function CWGhost({ children, style = {} }) {
  return (
    <div style={{
      height: 36, background: 'transparent', color: CW.ink.secondary,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: CW.sans, fontWeight: 500, fontSize: 15, letterSpacing: '0.4px',
      textTransform: 'uppercase',
      cursor: 'pointer', userSelect: 'none',
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Eyebrow label — metadata style caps
// ─────────────────────────────────────────────────────────────
function CWEyebrow({ children, color = CW.ink.tertiary, style = {} }) {
  return (
    <div style={{
      fontFamily: CW.sans, fontWeight: 400, fontSize: 11, letterSpacing: '2px',
      textTransform: 'uppercase', color, ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// Card wrappers
// ─────────────────────────────────────────────────────────────
function CWHeroCard({ children, glow = false, style = {} }) {
  return (
    <div style={{
      borderRadius: 20,
      background: CW.bg.elev,
      border: `1px solid ${CW.bg.hair}`,
      padding: 24,
      position: 'relative',
      boxShadow: glow ? `inset 0 0 0 1px rgba(255,219,142,0.08), inset 0 0 32px rgba(255,219,142,0.04)` : 'none',
      ...style,
    }}>
      {children}
    </div>
  );
}
function CWListCard({ children, style = {} }) {
  return (
    <div style={{
      borderRadius: 16,
      background: CW.bg.elev,
      border: `1px solid ${CW.bg.hair}`,
      padding: 16,
      display: 'flex', alignItems: 'center', gap: 12,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Waypoint star + glow
// ─────────────────────────────────────────────────────────────
function CWStar({ x, y, r = 6, number, visited = false, bright = true }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {bright && (
        <>
          <circle r={r * 3.2} fill={CW.star.glow} opacity="0.08" />
          <circle r={r * 2.0} fill={CW.star.glow} opacity="0.18" />
        </>
      )}
      <circle r={r} fill={CW.star.core} />
      {number !== undefined && (
        <text
          x="0" y={r * 3.8}
          textAnchor="middle"
          style={{
            fontFamily: CW.sans, fontWeight: 300, fontSize: r * 2.4,
            fill: visited ? CW.ink.tertiary : CW.ink.primary,
            fontVariantNumeric: 'tabular-nums',
            opacity: visited ? 0.3 : 1,
          }}
        >{number}</text>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────
// Constellation silhouette (abstract stars + thin connecting line)
// ─────────────────────────────────────────────────────────────
function CWConstellation({ points, lines, size = 140, color = CW.star.glow, alpha = 1, glow = true, animate = false }) {
  // points: [{x,y}] normalized 0..1
  // lines: [[i,j], ...]
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
      {glow && (
        <defs>
          <filter id={`cw-glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>
      )}
      {lines && lines.map(([a, b], i) => (
        <line key={i}
          x1={points[a].x * 100} y1={points[a].y * 100}
          x2={points[b].x * 100} y2={points[b].y * 100}
          stroke={color} strokeWidth="0.6" strokeLinecap="round" opacity={alpha * 0.6}
        />
      ))}
      {points.map((p, i) => (
        <g key={i}>
          {glow && <circle cx={p.x * 100} cy={p.y * 100} r={2.6} fill={color} opacity={alpha * 0.25}/>}
          <circle cx={p.x * 100} cy={p.y * 100} r={1.3} fill={color} opacity={alpha}/>
        </g>
      ))}
    </svg>
  );
}

// Example constellation shapes (for examples, almanac, completion)
const CONST_SHAPES = {
  ursaMinor: {
    name: 'Ursa Minor',
    lore: 'The little bear, whose tail is the pole star.',
    points: [
      { x: 0.15, y: 0.20 }, { x: 0.30, y: 0.36 }, { x: 0.46, y: 0.34 },
      { x: 0.58, y: 0.52 }, { x: 0.72, y: 0.62 }, { x: 0.80, y: 0.78 }, { x: 0.90, y: 0.86 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  lyra: {
    name: 'Lyra',
    lore: 'The harp of Orpheus, still singing.',
    points: [
      { x: 0.48, y: 0.12 }, { x: 0.30, y: 0.42 }, { x: 0.66, y: 0.44 },
      { x: 0.40, y: 0.78 }, { x: 0.58, y: 0.80 },
    ],
    lines: [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]],
  },
  cassiopeia: {
    name: 'Cassiopeia',
    lore: 'The vain queen, bound to her throne among the stars.',
    points: [
      { x: 0.10, y: 0.62 }, { x: 0.30, y: 0.30 }, { x: 0.52, y: 0.54 },
      { x: 0.70, y: 0.26 }, { x: 0.90, y: 0.58 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  orion: {
    name: 'Orion',
    lore: 'The hunter, shoulders lit by Betelgeuse.',
    points: [
      { x: 0.20, y: 0.18 }, { x: 0.78, y: 0.12 }, { x: 0.30, y: 0.48 },
      { x: 0.50, y: 0.52 }, { x: 0.70, y: 0.50 }, { x: 0.22, y: 0.82 }, { x: 0.80, y: 0.82 },
    ],
    lines: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]],
  },
  cygnus: {
    name: 'Cygnus',
    lore: 'The swan flying down the Milky Way.',
    points: [
      { x: 0.50, y: 0.10 }, { x: 0.50, y: 0.38 }, { x: 0.20, y: 0.46 },
      { x: 0.80, y: 0.48 }, { x: 0.50, y: 0.82 },
    ],
    lines: [[0,1],[1,4],[2,1],[1,3]],
  },
  draco: {
    name: 'Draco',
    lore: 'The dragon curled between the bears.',
    points: [
      { x: 0.20, y: 0.20 }, { x: 0.32, y: 0.30 }, { x: 0.44, y: 0.24 },
      { x: 0.56, y: 0.38 }, { x: 0.68, y: 0.54 }, { x: 0.82, y: 0.68 }, { x: 0.86, y: 0.86 },
    ],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
};

Object.assign(window, {
  CW, CWPhone, CWStarfield, CWTopBar,
  CWPrimary, CWSecondary, CWGhost, CWEyebrow,
  CWHeroCard, CWListCard,
  CWStar, CWConstellation, CONST_SHAPES,
});
