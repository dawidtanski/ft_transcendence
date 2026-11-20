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
ALTER TABLE "login_sessions" ADD CONSTRAINT "login_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "login_rate_limits_reset_idx" ON "login_rate_limits" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "login_sessions_user_idx" ON "login_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "login_sessions_expiry_idx" ON "login_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "login_sessions_idle_expiry_idx" ON "login_sessions" USING btree ("idle_expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_normalized_unique" ON "users" USING btree (lower(btrim("email")));