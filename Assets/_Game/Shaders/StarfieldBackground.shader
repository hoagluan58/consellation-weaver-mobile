// Story 2.4 - Starfield Background Shader (URP 2D, Unity 6)
// Author: Constellation Weaver team
// Target: URP 2D - applied to a full-screen quad (Camera background)
// Platform: Mobile (iOS/Android)
//
// Effect: Two-layer procedural star-field, deep navy #050818 background.
// Stars drift slowly (~2px/s) controlled by _ElapsedTime set from StarfieldController.cs.
// No texture reads in the loop - fully procedural, mobile-safe.

Shader "ConstellationWeaver/StarfieldBackground"
{
    Properties
    {
        [Header(Background)]
        _SkyColor ("Sky Color", Color) = (0.02, 0.031, 0.094, 1.0)

        [Header(Layer1 Dense Fine Stars)]
        _StarDensity1 ("Star Density 1", Range(50.0, 300.0)) = 150.0
        _StarBrightness1 ("Star Brightness 1", Range(0.0, 1.0)) = 0.6
        _StarSize1 ("Star Size 1", Range(0.001, 0.05)) = 0.008

        [Header(Layer2 Sparse Bright Stars)]
        _StarDensity2 ("Star Density 2", Range(10.0, 100.0)) = 40.0
        _StarBrightness2 ("Star Brightness 2", Range(0.0, 1.0)) = 1.0
        _StarSize2 ("Star Size 2", Range(0.001, 0.05)) = 0.018

        [Header(Drift)]
        _DriftSpeed ("Drift Speed (UV per sec)", Range(0.0, 0.005)) = 0.0006
        // Driven by StarfieldController.cs every frame - do not key in animations
        _ElapsedTime ("Elapsed Time", Float) = 0.0
    }

    SubShader
    {
        Tags
        {
            "Queue" = "Background"
            "RenderType" = "Opaque"
            "RenderPipeline" = "UniversalPipeline"
        }

        ZWrite Off
        Cull Off

        Pass
        {
            Name "StarfieldBG"
            Tags { "LightMode" = "Universal2D" }

            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 2.0

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float2 uv         : TEXCOORD0;
                UNITY_VERTEX_INPUT_INSTANCE_ID
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float2 uv         : TEXCOORD0;
                UNITY_VERTEX_OUTPUT_STEREO
            };

            CBUFFER_START(UnityPerMaterial)
                half4  _SkyColor;
                half   _StarDensity1;
                half   _StarBrightness1;
                half   _StarSize1;
                half   _StarDensity2;
                half   _StarBrightness2;
                half   _StarSize2;
                half   _DriftSpeed;
                float  _ElapsedTime;
            CBUFFER_END

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                UNITY_SETUP_INSTANCE_ID(IN);
                UNITY_INITIALIZE_VERTEX_OUTPUT_STEREO(OUT);
                OUT.positionCS = TransformObjectToHClip(IN.positionOS.xyz);
                OUT.uv = IN.uv;
                return OUT;
            }

            // Simple hash for procedural star placement - no texture reads, mobile-safe
            float hash(float2 p)
            {
                p = frac(p * float2(127.1, 311.7));
                p += dot(p, p + 19.19);
                return frac(p.x * p.y);
            }

            // Returns star brightness at UV position for a given density and size
            half StarLayer(float2 uv, half density, half starSize, half brightness)
            {
                float2 grid   = uv * density;
                float2 cell   = floor(grid);
                float2 offset = frac(grid) - 0.5;

                // Random position within each cell
                float2 starPos = float2(hash(cell), hash(cell + float2(7.3, 2.1))) - 0.5;
                float dist = length(offset - starPos);

                // smoothstep avoids dynamic branching on mobile
                half star = 1.0 - smoothstep(0.0, starSize, dist);
                return star * brightness * hash(cell + 13.7);
            }

            half4 frag(Varyings IN) : SV_Target
            {
                // Drift UVs slowly over elapsed time
                float2 uv = IN.uv + float2(_DriftSpeed * _ElapsedTime, 0.0);

                half stars1 = StarLayer(uv,                        _StarDensity1, _StarSize1, _StarBrightness1);
                half stars2 = StarLayer(uv + float2(0.3, 0.7),    _StarDensity2, _StarSize2, _StarBrightness2);

                half totalStars = saturate(stars1 + stars2);
                // Slight blue tint on stars for realism
                half4 result = _SkyColor + half4(totalStars * 0.9, totalStars * 0.93, totalStars, 0.0);
                result.a = 1.0;
                return result;
            }
            ENDHLSL
        }
    }

    FallBack "Hidden/InternalErrorShader"
}
