-- Add locations and boards columns to institution table
ALTER TABLE "institution" ADD COLUMN "locations" json DEFAULT '[]';
--> statement-breakpoint
ALTER TABLE "institution" ADD COLUMN "boards" json DEFAULT '[]';