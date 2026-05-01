// Story 3.9 — Onboarding flow controller.
// 4-step onboarding: 3 info slides + 1 gated mini-puzzle.
// First launch only — skipped for returning players.
//
// UILayer: Menu
// Prefab name: "OnboardingView" (must match UIViewKeys.Onboarding)
// Resources path: Resources/UI/OnboardingView.prefab
//
// Attach to OnboardingView prefab root.

using UnityEngine;
using UnityEngine.UI;
using NFramework;
using ConstellationWeaver.Core;

namespace ConstellationWeaver.UI
{
    /// <summary>
    /// Controls the 4-step onboarding sequence.
    ///
    /// Steps:
    ///   0 — Trace a path (animated demo)
    ///   1 — Follow the order (waypoint order demo)
    ///   2 — Visit every star (all-cells rule)
    ///   3 — Gated mini-puzzle (must solve to proceed)
    ///
    /// Wiring: assign _stepPanels (one GameObject per step), _nextButton, _skipButton.
    /// Step 3 panel should contain a fully wired PuzzleController for level "001_triangulum".
    /// </summary>
    public class OnboardingView : UIView
    {
        [Header("Step Panels (0-indexed, 4 total)")]
        [SerializeField] private GameObject[] _stepPanels;

        [Header("Navigation")]
        [SerializeField] private Button _nextButton;
        [SerializeField] private Button _skipButton;      // Hidden on step 3 (gated)
        [SerializeField] private Button _backButton;

        [Header("Step 3 — Mini Puzzle")]
        [SerializeField] private PuzzleController _miniPuzzleController; // Puzzle embedded in step 3 panel

        private int _currentStep = 0;
        private const int TOTAL_STEPS = 4;
        private const int GATED_STEP  = 3;

        public override void OnOpen(UIInputData inputData)
        {
            base.OnOpen(inputData);
            _currentStep = 0;
            ShowStep(0);

            _nextButton.onClick.AddListener(OnNextPressed);
            _skipButton.onClick.AddListener(OnSkipPressed);
            _backButton.onClick.AddListener(OnBackPressed);

            if (_miniPuzzleController != null)
                _miniPuzzleController.OnPuzzleSolved += OnMiniPuzzleSolved;
        }

        public override UIOutputData OnClose()
        {
            _nextButton.onClick.RemoveListener(OnNextPressed);
            _skipButton.onClick.RemoveListener(OnSkipPressed);
            _backButton.onClick.RemoveListener(OnBackPressed);

            if (_miniPuzzleController != null)
                _miniPuzzleController.OnPuzzleSolved -= OnMiniPuzzleSolved;

            return base.OnClose();
        }

        // ─── Button handlers ──────────────────────────────────────────────────

        private void OnNextPressed()
        {
            if (_currentStep >= TOTAL_STEPS - 1) return; // Next disabled on gated step
            AdvanceTo(_currentStep + 1);
        }

        private void OnBackPressed()
        {
            if (_currentStep <= 0) return;
            AdvanceTo(_currentStep - 1);
        }

        private void OnSkipPressed() => CompleteOnboarding();

        private void OnMiniPuzzleSolved() => CompleteOnboarding();

        // ─── Step navigation ──────────────────────────────────────────────────

        private void AdvanceTo(int step)
        {
            _currentStep = step;
            ShowStep(step);
        }

        private void ShowStep(int step)
        {
            for (int i = 0; i < _stepPanels.Length; i++)
                _stepPanels[i].SetActive(i == step);

            bool isGated = (step == GATED_STEP);
            _nextButton.gameObject.SetActive(!isGated);
            _skipButton.gameObject.SetActive(!isGated);
            _backButton.gameObject.SetActive(step > 0 && !isGated);
        }

        // ─── Completion ───────────────────────────────────────────────────────

        private void CompleteOnboarding()
        {
            GameSaveData.I?.CompleteOnboarding();
            CloseSelf();
            UINavigator.ShowHome();
        }
    }
}
