// Story 2.2 — Path Gradient Shader (URP 2D, Unity 6)
// Author: Constellation Weaver team
// Target: URP 2D — applied to a LineRenderer material
// Platform: Mobile (iOS/Android)
//
// Effect: cool white (#B8D4FF) at path start → warm gold (#F4E2A8) at current head.
// Uses TEXCOORD0.x as the 0→1 gradient parameter (set automatically by LineRenderer).

Shader "ConstellationWeaver/PathGradient"
{
    Properties
    {
        [Header(Colors)]
        _StartColor ("Start Color (cool white)", Color) = (0.722, 0.831, 1.0, 1.0)  // #B8D4FF
        _EndColor   ("End Color (warm gold)",    Color) = (0.957, 0.886, 0.659, 1.0) // #F4E2A8

        [Header(Stroke)]
        _Alpha ("Global Alpha", Range(0.0, 1.0)) = 0.92
        _EdgeSoftness ("Edge Softness", Range(0.0, 0.5)) = 0.12

        [Header(Texture)]
        _MainTex ("Line Texture (optional)", 2D) = "white" {}
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
            Name "PathGradient"
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
                half4  _StartColor;
                half4  _EndColor;
                half   _Alpha;
                half   _EdgeSoftness;
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
                // LineRenderer UV: x = 0 (start) → 1 (end), y = 0..1 across width
                half t = IN.uv.x;

                // Gradient along the path
                half4 gradColor = lerp(_StartColor, _EndColor, t);

                // Soft edge falloff across stroke width (UV.y goes 0→1)
                half edgeDist = abs(IN.uv.y - 0.5) * 2.0; // 0=center, 1=edge
                half edgeFade = 1.0 - smoothstep(1.0 - _EdgeSoftness, 1.0, edgeDist);

                half4 result = gradColor;
                result.a = gradColor.a * _Alpha * edgeFade;
                result *= IN.color;

                return result;
            }
            ENDHLSL
        }
    }

    FallBack "Hidden/InternalErrorShader"
}
