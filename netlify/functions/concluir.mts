import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { sessoes } from "../../db/schema.js";
import { buscarSessaoValida } from "../../lib/sessao.js";
import { erro, lerJson } from "../../lib/util.js";

// Registra que a experiência chegou até a tela final.
export default async (req: Request) => {
  const body = await lerJson(req);
  try {
    const sessao = await buscarSessaoValida(body?.token);
    if (!sessao) return erro(401, "Sessão inválida ou expirada.");

    if (!sessao.concluidaEm) {
      await db.update(sessoes).set({ concluidaEm: new Date() }).where(eq(sessoes.token, sessao.token));
    }
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Falha ao concluir sessão", e);
    return erro(500, "Não foi possível registrar.");
  }
};

export const config: Config = {
  path: "/api/concluir",
  method: "POST",
};
