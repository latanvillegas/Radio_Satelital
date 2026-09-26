const THEME_KEY = 'ultra_theme'
const APPEARANCE_KEY = 'ultra_appearance'
const UI_SCALE_KEY = 'ultra_ui_scale'
const UI_SCALE_MODE_KEY = 'ultra_ui_scale_mode'

export type ThemeName = 'amoled'|'gold'|'purple'|'white'|'wear-ocean'|'wear-sunset'|'wear-galaxy'|'wear-mint'|'wear-cherry'
export type AppearanceMode = 'dark'|'light'|'system'
export type UiScale = 'small'|'medium'|'large'|'xlarge'
export type UiScaleMode = 'auto'|UiScale
export type ThemeTokens={label:string;themeColor:string;accent:string;accentHover:string;accentGlow:string;accentSubtle:string;bgDark:string;textMain:string;textMuted:string;bgGlass:string;borderGlass:string}

const base=(label:string,accent:string,hover:string,glow:string,subtle:string,text='#f8fafc',muted='#94a3b8'):ThemeTokens=>({label,themeColor:'#000000',accent,accentHover:hover,accentGlow:glow,accentSubtle:subtle,bgDark:'#000000',textMain:text,textMuted:muted,bgGlass:'rgba(255,255,255,.03)',borderGlass:'rgba(255,255,255,.08)'})
export const THEME_TOKENS:Record<ThemeName,ThemeTokens>={
 amoled:base('Rojo','#ef4444','#f87171','rgba(239,68,68,.28)','rgba(239,68,68,.14)'), gold:base('Dorado','#d4af37','#f5d77f','rgba(212,175,55,.28)','rgba(212,175,55,.14)'), purple:base('Morado','#a855f7','#c084fc','rgba(168,85,247,.28)','rgba(168,85,247,.14)'), white:base('Plata','#ffffff','#e2e8f0','rgba(255,255,255,.25)','rgba(255,255,255,.12)'), 'wear-ocean':base('Océano','#06b6d4','#22d3ee','rgba(6,182,212,.28)','rgba(6,182,212,.14)'), 'wear-sunset':base('Naranja','#f97316','#fb923c','rgba(249,115,22,.28)','rgba(249,115,22,.14)'), 'wear-galaxy':base('Azul','#3b82f6','#60a5fa','rgba(59,130,246,.28)','rgba(59,130,246,.14)'), 'wear-mint':base('Verde','#10b981','#34d399','rgba(16,185,129,.28)','rgba(16,185,129,.14)'), 'wear-cherry':base('Rosa','#f43f5e','#fb7185','rgba(244,63,94,.28)','rgba(244,63,94,.14)')
}
const SCALE_VALUE:Record<UiScale,string>={small:'.9',medium:'1',large:'1.12',xlarge:'1.24'}
export const getAvailableThemes=()=>Object.keys(THEME_TOKENS) as ThemeName[]

export function setTheme(name:ThemeName){try{const selected=THEME_TOKENS[name]?name:'amoled',t=THEME_TOKENS[selected],r=document.documentElement;r.setAttribute('data-theme',selected);r.style.setProperty('--accent',t.accent);r.style.setProperty('--accent-hover',t.accentHover);r.style.setProperty('--accent-glow',t.accentGlow);r.style.setProperty('--accent-subtle',t.accentSubtle);localStorage.setItem(THEME_KEY,selected);applyAppearance(getAppearance());window.dispatchEvent(new CustomEvent('theme-changed',{detail:{theme:selected,tokens:t}}))}catch{}}
export function getTheme():ThemeName{try{const s=localStorage.getItem(THEME_KEY) as ThemeName|null;return s&&THEME_TOKENS[s]?s:'wear-mint'}catch{return'wear-mint'}}
export function getAppearance():AppearanceMode{try{const s=localStorage.getItem(APPEARANCE_KEY) as AppearanceMode|null;return s==='light'||s==='system'||s==='dark'?s:'dark'}catch{return'dark'}}
export function setAppearance(mode:AppearanceMode){try{localStorage.setItem(APPEARANCE_KEY,mode);applyAppearance(mode)}catch{}}
export function applyAppearance(mode:AppearanceMode){if(typeof window==='undefined')return;const light=mode==='light'||(mode==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches),r=document.documentElement,t=THEME_TOKENS[getTheme()];r.setAttribute('data-appearance',light?'light':'dark');r.style.setProperty('--bg-dark',light?'#ffffff':'#000000');r.style.setProperty('--text-main',light?'#09090b':t.textMain);r.style.setProperty('--text-muted',light?'#52525b':t.textMuted);r.style.setProperty('--bg-glass',light?'rgba(0,0,0,.035)':t.bgGlass);r.style.setProperty('--border-glass',light?'rgba(0,0,0,.14)':t.borderGlass);document.body.style.backgroundColor=light?'#ffffff':'#000000';document.body.style.color=light?'#09090b':t.textMain;const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',light?'#ffffff':'#000000')}
export function detectScreenSize():UiScale{if(typeof window==='undefined')return'medium';const w=window.innerWidth;return w<600?'small':w<1024?'medium':w<1440?'large':'xlarge'}
export function setUiScaleMode(mode:UiScaleMode){try{if(typeof window==='undefined')return;localStorage.setItem(UI_SCALE_MODE_KEY,mode);setActualUiScale(mode==='auto'?detectScreenSize():mode)}catch{}}
export function getUiScaleMode():UiScaleMode{try{if(typeof window==='undefined')return'auto';const s=localStorage.getItem(UI_SCALE_MODE_KEY) as UiScaleMode|null;return s==='auto'||(s&&SCALE_VALUE[s as UiScale])?s:'auto'}catch{return'auto'}}
export function setActualUiScale(size:UiScale){try{const s=SCALE_VALUE[size]?size:'medium';document.documentElement.setAttribute('data-ui-scale',s);document.documentElement.style.setProperty('--ui-scale',SCALE_VALUE[s]);localStorage.setItem(UI_SCALE_KEY,s)}catch{}}
export function getUiScale():UiScale{try{const s=localStorage.getItem(UI_SCALE_KEY) as UiScale|null;return s&&SCALE_VALUE[s]?s:'medium'}catch{return'medium'}}
export function initializeThemeSettings(){setTheme(getTheme());applyAppearance(getAppearance());const m=getUiScaleMode();setUiScaleMode(m);if(typeof window!=='undefined'){window.matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',()=>{if(getAppearance()==='system')applyAppearance('system')})}}
