import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
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
  const blockWidth = 860;
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

export const VarianteC: React.FC<VideoProps> = ({
  frase,
  autor,
  imagem,
  musica,
  arroba,
  avatar,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Zoom lento
  const zoomScale = interpolate(frame, [0, TIMING.A_HOLD_END], [1.0, 1.06], {
    extrapolateRight: "clamp",
  });

  // Drift vertical suave
  const driftY = interpolate(frame, [0, TIMING.TOTAL_FRAMES], [0, -28], {
    extrapolateRight: "clamp",
  });

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

  const fraseOpacity = 1;
  const fraseScale = 1;
  const autorOpacity = 1;

  const fontSize = calcFontSizeC(frase);
  const autorFontSize = Math.round(fontSize * 0.57);

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily }}>
      <Audio src={staticFile(musica)} volume={musicVolume} />

      {/* Imagem: zoom + drift vertical */}
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          transform: `scale(${zoomScale}) translateY(${driftY}px)`,
        }}
      >
        <Img
          src={staticFile(imagem)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Tint quente — diferencia visualmente de A e B */}
      <AbsoluteFill
        style={{
          background: "rgba(40, 18, 0, 0.32)",
          opacity: fadeOut,
        }}
      />

      {/* Texto */}
      <AbsoluteFill style={{ opacity: fadeOut }}>
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
          <p
            style={{
              color: "#F5F0E8",
              fontSize,
              fontFamily: "inherit",
              fontWeight: 400,
              textAlign: "center",
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              textShadow: "0 2px 10px rgba(0,0,0,0.75), 0 10px 40px rgba(0,0,0,0.55)",
              margin: 0,
              opacity: fraseOpacity,
              transform: `scale(${fraseScale})`,
            }}
          >
            {frase}
          </p>

          <p
            style={{
              color: "rgba(245,240,232,0.65)",
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
