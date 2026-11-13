CREATE TABLE "oauth_accounts" (
	"user_id" integer NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_sub" varchar(255) NOT NULL,
	CONSTRAINT "oauth_accounts_provider_provider_sub_unique" UNIQUE("provider","provider_sub")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET DEFAULT 'https://api.dicebear.com/10.x/lorelei/svg?seed=default';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");