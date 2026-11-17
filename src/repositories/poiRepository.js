import { log } from "node:console";
import { connectDB, pool } from "../db/connection.js";
import sql from "mssql";
import { AppError } from "../errors.js";

export async function geographyKey(latitude, longitude) {
    let geoKey = "";

    const latNorm = Number(latitude).toFixed(5);
    const longNorm = Number(longitude).toFixed(5);

    geoKey = latNorm + "_" + longNorm;
    return geoKey;
}

export function createPoiRepository() {
    return {
        async saveSearch({ center, bounds, pois }) {
            const transaction = new sql.Transaction(pool);

            try {
                await transaction.begin();
                const latitude = center.latitude;
                const longitude = center.longitude;
                const label = center.label || "Recherche GPS";
                const north = bounds.north;
                const east = bounds.east;
                const south = bounds.south;
                const west = bounds.west;

                const searchKey = await geographyKey(latitude, longitude);

                // const request = pool.request();
                const request = new sql.Request(transaction);

                request.input("lat", sql.Decimal(9, 6), latitude);
                request.input("long", sql.Decimal(9, 6), longitude);
                request.input("label", sql.VarChar(64), label);
                request.input("key", sql.VarChar(255), searchKey);
                request.input("north", sql.Decimal(9, 6), north);
                request.input("east", sql.Decimal(9, 6), east);
                request.input("south", sql.Decimal(9, 6), south);
                request.input("west", sql.Decimal(9, 6), west);

                const searchQuery = `INSERT INTO Searches (latitude, longitude, label, coordinates, north_bound, south_bound, east_bound, west_bound) VALUES (@lat, @long, @label, @key, @north, @east, @south, @west) SELECT SCOPE_IDENTITY() AS searchId`;

                const resultSearch = await request.query(searchQuery);
                const searchId = resultSearch.recordset[0].searchId;
                console.log(
                    `Recherche enregistrée avec succès! (ID : ${searchId}, Clé : ${searchKey})`,
                );

                if (pois && pois.length > 0) {
                    for (let poi of pois) {
                        const poiRequest = new sql.Request(transaction);
                        const poiKey = `${poi.osmType}/${poi.osmId}`;

                        poiRequest.input("id", sql.VarChar(255), poiKey);
                        poiRequest.input(
                            "osm_type",
                            sql.VarChar(5),
                            poi.osmType,
                        );
                        poiRequest.input("osm_id", sql.Int, poi.osmId);
                        poiRequest.input(
                            "category",
                            sql.VarChar(64),
                            poi.category,
                        );
                        poiRequest.input(
                            "category_label",
                            sql.VarChar(64),
                            poi.categoryLabel,
                        );
                        poiRequest.input(
                            "lat",
                            sql.Decimal(9, 6),
                            poi.latitude,
                        );
                        poiRequest.input(
                            "long",
                            sql.Decimal(9, 6),
                            poi.longitude,
                        );
                        poiRequest.input(
                            "source",
                            sql.VarChar(64),
                            poi.source || null,
                        );
                        poiRequest.input(
                            "id_cluster",
                            sql.VarChar(255),
                            poi.idCluster || null,
                        );

                        const querypoi = `IF NOT EXISTS (SELECT 1 FROM POIS WHERE id = @id) BEGIN INSERT INTO Pois (id, osm_type, osm_id, category, category_label, latitude, longitude, source, id_cluster) VALUES (@id, @osm_type, @osm_id, @category, @category_label, @lat, @long, @source, @id_cluster) END`;

                        await poiRequest.query(querypoi);
                        console.log(`Poi enregistrée avec succès!)`);

                        const jonctionRequest = new sql.Request(transaction);
                        jonctionRequest.input(
                            "id_poi",
                            sql.VarChar(255),
                            poiKey,
                        );
                        jonctionRequest.input("id_search", sql.Int, searchId);

                        const queryJonction = `
                        IF NOT EXISTS (SELECT 1 FROM Pois_Searches WHERE id_poi = @id_poi AND id_search = @id_search)
                        BEGIN
                            INSERT INTO Pois_Searches (id_poi, id_search) VALUES (@id_poi, @id_search)
                        END`;

                        await jonctionRequest.query(queryJonction);
                    }
                    console.log(
                        `${pois.length} POIs et liaisons enregistrés avec succès !`,
                    );
                }

                await transaction.commit();
                return searchId;
            } catch (error) {
                try {
                    await transaction.rollback();
                } catch (rbErr) {}

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
        async countPois() {
            try {
                const request = pool.request();
                const result = await request.query(
                    "SELECT COUNT(*) AS total FROM Pois",
                );

                return result.recordset[0].total;
            } catch (error) {
                console.error("Erreur lors du comptage des POIs :", error);
                throw error;
            }
        },
        async findSearch(center, bounds, pois) {},
        async findClusters(searchId) {},
        async findPois(bounds) {},
        async saveClusters(searchId, clusters) {},
    };
}
