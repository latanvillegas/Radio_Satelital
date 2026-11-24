export type StationSource = 'local' | 'radio-browser'

export interface Station {
  id?: string
  name: string
  url?: string
  streamUrl?: string
  country?: string
  region?: string
  district?: string
  caserio?: string
  isCustom?: boolean
  isGlobal?: boolean
  icon?: string
  logoUrl?: string
  isFavorite?: boolean
  tags?: string[]
  bitrate?: number
  codec?: string
  hls?: boolean
  source?: StationSource
}

export type StationScope = 'all' | 'jaen' | 'cajamarca' | 'peru' | 'world' | 'favorites' | 'recent' | 'browser'
