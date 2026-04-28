using UnityEngine;
using ConstellationWeaver.Data;

namespace ConstellationWeaver.Puzzle
{
    public static class PuzzleValidator
    {
        public static bool IsPathValidSolution(GridModel grid, PathModel pathModel)
        {
            var path = pathModel.Path;
            int totalCells = grid.Width * grid.Height;

            // 1. All cells visited?
            if (path.Count != totalCells) return false;

            // 2. Starts at WP1
            var firstWp = grid.GetWaypointAt(path[0]);
            if (firstWp == null || firstWp.order != 1) return false;

            // 3. Ends at max WP
            var lastWp = grid.GetWaypointAt(path[path.Count - 1]);
            int maxWpOrder = grid.GetTotalWaypoints();
            if (lastWp == null || lastWp.order != maxWpOrder) return false;

            return true;
        }
    }
}
