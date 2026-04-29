using UnityEngine;
using ConstellationWeaver.Data;
using System.Collections.Generic;

namespace ConstellationWeaver.Puzzle
{
    public class PuzzleRenderer : MonoBehaviour
    {
        [Header("Settings")]
        [SerializeField] private float _cellSize = 1.0f;
        [SerializeField] private float _cellSpacing = 0.2f;
        [SerializeField] private float _touchHitboxPadding = 0.2f; // Extra forgiveness for touching
        
        [Header("References")]
        [SerializeField] private PuzzleController _controller;
        [SerializeField] private Camera _mainCamera;
        [SerializeField] private GameObject _starPrefab; // For waypoints
        [SerializeField] private LineRenderer _pathLineRenderer;
        [SerializeField] private LineRenderer _previewLineRenderer; // Follows finger in real-time

        private Vector2 _gridOrigin; // World position of top-left cell center
        private GridModel _grid;
        private List<GameObject> _spawnedStars = new List<GameObject>();
        // Pre-allocated lookup for waypoint visual components — zero hot-path alloc
        private Dictionary<Vector2Int, StarWaypointVisual> _starVisuals = new Dictionary<Vector2Int, StarWaypointVisual>();
        private bool _isDrawing = false;

        private void Awake()
        {
            if (_mainCamera == null) _mainCamera = Camera.main;
            
            if (_controller != null)
            {
                _controller.OnPathAppended += HandlePathAppended;
                _controller.OnPathPopped += HandlePathPopped;
                _controller.OnPathCleared += HandlePathCleared;
                _controller.OnPuzzleSolved += HandlePuzzleSolved;
            }

            if (_previewLineRenderer != null)
                _previewLineRenderer.positionCount = 0;
        }

        private void OnDestroy()
        {
            if (_controller != null)
            {
                _controller.OnPathAppended -= HandlePathAppended;
                _controller.OnPathPopped -= HandlePathPopped;
                _controller.OnPathCleared -= HandlePathCleared;
                _controller.OnPuzzleSolved -= HandlePuzzleSolved;
            }
        }

        /// <summary>Called by PuzzleLineSetup at Awake to inject the confirmed-path LineRenderer.</summary>
        public void SetPathLineRenderer(LineRenderer lr)    => _pathLineRenderer    = lr;

        /// <summary>Called by PuzzleLineSetup at Awake to inject the preview LineRenderer.</summary>
        public void SetPreviewLineRenderer(LineRenderer lr) => _previewLineRenderer = lr;

        public void RenderLevel(GridModel grid)
        {
            _grid = grid;
            
            // Cleanup old
            foreach (var star in _spawnedStars) Destroy(star);
            _spawnedStars.Clear();
            if (_pathLineRenderer != null) _pathLineRenderer.positionCount = 0;
            if (_previewLineRenderer != null) _previewLineRenderer.positionCount = 0;

            // Calculate layout
            float totalWidth = grid.Width * _cellSize + (grid.Width - 1) * _cellSpacing;
            float totalHeight = grid.Height * _cellSize + (grid.Height - 1) * _cellSpacing;

            // Center the grid at (0,0) world space
            float startX = -(totalWidth / 2f) + (_cellSize / 2f);
            float startY = (totalHeight / 2f) - (_cellSize / 2f); // +Y is up in Unity
            
            _gridOrigin = new Vector2(startX, startY);
            
            _starVisuals.Clear();

            // Spawn Waypoint Stars
            for (int y = 0; y < grid.Height; y++)
            {
                for (int x = 0; x < grid.Width; x++)
                {
                    var pos = new Vector2Int(x, y);
                    var wp = grid.GetWaypointAt(pos);
                    if (wp != null && _starPrefab != null)
                    {
                        var starObj = Instantiate(_starPrefab, GetWorldPosition(pos), Quaternion.identity, transform);
                        starObj.name = $"Star_{wp.order}";
                        _spawnedStars.Add(starObj);

                        var visual = starObj.GetComponent<StarWaypointVisual>();
                        if (visual != null)
                            _starVisuals[pos] = visual;
                    }
                }
            }
        }

        /// <summary>
        /// Called every frame by TouchInputHandler while drawing.
        /// Renders a live preview segment from the last snapped cell to the finger tip.
        /// </summary>
        public void UpdateFingerPreview(Vector3 fingerWorldPos)
        {
            if (_previewLineRenderer == null || _controller == null) return;

            var path = _controller.Path.Path;
            if (!_isDrawing || path.Count == 0)
            {
                _previewLineRenderer.positionCount = 0;
                return;
            }

            Vector3 lastCellPos = GetWorldPosition(path[path.Count - 1]);
            _previewLineRenderer.positionCount = 2;
            _previewLineRenderer.SetPosition(0, lastCellPos);
            _previewLineRenderer.SetPosition(1, fingerWorldPos);
        }

        public void ClearFingerPreview()
        {
            if (_previewLineRenderer != null)
                _previewLineRenderer.positionCount = 0;
        }

        public Vector3 GetWorldPosition(Vector2Int gridCell)
        {
            float step = _cellSize + _cellSpacing;
            float x = _gridOrigin.x + gridCell.x * step;
            float y = _gridOrigin.y - gridCell.y * step; // -Y because origin is top-left
            return new Vector3(x, y, 0f);
        }

        public bool TryGetGridCellAtScreenPosition(Vector2 screenPosition, out Vector2Int gridCell)
        {
            gridCell = Vector2Int.zero;
            if (_grid == null || _mainCamera == null) return false;

            // Works for both Orthographic and Perspective cameras
            Vector3 worldPos = _mainCamera.ScreenToWorldPoint(
                new Vector3(screenPosition.x, screenPosition.y, Mathf.Abs(_mainCamera.transform.position.z)));
            worldPos.z = 0f;
            
            for (int y = 0; y < _grid.Height; y++)
            {
                for (int x = 0; x < _grid.Width; x++)
                {
                    Vector3 cellWorldPos = GetWorldPosition(new Vector2Int(x, y));
                    float dist = Vector2.Distance(worldPos, cellWorldPos);
                    
                    if (dist <= (_cellSize / 2f) + _touchHitboxPadding)
                    {
                        gridCell = new Vector2Int(x, y);
                        return true;
                    }
                }
            }

            return false;
        }

        /// <summary>Converts a raw screen position to world position (for preview line).</summary>
        public Vector3 ScreenToWorld(Vector2 screenPosition)
        {
            Vector3 world = _mainCamera.ScreenToWorldPoint(
                new Vector3(screenPosition.x, screenPosition.y, Mathf.Abs(_mainCamera.transform.position.z)));
            world.z = 0f;
            return world;
        }

        private void HandlePathAppended(Vector2Int cell)
        {
            _isDrawing = true;
            UpdateLineRenderer();

            // Fire hit animation if this cell is a waypoint
            if (_starVisuals.TryGetValue(cell, out var visual))
                visual.PlayHitAnimation();
        }

        private void HandlePathPopped(Vector2Int cell)
        {
            UpdateLineRenderer();
        }

        private void HandlePathCleared()
        {
            _isDrawing = false;
            if (_pathLineRenderer != null) _pathLineRenderer.positionCount = 0;
            if (_previewLineRenderer != null) _previewLineRenderer.positionCount = 0;
        }

        private void HandlePuzzleSolved()
        {
            _isDrawing = false;
            ClearFingerPreview();
        }

        private void UpdateLineRenderer()
        {
            if (_pathLineRenderer == null || _controller == null) return;
            
            var path = _controller.Path.Path;
            _pathLineRenderer.positionCount = path.Count;
            
            for (int i = 0; i < path.Count; i++)
            {
                _pathLineRenderer.SetPosition(i, GetWorldPosition(path[i]));
            }
        }
    }
}
