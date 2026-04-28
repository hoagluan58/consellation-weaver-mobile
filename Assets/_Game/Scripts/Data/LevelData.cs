using System;
using System.Collections.Generic;

namespace ConstellationWeaver.Data
{
    [Serializable]
    public class LevelData
    {
        public string id;
        public int index;
        public string chapter;
        public string tier;
        public string constellation;
        public string hemisphere;
        public int best_month;
        public string lore;
        public int width;
        public int height;
        public List<WaypointData> waypoints;
        public List<List<int>> solution;
        public DesignerNotes designer_notes;
    }

    [Serializable]
    public class WaypointData
    {
        public int x;
        public int y;
        public int order;
    }

    [Serializable]
    public class DesignerNotes
    {
        public string pedagogical_goal;
        public int estimated_solve_seconds;
    }
}
