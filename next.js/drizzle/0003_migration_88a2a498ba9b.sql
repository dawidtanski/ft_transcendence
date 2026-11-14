CREATE TABLE "oauth_accounts" (
	"user_id" integer NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_sub" varchar(255) NOT NULL,
	CONSTRAINT "oauth_accounts_provider_provider_sub_unique" UNIQUE("provider","provider_sub")
);
--> statement-breakpoint
CREATE TABLE "oauth_login_attempts" (
	"token_hash" varchar(255) PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"nonce" text NOT NULL,
	"code_verifier" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_rate_limits" (
	"key_hash" varchar(64) PRIMARY KEY NOT NULL,
	"attempts" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_sessions" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"idle_expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "surName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "age" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "avatar_url" SET DEFAULT 'https://api.dicebear.com/10.x/lorelei/svg?seed=default';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "login_rate_limits_reset_idx" ON "login_rate_limits" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "login_sessions_user_idx" ON "login_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "login_sessions_expiry_idx" ON "login_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "login_sessions_idle_expiry_idx" ON "login_sessions" USING btree ("idle_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_normalized_unique" ON "users" USING btree (lower(btrim("email")));