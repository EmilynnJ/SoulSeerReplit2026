import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("client"),
  fullName: text("full_name"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const readers = pgTable("readers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  displayName: text("display_name").notNull(),
  specialties: text("specialties").array().notNull().default(sql`ARRAY[]::text[]`),
  aboutMe: text("about_me"),
  yearsExperience: integer("years_experience"),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  isOnline: boolean("is_online").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  chatRate: decimal("chat_rate", { precision: 6, scale: 2 }).notNull().default("3.99"),
  voiceRate: decimal("voice_rate", { precision: 6, scale: 2 }).notNull().default("4.99"),
  videoRate: decimal("video_rate", { precision: 6, scale: 2 }).notNull().default("5.99"),
  totalReadings: integer("total_readings").notNull().default(0),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).notNull().default("0.00"),
  pendingPayout: decimal("pending_payout", { precision: 10, scale: 2 }).notNull().default("0.00"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  readerId: varchar("reader_id").notNull().references(() => readers.id),
  type: text("type").notNull(),
  status: text("status").notNull().default("pending"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"),
  ratePerMinute: decimal("rate_per_minute", { precision: 6, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  readerEarnings: decimal("reader_earnings", { precision: 10, scale: 2 }),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  sessionId: varchar("session_id").references(() => sessions.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  isPaid: boolean("is_paid").notNull().default(false),
  price: decimal("price", { precision: 6, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id),
  clientId: varchar("client_id").notNull().references(() => users.id),
  readerId: varchar("reader_id").notNull().references(() => readers.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  readerResponse: text("reader_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  readerId: varchar("reader_id").references(() => readers.id),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  image: text("image"),
  digitalFileUrl: text("digital_file_url"),
  inventory: integer("inventory"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  shippingAddress: jsonb("shipping_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  referenceId: varchar("reference_id"),
  referenceType: text("reference_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull().references(() => users.id),
  readerId: varchar("reader_id").notNull().references(() => readers.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  reader: one(readers, {
    fields: [users.id],
    references: [readers.userId],
  }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  clientSessions: many(sessions, { relationName: "client" }),
  orders: many(orders),
  transactions: many(transactions),
  favorites: many(favorites),
  reviews: many(reviews),
}));

export const readersRelations = relations(readers, ({ one, many }) => ({
  user: one(users, {
    fields: [readers.userId],
    references: [users.id],
  }),
  sessions: many(sessions),
  products: many(products),
  reviews: many(reviews),
  favoritedBy: many(favorites),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  client: one(users, {
    fields: [sessions.clientId],
    references: [users.id],
    relationName: "client",
  }),
  reader: one(readers, {
    fields: [sessions.readerId],
    references: [readers.id],
  }),
  messages: many(messages),
  review: one(reviews),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  session: one(sessions, {
    fields: [reviews.sessionId],
    references: [sessions.id],
  }),
  client: one(users, {
    fields: [reviews.clientId],
    references: [users.id],
  }),
  reader: one(readers, {
    fields: [reviews.readerId],
    references: [readers.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  reader: one(readers, {
    fields: [products.readerId],
    references: [readers.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  client: one(users, {
    fields: [orders.clientId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  client: one(users, {
    fields: [favorites.clientId],
    references: [users.id],
  }),
  reader: one(readers, {
    fields: [favorites.readerId],
    references: [readers.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  balance: true,
});

export const insertReaderSchema = createInsertSchema(readers).omit({
  id: true,
  createdAt: true,
  totalReadings: true,
  totalEarnings: true,
  pendingPayout: true,
  rating: true,
  reviewCount: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReader = z.infer<typeof insertReaderSchema>;
export type Reader = typeof readers.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export type ReaderWithUser = Reader & { user: User };
