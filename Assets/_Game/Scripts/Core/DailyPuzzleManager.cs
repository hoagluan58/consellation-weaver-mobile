// Story 3.6 — Daily puzzle rotation.
// Deterministic: given the same local date + hemisphere, always returns the same level.
// 88-constellation cycle: 44 for each hemisphere, so each constellation appears
// once every 44 days per hemisphere (GDD §5).
//
// No external dependencies beyond LevelRepository and GameSaveData.
// Single-thread-only.

using System;
using UnityEngine;

namespace ConstellationWeaver.Core
{
    /// <summary>
    /// Returns today's puzzle based on local date and player hemisphere setting.
    ///
    /// Usage:
    ///   var info = DailyPuzzleManager.I.GetToday();
    ///   Debug.Log(info.levelId);  // e.g. "007_lyra"
    /// </summary>
    public class DailyPuzzleManager : MonoBehaviour
    {
        public static DailyPuzzleManager I { get; private set; }

        // ── Tuning knobs (GDD §5 daily rotation) ─────────────────────────────
        // Reference epoch: 2026-01-01 — day 0 of the rotation cycle.
        private static readonly DateTime EpochDate = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Local);

        public readonly struct DailyInfo
        {
            public readonly string levelId;
            public readonly string date;        // ISO "YYYY-MM-DD"
            public readonly bool   alreadyPlayed;

            public DailyInfo(string levelId, string date, bool alreadyPlayed)
            {
                this.levelId      = levelId;
                this.date         = date;
                this.alreadyPlayed = alreadyPlayed;
            }
        }

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            if (I != null && I != this) { Destroy(gameObject); return; }
            I = this;
            DontDestroyOnLoad(gameObject);
        }

        private void OnDestroy() { if (I == this) I = null; }

        // ─── Public API ───────────────────────────────────────────────────────

        /// <summary>
        /// Returns today's daily puzzle info.
        /// Always deterministic for a given date+hemisphere — safe to call multiple times.
        /// </summary>
        public DailyInfo GetToday()
        {
            var today = DateTime.Now;
            return GetForDate(today);
        }

        /// <summary>
        /// Returns the daily puzzle for a specific date.
        /// Used by Archive screen to reconstruct past 30 days.
        /// </summary>
        public DailyInfo GetForDate(DateTime date)
        {
            var dateStr = date.ToString("yyyy-MM-dd");
            var levelId = ComputeLevelId(date);
            var alreadyPlayed = (GameSaveData.I != null) &&
                                (GameSaveData.I.LastDailyDate == dateStr);
            return new DailyInfo(levelId, dateStr, alreadyPlayed);
        }

        // ─── Internal ─────────────────────────────────────────────────────────

        /// <summary>
        /// Maps a date to a level ID using a deterministic index.
        ///
        /// Formula:
        ///   dayIndex = (date - Epoch).TotalDays   (integer, wraps over 88)
        ///   hemisphere offset: north → 0, south → 44  (interleaved)
        ///   levelIndex = (dayIndex + offset) mod totalLevels
        ///
        /// Example (north, day 0): levelIndex = 0 → "001_triangulum"
        /// Example (south, day 0): levelIndex = 44 → level 45 in repository
        ///
        /// If the repository has fewer than (offset+1) levels, falls back to level 0.
        /// </summary>
        private static string ComputeLevelId(DateTime date)
        {
            var repo = LevelRepository.Instance;
            if (repo == null || repo.AllLevels.Count == 0)
            {
                Debug.LogError("[DailyPuzzleManager] LevelRepository is empty — cannot compute daily.");
                return string.Empty;
            }

            int totalLevels = repo.AllLevels.Count;
            int dayIndex    = (int)(date.Date - EpochDate.Date).TotalDays;

            // Hemisphere offset — north starts at 0, south at the halfway point
            bool isSouth   = GameSaveData.I != null &&
                             string.Equals(GameSaveData.I.Hemisphere, "south",
                                          StringComparison.OrdinalIgnoreCase);
            int offset     = isSouth ? totalLevels / 2 : 0;

            int index      = ((dayIndex + offset) % totalLevels + totalLevels) % totalLevels;
            return repo.AllLevels[index].id;
        }
    }
}
