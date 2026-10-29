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
  /** Public HTTPS now-playing JSON URL, no passwords/tokens. */
  metadataUrl?: string
  isFavorite?: boolean
  tags?: string[]
  bitrate?: number
  codec?: string
}
