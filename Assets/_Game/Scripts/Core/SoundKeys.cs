// Sound key constants for Constellation Weaver.
// All keys must match the 'key' field in the corresponding SoundGroupSO assets.
namespace ConstellationWeaver.Core
{
    public static class SoundKeys
    {
        // --- BGM ---
        public const string BGM_AMBIENT = "bgm_ambient";       // Soft ambient loop during gameplay

        // --- Puzzle SFX ---
        public const string SFX_STAR_HIT    = "sfx_star_hit";  // Waypoint reached (pitch rises per hit)
        public const string SFX_PATH_TICK   = "sfx_path_tick"; // Each cell visited (quiet, subtle)
        public const string SFX_PATH_POP    = "sfx_path_pop";  // Path backtrack
        public const string SFX_COMPLETE    = "sfx_complete";  // Puzzle solved chime

        // --- UI SFX ---
        public const string SFX_BUTTON      = "sfx_button";    // Generic button tap whoosh
        public const string SFX_SCREEN_IN   = "sfx_screen_in"; // Screen transition in
        public const string SFX_SCREEN_OUT  = "sfx_screen_out";// Screen transition out
    }
}
