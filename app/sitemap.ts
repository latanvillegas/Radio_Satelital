import type { MetadataRoute } from 'next'
import { getLocalStations, stationSlug } from '@/lib/services/stations'

export const dynamic = 'force-static'

const BASE_URL = 'https://latanvillegas.online'

export default function sitemap(): MetadataRoute.Sitemap {
  const stations = getLocalStations()
  const seenSlugs = new Set<string>()

  const stationEntries: MetadataRoute.Sitemap = []
  for (const station of stations) {
    const slug = stationSlug(station)
    if (!slug || seenSlugs.has(slug)) continue
    seenSlugs.add(slug)
    stationEntries.push({
      url: `${BASE_URL}/emisora/${slug}/`,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  return [
    {
      url: `${BASE_URL}/`,
      changeFrequency: 'daily',
      priority: 1,
    },
    ...stationEntries,
  ]
}
