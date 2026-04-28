# Constellation Weaver — Unity Implementation Plan

**Version:** 1.0  
**Date:** 2026-04-28  
**Engine:** Unity 6 (URP 2D) — already scaffolded in the project  
**Framework:** NFramework (included as git submodule at `Assets/Nframework`)

---

## 1. NFramework Analysis

> [!TIP]
> **Verdict: USE IT.** NFramework is a mature, well-structured mobile game framework that directly covers 6 of the 7 infrastructure systems Constellation Weaver needs. It will save 2–3 weeks of boilerplate.

### 1.1 Module Assessment

| Module | Quality | Relevance to CW | Use? |
|--------|---------|-----------------|------|
| **UIManager** | ★★★★★ | Manages all screens (Home, Puzzle, Settings, etc.) via layered UI views with caching, open/close lifecycle, and interaction blocking | ✅ **Core** |
| **UIView** | ★★★★★ | Base class for every screen. Supports `UIInputData`/`UIOutputData` for passing data between screens | ✅ **Core** |
| **StateMachine** | ★★★★☆ | Drives puzzle input states (IDLE → DRAWING → VALIDATE → SOLVED) | ✅ **Core** |
| **SoundManager** | ★★★★★ | Pooled audio emitters, BGM/SFX separation, AudioMixer integration, save-aware volume. Directly maps to GDD §9 | ✅ **Core** |
| **LocalSaveManager** | ★★★★☆ | JSON save/load with backup, auto-save, ISaveable interface, WebGL PlayerPrefs fallback, XOR encryption | ✅ **Core** |
| **VibrationManager** | ★★★★☆ | Haptic types (Light, Medium, Success) with rest-time throttling via NiceVibrations. Maps to GDD §8.3 | ✅ **Core** |
| **Pool** | ★★★★☆ | Object pooling with auto-expand. Needed for path particle effects | ✅ **Supporting** |
| **SafeArea** | ★★★★★ | Handles notch/safe area for all UI. Critical for mobile | ✅ **Core** |
| **EventDispatcher** | ★★★☆☆ | Global string-keyed event bus. Useful for decoupled cross-system comms | ✅ **Supporting** |
| **ObservableValue** | ★★★★☆ | Reactive data binding. Good for streak counter, settings toggles | ✅ **Supporting** |
| **Extensions** | ★★★★★ | 28 extension classes (Transform, Vector, Color, String, etc.) — saves tons of utility code | ✅ **Supporting** |
| **Addressables** | ★★★★☆ | Async asset loading. May use for level data loading | ⚠️ **Optional** |
| **ConfigSO** | ★★★☆☆ | ScriptableObject config. Framework-level config | ✅ **Supporting** |

### 1.2 Dependencies to Install

NFramework references these packages (from the asmdef GUIDs + code imports):

| Dependency | Purpose | Status |
|-----------|---------|--------|
| **UniTask** (Cysharp) | Async/await without coroutines | Required — used heavily in UIManager, SoundManager |
| **PrimeTween** | High-perf tweening | Required — used in SoundManager for mixer fades |
| **Odin Inspector** (Sirenix) | Editor tooling, `[ShowInInspector]`, `[Button]` | Required — used across all modules |
| **Newtonsoft JSON** | JSON serialization for save system | Required — used in LocalSaveManager |
| **NiceVibrations** (MoreMountains) | Haptics | Optional — behind `#if MOREMOUNTAINS_NICEVIBRATIONS` |
| **DOTween** | Already in scripting defines | Already present — may use alongside PrimeTween |
| **TextMeshPro** | UI text | Already present |

### 1.3 What NFramework Does NOT Cover (Must Build)

| System | Description |
|--------|-------------|
| **Puzzle Logic** | Grid data model, Hamiltonian path validation, waypoint ordering |
| **Touch Input Handler** | Continuous drag path-building with backtrack (pop) support |
| **Path Rendering** | Gradient line renderer with particle head |
| **Star/Glow Shader** | Core visual for waypoint stars |
| **Level Loader** | JSON level parsing + level manifest management |
| **Daily Puzzle Rotation** | Date-based constellation assignment by hemisphere |
| **Streak System** | Streak counting with grace days |
| **Completion Sequence** | Multi-stage animation orchestration |

---

## 2. Architecture Overview

### 2.1 Scene Structure

```
Scenes/
├── Boot.unity          → Initializes managers, loads save, routes to Splash or Home
├── Game.unity          → Main scene — all UI and gameplay happens here
```

Single-scene architecture using NFramework's UIManager for screen transitions. No scene switching after boot.

### 2.2 Manager Hierarchy (DontDestroyOnLoad)

```
[Managers] (Boot scene, persists)
├── UIManager           → NFramework — manages all UI views
├── SoundManager        → NFramework — BGM/SFX pooled audio
├── LocalSaveManager    → NFramework — auto-save with backup
├── VibrationManager    → NFramework — haptics
├── GameManager         → NEW — game state, level loading, daily puzzle logic
├── AnalyticsManager    → NEW — event tracking (stub for now)
```

### 2.3 UIView Screen Map

Each screen from GDD §6 becomes a `UIView` prefab:

| Screen | UIView Class | UILayer | Notes |
|--------|-------------|---------|-------|
| Splash | `SplashView` | `AlwaysOnTop` | 1.4s wordmark animation, auto-dismiss |
| Onboarding 1–3 | `OnboardingInfoView` | `Menu` | Reusable with `UIInputData` for step index |
| Onboarding 4 | `OnboardingPuzzleView` | `Menu` | Contains embedded mini-puzzle |
| Home | `HomeView` | `Menu` | Hero daily card + Journey/Archive/Almanac cards |
| Puzzle | `PuzzleView` | `Background` | Full-bleed puzzle scene, lives under other UI |
| Completion Overlay | `CompletionOverlayView` | `Popup` | Non-blocking, tap-to-dismiss |
| Journey | `JourneyView` | `Menu` | Campaign chapter grid |
| Archive | `ArchiveView` | `Menu` | Last 30 daily puzzles |
| Almanac | `AlmanacView` | `Menu` | 88 constellation collection grid |
| Settings | `SettingsView` | `Menu` | Grouped settings list |
| Starlight IAP | `StarlightView` | `Popup` | Full-screen IAP pitch |
| Hemisphere Picker | `HemispherePickerView` | `Popup` | Modal bottom sheet |
| Hint Confirm | `HintConfirmView` | `Popup` | Modal bottom sheet |
| Notification Opt-in | `NotificationOptInView` | `Popup` | Modal bottom sheet |
| Credits | `CreditsView` | `Menu` | Scrolling credits |

### 2.4 Game State Machine

Using NFramework's `StateMachine` for the top-level game flow:

```
States:
  BOOT → SPLASH → ONBOARDING → HOME → PUZZLE → HOME (loop)
```

### 2.5 Puzzle State Machine

A second `StateMachine` instance for puzzle input (GDD §4.2):

```
States:
  IDLE ──(touch-down on star 1)──> DRAWING
  DRAWING ──(drag to adjacent)──> DRAWING [append]
  DRAWING ──(drag back)──> DRAWING [pop]
  DRAWING ──(lift)──> VALIDATING
  VALIDATING ──(pass)──> SOLVED
  VALIDATING ──(fail)──> IDLE [fade path]
```

---

## 3. Folder Structure

```
Assets/
├── Nframework/                          → Git submodule (untouched)
├── _Game/
│   ├── Animations/
│   │   ├── UI/                          → Screen transition anims
│   │   └── Puzzle/                      → Star twinkle, path pulse, completion
│   ├── Audio/
│   │   ├── BGM/                         → Ambient loop
│   │   ├── SFX/                         → Star-hit, completion chime, whoosh
│   │   └── SoundGroups/                 → SoundGroupSO assets
│   ├── Data/
│   │   ├── Levels/                      → JSON level files (copied from GDD/Levels)
│   │   ├── Constellations/              → 88 constellation metadata
│   │   └── Config/                      → GameConfigSO, DifficultyConfigSO
│   ├── Fonts/
│   │   ├── Fraunces/                    → Display serif
│   │   └── Inter/                       → UI sans
│   ├── Materials/
│   │   ├── StarCoreMat.mat
│   │   ├── StarGlowMat.mat
│   │   └── PathGradientMat.mat
│   ├── Prefabs/
│   │   ├── UI/                          → UIView prefabs (one per screen)
│   │   ├── Puzzle/
│   │   │   ├── StarWaypoint.prefab      → Numbered star with glow
│   │   │   ├── PathSegment.prefab       → Line segment between cells
│   │   │   └── ParticleHead.prefab      → Particle emitter at path head
│   │   └── Common/
│   │       └── Toast.prefab             → Bottom toast notification
│   ├── Scenes/
│   │   ├── Boot.unity
│   │   └── Game.unity
│   ├── Scripts/
│   │   ├── _Game.asmdef                 → References NFramework
│   │   ├── Core/
│   │   │   ├── GameManager.cs           → Game state, level loading
│   │   │   ├── LevelLoader.cs           → JSON parsing, level data model
│   │   │   ├── DailyPuzzleManager.cs    → Date-based rotation + hemisphere
│   │   │   ├── StreakManager.cs          → Streak logic + grace days
│   │   │   └── AnalyticsManager.cs      → Event tracking stub
│   │   ├── Puzzle/
│   │   │   ├── PuzzleController.cs      → Puzzle state machine + input
│   │   │   ├── GridModel.cs             → Grid data, cell states, adjacency
│   │   │   ├── PathModel.cs             → Current path, append/pop/validate
│   │   │   ├── PuzzleValidator.cs       → Win condition check (all 6 rules)
│   │   │   ├── PuzzleRenderer.cs        → Spawns stars, draws path, particles
│   │   │   └── TouchInputHandler.cs     → Touch/drag → grid cell mapping
│   │   ├── UI/
│   │   │   ├── Views/                   → One .cs per UIView class
│   │   │   ├── Components/              → Reusable UI components
│   │   │   │   ├── HeroCard.cs
│   │   │   │   ├── ListCard.cs
│   │   │   │   ├── LevelNode.cs
│   │   │   │   ├── AlmanacTile.cs
│   │   │   │   └── StreakDisplay.cs
│   │   │   └── Data/                    → UIInputData/UIOutputData subclasses
│   │   ├── Save/
│   │   │   ├── GameSaveData.cs          → ISaveable implementation
│   │   │   └── SaveKeys.cs              → Constants
│   │   └── Shaders/
│   │       ├── StarGlow.shader          → Core + outer glow
│   │       └── PathGradient.shader      → Cool-to-warm gradient stroke
│   └── Shaders/
│       ├── spatial_ui_star_glow.shadergraph
│       └── spatial_ui_path_gradient.shadergraph
├── Resources/
│   └── UI/                              → UIView prefabs loaded by UIManager
├── Plugins/                             → Third-party (UniTask, PrimeTween, etc.)
├── Settings/                            → URP settings
└── TextMesh Pro/                        → TMP essentials
```

---

## 4. Phased Implementation Plan

### Sprint 1 — Core Mechanic (Week 1)

> **Goal:** One puzzle solvable end-to-end on a physical device.

| # | Story | Priority | Est |
|---|-------|----------|-----|
| 1.1 | **Project Setup** — Configure Unity project settings (product name, orientation portrait, iOS 15+/Android 10+, URP 2D), install dependencies (UniTask, PrimeTween, Odin, Newtonsoft), set up assembly definitions | P0 | 0.5d |
| 1.2 | **Level Data Model** — Create `LevelData` class matching JSON schema, `LevelLoader` to parse level JSONs from `Resources/`, unit tests for deserialization | P0 | 0.5d |
| 1.3 | **Grid Model** — `GridModel` class: cell states, coordinate system (origin top-left), 4-connected adjacency queries, waypoint lookup. Pre-allocated arrays, zero hot-path allocs | P0 | 1d |
| 1.4 | **Path Model** — `PathModel` class: append cell (with adjacency + ordering validation), pop last cell (backtrack), query path state. Pre-allocated list | P0 | 0.5d |
| 1.5 | **Puzzle Validator** — Implements all 6 GDD rules: starts at WP1, ends at WPN, waypoints in order, all cells visited, orthogonal moves only, no revisits | P0 | 0.5d |
| 1.6 | **Touch Input Handler** — Converts touch position → grid coordinates, handles continuous drag, touch-down/drag/lift events, grid cell snapping | P0 | 1d |
| 1.7 | **Puzzle State Machine** — `PuzzleController` using NFramework `StateMachine`: IDLE/DRAWING/VALIDATING/SOLVED states with proper transitions and logging | P0 | 1d |
| 1.8 | **Basic Puzzle Renderer** — Spawn star GameObjects at waypoint positions, basic LineRenderer for path, cell highlighting on visit. Placeholder visuals | P0 | 1d |
| 1.9 | **Integration Test** — Wire everything together in Game scene, load `001_triangulum.json`, play through puzzle with touch input, verify win condition triggers | P0 | 0.5d |

**Sprint 1 Exit Criterion:** One puzzle solvable on a physical iOS device with touch input.

---

### Sprint 2 — Visual Polish + Content Pipeline (Week 2)

> **Goal:** Visually polished, 20 starter levels playable.

| # | Story | Priority | Est |
|---|-------|----------|-----|
| 2.1 | **Star Shader** — URP Shader Graph: bright core (`#FFF4D6`), outer glow (`#FFDB8E` at 40% alpha, radius 1.5×). Animatable intensity for twinkle | P0 | 1d |
| 2.2 | **Path Gradient Shader** — URP Shader Graph: cool white (`#B8D4FF`) at start → warm gold (`#F4E2A8`) at current head. 8pt stroke weight | P0 | 1d |
| 2.3 | **Particle Head** — Particle system on path head: 4–6 particles/frame, short lifetime, warm gold color, pooled via NFramework `Pool` | P0 | 0.5d |
| 2.4 | **Star-field Background** — Two-layer parallax star-field, deep navy `#050818`, 40fps drift ~2px/s, tileable texture | P0 | 0.5d |
| 2.5 | **Star Twinkle Animation** — Random waypoint twinkles every ~3s, subtle alpha pulse | P1 | 0.5d |
| 2.6 | **Sound Integration** — Set up `SoundManager` with AudioMixer (BGM/SFX groups), create `SoundGroupSO` assets, implement: ambient loop, star-hit ting (rising pitch per star), completion chime, menu whoosh | P0 | 1d |
| 2.7 | **Haptics Integration** — Wire `VibrationManager`: `impactLight` on star hit, `notificationSuccess` on completion, `selectionChanged` on button press | P0 | 0.5d |
| 2.8 | **Level Content Loading** — Load all 20 level JSONs from GDD, validate against schema, integrate into level selection flow | P0 | 0.5d |
| 2.9 | **Completion Animation** — Multi-stage sequence (800–1200ms): path pulse ×2, constellation name fade in (Fraunces 34pt), lore text fade in, gentle ±2° rotation | P0 | 1d |
| 2.10 | **Font Setup** — Import Fraunces + Inter via TMP, create TMP FontAssets with correct weights, set up text style presets matching GDD §3.4 | P0 | 0.5d |

**Sprint 2 Exit Criterion:** Visually polished puzzles, 20 levels playable with full audio/haptics/VFX.

---

### Sprint 3 — Meta Systems + All Screens (Week 3)

> **Goal:** Full gameplay loop from fresh install through 7-day play cycle.

| # | Story | Priority | Est |
|---|-------|----------|-----|
| 3.1 | **UIManager Setup** — Configure UIManager in Boot scene with layers (Background, Menu, Popup, Loading, AlwaysOnTop), set up Resources folder for UIView prefabs | P0 | 0.5d |
| 3.2 | **Home Screen** — `HomeView` with: status strip (streak + settings), hero daily card (pulsing glow), Journey/Archive/Almanac list cards. Three states: fresh/with-streak/daily-solved | P0 | 1.5d |
| 3.3 | **Puzzle Screen** — `PuzzleView` wrapping PuzzleController: top bar (back + hint), metadata line, zen grid layout. Proper SafeArea integration | P0 | 1d |
| 3.4 | **Journey Screen** — `JourneyView`: 6 chapter sections, 4×5 level node grids, locked/unlocked/solved/current states, chapter unlock threshold display | P1 | 1d |
| 3.5 | **Save System** — `GameSaveData : ISaveable` matching GDD §15.3 save shape: journey progress, solved levels, solved constellations, streak, grace days, settings, IAP status | P0 | 1d |
| 3.6 | **Daily Puzzle System** — `DailyPuzzleManager`: deterministic rotation by local date + hemisphere, 88-constellation cycle, returns today's level data | P0 | 0.5d |
| 3.7 | **Streak System** — `StreakManager`: count consecutive days, 3 grace days/month, streak display formatting ("12 nights, 1 grace day used") | P0 | 0.5d |
| 3.8 | **Settings Screen** — `SettingsView`: hemisphere picker, music/SFX sliders wired to SoundManager, haptics toggle wired to VibrationManager, notification toggle, Starlight/Restore/Credits/Privacy/Terms rows | P1 | 1d |
| 3.9 | **Onboarding Flow** — 4 screens: animated demos (trace, order, every-cell) + gated first puzzle. Skip support. Routes to Home on completion | P0 | 1d |
| 3.10 | **Splash Screen** — `SplashView`: wordmark + Ursa Minor glyph with connect stroke animation (600ms), 1.4s display, routes to Onboarding or Home | P0 | 0.5d |
| 3.11 | **Archive Screen** — `ArchiveView`: last 30 daily puzzles, constellation glyphs, solved status, lock for skipped pre-Starlight days | P1 | 0.5d |
| 3.12 | **Almanac Screen** — `AlmanacView`: 3-column grid of 88 constellation tiles, progress bar, detail bottom sheet on tap | P1 | 0.5d |

**Sprint 3 Exit Criterion:** Fresh install → onboarding → home → daily/journey → 7-day play loop all functional.

---

### Sprint 4 — Monetization, Polish, Store Prep (Week 4)

| # | Story | Priority | Est |
|---|-------|----------|-----|
| 4.1 | **Hint System** — Reveal next 2 steps of solution path. `HintConfirmView` modal with rewarded ad trigger (stub for now). Track hints_used | P1 | 0.5d |
| 4.2 | **Ad Integration (Stub)** — AdMob interface behind thin wrapper. Interstitial after every 4th Journey solve (configurable). Never after daily. Never during onboarding | P1 | 1d |
| 4.3 | **IAP Integration (Stub)** — Starlight Edition $3.99: remove ads, infinite archive, gold accent. `StarlightView` with feature list. Restore purchases | P1 | 1d |
| 4.4 | **Analytics Events** — Implement GDD §15.4 event set: session, level, daily, hint, IAP, ad, onboarding events. Stub backend | P2 | 0.5d |
| 4.5 | **Notification System** — `NotificationOptInView` at 2nd session. Schedule 8 PM local daily push: "Tonight's sky is waiting." | P2 | 0.5d |
| 4.6 | **Seasonal Palette Variants** — Chapter-based path gradient swaps: spring (mint), summer (gold), autumn (amber), winter (pale blue) | P1 | 0.5d |
| 4.7 | **Motion Polish Pass** — All transitions ease-out 240ms, screen transitions 320ms, button press scale 0.97 at 120ms, completion 800–1200ms multi-stage | P0 | 1d |
| 4.8 | **Accessibility** — Min 44pt tap targets, AA contrast compliance, VoiceOver labels, Reduce Motion support (disable parallax/twinkle, shorten transitions to 150ms) | P1 | 1d |
| 4.9 | **Performance Validation** — Profile on iPhone 12 + Pixel 6a: 60fps lock, memory budget, battery test. Fix any hot-path allocations | P0 | 0.5d |
| 4.10 | **Store Assets** — App icon (Ursa Minor glyph), 5 screenshots (1290×2796), store copy, privacy policy | P1 | 0.5d |
| 4.11 | **Build Pipeline** — iOS TestFlight + Android internal track builds, CI setup | P1 | 0.5d |
| 4.12 | **Toast System** — Bottom-anchored toasts for streak milestones ("Seven nights. A quiet habit."), hint confirmation, etc. Auto-dismiss 2.4s | P2 | 0.5d |

**Sprint 4 Exit Criterion:** Builds submitted to App Store Review and Play Store.

---

## 5. Key Technical Decisions

### 5.1 Rendering: UI Canvas vs SpriteRenderer for Puzzle

**Decision: Hybrid approach**
- **Puzzle grid, stars, path** → `SpriteRenderer` / custom rendering in a `Camera` that renders to a RenderTexture displayed on a `RawImage` in the UI canvas
- **All screens and overlays** → UI Canvas via NFramework `UIManager`
- **Rationale:** Shader effects (glow, gradient) work better with SpriteRenderer. The puzzle is always full-screen so no complex layering needed. UI stays in Canvas for SafeArea compliance.

**Alternative considered:** Pure UI Canvas with custom `Graphic` components. Rejected because shader effects are more limited in Canvas, and the GDD specifies shader-based glow which is easier with SpriteRenderer.

### 5.2 Level Data: Resources vs Addressables

**Decision: Resources folder for v1**
- 20 levels × ~700 bytes = negligible memory
- Full 120 levels + 88 constellations ≈ 200KB total
- Addressables add complexity without benefit at this scale
- **Migration path:** If content exceeds 500 levels, move to Addressables using NFramework's `AddressablesManager`

### 5.3 Touch Input: New Input System vs Legacy

**Decision: New Input System (already configured)**
- `InputSystem_Actions.inputactions` already exists in project
- Use `EnhancedTouch` API for continuous drag tracking
- Better support for simultaneous touch + mouse in editor testing

### 5.4 Tweening: PrimeTween (already required by NFramework)

- Use PrimeTween for all UI animations (it's already a dependency)
- Consistent API across framework and game code
- Zero-allocation hot path

---

## 6. NFramework Integration Patterns

### 6.1 Screen Navigation Pattern

```csharp
// Opening a screen with data
var inputData = new PuzzleInputData 
{ 
    levelId = "001_triangulum",
    source = PuzzleSource.Journey 
};
UIManager.OpenResources<PuzzleView>("PuzzleView", inputData);

// Closing and reading result
var outputData = UIManager.Close("PuzzleView") as PuzzleOutputData;
if (outputData?.solved == true)
    StreakManager.RecordSolve(outputData.levelId);
```

### 6.2 Save System Pattern

```csharp
public class GameSaveData : MonoBehaviour, ISaveable
{
    [Serializable]
    public class Data
    {
        public int schemaVersion = 1;
        public JourneyProgress journeyProgress;
        public List<string> solvedLevels = new();
        public List<string> solvedConstellations = new();
        public int dailyStreak;
        public int graceDaysUsedThisMonth;
        public string lastDailyDate;
        public SettingsData settings = new();
        public bool iapStarlight;
    }
    
    // ISaveable implementation...
}
```

### 6.3 Sound Pattern

```csharp
// Cache sound group at boot
await SoundManager.CacheSoundGroupResources("puzzle_sounds");

// Play star-hit with rising pitch
SoundManager.PlaySfx("star_hit", new SoundPlaySettings 
{ 
    overlapType = EAudioOverlapType.None 
});

// Play ambient BGM
SoundManager.PlayBgm("ambient_loop");
```

---

## 7. Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| NFramework GUID references break | Verify all asmdef GUIDs resolve on first project open; fix any missing references immediately |
| Odin Inspector license required | It's already in scripting defines for Standalone; ensure license covers iOS/Android builds |
| PrimeTween vs DOTween conflict | Both are present. Standardize on PrimeTween for new code. DOTween stays for any existing NFramework internals |
| Touch input feels laggy | Use `EnhancedTouch` at highest polling rate; process input in `Update`, not `FixedUpdate` |
| Path rendering performance on large grids | Pre-allocate `LineRenderer` points array; use `Pool` for particle effects; profile on min-spec device |

---

## 8. Immediate Next Steps

1. **Run `/setup-engine`** — Pin Unity version in project docs
2. **Install dependencies** — UniTask, PrimeTween, Odin, Newtonsoft JSON via Package Manager
3. **Fix project settings** — Rename from "flow-free-mobile" to "Constellation Weaver", set portrait orientation, configure iOS/Android build targets
4. **Start Sprint 1, Story 1.1** — Project setup

---

> [!IMPORTANT]
> The GDD originally specified **Godot 4.3** as the engine, but this project is already scaffolded as a **Unity 6 (URP 2D)** project with NFramework. This plan is written for Unity. All GDD references to Godot-specific features (GDScript, Godot plugins, scene tree) have been translated to Unity equivalents.

*End of implementation plan.*
