# Constellation Weaver — Design Brief for Claude Design

> **Purpose of this document:** A self-contained visual design brief. A designer (human or AI) should be able to produce the full screen set from this document alone without reading any other file.

---

## 1. Product at a glance

**Constellation Weaver** is a minimalist single-player mobile puzzle game. The player draws a single continuous glowing line on a grid of stars, visiting numbered stars in order and covering every cell. Each puzzle reveals a real constellation with its mythological name.

- **Platforms:** iOS (primary), Android
- **Orientation:** Portrait only
- **Target device anchor:** iPhone 14 Pro (390 × 844 pt logical, 1179 × 2556 px at @3x)
- **Audience:** 25–45, design-literate casual puzzler, premium puzzle-app buyer
- **Emotional target:** calm, nocturnal, contemplative, a nightly ritual
- **Comparable apps by feel:** Monument Valley, Mini Metro, Apple Weather (night), Alto's Odyssey
- **Comparable apps to AVOID:** Candy Crush, Royal Match, hyper-casual puzzle (too loud, too chromatic)

---

## 2. Design Principles

Each principle is paired with its visual translation. Every screen decision must serve at least one.

| Principle | Visual translation |
|---|---|
| **One stroke, one breath** | No modals mid-puzzle. No failure states. Removing is more important than adding. |
| **Cheap to build, expensive to feel** | Flat shapes, vector, minimal illustration. All "production value" comes from glow, gradient, motion, haptics. |
| **A ritual, not a grind** | No badges, no percentage bars, no tier icons. Subtle pulsing CTA on the nightly puzzle. No loud numerics. |
| **Recognizable beauty** | Constellation imagery is the only "illustration" the app needs. Typography does emotional heavy lifting. |

---

## 3. Brand Identity

### 3.1 Name & wordmark

- **App name:** Constellation Weaver
- **Shortform:** Weaver (used in tight spaces, e.g., watch)
- **Wordmark:** Set in **Fraunces**, weight 300, letter-spacing +20. Lowercase. The lowercase "w" has a subtle custom ligature: the two center strokes form a small star shape (five-point, ≤8 pt tall).
- **Alt short wordmark:** just "☆" + "weaver" on one line.

### 3.2 App icon

- 1024 × 1024
- Background: radial gradient from deep navy `#0A1025` (center) to near-black `#050818` (edge)
- Foreground: seven stars arranged in the Ursa Minor (Little Dipper) silhouette, connected by a thin glowing line, line in `#F4E2A8` at 60% opacity, stars with soft outer glow
- No wordmark on icon
- Corners: standard iOS superellipse mask

### 3.3 Color palette

#### Night palette (default, 99% of the app)

| Token | Hex | Use |
|---|---|---|
| `bg.void` | `#050818` | Deepest background, puzzle screen |
| `bg.nav` | `#0A1025` | Home, menu backgrounds |
| `bg.elev` | `#121A33` | Cards, elevated surfaces |
| `bg.hair` | `#1C2547` | 1pt hairline borders on cards |
| `ink.primary` | `#F5F2E8` | Primary text (warm white, not pure) |
| `ink.secondary` | `#A8AFC4` | Secondary text, metadata |
| `ink.tertiary` | `#5C6580` | Hints, disabled, placeholder |
| `star.core` | `#FFF4D6` | Bright core of a star/waypoint |
| `star.glow` | `#FFDB8E` | Outer glow of star, used at 40% alpha |
| `path.cool` | `#B8D4FF` | Start of drawn path gradient |
| `path.warm` | `#F4E2A8` | End/head of drawn path gradient |
| `accent.gold` | `#E8C77A` | Starlight IAP accent only |
| `signal.success` | `#8FE3B0` | Completion flash only (used extremely sparingly) |
| `signal.danger` | `#E89C8F` | Never used in v1. Reserved. |

No pure black. No pure white. Every neutral has a tint.

#### Seasonal palette variants (for campaign chapters)

Same structure, different `path.*` gradients:

- **Spring:** `#B8D4FF` → `#9FE0C7` (mint warm-end)
- **Summer:** `#B8D4FF` → `#F4E2A8` (gold, default)
- **Autumn:** `#D4B0FF` → `#F4A87A` (amber)
- **Winter:** `#B8D4FF` → `#E8EEFF` (pale blue)

### 3.4 Typography

| Role | Font | Weight | Size | Letter-spacing |
|---|---|---|---|---|
| Display (constellation names) | Fraunces | 300 | 34 pt | +10 |
| Screen title | Fraunces | 400 | 24 pt | 0 |
| Body | Inter | 400 | 16 pt | 0 |
| Metadata | Inter | 400 | 13 pt | +20 |
| Microcopy / button | Inter | 500 | 15 pt | +40 (uppercase small) |
| Waypoint numerals | Inter | 300, tabular | 18 pt | 0 |
| Streak number | Fraunces | 400 | 48 pt | 0 |

**Load only these two fonts.** Fraunces for warmth/serif, Inter for UI clarity.

### 3.5 Iconography

- Line icons only. No filled.
- Stroke weight 1.5 pt on @1x.
- Rounded caps, rounded joins.
- 24 × 24 pt default. 20 × 20 pt for inline, 28 × 28 pt for bottom nav (if used).
- Icon set needed:
  - back arrow
  - close (X)
  - settings gear
  - info (i in circle)
  - lightbulb (hint)
  - play (small triangle)
  - lock (small padlock, closed + open variants)
  - check (for IAP feature list)
  - share (system share glyph)
  - star (filled, for solved indicator in Almanac only — the ONE exception to no-filled rule)
  - chevron right (list affordance)
  - bell (notifications)
  - hemisphere globe (N/S)

### 3.6 Elevation / surfaces

- No drop shadows. Elevation is expressed via:
  - Color-shift: deeper surface = darker
  - 1 pt hairline borders in `bg.hair`
  - Optional very subtle inner glow on focused/active cards (1 px inset, `star.glow` at 8% alpha)
- Corner radius: 16 pt for cards, 12 pt for buttons, 20 pt for the daily-puzzle hero card.

### 3.7 Spacing scale (4 pt grid)

`4, 8, 12, 16, 20, 24, 32, 48, 64`

Screen horizontal padding: **24 pt** default. Cards nest with **16 pt** internal padding.

---

## 4. Motion Principles

- Every transition uses **ease-out** (never linear, never ease-in as the dominant).
- Default duration: **240 ms**.
- Long transitions (screen-to-screen): **320 ms**.
- Microinteractions (button press): **120 ms**.
- Completion animations: **800–1200 ms** with multi-stage easing.
- **Fades, not pops.** No bouncy spring scaling except on the daily-card pulse.
- Idle ambient motion should be continuous:
  - Star-field parallax: 40 fps drift, ~2 px / second
  - Daily-card pulse: 1.6 s sine, scale 1.00 → 1.015 → 1.00, inner-glow sync
  - Waypoint numerals: rare subtle twinkle (one random waypoint per ~3 s in puzzle screen)

Haptics parallel the visual events, never standalone:
- Star-hit: `impactLight`
- Completion: `notificationSuccess`
- Button press: `selectionChanged`

---

## 5. Component Library

Components to design once and reuse.

### 5.1 Buttons

- **Primary:** filled, `ink.primary` background, `bg.void` text, height 52 pt, radius 12 pt, full-width variant + auto variant.
- **Secondary:** 1 pt border in `bg.hair`, `ink.primary` text, transparent background.
- **Ghost:** text only, `ink.secondary`, no background, no border.
- **Icon button:** 44 × 44 pt tap target, 24 × 24 pt glyph centered.

All buttons have pressed state (scale 0.97, duration 120 ms).

### 5.2 Cards

- **Hero card** (daily puzzle): full-width minus 24 pt padding, 20 pt radius, inner padding 24 pt, 1 pt hairline border, subtle inner glow. Contains stacked: eyebrow label ("Tonight's Sky"), date, constellation name, play CTA.
- **List card:** full-width, 16 pt radius, 16 pt inner padding, single-line or two-line variants.
- **Collection tile:** square, 16 pt radius, used in Almanac grid (3 columns with 12 pt gutter).

### 5.3 Top bar

- 44 pt effective height above the safe area
- Left: back arrow OR screen title (never both)
- Right: at most one icon button
- No bottom border, no divider — top bar is flush with the screen background

### 5.4 Status strip (top of home)

- Shows: current streak ("12 nights"), with small flame-like flicker on the number only
- Right-aligned settings gear
- Spacing: sits 8 pt below safe area inset

### 5.5 Empty state

- Centered icon (48 × 48 pt, thin line)
- Title in screen-title style
- Body in secondary ink
- Optional single primary button

### 5.6 Toast

- Bottom-anchored, 16 pt from bottom safe area
- `bg.elev` background, hairline border, 12 pt radius, 12 / 16 pt padding
- Auto-dismiss 2.4 s
- One line only

### 5.7 Modal sheet

- Bottom sheet, max height 75% of screen
- Drag handle at top (`ink.tertiary`, 36 × 4 pt, 2 pt radius)
- `bg.nav` background
- Dismiss on tap-outside or downward swipe

---

## 6. Screen Inventory

17 screens to design, grouped by flow. Each has one or more states.

| # | Screen | States | Priority |
|---|---|---|---|
| 1 | Splash | default | P0 |
| 2 | Onboarding 1/4 — Trace | default | P0 |
| 3 | Onboarding 2/4 — In order | default | P0 |
| 4 | Onboarding 3/4 — Every cell | default | P0 |
| 5 | Onboarding 4/4 — First puzzle | idle, drawing, solved | P0 |
| 6 | Home | fresh, with-streak, daily-solved | P0 |
| 7 | Puzzle | idle, drawing, solved | P0 |
| 8 | Completion overlay | default | P0 |
| 9 | Journey (campaign map) | default, chapter-locked | P1 |
| 10 | Archive (past dailies) | default, empty | P1 |
| 11 | Almanac (collection) | default, empty, detail-popover | P1 |
| 12 | Settings | default | P1 |
| 13 | Starlight (IAP) | default, purchased | P1 |
| 14 | Hemisphere picker (modal sheet) | default | P2 |
| 15 | Hint confirm (modal sheet) | default, ad-unavailable | P2 |
| 16 | Notification opt-in (modal sheet) | default | P2 |
| 17 | About / Credits | default | P2 |

---

## 7. Per-Screen Specs

For each screen: layout, components used, copy (exact), and states.

### 7.1 Splash

- Full-bleed `bg.void`
- Centered: wordmark (Fraunces, 28 pt). No subtitle.
- Above wordmark: the 7-star Ursa Minor glyph from the app icon, 64 × 64 pt, animated with a one-time "connect" stroke (600 ms).
- Duration visible: 1.4 s then fade to next screen.

### 7.2–7.5 Onboarding (4 screens)

Common chrome:
- Status dots at top (4 dots, 8 pt diameter, 6 pt gap, active = `ink.primary`, inactive = `ink.tertiary`)
- Skip link top-right (ghost button, text "Skip", visible only on screens 1–3)
- Bottom: primary button "Continue" on 1–3, nothing on 4 (advance is by solving puzzle)

**Screen 2 (Onboarding 1/4) — Trace:**
- Illustration (top half): a 3×3 grid with 3 stars, animated finger drawing from star 1 through all cells to star 3. Loops every 3 s with a 1 s pause.
- Headline (Fraunces 24 pt): "Trace the stars"
- Body (Inter 16 pt, `ink.secondary`): "Drag from the first star to the last. Your line must touch every cell."

**Screen 3 (Onboarding 2/4) — In order:**
- Illustration: same grid but now showing numerals 1, 2, 3 on three stars. Animation lights each numeral as the finger passes.
- Headline: "Stars in order"
- Body: "Visit star 1 first, then 2, then 3. The order is part of the puzzle."

**Screen 4 (Onboarding 3/4) — Every cell:**
- Illustration: the completed 3×3 with all cells filled, then cells pulse once to emphasize coverage.
- Headline: "Every cell, once"
- Body: "Cover the whole sky. No cell left empty, no cell visited twice."

**Screen 5 (Onboarding 4/4) — Your first puzzle:**
- Functional 3×3 puzzle, no chrome beyond status dots
- Small prompt above puzzle (metadata style): "Start at 1 — cover every cell — end at 3"
- On solve: completion overlay appears, then routes to Home

### 7.6 Home

Layout top-to-bottom:
1. Status strip (streak left, settings gear right)
2. Hero card — "Tonight's Sky"
   - Eyebrow (metadata): "TONIGHT'S SKY · APR 24"
   - Constellation name (display): e.g., "Lyra"
   - Short subtitle (body, `ink.secondary`): e.g., "The harp of Orpheus."
   - Primary button: "Begin" (full-width within card)
   - Pulsing subtle glow if today's daily is unsolved
   - Solved state: button label becomes "Revisit", a small check glyph appears in top-right of card
3. Journey card (list card)
   - Eyebrow: "JOURNEY · CHAPTER 2"
   - Title: "Summer Sky — Level 7 of 20"
   - Right-chevron affordance
4. Archive card (list card)
   - Eyebrow: "ARCHIVE"
   - Title: "Past nights"
   - Right-chevron
5. Almanac card (list card)
   - Eyebrow: "ALMANAC"
   - Title: "12 of 88 constellations"
   - Right-chevron

States:
- **Fresh (no streak yet):** streak strip reads "Welcome" rather than "0 nights", hero CTA says "Begin your first night"
- **With-streak:** streak reads "12 nights", flame glyph active
- **Daily-solved:** hero shows check glyph, body reads "Solved tonight. See you tomorrow."

### 7.7 Puzzle

- Full-bleed `bg.void`
- Top bar: back arrow left, hint icon button right. Transparent.
- Above grid: tiny metadata line, `ink.tertiary`, 13 pt: constellation name if daily, level id if journey
- Grid centered vertically, horizontal width = min(screen_width − 48, computed_cell_grid_width)
- Below grid: tiny hint text, appears only on very first level ever played: "drag from star 1 to star N"
- Everything else is invisible. This is the zen screen.

States:
- **Idle:** all waypoints show numerals. No path. Numerals at 100% alpha.
- **Drawing:** path visible, head particle active, numerals on visited waypoints fade to 30% alpha (soft acknowledgment)
- **Solved:** path completes, overlay takes over (§7.8)

### 7.8 Completion overlay

- Non-blocking: rendered on top of the puzzle scene, which remains visible
- Full-width dimmed backdrop at 40% `bg.void`
- Stack vertically center:
  - Constellation shape (abstract — the actual stars the player just connected, rendered at 1.2× size, gently rotating ±2° over 4 s)
  - Constellation name (Fraunces 34 pt, `ink.primary`, fades in at 400 ms)
  - Lore line (body, `ink.secondary`, fades in at 600 ms, max width 280 pt, 2 lines)
  - Date or "Journey 2-7" in metadata style at 800 ms
- Tap anywhere to dismiss → return to Home or next journey level
- No explicit "Continue" button. The entire screen is the tap target.

### 7.9 Journey (campaign map)

- Screen title: "Journey"
- Back arrow left, nothing right
- Vertical scroll of 6 chapter sections
- Each chapter section:
  - Chapter header: eyebrow label ("CHAPTER 2 — SUMMER SKY"), title (Fraunces 20 pt), thin horizontal rule below in `bg.hair`
  - 4 × 5 grid of level nodes, 12 pt gutter
  - Each node: 48 × 48 pt circle. States:
    - **Locked:** `bg.hair` circle, tiny padlock glyph inside, no number
    - **Unlocked-unsolved:** outlined circle, level number in center, `ink.primary`
    - **Solved:** filled `bg.elev` circle, thin ring in `path.warm`, tiny check glyph
    - **Current:** outlined circle with soft pulsing glow, "Start" micro-label below
  - Chapter unlock threshold: "15 of 20 to unlock next chapter" (metadata, bottom of chapter)
  - Locked chapters render the entire 4×5 grid as locked, with the header in `ink.tertiary`

### 7.10 Archive

- Screen title: "Past Nights"
- Back arrow left
- List of last 30 daily puzzles, most recent first
- Each row (list card variant, 64 pt tall):
  - Left: a tiny 32 × 32 constellation glyph (abstract dot-and-line)
  - Middle: date (metadata, e.g., "APR 23"), constellation name (body primary), "solved" or "not attempted" (metadata, `ink.secondary`)
  - Right: chevron if unlocked, lock glyph if this was a skipped day before Starlight IAP
- Empty state: "Your nights begin tonight. Come back after your first puzzle." with a small star icon.

### 7.11 Almanac

- Screen title: "Almanac"
- Back arrow left
- Progress line under title: "12 of 88 constellations" in metadata, with a hairline progress bar under it (2 pt tall, `bg.hair` track, `star.glow` fill)
- Grid: 3 columns, square tiles, 12 pt gutter
- Each tile:
  - **Unsolved:** constellation silhouette in `ink.tertiary` at 30% alpha, no label
  - **Solved:** constellation in `star.glow` at full brightness, name below in metadata style, small date in tertiary ink
- Tap solved tile → bottom sheet popover with full lore, solve date, and a small "Replay" ghost button

### 7.12 Settings

- Screen title: "Settings"
- Back arrow left
- Grouped list sections with section headers in metadata style:

**DISPLAY**
- Hemisphere: N / S (tap opens hemisphere picker modal)

**SOUND & FEEL**
- Music volume (slider)
- Effects volume (slider)
- Haptics (toggle)

**NIGHTLY REMINDER**
- Evening notification (toggle, time shows "8:00 PM local" under label)

**STARLIGHT EDITION**
- Either "Unlock Starlight — $3.99" (primary row with chevron) OR "Starlight unlocked ✓" (static row)
- Restore purchases (ghost row)

**ABOUT**
- Credits (row, chevron)
- Privacy Policy (row, external link glyph)
- Terms of Service (row, external link glyph)
- Version "1.0.0 (build 1)" metadata

### 7.13 Starlight (IAP)

- Full-screen takeover, not a modal
- Top: close button (X) top-right, no back arrow
- Stack vertical center:
  - Illustration: the Ursa Minor 7-star glyph, now with a subtle gold ring around it, gently rotating
  - Title (display): "Starlight Edition"
  - Subtitle (body secondary): "Support the maker of a quiet game."
  - Feature list (3 rows, check glyph left, body text right):
    - "Remove all ads"
    - "Unlock the infinite archive"
    - "Subtle gold accents throughout"
  - Primary button: "Unlock — $3.99"
  - Restore link (ghost button): "Restore purchases"
- Purchased state: same layout, button replaced with a static pill "Starlight unlocked" and the gold ring animation is permanent

### 7.14 Hemisphere picker (modal sheet)

- Drag handle at top
- Title (screen-title style): "Where are you watching from?"
- Body (secondary): "This changes the seasonal rhythm of your daily sky."
- Two large tiles side-by-side:
  - "Northern Hemisphere" with small globe glyph showing north cap highlighted
  - "Southern Hemisphere" with south cap highlighted
- Tap a tile selects + dismisses. Selected tile gets `star.glow` outline.

### 7.15 Hint confirm (modal sheet)

- Drag handle
- Lightbulb icon, 32 × 32 pt, centered
- Title: "Need a hint?"
- Body: "Watch a short ad to reveal the next two steps."
- Primary button: "Watch Ad"
- Ghost: "Not now"
- Ad-unavailable state: "No ad available right now. Try again shortly." + single "OK" ghost button. No primary action.

### 7.16 Notification opt-in (modal sheet)

- Appears on 2nd session only, once
- Drag handle
- Bell icon
- Title: "A quiet reminder"
- Body: "We'll send one note at 8 PM so you don't miss tonight's sky. Nothing else, ever."
- Primary: "Allow" (triggers OS permission prompt on tap)
- Ghost: "Maybe later"

### 7.17 About / Credits

- Screen title: "Credits"
- Back arrow
- Scrolling text content, generous line-height (1.6), max width 320 pt, centered
- Sections:
  - "Design & Code" — one name
  - "Music" — composer name + license
  - "Sound" — freesound contributors
  - "Typefaces" — Fraunces by Undercase Type, Inter by Rasmus Andersson
  - "Lore" — public domain sources
  - Small thank-you line at bottom

---

## 8. Device & Safe-Area Notes

- All screens must respect safe area insets. Top-bar content sits below the top inset.
- Puzzle grid centers in the available area between top bar and bottom safe area.
- On smaller screens (iPhone SE, 375 × 667 pt): reduce home card internal padding from 24 to 20 pt; everything else scales.
- On larger screens (iPhone 15 Pro Max, 430 × 932 pt): content stays centered with a max width of 420 pt; extra space becomes breathing room.

---

## 9. Accessibility

- Minimum tap target: 44 × 44 pt (iOS HIG).
- Text contrast: all text at AA (4.5:1). Verified:
  - `ink.primary` on `bg.void` = 14.8:1 ✓
  - `ink.secondary` on `bg.nav` = 7.2:1 ✓
  - `ink.tertiary` on `bg.void` = 4.6:1 ✓ (use only for supporting metadata)
- Waypoint numerals must remain readable at high contrast; do not reduce below 16 pt.
- Dynamic Type: body text respects 3 steps up. Display type caps at +1 step.
- Colorblind: the game never uses red/green discrimination. Path gradient is cool→warm but order is also encoded by numerals.
- VoiceOver:
  - Puzzle screen announces "Constellation Weaver puzzle. [N] stars. Star 1 at top-left." on open.
  - Completion announces "Solved. [Constellation name]. [Lore]."
  - Home's daily hero card label: "Tonight's sky. [Date]. [Constellation]. [Solved status]. Double-tap to play."
- Haptics toggle in settings must fully disable all haptic calls at source.
- Reduce Motion (iOS system setting) disables parallax and idle twinkle, shortens all transitions to 150 ms, disables daily-card pulse.

---

## 10. Copy Library

Centralized so tone stays consistent. All copy is original. Default voice: quiet, warm, never cute, never yelling.

- App tagline (store listing): "A quiet nightly ritual."
- Store short description: "Trace a constellation with one stroke. One puzzle, every night."
- Empty Almanac: "Your almanac fills one night at a time."
- First-ever launch greeting (on Home, fades after 4 s): "Welcome. The sky is waiting."
- Streak day 7 milestone (toast): "Seven nights. A quiet habit."
- Streak day 30 milestone (toast): "Thirty nights. A small constellation of your own."
- Hint watched successfully: "Two steps revealed."
- Puzzle abandoned (no message — silent reset is the design)

---

## 11. Example Content — Three Real Constellations

Use these as canonical examples for design work. Each puzzle illustration should be abstract, not astronomically accurate.

| Constellation | Grid | Waypoints | Lore line |
|---|---|---|---|
| Cassiopeia | 5×5 | 5 | "The vain queen, bound to her throne among the stars." |
| Lyra | 5×5 | 4 | "The harp of Orpheus, still singing." |
| Ursa Minor | 6×5 | 7 | "The little bear, whose tail is the pole star." |

---

## 12. Reference Mood Board

Direction, not pastiche. Look at the feel, not the specifics.

- **Mini Metro** — line clarity, restraint, colored paths against neutral background
- **Monument Valley** — stillness, confident composition, generous negative space
- **Apple Weather (night view)** — deep navy gradient, luminous data, minimal chrome
- **Threes** — a two-font system used with authority
- **Vintage star atlases** (Flamsteed, Bayer) — the way ink behaves on dark paper, the intimacy of labels

Anti-references (do NOT look like):
- Candy Crush, Royal Match, any "saga map"
- Any gradient-noir NFT or crypto app
- Duolingo-style mascot-driven warmth
- Any game with a "world map" illustration

---

## 13. Deliverables Requested from Claude Design

### 13.1 Format

- Deliver as a Figma-style frame set, one frame per screen state, anchored to iPhone 14 Pro dimensions (390 × 844 pt)
- Also deliver a component page showing: buttons, cards, top bar, bottom sheet, toast
- Also deliver a style page showing: color tokens, type ramp, iconography, spacing scale
- Each frame labeled with its screen number from §6 and state name (e.g., "7.6 Home / With-streak")

### 13.2 Priority order for first pass

Produce P0 screens first (§6), then P1, then P2. Within P0, produce in this order:
1. Splash (1 frame)
2. Home (3 states)
3. Puzzle (3 states)
4. Completion overlay
5. Onboarding 1–4 (5 frames)

### 13.3 Assumptions permitted

- You may pick icon glyphs that fit the descriptions in §3.5 — don't block on icon finalization.
- You may generate placeholder constellation silhouettes; final layouts will be swapped in from the generator.
- You may refine spacing within the 4 pt grid if a layout requires it.

### 13.4 Assumptions NOT permitted

- Do not change the color palette.
- Do not introduce a third typeface.
- Do not add drop shadows or glassmorphism.
- Do not add illustration beyond what is specified.
- Do not add badges, XP, coins, gems, or any form of score.

---

## 14. Open Questions for Designer

These are areas where a designer's judgment is explicitly welcome:

1. **Streak visualization.** A flame glyph is suggested in §5.4 but feels slightly "gamey." Would a small phase-of-the-moon glyph or a tiny filled-circle chain feel more aligned with the ritual framing?
2. **Home hierarchy.** The four cards (Today, Journey, Archive, Almanac) may be too flat. Should Journey/Archive/Almanac collapse into a single "More" section to keep Today heroic?
3. **Puzzle numeral style.** Inter Light 18 pt tabular is specified. Would Fraunces 300 at 16 pt feel more cohesive, or does it steal emphasis from the constellation names?
4. **Archive row density.** 64 pt rows may waste space. Test a 48 pt variant without the glyph thumbnail.
5. **Almanac tile label placement.** Name below the silhouette vs overlaid at the bottom. Designer's call.

---

*End of design brief. Everything above is sufficient to produce the full v1 screen set without further input.*
