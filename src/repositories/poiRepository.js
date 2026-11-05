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

                const request = pool.request();

                request.input("lat", sql.Decimal(9, 6), latitude);
                request.input("long", sql.Decimal(9, 6), longitude);
                request.input("label", sql.Varchar(64), label);
                request.input("key", sql.Varchar(255), searchKey);
                request.input("north", sql.Varchar(255), north);
                request.input("east", sql.Varchar(255), east);
                request.input("south", sql.Varchar(255), south);
                request.input("west", sql.Varchar(255), west);

                const query = `INSERT INTO Searches (latitude, longitude, label, coordinates, north_bound, south_bound, south_bound, east_bound, west_bound) VALUES (@lat, @long, @label, @key, @north, @east, @south, @west)`;

                await request.query(query);
                console.log(
                    `Recherche enregistrée avec succès! (Clé : ${searchKey})`,
                );

                if (pois && pois.length > 0) {
                    for (let poi of pois) {
                        const poiRequest = pool.request();
                        poiRequest.input("id", sql.Varchar(255), searchKey);
                        poiRequest.input(
                            "osm_type",
                            sql.Varchar(5),
                            poi.osmType,
                        );
                        poiRequest.input("osm_id", sql.INT, poi.osmId);
                        poiRequest.input(
                            "category",
                            sql.Varchar(64),
                            poi.catergory,
                        );
                        poiRequest.input(
                            "category_label",
                            sql.Varchar(64),
                            poi.catergoryLabel,
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
                            sql.Varchar(255),
                            poi.source || null,
                        );
                        poiRequest.input(
                            "id_cluster",
                            sql.Varchar(255),
                            poi.idCluster || null,
                        );

                        const querypoi = `INSERT INTO Pois (id, osm_type, osm_id, category, category_label, latitude, longitude, source, id_cluster) VALUES (@id, @osm_type, @osm_id, @category, @category_label, @lat, @long, @source, @id_cluster)`;

                        await poiRequest.query(querypoi);
                        console.log(`Poi enregistrée avec succès!)`);
                    }
                }
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
