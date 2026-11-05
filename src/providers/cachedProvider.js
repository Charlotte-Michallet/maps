export function createCachedProvider({ osmProvider, repository }) {
  return {
    async fetchPois({ center, bounds, signal }) {
      const search = await repository.findSearch(center);
      if (search) return repository.findPois(search.id);
      const pois = await osmProvider.fetchPois({ center, bounds, signal });
      await repository.saveSearch({ center, bounds, pois });
      return pois;
    },
    async fetchClusters({ center }) {
      const search = await repository.findSearch(center);
      if (!search) return;
      return repository.findClusters(search.id);
    },
  };
}
