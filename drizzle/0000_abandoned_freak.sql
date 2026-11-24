CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`start_minute` integer NOT NULL,
	`end_minute` integer NOT NULL,
	`service_name` text NOT NULL,
	`mode` text NOT NULL,
	`customer_name` text,
	`phone` text,
	`neighborhood` text,
	`status` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `occupied_blocks` (
	`date` text NOT NULL,
	`minute` integer NOT NULL,
	`appointment_id` text NOT NULL,
	PRIMARY KEY(`date`, `minute`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
