// screens-journey-archive-almanac.jsx — Journey, Archive, Almanac

// ─── 7.9 Journey ─────────────────────────────────────────────
function JourneyNode({ state = 'unlocked', num }) {
  // states: locked | unlocked | solved | current
  if (state === 'locked') {
    return (
      <div style={{
        width: 48, height: 48, borderRadius: 24,
        background: CW.bg.hair,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: CW.ink.tertiary,
      }}>
        <IconLock size={16}/>
      </div>
    );
  }
  if (state === 'solved') {
    return (
      <div style={{
        width: 48, height: 48, borderRadius: 24,
        background: CW.bg.elev,
        border: `1.5px solid ${CW.path.warm}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: CW.path.warm,
      }}>
        <IconCheck size={16}/>
      </div>
    );
  }
  if (state === 'current') {
    return (
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div className="cw-pulse" style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,219,142,0.22), transparent 70%)`,
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: 24,
          border: `1.5px solid ${CW.star.glow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: CW.sans, fontSize: 14, fontWeight: 400,
          color: CW.ink.primary, fontVariantNumeric: 'tabular-nums',
        }}>{num}</div>
        <div style={{
          position: 'absolute', top: 54, left: 0, right: 0, textAlign: 'center',
          fontFamily: CW.sans, fontWeight: 500, fontSize: 10, letterSpacing: '1.6px',
          textTransform: 'uppercase', color: CW.star.glow,
        }}>Start</div>
      </div>
    );
  }
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 24,
      border: `1px solid ${CW.bg.hair}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: CW.sans, fontSize: 14, fontWeight: 400,
      color: CW.ink.primary, fontVariantNumeric: 'tabular-nums',
    }}>{num}</div>
  );
}

function ChapterSection({ num, name, states, threshold, locked = false, startNum = 1 }) {
  return (
    <div style={{ padding: '0 24px', marginBottom: 36 }}>
      <CWEyebrow style={{ marginBottom: 6, color: locked ? CW.ink.tertiary : CW.ink.tertiary }}>
        {`CHAPTER ${num} — ${name.toUpperCase()}`}
      </CWEyebrow>
      <div style={{
        fontFamily: CW.serif, fontWeight: 400, fontSize: 22,
        color: locked ? CW.ink.tertiary : CW.ink.primary, marginBottom: 12,
      }}>{name}</div>
      <div style={{ height: 1, background: CW.bg.hair, marginBottom: 20 }}/>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 48px)',
        gap: 12, marginBottom: 16,
        justifyContent: 'space-between',
      }}>
        {states.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center' }}>
            <JourneyNode state={s} num={startNum + i}/>
          </div>
        ))}
      </div>
      {threshold && (
        <div style={{
          fontFamily: CW.sans, fontSize: 11, letterSpacing: '1.6px',
          textTransform: 'uppercase',
          color: CW.ink.tertiary, marginTop: 18,
        }}>{threshold}</div>
      )}
    </div>
  );
}

function Journey() {
  // Chapter 2 current: mostly solved with one current node
  const ch2 = [
    'solved','solved','solved','solved',
    'solved','solved','current','unlocked',
    'unlocked','unlocked','unlocked','unlocked',
    'unlocked','unlocked','unlocked','unlocked',
    'unlocked','unlocked','unlocked','unlocked',
  ];
  const ch1 = Array(20).fill('solved');
  const lockedChapter = Array(20).fill('locked');

  return (
    <CWPhone bg={CW.bg.nav}>
      <CWStarfield density={24} seed={4} opacity={0.3}/>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ paddingBottom: 40, height: '100%', overflow: 'auto' }}>
          <CWTopBar title="Journey"/>
          <div style={{ marginTop: 8 }}>
            <ChapterSection num={1} name="Spring Sky" states={ch1} threshold="20 of 20 — complete" startNum={1}/>
            <ChapterSection num={2} name="Summer Sky" states={ch2} threshold="6 of 20 to unlock next chapter" startNum={1}/>
            <ChapterSection num={3} name="Autumn Sky" states={lockedChapter} locked threshold="Locked" startNum={1}/>
          </div>
        </div>
      </div>
    </CWPhone>
  );
}

// ─── 7.10 Archive ────────────────────────────────────────────
function ArchiveGlyph({ shape = 'lyra', alpha = 1 }) {
  const s = CONST_SHAPES[shape] || CONST_SHAPES.lyra;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: CW.bg.void, border: `1px solid ${CW.bg.hair}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <CWConstellation points={s.points} lines={s.lines} size={30} color={CW.star.glow} alpha={alpha}/>
    </div>
  );
}

function ArchiveRow({ date, name, status, glyph, locked = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      borderBottom: `1px solid ${CW.bg.hair}`,
    }}>
      <ArchiveGlyph shape={glyph} alpha={locked ? 0.3 : 1}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <CWEyebrow style={{ marginBottom: 2 }}>{date}</CWEyebrow>
        <div style={{
          fontFamily: CW.sans, fontWeight: 400, fontSize: 16,
          color: locked ? CW.ink.tertiary : CW.ink.primary,
        }}>{name}</div>
        <div style={{
          fontFamily: CW.sans, fontSize: 12, color: CW.ink.secondary,
          letterSpacing: '1.2px', textTransform: 'uppercase', marginTop: 2,
        }}>{status}</div>
      </div>
      {locked ? <IconLock size={18} color={CW.ink.tertiary}/> : <IconChevronRight size={18} color={CW.ink.tertiary}/>}
    </div>
  );
}

function Archive({ empty = false }) {
  const rows = [
    { date: 'APR 23', name: 'Cassiopeia', status: 'Solved', glyph: 'cassiopeia' },
    { date: 'APR 22', name: 'Draco', status: 'Solved', glyph: 'draco' },
    { date: 'APR 21', name: 'Cygnus', status: 'Solved', glyph: 'cygnus' },
    { date: 'APR 20', name: 'Orion', status: 'Not attempted', glyph: 'orion', locked: true },
    { date: 'APR 19', name: 'Ursa Minor', status: 'Solved', glyph: 'ursaMinor' },
    { date: 'APR 18', name: 'Lyra', status: 'Solved', glyph: 'lyra' },
    { date: 'APR 17', name: 'Cassiopeia', status: 'Not attempted', glyph: 'cassiopeia', locked: true },
  ];
  return (
    <CWPhone bg={CW.bg.nav}>
      <CWStarfield density={22} seed={6} opacity={0.3}/>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', overflow: 'auto', paddingBottom: 40 }}>
          <CWTopBar title="Past Nights"/>
          {empty ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '120px 40px',
            }}>
              <div style={{ marginBottom: 24, color: CW.ink.tertiary }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="2" fill={CW.ink.tertiary}/>
                  <circle cx="14" cy="18" r="1" fill={CW.ink.tertiary}/>
                  <circle cx="34" cy="16" r="1.5" fill={CW.ink.tertiary}/>
                  <circle cx="32" cy="34" r="1" fill={CW.ink.tertiary}/>
                  <circle cx="18" cy="36" r="1" fill={CW.ink.tertiary}/>
                </svg>
              </div>
              <div style={{
                fontFamily: CW.serif, fontSize: 22, fontWeight: 400,
                color: CW.ink.primary, textAlign: 'center', marginBottom: 10,
              }}>Your nights begin tonight</div>
              <div style={{
                fontFamily: CW.sans, fontSize: 14, color: CW.ink.secondary,
                textAlign: 'center', lineHeight: 1.5, textWrap: 'pretty', maxWidth: 260,
              }}>Come back after your first puzzle.</div>
            </div>
          ) : (
            <div style={{ margin: '8px 24px 0', background: CW.bg.elev, borderRadius: 16,
                          border: `1px solid ${CW.bg.hair}`, overflow: 'hidden' }}>
              {rows.map((r, i) => <ArchiveRow key={i} {...r} />)}
            </div>
          )}
        </div>
      </div>
    </CWPhone>
  );
}

// ─── 7.11 Almanac ────────────────────────────────────────────
function AlmanacTile({ shape, solved, date }) {
  const s = CONST_SHAPES[shape] || CONST_SHAPES.lyra;
  return (
    <div style={{
      aspectRatio: '1', borderRadius: 16,
      background: CW.bg.elev, border: `1px solid ${CW.bg.hair}`,
      padding: 8, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CWConstellation points={s.points} lines={s.lines} size={70}
          color={solved ? CW.star.glow : CW.ink.tertiary}
          alpha={solved ? 1 : 0.3}/>
      </div>
      <div style={{ padding: '0 4px' }}>
        {solved ? (
          <>
            <div style={{
              fontFamily: CW.sans, fontSize: 10, letterSpacing: '1.6px',
              textTransform: 'uppercase', color: CW.ink.primary,
              textAlign: 'center', marginBottom: 2,
            }}>{s.name}</div>
            <div style={{
              fontFamily: CW.sans, fontSize: 9, letterSpacing: '1.4px',
              color: CW.ink.tertiary, textAlign: 'center',
            }}>{date}</div>
          </>
        ) : (
          <div style={{ height: 20 }}/>
        )}
      </div>
    </div>
  );
}

function Almanac({ empty = false, popover = false }) {
  const tiles = empty ? [] : [
    { shape: 'lyra', solved: true, date: 'APR 18' },
    { shape: 'cassiopeia', solved: true, date: 'APR 23' },
    { shape: 'ursaMinor', solved: true, date: 'APR 19' },
    { shape: 'orion', solved: false },
    { shape: 'cygnus', solved: true, date: 'APR 21' },
    { shape: 'draco', solved: true, date: 'APR 22' },
    { shape: 'lyra', solved: false },
    { shape: 'cassiopeia', solved: false },
    { shape: 'orion', solved: false },
    { shape: 'ursaMinor', solved: false },
    { shape: 'cygnus', solved: false },
    { shape: 'draco', solved: false },
  ];
  return (
    <CWPhone bg={CW.bg.nav}>
      <CWStarfield density={20} seed={8} opacity={0.3}/>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', overflow: 'auto', paddingBottom: 40 }}>
          <CWTopBar title="Almanac"/>
          <div style={{ padding: '0 24px', marginBottom: 20 }}>
            <div style={{
              fontFamily: CW.sans, fontSize: 11, letterSpacing: '2px',
              textTransform: 'uppercase', color: CW.ink.tertiary, marginBottom: 8,
            }}>{empty ? '0 of 88 constellations' : '12 of 88 constellations'}</div>
            <div style={{ height: 2, background: CW.bg.hair, borderRadius: 1, overflow: 'hidden' }}>
              <div style={{
                width: empty ? '0%' : '13.6%', height: '100%',
                background: CW.star.glow, opacity: 0.8,
              }}/>
            </div>
          </div>
          {empty ? (
            <div style={{
              padding: '80px 40px', textAlign: 'center',
            }}>
              <div style={{ color: CW.ink.tertiary, marginBottom: 20 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
                  stroke={CW.ink.tertiary} strokeWidth="1" style={{ margin: '0 auto' }}>
                  <circle cx="12" cy="14" r="1.5"/>
                  <circle cx="30" cy="18" r="1.5"/>
                  <circle cx="22" cy="30" r="1.5"/>
                  <line x1="12" y1="14" x2="30" y2="18" opacity="0.5"/>
                  <line x1="30" y1="18" x2="22" y2="30" opacity="0.5"/>
                </svg>
              </div>
              <div style={{
                fontFamily: CW.serif, fontSize: 22, fontWeight: 400,
                color: CW.ink.primary, marginBottom: 8,
              }}>Your almanac fills</div>
              <div style={{
                fontFamily: CW.serif, fontSize: 22, fontWeight: 400,
                color: CW.ink.primary, marginBottom: 14,
              }}>one night at a time</div>
            </div>
          ) : (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
              padding: '0 24px',
            }}>
              {tiles.map((t, i) => <AlmanacTile key={i} {...t}/>)}
            </div>
          )}
        </div>
      </div>
      {popover && <AlmanacPopover/>}
    </CWPhone>
  );
}

function AlmanacPopover() {
  const s = CONST_SHAPES.lyra;
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,24,0.6)', zIndex: 10 }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 11,
        background: CW.bg.nav, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: '12px 24px 40px',
        borderTop: `1px solid ${CW.bg.hair}`,
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: CW.ink.tertiary,
          opacity: 0.5, margin: '0 auto 24px',
        }}/>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0 20px' }}>
          <CWConstellation points={s.points} lines={s.lines} size={120} color={CW.star.glow}/>
        </div>
        <div style={{
          fontFamily: CW.serif, fontWeight: 300, fontSize: 32,
          color: CW.ink.primary, textAlign: 'center', marginBottom: 12,
          letterSpacing: '0.6px',
        }}>{s.name}</div>
        <div style={{
          fontFamily: CW.sans, fontSize: 15, color: CW.ink.secondary,
          textAlign: 'center', lineHeight: 1.5, fontStyle: 'italic',
          marginBottom: 24, textWrap: 'pretty',
        }}>{s.lore}</div>
        <div style={{
          fontFamily: CW.sans, fontSize: 11, letterSpacing: '2px',
          textTransform: 'uppercase', color: CW.ink.tertiary,
          textAlign: 'center', marginBottom: 20,
        }}>Solved Apr 18 · Night 18</div>
        <CWGhost>Replay</CWGhost>
      </div>
    </>
  );
}

Object.assign(window, {
  Journey, Archive, Almanac, ArchiveGlyph, AlmanacTile, AlmanacPopover,
});
