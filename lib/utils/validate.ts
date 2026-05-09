export function validateStationUrl(url:string){
  try{
    const u = new URL(url)
    const host = u.hostname
    // basic private ranges check
    if(host === 'localhost' || host.endsWith('.local')) return false
    if(/^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return false
    return ['http:','https:'].includes(u.protocol)
  }catch(e){return false}
}

export async function checkStreamReachable(url:string, timeout=5000){
  try{
    const controller = new AbortController()
    const id = setTimeout(()=>controller.abort(), timeout)
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
    clearTimeout(id)
    return res.ok
  }catch(e){return false}
}

export function canSubmitGlobalNow(){
  try{
    const last = Number(localStorage.getItem('ultra_last_submit') || '0')
    const now = Date.now()
    if(now - last < 60000) return false
    localStorage.setItem('ultra_last_submit', String(now))
    return true
  }catch(e){return false}
}
