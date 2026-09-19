import "dotenv/config";
import { defineConfig } from "prisma/config";
import { defineConfig as definePostgresConfig } from "@prisma/orm-postgres/config";

export default defineConfig({
  orm: definePostgresConfig({
    contract: "prisma8/contract.prisma",
    output: "generated/prisma8",
    db: {
      connection: process.env["DATABASE_URL"],
    },
  }),
});
