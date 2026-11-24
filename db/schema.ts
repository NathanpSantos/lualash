import { boolean, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  startMinute: integer("start_minute").notNull(),
  endMinute: integer("end_minute").notNull(),
  serviceName: text("service_name").notNull(),
  mode: text("mode").notNull(),
  customerName: text("customer_name"),
  phone: text("phone"),
  neighborhood: text("neighborhood"),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
});

export const occupiedBlocks = pgTable(
  "occupied_blocks",
  {
    date: text("date").notNull(),
    minute: integer("minute").notNull(),
    appointmentId: text("appointment_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.date, t.minute] })],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  priceCents: integer("price_cents"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
});
