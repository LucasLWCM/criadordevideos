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
import { TextLayer } from "../components/TextLayer";
import { Footer } from "../components/Footer";
import { Vignette } from "../components/Vignette";
import { FilmGrain } from "../components/FilmGrain";

export const VarianteA: React.FC<VideoProps> = ({
  frase,
  autor,
  imagem,
  musica,
  posicao_frase,
  arroba,
  avatar,
}) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Imagem surge do preto (opacity 0 → 1 entre frames 0–60)
  const imagemOpacity = interpolate(
    frame,
    [TIMING.A_IMAGE_REVEAL_START, TIMING.A_IMAGE_REVEAL_END],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Frase visível desde frame 0
  const fraseOpacity = 1;
  const fraseY = 0;

  // Autor entra com spring (a partir do frame 90)
  const autorProgress = spring({
    frame: frame - TIMING.A_AUTOR_IN_START,
    fps,
    config: { damping: 18, stiffness: 80, mass: 1 },
  });
  const autorOpacity = interpolate(autorProgress, [0, 1], [0, 1]);
  const autorY = interpolate(autorProgress, [0, 1], [20, 0]);

  // Zoom lento durante o hold (frames 0–195)
  const zoomScale = interpolate(
    frame,
    [0, TIMING.A_HOLD_END],
    [1.0, 1.08],
    { extrapolateRight: "clamp" }
  );

  // Fade out global (frames 195–240)
  const fadeOut = interpolate(
    frame,
    [TIMING.A_HOLD_END, TIMING.A_FADE_OUT_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Volume da música com fade out no final
  const musicVolume = interpolate(
    frame,
    [TIMING.A_HOLD_END, TIMING.A_FADE_OUT_END],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily }}>
      <Audio src={staticFile(musica)} volume={musicVolume} />

      {/* Imagem de fundo com reveal + zoom — some no fade out */}
      <AbsoluteFill
        style={{
          opacity: imagemOpacity * fadeOut,
          transform: `scale(${zoomScale})`,
        }}
      >
        <Img
          src={staticFile(imagem)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Overlay global — reduz concorrência visual do fundo (acompanha fade da imagem) */}
      <AbsoluteFill
        style={{
          background: "rgba(0,0,0,0.23)",
          opacity: imagemOpacity * fadeOut,
        }}
      />

      {/* Texto — permanece visível até o fim */}
      <TextLayer
        frase={frase}
        autor={autor}
        fraseOpacity={fraseOpacity}
        fraseY={fraseY}
        autorOpacity={autorOpacity}
        autorY={autorY}
      />

      {/* Rodapé e efeitos — somem com o fade out */}
      <AbsoluteFill style={{ opacity: fadeOut }}>
        <Footer arroba={arroba} avatarSrc={staticFile(avatar)} />
        <Vignette />
        <FilmGrain opacity={0.04} width={width} height={height} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
