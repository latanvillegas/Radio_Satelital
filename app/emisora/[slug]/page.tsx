import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  findStationByParam,
  getLocalStations,
  stationSlug,
} from '@/lib/services/stations'
import RadioExplorer from '@/components/features/RadioExplorer'

interface RouteProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams(): Array<{ slug: string }> {
  const stations = getLocalStations()
  const seen = new Set<string>()
  const params: Array<{ slug: string }> = []

  for (const station of stations) {
    const slug = stationSlug(station)
    if (!slug || seen.has(slug)) continue
    seen.add(slug)
    params.push({ slug })
  }

  return params
}

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params
  const stations = getLocalStations()
  const station = findStationByParam(stations, slug)

  if (!station) {
    return {
      title: 'Emisora no encontrada — Radio Satelital',
    }
  }

  const locationLabel = [station.region, station.country].filter(Boolean).join(', ')
  const genresLabel = station.tags?.slice(0, 3).join(', ') || 'radio en directo'
  const title = `${station.name} en vivo${locationLabel ? ` (${locationLabel})` : ''} — Radio Satelital`
  const description = `Escucha ${station.name} en vivo por Internet${
    locationLabel ? ` desde ${locationLabel}` : ''
  }. Sintoniza ${genresLabel} en alta fidelidad con ecualizador de estudio en Radio Satelital.`
  const canonicalPath = `/emisora/${stationSlug(station)}/`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: 'Radio Satelital',
      type: 'website',
      locale: 'es_PE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function StationPage({ params }: RouteProps) {
  const { slug } = await params
  const initialStations = getLocalStations()
  const matchedStation = findStationByParam(initialStations, slug)

  if (!matchedStation) {
    notFound()
  }

  const countriesCount = new Set(
    initialStations.map((station) => station.country).filter(Boolean)
  ).size

  const canonicalUrl = `https://latanvillegas.online/emisora/${stationSlug(matchedStation)}/`

  const radioStationSchema = {
    '@context': 'https://schema.org',
    '@type': 'RadioStation',
    name: matchedStation.name,
    url: canonicalUrl,
    ...(matchedStation.logoUrl ? { image: matchedStation.logoUrl } : {}),
    ...(matchedStation.tags && matchedStation.tags.length > 0
      ? { genre: matchedStation.tags }
      : {}),
    ...(matchedStation.country || matchedStation.region
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(matchedStation.region ? { addressRegion: matchedStation.region } : {}),
            ...(matchedStation.country ? { addressCountry: matchedStation.country } : {}),
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(radioStationSchema) }}
      />
      <RadioExplorer
        initialStations={initialStations}
        countriesCount={countriesCount}
        featuredStation={matchedStation}
      />
    </>
  )
}
