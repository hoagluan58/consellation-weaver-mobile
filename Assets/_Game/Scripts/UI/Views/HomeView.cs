// Story 3.2 — Home screen: the main hub players see every session.
//
// UILayer: Menu
// Prefab name: "HomeView" (must match UIViewKeys.Home)
// Resources path: Resources/UI/HomeView.prefab
//
// Wiring: bind all [SerializeField] fields in the prefab Inspector.
// Implements GDD §6.2 three home states: fresh / with-streak / daily-solved.

using TMPro;
using UnityEngine;
using UnityEngine.UI;
using NFramework;
using ConstellationWeaver.Core;

namespace ConstellationWeaver.UI
{
    /// <summary>
    /// Home screen UIView.
    ///
    /// Displays:
    ///   - Status strip: streak display + settings button
    ///   - Hero card: today's daily puzzle (pulsing glow), or "solved" state
    ///   - Three list cards: Journey, Archive, Almanac
    ///
    /// All data read from GameSaveData and StreakManager on OnOpen.
    /// Button events route via UINavigator — no direct state ownership here.
    /// </summary>
    public class HomeView : UIView
    {
        // ── Status strip ─────────────────────────────────────────────────────
        [Header("Status Strip")]
        [SerializeField] private TMP_Text _streakLabel;       // e.g. "7 nights"
        [SerializeField] private Button   _settingsButton;

        // ── Hero daily card ──────────────────────────────────────────────────
        [Header("Hero Card")]
        [SerializeField] private Button   _dailyPlayButton;
        [SerializeField] private TMP_Text _dailyConstellationLabel; // Today's constellation name
        [SerializeField] private TMP_Text _dailyStatusLabel;        // "Tonight's puzzle" / "Solved ✓"
        [SerializeField] private GameObject _dailySolvedBadge;      // Badge overlay when already solved

        // ── List cards ───────────────────────────────────────────────────────
        [Header("List Cards")]
        [SerializeField] private Button _journeyButton;
        [SerializeField] private Button _archiveButton;
        [SerializeField] private Button _almanacButton;

        // ─── Open / Close ─────────────────────────────────────────────────────
        public override void OnOpen(UIInputData inputData)
        {
            base.OnOpen(inputData);
            RefreshUI();
            BindButtons();
        }

        public override UIOutputData OnClose()
        {
            UnbindButtons();
            return base.OnClose();
        }

        // ─── UI Refresh ───────────────────────────────────────────────────────
        private void RefreshUI()
        {
            RefreshStreak();
            RefreshHeroCard();
        }

        private void RefreshStreak()
        {
            if (_streakLabel == null) return;
            var text = StreakManager.I != null ? StreakManager.I.GetDisplayText() : "0 nights";
            _streakLabel.SetText(text);
        }

        private void RefreshHeroCard()
        {
            var daily = DailyPuzzleManager.I?.GetToday();
            if (daily == null) return;

            bool solved = GameSaveData.I?.IsLevelSolved(daily.Value.levelId) ?? false;

            if (_dailyConstellationLabel != null)
            {
                // Level ID format: "001_triangulum" → display "Triangulum"
                var levelId = daily.Value.levelId;
                var parts   = levelId.Split('_');
                var name    = parts.Length > 1 ? Capitalize(parts[1]) : levelId;
                _dailyConstellationLabel.SetText(name);
            }

            if (_dailyStatusLabel != null)
                _dailyStatusLabel.SetText(solved ? "Solved ✓" : "Tonight's puzzle");

            if (_dailySolvedBadge != null)
                _dailySolvedBadge.SetActive(solved);

            if (_dailyPlayButton != null)
                _dailyPlayButton.interactable = !solved;
        }

        // ─── Button wiring ────────────────────────────────────────────────────
        private void BindButtons()
        {
            _settingsButton?.onClick.AddListener(OnSettingsPressed);
            _dailyPlayButton?.onClick.AddListener(OnDailyPressed);
            _journeyButton?.onClick.AddListener(OnJourneyPressed);
            _archiveButton?.onClick.AddListener(OnArchivePressed);
            _almanacButton?.onClick.AddListener(OnAlmanacPressed);
        }

        private void UnbindButtons()
        {
            _settingsButton?.onClick.RemoveListener(OnSettingsPressed);
            _dailyPlayButton?.onClick.RemoveListener(OnDailyPressed);
            _journeyButton?.onClick.RemoveListener(OnJourneyPressed);
            _archiveButton?.onClick.RemoveListener(OnArchivePressed);
            _almanacButton?.onClick.RemoveListener(OnAlmanacPressed);
        }

        private void OnSettingsPressed() => UINavigator.ShowSettings();

        private void OnDailyPressed()
        {
            var daily = DailyPuzzleManager.I?.GetToday();
            if (daily == null || string.IsNullOrEmpty(daily.Value.levelId)) return;

            UINavigator.ShowPuzzle(new PuzzleInputData
            {
                levelId = daily.Value.levelId,
                source  = PuzzleInputData.PuzzleSource.Daily,
            });
        }

        private void OnJourneyPressed()  => UINavigator.ShowJourney();
        private void OnArchivePressed()  => UINavigator.ShowArchive();
        private void OnAlmanacPressed()  => UINavigator.ShowAlmanac();

        // ─── Helpers ──────────────────────────────────────────────────────────
        private static string Capitalize(string s) =>
            string.IsNullOrEmpty(s) ? s : char.ToUpperInvariant(s[0]) + s[1..];
    }
}
