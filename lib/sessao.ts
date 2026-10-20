import { and, eq, gt } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessoes } from "../db/schema.js";
import { VALIDADE_SESSAO_H } from "./util.js";

export async function buscarSessaoValida(token: unknown) {
  if (typeof token !== "string" || !/^[0-9a-f-]{36}$/.test(token)) return null;
  const limite = new Date(Date.now() - VALIDADE_SESSAO_H * 60 * 60 * 1000);
  const [sessao] = await db
    .select()
    .from(sessoes)
    .where(and(eq(sessoes.token, token), gt(sessoes.createdAt, limite)))
    .limit(1);
  return sessao ?? null;
}
