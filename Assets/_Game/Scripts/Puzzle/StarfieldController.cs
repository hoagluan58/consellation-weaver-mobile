using UnityEngine;

namespace ConstellationWeaver.Puzzle
{
    /// <summary>
    /// Story 2.4 — Drives the StarfieldBackground shader's _Time2 property each frame.
    /// Attach to the full-screen quad or camera background object with the StarfieldBackground material.
    /// </summary>
    [RequireComponent(typeof(Renderer))]
    public class StarfieldController : MonoBehaviour
    {
        private Material _material;
        private static readonly int ElapsedTimeId = Shader.PropertyToID("_ElapsedTime");

        // Pre-allocate — zero hot-path allocations
        private float _elapsed = 0f;

        private void Awake()
        {
            _material = GetComponent<Renderer>().material;
        }

        private void OnDestroy()
        {
            if (_material != null)
                Destroy(_material);
        }

        private void Update()
        {
            _elapsed += Time.deltaTime;
            if (_material != null)
                _material.SetFloat(ElapsedTimeId, _elapsed);
        }
    }
}
