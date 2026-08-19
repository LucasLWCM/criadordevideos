import React from "react";

// Font size dinâmico — frases curtas → fonte maior, longas → menor
function calcFontSize(frase: string): number {
  const len = frase.length;
  if (len <= 60) return 45;
  if (len <= 100) return 41;
  if (len <= 150) return 37;
  if (len <= 200) return 33;
  return Math.max(28, 33 - Math.floor((len - 200) / 20));
}

interface TextLayerProps {
  frase: string;
  autor: string;
  fraseOpacity: number;
  fraseY: number;
  autorOpacity: number;
  autorY: number;
}

export const TextLayer: React.FC<TextLayerProps> = ({
  frase,
  autor,
  fraseOpacity,
  fraseY,
  autorOpacity,
  autorY,
}) => {
  const fontSize = calcFontSize(frase);
  const autorFontSize = Math.round(fontSize * 0.80);

  return (
    <>
      {/* Citação — centro fixo em Y=565px (29,5% de 1920) */}
      <div
        style={{
          position: "absolute",
          left: 170,
          right: 170,
          top: 565,
          transform: `translateY(calc(-50% + ${fraseY}px))`,
          zIndex: 20,
          opacity: fraseOpacity,
        }}
      >
        <p
          style={{
            color: "#fff",
            fontSize,
            fontFamily: "inherit",
            fontWeight: 400,
            textAlign: "center",
            lineHeight: 1.2,
            textShadow: "0 4px 24px rgba(0,0,0,0.9)",
            margin: 0,
          }}
        >
          {frase}
        </p>
      </div>

      {/* Autor — centro fixo em Y=740px (38,5% de 1920) */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 740,
          transform: `translateY(calc(-50% + ${autorY}px))`,
          zIndex: 20,
          opacity: autorOpacity,
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.70)",
            fontSize: autorFontSize,
            fontFamily: "inherit",
            fontWeight: 300,
            textAlign: "center",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textShadow: "0 2px 12px rgba(0,0,0,0.9)",
            margin: 0,
          }}
        >
          — {autor}
        </p>
      </div>
    </>
  );
};
