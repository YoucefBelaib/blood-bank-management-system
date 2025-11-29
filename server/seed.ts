import { getDb } from "./storage";
import { bloodInventory, hospitals, statistics } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    const db = getDb();
    if (!db) {
      console.log("Skipping seed: DATABASE_URL not configured");
      return;
    }

    await db.insert(bloodInventory)
      .values([
        { bloodType: "A+", unitsAvailable: 32, status: "Available" },
        { bloodType: "A-", unitsAvailable: 10, status: "Low" },
        { bloodType: "B+", unitsAvailable: 32, status: "Available" },
        { bloodType: "B-", unitsAvailable: 32, status: "Available" },
        { bloodType: "AB+", unitsAvailable: 32, status: "Available" },
        { bloodType: "AB-", unitsAvailable: 32, status: "Available" },
        { bloodType: "O+", unitsAvailable: 32, status: "Available" },
        { bloodType: "O-", unitsAvailable: 2, status: "Critical" },
      ])
      .onConflictDoUpdate({
        target: bloodInventory.bloodType,
        set: {
          unitsAvailable: sql`EXCLUDED.units_available`,
          status: sql`EXCLUDED.status`,
          lastUpdated: sql`NOW()`,
        },
      });

    const existingHospitals = await db.select().from(hospitals).limit(1);
    
    if (existingHospitals.length === 0) {
      await db.insert(hospitals).values([
        {
          name: "City General Hospital",
          location: "Downtown",
          phone: "+213555123456",
          email: "contact@cityhospital.dz",
        },
        {
          name: "Regional Medical Center",
          location: "North District",
          phone: "+213555234567",
          email: "info@regionalmed.dz",
        },
        {
          name: "University Hospital",
          location: "University Campus",
          phone: "+213555345678",
          email: "contact@unihospital.dz",
        },
        {
          name: "Emergency Care Center",
          location: "Central Avenue",
          phone: "+213555456789",
          email: "emergency@carecentr.dz",
        },
        {
          name: "Community Health Clinic",
          location: "West Side",
          phone: "+213555567890",
          email: "info@communityclinic.dz",
        },
      ]);
    }

    const existingStats = await db.select().from(statistics).limit(1);
    
    if (existingStats.length === 0) {
      await db.insert(statistics).values({
        activeDonors: 245,
        totalBloodUnits: 256,
        partnerHospitals: 15,
      });
    }

    console.log("Database seeding completed successfully!");
  } catch (error: any) {
    if (error.message?.includes("duplicate key")) {
      console.log("Data already seeded, skipping...");
    } else {
      console.error("Error seeding database:", error);
      throw error;
    }
  }
}
