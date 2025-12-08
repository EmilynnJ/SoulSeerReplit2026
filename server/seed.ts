import { db } from "./db";
import { users, readers, products } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { sql } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  const hashedPassword = await hashPassword("password123");

  const [adminUser] = await db.insert(users).values({
    username: "admin",
    email: "admin@soulseer.com",
    password: hashedPassword,
    fullName: "SoulSeer Admin",
    role: "admin",
    balance: "0.00",
  }).returning();
  console.log("Created admin user:", adminUser.username);

  const [readerUser1] = await db.insert(users).values({
    username: "luna_mystic",
    email: "luna@soulseer.com",
    password: hashedPassword,
    fullName: "Luna Starweaver",
    role: "reader",
    balance: "0.00",
  }).returning();

  const [readerUser2] = await db.insert(users).values({
    username: "mystic_raven",
    email: "raven@soulseer.com",
    password: hashedPassword,
    fullName: "Raven Shadowmoon",
    role: "reader",
    balance: "0.00",
  }).returning();

  const [readerUser3] = await db.insert(users).values({
    username: "sage_aurora",
    email: "aurora@soulseer.com",
    password: hashedPassword,
    fullName: "Aurora Sage",
    role: "reader",
    balance: "0.00",
  }).returning();

  const [readerUser4] = await db.insert(users).values({
    username: "celestial_iris",
    email: "iris@soulseer.com",
    password: hashedPassword,
    fullName: "Iris Celestine",
    role: "reader",
    balance: "0.00",
  }).returning();

  const [clientUser] = await db.insert(users).values({
    username: "seeker",
    email: "seeker@example.com",
    password: hashedPassword,
    fullName: "Curious Seeker",
    role: "client",
    balance: "50.00",
  }).returning();
  console.log("Created client user:", clientUser.username);

  const [reader1] = await db.insert(readers).values({
    userId: readerUser1.id,
    displayName: "Luna Starweaver",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&h=400&fit=crop",
    aboutMe: "I am a third-generation psychic medium with over 15 years of experience in tarot, astrology, and spirit communication. My readings are compassionate, honest, and designed to empower you on your spiritual journey.",
    specialties: ["Tarot", "Astrology", "Medium", "Love & Relationships"],
    yearsExperience: 15,
    chatRate: "3.99",
    voiceRate: "4.99",
    videoRate: "5.99",
    isOnline: true,
    isApproved: true,
    rating: "4.85",
    reviewCount: 342,
    totalReadings: 1247,
    totalEarnings: "15680.50",
    pendingPayout: "234.50",
  }).returning();
  console.log("Created reader:", reader1.displayName);

  const [reader2] = await db.insert(readers).values({
    userId: readerUser2.id,
    displayName: "Raven Shadowmoon",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&h=400&fit=crop",
    aboutMe: "As an empath and clairvoyant, I specialize in deep soul readings that uncover hidden truths. My gift allows me to connect with energies and provide clarity in times of confusion.",
    specialties: ["Clairvoyant", "Dream Analysis", "Energy Healing", "Past Lives"],
    yearsExperience: 10,
    chatRate: "4.49",
    voiceRate: "5.49",
    videoRate: "6.49",
    isOnline: true,
    isApproved: true,
    rating: "4.92",
    reviewCount: 218,
    totalReadings: 856,
    totalEarnings: "12340.00",
    pendingPayout: "180.25",
  }).returning();
  console.log("Created reader:", reader2.displayName);

  const [reader3] = await db.insert(readers).values({
    userId: readerUser3.id,
    displayName: "Aurora Sage",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&h=400&fit=crop",
    aboutMe: "With a background in holistic healing and intuitive counseling, I guide seekers through life's challenges with wisdom and grace. My readings blend practical advice with spiritual insight.",
    specialties: ["Tarot", "Career", "Life Path", "Spirit Guides"],
    yearsExperience: 8,
    chatRate: "3.49",
    voiceRate: "4.49",
    videoRate: "5.49",
    isOnline: false,
    isApproved: true,
    rating: "4.78",
    reviewCount: 156,
    totalReadings: 543,
    totalEarnings: "8920.75",
    pendingPayout: "0.00",
  }).returning();
  console.log("Created reader:", reader3.displayName);

  const [reader4] = await db.insert(readers).values({
    userId: readerUser4.id,
    displayName: "Iris Celestine",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&h=400&fit=crop",
    aboutMe: "I am a natural-born intuitive with a special gift for connecting with animals and their owners. My pet psychic readings help deepen the bond between you and your beloved companions.",
    specialties: ["Pet Psychic", "Animal Communication", "Lost Pets", "Medium"],
    yearsExperience: 6,
    chatRate: "3.99",
    voiceRate: "4.99",
    videoRate: "5.99",
    isOnline: true,
    isApproved: true,
    rating: "4.95",
    reviewCount: 89,
    totalReadings: 324,
    totalEarnings: "5680.00",
    pendingPayout: "120.00",
  }).returning();
  console.log("Created reader:", reader4.displayName);

  await db.insert(products).values([
    {
      readerId: reader1.id,
      name: "Cosmic Tarot Spread Guide",
      description: "A comprehensive PDF guide featuring 12 unique tarot spreads for love, career, and spiritual growth. Includes interpretations and journaling prompts.",
      price: "19.99",
      category: "Digital Guides",
      type: "digital",
      image: "https://images.unsplash.com/photo-1601928708067-aceb4c7df840?w=400&h=400&fit=crop",
      isActive: true,
    },
    {
      readerId: reader2.id,
      name: "Chakra Meditation Bundle",
      description: "Seven guided meditations (MP3) for cleansing and balancing each of your chakras. Perfect for beginners and advanced practitioners alike.",
      price: "29.99",
      category: "Meditation",
      type: "digital",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
      isActive: true,
    },
    {
      readerId: reader3.id,
      name: "Career Clarity Reading Package",
      description: "Pre-recorded personalized video reading (30 min) focused on your career path. Includes follow-up email questions.",
      price: "79.99",
      category: "Services",
      type: "service",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop",
      isActive: true,
    },
    {
      readerId: reader1.id,
      name: "Moon Phase Journal",
      description: "Beautiful printable lunar journal for tracking moon phases and setting intentions. Includes 12 months of moon tracking.",
      price: "12.99",
      category: "Digital Guides",
      type: "digital",
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=400&fit=crop",
      isActive: true,
    },
  ]);
  console.log("Created sample products");

  console.log("Seeding complete!");
}

seed().catch(console.error);
