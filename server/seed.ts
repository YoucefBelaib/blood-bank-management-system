import { getDb } from "./storage";
import { bloodInventory, hospitals, statistics, bloodRequests, donors } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    const db = getDb();
    if (!db) {
      console.log("Skipping seed: DATABASE_URL not configured");
      return;
    }

    // Seed blood inventory
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

    // Seed donors if none exist
    const existingDonors = await db.select().from(donors).limit(1);
    
    if (existingDonors.length === 0) {
      await db.insert(donors).values([
        {
          fullName: "Ahmed Benali",
          age: 28,
          gender: "Male",
          bloodType: "O+",
          location: "Algiers",
          phone: "+213555100001",
          email: "ahmed.benali@email.dz",
          isActive: true,
        },
        {
          fullName: "Fatima Hadj",
          age: 35,
          gender: "Female",
          bloodType: "A+",
          location: "Oran",
          phone: "+213555100002",
          email: "fatima.hadj@email.dz",
          isActive: true,
        },
        {
          fullName: "Karim Meziane",
          age: 42,
          gender: "Male",
          bloodType: "B+",
          location: "Constantine",
          phone: "+213555100003",
          email: "karim.meziane@email.dz",
          isActive: true,
        },
        {
          fullName: "Leila Boumediene",
          age: 25,
          gender: "Female",
          bloodType: "AB-",
          location: "Annaba",
          phone: "+213555100004",
          email: "leila.boumediene@email.dz",
          isActive: true,
        },
        {
          fullName: "Youssef Ammari",
          age: 31,
          gender: "Male",
          bloodType: "O-",
          location: "Blida",
          phone: "+213555100005",
          email: "youssef.ammari@email.dz",
          isActive: true,
        },
        {
          fullName: "Nadia Khelif",
          age: 29,
          gender: "Female",
          bloodType: "A-",
          location: "Tlemcen",
          phone: "+213555100006",
          email: "nadia.khelif@email.dz",
          isActive: true,
        },
        {
          fullName: "Mohamed Cherif",
          age: 38,
          gender: "Male",
          bloodType: "B-",
          location: "Setif",
          phone: "+213555100007",
          email: "mohamed.cherif@email.dz",
          isActive: true,
        },
        {
          fullName: "Amina Larbi",
          age: 26,
          gender: "Female",
          bloodType: "AB+",
          location: "Batna",
          phone: "+213555100008",
          email: "amina.larbi@email.dz",
          isActive: true,
        },
        {
          fullName: "Rachid Bouzid",
          age: 33,
          gender: "Male",
          bloodType: "O+",
          location: "Bejaia",
          phone: "+213555100009",
          email: "rachid.bouzid@email.dz",
          isActive: false,
        },
        {
          fullName: "Sara Mansouri",
          age: 27,
          gender: "Female",
          bloodType: "A+",
          location: "Mostaganem",
          phone: "+213555100010",
          email: "sara.mansouri@email.dz",
          isActive: true,
        },
      ]);
      console.log("Seeded 10 donors");
    }

    // Seed hospitals if none exist
    const existingHospitals = await db.select().from(hospitals).limit(1);
    
    if (existingHospitals.length === 0) {
      await db.insert(hospitals).values([
        {
          name: "City General Hospital",
          location: "Downtown Algiers",
          phone: "+213555123456",
          email: "contact@cityhospital.dz",
          address: "123 Main Street, Downtown, Algiers",
          contactPerson: "Dr. Ahmed Benali",
          status: "approved",
        },
        {
          name: "Regional Medical Center",
          location: "North District",
          phone: "+213555234567",
          email: "info@regionalmed.dz",
          address: "456 Healthcare Ave, North District",
          contactPerson: "Dr. Fatima Hadj",
          status: "approved",
        },
        {
          name: "University Hospital",
          location: "University Campus",
          phone: "+213555345678",
          email: "contact@unihospital.dz",
          address: "University of Algiers, Campus Medical Center",
          contactPerson: "Prof. Karim Meziane",
          status: "pending",
        },
        {
          name: "Emergency Care Center",
          location: "Central Avenue",
          phone: "+213555456789",
          email: "emergency@carecentr.dz",
          address: "789 Central Avenue, Algiers",
          contactPerson: "Dr. Leila Boumediene",
          status: "pending",
        },
        {
          name: "Community Health Clinic",
          location: "West Side",
          phone: "+213555567890",
          email: "info@communityclinic.dz",
          address: "321 West Side Blvd",
          contactPerson: "Dr. Youssef Ammari",
          status: "pending",
        },
        {
          name: "Mustapha Pacha Hospital",
          location: "Central Algiers",
          phone: "+213555678901",
          email: "contact@mustapha.dz",
          address: "Place du 1er Mai, Central Algiers",
          contactPerson: "Dr. Nadia Khelif",
          status: "rejected",
        },
      ]);
      console.log("Seeded 6 hospitals");
    }

    // Seed blood requests if none exist
    const existingRequests = await db.select().from(bloodRequests).limit(1);
    
    if (existingRequests.length === 0) {
      await db.insert(bloodRequests).values([
        {
          hospitalName: "City General Hospital",
          bloodType: "O-",
          unitsNeeded: 5,
          urgencyLevel: "critical",
          location: "Downtown Algiers",
          phone: "+213555123456",
          email: "blood@cityhospital.dz",
          status: "pending",
        },
        {
          hospitalName: "Regional Medical Center",
          bloodType: "A+",
          unitsNeeded: 3,
          urgencyLevel: "urgent",
          location: "North District",
          phone: "+213555234567",
          email: "blood@regionalmed.dz",
          status: "approved",
        },
        {
          hospitalName: "University Hospital",
          bloodType: "B+",
          unitsNeeded: 2,
          urgencyLevel: "normal",
          location: "University Campus",
          phone: "+213555345678",
          email: "blood@unihospital.dz",
          status: "pending",
        },
        {
          hospitalName: "Emergency Care Center",
          bloodType: "AB-",
          unitsNeeded: 4,
          urgencyLevel: "critical",
          location: "Central Avenue",
          phone: "+213555456789",
          email: "blood@carecentr.dz",
          status: "pending",
        },
        {
          hospitalName: "Community Health Clinic",
          bloodType: "O+",
          unitsNeeded: 6,
          urgencyLevel: "urgent",
          location: "West Side",
          phone: "+213555567890",
          email: "blood@communityclinic.dz",
          status: "rejected",
        },
      ]);
      console.log("Seeded 5 blood requests");
    }

    // Seed or update statistics
    const existingStats = await db.select().from(statistics).limit(1);
    
    if (existingStats.length === 0) {
      await db.insert(statistics).values({
        activeDonors: 10,
        totalBloodUnits: 204,
        partnerHospitals: 2,
      });
      console.log("Seeded statistics");
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
