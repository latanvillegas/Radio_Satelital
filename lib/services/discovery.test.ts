import { describe, expect, it } from 'vitest'
import { buildDiscovery } from './discovery'
import type { Station } from '../../types/station'

const a: Station = { name:'Cajamarca Uno',url:'https://example.com/a',streamUrl:'https://example.com/a',country:'Perú',region:'Cajamarca' }
const b: Station = { name:'Radio B',url:'https://example.com/b',streamUrl:'https://example.com/b',country:'Chile',isFavorite:true }
const c: Station = { name:'Radio C',url:'https://example.com/c',streamUrl:'https://example.com/c',country:'Argentina' }
const d: Station = { name:'Radio D',url:'https://example.com/d',streamUrl:'https://example.com/d',country:'Chile' }

describe('discovery without tracking', () => {
 it('prefers active listening and excludes featured from quick picks',()=>{
   const r=buildDiscovery([a,b,c,d],[a],b)
   expect(r.featured?.name).toBe('Radio B')
   expect(r.quickPicks.every(s=>s.name!=='Radio B')).toBe(true)
 })
 it('includes Cajamarca and different countries without duplication',()=>{
   const r=buildDiscovery([a,b,c,d],[],null)
   expect(r.cajamarca).toHaveLength(1)
   expect(r.aroundTheWorld.map(s=>s.country)).toEqual(['Chile','Argentina'])
   expect(r.quickPicks.map(s=>s.name).length).toBe(new Set(r.quickPicks.map(s=>s.name)).size)
 })
 it('gracefully handles empty catalog',()=>{
   const r=buildDiscovery([],[],null)
   expect(r.featured).toBeNull()
   expect(r.quickPicks).toHaveLength(0)
 })
})
