// Story 2.1 — Star Glow Shader (URP 2D, Unity 6)
// Author: Constellation Weaver team
// Target: URP 2D — Sprite/Unlit pipeline
// Platform: Mobile (iOS/Android)
//
// Effect: bright star core (#FFF4D6) with soft outer glow (#FFDB8E at 40% alpha)
// Supports animatable _Intensity for twinkle animation driven by C# scripts.

Shader "ConstellationWeaver/StarGlow"
{
    Properties
    {
        [Header(Core)]
        _MainTex ("Sprite Texture", 2D) = "white" {}
        _CoreColor ("Core Color", Color) = (1.0, 0.957, 0.839, 1.0)    // #FFF4D6

        [Header(Glow)]
        _GlowColor ("Glow Color", Color) = (1.0, 0.859, 0.557, 0.4)   // #FFDB8E @ 40%
        _GlowRadius ("Glow Radius (UV units)", Range(0.0, 1.0)) = 0.35
        _GlowFalloff ("Glow Falloff", Range(0.5, 8.0)) = 3.0

        [Header(Animation)]
        _Intensity ("Intensity (1 = normal, 0 = off)", Range(0.0, 2.0)) = 1.0
    }

    SubShader
    {
        Tags
        {
            "Queue" = "Transparent"
            "RenderType" = "Transparent"
            "RenderPipeline" = "UniversalPipeline"
            "IgnoreProjector" = "True"
        }

        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off

        Pass
        {
            Name "StarGlow"
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
                float4 color      : COLOR;
            };

            struct Varyings
            {
                float4 positionCS : SV_POSITION;
                float2 uv         : TEXCOORD0;
                float4 color      : COLOR;
            };

            TEXTURE2D(_MainTex);
            SAMPLER(sampler_MainTex);

            CBUFFER_START(UnityPerMaterial)
                float4 _MainTex_ST;
                half4  _CoreColor;
                half4  _GlowColor;
                half   _GlowRadius;
                half   _GlowFalloff;
                half   _Intensity;
            CBUFFER_END

            Varyings vert(Attributes IN)
            {
                Varyings OUT;
                OUT.positionCS = TransformObjectToHClip(IN.positionOS.xyz);
                OUT.uv = TRANSFORM_TEX(IN.uv, _MainTex);
                OUT.color = IN.color;
                return OUT;
            }

            half4 frag(Varyings IN) : SV_Target
            {
                half4 sprite = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, IN.uv);
                
                // Distance from UV center (0.5, 0.5)
                float2 centeredUV = IN.uv - 0.5;
                float dist = length(centeredUV);

                // Core: sharp bright center
                half coreMask = sprite.a;

                // Glow: smooth radial falloff beyond _GlowRadius
                // Use step/smoothstep — avoid branching in fragment shader
                half glowMask = smoothstep(_GlowRadius, 0.0, dist);
                glowMask = pow(glowMask, _GlowFalloff);

                // Composite: core on top of glow
                half4 glowContrib = _GlowColor * glowMask;
                half4 coreContrib = _CoreColor * coreMask;

                half4 result = lerp(glowContrib, coreContrib, coreMask);
                result.a = max(glowContrib.a * glowMask, coreContrib.a);
                result *= _Intensity;
                result *= IN.color; // Respect vertex tint

                return result;
            }
            ENDHLSL
        }
    }

    FallBack "Hidden/InternalErrorShader"
}
