import stationsData from "../../data/stations.json";
import cajamarcaStationsData from "../../data/stations-cajamarca.json";
import {
  applyFavoriteState,
  buildStationFilterOptions,
  filterStations,
  findStationIndex,
  normalizeStationList,
  stationKey,
  type StationInput,
} from "./station-normalizer";

export {
  applyFavoriteState,
  buildStationFilterOptions,
  filterStations,
  findStationIndex,
  stationKey,
} from "./station-normalizer";

/**
 * Interfaz para representar una emisora de radio
 */
export interface Radio {
  id: string;
  name: string;
  country?: string;
  region?: string;
  url: string;
  streamUrl: string;
  logoUrl?: string;
  isFavorite?: boolean;
  tags?: string[];
  source?: "local";
}

/**
 * Obtiene las emisoras locales de los archivos JSON y elimina duplicados por URL.
 */
export function getLocalStations(): Radio[] {
  const allStations = [
    ...(stationsData as StationInput[]),
    ...(cajamarcaStationsData as StationInput[]),
  ];

  const normalized = normalizeStationList(allStations, "local", "local");
  const byStreamUrl = new Map<string, Radio>();

  normalized.forEach((station) => {
    if (!byStreamUrl.has(station.streamUrl)) {
      byStreamUrl.set(station.streamUrl, station);
    }
  });

  return Array.from(byStreamUrl.values());
}

/**
 * Retorna las estaciones disponibles
 */
export async function getMergedStations(): Promise<Radio[]> {
  return getLocalStations();
}
