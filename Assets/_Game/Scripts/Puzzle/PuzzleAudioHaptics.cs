using UnityEngine;
using Cysharp.Threading.Tasks;
using NFramework;
using ConstellationWeaver.Core;

namespace ConstellationWeaver.Puzzle
{
    /// <summary>
    /// Story 2.6 + 2.7 — Listens to PuzzleController events and triggers sounds + haptics.
    /// Decoupled from PuzzleController via events (UI Code Rule: no direct state ownership).
    /// </summary>
    public class PuzzleAudioHaptics : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private PuzzleController _controller;

        // Rising pitch per waypoint hit: 1.0, 1.1, 1.2 ... capped at 1.5
        private const float PitchStep = 0.1f;
        private const float PitchBase = 1.0f;
        private const float PitchMax  = 1.5f;
        private int _waypointHitCount = 0;

        private void Awake()
        {
            if (_controller == null) return;
            _controller.OnPathAppended  += HandlePathAppended;
            _controller.OnPathPopped    += HandlePathPopped;
            _controller.OnPathCleared   += HandlePathCleared;
            _controller.OnPuzzleSolved  += HandlePuzzleSolved;
        }

        private void OnDestroy()
        {
            if (_controller == null) return;
            _controller.OnPathAppended  -= HandlePathAppended;
            _controller.OnPathPopped    -= HandlePathPopped;
            _controller.OnPathCleared   -= HandlePathCleared;
            _controller.OnPuzzleSolved  -= HandlePuzzleSolved;
        }

        private void Start()
        {
            PreloadSoundsAsync().Forget();
            SoundManager.PlayBgm(SoundKeys.BGM_AMBIENT);
        }

        private void OnDisable()
        {
            SoundManager.StopBGM();
        }

        private async UniTaskVoid PreloadSoundsAsync()
        {
            // Load the puzzle SoundGroupSO — stored at Resources/Audio/sound_puzzle
            await SoundManager.CacheSoundGroupResources("Audio/sound_puzzle");
            await SoundManager.CacheSoundGroupResources("Audio/sound_ui");
        }

        private void HandlePathAppended(Vector2Int cell)
        {
            bool isWaypoint = _controller.Grid.GetWaypointAt(cell) != null;

            if (isWaypoint)
            {
                // Rising pitch per waypoint
                float pitch = Mathf.Min(PitchBase + _waypointHitCount * PitchStep, PitchMax);
                var settings = new SoundPlaySettings { pitch = pitch };
                SoundManager.PlaySfx(SoundKeys.SFX_STAR_HIT, settings);

                VibrationManager.I.Haptic(VibrationManager.HapticType.LightImpact);
                _waypointHitCount++;
            }
            else
            {
                SoundManager.PlaySfx(SoundKeys.SFX_PATH_TICK);
            }
        }

        private void HandlePathPopped(Vector2Int cell)
        {
            SoundManager.PlaySfx(SoundKeys.SFX_PATH_POP);
        }

        private void HandlePathCleared()
        {
            _waypointHitCount = 0;
        }

        private void HandlePuzzleSolved()
        {
            SoundManager.PlaySfx(SoundKeys.SFX_COMPLETE);
            VibrationManager.I.Haptic(VibrationManager.HapticType.Success);
            _waypointHitCount = 0;
        }
    }
}
