import { connectDB, pool } from "../src/db/connection.js";

export async function geographyKey(latitude, longitude) {
    let geoKey = "";

    const latNorm = Number(latitude).toFixed(5);
    const longNorm = Number(longitude).toFixed(5);

    geoKey = latNorm + "_" + longNorm;
    return geoKey;
}

export async function saveSearch(center) {
    try {
        const latitude = center.latitude;
        const longitude = center.longitude;
        const label = center.lablel;

        const searchKey = await geographyKey(latitude, longitude);

        const request = new pool.Request();
    } catch (error) {}
}

export async function findSearch(center, bounds, pois) {}

// repository.findCoveredArea(bounds);
// repository.findPois(bounds);
// repository.saveClusters(searchId, clusters);
