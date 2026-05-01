using UnityEngine;
using NFramework;
using ConstellationWeaver.UI;

namespace ConstellationWeaver.UI
{
    /// <summary>
    /// Story 3.10 — Splash screen.
    ///
    /// Displays wordmark for 1.4 s then routes to Onboarding (first install)
    /// or Home (returning player). Animation is handled by Animator on this prefab.
    ///
    /// UILayer: AlwaysOnTop
    /// Prefab name: "SplashView"  (must match UIViewKeys.Splash)
    /// Resources path: Resources/UI/SplashView.prefab
    ///
    /// Attach to the SplashView prefab root.
    /// </summary>
    public class SplashView : UIView
    {
        // ── Tuning — all values come from Inspector so they can be tweaked without code ──
        [Header("Timing (seconds)")]
        [SerializeField] private float _displayDuration = 1.4f;

        private float _timer;
        private bool  _dismissed;

        public override void OnOpen(UIInputData inputData)
        {
            base.OnOpen(inputData);
            _timer     = 0f;
            _dismissed = false;
            Debug.Log("[SplashView] Opened.");
        }

        private void Update()
        {
            if (_dismissed) return;

            _timer += Time.unscaledDeltaTime; // Unscaled — works even if Time.scale = 0
            if (_timer >= _displayDuration)
                Dismiss();
        }

        private void Dismiss()
        {
            _dismissed = true;

            // TODO Sprint 3.9: check LocalSaveManager for hasCompletedOnboarding
            bool hasCompletedOnboarding = false; // Replace with save data read

            CloseSelf();

            if (hasCompletedOnboarding)
                UINavigator.ShowHome();
            else
                UINavigator.ShowOnboarding();
        }
    }
}
