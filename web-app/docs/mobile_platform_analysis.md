# Constellation Weaver — Mobile App Strategy Analysis

## Current State Assessment

Your Unity project (Unity 6000.3.12f1) has:
- ✅ Project scaffolded with NFramework, dependencies configured
- ✅ Assembly definitions, folder structure set up
- ✅ 20 level JSON files with solutions
- ✅ Complete GDD + Design Brief with full UI specs
- ✅ Design handoff screens (HTML/JSX mockups)
- ⚠️ Gameplay scripts exist but implementation completeness is unclear
- ⚠️ Requires Unity Pro license for custom splash screen removal
- ⚠️ Unity mobile builds require Xcode (Mac) for iOS

---

## Three Approaches Compared

| Factor | **A. Continue Unity** | **B. Web App + Capacitor** | **C. React Native** |
|--------|----------------------|---------------------------|---------------------|
| **Time to App Store** | 3-4 weeks (need Mac + Xcode) | 1-2 weeks | 2-3 weeks |
| **Can build on Windows** | Android only; iOS needs Mac | ✅ Yes (Capacitor Cloud or CI) | ❌ iOS needs Mac |
| **Touch input quality** | ★★★★★ Native | ★★★★ Very good (canvas) | ★★★★ Good |
| **Visual fidelity (shaders, glow)** | ★★★★★ Full GPU shaders | ★★★★ Canvas + CSS (very close) | ★★★ Limited |
| **App size** | ~50-80 MB | ~5-10 MB | ~30-40 MB |
| **Monetization (AdMob, IAP)** | Native plugins | Capacitor plugins | React Native plugins |
| **Haptics** | NiceVibrations | Capacitor Haptics plugin | expo-haptics |
| **Reuses your level JSONs** | ✅ Directly | ✅ Directly | ✅ Directly |
| **Code reuse from Unity project** | ✅ Everything | ❌ Rewrite in JS/TS | ❌ Rewrite in JS/TS |
| **Cost** | Free (Personal) or $399/yr (Pro) | Free | Free |
| **Future: also ship on web** | Extra WebGL build work | ✅ Same codebase | Possible but complex |

---

## ⭐ Recommendation: **Option B — Web App + Capacitor**

### Why this is the best path for you:

1. **You're on Windows.** Building iOS with Unity requires a Mac. Capacitor can use cloud build services (Appflow, or GitHub Actions with a macOS runner) to generate the `.ipa` without owning a Mac.

2. **Fastest to ship.** The game is a 2D grid puzzle with touch input — no 3D physics, no complex rendering. HTML5 Canvas + CSS handles this beautifully. Your GDD's visual spec (glow effects, gradients, particles) maps perfectly to canvas rendering.

3. **Tiny app size.** ~5-10 MB vs 50+ MB for Unity. This matters for App Store conversion rates.

4. **Web + Mobile from one codebase.** You could also host a web version (like LinkedIn's Zip) alongside the native app.

5. **Your design handoff is already in HTML/JSX.** The design-handoff folder contains full screen implementations in JSX/HTML — these become direct implementation references.

6. **All 20 level JSONs transfer directly.** No conversion needed.

### Tech Stack

```
HTML5 Canvas (puzzle rendering)
+ Vanilla CSS (UI, screens, transitions)  
+ Vanilla JavaScript (game logic, state management)
+ Capacitor (native iOS/Android wrapper)
+ Capacitor plugins: Haptics, AdMob, In-App Purchases, Local Notifications
```

### Why NOT a JS framework?
- The game is a single-page app with screen transitions
- No complex routing or state management needed
- Vanilla JS keeps the bundle tiny and fast
- Fewer dependencies = fewer things to break

---

## Implementation Plan

### Phase 1 — Core Puzzle Engine (Day 1-2)
- [ ] Set up project structure (HTML + CSS + JS)
- [ ] Implement canvas-based puzzle renderer (stars, grid, path)
- [ ] Star glow effect (radial gradients + compositing)
- [ ] Path gradient rendering (cool→warm)
- [ ] Particle head effect (canvas particles)
- [ ] Touch input handler (drag path building with backtrack)
- [ ] Grid model + path model + puzzle validator
- [ ] Level loader (JSON parsing)
- [ ] Wire up: load level → touch → draw → validate → solved

### Phase 2 — Visual Polish + Screens (Day 3-5)
- [ ] Star-field parallax background (two-layer, CSS animated)
- [ ] Star twinkle animation
- [ ] Completion animation sequence (path pulse, name fade, lore)
- [ ] Home screen (hero daily card, journey/archive/almanac cards)
- [ ] Puzzle screen (full-bleed, top bar with back/hint)
- [ ] Screen transition system (fade/slide, 320ms ease-out)
- [ ] Typography setup (Fraunces + Inter from Google Fonts)
- [ ] Full color palette implementation

### Phase 3 — Meta Systems (Day 6-8)
- [ ] Save/load system (localStorage, matching GDD schema)
- [ ] Daily puzzle rotation (deterministic by date + hemisphere)
- [ ] Streak system with grace days
- [ ] Journey screen (campaign chapters, level nodes)
- [ ] Settings screen (hemisphere, audio, haptics toggles)
- [ ] Onboarding flow (4 screens + gated first puzzle)
- [ ] Splash screen with Ursa Minor animation
- [ ] Archive + Almanac screens

### Phase 4 — Capacitor + Native (Day 9-10)
- [ ] Initialize Capacitor project
- [ ] Configure iOS + Android platforms
- [ ] Integrate Haptics plugin
- [ ] Integrate AdMob plugin (interstitial + rewarded)
- [ ] Integrate In-App Purchases plugin (Starlight Edition)
- [ ] Local notifications (8 PM reminder)
- [ ] Safe area handling via Capacitor
- [ ] App icon + splash screen assets

### Phase 5 — Polish + Store Submission (Day 11-14)
- [ ] Performance optimization (60fps on iPhone 12 / Pixel 6a)
- [ ] Accessibility pass (44pt tap targets, contrast, VoiceOver)
- [ ] Audio integration (ambient loop, star-hit SFX, completion chime)
- [ ] Store screenshots, description, privacy policy
- [ ] TestFlight / Play Store internal track builds
- [ ] Bug bash + final polish

---

## Key Technical Details

### Canvas Rendering for Puzzle
```
- Stars: radial gradient circles with composite glow
- Path: series of line segments with gradient stroke
- Particles: small circles with short lifetime, pooled
- Grid: invisible cells, fill on visit with soft luminous disc
- All rendering in requestAnimationFrame at 60fps
```

### Capacitor Native Bridge
```
- Wraps the web app in a native WebView (WKWebView on iOS)
- Provides native APIs: Haptics, Camera, Storage, etc.
- App Store approved — many published apps use this
- Cloud build for iOS without owning a Mac
```

> [!IMPORTANT]
> You will still need an **Apple Developer Account** ($99/year) to publish to the App Store, regardless of which approach you choose. You'll also need a **Google Play Developer Account** ($25 one-time) for Android.

---

## Decision Needed

**Do you want to proceed with Option B (Web + Capacitor)?**

If yes, I'll start building the complete game as a web application right here, with all the visual polish from your GDD, and then wrap it with Capacitor for native deployment.

If you'd prefer to continue with Unity instead, note that you'll need access to a Mac for iOS builds.
