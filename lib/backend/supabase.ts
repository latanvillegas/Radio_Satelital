type SupabaseConfig = {
  url: string
  anonKey: string
}

export function getSupabaseConfig(): SupabaseConfig | null{
  if(typeof window === 'undefined') return null
  return (window as any).SUPABASE_CONFIG || null
}

export async function loadGlobalStations(){
  const cfg = getSupabaseConfig()
  if(!cfg) return []
  try{
    const res = await fetch(cfg.url + '/rest/v1/global_stations', { headers: { apikey: cfg.anonKey } })
    if(!res.ok) return []
    return await res.json()
  }catch(e){return []}
}

export async function persistGlobalStation(station:any){
  const cfg = getSupabaseConfig()
  if(!cfg) return false
  try{
    await fetch(cfg.url + '/rest/v1/global_stations', { method: 'POST', headers: { apikey: cfg.anonKey, 'Content-Type':'application/json' }, body: JSON.stringify(station) })
    return true
  }catch(e){return false}
}
