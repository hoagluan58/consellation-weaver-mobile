using UnityEngine;

namespace ConstellationWeaver.Puzzle
{
    /// <summary>
    /// Story 1.8 / 2.8 — Auto-wires LineRenderer components so the scene doesn't need
    /// manual Inspector assignments for path rendering.
    ///
    /// Place this on the same GameObject as PuzzleRenderer.
    /// It creates the two LineRenderer child objects at runtime if they are not already
    /// assigned, guaranteeing the path always draws.
    ///
    /// Debug tip: enable Gizmos → both line renderers will be visible as coloured lines.
    /// </summary>
    [RequireComponent(typeof(PuzzleRenderer))]
    public class PuzzleLineSetup : MonoBehaviour
    {
        [Header("Path Line — confirmed path (gradient material)")]
        [SerializeField] private Material _pathMaterial;
        [SerializeField] private float    _pathWidth = 0.12f;

        [Header("Preview Line — finger-to-grid preview (dashed/dim material)")]
        [SerializeField] private Material _previewMaterial;
        [SerializeField] private float    _previewWidth = 0.08f;

        private void Awake()
        {
            var renderer = GetComponent<PuzzleRenderer>();

            // ── Confirmed Path LineRenderer ──────────────────────────────────
            var pathLR = GetOrCreateLineRenderer("PathLine", _pathMaterial, _pathWidth,
                                                  new Color(0.72f, 0.83f, 1f));      // #B8D4FF cool-white
            renderer.SetPathLineRenderer(pathLR);

            // ── Preview LineRenderer ─────────────────────────────────────────
            var previewLR = GetOrCreateLineRenderer("PreviewLine", _previewMaterial, _previewWidth,
                                                     new Color(0.96f, 0.89f, 0.66f, 0.4f)); // #F4E2A8 dim gold
            renderer.SetPreviewLineRenderer(previewLR);
        }

        // ─── Helpers ─────────────────────────────────────────────────────────

        private LineRenderer GetOrCreateLineRenderer(string childName, Material mat,
                                                      float width, Color fallbackColor)
        {
            // Re-use existing child if already set up in a previous session
            var existing = transform.Find(childName);
            if (existing != null)
            {
                var lr = existing.GetComponent<LineRenderer>();
                if (lr != null) return lr;
            }

            // Create fresh child
            var go = new GameObject(childName);
            go.transform.SetParent(transform, worldPositionStays: false);

            var lineRenderer = go.AddComponent<LineRenderer>();
            lineRenderer.useWorldSpace   = true;
            lineRenderer.positionCount   = 0;
            lineRenderer.startWidth      = width;
            lineRenderer.endWidth        = width;
            lineRenderer.numCapVertices  = 4;
            lineRenderer.numCornerVertices = 4;
            lineRenderer.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            lineRenderer.receiveShadows  = false;

            if (mat != null)
            {
                lineRenderer.material = mat;
            }
            else
            {
                // Fallback: built-in sprite material so the line is always visible
                lineRenderer.material = new Material(Shader.Find("Sprites/Default"));
                lineRenderer.startColor = fallbackColor;
                lineRenderer.endColor   = fallbackColor;
                Debug.LogWarning($"[PuzzleLineSetup] No material assigned for '{childName}'. " +
                                  "Assign PathGradient.mat / PathPreview.mat in the Inspector.");
            }

            return lineRenderer;
        }
    }
}
