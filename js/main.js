// =======================
// SYSTEM CORE v2.0 (OPTIMIZED)
// =======================

const systemConfig = {
  fadeDuration: 200, // ms
  defaultVolume: 0.8
};

// DATA: FRECUENCIAS
const stations = [
  // ====== PERÚ – LIMA / NACIONAL ======
  { name: "Radio Moda", country: "Perú", region: "Sudamérica", url: "https://25023.live.streamtheworld.com/CRP_MOD_SC" },
  { name: "Ritmo Romántica", country: "Perú", region: "Sudamérica", url: "https://25103.live.streamtheworld.com/CRP_RIT_SC" },
  { name: "Onda Cero", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/6598b65ab398c90871aff8cc/icecast.audio" },
  { name: "La Zona", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fada54116646e098d97e6a5/icecast.audio" },
  { name: "Radio Corazón", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fada514fc16c006bd63370f/icecast.audio" },
  { name: "La Inolvidable", country: "Perú", region: "Sudamérica", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CRP_LI_SC" },
  { name: "Radio Mágica", country: "Perú", region: "Sudamérica", url: "https://26513.live.streamtheworld.com/MAG_AAC_SC" },
  { name: "Radiomar", country: "Perú", region: "Sudamérica", url: "https://24873.live.streamtheworld.com/CRP_MARAAC_SC" },
  { name: "RPP Noticias", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fab3416b5f9ef165cfab6e9/icecast.audio" },
  { name: "Exitosa Noticias", country: "Perú", region: "Sudamérica", url: "https://neptuno-2-audio.mediaserver.digital/79525baf-b0f5-4013-a8bd-3c5c293c6561" },
  { name: "Radio PBO", country: "Perú", region: "Sudamérica", url: "https://stream.radiojar.com/2fse67zuv8hvv" },
  { name: "Radio Inca", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/b9x47pyk21zuv" },

  // ====== PERÚ – REGIONAL ======
  { name: "Radio Santa Lucía", country: "Perú", region: "Sudamérica", url: "https://sp.dattavolt.com/8014/stream" },
  { name: "Radio Pampa Yurac", country: "Perú", region: "Sudamérica", url: "https://rr5200.globalhost1.com/8242/stream" },
  { name: "Radio Turbo Mix", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/167.114.118.120:7624/stream" },
  { name: "Radio Fuego", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/sp.onliveperu.com:8128/" },
  { name: "Radio Stereo TV", country: "Perú", region: "Sudamérica", url: "https://sp.onliveperu.com:7048/stream" },
  { name: "Radio La Kuadra", country: "Perú", region: "Sudamérica", url: "https://dattavolt.com/8046/stream" },
  { name: "Radio Frecuencia", country: "Perú", region: "Sudamérica", url: "https://conectperu.com/8384/stream" },
  { name: "Onda Popular (Lima)", country: "Perú", region: "Sudamérica", url: "https://envivo.top:8443/am" },
  { name: "Onda Popular (Juliaca)", country: "Perú", region: "Sudamérica", url: "https://dattavolt.com/8278/stream" },
  { name: "Radio Nor Andina", country: "Perú", region: "Sudamérica", url: "https://mediastreamm.com/8012/stream/1/" },
  { name: "Radio Andina", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/http://167.114.118.120:7058/;stream" },
  { name: "Radio Ilucán", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/167.114.118.120:7820/;stream" },
  { name: "Radio Bambamarca", country: "Perú", region: "Sudamérica", url: "https://envivo.top:8443/lider" },
  { name: "Radio Continente", country: "Perú", region: "Sudamérica", url: "https://sonic6.my-servers.org/10170/" },
  { name: "La Cheverísima", country: "Perú", region: "Sudamérica", url: "https://sp.onliveperu.com:8114/stream" },
  { name: "Radio TV El Shaddai", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/ppr5q4q3x1zuv" },
  { name: "Radio Inica Digital", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/487vgx80yuhvv" },
  { name: "Radio La Falsa", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/b9x47pyk21zuv" },
  { name: "Radio Activa", country: "Perú", region: "Sudamérica", url: "https://sp.onliveperu.com:8108/stream" },
  { name: "Radio Mía", country: "Perú", region: "Sudamérica", url: "https://streaming.zonalatinaeirl.com:8020/radio" },
  { name: "Radio Patrón", country: "Perú", region: "Sudamérica", url: "https://streaming.zonalatinaeirl.com:8010/radio" },
  { name: "Radio El Patrón (Señal 2)", country: "Perú", region: "Sudamérica", url: "https://serverssl.innovatestream.pe:8080/http://sp.onliveperu.com:8046/;stream" },
  { name: "Radio Televisión Sureña", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/p7d5fpx4xnhvv" },
  { name: "Radio Enamorados", country: "Perú", region: "Sudamérica", url: "https://stream.zeno.fm/gnybbqc1fnruv" },

  // ====== EUROPA / INTERNACIONAL ======
  { name: "RFI Internacional", country: "Francia", region: "Europa", url: "https://rfienespagnol64k.ice.infomaniak.ch/rfienespagnol-64.mp3" },
  { name: "RFI Español (96k)", country: "Francia", region: "Europa", url: "https://rfiespagnol96k.ice.infomaniak.ch/rfiespagnol-96k.mp3" },
  { name: "DW Español", country: "Alemania", region: "Europa", url: "https://dwstream6-lh.akamaihd.net/i/dwstream6_live@123544/master.m3u8" },
  { name: "RNE 5 (España)", country: "España", region: "Europa", url: "https://dispatcher.rndfnk.com/crtve/rne5/main/mp3/high?aggregator=tunein" },
  { name: "Radio Tele Taxi", country: "España", region: "Europa", url: "https://radiott-web.streaming-pro.com:6103/radiott.mp3" },
  { name: "Radio ES", country: "España", region: "Europa", url: "https://libertaddigital-radio-live1.flumotion.com/libertaddigital/ld-live1-low.mp3" },
  { name: "Cadena COPE", country: "España", region: "Europa", url: "https://net1-cope-rrcast.flumotion.com/cope/net1-low.mp3" },
  { name: "Radio La Hondureña", country: "Honduras", region: "Centroamérica", url: "https://s2.mkservers.space/rih" }
];

// ESTADO GLOBAL
let appState = {
  currentStation: null,
  isPlaying: false,
  favorites: new Set(JSON.parse(localStorage.getItem("pro_favs") || "[]"))
};

// ELEMENTOS DOM (Cache)
const ui = {
  audio: document.getElementById("radioPlayer"),
  playBtn: document.getElementById("btnPlay"),
  volSlider: document.getElementById("volSlider"),
  status: document.getElementById("statusIndicator"),
  title: document.getElementById("currentStation"),
  artist: document.getElementById("playerHint"),
  list: document.getElementById("stationList"),
  search: document.getElementById("stationSearch"),
  region: document.getElementById("regionSelect"),
  country: document.getElementById("countrySelect"),
  favToggle: document.getElementById("favoritesToggle"),
  clearFilters: document.getElementById("clearFilters")
};

// =======================
// CORE FUNCTIONS
// =======================

const init = () => {
  if (!ui.list) return console.error("Critical: DOM not ready");
  
  loadFilters();
  
  // Set volumen inicial
  ui.audio.volume = systemConfig.defaultVolume;
  ui.volSlider.value = systemConfig.defaultVolume;
  
  renderList();
  bindEvents();
  
  // Reset UI inicial
  updateStatus("STANDBY", false);
};

// --- AUDIO ENGINE ---

const playStation = async (station) => {
  // Update UI Visuals inmediatamente
  document.querySelectorAll('.station-card').forEach(c => c.classList.remove('active'));
  
  // Si es la misma estación, hacemos toggle
  if (appState.currentStation?.name === station.name) {
    togglePlay();
    renderList(); // Para actualizar estado visual de la tarjeta
    return;
  }

  // Nueva Estación
  appState.currentStation = station;
  appState.isPlaying = true; // Asumimos true mientras carga
  
  // Actualizar Info Player
  ui.title.innerText = station.name;
  ui.artist.innerText = `${station.country} // ${station.region.toUpperCase()}`;
  updateStatus("BUFFERING...", true);

  // Audio Load
  ui.audio.src = station.url;
  
  try {
    await ui.audio.play();
    updateStatus("ESTABLISHED", true);
    renderList(); // Re-render para marcar la tarjeta activa
    updatePlayButton(true);
  } catch (err) {
    console.error("Stream Error:", err);
    updateStatus("SIGNAL LOST", false);
    appState.isPlaying = false;
    updatePlayButton(false);
  }
};

const togglePlay = () => {
  if (!appState.currentStation) return;

  if (ui.audio.paused) {
    ui.audio.play()
      .then(() => {
        appState.isPlaying = true;
        updateStatus("ESTABLISHED", true);
        updatePlayButton(true);
      })
      .catch(e => {
        updateStatus("ERROR", false);
        appState.isPlaying = false;
      });
  } else {
    ui.audio.pause();
    appState.isPlaying = false;
    updateStatus("STANDBY", false);
    updatePlayButton(false);
  }
};

// --- UI UPDATES ---

const updateStatus = (text, isLive) => {
  ui.status.innerText = text;
  if (isLive) ui.status.classList.add("live");
  else ui.status.classList.remove("live");
};

const updatePlayButton = (isPlaying) => {
  // SVG Icons
  const playIcon = `<svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
  const pauseIcon = `<svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
  
  ui.playBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
  document.title = isPlaying ? `▶ ${appState.currentStation.name}` : "Satelital | Core";
};

const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const renderList = () => {
  ui.list.innerHTML = "";
  
  const term = normalize(ui.search.value);
  const region = ui.region.value;
  const country = ui.country.value;
  const showFavs = ui.favToggle.checked;

  const filtered = stations.filter(st => {
    const matchSearch = !term || normalize(st.name).includes(term);
    const matchRegion = region === "Todas" || st.region === region;
    const matchCountry = country === "Todos" || st.country === country;
    const matchFav = !showFavs || appState.favorites.has(st.name);
    return matchSearch && matchRegion && matchCountry && matchFav;
  });

  if (filtered.length === 0) {
    ui.list.innerHTML = `<p style="color:var(--text-muted); text-align:center; grid-column: 1/-1; padding: 2rem; font-family:var(--font-mono);">NO SIGNAL FOUND.</p>`;
    return;
  }

  // Fragment para rendimiento
  const fragment = document.createDocumentFragment();

  filtered.forEach(st => {
    const isActive = appState.currentStation?.name === st.name;
    const isFav = appState.favorites.has(st.name);
    
    const div = document.createElement("div");
    div.className = `station-card ${isActive ? 'active' : ''}`;
    
    // Badges simples basados en región
    const badgeMap = {
      "Sudamérica": "badge-sudamerica",
      "Europa": "badge-europa",
      "Norteamérica": "badge-norteamerica"
    };
    const badgeClass = badgeMap[st.region] || "badge-default";

    div.innerHTML = `
      <div class="st-info">
        <div class="st-icon ${badgeClass}">
          ${st.name.substring(0,2).toUpperCase()}
        </div>
        <div>
          <span class="st-name">${st.name}</span>
          <span class="st-meta">${st.country}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="visualizer">
          <div class="bar"></div><div class="bar"></div><div class="bar"></div>
        </div>
        <button class="fav-btn ${isFav ? 'is-fav' : ''}" aria-label="Favorito">
          ${isFav ? '★' : '☆'}
        </button>
      </div>
    `;

    // Click en la tarjeta (Play)
    div.onclick = (e) => {
      if(!e.target.closest('.fav-btn')) playStation(st);
    };

    // Click en Favorito
    const btnFav = div.querySelector('.fav-btn');
    btnFav.onclick = (e) => {
      e.stopPropagation();
      toggleFavorite(st.name);
    };

    fragment.appendChild(div);
  });

  ui.list.appendChild(fragment);
};

const toggleFavorite = (name) => {
  if (appState.favorites.has(name)) {
    appState.favorites.delete(name);
  } else {
    appState.favorites.add(name);
  }
  localStorage.setItem("pro_favs", JSON.stringify([...appState.favorites]));
  renderList();
};

// --- FILTERS & UTILS ---

const loadFilters = () => {
  const regions = ["Todas", ...new Set(stations.map(s => s.region))].sort();
  const countries = ["Todos", ...new Set(stations.map(s => s.country))].sort();
  
  populateSelect(ui.region, regions);
  populateSelect(ui.country, countries);
};

const populateSelect = (el, items) => {
  el.innerHTML = "";
  items.forEach(i => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.innerText = i;
    el.appendChild(opt);
  });
};

const bindEvents = () => {
  ui.playBtn.addEventListener("click", togglePlay);
  
  ui.volSlider.addEventListener("input", (e) => {
    ui.audio.volume = e.target.value;
  });

  // Filtros dinámicos
  [ui.search, ui.region, ui.country, ui.favToggle].forEach(el => {
    if(el) el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', renderList);
  });

  if(ui.clearFilters) {
    ui.clearFilters.addEventListener("click", () => {
      ui.search.value = "";
      ui.region.value = "Todas";
      ui.country.value = "Todos";
      ui.favToggle.checked = false;
      renderList();
    });
  }
  
  // Error handling nativo del audio
  ui.audio.onerror = () => {
    if(appState.isPlaying) updateStatus("STREAM ERROR", false);
  };
};

// BOOT
document.addEventListener("DOMContentLoaded", init);
