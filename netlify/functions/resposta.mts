import type { Config } from "@netlify/functions";
import { count, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { respostas } from "../../db/schema.js";
import { buscarSessaoValida } from "../../lib/sessao.js";
import { MAX_MENSAGEM, erro, lerJson } from "../../lib/util.js";

const MAX_RESPOSTAS_POR_SESSAO = 5;

export default async (req: Request) => {
  const body = await lerJson(req);
  const mensagem = typeof body?.mensagem === "string" ? body.mensagem.trim() : "";

  if (!mensagem) return erro(400, "Escreva alguma coisinha antes de enviar 💌");
  if (mensagem.length > MAX_MENSAGEM) return erro(400, `A mensagem pode ter até ${MAX_MENSAGEM} caracteres.`);

  try {
    const sessao = await buscarSessaoValida(body?.token);
    if (!sessao) return erro(401, "Sua sessão expirou. Recarregue a página para começar de novo.");

    const [{ total }] = await db
      .select({ total: count() })
      .from(respostas)
      .where(eq(respostas.token, sessao.token));
    if (total >= MAX_RESPOSTAS_POR_SESSAO) {
      return erro(429, "Você já mandou várias mensagens por aqui 💜");
    }

    await db.insert(respostas).values({ token: sessao.token, mensagem });
    return Response.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Falha ao salvar resposta", e);
    return erro(500, "Não consegui guardar sua mensagem. Tente novamente.");
  }
};

export const config: Config = {
  path: "/api/resposta",
  method: "POST",
};
