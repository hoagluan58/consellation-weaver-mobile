using System;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace ConstellationWeaver.Core
{
    /// <summary>
    /// Story 1.1 — Boot scene entry point and persistent game state controller.
    ///
    /// Responsibilities:
    ///   - Survive scene loads via DontDestroyOnLoad (singleton guard prevents duplicates)
    ///   - Initialize all data systems once at boot (LevelRepository)
    ///   - Expose a GameState machine for top-level flow: BOOT → GAME
    ///   - Route to the correct first scene
    ///
    /// Implements GDD §2 game flow.
    /// Single-thread-only. Do NOT call from a background thread.
    ///
    /// Usage example:
    ///   GameManager.Instance.LoadLevel("001_triangulum");
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        // ─── Singleton ────────────────────────────────────────────────────────
        public static GameManager Instance { get; private set; }

        // ─── State ────────────────────────────────────────────────────────────
        public enum GameState { Boot, Game }

        public GameState CurrentState { get; private set; } = GameState.Boot;

        /// <summary>Fired whenever the top-level game state changes.</summary>
        public event Action<GameState> OnGameStateChanged;

        // ─── Scene names — must match Build Settings ──────────────────────────
        private const string SCENE_GAME = "Game";

        // ─── Lifecycle ────────────────────────────────────────────────────────

        private void Awake()
        {
            // Singleton guard — destroy any duplicate that loads with a new scene
            if (Instance != null && Instance != this)
            {
                Debug.LogWarning("[GameManager] Duplicate instance destroyed.");
                Destroy(gameObject);
                return;
            }

            Instance = this;
            DontDestroyOnLoad(gameObject);

            Debug.Log("[GameManager] Awake — persisting across scenes.");
        }

        private void Start()
        {
            InitializeSystems();
            TransitionToGameScene();
        }

        // ─── Initialization ───────────────────────────────────────────────────

        /// <summary>
        /// One-time startup: loads all data systems.
        /// Runs synchronously — all systems must complete before scene transition.
        /// </summary>
        private void InitializeSystems()
        {
            // Load and validate all level JSON files from Resources/Levels/
            LevelRepository.Instance.LoadAll();

            // TODO Sprint 3: LocalSaveManager.Instance.Load() — restore player progress
            // TODO Sprint 3: StreakManager.Instance.Initialize(saveData) — compute streak
            // TODO Sprint 3: DailyPuzzleManager.Instance.Initialize() — determine today's puzzle

            Debug.Log("[GameManager] All systems initialized.");
        }

        // ─── Scene Routing ────────────────────────────────────────────────────

        /// <summary>
        /// Transitions from Boot to Game scene.
        /// Sprint 3: will check save data here to decide Onboarding vs Home.
        /// </summary>
        private void TransitionToGameScene()
        {
            SetState(GameState.Game);

            // TODO Sprint 3: if (!saveData.hasCompletedOnboarding) → show OnboardingView
            // TODO Sprint 3: else → show HomeView via UIManager

            Debug.Log($"[GameManager] Loading scene '{SCENE_GAME}'.");
            SceneManager.LoadScene(SCENE_GAME);
        }

        // ─── Public API ───────────────────────────────────────────────────────

        /// <summary>
        /// Convenience accessor for level data. Returns null and logs error if not found.
        /// Example: var data = GameManager.Instance.GetLevel("001_triangulum");
        /// </summary>
        public Data.LevelData GetLevel(string levelId)
        {
            return LevelRepository.Instance.GetById(levelId);
        }

        /// <summary>
        /// Convenience accessor for ordered level list.
        /// Example: int total = GameManager.Instance.LevelCount;
        /// </summary>
        public int LevelCount => LevelRepository.Instance.AllLevels.Count;

        // ─── State Machine ────────────────────────────────────────────────────

        private void SetState(GameState newState)
        {
            if (CurrentState == newState) return;

            Debug.Log($"[GameManager] State: {CurrentState} → {newState}");
            CurrentState = newState;
            OnGameStateChanged?.Invoke(newState);
        }

        // ─── Cleanup ──────────────────────────────────────────────────────────

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }
    }
}
