import React, { useRef, useLayoutEffect } from "react";
import { useCurrentFrame } from "remotion";

interface FilmGrainProps {
  opacity?: number;
  width: number;
  height: number;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({
  opacity = 0.04,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    let seed = frame * 9301 + 49297;
    for (let i = 0; i < data.length; i += 4) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const v = (seed >> 16) & 0xff;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
  }, [frame, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        zIndex: 11,
      }}
    />
  );
};
