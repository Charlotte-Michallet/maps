// Centralise la lecture de l'environnement afin que le reste du code reçoive
// une configuration validée et directement exploitable.
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sql from "mssql";
// import dotenv from "dotenv";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nextgisOverpassEndpoint(environment) {
  // L'URL personnelle contient la clé NextGIS : elle n'a volontairement pas de valeur par défaut.
  const endpoint = String(environment.NEXTGIS_OVERPASS_URL ?? "").trim();
  if (!endpoint) {
    throw new Error("NEXTGIS_OVERPASS_URL doit être configurée.");
  }
  return endpoint;
}

export function loadConfig(environment = process.env) {
  return {
    projectRoot,
    publicDirectory: resolve(projectRoot, "public"),
    port: positiveInteger(environment.PORT, 3000),
    geogouvCompletionEndpoint:
      environment.GEOGOUV_COMPLETION_ENDPOINT ??
      "https://data.geopf.fr/geocodage/completion/",
    overpassEndpoint: nextgisOverpassEndpoint(environment),
    geocodingTimeoutMs: positiveInteger(
      environment.GEOCODING_TIMEOUT_MS,
      8_000,
    ),
    overpassTimeoutMs: positiveInteger(environment.OVERPASS_TIMEOUT_MS, 30_000),
    userAgent:
      environment.PUBLIC_USER_AGENT ??
      "DriveSpots/1.0 (+https://github.com/sixcamille/tp-sgbd)",
  };
}

export const dbConfig = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_SA_PASSWORD,
  server: process.env.MSSQL_HOST,
  port: positiveInteger(process.env.MSSQL_PORT, 1433),
  database: process.env.MSSQL_NAME,

  options: {
    encrypt: true,
    trustServerCertificate: true,
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export const pool = new sql.ConnectionPool(dbConfig);

export async function connectDB() {
  try {
    await pool.connect();
    console.log("Connected to SQL Server!");
    return pool;
  } catch (err) {
    console.error("SQL Server connection failed:", err.message);
    throw err;
  }
}
