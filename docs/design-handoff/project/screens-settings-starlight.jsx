// screens-settings-starlight.jsx — Settings, Starlight IAP, modal sheets, About

// ─── 7.12 Settings ───────────────────────────────────────────
function SettingsRow({ label, detail, control, chevron = false, extLink = false, onLast = false, primary = false, ghost = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '14px 16px',
      borderBottom: onLast ? 'none' : `1px solid ${CW.bg.hair}`,
      minHeight: 52,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: CW.sans, fontWeight: 400, fontSize: 15,
          color: primary ? CW.accent.gold : (ghost ? CW.ink.secondary : CW.ink.primary),
        }}>{label}</div>
        {detail && (
          <div style={{
            fontFamily: CW.sans, fontSize: 12, color: CW.ink.tertiary,
            marginTop: 2,
          }}>{detail}</div>
        )}
      </div>
      {control}
      {chevron && <IconChevronRight size={18} color={CW.ink.tertiary} style={{ marginLeft: 8 }}/>}
      {extLink && <IconExternal size={16} color={CW.ink.tertiary} style={{ marginLeft: 8 }}/>}
    </div>
  );
}

function SettingsGroup({ header, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        padding: '0 24px', marginBottom: 10,
        fontFamily: CW.sans, fontSize: 11, letterSpacing: '2px',
        textTransform: 'uppercase', color: CW.ink.tertiary,
      }}>{header}</div>
      <div style={{
        margin: '0 24px', background: CW.bg.elev,
        border: `1px solid ${CW.bg.hair}`, borderRadius: 16, overflow: 'hidden',
      }}>{children}</div>
    </div>
  );
}

function Toggle({ on = true }) {
  return (
    <div style={{
      width: 44, height: 26, borderRadius: 13,
      background: on ? CW.path.warm : CW.bg.hair,
      position: 'relative', transition: 'background 240ms ease-out',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 22, height: 22, borderRadius: 11,
        background: on ? CW.bg.void : CW.ink.secondary,
        transition: 'left 240ms ease-out',
      }}/>
    </div>
  );
}

function Slider({ value = 0.6 }) {
  return (
    <div style={{ width: 120, display: 'flex', alignItems: 'center' }}>
      <div style={{ flex: 1, height: 2, background: CW.bg.hair, position: 'relative', borderRadius: 1 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${value*100}%`, background: CW.ink.secondary, borderRadius: 1 }}/>
        <div style={{
          position: 'absolute', top: '50%', left: `${value*100}%`, transform: 'translate(-50%, -50%)',
          width: 14, height: 14, borderRadius: 7, background: CW.ink.primary,
        }}/>
      </div>
    </div>
  );
}

function Settings() {
  return (
    <CWPhone bg={CW.bg.nav}>
      <CWStarfield density={18} seed={5} opacity={0.25}/>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', overflow: 'auto', paddingBottom: 40 }}>
          <CWTopBar title="Settings"/>
          <div style={{ marginTop: 12 }}>
            <SettingsGroup header="Display">
              <SettingsRow label="Hemisphere" control={<span style={{ fontFamily: CW.sans, fontSize: 15, color: CW.ink.secondary }}>Northern</span>} chevron onLast/>
            </SettingsGroup>
            <SettingsGroup header="Sound & Feel">
              <SettingsRow label="Music volume" control={<Slider value={0.4}/>}/>
              <SettingsRow label="Effects volume" control={<Slider value={0.7}/>}/>
              <SettingsRow label="Haptics" control={<Toggle on/>} onLast/>
            </SettingsGroup>
            <SettingsGroup header="Nightly Reminder">
              <SettingsRow label="Evening notification" detail="8:00 PM local" control={<Toggle on/>} onLast/>
            </SettingsGroup>
            <SettingsGroup header="Starlight Edition">
              <SettingsRow label="Unlock Starlight — $3.99" primary chevron/>
              <SettingsRow label="Restore purchases" ghost onLast/>
            </SettingsGroup>
            <SettingsGroup header="About">
              <SettingsRow label="Credits" chevron/>
              <SettingsRow label="Privacy Policy" extLink/>
              <SettingsRow label="Terms of Service" extLink/>
              <SettingsRow label="Version" control={<span style={{ fontFamily: CW.sans, fontSize: 13, color: CW.ink.tertiary, letterSpacing: '0.5px' }}>1.0.0 (build 1)</span>} onLast/>
            </SettingsGroup>
          </div>
        </div>
      </div>
    </CWPhone>
  );
}

// ─── 7.13 Starlight ──────────────────────────────────────────
function Starlight({ purchased = false }) {
  return (
    <CWPhone bg={CW.bg.nav}>
      <CWStarfield density={30} seed={13} opacity={0.5}/>
      {/* close button top-right */}
      <div style={{ position: 'absolute', top: 54, right: 16, zIndex: 5 }}>
        <button style={{
          width: 44, height: 44, background: 'transparent', border: 'none',
          color: CW.ink.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}><IconClose size={22}/></button>
      </div>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '100px 40px 60px', textAlign: 'center',
      }}>
        <div style={{ position: 'relative', marginBottom: 36 }}>
          <div className="cw-glow-ring" style={{
            position: 'absolute', inset: -20, borderRadius: '50%',
            border: `1px solid ${CW.accent.gold}`,
            opacity: 0.4,
          }}/>
          <div style={{
            position: 'absolute', inset: -30, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(232,199,122,0.15), transparent 70%)`,
          }}/>
          <UrsaGlyph size={100} color={CW.accent.gold}/>
        </div>
        <div style={{
          fontFamily: CW.serif, fontWeight: 300, fontSize: 36,
          color: CW.ink.primary, marginBottom: 10, letterSpacing: '0.4px',
        }}>Starlight Edition</div>
        <div style={{
          fontFamily: CW.sans, fontSize: 15, color: CW.ink.secondary,
          marginBottom: 36, fontStyle: 'italic', textWrap: 'pretty', maxWidth: 260,
        }}>Support the maker of a quiet game.</div>
        <div style={{ width: '100%', maxWidth: 280, marginBottom: 36 }}>
          {[
            'Remove all ads',
            'Unlock the infinite archive',
            'Subtle gold accents throughout',
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ color: CW.accent.gold, flexShrink: 0 }}>
                <IconCheck size={18}/>
              </div>
              <div style={{
                fontFamily: CW.sans, fontSize: 15, color: CW.ink.primary,
                textAlign: 'left',
              }}>{f}</div>
            </div>
          ))}
        </div>
        {purchased ? (
          <div style={{
            padding: '14px 28px', borderRadius: 100,
            border: `1px solid ${CW.accent.gold}`,
            color: CW.accent.gold, fontFamily: CW.sans, fontWeight: 500,
            fontSize: 13, letterSpacing: '2px', textTransform: 'uppercase',
          }}>Starlight unlocked ✦</div>
        ) : (
          <div style={{ width: '100%', maxWidth: 300 }}>
            <CWPrimary style={{ background: CW.accent.gold }}>Unlock — $3.99</CWPrimary>
            <CWGhost style={{ marginTop: 16 }}>Restore purchases</CWGhost>
          </div>
        )}
      </div>
    </CWPhone>
  );
}

// ─── 7.14 Hemisphere picker ──────────────────────────────────
function HemisphereIcon({ north = true }) {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <circle cx="26" cy="26" r="22" stroke={CW.ink.secondary} strokeWidth="1" opacity="0.5"/>
      <path d={north ? "M4 26a22 22 0 0144 0" : "M4 26a22 22 0 0044 0"}
        fill={CW.star.glow} opacity="0.22"/>
      <line x1="4" y1="26" x2="48" y2="26" stroke={CW.ink.secondary} strokeWidth="0.8" opacity="0.5"/>
      <path d="M26 4v44" stroke={CW.ink.secondary} strokeWidth="0.8" opacity="0.3"/>
      <path d="M10 12q16 8 32 0" stroke={CW.ink.secondary} strokeWidth="0.5" fill="none" opacity="0.3"/>
      <path d="M10 40q16 -8 32 0" stroke={CW.ink.secondary} strokeWidth="0.5" fill="none" opacity="0.3"/>
    </svg>
  );
}

function ModalSheet({ children, height = '60%' }) {
  return (
    <CWPhone bg={CW.bg.void}>
      <CWStarfield density={20} seed={14} opacity={0.3}/>
      {/* blurred home behind */}
      <div style={{
        position: 'absolute', top: 100, left: 24, right: 24, opacity: 0.35,
      }}>
        <HeroCard state="with-streak"/>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,24,0.72)' }}/>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        maxHeight: '75%', minHeight: 240,
        background: CW.bg.nav,
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        border: `1px solid ${CW.bg.hair}`, borderBottom: 'none',
        padding: '12px 24px 44px',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2, background: CW.ink.tertiary,
          opacity: 0.5, margin: '0 auto 20px',
        }}/>
        {children}
      </div>
    </CWPhone>
  );
}

function HemispherePicker() {
  return (
    <ModalSheet>
      <div style={{
        fontFamily: CW.serif, fontWeight: 400, fontSize: 24,
        color: CW.ink.primary, textAlign: 'center', marginBottom: 12,
      }}>Where are you watching from?</div>
      <div style={{
        fontFamily: CW.sans, fontSize: 14, color: CW.ink.secondary,
        textAlign: 'center', lineHeight: 1.5, marginBottom: 32,
        textWrap: 'pretty', maxWidth: 280, margin: '0 auto 32px',
      }}>This changes the seasonal rhythm of your daily sky.</div>
      <div style={{ display: 'flex', gap: 14 }}>
        <div style={{
          flex: 1, padding: '28px 16px', borderRadius: 16,
          background: CW.bg.elev, border: `1.5px solid ${CW.star.glow}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          boxShadow: 'inset 0 0 24px rgba(255,219,142,0.08)',
        }}>
          <HemisphereIcon north/>
          <div style={{
            fontFamily: CW.sans, fontSize: 13, fontWeight: 500,
            letterSpacing: '1.8px', textTransform: 'uppercase', color: CW.ink.primary, textAlign: 'center',
          }}>Northern<br/>Hemisphere</div>
        </div>
        <div style={{
          flex: 1, padding: '28px 16px', borderRadius: 16,
          background: CW.bg.elev, border: `1px solid ${CW.bg.hair}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <HemisphereIcon north={false}/>
          <div style={{
            fontFamily: CW.sans, fontSize: 13, fontWeight: 500,
            letterSpacing: '1.8px', textTransform: 'uppercase', color: CW.ink.secondary, textAlign: 'center',
          }}>Southern<br/>Hemisphere</div>
        </div>
      </div>
    </ModalSheet>
  );
}

// ─── 7.15 Hint confirm ───────────────────────────────────────
function HintConfirm({ unavailable = false }) {
  return (
    <ModalSheet>
      <div style={{
        display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 20,
        color: unavailable ? CW.ink.tertiary : CW.star.glow,
      }}>
        <IconHint size={32}/>
      </div>
      <div style={{
        fontFamily: CW.serif, fontWeight: 400, fontSize: 24,
        color: CW.ink.primary, textAlign: 'center', marginBottom: 12,
      }}>{unavailable ? 'No ad available' : 'Need a hint?'}</div>
      <div style={{
        fontFamily: CW.sans, fontSize: 14, color: CW.ink.secondary,
        textAlign: 'center', lineHeight: 1.5, marginBottom: 32,
        textWrap: 'pretty', maxWidth: 280, margin: '0 auto 32px',
      }}>{unavailable
        ? 'Try again shortly.'
        : 'Watch a short ad to reveal the next two steps.'}</div>
      {!unavailable && <CWPrimary>Watch Ad</CWPrimary>}
      <div style={{ marginTop: 12 }}>
        <CWGhost>{unavailable ? 'OK' : 'Not now'}</CWGhost>
      </div>
    </ModalSheet>
  );
}

// ─── 7.16 Notification opt-in ────────────────────────────────
function NotificationOptIn() {
  return (
    <ModalSheet>
      <div style={{
        display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 20,
        color: CW.star.glow,
      }}>
        <IconBell size={32}/>
      </div>
      <div style={{
        fontFamily: CW.serif, fontWeight: 400, fontSize: 24,
        color: CW.ink.primary, textAlign: 'center', marginBottom: 12,
      }}>A quiet reminder</div>
      <div style={{
        fontFamily: CW.sans, fontSize: 14, color: CW.ink.secondary,
        textAlign: 'center', lineHeight: 1.5, marginBottom: 32,
        textWrap: 'pretty', maxWidth: 280, margin: '0 auto 32px',
      }}>We'll send one note at 8 PM so you don't miss tonight's sky. Nothing else, ever.</div>
      <CWPrimary>Allow</CWPrimary>
      <div style={{ marginTop: 12 }}>
        <CWGhost>Maybe later</CWGhost>
      </div>
    </ModalSheet>
  );
}

// ─── 7.17 About / Credits ────────────────────────────────────
function About() {
  const sections = [
    { title: 'Design & Code', body: 'Ilya Marin' },
    { title: 'Music', body: 'Nils Hoffmann — "Cold Rooms" (CC BY 4.0)' },
    { title: 'Sound', body: 'Contributors at freesound.org' },
    { title: 'Typefaces', body: 'Fraunces by Undercase Type\nInter by Rasmus Andersson' },
    { title: 'Lore', body: 'Public-domain sources — Bulfinch\'s Mythology, Allen\'s Star Names' },
  ];
  return (
    <CWPhone bg={CW.bg.nav}>
      <CWStarfield density={18} seed={2} opacity={0.25}/>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ height: '100%', overflow: 'auto', paddingBottom: 60 }}>
          <CWTopBar title="Credits"/>
          <div style={{ padding: '20px 32px 0', maxWidth: 340, margin: '0 auto' }}>
            {sections.map((s, i) => (
              <div key={i} style={{ marginBottom: 32 }}>
                <div style={{
                  fontFamily: CW.sans, fontSize: 11, letterSpacing: '2px',
                  textTransform: 'uppercase', color: CW.ink.tertiary, marginBottom: 10,
                  textAlign: 'center',
                }}>{s.title}</div>
                <div style={{
                  fontFamily: CW.serif, fontSize: 17, fontWeight: 400,
                  color: CW.ink.primary, textAlign: 'center', lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                }}>{s.body}</div>
              </div>
            ))}
            <div style={{
              marginTop: 48, fontFamily: CW.sans, fontSize: 13,
              color: CW.ink.tertiary, textAlign: 'center', fontStyle: 'italic',
              lineHeight: 1.6,
            }}>Thank you for looking up.</div>
          </div>
        </div>
      </div>
    </CWPhone>
  );
}

Object.assign(window, {
  Settings, Starlight, HemispherePicker, HintConfirm, NotificationOptIn, About,
});
