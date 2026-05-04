// screens-home-puzzle.jsx — Home (3 states), Puzzle (3 states), Completion overlay

// ─── 7.6 Home ────────────────────────────────────────────────
function HomeStatusStrip({ streakLabel = '12 nights', phase = 4 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', marginTop: 8, height: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Moon phase as streak glyph — quieter than flame */}
        <svg width="18" height="18" viewBox="0 0 18 18">
          <defs>
            <clipPath id="cw-moon-clip">
              <circle cx="9" cy="9" r="7" />
            </clipPath>
          </defs>
          <circle cx="9" cy="9" r="7" fill="none" stroke={CW.ink.tertiary} strokeWidth="1" />
          <circle cx="9" cy="9" r="7" fill={CW.star.glow} clipPath="url(#cw-moon-clip)"
            style={{ transformOrigin: '9px 9px', transform: `scaleX(${Math.min(1, phase/7)})` }}
          />
        </svg>
        <div style={{
          fontFamily: CW.sans, fontSize: 14, fontWeight: 400,
          color: CW.ink.primary, letterSpacing: '0.5px',
        }}>{streakLabel}</div>
      </div>
      <button style={{
        width: 40, height: 40, background: 'transparent', border: 'none',
        color: CW.ink.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 0, cursor: 'pointer', marginRight: -8,
      }}>
        <IconGear size={20}/>
      </button>
    </div>
  );
}

function HeroCard({ state = 'with-streak' }) {
  // states: fresh | with-streak | daily-solved
  const isSolved = state === 'daily-solved';
  const isFresh = state === 'fresh';
  const eyebrow = isFresh ? "YOUR FIRST SKY · APR 24" : "TONIGHT'S SKY · APR 24";
  const name = 'Lyra';
  const subtitle = isSolved
    ? 'Solved tonight. See you tomorrow.'
    : 'The harp of Orpheus.';
  const cta = isFresh ? 'Begin your first night' : (isSolved ? 'Revisit' : 'Begin');

  return (
    <div style={{ padding: '0 24px' }} className={!isSolved && !isFresh ? 'cw-pulse' : ''}>
      <CWHeroCard glow={!isSolved}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <CWEyebrow>{eyebrow}</CWEyebrow>
          {isSolved && (
            <div style={{
              width: 24, height: 24, borderRadius: 12,
              border: `1px solid ${CW.path.warm}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: CW.path.warm,
            }}>
              <IconCheck size={14}/>
            </div>
          )}
        </div>
        {/* constellation preview */}
        <div style={{ height: 92, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '14px 0 6px' }}>
          <CWConstellation points={CONST_SHAPES.lyra.points} lines={CONST_SHAPES.lyra.lines}
            size={130} color={CW.path.warm} alpha={isSolved ? 0.5 : 0.95} />
        </div>
        <div style={{
          fontFamily: CW.serif, fontWeight: 400, fontSize: 34,
          letterSpacing: '0.2px', color: CW.ink.primary, lineHeight: 1.1,
          marginBottom: 6,
        }}>{name}</div>
        <div style={{
          fontFamily: CW.sans, fontWeight: 400, fontSize: 15,
          color: CW.ink.secondary, marginBottom: 20,
          fontStyle: isSolved ? 'normal' : 'italic',
          letterSpacing: '0.1px',
        }}>{subtitle}</div>
        <CWPrimary>{cta}</CWPrimary>
      </CWHeroCard>
    </div>
  );
}

function HomeListRow({ eyebrow, title, tiny }) {
  return (
    <div style={{ padding: '0 24px', marginBottom: 12 }}>
      <CWListCard>
        <div style={{ flex: 1, minWidth: 0 }}>
          <CWEyebrow style={{ marginBottom: 4 }}>{eyebrow}</CWEyebrow>
          <div style={{
            fontFamily: CW.sans, fontWeight: 400, fontSize: 16,
            color: CW.ink.primary, letterSpacing: '0.1px',
          }}>{title}</div>
          {tiny && (
            <div style={{
              fontFamily: CW.sans, fontWeight: 400, fontSize: 12,
              color: CW.ink.tertiary, marginTop: 2, letterSpacing: '1.2px', textTransform: 'uppercase',
            }}>{tiny}</div>
          )}
        </div>
        <div style={{ color: CW.ink.tertiary }}>
          <IconChevronRight size={20}/>
        </div>
      </CWListCard>
    </div>
  );
}

function Home({ state = 'with-streak' }) {
  const streak = state === 'fresh' ? 'Welcome' : '12 nights';
  return (
    <CWPhone bg={CW.bg.nav}>
      <CWStarfield density={28} seed={3} opacity={0.35} />
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column', gap: 16,
        paddingBottom: 34, overflow: 'hidden',
      }}>
        <HomeStatusStrip streakLabel={streak} phase={state === 'fresh' ? 0 : 5}/>
        <HeroCard state={state} />
        <div style={{ marginTop: 4 }}>
          <HomeListRow eyebrow="JOURNEY · CHAPTER 2" title="Summer Sky — Level 7 of 20" />
          <HomeListRow eyebrow="ARCHIVE" title="Past nights" tiny={state === 'fresh' ? 'Begins tonight' : '29 available'}/>
          <HomeListRow eyebrow="ALMANAC" title="12 of 88 constellations" />
        </div>
      </div>
    </CWPhone>
  );
}

// ─── 7.7 Puzzle + 7.8 Completion ─────────────────────────────
// 5x5 grid. Lyra puzzle: waypoints 1..4 placed on specific cells.
// Full-interactive version: drag across cells to build a path.

function Puzzle({ state = 'idle', daily = true, constellation = 'lyra', level = null, showCompletion = false, interactive = false }) {
  const shape = CONST_SHAPES[constellation];

  // Define puzzle grids (cell indices for the numbered waypoints + a valid hamiltonian path)
  const PUZZLES = {
    lyra: {
      rows: 5, cols: 5,
      // waypoints: { cellIndex: numericOrder } (1-based)
      waypoints: { 2: 1, 22: 2, 4: 3, 14: 4 }, // top-left area, bottom-mid, top-right, mid-right
      // full solution path (cell indices in order) — 25 cells, hamiltonian, starts at wp1, ends at wp4
      solution: [2,1,0,5,10,15,20,21,22,17,16,11,6,7,12,13,18,23,24,19,14,9,8,3,4],
      // Override to have the final cell be waypoint 4 (=14). Let me fix:
    },
  };

  // Simple hand-authored path for visual: start wp1 → ... → wp4(=14)
  // We'll just visualize a path through all cells with waypoints in order.
  const P = PUZZLES[constellation] || PUZZLES.lyra;
  const rows = P.rows, cols = P.cols;

  // Use a validated path for Lyra that visits waypoints in order 1→2→3→4 and covers all cells
  // wp1=2, wp2=22, wp3=4, wp4=14
  // Path: 2,1,0,5,10,15,20,21,22,17,16,11,6,7,12,13,18,23,24,19,14,... that's only 21 unique and repeats 14
  // Let's just use a path that hits wp1..wp4 in order and is hamiltonian:
  // 2,1,0,5,10,11,6,7,12,17,16,15,20,21,22,23,24,19,18,13,8,9,14,... only 23+
  // A cleaner design-level path:
  const solution = [2,3,4,9,8,7,6,1,0,5,10,11,12,13,14,19,18,17,16,15,20,21,22,23,24]
    .filter((v, i, a) => a.indexOf(v) === i);
  // This path: starts 2(wp1) ✓, hits 4(wp3) at index 2 — wrong order.
  // Let's redefine waypoints to align with a cleaner path:
  //   path: 2(wp1)→1→0→5→6→7→8→3→4→9→14(wp3)→13→12→11→10→15→16→17→18→19→24→23→22(wp4)→21→20
  //   Hmm 25 cells, order wp1,wp2=?
  // Simpler: set 4 waypoints along a known hamiltonian snake.
  // Use snake path starting top-left:
  // Row 0 L→R: 0,1,2,3,4; Row 1 R→L: 9,8,7,6,5; Row 2 L→R: 10,11,12,13,14;
  // Row 3 R→L: 19,18,17,16,15; Row 4 L→R: 20,21,22,23,24
  const snakePath = [0,1,2,3,4,9,8,7,6,5,10,11,12,13,14,19,18,17,16,15,20,21,22,23,24];
  // Place waypoints at indices 0, 7, 14, 24 of snake → cells 0, 7, 14, 24
  const WP = { 0: 1, 7: 2, 14: 3, 24: 4 };

  // State for interactive mode
  const [drawn, setDrawn] = (interactive ? React.useState([snakePath[0]]) : [null, () => {}]);
  const [dragging, setDragging] = (interactive ? React.useState(false) : [false, () => {}]);

  // Geometry
  const pad = 32;
  const inner = 326;
  const cellSize = inner / cols;
  const gridY = 240;
  const cellCenter = (i) => ({
    x: pad + (i % cols) * cellSize + cellSize / 2,
    y: gridY + Math.floor(i / cols) * cellSize + cellSize / 2,
  });

  // Decide which cells are in the drawn path for each state
  let pathCells;
  if (state === 'idle') pathCells = [];
  else if (state === 'drawing') pathCells = snakePath.slice(0, 13); // partway
  else pathCells = snakePath; // solved

  if (interactive && drawn) pathCells = drawn;

  // Mouse handlers for interactive
  const containerRef = React.useRef(null);
  const getCellFromEvent = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    const cx = Math.floor((x - pad) / cellSize);
    const ry = Math.floor((y - gridY) / cellSize);
    if (cx < 0 || cx >= cols || ry < 0 || ry >= rows) return null;
    return ry * cols + cx;
  };
  const onDown = (e) => {
    if (!interactive) return;
    const c = getCellFromEvent(e);
    if (c === snakePath[0]) { setDrawn([c]); setDragging(true); }
  };
  const onMove = (e) => {
    if (!interactive || !dragging) return;
    const c = getCellFromEvent(e);
    if (c === null) return;
    setDrawn(prev => {
      if (prev.includes(c)) return prev; // no revisits
      const last = prev[prev.length - 1];
      // adjacency check
      const lr = Math.floor(last / cols), lc = last % cols;
      const nr = Math.floor(c / cols), nc = c % cols;
      if (Math.abs(lr - nr) + Math.abs(lc - nc) !== 1) return prev;
      return [...prev, c];
    });
  };
  const onUp = () => { if (interactive) setDragging(false); };

  // Build path segments
  const pathD = pathCells.length > 1
    ? 'M ' + pathCells.map(i => { const p = cellCenter(i); return `${p.x} ${p.y}`; }).join(' L ')
    : '';
  const visitedSet = new Set(pathCells);

  return (
    <CWPhone>
      <CWStarfield density={40} seed={9} opacity={0.5} />
      {/* top bar */}
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, height: 44,
        display: 'flex', alignItems: 'center', padding: '0 8px', zIndex: 2,
      }}>
        <button style={{
          width: 44, height: 44, background: 'transparent', border: 'none',
          color: CW.ink.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}><IconBack size={22}/></button>
        <div style={{ flex: 1 }}/>
        <button style={{
          width: 44, height: 44, background: 'transparent', border: 'none',
          color: CW.ink.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}><IconHint size={22}/></button>
      </div>
      {/* metadata line */}
      <div style={{
        position: 'absolute', top: 108, left: 0, right: 0,
        textAlign: 'center', zIndex: 2,
      }}>
        <div style={{
          fontFamily: CW.sans, fontWeight: 400, fontSize: 13, letterSpacing: '2.4px',
          textTransform: 'uppercase', color: CW.ink.tertiary,
        }}>{daily ? shape.name : (level || 'Journey 2 · Level 7')}</div>
      </div>
      {/* grid */}
      <div
        ref={containerRef}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          touchAction: interactive ? 'none' : 'auto',
          cursor: interactive ? 'crosshair' : 'default',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 390 844" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="cw-path-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={CW.path.cool} />
              <stop offset="100%" stopColor={CW.path.warm} />
            </linearGradient>
            <filter id="cw-path-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>

          {/* faint cell boundaries */}
          {Array.from({ length: rows * cols }).map((_, i) => {
            const r = Math.floor(i / cols), c = i % cols;
            return (
              <rect key={i}
                x={pad + c * cellSize} y={gridY + r * cellSize}
                width={cellSize} height={cellSize}
                fill="transparent"
                stroke={CW.bg.hair} strokeWidth="0.5" opacity="0.5"
              />
            );
          })}

          {/* drawn path glow */}
          {pathD && (
            <>
              <path d={pathD} stroke="url(#cw-path-grad)" strokeWidth="14" strokeLinecap="round"
                strokeLinejoin="round" fill="none" opacity="0.25" filter="url(#cw-path-glow)"/>
              <path d={pathD} stroke="url(#cw-path-grad)" strokeWidth="5" strokeLinecap="round"
                strokeLinejoin="round" fill="none"/>
            </>
          )}

          {/* head particle */}
          {(state === 'drawing' || (interactive && pathCells.length > 1 && pathCells.length < snakePath.length)) && pathCells.length > 0 && (
            <>
              <circle cx={cellCenter(pathCells[pathCells.length-1]).x} cy={cellCenter(pathCells[pathCells.length-1]).y}
                r="12" fill={CW.path.warm} opacity="0.3"/>
              <circle cx={cellCenter(pathCells[pathCells.length-1]).x} cy={cellCenter(pathCells[pathCells.length-1]).y}
                r="5" fill={CW.path.warm}/>
            </>
          )}

          {/* waypoints */}
          {Object.entries(WP).map(([cellIdx, num]) => {
            const p = cellCenter(+cellIdx);
            const visited = visitedSet.has(+cellIdx);
            return (
              <g key={cellIdx}>
                <circle cx={p.x} cy={p.y} r="18" fill={CW.star.glow} opacity="0.1"/>
                <circle cx={p.x} cy={p.y} r="11" fill={CW.star.glow} opacity="0.22"/>
                <circle cx={p.x} cy={p.y} r="6" fill={CW.star.core}/>
                <text x={p.x} y={p.y - 18} textAnchor="middle"
                  style={{
                    fontFamily: CW.sans, fontWeight: 300, fontSize: 16,
                    fill: visited ? CW.ink.primary : CW.ink.primary,
                    opacity: visited ? 0.3 : 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}>{num}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* completion overlay */}
      {(state === 'solved' || showCompletion) && (
        <CompletionContent shape={shape} daily={daily} level={level} />
      )}
    </CWPhone>
  );
}

// 7.8 Completion overlay (used standalone and as puzzle 'solved' state)
function CompletionContent({ shape = CONST_SHAPES.lyra, daily = true, level = null }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'rgba(5,8,24,0.78)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 32px',
    }}>
      <div style={{
        marginBottom: 32,
        animation: 'cw-rotate 8s ease-in-out infinite alternate',
      }}>
        <CWConstellation points={shape.points} lines={shape.lines}
          size={180} color={CW.path.warm} alpha={0.95} />
      </div>
      <div style={{
        fontFamily: CW.serif, fontWeight: 300, fontSize: 38,
        letterSpacing: '1px', color: CW.ink.primary,
        marginBottom: 20, textAlign: 'center', lineHeight: 1.1,
      }}>{shape.name}</div>
      <div style={{
        fontFamily: CW.sans, fontWeight: 400, fontSize: 16,
        color: CW.ink.secondary, textAlign: 'center',
        maxWidth: 280, lineHeight: 1.5, fontStyle: 'italic',
        textWrap: 'pretty',
      }}>{shape.lore}</div>
      <div style={{
        marginTop: 40,
        fontFamily: CW.sans, fontWeight: 400, fontSize: 12, letterSpacing: '2.4px',
        textTransform: 'uppercase', color: CW.ink.tertiary,
      }}>{daily ? 'APR 24 · TONIGHT\'S SKY' : (level || 'JOURNEY 2 · 7')}</div>
      <div style={{
        position: 'absolute', bottom: 72, left: 0, right: 0, textAlign: 'center',
        fontFamily: CW.sans, fontWeight: 400, fontSize: 12, letterSpacing: '2px',
        textTransform: 'uppercase', color: CW.ink.tertiary,
      }}>Tap anywhere to continue</div>
    </div>
  );
}

function Completion() {
  // Same as puzzle solved state but standalone
  return <Puzzle state="solved" />;
}

Object.assign(window, {
  Home, Puzzle, Completion, CompletionContent, HeroCard, HomeStatusStrip,
});
