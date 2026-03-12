import { createRequire } from "node:module";

const require = createRequire(new URL("../apps/cms/package.json", import.meta.url));
const pg = require("pg");

const { Client } = pg;

const dbName = process.env.LOCAL_DB_NAME || "website_scaffold";
const adminDbUrl = process.env.LOCAL_ADMIN_DB_URL || "postgres://postgres:postgres@127.0.0.1:5432/postgres";
const appDbUrl = process.env.LOCAL_APP_DB_URL || `postgres://postgres:postgres@127.0.0.1:5432/${dbName}`;

function quoteIdentifier(input) {
  return `"${String(input).replace(/"/g, '""')}"`;
}

async function ensureDatabase() {
  const adminClient = new Client({ connectionString: adminDbUrl });

  await adminClient.connect();

  const check = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

  if (check.rowCount === 0) {
    console.log(`[dev:local] Creating missing database '${dbName}'`);
    await adminClient.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
  } else {
    console.log(`[dev:local] Database '${dbName}' already exists`);
  }

  await adminClient.end();

  const appClient = new Client({ connectionString: appDbUrl });
  await appClient.connect();
  await appClient.query("SELECT 1");
  await appClient.end();

  console.log(`[dev:local] Verified app database connection: ${appDbUrl}`);
}

ensureDatabase().catch((error) => {
  console.error("[dev:local] Failed to verify local database setup");
  console.error(error?.message || error);
  process.exit(1);
});
