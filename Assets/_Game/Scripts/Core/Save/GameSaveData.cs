// Story 3.5 — Player progress persistence.
// Implements NFramework's ISaveable. Register once at boot; LocalSaveManager
// auto-saves every 5 s and on app-pause/quit.
//
// Implements GDD §15.3 save shape.
// Single-thread-only — call only from main thread.

using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using NFramework;
using UnityEngine;

namespace ConstellationWeaver.Core
{
    /// <summary>
    /// Singleton MonoBehaviour that owns all player-progress data.
    /// Must be placed in the Boot scene alongside LocalSaveManager.
    ///
    /// Usage:
    ///   // Read
    ///   bool done = GameSaveData.I.IsLevelSolved("001_triangulum");
    ///   int streak = GameSaveData.I.DailyStreak;
    ///
    ///   // Write (marks DataChanged automatically)
    ///   GameSaveData.I.MarkLevelSolved("001_triangulum");
    ///   GameSaveData.I.SetStreak(5);
    /// </summary>
    public class GameSaveData : MonoBehaviour, ISaveable
    {
        public static GameSaveData I { get; private set; }

        // ─── Serializable inner data ──────────────────────────────────────────
        [Serializable]
        public class Data
        {
            /// <summary>Incremented when the save schema changes. Used for migration.</summary>
            public int schemaVersion = 1;

            // Journey progress
            public int highestUnlockedLevel = 0;       // 0-based level index
            public List<string> solvedLevels = new();  // Level IDs e.g. "001_triangulum"

            // Daily & constellation collection
            public List<string> solvedConstellations = new(); // Constellation names
            public string lastDailyDate = "";                 // ISO date "2026-05-01"
            public string lastDailyLevelId = "";

            // Streak
            public int dailyStreak = 0;
            public int graceDaysUsedThisMonth = 0;
            public int lastStreakMonth = -1;             // Calendar month of last reset

            // Onboarding
            public bool hasCompletedOnboarding = false;

            // Settings
            public string hemisphere = "north";          // "north" | "south"
            public bool   bgmEnabled = true;
            public bool   sfxEnabled = true;
            public bool   hapticsEnabled = true;

            // IAP
            public bool iapStarlight = false;

            // Hints used (lifetime)
            public int totalHintsUsed = 0;
        }

        // ─── Runtime state ────────────────────────────────────────────────────
        private Data _data = new();

        // ─── ISaveable ────────────────────────────────────────────────────────
        public string SaveKey     => "GameSaveData";
        public bool   DataChanged { get; set; }

        public object GetData() => _data;

        public void SetData(string json)
        {
            if (string.IsNullOrEmpty(json))
            {
                _data = new Data();
                return;
            }
            try
            {
                _data = JsonConvert.DeserializeObject<Data>(json) ?? new Data();
            }
            catch (Exception ex)
            {
                Debug.LogError($"[GameSaveData] Deserialize failed, using defaults. {ex.Message}");
                _data = new Data();
            }
        }

        public void OnAllDataLoaded()
        {
            // Called after all ISaveables are loaded — run any cross-system init here.
            Debug.Log($"[GameSaveData] Loaded. Streak={_data.dailyStreak}, " +
                      $"SolvedLevels={_data.solvedLevels.Count}, " +
                      $"Onboarding={_data.hasCompletedOnboarding}");
        }

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            if (I != null && I != this)
            {
                Destroy(gameObject);
                return;
            }
            I = this;
            DontDestroyOnLoad(gameObject);
            LocalSaveManager.RegisterSaveData(this);
        }

        private void OnDestroy()
        {
            if (I == this) I = null;
        }

        // ─── Read API ─────────────────────────────────────────────────────────

        public bool   HasCompletedOnboarding     => _data.hasCompletedOnboarding;
        public int    DailyStreak                => _data.dailyStreak;
        public int    GraceDaysUsedThisMonth     => _data.graceDaysUsedThisMonth;
        public string LastDailyDate              => _data.lastDailyDate;
        public string LastDailyLevelId           => _data.lastDailyLevelId;
        public string Hemisphere                 => _data.hemisphere;
        public bool   IapStarlight               => _data.iapStarlight;
        public int    HighestUnlockedLevel        => _data.highestUnlockedLevel;
        public IReadOnlyList<string> SolvedLevels         => _data.solvedLevels;
        public IReadOnlyList<string> SolvedConstellations => _data.solvedConstellations;

        public bool IsLevelSolved(string levelId)           => _data.solvedLevels.Contains(levelId);
        public bool IsConstellationSolved(string name)      => _data.solvedConstellations.Contains(name);

        // ─── Write API ────────────────────────────────────────────────────────

        public void CompleteOnboarding()
        {
            _data.hasCompletedOnboarding = true;
            DataChanged = true;
        }

        /// <summary>Mark a level solved. Idempotent — safe to call multiple times.</summary>
        public void MarkLevelSolved(string levelId, string constellationName = null)
        {
            if (!_data.solvedLevels.Contains(levelId))
            {
                _data.solvedLevels.Add(levelId);
                DataChanged = true;
            }

            if (!string.IsNullOrEmpty(constellationName) &&
                !_data.solvedConstellations.Contains(constellationName))
            {
                _data.solvedConstellations.Add(constellationName);
                DataChanged = true;
            }
        }

        public void UnlockLevel(int index)
        {
            if (index > _data.highestUnlockedLevel)
            {
                _data.highestUnlockedLevel = index;
                DataChanged = true;
            }
        }

        public void SetStreak(int streak, int month)
        {
            _data.dailyStreak      = streak;
            _data.lastStreakMonth  = month;
            DataChanged = true;
        }

        public void UseGraceDay()
        {
            _data.graceDaysUsedThisMonth++;
            DataChanged = true;
        }

        public void ResetGraceDaysForMonth(int month)
        {
            if (_data.lastStreakMonth != month)
            {
                _data.graceDaysUsedThisMonth = 0;
                _data.lastStreakMonth = month;
                DataChanged = true;
            }
        }

        public void RecordDailyPlay(string date, string levelId)
        {
            _data.lastDailyDate    = date;
            _data.lastDailyLevelId = levelId;
            DataChanged = true;
        }

        public void SetHemisphere(string hemisphere)
        {
            _data.hemisphere = hemisphere;
            DataChanged = true;
        }

        public void SetBgmEnabled(bool enabled)  { _data.bgmEnabled  = enabled; DataChanged = true; }
        public void SetSfxEnabled(bool enabled)  { _data.sfxEnabled  = enabled; DataChanged = true; }
        public void SetHapticsEnabled(bool enabled) { _data.hapticsEnabled = enabled; DataChanged = true; }

        public void UnlockStarlight()  { _data.iapStarlight = true;  DataChanged = true; }
        public void RecordHintUsed()   { _data.totalHintsUsed++;     DataChanged = true; }

        /// <summary>Wipe all save data. For testing / reset-account flow only.</summary>
        public void ResetAll()
        {
            _data = new Data();
            DataChanged = true;
            Debug.LogWarning("[GameSaveData] Save data reset to defaults.");
        }
    }
}
