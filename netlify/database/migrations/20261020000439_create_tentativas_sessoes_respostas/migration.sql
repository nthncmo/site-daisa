CREATE TABLE "respostas" (
	"id" serial PRIMARY KEY,
	"token" text NOT NULL,
	"mensagem" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"token" text PRIMARY KEY,
	"nome" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"concluida_em" timestamp
);
--> statement-breakpoint
CREATE TABLE "tentativas" (
	"id" serial PRIMARY KEY,
	"nome_digitado" text NOT NULL,
	"permitido" boolean NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "tentativas_ip_created_idx" ON "tentativas" ("ip_hash","created_at");--> statement-breakpoint
ALTER TABLE "respostas" ADD CONSTRAINT "respostas_token_sessoes_token_fkey" FOREIGN KEY ("token") REFERENCES "sessoes"("token");