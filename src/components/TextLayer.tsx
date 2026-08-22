import React from "react";

// Estima número de linhas para um dado fontSize e retorna o tamanho ideal
function calcFontSize(frase: string): number {
  const blockWidth = 820; // 1080 - 2*130px de margem
  const charWidthRatio = 0.52; // estimativa para serif elegante

  const tiers = [
    { maxLines: 2, size: 66 },
    { maxLines: 3, size: 60 },
    { maxLines: 4, size: 54 },
    { maxLines: 5, size: 48 },
    { maxLines: 6, size: 44 },
  ];

  for (const { maxLines, size } of tiers) {
    const charsPerLine = Math.floor(blockWidth / (size * charWidthRatio));
    if (Math.ceil(frase.length / charsPerLine) <= maxLines) return size;
  }

  return 40;
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
  const autorFontSize = Math.round(fontSize * 0.60);

  return (
    <div
      style={{
        position: "absolute",
        left: 130,
        right: 130,
        top: 510,
        transform: `translateY(calc(-50% + ${fraseY}px))`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 20,
      }}
    >
      {/* Overlay localizado atrás do bloco — halo escuro suave para contraste */}
      <div
        style={{
          position: "absolute",
          inset: "-70px -90px",
          background:
            "radial-gradient(ellipse 90% 80% at 50% 45%, rgba(0,0,0,0.18) 0%, transparent 100%)",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />

      {/* Citação */}
      <p
        style={{
          color: "#F4F1EA",
          fontSize,
          fontFamily: "inherit",
          fontWeight: 400,
          textAlign: "center",
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          textShadow:
            "0 2px 8px rgba(0,0,0,0.70), 0 8px 32px rgba(0,0,0,0.50)",
          margin: 0,
          opacity: fraseOpacity,
        }}
      >
        {frase}
      </p>

      {/* Autor — mesma família tipográfica, escala menor, elegante */}
      <p
        style={{
          color: "rgba(244,241,234,0.68)",
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
  );
};
