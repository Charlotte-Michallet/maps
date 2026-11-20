import { connectDB, pool } from "../src/db/connection.js";
import * as repository from "../src/repositories/poiRepository.js";

// L'objet fourni par la professeure
const testSearch = {
    center: { latitude: 45.758, longitude: 4.855 },
    bounds: {
        south: 45.7445,
        west: 4.8357,
        north: 45.7715,
        east: 4.8743,
    },
    pois: [
        {
            id: "node/900001",
            osmType: "node",
            osmId: 900001,
            name: "Feu tricolore",
            category: "feu_tricolore",
            categoryLabel: "Feu tricolore",
            latitude: 45.7581,
            longitude: 4.8551,
            source: "OpenStreetMap",
            tags: { highway: "traffic_signals" },
        },
        {
            id: "node/900002",
            osmType: "node",
            osmId: 900002,
            name: "Stop",
            category: "stop",
            categoryLabel: "Stop",
            latitude: 45.7583,
            longitude: 4.8554,
            source: "OpenStreetMap",
            tags: { highway: "stop" },
        },
    ],
};

async function runTestScript() {
    try {
        await connectDB();
        console.log("Connecté à la BDD pour le test du repository.");

        const poiRepo = repository.createPoiRepository();

        console.log("Exécution de saveSearch via le repository...");

        let searchId = await poiRepo.saveSearch(testSearch);
        console.log("Recherche enregistrée (ID :", searchId, ")");

        console.log("Exécution de countPois via le repository...");
        const count = await poiRepo.countPois();
        console.log("POI enregistrés :", count);

        console.log("Exécution de findPois via le repository...");
        const idToTest = searchId ?? 5;
        const pois = await poiRepo.findPois(idToTest);
        console.log("POI retrouvés :", pois);

        console.log(
            "Tentative de réinsertion de la même recherche (test doublon)...",
        );
        await poiRepo.saveSearch(testSearch);

        const countAfterDuplicate = await poiRepo.countPois();
        console.log("POI enregistrés après doublon :", countAfterDuplicate);

        const poisAfterDuplicate = await poiRepo.findPois(idToTest);
        console.log("POI retrouvés après doublon :", poisAfterDuplicate.length);
    } catch (error) {
        console.error("Erreur dans le script de test :", error);
    } finally {
        await pool.close();
        console.log("Connexion fermée.");
    }
}

runTestScript();
