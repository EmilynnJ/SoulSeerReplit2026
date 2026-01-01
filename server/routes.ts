import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import { storage } from "./storage";
import { 
  insertUserSchema, insertReaderSchema, insertSessionSchema,
  insertMessageSchema, insertReviewSchema, insertProductSchema,
  insertOrderSchema, insertFavoriteSchema
} from "@shared/schema";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string): Promise<boolean> {
  const [hashedPassword, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashedPassword, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const activeSessions = new Map<string, Set<WebSocket>>();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const PgStore = connectPgSimple(session);
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  app.use(
    session({
      store: new PgStore({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "soulseer-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      },
    })
  );

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    let currentSessionId: string | null = null;
    let currentUserId: string | null = null;

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "join" && message.sessionId) {
          currentSessionId = message.sessionId;
          currentUserId = message.userId || null;
          const sessionId = currentSessionId as string;
          if (!activeSessions.has(sessionId)) {
            activeSessions.set(sessionId, new Set());
          }
          activeSessions.get(sessionId)!.add(ws);
        } else if (message.type === "typing" && currentSessionId) {
          const clients = activeSessions.get(currentSessionId);
          if (clients) {
            const typingData = JSON.stringify({ 
              type: "typing", 
              userId: currentUserId,
              isTyping: message.isTyping 
            });
            clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(typingData);
              }
            });
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (currentSessionId && activeSessions.has(currentSessionId)) {
        const clients = activeSessions.get(currentSessionId)!;
        clients.delete(ws);
        
        const typingCleared = JSON.stringify({ 
          type: "typing", 
          userId: currentUserId,
          isTyping: false 
        });
        clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(typingCleared);
          }
        });
        
        if (clients.size === 0) {
          activeSessions.delete(currentSessionId);
        }
      }
    });
  });

  const broadcastToSession = (sessionId: string, message: object) => {
    const clients = activeSessions.get(sessionId);
    if (clients) {
      const data = JSON.stringify(message);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    }
  };

  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  const requireAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      const existingEmail = await storage.getUserByEmail(data.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const reader = await storage.getReaderByUserId(user.id);
      res.json({ user: { ...user, password: undefined }, reader });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const reader = await storage.getReaderByUserId(user.id);
    res.json({ user: { ...user, password: undefined }, reader });
  });

  // Production admin setup - only works when no admins exist
  app.post("/api/setup/admin", async (req, res) => {
    try {
      // Check if any admin already exists
      const existingAdmins = await storage.getUsersByRole("admin");
      if (existingAdmins.length > 0) {
        return res.status(403).json({ message: "Admin already exists" });
      }

      const { email, username, password, fullName } = req.body;
      
      if (!email || !username || !password || !fullName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        email,
        username,
        password: hashedPassword,
        fullName,
        role: "admin",
      });

      req.session.userId = user.id;
      res.json({ user: { ...user, password: undefined }, message: "Admin created successfully" });
    } catch (error) {
      console.error("Admin setup error:", error);
      res.status(500).json({ message: "Admin setup failed" });
    }
  });

  // Check if setup is needed
  app.get("/api/setup/status", async (req, res) => {
    const existingAdmins = await storage.getUsersByRole("admin");
    res.json({ 
      setupRequired: existingAdmins.length === 0,
      hasReaders: (await storage.getApprovedReaders()).length > 0
    });
  });

  app.get("/api/readers", async (req, res) => {
    const readers = await storage.getApprovedReaders();
    res.json(readers);
  });

  app.get("/api/readers/:id", async (req, res) => {
    const reader = await storage.getReader(req.params.id);
    if (!reader) {
      return res.status(404).json({ message: "Reader not found" });
    }
    res.json(reader);
  });

  app.get("/api/readers/:id/reviews", async (req, res) => {
    const reviews = await storage.getReviewsByReader(req.params.id);
    res.json(reviews);
  });

  app.patch("/api/readers/:id/status", requireAuth, async (req, res) => {
    const reader = await storage.getReader(req.params.id);
    if (!reader) {
      return res.status(404).json({ message: "Reader not found" });
    }

    const user = await storage.getUser(req.session.userId!);
    if (!user || (reader.userId !== user.id && user.role !== "admin")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await storage.updateReader(req.params.id, {
      isOnline: req.body.isOnline,
    });
    res.json(updated);
  });

  app.patch("/api/readers/:id/rates", requireAuth, async (req, res) => {
    const reader = await storage.getReader(req.params.id);
    if (!reader) {
      return res.status(404).json({ message: "Reader not found" });
    }

    const user = await storage.getUser(req.session.userId!);
    if (!user || reader.userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updated = await storage.updateReader(req.params.id, {
      chatRate: req.body.chatRate,
      voiceRate: req.body.voiceRate,
      videoRate: req.body.videoRate,
    });
    res.json(updated);
  });

  app.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const reader = await storage.getReader(req.body.readerId);
      if (!reader || !reader.isOnline) {
        return res.status(400).json({ message: "Reader is not available" });
      }

      const ratePerMinute = Number(req.body.ratePerMinute);
      const minimumBalance = ratePerMinute * 3;
      if (Number(user.balance) < minimumBalance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      const session = await storage.createSession({
        clientId: user.id,
        readerId: reader.id,
        type: req.body.type,
        status: "active",
        ratePerMinute: req.body.ratePerMinute,
        startedAt: new Date(),
      });

      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get("/api/sessions/client", requireAuth, async (req, res) => {
    const sessions = await storage.getSessionsByClient(req.session.userId!);
    res.json(sessions);
  });

  app.get("/api/sessions/reader", requireAuth, async (req, res) => {
    const reader = await storage.getReaderByUserId(req.session.userId!);
    if (!reader) {
      return res.status(404).json({ message: "Reader profile not found" });
    }
    const sessions = await storage.getSessionsByReader(reader.id);
    res.json(sessions);
  });

  app.get("/api/sessions/:id/messages", requireAuth, async (req, res) => {
    const messages = await storage.getMessagesBySession(req.params.id);
    res.json(messages);
  });

  app.post("/api/sessions/:id/messages", requireAuth, async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const reader = await storage.getReader(session.readerId);
      if (!reader) {
        return res.status(404).json({ message: "Reader not found" });
      }

      const receiverId = user.id === session.clientId ? reader.userId : session.clientId;

      const message = await storage.createMessage({
        senderId: user.id,
        receiverId,
        sessionId: session.id,
        content: req.body.content,
        isRead: false,
        isPaid: false,
      });

      broadcastToSession(session.id, { type: "message", message });
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/sessions/:id/end", requireAuth, async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      const endedAt = new Date();
      const startedAt = session.startedAt ? new Date(session.startedAt) : new Date();
      const durationMs = endedAt.getTime() - startedAt.getTime();
      const durationMinutes = Math.ceil(durationMs / 60000);
      
      const ratePerMinute = Number(session.ratePerMinute);
      const totalCost = durationMinutes * ratePerMinute;
      const readerEarnings = totalCost * 0.7;
      const platformFee = totalCost * 0.3;

      const updated = await storage.updateSession(req.params.id, {
        status: "completed",
        endedAt,
        duration: durationMinutes,
        totalCost: totalCost.toFixed(2),
        readerEarnings: readerEarnings.toFixed(2),
        platformFee: platformFee.toFixed(2),
      });

      const client = await storage.getUser(session.clientId);
      if (client) {
        const newBalance = Number(client.balance) - totalCost;
        await storage.updateUser(client.id, { balance: newBalance.toFixed(2) });
        
        await storage.createTransaction({
          userId: client.id,
          type: "session_charge",
          amount: (-totalCost).toFixed(2),
          description: `${session.type} reading session`,
          referenceId: session.id,
          referenceType: "session",
        });
      }

      const reader = await storage.getReader(session.readerId);
      if (reader) {
        const newPending = Number(reader.pendingPayout) + readerEarnings;
        const newTotal = Number(reader.totalEarnings) + readerEarnings;
        await storage.updateReader(reader.id, {
          pendingPayout: newPending.toFixed(2),
          totalEarnings: newTotal.toFixed(2),
          totalReadings: reader.totalReadings + 1,
        });
      }

      broadcastToSession(session.id, { 
        type: "session_ended", 
        session: updated,
        duration: durationMinutes,
        totalCost: totalCost.toFixed(2),
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to end session" });
    }
  });

  app.get("/api/products", async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  app.get("/api/messages/conversations", requireAuth, async (req, res) => {
    const conversations = await storage.getConversations(req.session.userId!);
    res.json(conversations);
  });

  app.get("/api/favorites", requireAuth, async (req, res) => {
    const favorites = await storage.getFavoritesByClient(req.session.userId!);
    res.json(favorites);
  });

  app.get("/api/favorites/check/:readerId", requireAuth, async (req, res) => {
    const isFav = await storage.isFavorite(req.session.userId!, req.params.readerId);
    res.json(isFav);
  });

  app.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const favorite = await storage.createFavorite({
        clientId: req.session.userId!,
        readerId: req.body.readerId,
      });
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:readerId", requireAuth, async (req, res) => {
    await storage.deleteFavorite(req.session.userId!, req.params.readerId);
    res.json({ success: true });
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users.map(u => ({ ...u, password: undefined })));
  });

  app.get("/api/admin/readers", requireAdmin, async (req, res) => {
    const readers = await storage.getAllReaders();
    res.json(readers);
  });

  app.get("/api/admin/sessions", requireAdmin, async (req, res) => {
    const sessions = await storage.getAllSessions();
    res.json(sessions);
  });

  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.patch("/api/admin/readers/:id/approve", requireAdmin, async (req, res) => {
    const updated = await storage.updateReader(req.params.id, { isApproved: true });
    res.json(updated);
  });

  app.post("/api/admin/readers", requireAdmin, async (req, res) => {
    try {
      const readerData = insertReaderSchema.parse(req.body);
      const reader = await storage.createReader(readerData);
      
      await storage.updateUser(readerData.userId, { role: "reader" });
      
      res.json(reader);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create reader" });
    }
  });

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const { getStripePublishableKey } = await import("./stripeClient");
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe publishable key:", error);
      res.status(500).json({ message: "Stripe not configured" });
    }
  });

  app.post("/api/stripe/create-checkout-session", requireAuth, async (req, res) => {
    try {
      const amount = Number(req.body.amount);
      
      if (!amount || isNaN(amount) || amount < 5 || amount > 1000) {
        return res.status(400).json({ message: "Deposit must be between $5 and $1000" });
      }

      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `${req.protocol}://${req.get("host")}`;

      const amountCents = Math.round(amount * 100);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "SoulSeer Balance Deposit",
                description: `Add $${amount.toFixed(2)} to your account balance`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/dashboard?deposit=success&amount=${amount.toFixed(2)}`,
        cancel_url: `${baseUrl}/dashboard?deposit=cancelled`,
        metadata: {
          userId: user.id,
          type: "balance_deposit",
          amountCents: amountCents.toString(),
        },
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/webhook/:uuid", async (req, res) => {
    try {
      const signature = req.headers["stripe-signature"] as string;
      const { uuid } = req.params;

      if (!signature) {
        return res.status(400).json({ message: "Missing Stripe signature" });
      }

      const rawBody = (req as any).rawBody;
      if (!rawBody || !Buffer.isBuffer(rawBody)) {
        console.error("Webhook error: rawBody is not a buffer");
        return res.status(400).json({ message: "Invalid request body" });
      }

      const { WebhookHandlers } = await import("./webhookHandlers");
      await WebhookHandlers.processWebhook(rawBody, signature, uuid);

      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(400).json({ message: "Webhook processing failed" });
    }
  });

  app.post("/api/stripe/confirm-deposit", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({ message: "Valid session ID required" });
      }

      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();
      
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== "paid") {
        return res.status(400).json({ message: "Payment not completed" });
      }

      const userId = session.metadata?.userId;
      const amountCents = parseInt(session.metadata?.amountCents || "0", 10);
      const amount = amountCents / 100;

      if (!userId || userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      if (amountCents <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = Number(user.balance) + amount;
      await storage.updateUser(userId, { balance: newBalance.toFixed(2) });

      await storage.createTransaction({
        userId,
        type: "deposit",
        amount: amount.toFixed(2),
        description: `Balance deposit via Stripe`,
        referenceId: session.id,
        referenceType: "stripe_checkout",
      });

      res.json({ success: true, newBalance: newBalance.toFixed(2) });
    } catch (error) {
      console.error("Error confirming deposit:", error);
      res.status(500).json({ message: "Failed to confirm deposit" });
    }
  });

  app.post("/api/stripe/connect/onboard", requireAuth, async (req, res) => {
    try {
      const reader = await storage.getReaderByUserId(req.session.userId!);
      if (!reader) {
        return res.status(404).json({ message: "Reader profile not found" });
      }

      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();

      let accountId = reader.stripeConnectAccountId;

      if (!accountId) {
        const user = await storage.getUser(req.session.userId!);
        const account = await stripe.accounts.create({
          type: "express",
          email: user?.email,
          metadata: { readerId: reader.id },
        });
        accountId = account.id;
        await storage.updateReader(reader.id, { stripeConnectAccountId: accountId });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
        : `${req.protocol}://${req.get("host")}`;

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${baseUrl}/reader-dashboard?connect=refresh`,
        return_url: `${baseUrl}/reader-dashboard?connect=success`,
        type: "account_onboarding",
      });

      res.json({ url: accountLink.url });
    } catch (error) {
      console.error("Error creating Connect onboarding:", error);
      res.status(500).json({ message: "Failed to start onboarding" });
    }
  });

  app.get("/api/stripe/connect/status", requireAuth, async (req, res) => {
    try {
      const reader = await storage.getReaderByUserId(req.session.userId!);
      if (!reader) {
        return res.status(404).json({ message: "Reader profile not found" });
      }

      if (!reader.stripeConnectAccountId) {
        return res.json({ onboarded: false, accountId: null });
      }

      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();

      const account = await stripe.accounts.retrieve(reader.stripeConnectAccountId);
      const onboarded = account.details_submitted && account.payouts_enabled;

      if (onboarded && !reader.stripeConnectOnboarded) {
        await storage.updateReader(reader.id, { stripeConnectOnboarded: true });
      }

      res.json({ 
        onboarded, 
        accountId: reader.stripeConnectAccountId,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      });
    } catch (error) {
      console.error("Error checking Connect status:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });

  app.post("/api/stripe/connect/payout", requireAuth, async (req, res) => {
    try {
      const reader = await storage.getReaderByUserId(req.session.userId!);
      if (!reader) {
        return res.status(404).json({ message: "Reader profile not found" });
      }

      if (!reader.stripeConnectAccountId || !reader.stripeConnectOnboarded) {
        return res.status(400).json({ message: "Please complete Stripe Connect setup first" });
      }

      const pendingAmount = Number(reader.pendingPayout);
      if (pendingAmount < 15) {
        return res.status(400).json({ message: "Minimum payout is $15" });
      }

      const { getUncachableStripeClient } = await import("./stripeClient");
      const stripe = await getUncachableStripeClient();

      const amountCents = Math.round(pendingAmount * 100);

      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: "usd",
        destination: reader.stripeConnectAccountId,
        metadata: { readerId: reader.id },
      });

      await storage.updateReader(reader.id, { pendingPayout: "0.00" });

      const user = await storage.getUser(reader.userId);
      if (user) {
        await storage.createTransaction({
          userId: user.id,
          type: "payout",
          amount: (-pendingAmount).toFixed(2),
          description: "Reader payout via Stripe Connect",
          referenceId: transfer.id,
          referenceType: "stripe_transfer",
        });
      }

      res.json({ success: true, amount: pendingAmount.toFixed(2), transferId: transfer.id });
    } catch (error: any) {
      console.error("Error processing payout:", error);
      res.status(500).json({ message: error.message || "Failed to process payout" });
    }
  });

  return httpServer;
}
