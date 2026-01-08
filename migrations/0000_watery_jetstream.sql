CREATE TABLE "blood_inventory" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blood_type" text NOT NULL,
	"units_available" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'Available' NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blood_inventory_blood_type_unique" UNIQUE("blood_type")
);
--> statement-breakpoint
CREATE TABLE "blood_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hospital_id" varchar,
	"hospital_name" text NOT NULL,
	"blood_type" text NOT NULL,
	"units_needed" integer NOT NULL,
	"urgency_level" text NOT NULL,
	"location" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"age" integer NOT NULL,
	"gender" text NOT NULL,
	"blood_type" text NOT NULL,
	"location" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"address" text,
	"contact_person" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hospitals_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "statistics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active_donors" integer DEFAULT 0 NOT NULL,
	"total_blood_units" integer DEFAULT 0 NOT NULL,
	"partner_hospitals" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
