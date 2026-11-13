CREATE TABLE `rooms` (
	`code` text PRIMARY KEY NOT NULL,
	`state` text NOT NULL,
	`version` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rooms_expires` ON `rooms` (`expires`);