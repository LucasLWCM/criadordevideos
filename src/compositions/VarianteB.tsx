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
import { TextLayer } from "../components/TextLayer";
import { Footer } from "../components/Footer";
import { Vignette } from "../components/Vignette";
import { FilmGrain } from "../components/FilmGrain";
import { fontFamily } from "../lib/fonts";

/**
 * calcShake — gera deslocamento handheld orgânico e aperiódico.
 *
 * Combina 4 senos por eixo com frequências mutuamente irracionais
 * (razões não-racionais entre si) para evitar repetição visível em 10s.
 * Amplitudes decrescem com a frequência: drift lento nas baixas,
 * micro-jitter nas altas. Fases distintas por eixo garantem que x, y
 * e rot não se movam em sincronia.
 */
function calcShake(frame: number): { x: number; y: number; rot: number } {
  const t = frame / 30;

  // Terremoto: amplitudes altas com frequências rápidas para impacto
  const x =
    Math.sin(t * 1.73) * 14 +
    Math.sin(t * 4.11 + 0.9) * 8 +
    Math.sin(t * 8.33 + 2.1) * 4.5 +
    Math.sin(t * 15.7 + 1.3) * 2;

  const y =
    Math.sin(t * 1.31 + 2.7) * 11 +
    Math.sin(t * 3.97 + 1.2) * 6.5 +
    Math.sin(t * 7.53 + 0.5) * 3.5 +
    Math.sin(t * 13.1 + 2.5) * 1.5;

  const rot =
    Math.sin(t * 0.97 + 1.4) * 0.55 +
    Math.sin(t * 2.43 + 0.7) * 0.28 +
    Math.sin(t * 5.17 + 1.9) * 0.14 +
    Math.sin(t * 9.23 + 3.0) * 0.07;

  return { x, y, rot };
}

export const VarianteB: React.FC<VideoProps> = ({
  frase,
  autor,
  imagem,
  musica,
  posicao_frase,
  arroba,
  avatar,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Zoom lento 1.0 → 1.10 ao longo de 8.5s
  const zoomScale = interpolate(
    frame,
    [0, TIMING.B_HOLD_END],
    [1.0, 1.10],
    { extrapolateRight: "clamp" }
  );

  const { x: shakeX, y: shakeY, rot: shakeRot } = calcShake(frame);

  // Fade out global (frames 255–300)
  const fadeOut = interpolate(
    frame,
    [TIMING.B_HOLD_END, TIMING.B_FADE_OUT_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const musicVolume = interpolate(
    frame,
    [TIMING.B_HOLD_END, TIMING.B_FADE_OUT_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily }}>
      <Audio src={staticFile(musica)} volume={musicVolume} />

      {/* Imagem com zoom + shake — texto fica separado e não treme */}
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          transform: `scale(${zoomScale}) translate(${shakeX}px, ${shakeY}px) rotate(${shakeRot}deg)`,
        }}
      >
        <Img
          src={staticFile(imagem)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Texto sempre visível desde frame 0, sem shake */}
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <TextLayer
          frase={frase}
          autor={autor}
          fraseOpacity={1}
          fraseY={0}
          autorOpacity={1}
          autorY={0}
        />
        <Footer arroba={arroba} avatarSrc={staticFile(avatar)} />
        <Vignette />
        <FilmGrain opacity={0.04} width={width} height={height} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
