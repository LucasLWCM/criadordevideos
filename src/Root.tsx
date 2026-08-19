import React from "react";
import { Composition } from "remotion";
import { VarianteA } from "./compositions/VarianteA";
import { VarianteB } from "./compositions/VarianteB";
import { VideoProps } from "./types";
import { TIMING } from "./lib/timing";
import "./lib/fonts"; // garante que loadFont() é chamado no bundle

const DEFAULT_PROPS: VideoProps = {
  frase: "Conhece-te a ti mesmo.",
  autor: "Sócrates",
  imagem: "imagens/placeholder.jpg",
  musica: "musica/placeholder.mp3",
  duracao: 8,
  variante: "A",
  posicao_frase: "centro",
  arroba: "rafabarbosa.filosofia",
  avatar: "avatar.png",
  tema: "autoconhecimento",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VarianteA"
        component={VarianteA}
        durationInFrames={TIMING.TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_PROPS}
      />
      <Composition
        id="VarianteB"
        component={VarianteB}
        durationInFrames={TIMING.TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={DEFAULT_PROPS}
      />
    </>
  );
};
