ALTER TABLE "users" ADD COLUMN "name" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "surName" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "age" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" varchar DEFAULT ('https://api.dicebear.com/10.x/lorelei/svg?seed=' || 1) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "email_check" CHECK ("users"."email" LIKE '%@%');--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "age_check" CHECK ("users"."age" >= 12 AND "users"."age" <= 150);