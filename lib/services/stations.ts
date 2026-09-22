import stationsData from "../../data/stations.json";
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
 * Obtiene las emisoras locales del archivo JSON
 */
export function getLocalStations(): Radio[] {
  return normalizeStationList(stationsData as StationInput[], "local", "local");
}

/**
 * Retorna las estaciones disponibles
 */
export async function getMergedStations(): Promise<Radio[]> {
  return getLocalStations();
}
