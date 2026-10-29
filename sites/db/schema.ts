import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pageViews = sqliteTable(
  "page_views",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    visitedAt: integer("visited_at").notNull(),
    path: text("path").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    country: text("country"),
    region: text("region"),
    city: text("city"),
    referrer: text("referrer"),
  },
  (table) => [
    index("idx_page_views_visited_at").on(table.visitedAt),
    index("idx_page_views_path_visited_at").on(table.path, table.visitedAt),
    index("idx_page_views_visitor_hash").on(table.visitorHash),
  ],
);
