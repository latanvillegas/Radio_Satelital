"use client"
import { useEffect } from 'react'

export default function useMediaSession(metadata?:any){
  useEffect(()=>{
    if(typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
    const ms = (navigator as any).mediaSession
    if(metadata) ms.metadata = new (window as any).MediaMetadata(metadata)
    ms.setActionHandler('play', ()=>document.getElementById('playBtn')?.dispatchEvent(new Event('click')))
    ms.setActionHandler('pause', ()=>document.getElementById('playBtn')?.dispatchEvent(new Event('click')))
    ms.setActionHandler('previoustrack', ()=>{})
    ms.setActionHandler('nexttrack', ()=>{})
  },[metadata])
}
