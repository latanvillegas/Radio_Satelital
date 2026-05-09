import { collection, getDocs } from "firebase/firestore";
import { db, hasFirebaseConfig } from "../backend/firebase";
import stationsData from "../../data/stations.json";
import {
  applyFavoriteState,
  buildStationFilterOptions,
  filterStations,
  findStationIndex,
  mergeStationsByStreamUrl,
  normalizeStationList,
  stationKey,
  type StationInput,
  type StationRecord,
} from "./station-normalizer";

export {
  applyFavoriteState,
  buildStationFilterOptions,
  filterStations,
  findStationIndex,
  stationKey,
} from "./station-normalizer";

/**
 * Interfaz para representar una emisora de radio desde Firestore
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
  source?: "local" | "firebase"; // Indicar la fuente
}

/**
 * Obtiene las emisoras locales del archivo JSON
 */
export function getLocalStations(): Radio[] {
  return normalizeStationList(stationsData as StationInput[], "local", "local");
}

/**
 * Obtiene todas las emisoras públicas de la colección "public_radios" en Firestore
 */
export async function getPublicRadios(): Promise<Radio[]> {
  if (!hasFirebaseConfig || !db) return [];
  const col = collection(db, "public_radios");
  const snapshot = await getDocs(col);
  return normalizeStationList(
    snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as StationInput) })),
    "firebase",
    "firebase",
  );
}

/**
 * Combina estaciones locales y de Firebase sin duplicados
 * Prioriza las de Firebase al compararlas por streamUrl
 */
export async function getMergedStations(): Promise<Radio[]> {
  const localStations = getLocalStations();
  if (!hasFirebaseConfig || !db) return localStations;
  const firebaseStations = await getPublicRadios();
  return mergeStationsByStreamUrl(firebaseStations as StationRecord[], localStations as StationRecord[]);
}
