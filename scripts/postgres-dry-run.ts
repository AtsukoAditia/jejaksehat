import { closePrismaClient, getPrismaClient } from "../src/infrastructure/postgres/client";

const requiredEnvironment = ["DATABASE_URL", "DIRECT_URL"];

function checkEnvironment() {
  const missing = requiredEnvironment.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

async function main() {
  checkEnvironment();
  const db = getPrismaClient();
  await db.$connect();

  const checks = await Promise.all([
    db.user.count(),
    db.activity.count(),
    db.bodyMeasurement.count(),
    db.goal.count(),
  ]);

  console.log("PostgreSQL dry-run completed without writing data.");
  console.table([
    { entity: "users", rows: checks[0] },
    { entity: "activities", rows: checks[1] },
    { entity: "body_measurements", rows: checks[2] },
    { entity: "goals", rows: checks[3] },
  ]);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePrismaClient();
  });
