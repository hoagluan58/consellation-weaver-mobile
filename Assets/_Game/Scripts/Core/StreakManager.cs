// Story 3.7 — Streak tracking.
// Counts consecutive daily-puzzle days, with up to 3 grace days per calendar month.
// All values read/written via GameSaveData (no separate save key).
//
// Implements GDD §7 streak rules.
// Single-thread-only.

using System;
using UnityEngine;

namespace ConstellationWeaver.Core
{
    /// <summary>
    /// Manages the player's consecutive-night streak.
    ///
    /// Rules (GDD §7):
    ///   - Streak increments when a daily puzzle is solved.
    ///   - Missing one day uses a grace day (max 3 per calendar month).
    ///   - Missing two+ consecutive days (beyond grace) resets streak to 0.
    ///   - Grace days reset at the start of each calendar month.
    ///
    /// Usage:
    ///   StreakManager.I.RecordDailySolve();   // Call after daily puzzle solved
    ///   string text = StreakManager.I.GetDisplayText();
    /// </summary>
    public class StreakManager : MonoBehaviour
    {
        public static StreakManager I { get; private set; }

        // Tuning knob — configurable without code change (GDD tuning knob)
        [SerializeField] private int _maxGraceDaysPerMonth = 3;  // GDD: 3 grace days

        private void Awake()
        {
            if (I != null && I != this) { Destroy(gameObject); return; }
            I = this;
            DontDestroyOnLoad(gameObject);
        }

        private void OnDestroy() { if (I == this) I = null; }

        // ─── Public API ───────────────────────────────────────────────────────

        /// <summary>
        /// Call immediately after the player completes today's daily puzzle.
        /// Computes streak delta, applies grace logic, updates GameSaveData.
        /// </summary>
        public void RecordDailySolve()
        {
            var save = GameSaveData.I;
            if (save == null) { Debug.LogError("[StreakManager] GameSaveData not available."); return; }

            var today = DateTime.Now;
            save.ResetGraceDaysForMonth(today.Month);

            var lastDate = ParseDate(save.LastDailyDate);
            int daysDiff = lastDate.HasValue ? (int)(today.Date - lastDate.Value.Date).TotalDays : int.MaxValue;

            if (daysDiff == 1)
            {
                // Consecutive day — extend streak
                save.SetStreak(save.DailyStreak + 1, today.Month);
                Debug.Log($"[StreakManager] Streak extended to {save.DailyStreak}.");
            }
            else if (daysDiff == 0)
            {
                // Already played today — no change
                Debug.Log("[StreakManager] Already recorded today.");
                return;
            }
            else if (daysDiff == 2 && save.GraceDaysUsedThisMonth < _maxGraceDaysPerMonth)
            {
                // Missed one day — burn a grace day, keep streak
                save.UseGraceDay();
                save.SetStreak(save.DailyStreak + 1, today.Month);
                Debug.Log($"[StreakManager] Grace day used ({save.GraceDaysUsedThisMonth}/{_maxGraceDaysPerMonth}). " +
                          $"Streak continues at {save.DailyStreak}.");
            }
            else
            {
                // Missed too many days — reset
                save.SetStreak(1, today.Month);
                Debug.Log("[StreakManager] Streak reset to 1 (missed too many days).");
            }

            save.RecordDailyPlay(today.ToString("yyyy-MM-dd"), DailyPuzzleManager.I?.GetToday().levelId ?? "");
        }

        /// <summary>
        /// Returns a display string for the streak UI.
        /// Examples: "3 nights", "7 nights, 1 grace day used", "0 nights"
        /// </summary>
        public string GetDisplayText()
        {
            var save = GameSaveData.I;
            if (save == null) return "0 nights";

            int streak = save.DailyStreak;
            int grace  = save.GraceDaysUsedThisMonth;

            string nightText = streak == 1 ? "1 night" : $"{streak} nights";

            if (grace > 0)
                return $"{nightText}, {grace} grace {(grace == 1 ? "day" : "days")} used";

            return nightText;
        }

        /// <summary>True if today's daily has already been completed.</summary>
        public bool HasPlayedToday()
        {
            var save = GameSaveData.I;
            if (save == null) return false;
            return save.LastDailyDate == DateTime.Now.ToString("yyyy-MM-dd");
        }

        // ─── Helpers ──────────────────────────────────────────────────────────
        private static DateTime? ParseDate(string iso)
        {
            if (string.IsNullOrEmpty(iso)) return null;
            if (DateTime.TryParse(iso, out var d)) return d;
            return null;
        }
    }
}
