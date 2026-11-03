import { connectDB } from "../src/db/connection.js";
async function testConnexionDb() {
    await connectDB();

    try {
        await sql.query`SELECT 1`;
        console.log("connexion BDD réussi");
    } catch (error) {
        console.error("connexion BDD a échoué");
    }
}

testConnexionDb();
