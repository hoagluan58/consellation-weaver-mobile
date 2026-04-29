using UnityEngine;
using NFramework;

namespace ConstellationWeaver.Puzzle
{
    /// <summary>
    /// Story 2.3 — Manages the particle emitter at the path head.
    /// Pooled via NFramework Pool. Follows the path head world position every frame.
    /// </summary>
    public class PathHeadParticle : MonoBehaviour
    {
        [SerializeField] private ParticleSystem _particles;
        [SerializeField] private PuzzleController _controller;
        [SerializeField] private PuzzleRenderer _renderer;

        private bool _isActive = false;

        private void Awake()
        {
            if (_controller != null)
            {
                _controller.OnPathCleared += HandlePathCleared;
                _controller.OnPuzzleSolved += HandlePathCleared;
            }
        }

        private void OnDestroy()
        {
            if (_controller != null)
            {
                _controller.OnPathCleared -= HandlePathCleared;
                _controller.OnPuzzleSolved -= HandlePathCleared;
            }
        }

        private void Update()
        {
            if (_controller == null || _renderer == null) return;
            if (_controller.CurrentStateId != PuzzleController.STATE_DRAWING) return;

            var path = _controller.Path.Path;
            if (path.Count == 0) return;

            Vector3 headWorldPos = _renderer.GetWorldPosition(path[path.Count - 1]);
            transform.position = headWorldPos;

            if (!_isActive)
            {
                _isActive = true;
                if (_particles != null && !_particles.isPlaying)
                    _particles.Play();
            }
        }

        private void HandlePathCleared()
        {
            _isActive = false;
            if (_particles != null && _particles.isPlaying)
                _particles.Stop(true, ParticleSystemStopBehavior.StopEmittingAndClear);
        }
    }
}
