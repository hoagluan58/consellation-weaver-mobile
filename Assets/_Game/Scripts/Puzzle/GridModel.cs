using System.Collections.Generic;
using UnityEngine;
using ConstellationWeaver.Data;

namespace ConstellationWeaver.Puzzle
{
    public class GridModel
    {
        public readonly int Width;
        public readonly int Height;
        
        private static readonly Vector2Int[] Offsets = new Vector2Int[]
        {
            new Vector2Int(0, -1), // Up
            new Vector2Int(0, 1),  // Down
            new Vector2Int(-1, 0), // Left
            new Vector2Int(1, 0)   // Right
        };

        private readonly WaypointData[] _orderedWaypoints;
        private readonly Dictionary<Vector2Int, WaypointData> _waypointLookup = new Dictionary<Vector2Int, WaypointData>();

        public GridModel(LevelData levelData)
        {
            Width = levelData.width;
            Height = levelData.height;

            _orderedWaypoints = new WaypointData[levelData.waypoints.Count];
            foreach (var wp in levelData.waypoints)
            {
                _orderedWaypoints[wp.order - 1] = wp;
                _waypointLookup[new Vector2Int(wp.x, wp.y)] = wp;
            }
        }

        public bool IsValidPosition(Vector2Int pos)
        {
            return pos.x >= 0 && pos.x < Width && pos.y >= 0 && pos.y < Height;
        }

        public bool IsAdjacent(Vector2Int a, Vector2Int b)
        {
            int dx = Mathf.Abs(a.x - b.x);
            int dy = Mathf.Abs(a.y - b.y);
            return (dx == 1 && dy == 0) || (dx == 0 && dy == 1);
        }

        public void GetValidNeighbors(Vector2Int pos, List<Vector2Int> results)
        {
            results.Clear();
            foreach (var dir in Offsets)
            {
                Vector2Int neighbor = pos + dir;
                if (IsValidPosition(neighbor))
                {
                    results.Add(neighbor);
                }
            }
        }

        public WaypointData GetWaypointAt(Vector2Int pos)
        {
            if (_waypointLookup.TryGetValue(pos, out var wp))
            {
                return wp;
            }
            return null;
        }

        public WaypointData GetWaypointByOrder(int order)
        {
            int index = order - 1;
            if (index >= 0 && index < _orderedWaypoints.Length)
            {
                return _orderedWaypoints[index];
            }
            return null;
        }
        
        public int GetTotalWaypoints()
        {
            return _orderedWaypoints.Length;
        }
    }
}
