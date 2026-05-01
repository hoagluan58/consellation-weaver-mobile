using NFramework;
using UnityEngine;

namespace ConstellationWeaver.UI
{
    /// <summary>
    /// Story 3.1 — Game-level navigation API.
    ///
    /// Thin wrapper around UIManager.OpenResources / Close.
    /// All screen-open calls go through here so game code never hard-codes
    /// string IDs or calls UIManager directly (UI Code Rule: decoupled cross-system comms).
    ///
    /// Single-thread-only. Do NOT call from background threads.
    ///
    /// Usage example:
    ///   UINavigator.ShowSplash();
    ///   UINavigator.ShowHome();
    ///   UINavigator.ShowPuzzle(new PuzzleInputData { levelId = "001_triangulum" });
    /// </summary>
    public static class UINavigator
    {
        // ── Always-on-top ─────────────────────────────────────────────────────

        /// <summary>Show the Splash screen. Auto-dismisses after its animation.</summary>
        public static SplashView ShowSplash()
        {
            return UIManager.OpenResources<SplashView>(UIViewKeys.Splash);
        }

        // ── Menu layer ────────────────────────────────────────────────────────

        /// <summary>Show the Onboarding flow. Pass step index via inputData (Sprint 3.9).</summary>
        public static UIView ShowOnboarding(UIInputData data = null)
        {
            return UIManager.OpenResources(UIViewKeys.Onboarding, data);
        }

        /// <summary>Show the Home screen — main hub.</summary>
        public static UIView ShowHome()
        {
            UIManager.CloseAll(); // Clear any stale menu screens
            return UIManager.OpenResources(UIViewKeys.Home);
        }

        /// <summary>Show the Journey campaign screen.</summary>
        public static UIView ShowJourney()
        {
            return UIManager.OpenResources(UIViewKeys.Journey);
        }

        /// <summary>Show the Archive (last 30 daily puzzles).</summary>
        public static UIView ShowArchive()
        {
            return UIManager.OpenResources(UIViewKeys.Archive);
        }

        /// <summary>Show the Almanac (88 constellation collection).</summary>
        public static UIView ShowAlmanac()
        {
            return UIManager.OpenResources(UIViewKeys.Almanac);
        }

        /// <summary>Show the Settings screen.</summary>
        public static UIView ShowSettings()
        {
            return UIManager.OpenResources(UIViewKeys.Settings);
        }

        // ── Background layer ──────────────────────────────────────────────────

        /// <summary>Open a puzzle. Must pass PuzzleInputData with levelId.</summary>
        public static UIView ShowPuzzle(PuzzleInputData data)
        {
            if (data == null || string.IsNullOrEmpty(data.levelId))
            {
                Debug.LogError("[UINavigator] ShowPuzzle requires a valid PuzzleInputData.levelId.");
                return null;
            }
            return UIManager.OpenResources(UIViewKeys.Puzzle, data);
        }

        // ── Popup layer ───────────────────────────────────────────────────────

        /// <summary>Show the completion overlay after a puzzle is solved.</summary>
        public static UIView ShowCompletionOverlay(CompletionInputData data)
        {
            return UIManager.OpenResources(UIViewKeys.CompletionOverlay, data);
        }

        /// <summary>Show the hint confirmation bottom sheet.</summary>
        public static UIView ShowHintConfirm()
        {
            return UIManager.OpenResources(UIViewKeys.HintConfirm);
        }

        /// <summary>Show the hemisphere picker bottom sheet.</summary>
        public static UIView ShowHemispherePicker()
        {
            return UIManager.OpenResources(UIViewKeys.HemispherePicker);
        }

        /// <summary>Show the notification opt-in bottom sheet.</summary>
        public static UIView ShowNotificationOptIn()
        {
            return UIManager.OpenResources(UIViewKeys.NotificationOptIn);
        }

        /// <summary>Show the Starlight IAP screen.</summary>
        public static UIView ShowStarlight()
        {
            return UIManager.OpenResources(UIViewKeys.Starlight);
        }

        // ── Close helpers ─────────────────────────────────────────────────────

        /// <summary>Close a specific screen by its key constant.</summary>
        public static UIOutputData Close(string viewKey, bool destroy = false)
        {
            return UIManager.Close(viewKey, destroy);
        }

        /// <summary>Close the topmost popup.</summary>
        public static void CloseTopPopup()
        {
            UIManager.CloseCurrentInLayer(UILayer.Popup);
        }
    }

    // ─── UIInputData subclasses ───────────────────────────────────────────────
    // Placed here for Sprint 3.1 scaffolding. Move to dedicated files as views grow.

    /// <summary>Data passed when opening the Puzzle screen.</summary>
    public class PuzzleInputData : UIInputData
    {
        /// <summary>Level ID matching the JSON filename without extension, e.g. "001_triangulum".</summary>
        public string levelId;

        public enum PuzzleSource { Journey, Daily, Archive, Onboarding }
        /// <summary>Where the puzzle was launched from — used for analytics.</summary>
        public PuzzleSource source = PuzzleSource.Journey;
    }

    /// <summary>Data passed to the completion overlay after a puzzle is solved.</summary>
    public class CompletionInputData : UIInputData
    {
        public string levelId;
        public string constellationName;
        public string loreLine;
        public bool   wasDaily;
    }

    /// <summary>Output returned when the puzzle screen closes.</summary>
    public class PuzzleOutputData : UIOutputData
    {
        public string levelId;
        public bool   solved;
        public float  solveTimeSeconds;
        public int    hintsUsed;
    }
}
