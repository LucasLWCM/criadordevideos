import React from "react";
import { Img } from "remotion";

interface FooterProps {
  arroba: string;
  avatarSrc: string;
}

export const Footer: React.FC<FooterProps> = ({ arroba, avatarSrc }) => {
  // Avatar: 405×170px, centro em X=551, Y=1305 (51% × 68% de 1080×1920)
  const avatarW = 405;
  const avatarH = 170;
  const avatarLeft = 551 - avatarW / 2; // ≈ 348px
  const avatarTop  = 1305 - avatarH / 2; // ≈ 1220px

  return (
    <>
      {/* Avatar horizontal — bloco visual grande, não compete com a frase */}
      <div
        style={{
          position: "absolute",
          left: avatarLeft,
          top: avatarTop,
          width: avatarW,
          height: avatarH,
          zIndex: 20,
        }}
      >
        <Img
          src={avatarSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Arroba no rodapé */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 20,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: 32,
            fontFamily: "inherit",
            letterSpacing: "0.04em",
            textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            whiteSpace: "nowrap",
          }}
        >
          @{arroba}
        </span>
      </div>
    </>
  );
};
