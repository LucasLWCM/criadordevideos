import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { VideoProps } from "../types";
import { TIMING } from "../lib/timing";
import { fontFamily } from "../lib/fonts";
import { Footer } from "../components/Footer";
import { Vignette } from "../components/Vignette";
import { FilmGrain } from "../components/FilmGrain";

function calcFontSizeC(frase: string): number {
  const blockWidth = 860; // 1080 - 2*110px
  const charWidthRatio = 0.52;

  const tiers = [
    { maxLines: 2, size: 69 },
    { maxLines: 3, size: 63 },
    { maxLines: 4, size: 57 },
    { maxLines: 5, size: 51 },
    { maxLines: 6, size: 46 },
  ];

  for (const { maxLines, size } of tiers) {
    const charsPerLine = Math.floor(blockWidth / (size * charWidthRatio));
    if (Math.ceil(frase.length / charsPerLine) <= maxLines) return size;
  }

  return 42;
}

// Micro jitter orgânico — amplitude muito menor que Variante B
function calcMicroJitter(frame: number): { x: number; y: number; rot: number } {
  const t = frame / 30;
  const x =
    Math.sin(t * 1.31 + 0.7) * 2.5 +
    Math.sin(t * 3.17 + 2.1) * 1.2 +
    Math.sin(t * 7.43 + 1.4) * 0.5;
  const y =
    Math.sin(t * 0.97 + 1.2) * 2.0 +
    Math.sin(t * 2.53 + 0.5) * 1.0 +
    Math.sin(t * 5.91 + 2.7) * 0.4;
  const rot =
    Math.sin(t * 0.73 + 1.1) * 0.08 +
    Math.sin(t * 1.97 + 0.3) * 0.04;
  return { x, y, rot };
}

export const VarianteC: React.FC<VideoProps> = ({
  frase,
  autor,
  imagem,
  musica,
  arroba,
  avatar,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Vertical drift — imagem sobe lentamente ao longo de todo o vídeo
  const driftY = interpolate(frame, [0, TIMING.TOTAL_FRAMES], [0, -32], {
    extrapolateRight: "clamp",
  });

  // Zoom suave
  const zoomScale = interpolate(frame, [0, TIMING.A_HOLD_END], [1.0, 1.05], {
    extrapolateRight: "clamp",
  });

  // Micro jitter
  const { x: jX, y: jY, rot: jRot } = calcMicroJitter(frame);

  // Blur "respirando" — oscila levemente
  const blurAmount = 1.8 + Math.sin((frame / 30) * 0.61) * 0.5;

  // Wave displacement — scale oscila para efeito de onda contínua
  const waveScale = 7 + Math.sin((frame / 30) * 0.38) * 3;

  // Aberração cromática — amplitude oscilante sutil
  const caAmplitude = 2.0 + Math.sin((frame / 30) * 1.13) * 0.8 + Math.sin((frame / 30) * 2.31) * 0.3;

  // Fade out global
  const fadeOut = interpolate(
    frame,
    [TIMING.A_HOLD_END, TIMING.A_FADE_OUT_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const musicVolume = interpolate(
    frame,
    [TIMING.A_HOLD_END, TIMING.A_FADE_OUT_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Autor entra com spring suave
  const autorProgress = spring({
    frame: frame - 60,
    fps,
    config: { damping: 20, stiffness: 70, mass: 1 },
  });
  const autorOpacity = interpolate(autorProgress, [0, 1], [0, 1]);
  const autorY = interpolate(autorProgress, [0, 1], [16, 0]);

  const fontSize = calcFontSizeC(frase);
  const autorFontSize = Math.round(fontSize * 0.57);

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily }}>
      <Audio src={staticFile(musica)} volume={musicVolume} />

      {/*
        SVG filter combinado: wave displacement + gaussian blur + chromatic aberration.
        Aplicado à imagem em sequência: onda → blur → split RGB com offset.
      */}
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id="vc-combined" x="-5%" y="-5%" width="110%" height="110%">
            {/* 1. Wave distortion com turbulência suave */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.006"
              numOctaves="2"
              seed={42}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={waveScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="waved"
            />

            {/* 2. Blur atmosférico sobre resultado da onda */}
            <feGaussianBlur in="waved" stdDeviation={blurAmount} result="blurred" />

            {/* 3. Chromatic aberration — split R/G/B com offset horizontal */}
            <feColorMatrix
              in="blurred"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="r_ch"
            />
            <feOffset in="r_ch" dx={caAmplitude} dy={0} result="r_shifted" />

            <feColorMatrix
              in="blurred"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="g_ch"
            />

            <feColorMatrix
              in="blurred"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="b_ch"
            />
            <feOffset in="b_ch" dx={-caAmplitude} dy={0} result="b_shifted" />

            <feBlend in="r_shifted" in2="g_ch" mode="screen" result="rg" />
            <feBlend in="rg" in2="b_shifted" mode="screen" />
          </filter>
        </defs>
      </svg>

      {/* Imagem com todos os efeitos: drift + jitter + zoom + filtro combinado */}
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          transform: `scale(${zoomScale}) translate(${jX}px, ${jY + driftY}px) rotate(${jRot}deg)`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            filter: "url(#vc-combined)",
          }}
        >
          <Img
            src={staticFile(imagem)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </AbsoluteFill>

      {/* Overlay global — 25% preto suave acompanha fade da imagem */}
      <AbsoluteFill
        style={{
          background: "rgba(0,0,0,0.25)",
          opacity: fadeOut,
        }}
      />

      {/* Texto e UI — completamente estáticos, sem influência do movimento do fundo */}
      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Bloco de texto centralizado em 40% da altura (768px de 1920) */}
        <div
          style={{
            position: "absolute",
            left: 110,
            right: 110,
            top: 768,
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 20,
          }}
        >
          {/* Overlay localizado atrás do bloco — halo escuro suave */}
          <div
            style={{
              position: "absolute",
              inset: "-80px -100px",
              background:
                "radial-gradient(ellipse 88% 82% at 50% 46%, rgba(0,0,0,0.16) 0%, transparent 100%)",
              zIndex: -1,
              pointerEvents: "none",
            }}
          />

          {/* Citação */}
          <p
            style={{
              color: "#F5F3EE",
              fontSize,
              fontFamily: "inherit",
              fontWeight: 400,
              textAlign: "center",
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              textShadow:
                "0 2px 10px rgba(0,0,0,0.75), 0 10px 40px rgba(0,0,0,0.55)",
              margin: 0,
            }}
          >
            {frase}
          </p>

          {/* Autor — mesma fonte herdada do sistema, escala menor */}
          <p
            style={{
              color: "rgba(245,243,238,0.65)",
              fontSize: autorFontSize,
              fontFamily: "inherit",
              fontWeight: 300,
              textAlign: "center",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textShadow: "0 2px 12px rgba(0,0,0,0.85)",
              margin: 0,
              marginTop: 44,
              opacity: autorOpacity,
              transform: `translateY(${autorY}px)`,
            }}
          >
            — {autor}
          </p>
        </div>

        <Footer arroba={arroba} avatarSrc={staticFile(avatar)} />
        <Vignette />
        <FilmGrain opacity={0.05} width={width} height={height} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
