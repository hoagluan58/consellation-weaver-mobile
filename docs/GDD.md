# Constellation Weaver — Game Design Document

**Version:** 0.1 (pre-production)
**Author:** Solo dev
**Date:** 2026-04-23
**Status:** Locked concept, spec in progress

---

## 1. Executive Summary

**Constellation Weaver** is a minimalist single-player mobile puzzle game. Players draw one unbroken glowing line through a grid of stars, visiting numbered stars in order and covering every cell of the night sky. Each solved puzzle reveals a real constellation with its mythological name.

- **Elevator pitch:** *"A quiet nightly ritual. Trace a constellation with your finger — one stroke, in order, touching every star."*
- **Target platforms:** iOS 15+, Android 10+
- **Engine:** Godot 4.3
- **Scope:** 1 developer, 4 weeks to soft launch
- **Monetization:** Ad-supported with single-tier remove-ads IAP
- **Retention target:** D1 40%, D7 15%
- **Comparable titles:** Zip (LinkedIn), Mini Metro, Monument Valley (ambient tier), Flow Free (mechanics tier)

---

## 2. Design Pillars

Every feature decision must serve at least one pillar. If a feature serves none, cut it.

1. **One stroke, one breath.** A puzzle should feel like an unbroken exhale. No menus, no modals, no friction inside a puzzle.
2. **Cheap to build, expensive to feel.** Minimal assets, maximum juice. Every dollar of production goes into motion, glow, and haptics — not illustrations.
3. **A ritual, not a grind.** Daily puzzle is the heartbeat. The game should feel like a small ceremony, not a slot machine.
4. **Recognizable beauty.** Real constellations give free narrative and lore. Every completion rewards curiosity.

---

## 3. Target Audience

- **Primary:** 25–45, casual puzzler, values aesthetics over gamification. Plays 5–15 minutes before bed. Owns a premium puzzle game in library (Monument Valley, Mini Metro, Threes).
- **Secondary:** 18–24 design-literate users, appreciates minimalism and type. Shares screenshots.
- **Not our audience:** Hyper-casual players, freemium whales, competitive puzzlers.
- **Motivations served:** Relaxation, completion, mild curiosity (star lore), aesthetic pleasure.

---

## 4. Core Gameplay

### 4.1 Ruleset

A puzzle is a rectangular grid with:
- **N waypoints** — cells marked with consecutive integers 1..N
- **M empty cells** — unmarked but traversable

To solve, the player draws a single continuous path that:

1. Starts at waypoint **1**
2. Ends at waypoint **N**
3. Passes through waypoints **2, 3, ..., N−1 in exact order**
4. Enters every cell of the grid **exactly once** (Hamiltonian)
5. Moves only between **orthogonally adjacent** cells (no diagonals, no teleporting)
6. Never revisits a cell

If all six rules hold at release of input, the puzzle is solved.

### 4.2 Input States

```
IDLE ──(touch-down on valid cell)──> DRAWING
DRAWING ──(drag to adjacent empty cell)──> DRAWING [append]
DRAWING ──(drag back to previous cell)──> DRAWING [pop]
DRAWING ──(drag to non-adjacent cell)──> ignored
DRAWING ──(lift)──> VALIDATE
VALIDATE ──(all rules pass)──> SOLVED
VALIDATE ──(rules fail)──> IDLE [path cleared with soft fade]
```

**Touch-down rule:** Path must begin at waypoint 1. Touching elsewhere does nothing (with a subtle nudge animation on waypoint 1 to teach).

**Backtracking:** Dragging back onto the immediately previous cell pops the last step. This is the *only* form of undo inside a stroke. It keeps the "one breath" feel.

**Lift = commit.** Lifting the finger validates. If the puzzle is incomplete, the path dims and fades rather than shows a red X — no failure state, just a quiet reset.

### 4.3 Why this is strategic

- Hamiltonian path problems are NP-hard in general; small grids with ordered waypoints create a tight decision tree.
- Each waypoint forces the path to pass through a specific cell at a specific step count. This eliminates trivial solutions.
- Typical 5×5 level has 1–2 "pinch points" where only one cell choice works.

---

## 5. Difficulty Curve

Grid sizes and waypoint densities scale gently. Numbers are calibrated to average time-to-solve.

| Tier | Grid | Waypoints | Avg solve | Levels | Purpose |
|------|------|-----------|-----------|--------|---------|
| Tutorial | 3×3 | 2–3 | 10s | 5 | Teach input |
| Easy | 4×4, 5×5 | 3–4 | 30s | 25 | Teach sequencing |
| Medium | 5×5, 6×6 | 4–5 | 60s | 40 | Core loop |
| Hard | 6×6, 7×7 | 5–6 | 120s | 30 | Sharpen |
| Expert | 7×7, 8×8 | 6–8 | 180s+ | 20 | Long-play |

**Total launch content:** 120 handcrafted/curated levels + 88 daily constellation levels (one per real constellation) rotating on a one-year cycle.

---

## 6. Content: The 88 Constellations

Each of the 88 IAU-recognized constellations becomes a daily puzzle. Each carries:

- **Name** (e.g., "Cassiopeia")
- **Hemisphere** (N/S)
- **Best viewing month** (used to drive daily rotation)
- **One-line lore** (≤120 chars, original writing, pulled from public-domain myth sources)
- **Star layout** (abstracted to 5×5 or 6×6 grid, not astronomically accurate — puzzle-first)

Daily puzzle rotation is deterministic by date, seeded against the user's hemisphere preference (set on first launch, changeable in settings).

**Writing load:** 88 × 120 chars ≈ 10,500 chars. ~3 days of writing.

---

## 7. Generator

### 7.1 Algorithm

```
1. Pick grid size (W, H) and target waypoint count N.
2. Generate a random Hamiltonian path on WxH using randomized DFS with backtracking.
   - Retry on failure (HP existence not guaranteed on all grid shapes; rectangles always work).
3. Pick N cells along the path at roughly even intervals.
   - Ensure first = index 0, last = index W*H - 1.
   - Space interior waypoints so that segments have 3..8 cells.
4. Label waypoints 1..N in path order.
5. Verify uniqueness:
   - Run a solver over the grid with only the numbered waypoints visible.
   - If it finds only one Hamiltonian path matching the order, keep it.
   - If multiple, increment N and retry.
6. Emit level JSON.
```

### 7.2 Uniqueness Solver

Backtracking DFS from waypoint 1, pruning when:
- Current cell index in path ≠ expected order of next encountered waypoint
- Remaining unreached cells form a disconnected region

Target: generate + verify one level in under 500ms on dev machine. Run offline; ship verified levels only.

### 7.3 Level file format

```json
{
  "id": "cas_001",
  "constellation": "Cassiopeia",
  "hemisphere": "N",
  "best_month": 11,
  "lore": "The vain queen, bound to her throne among the stars.",
  "width": 5,
  "height": 5,
  "waypoints": [
    {"x": 0, "y": 0, "order": 1},
    {"x": 4, "y": 2, "order": 2},
    {"x": 0, "y": 4, "order": 3}
  ],
  "solution": [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[3,2],[2,2],[1,2],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4],[4,4],[4,3],[3,3],[2,3],[1,3],[1,1],[2,1],[3,1],[0,1]]
}
```

Solution stored for hint system and solve-validation fast path.

---

## 8. Art Direction

### 8.1 Visual language

- **Background:** Deep navy (#050818) with subtle star-field parallax (2 layers, 40fps drift)
- **Grid cells:** Invisible by default. On path-entry, cell fills with a soft luminous disc (#B8D4FF at 20% alpha).
- **Stars (waypoints):** Bright core (#FFF4D6) with outer glow (#FFDB8E at 40% alpha, radius 1.5× core).
- **Numbers on waypoints:** Thin serif or geometric sans (Inter Light), centered in star core. Pure white. Disappears once visited.
- **Path:** Line segments between cell centers. Color gradient from cool white at start to warm gold at current head. Stroke weight 8pt on @1x. Particle emitter at head, 4–6 particles/frame, short lifetime.
- **Completion:** Constellation name fades in center over 800ms. Line pulses twice. Lore appears under name 200ms later. Tap anywhere to continue.

### 8.2 Typography

- **Display:** Fraunces (serif, for constellation names — evokes old star charts)
- **UI:** Inter (clean sans)
- **Numerals on stars:** Inter Light, tabular

### 8.3 Motion principles

- Every animation has an easing curve, never linear
- Nothing pops — everything fades
- Haptic accompanies every visual event on star-hit or completion
- Idle state has ambient motion (star twinkle, slow parallax) so the game never feels frozen

### 8.4 Asset list (launch)

- 1 star shader (core + glow)
- 1 path shader (gradient stroke)
- 1 particle texture
- 1 star-field background texture (tileable)
- App icon (1024×1024)
- Store screenshots (5 × 1290×2796, 5 × 2796×1290 for iPad if shipping)
- Splash screens (iOS/Android standard set)

**Total original art time budget:** ~6 days including shaders.

---

## 9. Audio Direction

- **Ambient bed:** Single ~2-minute seamless loop, soft synth pad + occasional wind-chime accent. Low-passed, around -18 LUFS.
- **Star-hit SFX:** Short pitched ting. Pitch rises by a minor third per consecutive star in one stroke (so each puzzle has a rising melodic arc).
- **Completion chime:** Simple major-seventh resolve. One hit only.
- **Path draw:** No continuous audio — would clash with ambient bed.
- **Menu transitions:** Soft whoosh, 200ms.
- **Settings:** Master mute + separate music/sfx sliders. Persist across sessions.

**Licensing plan:** Commission one musician for 2-minute loop (~$300 budget), or use CC0 (BWV / public-domain-adjacent ambient). Source all SFX from freesound.org CC0.

---

## 10. UI / Screen Flow

```
Splash (1.5s logo fade)
  └─> First-run onboarding (new users only)
       └─> Home
Home screen
  ├─ Today (daily puzzle card, pulsing)
  ├─ Journey (campaign: 120 levels, locked progression)
  ├─ Archive (past dailies, last 30)
  ├─ Settings (gear icon top-right)
Puzzle screen
  ├─ Back arrow (top-left, returns with confirm if mid-draw)
  ├─ Hint button (top-right, bottom bar)
  ├─ Grid (centered)
  └─ Completion overlay (non-blocking tap-to-continue)
Settings
  ├─ Hemisphere preference (N/S)
  ├─ Audio sliders
  ├─ Haptics toggle
  ├─ Remove ads IAP
  ├─ Restore purchases
  ├─ Credits
  └─ Privacy/Terms
```

### 10.1 Home screen priority

Top of screen: **Today's constellation**, giant card with the date ("April 23"). This is the primary CTA. It pulls users into the ritual.

Secondary: **Continue Journey** card, showing next level in campaign.

Tertiary: **Archive** (tabs to browse recent dailies).

### 10.2 Onboarding

Four screens, skippable:
1. "Trace the stars" — animated demo of finger drag
2. "In order" — shows waypoints lighting up 1→2→3
3. "Every cell" — shows full-grid completion
4. "Come back each night" — teases daily puzzle

Gate: Must successfully solve the 3×3 tutorial puzzle on screen 4 before advancing to Home.

---

## 11. Progression & Meta

### 11.1 Campaign ("Journey")

- 120 levels in 6 chapters of 20
- Chapters gated: finish 15/20 to unlock next chapter
- No stars/ratings — puzzle solved or not. Reduces anxiety.

### 11.2 Daily puzzle ("Tonight's Sky")

- One per calendar day, based on user's local date + hemisphere
- **Streak counter** prominently displayed on home screen
- Missing a day does **not** reset streak (controversial for gamer segment but matches "ritual" pillar — punishment kills cozy)
- Instead: streak shows as "12-day streak, 2 grace days used"
- 3 grace days per month max

### 11.3 Collection ("Almanac")

- Shows all 88 constellations as dim silhouettes
- Solved ones light up, show lore and completion date
- No other collectibles — simplicity over bloat

### 11.4 Explicit non-features

- No XP, no coins, no gems, no energy, no lives
- No leaderboards (single-player pillar)
- No social login required
- No accounts — all progress local with iCloud/Drive backup

---

## 12. Monetization

### 12.1 Ad integration

- **Placement:** Full-screen interstitial after every 4th level solve in Journey (configurable via remote config)
- **Never** shown after daily puzzle solve (ritual pillar)
- **Never** shown during onboarding
- **Rewarded ad:** Single use — unlocks a hint on the current puzzle
- **Network:** AdMob primary, with a simple mediation stub for future addition

### 12.2 IAP

**Single SKU: "Starlight Edition" — $3.99 one-time**
- Removes all interstitial ads forever
- Unlocks "Infinite Archive" — browse every past daily, not just last 30
- Adds a subtle constellation-gold UI accent (vanity reward)

**Why one-time, not subscription:**
- Matches audience (design-literate, subscription-fatigued)
- Lower friction → higher conversion
- Simpler to implement (no renewal handling)

### 12.3 Financial model

Conservative assumptions at 10,000 installs in month 1:
- 10% IAP conversion → 1,000 × $3.99 × 0.70 (store cut) = **~$2,793**
- 50% see ads, 2 ads/session, $8 eCPM → ~10,000 × 0.50 × 14 sessions × 2 × $0.008 = **~$1,120**
- Gross month 1: **~$3,900**

Break-even depends on user acquisition spend. Plan: organic launch (Product Hunt, r/iosgaming, ASO) with $0 paid UA in first month.

---

## 13. Retention Strategy

Target: D1 40%, D7 15%, D30 5%.

### 13.1 Levers

1. **Daily puzzle** — core ritual driver. Push notification opt-in at 2nd session.
2. **Streak mechanic** — with grace days (see 11.2).
3. **Collection completion** — Almanac shows progress toward 88.
4. **Campaign pacing** — new puzzle type/constraint visual variant every 20 levels keeps Journey fresh (see §14).
5. **Evening push notification** — single opt-in at 8 PM local: *"Tonight's sky is waiting."* One tap to puzzle.

### 13.2 Explicit anti-patterns to avoid

- No "come back in 4 hours" timers
- No loss-aversion mechanics
- No FOMO event puzzles in v1
- No forced social

---

## 14. Variants & Content Evolution

v1 ships with the pure core ruleset. To keep Journey interesting across 120 levels without adding real mechanics, visual variants segment chapters:

| Chapter | Theme | Visual twist | Ruleset |
|---------|-------|--------------|---------|
| 1 | Spring sky | Green-tinted glow | Core |
| 2 | Summer sky | Warmer palette | Core |
| 3 | Autumn sky | Gold particles | Core |
| 4 | Winter sky | Icy blue, slower particles | Core |
| 5 | Deep sky | Darker bg, nebula texture | Core |
| 6 | Mythology | Animated silhouettes on completion | Core |

**No rule changes in v1.** Keeps design work bounded. New rulesets reserved for post-launch content.

---

## 15. Technical Architecture

### 15.1 Stack

- **Engine:** Godot 4.3
- **Language:** GDScript for gameplay, GDExtension C++ only if profiling requires
- **Rendering:** Mobile renderer
- **Target FPS:** 60 locked, drops to 30 on low-end only if thermal
- **Persistence:** Local JSON files in `user://` (Godot's user directory), with optional iCloud/Drive backup via platform plugins
- **Analytics:** Firebase Analytics or Aptabase
- **Ads:** AdMob via official Godot plugin
- **IAP:** Godot InAppPurchase plugin (iOS) + Google Play Billing (Android)

### 15.2 Core scene graph

```
Main (Node)
├── AudioManager (AutoLoad)
├── HapticsManager (AutoLoad)
├── SaveManager (AutoLoad)
├── AdManager (AutoLoad)
├── Router (AutoLoad — scene navigation)
├── HomeScreen (Control, swapped in by Router)
├── PuzzleScene (Node2D, swapped in by Router)
│   ├── Board (Node2D)
│   │   ├── CellGrid (drawn)
│   │   ├── PathRenderer (Line2D or custom)
│   │   ├── WaypointLayer (stars)
│   │   └── ParticleHead
│   ├── TopBar (back, hint)
│   └── CompletionOverlay
└── SettingsScreen (Control)
```

### 15.3 Save data shape

```json
{
  "schema_version": 1,
  "journey_progress": {"chapter": 2, "level": 7},
  "solved_levels": ["tutorial_01", "journey_001", ...],
  "solved_constellations": ["cassiopeia", "ursa_major"],
  "daily_streak": 12,
  "grace_days_used_this_month": 1,
  "last_daily_date": "2026-04-22",
  "settings": {
    "hemisphere": "N",
    "haptics": true,
    "music_volume": 0.8,
    "sfx_volume": 1.0,
    "notifications_opted_in": true
  },
  "iap_starlight": false
}
```

### 15.4 Analytics events (minimum set)

- `session_start`, `session_end`
- `level_start` (id, source: daily|journey|archive)
- `level_complete` (id, time_seconds, hints_used, path_retries)
- `level_abandon` (id, time_seconds)
- `daily_solve` (date, constellation_id, streak_after)
- `hint_used` (level_id)
- `iap_view`, `iap_purchase`, `iap_restore`
- `ad_impression` (placement, network)
- `onboarding_step` (step_index)
- `onboarding_complete`

No PII. No device fingerprinting beyond platform-native analytics IDs.

---

## 16. Development Milestones (4 weeks)

### Week 1 — Core mechanic
- [ ] Godot project scaffolded, Git initialized
- [ ] Grid rendering, touch input, path drawing with backtrack
- [ ] Win condition + validation
- [ ] Single hardcoded test level playable end-to-end
- [ ] Completion animation placeholder
- **Exit criterion:** One puzzle solvable on a physical iOS device

### Week 2 — Content pipeline + visuals
- [ ] Level generator + uniqueness solver (offline tool)
- [ ] Generate 120 journey levels + abstract 88 constellation layouts
- [ ] Star shader, path shader, particle head
- [ ] Background star-field parallax
- [ ] Ambient audio integration
- [ ] Haptics on star hit + completion
- **Exit criterion:** Visually polished, 120 levels playable

### Week 3 — Meta + systems
- [ ] Home screen, Journey screen, Archive, Almanac, Settings
- [ ] Save/load with schema versioning
- [ ] Daily puzzle rotation by local date
- [ ] Streak logic with grace days
- [ ] Onboarding flow with gated first puzzle
- [ ] Push notification integration (8 PM local opt-in)
- **Exit criterion:** Fresh install → 7-day play loop all works

### Week 4 — Monetization, store prep, polish
- [ ] AdMob integration, rewarded hint, interstitial cadence
- [ ] IAP: Starlight Edition, restore purchases
- [ ] Analytics events wired
- [ ] Icon, screenshots, store copy, privacy policy, ToS
- [ ] TestFlight beta (≥10 testers) + Play internal track
- [ ] Bug bash, 60 fps validation on iPhone 12 and Pixel 6a
- **Exit criterion:** Builds submitted to App Store Review and Play Store

### Buffer
Assume 20% slippage. If behind at end of week 2, cut Almanac and reduce journey to 80 levels before cutting polish.

---

## 17. Scope Boundaries

### In v1
- Core one-line ruleset
- 120 journey + 88 daily levels
- Daily rotation, streak, grace days
- Almanac
- Hints via rewarded ad
- Starlight IAP
- iOS + Android

### Out of v1 (post-launch roadmap)
- New rulesets (segment budgets, directional waypoints)
- Multiplayer / async puzzles
- Social sharing cards
- Seasonal event puzzles
- Custom user-created puzzles
- Apple Watch / complications
- iPad-optimized layout (ships functional but not optimal)
- Localization beyond English

---

## 18. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Ruleset too close to Zip, rejected from App Store | Low | High | Differentiate visuals + framing hard; Zip is web-only and unpackaged, mechanics not copyrightable |
| Generator produces unsolvable or multi-solution levels | Medium | Medium | Ship only pre-verified levels; keep generator offline |
| 1-month timeline slips | High | Medium | Buffer in week 4; scope cuts predefined in §16 |
| Low organic discovery | High | Medium | Invest in strong screenshots + Product Hunt launch day; ASO targets "zen puzzle" "constellation" "daily puzzle" |
| Ads degrade experience, hurts retention | Medium | High | Ad cadence is remote-config driven; A/B test post-launch |
| Platform plugin breakage (AdMob/IAP) | Medium | Medium | Keep integrations behind thin interfaces; test on device weekly |
| Haptics feel wrong on Android | Medium | Low | Tune per-device; allow disable in settings |

---

## 19. Launch Plan

### Soft launch (week 5)
- Release in Canada + Australia first
- Monitor crash rate, D1, D7, IAP conversion for 2 weeks
- Tune ad cadence and difficulty curve via remote config

### Global launch (week 7)
- Product Hunt launch day (Tuesday 12:01 AM PT)
- Reddit: r/iosgaming, r/AndroidGaming, r/incremental_games (careful framing)
- Twitter/X thread with completion animation GIFs
- Apple Editorial pitch submitted 4 weeks prior via App Store Connect
- Reach out to ambient-gaming newsletters (e.g., Rock Paper Shotgun Mobile, Ambient Press)

### Press kit
- 5 screenshots, 1 gameplay GIF, 1 logo, 120-word description, contact info
- Hosted on simple single-page site built in whatever is fastest

---

## 20. Post-Launch Roadmap (tentative)

- **Month 2:** First new ruleset (segment budgets) as optional chapter
- **Month 3:** Localization (JP, DE, FR, ES)
- **Month 4:** Apple Watch daily complication
- **Month 6:** User-generated puzzles (shared via link)

Driven by retention and revenue data, not preset.

---

## 21. Appendices

### A. Full 88 IAU constellation list
Andromeda, Antlia, Apus, Aquarius, Aquila, Ara, Aries, Auriga, Boötes, Caelum, Camelopardalis, Cancer, Canes Venatici, Canis Major, Canis Minor, Capricornus, Carina, Cassiopeia, Centaurus, Cepheus, Cetus, Chamaeleon, Circinus, Columba, Coma Berenices, Corona Australis, Corona Borealis, Corvus, Crater, Crux, Cygnus, Delphinus, Dorado, Draco, Equuleus, Eridanus, Fornax, Gemini, Grus, Hercules, Horologium, Hydra, Hydrus, Indus, Lacerta, Leo, Leo Minor, Lepus, Libra, Lupus, Lynx, Lyra, Mensa, Microscopium, Monoceros, Musca, Norma, Octans, Ophiuchus, Orion, Pavo, Pegasus, Perseus, Phoenix, Pictor, Pisces, Piscis Austrinus, Puppis, Pyxis, Reticulum, Sagitta, Sagittarius, Scorpius, Sculptor, Scutum, Serpens, Sextans, Taurus, Telescopium, Triangulum, Triangulum Australe, Tucana, Ursa Major, Ursa Minor, Vela, Virgo, Volans, Vulpecula.

### B. Reference inspirations
- **Mechanics:** Zip (LinkedIn), Numberlink, Hamiltonian path puzzles
- **Feel:** Monument Valley, Mini Metro, Alto's Odyssey
- **Visual:** Harry Beck subway maps, vintage star atlases (Flamsteed, Bayer)
- **Audio:** Brian Eno's Music for Airports, Mini Metro's generative score

### C. Open questions
- Is streak grace-day count the right UX? (user-test during week 3)
- Should completion show solve time or keep it hidden? (hidden in v1, telemetry only)
- Landscape mode: ship in v1 or defer? (defer — portrait-only simplifies layout)

---

*End of document.*
