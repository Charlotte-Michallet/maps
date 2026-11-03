import { positiveInteger } from "../config.js";
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

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
