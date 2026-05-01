// Story 3.8 — Settings screen.
//
// UILayer: Menu
// Prefab name: "SettingsView" (must match UIViewKeys.Settings)
// Resources path: Resources/UI/SettingsView.prefab
//
// Wiring: bind all [SerializeField] fields in the prefab Inspector.

using TMPro;
using UnityEngine;
using UnityEngine.UI;
using NFramework;
using ConstellationWeaver.Core;

namespace ConstellationWeaver.UI
{
    /// <summary>
    /// Settings screen.
    ///
    /// Sections (GDD §6.8):
    ///   - Hemisphere picker button
    ///   - Music toggle (wired to SoundManager)
    ///   - SFX toggle (wired to SoundManager)
    ///   - Haptics toggle (wired to VibrationManager)
    ///   - Starlight / Restore Purchases buttons
    ///   - Credits / Privacy / Terms links
    ///
    /// All values are read from GameSaveData on open and written back immediately on change.
    /// </summary>
    public class SettingsView : UIView
    {
        [Header("Navigation")]
        [SerializeField] private Button _backButton;

        [Header("Hemisphere")]
        [SerializeField] private Button   _hemisphereButton;
        [SerializeField] private TMP_Text _hemisphereLabel;   // "Northern" / "Southern"

        [Header("Audio")]
        [SerializeField] private Toggle _musicToggle;
        [SerializeField] private Toggle _sfxToggle;

        [Header("Haptics")]
        [SerializeField] private Toggle _hapticsToggle;

        [Header("IAP")]
        [SerializeField] private Button _starlightButton;
        [SerializeField] private Button _restoreButton;

        [Header("Links")]
        [SerializeField] private Button _creditsButton;

        // ─── Open / Close ─────────────────────────────────────────────────────
        public override void OnOpen(UIInputData inputData)
        {
            base.OnOpen(inputData);
            PopulateFromSaveData();
            BindControls();
        }

        public override UIOutputData OnClose()
        {
            UnbindControls();
            return base.OnClose();
        }

        // ─── Populate ─────────────────────────────────────────────────────────
        private void PopulateFromSaveData()
        {
            var save = GameSaveData.I;
            if (save == null) return;

            if (_hemisphereLabel != null)
            {
                bool isNorth = string.Equals(save.Hemisphere, "north",
                                             System.StringComparison.OrdinalIgnoreCase);
                _hemisphereLabel.SetText(isNorth ? "Northern" : "Southern");
            }

            SetToggleSilently(_musicToggle,   save.HasCompletedOnboarding ? SoundManager.BgmStatus : true);
            SetToggleSilently(_sfxToggle,     save.HasCompletedOnboarding ? SoundManager.SfxStatus : true);
            SetToggleSilently(_hapticsToggle, true); // VibrationManager has no status API — use save
        }

        // ─── Bind / Unbind ────────────────────────────────────────────────────
        private void BindControls()
        {
            _backButton?.onClick.AddListener(OnBackPressed);
            _hemisphereButton?.onClick.AddListener(OnHemispherePressed);
            _starlightButton?.onClick.AddListener(OnStarlightPressed);
            _restoreButton?.onClick.AddListener(OnRestorePressed);
            _creditsButton?.onClick.AddListener(OnCreditsPressed);

            if (_musicToggle)   _musicToggle.onValueChanged.AddListener(OnMusicChanged);
            if (_sfxToggle)     _sfxToggle.onValueChanged.AddListener(OnSfxChanged);
            if (_hapticsToggle) _hapticsToggle.onValueChanged.AddListener(OnHapticsChanged);
        }

        private void UnbindControls()
        {
            _backButton?.onClick.RemoveListener(OnBackPressed);
            _hemisphereButton?.onClick.RemoveListener(OnHemispherePressed);
            _starlightButton?.onClick.RemoveListener(OnStarlightPressed);
            _restoreButton?.onClick.RemoveListener(OnRestorePressed);
            _creditsButton?.onClick.RemoveListener(OnCreditsPressed);

            if (_musicToggle)   _musicToggle.onValueChanged.RemoveListener(OnMusicChanged);
            if (_sfxToggle)     _sfxToggle.onValueChanged.RemoveListener(OnSfxChanged);
            if (_hapticsToggle) _hapticsToggle.onValueChanged.RemoveListener(OnHapticsChanged);
        }

        // ─── Handlers ─────────────────────────────────────────────────────────
        private void OnBackPressed()  => CloseSelf();

        private void OnHemispherePressed() => UINavigator.ShowHemispherePicker();

        private void OnMusicChanged(bool value)
        {
            SoundManager.BgmStatus = value;
            GameSaveData.I?.SetBgmEnabled(value);
        }

        private void OnSfxChanged(bool value)
        {
            SoundManager.SfxStatus = value;
            GameSaveData.I?.SetSfxEnabled(value);
        }

        private void OnHapticsChanged(bool value)
        {
            VibrationManager.I.CanVibrate = value;
            GameSaveData.I?.SetHapticsEnabled(value);
        }

        private void OnStarlightPressed() => UINavigator.ShowStarlight();

        private void OnRestorePressed()
        {
            // Sprint 4: wire IAP restore
            Debug.Log("[SettingsView] Restore purchases — stub.");
        }

        private void OnCreditsPressed() => UIManager.OpenResources(UIViewKeys.Credits);

        // ─── Helpers ──────────────────────────────────────────────────────────
        /// <summary>Set toggle value without triggering onValueChanged listeners.</summary>
        private static void SetToggleSilently(Toggle toggle, bool value)
        {
            if (toggle == null) return;
            toggle.SetIsOnWithoutNotify(value);
        }
    }
}
