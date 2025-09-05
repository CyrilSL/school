CREATE TABLE IF NOT EXISTS "t3_better_auth_parent_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text,
	"phone" text,
	"address" text,
	"pan_card_number" text,
	"alternate_email" text,
	"occupation" text,
	"annual_income" numeric(12, 2),
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"relation_to_student" text,
	"is_onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "t3_better_auth_parent_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "t3_better_auth_parent_profile" ADD CONSTRAINT "t3_better_auth_parent_profile_user_id_t3_better_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3_better_auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
