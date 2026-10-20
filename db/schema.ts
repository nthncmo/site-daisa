import { pgTable, serial, text, timestamp, boolean, index } from "drizzle-orm/pg-core";

// Cada tentativa de entrada (permitida ou não). Usada para o limite de tentativas por IP.
export const tentativas = pgTable(
  "tentativas",
  {
    id: serial().primaryKey(),
    nomeDigitado: text("nome_digitado").notNull(),
    permitido: boolean().notNull(),
    ipHash: text("ip_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("tentativas_ip_created_idx").on(t.ipHash, t.createdAt)],
);

// Sessões criadas quando o nome é reconhecido. O token autoriza o envio de respostas.
export const sessoes = pgTable("sessoes", {
  token: text().primaryKey(),
  nome: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  concluidaEm: timestamp("concluida_em"),
});

// Mensagens que ela deixa na tela final.
export const respostas = pgTable("respostas", {
  id: serial().primaryKey(),
  token: text()
    .notNull()
    .references(() => sessoes.token),
  mensagem: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
