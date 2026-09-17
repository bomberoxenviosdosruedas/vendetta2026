import "dotenv/config";

// Prisma ORM 8 Database Client Instance
// Enables incremental migration alongside Prisma Client (side-by-side architecture)
const connectionString = process.env.DATABASE_URL || "";

export const getPrisma8Client = async () => {
  try {
    const postgres = (await import("@prisma/orm-postgres/runtime")).default;
    const contractJson = (await import("../../../generated/prisma8/contract.json", {
      with: { type: "json" },
    })).default;

    return postgres({
      url: connectionString,
      contractJson,
    });
  } catch {
    // Fallback if contract artifacts haven't been emitted yet
    return null;
  }
};
