using UnityEngine;
using UnityEngine.UI;
using TMPro;
using PrimeTween;
using Cysharp.Threading.Tasks;
using ConstellationWeaver.Data;
using ConstellationWeaver.Core;
using NFramework;

namespace ConstellationWeaver.Puzzle
{
    /// <summary>
    /// Story 2.9 — Multi-stage completion animation sequence.
    /// Attach to the Completion Overlay. Listens to PuzzleController.OnPuzzleSolved.
    /// Sequence: 
    ///   0ms   — Path pulse x2 (LineRenderer scale flare via material)
    ///   400ms — Constellation name fades in (Fraunces 34pt)
    ///   700ms — Lore text fades in
    ///   900ms — Gentle rotation of the constellation glyph (+/-2 degrees)
    /// </summary>
    public class CompletionOverlay : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private PuzzleController _controller;
        [SerializeField] private PuzzleRenderer   _renderer;
        [SerializeField] private CanvasGroup      _overlayCanvasGroup;

        [Header("Name + Lore")]
        [SerializeField] private TextMeshProUGUI _constellationNameText;
        [SerializeField] private TextMeshProUGUI _loreText;

        [Header("Glyph")]
        [SerializeField] private RectTransform   _glyphTransform;

        [Header("Timing (seconds)")]
        [SerializeField] private float _pathPulseDuration   = 0.18f;
        [SerializeField] private float _nameDelay           = 0.40f;
        [SerializeField] private float _loreDelay           = 0.70f;
        [SerializeField] private float _rotationDelay       = 0.90f;
        [SerializeField] private float _fadeDuration        = 0.35f;
        [SerializeField] private float _glyphRotationAngle  = 2.0f;
        [SerializeField] private float _glyphRotationDuration = 1.2f;

        private LevelData _currentLevel;
        private Sequence  _completionSequence;

        private void Awake()
        {
            if (_overlayCanvasGroup != null)
            {
                _overlayCanvasGroup.alpha = 0f;
                _overlayCanvasGroup.interactable = false;
                _overlayCanvasGroup.blocksRaycasts = false;
            }

            if (_controller != null)
                _controller.OnPuzzleSolved += HandlePuzzleSolved;
        }

        private void OnDestroy()
        {
            if (_controller != null)
                _controller.OnPuzzleSolved -= HandlePuzzleSolved;

            _completionSequence.Stop();
        }

        public void SetLevel(LevelData level)
        {
            _currentLevel = level;
        }

        private void HandlePuzzleSolved()
        {
            PlayCompletionSequence().Forget();
        }

        private async UniTaskVoid PlayCompletionSequence()
        {
            _completionSequence.Stop();

            // Pre-set text content before fade-in
            if (_currentLevel != null)
            {
                if (_constellationNameText != null)
                {
                    _constellationNameText.text = _currentLevel.constellation;
                    _constellationNameText.alpha = 0f;
                }
                if (_loreText != null)
                {
                    _loreText.text = _currentLevel.lore;
                    _loreText.alpha = 0f;
                }
            }

            // Stage 1: Path pulse x2 via LineRenderer width flare
            if (_renderer != null)
            {
                await PulsePathAsync();
                await PulsePathAsync();
            }

            // Stage 2: Show overlay background
            if (_overlayCanvasGroup != null)
            {
                _overlayCanvasGroup.interactable = true;
                _overlayCanvasGroup.blocksRaycasts = true;
                await Tween.Custom(
                    startValue: 0f,
                    endValue: 1f,
                    duration: _fadeDuration,
                    onValueChange: v => _overlayCanvasGroup.alpha = v).ToUniTask();
            }

            // Stage 3: Constellation name fade in
            await UniTask.Delay((int)(_nameDelay * 1000));
            if (_constellationNameText != null)
            {
                await Tween.Custom(
                    startValue: 0f,
                    endValue: 1f,
                    duration: _fadeDuration,
                    onValueChange: v => _constellationNameText.alpha = v).ToUniTask();
            }

            // Stage 4: Lore text fade in
            await UniTask.Delay((int)((_loreDelay - _nameDelay) * 1000));
            if (_loreText != null)
            {
                await Tween.Custom(
                    startValue: 0f,
                    endValue: 1f,
                    duration: _fadeDuration,
                    onValueChange: v => _loreText.alpha = v).ToUniTask();
            }

            // Stage 5: Gentle looping rotation on glyph
            await UniTask.Delay((int)((_rotationDelay - _loreDelay) * 1000));
            if (_glyphTransform != null)
            {
                // Loop: +angle -> -angle -> +angle (gentle oscillation)
                Tween.LocalRotation(
                    _glyphTransform,
                    endValue: Quaternion.Euler(0, 0, _glyphRotationAngle),
                    duration: _glyphRotationDuration,
                    cycles: -1, // infinite
                    cycleMode: CycleMode.Yoyo);
            }
        }

        private async UniTask PulsePathAsync()
        {
            // Flash path brighter and back using material property (drives _Alpha on PathGradient shader)
            // PuzzleRenderer exposes the LineRenderer — set width for pulse effect
            // A simple scale pulse on the PuzzleRenderer transform achieves this
            await Tween.Scale(
                _renderer.transform,
                endValue: Vector3.one * 1.08f,
                duration: _pathPulseDuration * 0.5f).ToUniTask();
            await Tween.Scale(
                _renderer.transform,
                endValue: Vector3.one,
                duration: _pathPulseDuration * 0.5f).ToUniTask();
        }

        /// <summary>Called by tap anywhere on overlay to dismiss.</summary>
        public void Dismiss()
        {
            _completionSequence.Stop();
            if (_glyphTransform != null)
                Tween.StopAll(_glyphTransform);

            Tween.Custom(
                startValue: 1f,
                endValue: 0f,
                duration: 0.25f,
                onValueChange: v =>
                {
                    if (_overlayCanvasGroup != null) _overlayCanvasGroup.alpha = v;
                }).OnComplete(() =>
            {
                if (_overlayCanvasGroup != null)
                {
                    _overlayCanvasGroup.interactable = false;
                    _overlayCanvasGroup.blocksRaycasts = false;
                }
            });
        }
    }
}
