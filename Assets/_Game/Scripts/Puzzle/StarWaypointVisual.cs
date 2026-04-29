using UnityEngine;
using PrimeTween;

namespace ConstellationWeaver.Puzzle
{
    /// <summary>
    /// Story 2.5 — Controls the star twinkle animation on a waypoint star.
    /// Drives the StarGlow shader's _Intensity parameter.
    /// Attach to each spawned star prefab.
    /// </summary>
    [RequireComponent(typeof(SpriteRenderer))]
    public class StarWaypointVisual : MonoBehaviour
    {
        [Header("Twinkle Settings")]
        [SerializeField] private float _twinkleIntervalMin = 2.5f;
        [SerializeField] private float _twinkleIntervalMax = 5.0f;
        [SerializeField] private float _twinkleDuration = 0.35f;
        [SerializeField] private float _twinkleMinIntensity = 0.6f;
        [SerializeField] private float _twinkleMaxIntensity = 1.5f;

        [Header("Hit Animation")]
        [SerializeField] private float _hitPunchScale = 1.4f;
        [SerializeField] private float _hitPunchDuration = 0.18f;

        private SpriteRenderer _spriteRenderer;
        private Material _material;
        private static readonly int IntensityId = Shader.PropertyToID("_Intensity");

        // Separate fields for each tween type — Sequence != Tween in PrimeTween
        private Sequence _twinkleSequence;
        private Tween _scheduledTwinkle;
        private Tween _intensityFlare;

        private void Awake()
        {
            _spriteRenderer = GetComponent<SpriteRenderer>();
            // Instance material so each star tweens independently (no shared state)
            _material = _spriteRenderer.material;
        }

        private void Start()
        {
            ScheduleNextTwinkle();
        }

        private void OnDestroy()
        {
            _twinkleSequence.Stop();
            _scheduledTwinkle.Stop();
            _intensityFlare.Stop();
        }

        /// <summary>Call when the player's path reaches this waypoint.</summary>
        public void PlayHitAnimation()
        {
            _twinkleSequence.Stop();
            _scheduledTwinkle.Stop();

            // Punch scale up then back — fire and forget, no need to track
            Sequence.Create()
                .Chain(Tween.Scale(transform, endValue: Vector3.one * _hitPunchScale, duration: _hitPunchDuration * 0.5f))
                .Chain(Tween.Scale(transform, endValue: Vector3.one, duration: _hitPunchDuration * 0.5f));

            // Intensity flare — use Tween.Custom to drive the float shader property
            if (_material != null)
            {
                _intensityFlare.Stop();
                float startIntensity = _twinkleMaxIntensity;
                _material.SetFloat(IntensityId, startIntensity);

                _intensityFlare = Tween.Custom(
                    startValue: startIntensity,
                    endValue: 1.0f,
                    duration: _hitPunchDuration,
                    onValueChange: val => _material.SetFloat(IntensityId, val));

                _intensityFlare.OnComplete(() => ScheduleNextTwinkle());
            }
            else
            {
                ScheduleNextTwinkle();
            }
        }

        private void ScheduleNextTwinkle()
        {
            float delay = Random.Range(_twinkleIntervalMin, _twinkleIntervalMax);
            _scheduledTwinkle = Tween.Delay(delay, () =>
            {
                if (this == null) return; // Guard against destroyed object
                PlayTwinkle();
            });
        }

        private void PlayTwinkle()
        {
            if (_material == null) return;

            float targetIntensity = Random.Range(_twinkleMinIntensity, _twinkleMaxIntensity);
            float halfDur = _twinkleDuration * 0.5f;

            // Use Sequence so we can chain two Tween.Custom calls without type mismatch
            _twinkleSequence = Sequence.Create()
                .Chain(Tween.Custom(
                    startValue: 1.0f,
                    endValue: targetIntensity,
                    duration: halfDur,
                    onValueChange: val => _material.SetFloat(IntensityId, val)))
                .Chain(Tween.Custom(
                    startValue: targetIntensity,
                    endValue: 1.0f,
                    duration: halfDur,
                    onValueChange: val => _material.SetFloat(IntensityId, val)));

            _twinkleSequence.OnComplete(() => ScheduleNextTwinkle());
        }
    }
}
