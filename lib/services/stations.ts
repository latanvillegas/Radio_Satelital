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

/** Ranking editorial estable: insignia -> Jaén -> Cajamarca -> Perú -> mundo.
 * La posición original se conserva dentro de cada grupo.
 */
function stationWeight(station: Radio): number {
  const name = station.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const region = (station.region || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const country = (station.country || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (name === 'activa jaen') return 0
  if (country !== 'peru') return 4
  if (region.includes('jaen')) return 1
  if (region.includes('cajamarca')) return 2
  return 3
}

/** Obtiene emisoras locales y elimina duplicados por URL exacta. */
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

  return Array.from(byStreamUrl.values()).sort((a, b) => stationWeight(a) - stationWeight(b));
}

/**
 * Retorna las estaciones disponibles
 */
export async function getMergedStations(): Promise<Radio[]> {
  return getLocalStations();
}
