using System.Collections.Generic;
using UnityEngine;

namespace ConstellationWeaver.Puzzle
{
    public class PathModel
    {
        private readonly GridModel _grid;
        private readonly List<Vector2Int> _path;
        private readonly HashSet<Vector2Int> _visited;
        
        private int _highestWaypointOrderReached = 0;

        public IReadOnlyList<Vector2Int> Path => _path;
        public int CurrentWaypointTarget => _highestWaypointOrderReached + 1;

        public PathModel(GridModel grid, int maxCapacity)
        {
            _grid = grid;
            _path = new List<Vector2Int>(maxCapacity);
            _visited = new HashSet<Vector2Int>();
        }

        public bool TryAppend(Vector2Int pos)
        {
            if (!_grid.IsValidPosition(pos)) return false;
            
            // Start of path
            if (_path.Count == 0)
            {
                var wp = _grid.GetWaypointAt(pos);
                if (wp != null && wp.order == 1)
                {
                    _path.Add(pos);
                    _visited.Add(pos);
                    _highestWaypointOrderReached = 1;
                    return true;
                }
                return false;
            }

            // Auto-pop backtracking
            if (_visited.Contains(pos))
            {
                if (_path.Count > 1 && _path[_path.Count - 2] == pos)
                {
                    Pop();
                    return true;
                }
                return false; // Can't cross own path otherwise
            }

            Vector2Int currentHead = _path[_path.Count - 1];
            if (!_grid.IsAdjacent(currentHead, pos)) return false;

            // Check waypoint ordering rule
            var nextWp = _grid.GetWaypointAt(pos);
            if (nextWp != null)
            {
                if (nextWp.order != _highestWaypointOrderReached + 1)
                {
                    return false; // Skipped a waypoint or hit out of order
                }
                _highestWaypointOrderReached = nextWp.order;
            }

            _path.Add(pos);
            _visited.Add(pos);
            return true;
        }

        public void Pop()
        {
            if (_path.Count == 0) return;

            Vector2Int tail = _path[_path.Count - 1];
            
            var wp = _grid.GetWaypointAt(tail);
            if (wp != null && wp.order == _highestWaypointOrderReached)
            {
                _highestWaypointOrderReached--;
            }

            _visited.Remove(tail);
            _path.RemoveAt(_path.Count - 1);
        }

        public void Clear()
        {
            _path.Clear();
            _visited.Clear();
            _highestWaypointOrderReached = 0;
        }
    }
}
