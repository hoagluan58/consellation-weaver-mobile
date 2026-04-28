using UnityEngine;
using ConstellationWeaver.Data;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace ConstellationWeaver.Core
{
    public static class LevelLoader
    {
        private const string LEVELS_PATH = "Levels/";

        public static LevelData LoadLevel(string levelId)
        {
            TextAsset textAsset = Resources.Load<TextAsset>(LEVELS_PATH + levelId);
            if (textAsset == null)
            {
                Debug.LogError($"[LevelLoader] Level {levelId} not found in Resources/{LEVELS_PATH}");
                return null;
            }

            return JsonConvert.DeserializeObject<LevelData>(textAsset.text);
        }

        public static LevelData[] LoadAllLevels()
        {
            TextAsset[] assets = Resources.LoadAll<TextAsset>(LEVELS_PATH);
            List<LevelData> levels = new List<LevelData>(assets.Length);
            foreach (var asset in assets)
            {
                if (asset.name == "manifest") continue;
                
                var data = JsonConvert.DeserializeObject<LevelData>(asset.text);
                if (data != null)
                {
                    levels.Add(data);
                }
            }
            return levels.ToArray();
        }
    }
}
