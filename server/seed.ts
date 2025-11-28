import { db } from "./storage";
import { bloodInventory, hospitals, statistics, donors } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

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

    // Seed donors with test data
    const existingDonors = await db.select().from(donors).limit(1);
    
    if (existingDonors.length === 0) {
      await db.insert(donors).values([
        {
          fullName: "ByeWind",
          age: 28,
          gender: "male",
          bloodType: "O+",
          location: "Algiers, Algeria",
          phone: "+213555111222",
          email: "byewind@example.dz",
          isActive: true,
        },
        {
          fullName: "Natali Craig",
          age: 34,
          gender: "female",
          bloodType: "O+",
          location: "Oran, Algeria",
          phone: "+213555222333",
          email: "natali.craig@example.dz",
          isActive: true,
        },
        {
          fullName: "Drew Cano",
          age: 26,
          gender: "male",
          bloodType: "A-",
          location: "Constantine, Algeria",
          phone: "+213555333444",
          email: "drew.cano@example.dz",
          isActive: true,
        },
        {
          fullName: "Orlando Diggs",
          age: 42,
          gender: "male",
          bloodType: "A+",
          location: "Annaba, Algeria",
          phone: "+213555444555",
          email: "orlando.diggs@example.dz",
          isActive: true,
        },
        {
          fullName: "Andi Lane",
          age: 31,
          gender: "female",
          bloodType: "AB+",
          location: "Blida, Algeria",
          phone: "+213555555666",
          email: "andi.lane@example.dz",
          isActive: true,
        },
        {
          fullName: "Kate Morrison",
          age: 29,
          gender: "female",
          bloodType: "B+",
          location: "Tlemcen, Algeria",
          phone: "+213555666777",
          email: "kate.morrison@example.dz",
          isActive: true,
        },
        {
          fullName: "Koray Okumus",
          age: 37,
          gender: "male",
          bloodType: "O-",
          location: "Setif, Algeria",
          phone: "+213555777888",
          email: "koray.okumus@example.dz",
          isActive: false,
        },
        {
          fullName: "Phoenix Baker",
          age: 25,
          gender: "male",
          bloodType: "AB-",
          location: "Batna, Algeria",
          phone: "+213555888999",
          email: "phoenix.baker@example.dz",
          isActive: true,
        },
        {
          fullName: "Lana Steiner",
          age: 33,
          gender: "female",
          bloodType: "A+",
          location: "Bejaia, Algeria",
          phone: "+213555999000",
          email: "lana.steiner@example.dz",
          isActive: true,
        },
      ]);
      console.log("Donors seeded successfully!");
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
