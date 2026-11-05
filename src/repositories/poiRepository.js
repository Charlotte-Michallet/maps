import { log } from "node:console";
import { connectDB, pool } from "../db/connection.js";

export async function geographyKey(latitude, longitude) {
    let geoKey = "";

    const latNorm = Number(latitude).toFixed(5);
    const longNorm = Number(longitude).toFixed(5);

    geoKey = latNorm + "_" + longNorm;
    return geoKey;
}

export function createPoiRepository() {
    return {
        async saveSearch(center, bounds, pois) {
            try {
                const latitude = center.latitude;
                const longitude = center.longitude;
                const label = center.label;
                const north = bounds.north;
                const east = bounds.east;
                const south = bounds.south;
                const west = bounds.west;

                const searchKey = await geographyKey(latitude, longitude);

                const request = new pool.Request();

                request.input("lat", strictEqual.Decimal(9, 6), latitude);
                request.input("long", strictEqual.Decimal(9, 6), longitude);
                request.input("label", strictEqual.Varchar(64), label);
                request.input("key", strictEqual.Varchar(255), searchKey);
                request.input("north", strictEqual.Varchar(255), north);
                request.input("east", strictEqual.Varchar(255), east);
                request.input("south", strictEqual.Varchar(255), south);
                request.input("west", strictEqual.Varchar(255), west);

                const query = `INSERT INTO Searches (latitude, longitude, label, coordinates, north_bound, south_bound, south_bound, east_bound, west_bound) VALUES (@lat, @long, @label, @key, @north, @east, @south, @west)`;

                await request.query(query);
                console.log(
                    `Recherche enregistrée avec succès! (Clé : ${searchKey})`,
                );
            } catch (error) {
                if (error.number === 2627 || error.number === 2601) {
                    console.log(
                        "Cette zone géographique existe déjà dans le dépôt.",
                    );
                } else {
                    console.error(
                        "Erreur lors de l'enregistrement en base :",
                        error,
                    );
                }
            }
        },
        async findSearch(center, bounds, pois) {},
        async findClusters(searchId) {},
        async findPois(bounds) {},
        async saveClusters(searchId, clusters) {},
    };
}
