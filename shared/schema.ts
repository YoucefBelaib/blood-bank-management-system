import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const donors = pgTable("donors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  bloodType: text("blood_type").notNull(),
  location: text("location").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bloodInventory = pgTable("blood_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bloodType: text("blood_type").notNull().unique(),
  unitsAvailable: integer("units_available").notNull().default(0),
  status: text("status").notNull().default("Available"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address"),
  contactPerson: text("contact_person"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bloodRequests = pgTable("blood_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalName: text("hospital_name").notNull(),
  bloodType: text("blood_type").notNull(),
  unitsNeeded: integer("units_needed").notNull(),
  urgencyLevel: text("urgency_level").notNull(),
  location: text("location").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const statistics = pgTable("statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activeDonors: integer("active_donors").notNull().default(0),
  totalBloodUnits: integer("total_blood_units").notNull().default(0),
  partnerHospitals: integer("partner_hospitals").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDonorSchema = createInsertSchema(donors).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export const insertBloodRequestSchema = createInsertSchema(bloodRequests).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const updateStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type BloodInventory = typeof bloodInventory.$inferSelect;
export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type BloodRequest = typeof bloodRequests.$inferSelect;
export type InsertBloodRequest = z.infer<typeof insertBloodRequestSchema>;
export type Statistics = typeof statistics.$inferSelect;
