-- Migration: Add payment table for tracking all payments
-- Created: 2025-09-30

-- Create payment table
CREATE TABLE IF NOT EXISTS "t3_better_auth_payment" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_type" text NOT NULL,
	"payment_method" text DEFAULT 'mock_payment' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" text,
	"fee_application_id" text,
	"installment_id" text,
	"institution_id" text,
	"transaction_id" text,
	"payment_gateway" text DEFAULT 'mock_gateway',
	"payment_date" timestamp,
	"notes" text,
	"metadata" json,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint

-- Add foreign keys
DO $$ BEGIN
 ALTER TABLE "t3_better_auth_payment" ADD CONSTRAINT "t3_better_auth_payment_user_id_t3_better_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."t3_better_auth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "t3_better_auth_payment" ADD CONSTRAINT "t3_better_auth_payment_fee_application_id_t3_better_auth_fee_application_id_fk" FOREIGN KEY ("fee_application_id") REFERENCES "public"."t3_better_auth_fee_application"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "t3_better_auth_payment" ADD CONSTRAINT "t3_better_auth_payment_installment_id_t3_better_auth_installment_id_fk" FOREIGN KEY ("installment_id") REFERENCES "public"."t3_better_auth_installment"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "t3_better_auth_payment" ADD CONSTRAINT "t3_better_auth_payment_institution_id_t3_better_auth_institution_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."t3_better_auth_institution"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;