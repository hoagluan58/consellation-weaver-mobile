// Editor tool — creates all UIView prefabs for Constellation Weaver.
// Run via: Tools → Constellation Weaver → Generate UI Prefabs
//
// Creates prefabs in Assets/Resources/UI/ matching UIViewKeys constants.
// Idempotent: skips prefabs that already exist — safe to re-run.
// Also fixes NFrameworkConfigSO.uiViewsFolderPath to point at Resources/UI.
//
// After running, open each prefab to wire the [SerializeField] UI fields.

#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using NFramework;
using ConstellationWeaver.UI;

namespace ConstellationWeaver.Editor
{
    public static class UIViewPrefabGenerator
    {
        // ── Output path ──────────────────────────────────────────────────────
        private const string OUTPUT_FOLDER = "Assets/Resources/UI";

        // ── View definitions ─────────────────────────────────────────────────
        // (prefab name, UILayer, C# component type)
        private static readonly List<ViewDef> ViewDefs = new()
        {
            // AlwaysOnTop
            new("SplashView",             UILayer.AlwaysOnTop, typeof(SplashView)),

            // Menu
            new("OnboardingView",         UILayer.Menu,        typeof(OnboardingView)),
            new("HomeView",               UILayer.Menu,        typeof(HomeView)),
            new("JourneyView",            UILayer.Menu,        typeof(UIView)),   // stub — no C# class yet
            new("ArchiveView",            UILayer.Menu,        typeof(UIView)),   // stub
            new("AlmanacView",            UILayer.Menu,        typeof(UIView)),   // stub
            new("SettingsView",           UILayer.Menu,        typeof(SettingsView)),
            new("CreditsView",            UILayer.Menu,        typeof(UIView)),   // stub

            // Background
            new("PuzzleView",             UILayer.Background,  typeof(PuzzleView)),

            // Popup
            new("CompletionOverlayView",  UILayer.Popup,       typeof(UIView)),   // uses CompletionOverlay MonoBehaviour — wired by hand
            new("HemispherePickerView",   UILayer.Popup,       typeof(UIView)),   // stub
            new("HintConfirmView",        UILayer.Popup,       typeof(UIView)),   // stub
            new("NotificationOptInView",  UILayer.Popup,       typeof(UIView)),   // stub
            new("StarlightView",          UILayer.Popup,       typeof(UIView)),   // stub
        };

        // ── Layer colours for the placeholder panel ──────────────────────────
        private static readonly Dictionary<UILayer, Color> LayerColours = new()
        {
            { UILayer.Background,  new Color(0.10f, 0.05f, 0.18f, 0.95f) }, // deep navy
            { UILayer.Menu,        new Color(0.08f, 0.04f, 0.15f, 0.92f) }, // dark purple
            { UILayer.Popup,       new Color(0.05f, 0.10f, 0.20f, 0.85f) }, // dark blue (semi-transparent)
            { UILayer.AlwaysOnTop, new Color(0.02f, 0.02f, 0.10f, 0.98f) }, // near-black
            { UILayer.Loading,     new Color(0.00f, 0.00f, 0.00f, 1.00f) }, // black
        };

        // ── Entry point ──────────────────────────────────────────────────────
        [MenuItem("Tools/Constellation Weaver/Generate UI Prefabs")]
        public static void Generate()
        {
            EnsureFolder(OUTPUT_FOLDER);
            FixNFrameworkConfig();

            int created = 0;
            int skipped = 0;

            foreach (var def in ViewDefs)
            {
                var path = $"{OUTPUT_FOLDER}/{def.Name}.prefab";

                if (AssetDatabase.LoadAssetAtPath<GameObject>(path) != null)
                {
                    Debug.Log($"[UIViewPrefabGenerator] Skipping (exists): {def.Name}");
                    skipped++;
                    continue;
                }

                CreatePrefab(def, path);
                created++;
            }

            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            var msg = $"Created {created} prefabs, skipped {skipped} (already exist).\n\n" +
                      $"Next: open each prefab and wire the [SerializeField] UI fields.";
            Debug.Log($"[UIViewPrefabGenerator] {msg}");
            EditorUtility.DisplayDialog("UI Prefabs Generated", msg, "OK");
        }

        // ── Prefab creation ──────────────────────────────────────────────────
        private static void CreatePrefab(ViewDef def, string assetPath)
        {
            // ── 1. Root GameObject ────────────────────────────────────────────
            var root = new GameObject(def.Name);
            var rootRect = root.AddComponent<RectTransform>();
            StretchFull(rootRect);

            // ── 2. UIView component (or subclass) ─────────────────────────────
            var view = (UIView)root.AddComponent(def.ViewType);

            // Set UILayer via SerializedObject (private serialized field)
            var so = new SerializedObject(view);
            var layerProp = so.FindProperty("_uiLayer");
            if (layerProp != null)
            {
                layerProp.enumValueIndex = (int)def.Layer;
                so.ApplyModifiedPropertiesWithoutUndo();
            }
            else
            {
                Debug.LogWarning($"[UIViewPrefabGenerator] Could not find '_uiLayer' on {def.Name}. Set UILayer manually.");
            }

            // ── 3. Background panel ───────────────────────────────────────────
            var panel = CreateChildRect(root.transform, "Background");
            StretchFull(panel.GetComponent<RectTransform>());
            var bg = panel.AddComponent<Image>();
            bg.color = LayerColours.TryGetValue(def.Layer, out var col) ? col : new Color(0, 0, 0, 0.9f);
            bg.raycastTarget = true;

            // ── 4. Placeholder label ──────────────────────────────────────────
            var labelGO = CreateChildRect(root.transform, "PlaceholderLabel");
            var labelRect = labelGO.GetComponent<RectTransform>();
            labelRect.anchorMin = new Vector2(0.1f, 0.4f);
            labelRect.anchorMax = new Vector2(0.9f, 0.6f);
            labelRect.offsetMin = Vector2.zero;
            labelRect.offsetMax = Vector2.zero;

            var tmp = labelGO.AddComponent<TextMeshProUGUI>();
            tmp.text = $"[ {def.Name} ]\n<size=60%>{def.Layer} layer</size>";
            tmp.alignment = TextAlignmentOptions.Center;
            tmp.fontSize = 28;
            tmp.color = new Color(0.85f, 0.80f, 1.00f, 0.70f);
            tmp.raycastTarget = false;

            // ── 5. Layer-specific UI stubs ────────────────────────────────────
            AddLayerSpecificStubs(root, def);

            // ── 6. Save prefab ────────────────────────────────────────────────
            var prefab = PrefabUtility.SaveAsPrefabAsset(root, assetPath);
            UnityEngine.Object.DestroyImmediate(root);

            if (prefab != null)
                Debug.Log($"[UIViewPrefabGenerator] Created: {assetPath}");
            else
                Debug.LogError($"[UIViewPrefabGenerator] Failed to save: {assetPath}");
        }

        // ── Layer-specific stub UI ────────────────────────────────────────────
        private static void AddLayerSpecificStubs(GameObject root, ViewDef def)
        {
            // Add a "Back" button stub to all Menu and Popup views for navigation testing
            bool needsBackButton = def.Layer == UILayer.Menu || def.Layer == UILayer.Popup;
            if (!needsBackButton) return;

            var btnGO = CreateChildRect(root.transform, "BackButton_STUB");
            var btnRect = btnGO.GetComponent<RectTransform>();
            btnRect.anchorMin = new Vector2(0f, 1f);
            btnRect.anchorMax = new Vector2(0f, 1f);
            btnRect.pivot     = new Vector2(0f, 1f);
            btnRect.anchoredPosition = new Vector2(20f, -20f);
            btnRect.sizeDelta = new Vector2(120f, 60f);

            var btnImg = btnGO.AddComponent<Image>();
            btnImg.color = new Color(1f, 1f, 1f, 0.15f);

            btnGO.AddComponent<Button>();

            var btnLabelGO = CreateChildRect(btnGO.transform, "Label");
            StretchFull(btnLabelGO.GetComponent<RectTransform>());
            var btnLabel = btnLabelGO.AddComponent<TextMeshProUGUI>();
            btnLabel.text = "← Back";
            btnLabel.alignment = TextAlignmentOptions.Center;
            btnLabel.fontSize = 18;
            btnLabel.color = Color.white;
            btnLabel.raycastTarget = false;
        }

        // ── Fix NFrameworkConfigSO ────────────────────────────────────────────
        // uiViewsFolderPath should point to where the prefabs live so UIView
        // OnValidate can check for duplicate keys.
        private static void FixNFrameworkConfig()
        {
            const string configPath = "Assets/NFrameworkConfigSO.asset";
            var config = AssetDatabase.LoadAssetAtPath<NFrameworkConfigSO>(configPath);
            if (config == null)
            {
                Debug.LogWarning("[UIViewPrefabGenerator] NFrameworkConfigSO not found — skipping config fix.");
                return;
            }

            var so = new SerializedObject(config);

            // uiViewsFolderPath must be relative to Assets/
            var uiPath = so.FindProperty("uiViewsFolderPath");
            if (uiPath != null && uiPath.stringValue != "Resources/UI")
            {
                uiPath.stringValue = "Resources/UI";
                so.ApplyModifiedProperties();
                EditorUtility.SetDirty(config);
                Debug.Log("[UIViewPrefabGenerator] Fixed NFrameworkConfigSO.uiViewsFolderPath = \"Resources/UI\"");
            }
        }

        // ── Helpers ───────────────────────────────────────────────────────────
        private static void StretchFull(RectTransform rect)
        {
            rect.anchorMin    = Vector2.zero;
            rect.anchorMax    = Vector2.one;
            rect.offsetMin    = Vector2.zero;
            rect.offsetMax    = Vector2.zero;
            rect.localScale   = Vector3.one;
            rect.localPosition = Vector3.zero;
        }

        private static GameObject CreateChildRect(Transform parent, string name)
        {
            var go = new GameObject(name);
            go.AddComponent<RectTransform>();
            go.transform.SetParent(parent, false);
            return go;
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;

            var parts   = path.Split('/');
            var current = parts[0];
            for (int i = 1; i < parts.Length; i++)
            {
                var next = current + "/" + parts[i];
                if (!AssetDatabase.IsValidFolder(next))
                    AssetDatabase.CreateFolder(current, parts[i]);
                current = next;
            }
        }

        // ── ViewDef helper ────────────────────────────────────────────────────
        private readonly struct ViewDef
        {
            public readonly string   Name;
            public readonly UILayer  Layer;
            public readonly Type     ViewType;

            public ViewDef(string name, UILayer layer, Type viewType)
            {
                Name     = name;
                Layer    = layer;
                ViewType = viewType;
            }
        }
    }
}
#endif
