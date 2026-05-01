// Editor tool — generates silent placeholder AudioClips and wires them into
// SoundGroupSO assets so Story 2.6 can be validated without real audio files.
// Run via: Tools → Constellation Weaver → Generate Sound Stubs
//
// Implements prototype-code.md relaxed standards (editor-only tooling, not shipped).

#if UNITY_EDITOR
using System;
using System.IO;
using UnityEditor;
using UnityEngine;
using NFramework;

namespace ConstellationWeaver.Editor
{
    public static class SoundStubGenerator
    {
        // ── Output paths ────────────────────────────────────────────────────────
        private const string BGM_FOLDER  = "Assets/_Game/Audio/BGM";
        private const string SFX_FOLDER  = "Assets/_Game/Audio/SFX";
        private const string SO_FOLDER   = "Assets/Resources/Audio";

        // ── Clip definitions ────────────────────────────────────────────────────
        // (key, fileName, durationSeconds, isBgm)
        private static readonly (string key, string file, float dur, bool isBgm)[] Clips =
        {
            // BGM
            ("bgm_ambient",    "bgm_ambient",    8f,   true),
            // Puzzle SFX
            ("sfx_star_hit",   "sfx_star_hit",   0.3f, false),
            ("sfx_path_tick",  "sfx_path_tick",  0.1f, false),
            ("sfx_path_pop",   "sfx_path_pop",   0.2f, false),
            ("sfx_complete",   "sfx_complete",   1.2f, false),
            // UI SFX
            ("sfx_button",     "sfx_button",     0.2f, false),
            ("sfx_screen_in",  "sfx_screen_in",  0.3f, false),
            ("sfx_screen_out", "sfx_screen_out", 0.3f, false),
        };

        // ── Entry point ─────────────────────────────────────────────────────────
        [MenuItem("Tools/Constellation Weaver/Generate Sound Stubs")]
        public static void Generate()
        {
            EnsureFolder(BGM_FOLDER);
            EnsureFolder(SFX_FOLDER);
            EnsureFolder(SO_FOLDER);

            int created = 0;
            int skipped = 0;

            foreach (var (key, file, dur, isBgm) in Clips)
            {
                var folder = isBgm ? BGM_FOLDER : SFX_FOLDER;
                var wavPath = $"{folder}/{file}.wav";

                if (!File.Exists(wavPath))
                {
                    WriteSilentWav(wavPath, dur);
                    created++;
                }
                else
                {
                    skipped++;
                }
            }

            AssetDatabase.Refresh();

            // Wire clips into SoundGroupSOs
            WireSoundGroupSO($"{SO_FOLDER}/sound_puzzle.asset",
                new[] { "bgm_ambient", "sfx_star_hit", "sfx_path_tick", "sfx_path_pop", "sfx_complete" });

            WireSoundGroupSO($"{SO_FOLDER}/sound_ui.asset",
                new[] { "sfx_button", "sfx_screen_in", "sfx_screen_out" });

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"[SoundStubGenerator] Done. Created {created} clips, skipped {skipped} (already exist). SoundGroupSOs wired.");
            EditorUtility.DisplayDialog(
                "Sound Stubs Generated",
                $"Created {created} silent placeholder clips.\nSkipped {skipped} existing files.\n\nSoundGroupSO assets wired. Open them in the Inspector to verify.",
                "OK");
        }

        // ── Wire SoundGroupSO ───────────────────────────────────────────────────
        private static void WireSoundGroupSO(string soPath, string[] keys)
        {
            var so = AssetDatabase.LoadAssetAtPath<SoundGroupSO>(soPath);
            if (so == null)
            {
                Debug.LogError($"[SoundStubGenerator] SoundGroupSO not found at: {soPath}");
                return;
            }

            bool changed = false;

            foreach (var key in keys)
            {
                // Find the clip definition
                string clipPath = null;
                foreach (var (k, file, _, isBgm) in Clips)
                {
                    if (k != key) continue;
                    clipPath = $"{(isBgm ? BGM_FOLDER : SFX_FOLDER)}/{file}.wav";
                    break;
                }

                if (clipPath == null)
                {
                    Debug.LogWarning($"[SoundStubGenerator] No clip definition found for key: {key}");
                    continue;
                }

                var clip = AssetDatabase.LoadAssetAtPath<AudioClip>(clipPath);
                if (clip == null)
                {
                    Debug.LogWarning($"[SoundStubGenerator] AudioClip not found at: {clipPath}");
                    continue;
                }

                // Check if entry already exists
                bool exists = false;
                foreach (var entry in so.soundEntries)
                {
                    if (entry.key == key)
                    {
                        // Update clip if null
                        if (entry.clip == null)
                        {
                            entry.clip = clip;
                            changed = true;
                            Debug.Log($"[SoundStubGenerator] Updated clip for existing entry: {key}");
                        }
                        exists = true;
                        break;
                    }
                }

                if (!exists)
                {
                    var newEntry = new SoundGroupSO.SoundEntry
                    {
                        key  = key,
                        clip = clip,
                        playSettings = BuildPlaySettings(key),
                    };
                    newEntry.OnKeyChanged(); // refresh defineKeyConstName
                    so.soundEntries.Add(newEntry);
                    changed = true;
                    Debug.Log($"[SoundStubGenerator] Added entry: {key} → {clipPath}");
                }
            }

            if (changed)
                EditorUtility.SetDirty(so);
        }

        // ── Play settings per key ───────────────────────────────────────────────
        private static SoundPlaySettings BuildPlaySettings(string key)
        {
            return key switch
            {
                "bgm_ambient"   => new SoundPlaySettings { volume = 0.7f, loop = true,  pitch = 1f },
                "sfx_star_hit"  => new SoundPlaySettings { volume = 1.0f, loop = false, pitch = 1f,
                                       overlapType = EAudioOverlapType.None },
                "sfx_path_tick" => new SoundPlaySettings { volume = 0.4f, loop = false, pitch = 1f },
                "sfx_path_pop"  => new SoundPlaySettings { volume = 0.6f, loop = false, pitch = 1f },
                "sfx_complete"  => new SoundPlaySettings { volume = 1.0f, loop = false, pitch = 1f,
                                       overlapType = EAudioOverlapType.StopPrevious },
                _               => new SoundPlaySettings { volume = 0.8f, loop = false, pitch = 1f },
            };
        }

        // ── Minimal silent WAV writer ───────────────────────────────────────────
        // Produces a valid PCM 16-bit mono WAV at 44100 Hz filled with silence.
        private static void WriteSilentWav(string path, float durationSeconds)
        {
            const int sampleRate  = 44100;
            const int channels    = 1;
            const int bitsPerSample = 16;
            const int byteRate    = sampleRate * channels * (bitsPerSample / 8);
            const int blockAlign  = channels * (bitsPerSample / 8);

            int numSamples  = Mathf.RoundToInt(sampleRate * durationSeconds);
            int dataSize    = numSamples * blockAlign;
            int fileSize    = 36 + dataSize; // RIFF chunk size = 4 (WAVE) + 24 (fmt) + 8 + dataSize

            using var ms = new MemoryStream(44 + dataSize);
            using var bw = new BinaryWriter(ms);

            // RIFF header
            bw.Write(System.Text.Encoding.ASCII.GetBytes("RIFF"));
            bw.Write(fileSize);                         // ChunkSize
            bw.Write(System.Text.Encoding.ASCII.GetBytes("WAVE"));

            // fmt sub-chunk
            bw.Write(System.Text.Encoding.ASCII.GetBytes("fmt "));
            bw.Write(16);                               // SubChunk1Size (PCM)
            bw.Write((short)1);                         // AudioFormat (PCM = 1)
            bw.Write((short)channels);
            bw.Write(sampleRate);
            bw.Write(byteRate);
            bw.Write((short)blockAlign);
            bw.Write((short)bitsPerSample);

            // data sub-chunk
            bw.Write(System.Text.Encoding.ASCII.GetBytes("data"));
            bw.Write(dataSize);
            bw.Write(new byte[dataSize]);               // silence

            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            File.WriteAllBytes(path, ms.ToArray());
        }

        // ── Helpers ─────────────────────────────────────────────────────────────
        private static void EnsureFolder(string path)
        {
            // AssetDatabase.CreateFolder requires the path to not already exist.
            if (!AssetDatabase.IsValidFolder(path))
            {
                var parts = path.Split('/');
                var current = parts[0];
                for (int i = 1; i < parts.Length; i++)
                {
                    var next = current + "/" + parts[i];
                    if (!AssetDatabase.IsValidFolder(next))
                        AssetDatabase.CreateFolder(current, parts[i]);
                    current = next;
                }
            }
        }
    }
}
#endif
