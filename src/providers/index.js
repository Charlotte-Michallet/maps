// Sélectionne l'implémentation du contrat POI sans coupler l'API à sa source.
import { createOsmProvider } from "./osmProvider.js";
import { createPoiRepository } from "../repositories/poiRepository.js";
import { createCachedProvider } from "./cachedProvider.js";

export function createPoiProvider(config, dependencies) {
  // Contrat attendu : { source, fetchPois({ center, bounds, signal }) => Poi[] }.
  // TODO STUDENTS: injecter ici un fournisseur adossé au repository SQL.
  const osmProvider = createOsmProvider(config, dependencies);
  const repository = createPoiRepository();
  return createCachedProvider({ osmProvider, repository });
}
