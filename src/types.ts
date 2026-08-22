export type Variante = "A" | "B" | "C";
export type PosicaoFrase = "centro" | "topo";

export interface VideoProps {
  frase: string;
  autor: string;
  imagem: string;
  musica: string;
  duracao: number;
  variante: Variante;
  posicao_frase: PosicaoFrase;
  arroba: string;
  avatar: string;
  tema?: string;
}
