import { collection, getDocs } from "firebase/firestore";
import { db, hasFirebaseConfig } from "../backend/firebase";
import stationsData from "../../data/stations.json";

/**
 * Interfaz para representar una emisora de radio desde Firestore
 */
export interface Radio {
  id: string;
  name: string;
  country?: string;
  region?: string;
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
  return stationsData.map((station: any, index: number) => ({
    id: `local-${index}`,
    name: station.name ?? "",
    country: station.country ?? "",
    region: station.region ?? "",
    streamUrl: station.url ?? "",
    logoUrl: station.logoUrl ?? "",
    isFavorite: !!station.isFavorite,
    tags: Array.isArray(station.tags) ? station.tags : [],
    source: "local" as const,
  }));
}

/**
 * Obtiene todas las emisoras públicas de la colección "public_radios" en Firestore
 */
export async function getPublicRadios(): Promise<Radio[]> {
  if (!hasFirebaseConfig || !db) return [];
  const col = collection(db, "public_radios");
  const snapshot = await getDocs(col);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      name: data.name ?? "",
      country: data.country ?? "",
      region: data.region ?? "",
      streamUrl: data.streamUrl ?? "",
      logoUrl: data.logoUrl ?? "",
      isFavorite: !!data.isFavorite,
      tags: Array.isArray(data.tags) ? data.tags : [],
      source: "firebase" as const,
    } as Radio;
  });
}

/**
 * Combina estaciones locales y de Firebase sin duplicados
 * Prioriza las de Firebase al compararlas por streamUrl
 */
export async function getMergedStations(): Promise<Radio[]> {
  const localStations = getLocalStations();
  if (!hasFirebaseConfig || !db) return localStations;
  const firebaseStations = await getPublicRadios();

  // Crear un mapa de URLs de Firebase para acceso rápido
  const firebaseUrlMap = new Map<string, Radio>();
  firebaseStations.forEach((station) => {
    firebaseUrlMap.set(station.streamUrl, station);
  });

  // Combinar: empezar con Firebase, luego agregar locales sin duplicados
  const merged = new Map<string, Radio>();

  // Primero agregar todas las de Firebase
  firebaseStations.forEach((station) => {
    merged.set(station.streamUrl, station);
  });

  // Luego agregar las locales que no estén en Firebase
  localStations.forEach((station) => {
    if (!firebaseUrlMap.has(station.streamUrl)) {
      merged.set(station.streamUrl, station);
    }
  });

  return Array.from(merged.values());
}
