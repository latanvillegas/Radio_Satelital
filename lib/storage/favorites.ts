const FAV_KEY = 'ultra_favs'

export function getFavorites(): Set<string>{
  try{
    const raw = localStorage.getItem(FAV_KEY)
    if(!raw) return new Set()
    const arr = JSON.parse(raw) as string[]
    return new Set(arr)
  }catch(e){return new Set()}
}

export function saveFavorites(set:Set<string>){
  localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(set)))
}

export function toggleFavorite(key:string){
  const favs = getFavorites()
  if(favs.has(key)) favs.delete(key)
  else favs.add(key)
  saveFavorites(favs)
  return favs
}
