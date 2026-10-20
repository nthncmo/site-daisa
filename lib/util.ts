import { createHash } from "node:crypto";

// Nomes reconhecidos — ficam apenas no servidor, fora do HTML público.
const NOMES_PERMITIDOS = new Set(["isa", "isabella", "isabela", "bella", "bela", "isinha"]);

export const LIMITE_TENTATIVAS = 15;
export const JANELA_TENTATIVAS_MIN = 10;
export const VALIDADE_SESSAO_H = 24;
export const MAX_MENSAGEM = 1000;

// Remove espaços, acentos e caixa: " Isabéla " -> "isabela"
export function normalizarNome(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toLowerCase();
}

export function nomePermitido(nome: string): boolean {
  return NOMES_PERMITIDOS.has(normalizarNome(nome));
}

// Guarda apenas um hash do IP, nunca o IP em si.
export function hashIp(ip: string | undefined): string {
  return createHash("sha256").update(`site-daisa:${ip ?? "desconhecido"}`).digest("hex").slice(0, 32);
}

export function erro(status: number, mensagem: string, extra: Record<string, unknown> = {}) {
  return Response.json({ ok: false, erro: mensagem, ...extra }, { status });
}

export async function lerJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
