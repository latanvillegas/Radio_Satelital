// =======================
// CONFIGURACIÓN & DATOS
// =======================
// NOTA: He cambiado HTTP a HTTPS. Las que no soporten HTTPS fallarán.
// Es necesario para que funcione en GitHub Pages.
const stations = [
  // PERÚ
  { name: "Radio Moda", country: "Perú", region: "Sudamérica", url: "https://25023.live.streamtheworld.com/CRP_MOD_SC" },
  { name: "Ritmo Romántica", country: "Perú", region: "Sudamérica", url: "https://25103.live.streamtheworld.com/CRP_RIT_SC" },
  { name: "Onda Cero", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/6598b65ab398c90871aff8cc/icecast.audio" },
  { name: "La Zona", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fada54116646e098d97e6a5/icecast.audio" },
  { name: "RPP Noticias", country: "Perú", region: "Sudamérica", url: "https://mdstrm.com/audio/5fab3416b5f9ef165cfab6e9/icecast.audio" },
  { name: "Exitosa", country: "Perú", region: "Sudamérica", url: "https://neptuno-2-audio.mediaserver.digital/79525baf-b0f5-4013-a8bd-3c5c293c6561" },
  
  // EUROPA
  { name: "RFI Español", country: "Francia", region: "Europa", url: "https://rfiespagnol64k.ice.infomaniak.ch/rfienespagnol-64.mp3" },
  { name: "RNE 5", country: "España", region: "Europa", url: "https://dispatcher.rndfnk.com/crtve/rne5/main/mp3/high?aggregator=tunein" },
  { name: "Cadena COPE", country: "España", region: "Europa", url: "https://net1-cope-rrcast.flumotion.com/cope/net1-low.mp3" },
  
  // AÑADE MÁS AQUÍ (SOLO HTTPS)
];

const regionClassMap = {
  Sudamérica: "badge-sudamerica",
  Europa: "badge-europa"
};

let favorites = new Set(JSON.parse(localStorage.getItem("ultra_favs") || "[]"));
let currentStation = null;
let isPlaying = false;

// =======================
// ELEMENTOS DOM
// =======================
const els = {
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
  clearFilters: document.getElementById("clearFilters")
};

// =======================
// LÓGICA PRINCIPAL
// =======================
const init = () => {
  loadFilters();
  renderList();
  setupListeners();
};

// --- Búsqueda Inteligente (Normaliza texto) ---
const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const renderList = () => {
  els.list.innerHTML = "";
  
  const term = normalize(els.search.value);
  const region = els.region.value;
  const country = els.country.value;
  const showFavs = els.favToggle.checked;

  const filtered = stations.filter(st => {
    const matchSearch = !term || normalize(st.name).includes(term);
    const matchRegion = region === "Todas" || st.region === region;
    const matchCountry = country === "Todos" || st.country === country;
    const matchFav = !showFavs || favorites.has(st.name);
    return matchSearch && matchRegion && matchCountry && matchFav;
  });

  if (filtered.length === 0) {
    els.list.innerHTML = `<p style="color:#666; text-align:center; width:100%;">No hay resultados.</p>`;
    return;
  }

  filtered.forEach(st => {
    const isActive = currentStation && currentStation.name === st.name;
    const isFav = favorites.has(st.name);
    
    const div = document.createElement("div");
    div.className = `station-card ${isActive ? 'active' : ''}`;
    div.onclick = (e) => {
      if(!e.target.closest('.fav-btn')) playStation(st);
    };

    const badgeClass = regionClassMap[st.region] || "badge-default";

    div.innerHTML = `
      <div class="st-info">
        <div class="st-icon ${badgeClass}"></div>
        <div>
          <span class="st-name">${st.name}</span>
          <span class="st-meta">${st.country}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="visualizer">
          <div class="bar"></div><div class="bar"></div><div class="bar"></div>
        </div>
        <button class="fav-btn ${isFav ? 'is-fav' : ''}">
          ${isFav ? '★' : '☆'}
        </button>
      </div>
    `;

    // Lógica Favorito
    const btnFav = div.querySelector('.fav-btn');
    btnFav.onclick = (e) => {
      e.stopPropagation();
      if(favorites.has(st.name)) favorites.delete(st.name);
      else favorites.add(st.name);
      localStorage.setItem("ultra_favs", JSON.stringify([...favorites]));
      renderList(); // Re-render para actualizar iconos
    };

    els.list.appendChild(div);
  });
};

// --- Player Logic ---
const playStation = (station) => {
  // Reset visual previo
  document.querySelectorAll('.station-card').forEach(c => c.classList.remove('active'));
  
  if (currentStation && currentStation.name === station.name && isPlaying) {
    // Si es la misma y está sonando, pausar
    togglePlay();
    return;
  }

  currentStation = station;
  els.title.innerText = station.name;
  els.artist.innerText = "Cargando stream...";
  els.status.innerText = "CONECTANDO...";
  els.status.style.color = "#ffca28"; // Ambar

  els.player.src = station.url;
  els.player.volume = els.volSlider.value;
  
  const playPromise = els.player.play();

  if (playPromise !== undefined) {
    playPromise.then(() => {
      setPlayingState(true);
      // Actualizar UI Lista
      renderList();
    }).catch(error => {
      console.error("Error playback:", error);
      els.artist.innerText = "Error: Stream offline o no seguro (HTTP).";
      els.status.innerText = "ERROR";
      els.status.style.color = "#ff3d3d";
      setPlayingState(false);
    });
  }
};

const togglePlay = () => {
  if (!currentStation) return;
  if (els.player.paused) {
    els.player.play();
    setPlayingState(true);
  } else {
    els.player.pause();
    setPlayingState(false);
  }
};

const setPlayingState = (playing) => {
  isPlaying = playing;
  if (playing) {
    els.iconPlay.style.display = "none";
    els.iconPause.style.display = "block";
    els.status.innerText = "EN VIVO";
    els.status.classList.add("live");
    els.artist.innerText = `${currentStation.country} · ${currentStation.region}`;
  } else {
    els.iconPlay.style.display = "block";
    els.iconPause.style.display = "none";
    els.status.innerText = "PAUSADO";
    els.status.classList.remove("live");
  }
};

// --- Filtros ---
const loadFilters = () => {
  const regions = ["Todas", ...new Set(stations.map(s => s.region))];
  const countries = ["Todos", ...new Set(stations.map(s => s.country))];

  fillSelect(els.region, regions);
  fillSelect(els.country, countries);
};

const fillSelect = (sel, arr) => {
  sel.innerHTML = "";
  arr.forEach(val => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.innerText = val;
    sel.appendChild(opt);
  });
};

const setupListeners = () => {
  els.btnPlay.addEventListener("click", togglePlay);
  
  els.volSlider.addEventListener("input", (e) => {
    els.player.volume = e.target.value;
  });

  els.search.addEventListener("input", renderList);
  els.region.addEventListener("change", renderList);
  els.country.addEventListener("change", renderList);
  els.favToggle.addEventListener("change", renderList);

  els.clearFilters.addEventListener("click", () => {
    els.search.value = "";
    els.region.value = "Todas";
    els.country.value = "Todos";
    els.favToggle.checked = false;
    renderList();
  });
};

// Arrancar
document.addEventListener("DOMContentLoaded", init);
