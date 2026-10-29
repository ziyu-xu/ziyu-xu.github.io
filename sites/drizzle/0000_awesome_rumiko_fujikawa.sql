CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visited_at` integer NOT NULL,
	`path` text NOT NULL,
	`visitor_hash` text NOT NULL,
	`country` text,
	`region` text,
	`city` text,
	`referrer` text
);
--> statement-breakpoint
CREATE INDEX `idx_page_views_visited_at` ON `page_views` (`visited_at`);--> statement-breakpoint
CREATE INDEX `idx_page_views_path_visited_at` ON `page_views` (`path`,`visited_at`);--> statement-breakpoint
CREATE INDEX `idx_page_views_visitor_hash` ON `page_views` (`visitor_hash`);