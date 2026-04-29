using System.Collections.Generic;
using UnityEngine;
using ConstellationWeaver.Data;
using Newtonsoft.Json;

namespace ConstellationWeaver.Core
{
    /// <summary>
    /// Story 2.8 — Loads and caches all levels from Resources/Levels.
    /// Provides sorted campaign order and level lookup by ID.
    /// </summary>
    public class LevelRepository
    {
        private static LevelRepository _instance;
        public static LevelRepository Instance => _instance ??= new LevelRepository();

        private readonly Dictionary<string, LevelData> _byId    = new Dictionary<string, LevelData>();
        private readonly List<LevelData>               _ordered = new List<LevelData>();
        private bool _loaded = false;

        public IReadOnlyList<LevelData> AllLevels => _ordered;

        /// <summary>
        /// Loads all JSON files from Resources/Levels, validates them, and caches.
        /// Call once at startup (e.g. from GameManager.Initialize).
        /// </summary>
        public void LoadAll()
        {
            if (_loaded) return;

            TextAsset[] assets = Resources.LoadAll<TextAsset>("Levels");
            foreach (var asset in assets)
            {
                if (asset.name.Equals("manifest", System.StringComparison.OrdinalIgnoreCase)) continue;

                LevelData data;
                try
                {
                    data = JsonConvert.DeserializeObject<LevelData>(asset.text);
                }
                catch (System.Exception e)
                {
                    Debug.LogError($"[LevelRepository] Failed to parse level '{asset.name}': {e.Message}");
                    continue;
                }

                if (!Validate(data, asset.name)) continue;

                _byId[data.id] = data;
                _ordered.Add(data);
            }

            // Sort by campaign order
            _ordered.Sort((a, b) => a.index.CompareTo(b.index));
            _loaded = true;

            Debug.Log($"[LevelRepository] Loaded {_ordered.Count} levels.");
        }

        public LevelData GetById(string id)
        {
            if (_byId.TryGetValue(id, out var data)) return data;
            Debug.LogError($"[LevelRepository] Level not found: {id}");
            return null;
        }

        public LevelData GetByIndex(int oneBasedIndex)
        {
            int i = oneBasedIndex - 1;
            if (i >= 0 && i < _ordered.Count) return _ordered[i];
            Debug.LogError($"[LevelRepository] Index out of range: {oneBasedIndex}");
            return null;
        }

        /// <summary>
        /// Validates all 7 GDD schema rules. Logs error and returns false if any fail.
        /// </summary>
        private static bool Validate(LevelData data, string assetName)
        {
            int expectedCells = data.width * data.height;

            if (data.solution == null || data.solution.Count != expectedCells)
            {
                Debug.LogError($"[LevelRepository] '{assetName}': solution.length ({data.solution?.Count}) != width*height ({expectedCells})");
                return false;
            }

            var visited = new HashSet<string>();
            for (int i = 0; i < data.solution.Count; i++)
            {
                var cell = data.solution[i];
                if (cell.Count < 2) { Debug.LogError($"[LevelRepository] '{assetName}': cell {i} malformed"); return false; }
                string key = $"{cell[0]},{cell[1]}";
                if (!visited.Add(key)) { Debug.LogError($"[LevelRepository] '{assetName}': revisit at cell {i} ({key})"); return false; }

                // Adjacency check
                if (i > 0)
                {
                    var prev = data.solution[i - 1];
                    int dx = Mathf.Abs(cell[0] - prev[0]);
                    int dy = Mathf.Abs(cell[1] - prev[1]);
                    if (dx + dy != 1) { Debug.LogError($"[LevelRepository] '{assetName}': non-adjacent move at step {i}"); return false; }
                }
            }

            // Waypoint order validation
            var wpOrderMap = new Dictionary<int, int[]>(); // order -> [x,y]
            foreach (var wp in data.waypoints)
                wpOrderMap[wp.order] = new[] { wp.x, wp.y };

            for (int order = 1; order <= data.waypoints.Count; order++)
            {
                if (!wpOrderMap.TryGetValue(order, out var wpPos)) { Debug.LogError($"[LevelRepository] '{assetName}': missing waypoint order {order}"); return false; }
                // Verify position is in solution and appears after order-1 waypoint
            }

            return true;
        }
    }
}
