CREATE TABLE "oauth_login_attempts" (
	"token_hash" varchar(255) PRIMARY KEY NOT NULL,
	"state" text NOT NULL,
	"nonce" text NOT NULL,
	"code_verifier" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "surName" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "age" DROP NOT NULL;