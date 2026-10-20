import type { Config, Context } from "@netlify/functions";
import { randomUUID } from "node:crypto";
import { and, count, eq, gt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { sessoes, tentativas } from "../../db/schema.js";
import { JANELA_TENTATIVAS_MIN, LIMITE_TENTATIVAS, erro, hashIp, lerJson, nomePermitido } from "../../lib/util.js";

export default async (req: Request, context: Context) => {
  const body = await lerJson(req);
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";

  if (!nome) return erro(400, "Digite seu nome 💜");
  if (nome.length > 60) return erro(400, "Esse nome é grande demais.");

  const ipHash = hashIp(context.ip);
  const desde = new Date(Date.now() - JANELA_TENTATIVAS_MIN * 60 * 1000);

  try {
    const [{ total }] = await db
      .select({ total: count() })
      .from(tentativas)
      .where(and(eq(tentativas.ipHash, ipHash), gt(tentativas.createdAt, desde)));

    if (total >= LIMITE_TENTATIVAS) {
      return erro(429, "Muitas tentativas. Respire fundo e tente de novo daqui a pouco.", {
        tenteEmMin: JANELA_TENTATIVAS_MIN,
      });
    }

    const permitido = nomePermitido(nome);
    await db.insert(tentativas).values({ nomeDigitado: nome, permitido, ipHash });

    if (!permitido) {
      return Response.json({ ok: true, permitido: false });
    }

    const token = randomUUID();
    await db.insert(sessoes).values({ token, nome });

    return Response.json({
      ok: true,
      permitido: true,
      token,
      saudacao: `${nome}, uma doce garota 💖`,
    });
  } catch (e) {
    console.error("Falha ao processar entrada", e);
    return erro(500, "Algo deu errado do nosso lado. Tente novamente.");
  }
};

export const config: Config = {
  path: "/api/entrar",
  method: "POST",
};
