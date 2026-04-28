# Constellation Weaver — Game Design Brainstorm

Source inspiration: [Flow Free](https://apps.apple.com/us/app/flow-free/id526641427)

---

## Constraints

- **Mechanic direction:** Path-connecting + fill-the-board vibe, with a new hook
- **Platform:** Mobile (iOS/Android)
- **Dev model:** Solo, aim to publish/monetize
- **Store review:** Must be different enough from Flow Free to clear review
- **Scope:** 1 month build
- **Retention target:** 7 days maximum
- **Depth:** Strategic, but low-cost and not too complicated
- **Mode:** Single-player only
- **Output requested:** 2 refined concepts

---

## Round 1 — Two refined concepts

### Concept A: "Thread" — one-line puzzle with ordered waypoints
- Draw a **single unbroken path** with your finger
- Must fill every cell of the grid
- Must pass through numbered waypoints in order (1 → 2 → 3 → …)
- Never crosses itself
- Single color, single path
- Differentiation from Flow Free: no color matching, single path, Hamiltonian-path genre
- Retention: daily puzzle + streak
- Monetization: ads + rewarded hints + $2.99 remove-ads IAP

### Concept B: "Exact" — Flow Free + length budgets
- Classic match-color endpoints with pipes, fill board
- Each color has a **required length** (Red: 5, Blue: 7…)
- Color's path must be exactly that many cells
- Differentiation: collapses "many valid solutions" into usually one; becomes a logic puzzle
- Retention: themed weekly packs + daily challenge
- Monetization: same template as A

**Initial pick:** Concept A (Thread) — cheapest to build, strongest daily-puzzle fit, least crowded category.

---

## Honesty check — "Thread" = LinkedIn's Zip

The Concept A ruleset (single path, ordered waypoints, fill every cell, no crossing) is mechanically identical to LinkedIn's **Zip**. The packaging (mobile polish, campaign, daily+streak, monetization) is not a mechanical differentiator.

Puzzle mechanics are not copyrightable and the genre predates Zip, so store review would still pass. But it is not a "new idea" — it is a port of an existing public mechanic.

### Real mechanical twists available (ranked by cheapness)
1. **Segment budgets** — exact cell count between each waypoint pair (merges A + B)
2. **Directional waypoints** — arrows force exit direction
3. **Forbidden adjacencies** — certain waypoints can't be physically adjacent on the path
4. **Branching order** — waypoints like "{2 or 5}"
5. **Revealed waypoints** — waypoint N appears only after N−1 is reached
6. **Two threads** — two independent paths that can't touch

**Decision:** User chose to keep the original Zip mechanic and differentiate on **visuals/theme** instead of mechanics.

---

## Round 2 — Six visual/thematic treatments (same mechanic)

### 1. Constellation Weaver (night sky)
- Waypoints = numbered stars on black grid; path = glowing line with particle trail
- Completion: constellation rotates, mythological name fades in
- **Art cost:** Trivial (dots, lines, one glow shader)
- **Free content:** 88 real constellations = 88 level themes with ready-made lore
- **Daily hook:** "Tonight's Sky, [date]"
- **Screenshot:** Black + jewel-tone glow stands out on App Store

### 2. Metro Designer (subway map)
- Waypoints = numbered stations with names; path = bold colored subway line
- Completion: tiny train animates along the line, line gets a name
- **Art cost:** Lowest possible — vector shapes + Helvetica/Inter
- **Content:** Level packs themed after real cities (Tokyo, NYC, Paris, London)
- **Screenshot:** Designer/infographic look, stands out from neon competitors
- **Audience:** Design-literate, slightly older, higher LTV

### 3. Zen Garden (raked sand)
- Sand texture grid, drag leaves rake grooves, waypoints are numbered stones
- Completion: camera zooms out, wind chime sfx, haiku appears
- **Art cost:** ~2 days (one texture + normal map)
- **Content:** Seasonal packs (cherry blossom, autumn, snow)
- **Vibe:** Premium/mindfulness category, low CPI, high LTV

### 4. Detective Corkboard (crime web)
- Cork background, waypoints = pinned evidence cards, path = red yarn
- Each level framed as a case ("Case 14 — The Missing Heirloom")
- **Content:** Serialized cases = "come back tomorrow for Case 15"
- **Risk:** Writing load — mitigate with 2-sentence setups

### 5. Ink Brush / Hitofude (calligraphy)
- Rice-paper texture, path = sumi-e brushstroke with bleed, waypoints = red seals
- Completion: stroke settles, kanji emerges, chop stamp plants
- **Content:** 108 characters = 108 levels, collection meta
- **Screenshot:** Extremely distinctive on store

### 6. Vine Gardener (cozy plant growth)
- Earth grid, waypoints = seed pods, path = vine growing with leaves/flowers
- Completion: plant added to greenhouse collection
- **Art cost:** Medium (vine tiles + flower sprites)
- **Audience:** Cozy-puzzle demographic, underserved on App Store

---

## Final pick — Constellation Weaver

### Why this one for the stated constraints
- **Cheapest art** — solo dev can ship polished look in week 1, freeing remainder of month for feel/juice
- **88 free level themes** from real constellations = no content burden
- **Daily puzzle framing is native** ("Tonight's Sky, [date]") — strong 7-day retention with minimal meta
- **Best thumbnail** for App Store discovery (glowing stars on black reads at tiny sizes)
- **Haptics are free wins** — soft tick on each star hit feels great

### Detailed spec

**Visual**
- Waypoints = numbered stars on a deep-black grid
- Path = glowing line that leaves a soft particle trail
- Empty cells are faint dots or pure void

**Completion moment**
- Line pulses
- Constellation rotates slightly
- Mythological name fades in ("Lyra," "The Hunter," "Cassiopeia")
- Optional short lore blurb

**Feel layer (cheap wins)**
- Haptic tick on each star hit
- Soft ambient drone
- Single chime on completion
- Subtle star-twinkle parallax background

**Content**
- 88 real constellations → 88 premade level themes
- Daily puzzle: "Tonight's Sky, [date]"
- Ready-made names and lore

**Audience**
- Broad — ambient/mindfulness-adjacent, also works for casual puzzlers

**Monetization**
- Interstitial ad every 3–5 levels
- Rewarded ad for hints
- $2.99 remove-ads IAP
- **No energy system** (kills retention)

### Runner-up
**Metro Designer** — same build cost, different audience (design-minded users instead of cozy/ambient).

---

## Next-step options

- Spec the level generator (Hamiltonian path on grid → sprinkle waypoints → verify uniqueness)
- First-run onboarding flow
- Tech stack recommendation (Godot 4 vs Unity 2D vs Flutter+Flame vs React Native+Skia)
- Scaffold the project
