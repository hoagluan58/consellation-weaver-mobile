/// <summary>
/// Story 2.10 — Font Setup Guide
///
/// THIS IS NOT A SCRIPT TO ADD TO A SCENE.
/// It is a reference guide for manually importing fonts into Unity.
///
/// STEPS TO COMPLETE STORY 2.10:
///
/// 1. Download fonts (free, SIL OFL licence):
///    - Fraunces:  https://fonts.google.com/specimen/Fraunces  (Variable + static TTFs)
///    - Inter:     https://fonts.google.com/specimen/Inter     (Variable + static TTFs)
///
/// 2. Import into Unity:
///    a. Create folders: Assets/_Game/Fonts/Fraunces/ and Assets/_Game/Fonts/Inter/
///    b. Drag the .ttf files for these weights into each folder:
///       Fraunces — Regular (400), SemiBold (600), Bold (700)
///       Inter    — Regular (400), Medium (500), SemiBold (600)
///
/// 3. Create TMP Font Assets for each weight:
///    a. Select a .ttf in the Project window
///    b. Window → TextMeshPro → Font Asset Creator
///    c. Settings:
///       - Sampling Point Size: 90  (high quality for mobile)
///       - Padding: 5
///       - Packing Method: Optimum
///       - Atlas Width/Height: 2048 × 2048
///       - Character Set: Extended ASCII  (add Latin Extended-A for accents)
///       - Render Mode: SDFAA
///    d. Click "Generate Font Atlas" → Save to same folder as the .ttf
///
/// 4. Create TMP Style Sheet (GDD §3.4 reference sizes):
///    Assets → Create → TextMeshPro → Style Sheet → name it "CW_TextStyles"
///    Each style has a Name, Opening Tags, and Closing Tags field.
///
///    Style Name          | Opening Tags                                    | Closing Tags
///    --------------------|--------------------------------------------------|----------------------
///    constellation_title | <font="Fraunces-Bold SDF"><size=34>             | </size></font>
///    lore_body           | <font="Inter-Regular SDF"><size=16>             | </size></font>
///    ui_label            | <font="Inter-Medium SDF"><size=14>              | </size></font>
///    ui_caption          | <font="Inter-Regular SDF"><size=12><alpha=#99>  | </alpha></size></font>
///    onboarding_heading  | <font="Fraunces-SemiBold SDF"><size=24>         | </size></font>
///
///    NOTE: Font names in the tags must match the exact filename of the TMP Font Asset
///    you generated in step 3 (e.g. "Fraunces-Bold SDF" if the asset is "Fraunces-Bold SDF.asset").
///    To use a style on a TMP component: set the Style field to the style name,
///    OR use rich text inline: <style="constellation_title">Orion</style>
///
/// 5. Set as TMP Default fonts:
///    Edit → Project Settings → TextMesh Pro
///    - Default Font Asset: Inter Regular SDF
///    - (Fraunces is applied per-component via style)
///
/// 6. Acceptance criteria (GDD §3.4):
///    ✅ Fraunces Bold 34pt renders at puzzle completion overlay
///    ✅ Inter 16pt renders for lore text
///    ✅ No fallback □ glyphs on any standard Latin character
///    ✅ Both fonts visible at 1080×2340 and 750×1334 resolutions
///
/// NOTE: TextMeshPro font assets (.asset files) must be committed to git.
///       The source .ttf files should also be committed — they are small.
/// </summary>
// ReSharper disable all — this file is documentation only, not compiled code
