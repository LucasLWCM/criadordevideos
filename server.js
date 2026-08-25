import express from "express";
import { execFile } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { promisify } from "node:util";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import PQueue from "p-queue";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(__dirname, "output"), { recursive: true });
const execFileAsync = promisify(execFile);

const app = express();
app.use(express.json());
app.use('/output', express.static(path.join(__dirname, 'output')));

// Fila com concorrência 1 — apenas 1 render por vez
const renderQueue = new PQueue({ concurrency: 1 });

const VideoPropsSchema = z.object({
  frase: z.string().min(1),
  autor: z.string().min(1),
  imagem: z.string().min(1),
  musica: z.string().min(1),
  duracao: z.number().default(10),
  variante: z.enum(["A", "B", "C"]),
  posicao_frase: z.enum(["centro", "topo"]),
  arroba: z.string().min(1),
  avatar: z.string().min(1),
  tema: z.string().optional(),
});

app.get("/sortear-assets", (_req, res) => {
  const imagensDir = path.join(__dirname, "assets", "imagens");
  const musicaDir = path.join(__dirname, "assets", "musica");

  const imagens = readdirSync(imagensDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  const musicas = readdirSync(musicaDir).filter(f => /\.(mp3|wav|m4a)$/i.test(f));

  if (imagens.length === 0) return res.status(404).json({ status: "erro", mensagem: "Nenhuma imagem em assets/imagens" });
  if (musicas.length === 0) return res.status(404).json({ status: "erro", mensagem: "Nenhuma música em assets/musica" });

  const imagem = `imagens/${imagens[Math.floor(Math.random() * imagens.length)]}`;
  const musica = `musica/${musicas[Math.floor(Math.random() * musicas.length)]}`;

  res.json({ imagem, musica });
});

app.post("/gerar-video", async (req, res) => {
  const parsed = VideoPropsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      status: "erro",
      detalhes: parsed.error.flatten(),
    });
  }

  const props = parsed.data;
  const compositionId = `Variante${props.variante}`;
  const outputFilename = `${uuidv4()}.mp4`;
  const outputPath = path.join(__dirname, "output", outputFilename);
  const entryPoint = path.join(__dirname, "src", "index.ts");

  console.log(
    `[${new Date().toISOString()}] Enfileirando render: ${compositionId} | fila: ${renderQueue.size + 1}`
  );

  try {
    const arquivo = await renderQueue.add(async () => {
      console.log(
        `[${new Date().toISOString()}] Iniciando render: ${outputFilename}`
      );

      await execFileAsync(
        "npx",
        [
          "remotion",
          "render",
          entryPoint,
          compositionId,
          outputPath,
          "--props",
          JSON.stringify(props),
          "--log=verbose",
        ],
        {
          cwd: __dirname,
          timeout: 15 * 60 * 1000,
          maxBuffer: 50 * 1024 * 1024,
        }
      );

      console.log(
        `[${new Date().toISOString()}] Render concluído: ${outputFilename}`
      );
      return `/output/${outputFilename}`;
    });

    return res.json({ status: "ok", arquivo });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Erro no render:`, err);
    return res.status(500).json({
      status: "erro",
      mensagem: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    fila: renderQueue.size,
    em_execucao: renderQueue.pending,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Motor de vídeo rodando em http://0.0.0.0:${PORT}`);
});
