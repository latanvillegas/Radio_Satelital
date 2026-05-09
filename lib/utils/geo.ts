export async function sintonizarRadioPorIP(){
  try{
    const res = await fetch('https://ipapi.co/json/')
    if(!res.ok) return null
    const j = await res.json()
    return { country: j.country_name, region: j.region }
  }catch(e){return null}
}
