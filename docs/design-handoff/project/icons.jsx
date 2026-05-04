// icons.jsx — line icons, 1.5 stroke, rounded caps/joins, 24x24

const CWIcon = ({ children, size = 24, color = 'currentColor', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={style}>
    {children}
  </svg>
);

const IconBack = (p) => <CWIcon {...p}><path d="M15 6l-6 6 6 6"/></CWIcon>;
const IconClose = (p) => <CWIcon {...p}><path d="M6 6l12 12M18 6l-12 12"/></CWIcon>;
const IconGear = (p) => <CWIcon {...p}>
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/>
</CWIcon>;
const IconInfo = (p) => <CWIcon {...p}>
  <circle cx="12" cy="12" r="9"/>
  <path d="M12 16v-4M12 8h.01"/>
</CWIcon>;
const IconHint = (p) => <CWIcon {...p}>
  <path d="M9 18h6M10 21h4"/>
  <path d="M12 3a6 6 0 00-4 10.5c.8.8 1.5 1.7 1.5 2.5h5c0-.8.7-1.7 1.5-2.5A6 6 0 0012 3z"/>
</CWIcon>;
const IconPlay = (p) => <CWIcon {...p}><path d="M8 5l11 7-11 7V5z"/></CWIcon>;
const IconLock = (p) => <CWIcon {...p}>
  <rect x="5" y="11" width="14" height="10" rx="2"/>
  <path d="M8 11V7a4 4 0 018 0v4"/>
</CWIcon>;
const IconLockOpen = (p) => <CWIcon {...p}>
  <rect x="5" y="11" width="14" height="10" rx="2"/>
  <path d="M8 11V7a4 4 0 017.9-1"/>
</CWIcon>;
const IconCheck = (p) => <CWIcon {...p}><path d="M4 12l5 5L20 6"/></CWIcon>;
const IconShare = (p) => <CWIcon {...p}>
  <path d="M12 3v13M7 8l5-5 5 5"/>
  <path d="M5 15v4a2 2 0 002 2h10a2 2 0 002-2v-4"/>
</CWIcon>;
const IconChevronRight = (p) => <CWIcon {...p}><path d="M9 6l6 6-6 6"/></CWIcon>;
const IconBell = (p) => <CWIcon {...p}>
  <path d="M18 16a2 2 0 00-1-1.7V10a5 5 0 00-10 0v4.3A2 2 0 006 16h12z"/>
  <path d="M10 19a2 2 0 004 0"/>
</CWIcon>;
const IconGlobe = (p) => <CWIcon {...p}>
  <circle cx="12" cy="12" r="9"/>
  <path d="M3 12h18M12 3a13 13 0 010 18M12 3a13 13 0 000 18"/>
</CWIcon>;
const IconExternal = (p) => <CWIcon {...p}>
  <path d="M14 4h6v6M20 4l-9 9"/>
  <path d="M18 13v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h5"/>
</CWIcon>;
// Filled star — the ONE exception to no-filled rule, for Almanac solved state
const IconStarFilled = ({ size = 24, color = 'currentColor', style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <path d="M12 3l2.6 6 6.4.6-4.9 4.4 1.5 6.4-5.6-3.4-5.6 3.4 1.5-6.4L2 9.6l6.4-.6z" fill={color}/>
  </svg>
);
// Small flame-ish flicker for streak (kept as an option)
const IconFlame = (p) => <CWIcon {...p}>
  <path d="M12 3c1 3 4 4 4 8a4 4 0 11-8 0c0-2 1-3 2-4 0 2 1 3 2 2 0-2-2-4 0-6z"/>
</CWIcon>;
// Moon phase for streak alt
const IconMoon = (p) => <CWIcon {...p}>
  <path d="M20 14A8 8 0 1110 4a6 6 0 0010 10z"/>
</CWIcon>;

Object.assign(window, {
  CWIcon,
  IconBack, IconClose, IconGear, IconInfo, IconHint, IconPlay,
  IconLock, IconLockOpen, IconCheck, IconShare, IconChevronRight,
  IconBell, IconGlobe, IconExternal, IconStarFilled,
  IconFlame, IconMoon,
});
