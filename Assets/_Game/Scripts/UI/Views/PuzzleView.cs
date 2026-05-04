// Story 3.3 — Puzzle screen wrapper.
// Bridges UIManager with the PuzzleController + PuzzleRenderer subsystem.
//
// UILayer: Background
// Prefab name: "PuzzleView" (must match UIViewKeys.Puzzle)
// Resources path: Resources/UI/PuzzleView.prefab
//
// Receives PuzzleInputData, loads level data, wires events, returns PuzzleOutputData on close.

using System.Diagnostics;
using ConstellationWeaver.Core;
using ConstellationWeaver.Puzzle;
using NFramework;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace ConstellationWeaver.UI
{
    /// <summary>
    /// PuzzleView — the full-bleed puzzle screen.
    ///
    /// Responsibilities:
    ///   - Receive PuzzleInputData (levelId, source)
    ///   - Load level data from LevelRepository and pass to PuzzleController
    ///   - Show top bar (back button + hint button) and metadata line
    ///   - Listen to PuzzleController.OnPuzzleSolved → show completion overlay
    ///   - Return PuzzleOutputData (solved, timeSeconds, hintsUsed) on close
    ///
    /// Wiring: bind all [SerializeField] fields in the prefab Inspector.
    /// The PuzzleController / PuzzleRenderer should live as children of this prefab.
    /// </summary>
    public class PuzzleView : UIView
    {
        [Header("Top Bar")]
        [SerializeField] private Button _backButton;
        [SerializeField] private Button _hintButton;

        [Header("Metadata")]
        [SerializeField] private TMP_Text _constellationLabel;  // e.g. "Orion"
        [SerializeField] private TMP_Text _metaLabel;           // e.g. "Journey · 5×5"

        [Header("Puzzle Systems")]
        [SerializeField] private PuzzleController _puzzleController;
        [SerializeField] private PuzzleRenderer _puzzleRenderer;

        // ─── State ────────────────────────────────────────────────────────────
        private PuzzleInputData _inputData;
        private Data.LevelData _levelData;
        private Stopwatch _timer;
        private int _hintsUsed;

        // ─── Open / Close ─────────────────────────────────────────────────────
        public override void OnOpen(UIInputData inputData)
        {
            base.OnOpen(inputData);

            _inputData = inputData as PuzzleInputData;
            _timer = Stopwatch.StartNew();
            _hintsUsed = 0;

            if (_inputData == null || string.IsNullOrEmpty(_inputData.levelId))
            {
                UnityEngine.Debug.LogError("[PuzzleView] Missing PuzzleInputData or levelId.");
                CloseSelf();
                return;
            }

            _levelData = GameManager.Instance?.GetLevel(_inputData.levelId);
            if (_levelData == null)
            {
                UnityEngine.Debug.LogError($"[PuzzleView] Level not found: {_inputData.levelId}");
                CloseSelf();
                return;
            }

            LoadPuzzle();
            RefreshLabels();
            BindButtons();
        }

        public override UIOutputData OnClose()
        {
            _timer?.Stop();
            UnbindButtons();

            if (_puzzleController != null)
                _puzzleController.OnPuzzleSolved -= HandlePuzzleSolved;

            return new PuzzleOutputData
            {
                levelId = _inputData?.levelId ?? "",
                solved = false,
                solveTimeSeconds = (float)(_timer?.Elapsed.TotalSeconds ?? 0),
                hintsUsed = _hintsUsed,
            };
        }

        // ─── Internals ────────────────────────────────────────────────────────
        private void LoadPuzzle()
        {
            if (_puzzleController == null || _puzzleRenderer == null) return;

            _puzzleController.OnPuzzleSolved += HandlePuzzleSolved;
            _puzzleController.Initialize(_levelData);
            _puzzleRenderer.RenderLevel(_puzzleController.Grid);
        }

        private void RefreshLabels()
        {
            if (_levelData == null) return;

            if (_constellationLabel != null)
                _constellationLabel.SetText(_levelData.constellation);

            if (_metaLabel != null)
            {
                string source = _inputData?.source.ToString() ?? "";
                _metaLabel.SetText($"{source} · {_levelData.width}×{_levelData.height}");
            }
        }

        private void BindButtons()
        {
            _backButton?.onClick.AddListener(OnBackPressed);
            _hintButton?.onClick.AddListener(OnHintPressed);
        }

        private void UnbindButtons()
        {
            _backButton?.onClick.RemoveListener(OnBackPressed);
            _hintButton?.onClick.RemoveListener(OnHintPressed);
        }

        private void OnBackPressed()
        {
            _puzzleController?.AbortPuzzle();
            CloseSelf();
            UINavigator.ShowHome();
        }

        private void OnHintPressed()
        {
            UINavigator.ShowHintConfirm();
            // Actual hint reveal happens in HintConfirmView → calls back to PuzzleController
        }

        private void HandlePuzzleSolved()
        {
            _timer?.Stop();
            GameSaveData.I?.MarkLevelSolved(_inputData.levelId, _levelData?.constellation);

            // If this was the daily, record the solve for streak
            if (_inputData?.source == PuzzleInputData.PuzzleSource.Daily)
                StreakManager.I?.RecordDailySolve();

            UINavigator.ShowCompletionOverlay(new CompletionInputData
            {
                levelId = _inputData?.levelId ?? "",
                constellationName = _levelData?.constellation ?? "",
                loreLine = _levelData?.lore ?? "",
                wasDaily = _inputData?.source == PuzzleInputData.PuzzleSource.Daily,
            });
        }
    }
}
