// =======================
// SYSTEM CONFIG v4.0 (LAYOUT CONTROLLER)
// =======================

const stations = [
  // ... (MANTÉN TU LISTA DE EMISORAS EXACTAMENTE IGUAL QUE ANTES) ...
  // Pega aquí todas tus emisoras del archivo anterior para no perderlas.
  { name: "Radio Moda", country: "Perú", region: "Sudamérica", url: "https://25023.live.streamtheworld.com/CRP_MOD_SC" },
  { name: "Ritmo Romántica", country: "Perú", region: "Sudamérica", url: "https://25103.live.streamtheworld.com/CRP_RIT_SC" },
  { name: "Onda Cero", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/6598b65ab398c90871aff8cc/icecast.audio" },
  { name: "La Zona", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fada54116646e098d97e6a5/icecast.audio" },
  { name: "Radio Corazón", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fada514fc16c006bd63370f/icecast.audio" },
  { name: "RPP Noticias", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fab3416b5f9ef165cfab6e9/icecast.audio" },
  { name: "Exitosa Noticias", country: "Perú", region: "Sudamérica", url: "https://neptuno-2-audio.mediaserver.digital/79525baf-b0f5-4013-a8bd-3c5c293c6561" },
  { name: "RFI Internacional", country: "Francia", region: "Europa", url: "https://rfienespagnol64k.ice.infomaniak.ch/rfienespagnol-64.mp3" },
  { name: "DW Español", country: "Alemania", region: "Europa", url: "https://dwstream6-lh.akamaihd.net/i/dwstream6_live@123544/master.m3u8" },
  { name: "Cadena COPE", country: "España", region: "Europa", url: "https://net1-cope-rrcast.flumotion.com/cope/net1-low.mp3" }
  // ... agrega el resto ...
];

const regionClassMap = { "Sudamérica": "badge-sudamerica", "Europa": "badge-europa", "Norteamérica": "badge-norteamerica", "Centroamérica": "badge-norteamerica", "Internacional": "badge-default" };

let favorites;
try { favorites = new Set(JSON.parse(localStorage.getItem("ultra_favs") || "[]")); } catch (e) { favorites = new Set(); }

let currentStation = null;
let isPlaying = false;
let els = {}; 

const normalize = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

// --- INIT ---
const init = () => {
  els = {
    player: document.getElementById("radioPlayer"),
    btnPlay: document.getElementById("btnPlay"),
    iconPlay: document.querySelector(".icon-play"),
    iconPause: document.querySelector(".icon-pause"),
    volSlider: document.getElementById("volSlider"),
    status: document.getElementById("statusIndicator"),
    title: document.getElementById("currentStation"),
    artist: document.getElementById("playerHint"),
    list: document.getElementById("stationList"),
    search: document.getElementById("stationSearch"),
    region: document.getElementById("regionSelect"),
    country: document.getElementById("countrySelect"),
    favToggle: document.getElementById("favoritesToggle"),
    clearFilters: document.getElementById("clearFilters"),
    themeSelect: document.getElementById("themeSelect"),
    viewBtns: document.querySelectorAll(".btn-view") // NUEVO: Botones de vista
  };

  if(!els.list) return;
  
  // Cargar Tema
  const savedTheme = localStorage.getItem("ultra_theme") || "default";
  setTheme(savedTheme);
  if(els.themeSelect) els.themeSelect.value = savedTheme;

  loadFilters(); 
  
  // Forzar inicio limpio
  if(els.region) els.region.value = "Todas";
  if(els.country) els.country.value = "Todos";
  if(els.search) els.search.value = "";
  if(els.favToggle) els.favToggle.checked = false;

  renderList();
  setupListeners();
};

const setTheme = (themeName) => {
  if(themeName === "default") document.body.removeAttribute("data-theme");
  else document.body.setAttribute("data-theme", themeName);
  
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if(metaTheme) {
    if(themeName === "amoled") metaTheme.setAttribute("content", "#000000");
    else if(themeName === "white") metaTheme.setAttribute("content", "#ffffff");
    else metaTheme.setAttribute("content", "#05070a");
  }
};

const renderList = () => {
  if (!document.startViewTransition) updateDOM();
  else document.startViewTransition(() => updateDOM());
};

const updateDOM = () => {
  els.list.innerHTML = "";
  const term = normalize(els.search ? els.search.value : "");
  const region = els.region ? els.region.value : "Todas";
  const country = els.country ? els.country.value : "Todos";
  const showFavs = els.favToggle ? els.favToggle.checked : false;

  const filtered = stations.filter(st => {
    const matchSearch = !term || normalize(st.name).includes(term);
    const matchRegion = region === "Todas" || st.region === region;
    const matchCountry = country === "Todos" || st.country === country;
    const matchFav = !showFavs || favorites.has(st.name);
    return matchSearch && matchRegion && matchCountry && matchFav;
  });

  if (filtered.length === 0) {
    els.list.innerHTML = `<p style="color:var(--text-muted); text-align:center; grid-column: 1/-1; padding: 2rem;">Sin señal.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach(st => {
    const isActive = currentStation && currentStation.name === st.name;
    const isFav = favorites.has(st.name);
    const div = document.createElement("div");
    div.className = `station-card ${isActive ? 'active' : ''}`;
    
    div.onclick = (e) => { if(!e.target.closest('.fav-btn')) playStation(st); };

    const badgeClass = regionClassMap[st.region] || "badge-default";
    div.innerHTML = `
      <div class="st-info">
        <div class="st-icon ${badgeClass}"></div>
        <div><span class="st-name">${st.name}</span><span class="st-meta">${st.country}</span></div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="visualizer"><div class="bar"></div><div class="bar"></div><div class="bar"></div></div>
        <button class="fav-btn ${isFav ? 'is-fav' : ''}" type="button"> ${isFav ? '★' : '☆'} </button>
      </div>
    `;
    const btnFav = div.querySelector('.fav-btn');
    btnFav.onclick = (e) => {
      e.stopPropagation();
      if(favorites.has(st.name)) favorites.delete(st.name); else favorites.add(st.name);
      localStorage.setItem("ultra_favs", JSON.stringify([...favorites]));
      renderList();
    };
    fragment.appendChild(div);
  });
  els.list.appendChild(fragment);
};

const playStation = (station) => {
  const allCards = document.querySelectorAll('.station-card');
  allCards.forEach(c => c.classList.remove('active'));
  if (currentStation && currentStation.name === station.name && isPlaying) { togglePlay(); renderList(); return; }
  currentStation = station;
  els.title.innerText = station.name; els.artist.innerText = "Conectando..."; els.status.innerText = "BUFFERING"; els.status.classList.remove("live");
  els.player.src = station.url; if(els.volSlider) els.player.volume = els.volSlider.value;
  els.player.play().then(() => { setPlayingState(true); renderList(); }).catch(() => { els.status.innerText = "ERROR"; setPlayingState(false); });
};

const togglePlay = () => {
  if (!currentStation) return;
  if (els.player.paused) { els.player.play(); setPlayingState(true); } else { els.player.pause(); setPlayingState(false); }
};

const setPlayingState = (playing) => {
  isPlaying = playing;
  if (playing) {
    if(els.iconPlay) els.iconPlay.style.display = "none";
    if(els.iconPause) els.iconPause.style.display = "block";
    els.status.innerText = "EN VIVO"; els.status.classList.add("live");
    if(currentStation) els.artist.innerText = `${currentStation.country}`;
  } else {
    if(els.iconPlay) els.iconPlay.style.display = "block";
    if(els.iconPause) els.iconPause.style.display = "none";
    els.status.innerText = "PAUSADO"; els.status.classList.remove("live");
  }
};

const loadFilters = () => {
  const uniqueRegions = [...new Set(stations.map(s => s.region))].sort();
  const uniqueCountries = [...new Set(stations.map(s => s.country))].sort();
  if(els.region) { els.region.innerHTML = ""; ["Todas", ...uniqueRegions].forEach(v => els.region.add(new Option(v, v))); }
  if(els.country) { els.country.innerHTML = ""; ["Todos", ...uniqueCountries].forEach(v => els.country.add(new Option(v, v))); }
};

const setupListeners = () => {
  if(els.btnPlay) els.btnPlay.addEventListener("click", togglePlay);
  if(els.volSlider) els.volSlider.addEventListener("input", (e) => els.player.volume = e.target.value);
  if(els.themeSelect) els.themeSelect.addEventListener("change", (e) => { setTheme(e.target.value); localStorage.setItem("ultra_theme", e.target.value); });
  if(els.search) els.search.addEventListener("input", renderList);
  if(els.region) els.region.addEventListener("change", renderList);
  if(els.country) els.country.addEventListener("change", renderList);
  if(els.favToggle) els.favToggle.addEventListener("change", renderList);
  if(els.clearFilters) els.clearFilters.addEventListener("click", () => {
    els.search.value = ""; els.region.value = "Todas"; els.country.value = "Todos"; els.favToggle.checked = false; renderList();
  });

  // --- NUEVA LÓGICA DE GRID ---
  els.viewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // 1. Quitar activo visual
      els.viewBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // 2. Aplicar clase al grid
      const mode = btn.dataset.view;
      els.list.className = "station-grid"; // Limpiar
      if(mode === "2") els.list.classList.add("grid-2");
      if(mode === "4") els.list.classList.add("grid-4");
      // 'auto' no añade nada, deja el default
    });
  });
};

document.addEventListener("DOMContentLoaded", init);
