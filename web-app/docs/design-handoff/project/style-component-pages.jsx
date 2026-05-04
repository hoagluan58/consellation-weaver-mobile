// style-component-pages.jsx — Style page + Component library page

// Swatch
function Swatch({ token, hex, use }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: hex,
        border: `1px solid ${CW.bg.hair}`,
        flexShrink: 0,
      }}/>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: CW.sans, fontSize: 13, fontWeight: 500,
          color: CW.ink.primary, letterSpacing: '0.5px',
        }}>{token}</div>
        <div style={{
          fontFamily: CW.sans, fontSize: 11, fontVariantNumeric: 'tabular-nums',
          color: CW.ink.tertiary, marginTop: 2,
        }}>{hex}</div>
      </div>
      <div style={{
        fontFamily: CW.sans, fontSize: 11, color: CW.ink.secondary,
        letterSpacing: '1.4px', textTransform: 'uppercase', textAlign: 'right', maxWidth: 120,
      }}>{use}</div>
    </div>
  );
}

function StylePage() {
  return (
    <div style={{
      width: 1120, padding: '56px 64px',
      background: CW.bg.nav, color: CW.ink.primary,
      fontFamily: CW.sans,
      borderRadius: 20, border: `1px solid ${CW.bg.hair}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <CWStarfield density={30} seed={100} opacity={0.2}/>
      <div style={{ position: 'relative' }}>
        <CWEyebrow style={{ marginBottom: 8 }}>STYLE · V1</CWEyebrow>
        <div style={{
          fontFamily: CW.serif, fontWeight: 300, fontSize: 44, letterSpacing: '1px',
          color: CW.ink.primary, marginBottom: 48,
        }}>Foundations</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          {/* Colors */}
          <div>
            <div style={{ fontFamily: CW.serif, fontSize: 22, marginBottom: 20 }}>Night palette</div>
            <div>
              <Swatch token="bg.void" hex="#050818" use="Puzzle bg"/>
              <Swatch token="bg.nav" hex="#0A1025" use="Home, menus"/>
              <Swatch token="bg.elev" hex="#121A33" use="Cards"/>
              <Swatch token="bg.hair" hex="#1C2547" use="Hairlines"/>
              <Swatch token="ink.primary" hex="#F5F2E8" use="Primary text"/>
              <Swatch token="ink.secondary" hex="#A8AFC4" use="Secondary"/>
              <Swatch token="ink.tertiary" hex="#5C6580" use="Hints, disabled"/>
              <Swatch token="star.core" hex="#FFF4D6" use="Star core"/>
              <Swatch token="star.glow" hex="#FFDB8E" use="Star glow"/>
              <Swatch token="path.cool" hex="#B8D4FF" use="Path start"/>
              <Swatch token="path.warm" hex="#F4E2A8" use="Path head"/>
              <Swatch token="accent.gold" hex="#E8C77A" use="Starlight"/>
              <Swatch token="signal.success" hex="#8FE3B0" use="Completion"/>
            </div>

            <div style={{ fontFamily: CW.serif, fontSize: 22, marginTop: 36, marginBottom: 16 }}>Seasonal gradients</div>
            {[
              ['Spring', '#B8D4FF', '#9FE0C7'],
              ['Summer', '#B8D4FF', '#F4E2A8'],
              ['Autumn', '#D4B0FF', '#F4A87A'],
              ['Winter', '#B8D4FF', '#E8EEFF'],
            ].map(([name, a, b]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0' }}>
                <div style={{
                  width: 120, height: 14, borderRadius: 7,
                  background: `linear-gradient(90deg, ${a}, ${b})`,
                }}/>
                <div style={{ flex: 1, fontFamily: CW.sans, fontSize: 13 }}>{name}</div>
                <div style={{ fontFamily: CW.sans, fontSize: 11, color: CW.ink.tertiary, fontVariantNumeric: 'tabular-nums' }}>{a} → {b}</div>
              </div>
            ))}
          </div>

          {/* Typography */}
          <div>
            <div style={{ fontFamily: CW.serif, fontSize: 22, marginBottom: 20 }}>Type ramp</div>
            {[
              { label: 'Display / Constellation name', font: CW.serif, weight: 300, size: 34, spacing: '0.5px', sample: 'Cassiopeia' },
              { label: 'Screen title', font: CW.serif, weight: 400, size: 24, spacing: 0, sample: 'Past Nights' },
              { label: 'Body', font: CW.sans, weight: 400, size: 16, spacing: 0, sample: 'The vain queen, bound to her throne.' },
              { label: 'Metadata', font: CW.sans, weight: 400, size: 13, spacing: '1.6px', sample: 'TONIGHT · APR 24', upper: true },
              { label: 'Microcopy / button', font: CW.sans, weight: 500, size: 15, spacing: '2px', sample: 'BEGIN', upper: true },
              { label: 'Waypoint numerals', font: CW.sans, weight: 300, size: 18, spacing: 0, sample: '1  2  3  4', tab: true },
              { label: 'Streak number', font: CW.serif, weight: 400, size: 48, spacing: 0, sample: '12' },
            ].map((t, i) => (
              <div key={i} style={{ marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${CW.bg.hair}` }}>
                <div style={{
                  fontFamily: CW.sans, fontSize: 11, color: CW.ink.tertiary,
                  letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 8,
                }}>{t.label} · {t.size}pt</div>
                <div style={{
                  fontFamily: t.font, fontWeight: t.weight, fontSize: t.size,
                  letterSpacing: t.spacing, color: CW.ink.primary,
                  textTransform: t.upper ? 'uppercase' : 'none',
                  fontVariantNumeric: t.tab ? 'tabular-nums' : 'normal',
                  lineHeight: 1.2,
                }}>{t.sample}</div>
              </div>
            ))}

            <div style={{ fontFamily: CW.serif, fontSize: 22, marginTop: 20, marginBottom: 16 }}>Spacing (4pt)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              {[4, 8, 12, 16, 20, 24, 32, 48, 64].map(s => (
                <div key={s} style={{ textAlign: 'center' }}>
                  <div style={{ width: s, height: s, background: CW.star.glow, opacity: 0.5, borderRadius: 2, marginBottom: 6 }}/>
                  <div style={{ fontFamily: CW.sans, fontSize: 10, color: CW.ink.tertiary, fontVariantNumeric: 'tabular-nums' }}>{s}</div>
                </div>
              ))}
            </div>

            <div style={{ fontFamily: CW.serif, fontSize: 22, marginTop: 32, marginBottom: 16 }}>Iconography · 1.5pt line</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, color: CW.ink.secondary }}>
              {[
                ['back', <IconBack/>], ['close', <IconClose/>], ['gear', <IconGear/>],
                ['info', <IconInfo/>], ['hint', <IconHint/>], ['play', <IconPlay/>],
                ['lock', <IconLock/>], ['unlock', <IconLockOpen/>], ['check', <IconCheck/>],
                ['share', <IconShare/>], ['chev', <IconChevronRight/>], ['bell', <IconBell/>],
                ['globe', <IconGlobe/>], ['ext', <IconExternal/>], ['star', <IconStarFilled/>],
                ['moon', <IconMoon/>],
              ].map(([n, el], i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: 10, border: `1px solid ${CW.bg.hair}`, borderRadius: 10,
                  background: CW.bg.elev,
                }}>
                  {el}
                  <div style={{ fontFamily: CW.sans, fontSize: 10, color: CW.ink.tertiary, letterSpacing: '1px', textTransform: 'uppercase' }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComponentPage() {
  return (
    <div style={{
      width: 1120, padding: '56px 64px',
      background: CW.bg.nav, color: CW.ink.primary,
      fontFamily: CW.sans,
      borderRadius: 20, border: `1px solid ${CW.bg.hair}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <CWStarfield density={30} seed={101} opacity={0.2}/>
      <div style={{ position: 'relative' }}>
        <CWEyebrow style={{ marginBottom: 8 }}>COMPONENTS · V1</CWEyebrow>
        <div style={{
          fontFamily: CW.serif, fontWeight: 300, fontSize: 44, letterSpacing: '1px',
          color: CW.ink.primary, marginBottom: 48,
        }}>Library</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
          <div>
            <div style={{ fontFamily: CW.serif, fontSize: 22, marginBottom: 20 }}>Buttons</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 340 }}>
              <CWPrimary>Begin</CWPrimary>
              <CWSecondary>Revisit</CWSecondary>
              <CWGhost>Not now</CWGhost>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ width: 44, height: 44, borderRadius: 22, border: `1px solid ${CW.bg.hair}`, background: 'transparent', color: CW.ink.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconBack size={22}/></button>
                <button style={{ width: 44, height: 44, borderRadius: 22, border: `1px solid ${CW.bg.hair}`, background: 'transparent', color: CW.ink.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconHint size={22}/></button>
                <button style={{ width: 44, height: 44, borderRadius: 22, border: `1px solid ${CW.bg.hair}`, background: 'transparent', color: CW.ink.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconGear size={22}/></button>
                <button style={{ width: 44, height: 44, borderRadius: 22, border: `1px solid ${CW.bg.hair}`, background: 'transparent', color: CW.ink.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><IconClose size={22}/></button>
              </div>
            </div>

            <div style={{ fontFamily: CW.serif, fontSize: 22, marginTop: 36, marginBottom: 20 }}>Cards</div>
            <div style={{ maxWidth: 340, marginBottom: 16 }}>
              <CWHeroCard glow>
                <CWEyebrow>TONIGHT'S SKY · APR 24</CWEyebrow>
                <div style={{ fontFamily: CW.serif, fontSize: 30, color: CW.ink.primary, margin: '8px 0 4px' }}>Lyra</div>
                <div style={{ fontFamily: CW.sans, fontSize: 14, color: CW.ink.secondary, fontStyle: 'italic', marginBottom: 16 }}>The harp of Orpheus.</div>
                <CWPrimary>Begin</CWPrimary>
              </CWHeroCard>
            </div>
            <div style={{ maxWidth: 340, marginBottom: 12 }}>
              <CWListCard>
                <div style={{ flex: 1 }}>
                  <CWEyebrow>ARCHIVE</CWEyebrow>
                  <div style={{ fontFamily: CW.sans, fontSize: 16, color: CW.ink.primary, marginTop: 2 }}>Past nights</div>
                </div>
                <IconChevronRight size={18} color={CW.ink.tertiary}/>
              </CWListCard>
            </div>

            <div style={{ fontFamily: CW.serif, fontSize: 22, marginTop: 36, marginBottom: 20 }}>Toggles & sliders</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <Toggle on/><Toggle on={false}/><Slider value={0.6}/>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: CW.serif, fontSize: 22, marginBottom: 20 }}>Top bar</div>
            <div style={{ background: CW.bg.void, borderRadius: 16, border: `1px solid ${CW.bg.hair}`, overflow: 'hidden', marginBottom: 32 }}>
              <CWTopBar title="Almanac" offsetTop={16}/>
              <div style={{ height: 40 }}/>
            </div>

            <div style={{ fontFamily: CW.serif, fontSize: 22, marginBottom: 20 }}>Toast</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, padding: 32, background: CW.bg.void, borderRadius: 16 }}>
              <div style={{
                background: CW.bg.elev, border: `1px solid ${CW.bg.hair}`,
                borderRadius: 12, padding: '12px 16px',
                fontFamily: CW.sans, fontSize: 14, color: CW.ink.primary,
              }}>Seven nights. A quiet habit.</div>
            </div>

            <div style={{ fontFamily: CW.serif, fontSize: 22, marginBottom: 20 }}>Bottom sheet</div>
            <div style={{
              background: CW.bg.void, borderRadius: 16, border: `1px solid ${CW.bg.hair}`,
              overflow: 'hidden', padding: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              minHeight: 240,
            }}>
              <div style={{
                width: '100%', background: CW.bg.nav, borderRadius: 20,
                border: `1px solid ${CW.bg.hair}`, padding: '12px 20px 24px',
              }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: CW.ink.tertiary, opacity: 0.5, margin: '0 auto 16px' }}/>
                <div style={{ fontFamily: CW.serif, fontSize: 18, textAlign: 'center', marginBottom: 8 }}>A quiet reminder</div>
                <div style={{ fontFamily: CW.sans, fontSize: 13, color: CW.ink.secondary, textAlign: 'center' }}>One note at 8 PM.</div>
              </div>
            </div>

            <div style={{ fontFamily: CW.serif, fontSize: 22, marginTop: 36, marginBottom: 20 }}>Waypoints & path</div>
            <div style={{ background: CW.bg.void, borderRadius: 16, padding: 32, display: 'flex', justifyContent: 'center' }}>
              <svg width="260" height="140" viewBox="0 0 260 140">
                <defs>
                  <linearGradient id="cw-demo-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={CW.path.cool}/>
                    <stop offset="100%" stopColor={CW.path.warm}/>
                  </linearGradient>
                </defs>
                <path d="M 30 70 L 90 40 L 150 90 L 210 50" stroke="url(#cw-demo-grad)" strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.2"/>
                <path d="M 30 70 L 90 40 L 150 90 L 210 50" stroke="url(#cw-demo-grad)" strokeWidth="4" strokeLinecap="round" fill="none"/>
                {[[30,70,1],[90,40,2],[150,90,3],[210,50,4]].map(([x,y,n],i)=>(
                  <g key={i}>
                    <circle cx={x} cy={y} r="14" fill={CW.star.glow} opacity="0.15"/>
                    <circle cx={x} cy={y} r="8" fill={CW.star.glow} opacity="0.3"/>
                    <circle cx={x} cy={y} r="4.5" fill={CW.star.core}/>
                    <text x={x} y={y-16} textAnchor="middle" style={{ fontFamily: CW.sans, fontWeight: 300, fontSize: 13, fill: CW.ink.primary, fontVariantNumeric: 'tabular-nums' }}>{n}</text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StylePage, ComponentPage });
