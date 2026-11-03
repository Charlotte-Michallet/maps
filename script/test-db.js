import { connectDB, pool } from "../src/db/connection.js";

async function testConnexionDb() {
    try {
        await connectDB();
        const result = await pool.query`SELECT DB_NAME() AS base`;
        console.log(`connexion BDD réussie (base : ${result.recordset[0].base})`);
    } catch (error) {
        console.error("connexion BDD a échoué :", error.message);
        process.exitCode = 1;
    } finally {
        await pool.close();
    }
}

testConnexionDb();
