namespace ConstellationWeaver.UI
{
    /// <summary>
    /// Story 3.1 — All UIView prefab ID constants.
    ///
    /// Each constant matches the EXACT name of the prefab saved under Resources/UI/.
    /// UIManager uses these strings to load prefabs via Resources.Load.
    /// The UIView.key on each prefab is auto-set to gameObject.name in the Editor.
    ///
    /// Convention: constant name = PascalCase class name, value = same string.
    /// Keep in sync with the prefab filenames — a mismatch causes a silent load failure.
    ///
    /// Usage:
    ///   UIManager.OpenResources&lt;SplashView&gt;(UIViewKeys.Splash);
    ///   UIManager.Close(UIViewKeys.Splash);
    /// </summary>
    public static class UIViewKeys
    {
        // ── Always-on-top ────────────────────────────────────────────────────
        public const string Splash              = "SplashView";

        // ── Menu layer ───────────────────────────────────────────────────────
        public const string Onboarding          = "OnboardingView";
        public const string Home                = "HomeView";
        public const string Journey             = "JourneyView";
        public const string Archive             = "ArchiveView";
        public const string Almanac             = "AlmanacView";
        public const string Settings            = "SettingsView";
        public const string Credits             = "CreditsView";

        // ── Background layer ─────────────────────────────────────────────────
        public const string Puzzle              = "PuzzleView";

        // ── Popup layer ──────────────────────────────────────────────────────
        public const string CompletionOverlay   = "CompletionOverlayView";
        public const string HemispherePicker    = "HemispherePickerView";
        public const string HintConfirm         = "HintConfirmView";
        public const string NotificationOptIn   = "NotificationOptInView";
        public const string Starlight           = "StarlightView";
    }
}
