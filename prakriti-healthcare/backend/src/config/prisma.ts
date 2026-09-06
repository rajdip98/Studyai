import { PrismaClient } from "@prisma/client";
import { isProd } from "./env";

// Single shared Prisma client (connection pool). Prisma parameterizes every
// query, which is our primary SQL-injection defense — raw queries are
// disallowed elsewhere in the codebase (enforced in code review / CI grep).
export const prisma = new PrismaClient({
  log: isProd ? ["error", "warn"] : ["error", "warn"],
});
