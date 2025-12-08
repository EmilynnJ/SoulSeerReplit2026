import {
  users, readers, sessions, messages, reviews, products, orders, transactions, favorites,
  type User, type InsertUser,
  type Reader, type InsertReader,
  type Session, type InsertSession,
  type Message, type InsertMessage,
  type Review, type InsertReview,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Transaction, type InsertTransaction,
  type Favorite, type InsertFavorite,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  getReader(id: string): Promise<Reader | undefined>;
  getReaderByUserId(userId: string): Promise<Reader | undefined>;
  createReader(reader: InsertReader): Promise<Reader>;
  updateReader(id: string, data: Partial<Reader>): Promise<Reader | undefined>;
  getAllReaders(): Promise<Reader[]>;
  getOnlineReaders(): Promise<Reader[]>;
  getApprovedReaders(): Promise<Reader[]>;

  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  updateSession(id: string, data: Partial<Session>): Promise<Session | undefined>;
  getSessionsByClient(clientId: string): Promise<Session[]>;
  getSessionsByReader(readerId: string): Promise<Session[]>;
  getAllSessions(): Promise<Session[]>;

  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: string): Promise<Message[]>;
  getConversations(userId: string): Promise<any[]>;
  getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;

  createReview(review: InsertReview): Promise<Review>;
  getReviewsByReader(readerId: string): Promise<Review[]>;

  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByReader(readerId: string): Promise<Product[]>;

  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByClient(clientId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;

  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;

  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(clientId: string, readerId: string): Promise<void>;
  getFavoritesByClient(clientId: string): Promise<(Favorite & { reader: Reader })[]>;
  isFavorite(clientId: string, readerId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getReader(id: string): Promise<Reader | undefined> {
    const [reader] = await db.select().from(readers).where(eq(readers.id, id));
    return reader || undefined;
  }

  async getReaderByUserId(userId: string): Promise<Reader | undefined> {
    const [reader] = await db.select().from(readers).where(eq(readers.userId, userId));
    return reader || undefined;
  }

  async createReader(insertReader: InsertReader): Promise<Reader> {
    const [reader] = await db.insert(readers).values(insertReader).returning();
    return reader;
  }

  async updateReader(id: string, data: Partial<Reader>): Promise<Reader | undefined> {
    const [reader] = await db.update(readers).set(data).where(eq(readers.id, id)).returning();
    return reader || undefined;
  }

  async getAllReaders(): Promise<Reader[]> {
    return db.select().from(readers).orderBy(desc(readers.createdAt));
  }

  async getOnlineReaders(): Promise<Reader[]> {
    return db.select().from(readers).where(and(eq(readers.isOnline, true), eq(readers.isApproved, true)));
  }

  async getApprovedReaders(): Promise<Reader[]> {
    return db.select().from(readers).where(eq(readers.isApproved, true)).orderBy(desc(readers.rating));
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async updateSession(id: string, data: Partial<Session>): Promise<Session | undefined> {
    const [session] = await db.update(sessions).set(data).where(eq(sessions.id, id)).returning();
    return session || undefined;
  }

  async getSessionsByClient(clientId: string): Promise<Session[]> {
    return db.select().from(sessions).where(eq(sessions.clientId, clientId)).orderBy(desc(sessions.createdAt));
  }

  async getSessionsByReader(readerId: string): Promise<Session[]> {
    return db.select().from(sessions).where(eq(sessions.readerId, readerId)).orderBy(desc(sessions.createdAt));
  }

  async getAllSessions(): Promise<Session[]> {
    return db.select().from(sessions).orderBy(desc(sessions.createdAt));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.sessionId, sessionId)).orderBy(messages.createdAt);
  }

  async getConversations(userId: string): Promise<any[]> {
    const sentMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, userId))
      .orderBy(desc(messages.createdAt));

    const receivedMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.receiverId, userId))
      .orderBy(desc(messages.createdAt));

    const allMessages = [...sentMessages, ...receivedMessages];
    const conversationMap = new Map<string, { otherUserId: string; lastMessage: Message; unreadCount: number }>();

    for (const msg of allMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherUserId)) {
        const unread = receivedMessages.filter(m => m.senderId === otherUserId && !m.isRead).length;
        conversationMap.set(otherUserId, {
          otherUserId,
          lastMessage: msg,
          unreadCount: unread,
        });
      }
    }

    const conversationsWithUsers = [];
    for (const [otherUserId, conv] of conversationMap) {
      const otherUser = await this.getUser(otherUserId);
      if (otherUser) {
        conversationsWithUsers.push({
          otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        });
      }
    }

    return conversationsWithUsers.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }

  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(eq(messages.senderId, senderId), eq(messages.receiverId, receiverId)));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    
    const readerReviews = await this.getReviewsByReader(insertReview.readerId);
    const avgRating = readerReviews.reduce((sum, r) => sum + r.rating, 0) / readerReviews.length;
    await this.updateReader(insertReview.readerId, {
      rating: avgRating.toFixed(2),
      reviewCount: readerReviews.length,
    });
    
    return review;
  }

  async getReviewsByReader(readerId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.readerId, readerId)).orderBy(desc(reviews.createdAt));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.createdAt));
  }

  async getProductsByReader(readerId: string): Promise<Product[]> {
    return db.select().from(products).where(eq(products.readerId, readerId)).orderBy(desc(products.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async getOrdersByClient(clientId: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.clientId, clientId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }

  async deleteFavorite(clientId: string, readerId: string): Promise<void> {
    await db.delete(favorites).where(and(eq(favorites.clientId, clientId), eq(favorites.readerId, readerId)));
  }

  async getFavoritesByClient(clientId: string): Promise<(Favorite & { reader: Reader })[]> {
    const favs = await db.select().from(favorites).where(eq(favorites.clientId, clientId));
    const result = [];
    for (const fav of favs) {
      const reader = await this.getReader(fav.readerId);
      if (reader) {
        result.push({ ...fav, reader });
      }
    }
    return result;
  }

  async isFavorite(clientId: string, readerId: string): Promise<boolean> {
    const [fav] = await db.select().from(favorites).where(
      and(eq(favorites.clientId, clientId), eq(favorites.readerId, readerId))
    );
    return !!fav;
  }
}

export const storage = new DatabaseStorage();
