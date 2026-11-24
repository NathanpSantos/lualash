CREATE TABLE "appointments" (
	"id" text PRIMARY KEY,
	"date" text NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	"service_name" text NOT NULL,
	"mode" text NOT NULL,
	"customer_name" text,
	"phone" text,
	"neighborhood" text,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "occupied_blocks" (
	"date" text,
	"minute" integer,
	"appointment_id" text NOT NULL,
	CONSTRAINT "occupied_blocks_pkey" PRIMARY KEY("date","minute")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"price_cents" integer,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" text NOT NULL
);
