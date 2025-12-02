// =======================
// LISTA DE EMISORAS
// =======================
const stations = [
  // ====== PERÚ – LIMA / NACIONAL ======
  {
    name: "Radio Moda",
    country: "Perú",
    region: "Sudamérica",
    url: "https://25023.live.streamtheworld.com/CRP_MOD_SC",
    metadataUrl: ""
  },
  {
    name: "Ritmo Romántica",
    country: "Perú",
    region: "Sudamérica",
    url: "https://25103.live.streamtheworld.com/CRP_RIT_SC",
    metadataUrl: ""
  },
  {
    name: "Onda Cero",
    country: "Perú",
    region: "Sudamérica",
    url: "https://mdstrm.com/audio/6598b65ab398c90871aff8cc/icecast.audio",
    metadataUrl: ""
  },
  {
    name: "La Zona",
    country: "Perú",
    region: "Sudamérica",
    url: "https://mdstrm.com/audio/5fada54116646e098d97e6a5/icecast.audio",
    metadataUrl: ""
  },
  {
    name: "Corazón",
    country: "Perú",
    region: "Sudamérica",
    url: "https://mdstrm.com/audio/5fada514fc16c006bd63370f/icecast.audio",
    metadataUrl: ""
  },
  {
    name: "La Inolvidable",
    country: "Perú",
    region: "Sudamérica",
    url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CRP_LI_SC",
    metadataUrl: ""
  },
  {
    name: "Mágica",
    country: "Perú",
    region: "Sudamérica",
    url: "https://26513.live.streamtheworld.com/MAG_AAC_SC",
    metadataUrl: ""
  },
  {
    name: "Radiomar",
    country: "Perú",
    region: "Sudamérica",
    url: "https://24873.live.streamtheworld.com/CRP_MARAAC_SC",
    metadataUrl: ""
  },
  {
    name: "RPP",
    country: "Perú",
    region: "Sudamérica",
    url: "https://mdstrm.com/audio/5fab3416b5f9ef165cfab6e9/icecast.audio",
    metadataUrl: ""
  },
  {
    name: "Romántica (otra señal)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://27153.live.streamtheworld.com/CRP_RIT_SC",
    metadataUrl: ""
  },
  {
    name: "Exitosa Noticias",
    country: "Perú",
    region: "Sudamérica",
    url: "https://neptuno-2-audio.mediaserver.digital/79525baf-b0f5-4013-a8bd-3c5c293c6561",
    metadataUrl: ""
  },

  // ====== PERÚ – REGIONES / CAJAMARCA / PUNO, ETC. ======
  {
    name: "Radio Santa Lucía",
    country: "Perú",
    region: "Sudamérica",
    url: "https://sp.dattavolt.com/8014/stream",
    metadataUrl: ""
  },
  {
    name: "Radio Pampa Yurac",
    country: "Perú",
    region: "Sudamérica",
    url: "https://rr5200.globalhost1.com/8242/stream",
    metadataUrl: ""
  },
  {
    name: "Radio Turbo Mix",
    country: "Perú",
    region: "Sudamérica",
    url: "https://serverssl.innovatestream.pe:8080/167.114.118.120:7624/stream",
    metadataUrl: ""
  },
  {
    name: "Radio Fuego",
    country: "Perú",
    region: "Sudamérica",
    url: "https://serverssl.innovatestream.pe:8080/sp.onliveperu.com:8128/",
    metadataUrl: ""
  },
  {
    name: "Radio Stereo TV",
    country: "Perú",
    region: "Sudamérica",
    url: "https://sp.onliveperu.com:7048/stream",
    metadataUrl: ""
  },
  {
    name: "Radio La Kuadra",
    country: "Perú",
    region: "Sudamérica",
    url: "https://dattavolt.com/8046/stream",
    metadataUrl: ""
  },
  {
    name: "Radio Frecuencia",
    country: "Perú",
    region: "Sudamérica",
    url: "https://conectperu.com/8384/stream",
    metadataUrl: ""
  },
  {
    name: "Onda Popular (Cajamarca)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://envivo.top:8443/am",
    metadataUrl: ""
  },
  {
    name: "Onda Popular (Juliaca, Puno)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://dattavolt.com/8278/stream",
    metadataUrl: ""
  },
  {
    name: "Radio Nor Andina",
    country: "Perú",
    region: "Sudamérica",
    url: "https://mediastreamm.com/8012/stream/1/",
    metadataUrl: ""
  },
  {
    name: "Radio Andina",
    country: "Perú",
    region: "Sudamérica",
    url: "https://serverssl.innovatestream.pe:8080/http://167.114.118.120:7058/;stream",
    metadataUrl: ""
  },
  {
    name: "Radio Ilucán",
    country: "Perú",
    region: "Sudamérica",
    url: "https://serverssl.innovatestream.pe:8080/167.114.118.120:7820/;stream",
    metadataUrl: ""
  },
  {
    name: "Radio Bambamarca",
    country: "Perú",
    region: "Sudamérica",
    url: "https://envivo.top:8443/lider",
    metadataUrl: ""
  },
  {
    name: "Radio Continente",
    country: "Perú",
    region: "Sudamérica",
    url: "https://sonic6.my-servers.org/10170/",
    metadataUrl: ""
  },
  {
    name: "La Cheverísima (Jaén, Cajamarca)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://sp.onliveperu.com/8114/stream",
    metadataUrl: ""
  },
  {
    name: "Radio TV El Shaddai (Cajamarca)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://stream.zeno.fm/ppr5q4q3x1zuv",
    metadataUrl: ""
  },
  {
    name: "Radio Inica Digital (Cajamarca)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://stream.zeno.fm/487vgx80yuhvv",
    metadataUrl: ""
  },
  {
    name: "Radio La Falsa (Cajamarca)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://stream.zeno.fm/b9x47pyk21zuv",
    metadataUrl: ""
  },
  {
    name: "Radio Activa (Jaén, Cajamarca)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://sp.onliveperu.com/8108/stream",
    metadataUrl: ""
  },
  {
    name: "Radio Mía",
    country: "Perú",
    region: "Sudamérica",
    url: "https://streaming.zonalatinaeirl.com:8020/radio",
    metadataUrl: ""
  },
  {
    name: "Radio Patrón",
    country: "Perú",
    region: "Sudamérica",
    url: "https://streaming.zonalatinaeirl.com:8010/radio",
    metadataUrl: ""
  },
  {
    name: "Radio El Patrón (otra señal)",
    country: "Perú",
    region: "Sudamérica",
    url: "https://serverssl.innovatestream.pe:8080/http://sp.onliveperu.com:8046/;stream",
    metadataUrl: ""
  },

  // ====== PERÚ – OTROS / TEMÁTICAS ======
  {
    name: "Radio Televisión Sureña",
    country: "Perú",
    region: "Sudamérica",
    url: "https://stream.zeno.fm/p7d5fpx4xnhvv",
    metadataUrl: ""
  },
  {
    name: "Radio Enamorados",
    country: "Perú",
    region: "Sudamérica",
    url: "https://stream.zeno.fm/gnybbqc1fnruv",
    metadataUrl: ""
  },
  {
    name: "Radio PBO",
    country: "Perú",
    region: "Sudamérica",
    url: "https://stream.radiojar.com/2fse67zuv8hvv",
    metadataUrl: ""
  },

  // ====== FRANCIA / ESPAÑA – EUROPA ======
  {
    name: "RFI Internacional en Español (64k)",
    country: "Francia",
    region: "Europa",
    url: "https://rfienespagnol64k.ice.infomaniak.ch/rfienespagnol-64.mp3",
    metadataUrl: ""
  },
  {
    name: "RFI Español (96k)",
    country: "Francia",
    region: "Europa",
    url: "https://rfiespagnol96k.ice.infomaniak.ch/rfiespagnol-96k.mp3",
    metadataUrl: ""
  },
  {
    name: "RNE 5 España",
    country: "España",
    region: "Europa",
    url: "https://dispatcher.rndfnk.com/crtve/rne5/main/mp3/high?aggregator=tunein",
    metadataUrl: ""
  },
  {
    name: "Radio Tele Taxi (Barcelona)",
    country: "España",
    region: "Europa",
    url: "https://radiott-web.streaming-pro.com:6103/radiott.mp3",
    metadataUrl: ""
  },
  {
    name: "Radio ES (Libertad Digital)",
    country: "España",
    region: "Europa",
    url: "https://libertaddigital-radio-live1.flumotion.com/libertaddigital/ld-live1-low.mp3",
    metadataUrl: ""
  },
  {
    name: "Cadena COPE",
    country: "España",
    region: "Europa",
    url: "https://net1-cope-rrcast.flumotion.com/cope/net1-low.mp3",
    metadataUrl: ""
  },

  // ====== INTERNACIONAL / OTROS PAÍSES ======
  {
    name: "Radio Internacional La Florida",
    country: "Internacional",
    region: "Norteamérica",
    url: "http://s8.myradiostream.com:56524/",
    metadataUrl: ""
  },
  {
    name: "Radio Internacional La Hondureña",
    country: "Honduras",
    region: "Centroamérica",
    url: "https://s2.mkservers.space/rih",
    metadataUrl: ""
  },
  {
    name: "Radio Vallenato Internacional",
    country: "Internacional",
    region: "Sudamérica",
    url: "http://server7.servistreaming.com:10010/stream",
    metadataUrl: ""
  }
];

// Mapa de región -> clase de icono (color)
const regionClassMap = {
  Sudamérica: "badge-sudamerica",
  Centroamérica: "badge-centroamerica",
  Norteamérica: "badge-norteamerica",
  Europa: "badge-europa",
  Internacional: "badge-internacional"
};

// Keys para localStorage
const FAVORITES_KEY = "radio_satelital_favoritas";
const LAST_STATION_KEY = "radio_satelital_ultima";

// =======================
// REFERENCIAS DEL DOM
// =======================
const regionSelect = document.getElementById("regionSelect");
const countrySelect = document.getElementById("countrySelect");
const stationList = document.getElementById("stationList");
const player = document.getElementById("radioPlayer");
const currentStation = document.getElementById("currentStation");
const playerHint = document.getElementById("playerHint");
const clearFiltersBtn = document.getElementById("clearFilters");
const searchInput = document.getElementById("stationSearch");
const favoritesToggle = document.getElementById("favoritesToggle");

// Player bar (mobile)
const playerBar = document.getElementById("playerBar");
const playerBarStation = document.getElementById("playerBarStation");
const playerBarPlayPause = document.getElementById("playerBarPlayPause");

// =======================
// ESTADO
// =======================
let favorites = new Set();
let searchTerm = "";
let currentStationData = null;

// =======================
// FUNCIONES AUXILIARES
// =======================

function setStationListBusy(isBusy) {
  if (!stationList) return;
  stationList.setAttribute("aria-busy", isBusy ? "true" : "false");
}

function setCurrentStationText(text) {
  if (!currentStation) return;
  currentStation.textContent = text;
}

function updatePlayerHint(text) {
  if (!playerHint) return;
  playerHint.textContent = text;
}

function updatePlayerBarVisibility() {
  if (!playerBar) return;
  if (currentStationData) {
    playerBar.classList.add("player-bar--visible");
    playerBar.setAttribute("aria-hidden", "false");
  } else {
    playerBar.classList.remove("player-bar--visible");
    playerBar.setAttribute("aria-hidden", "true");
  }
}

function updatePlayerBarText() {
  if (!playerBarStation) return;
  if (currentStationData) {
    playerBarStation.textContent = `Reproduciendo: ${currentStationData.name}`;
  } else {
    playerBarStation.textContent = "Ninguna emisora";
  }
}

function updatePlayerBarPlayPauseIcon() {
  if (!playerBarPlayPause) return;
  if (player && !player.paused) {
    playerBarPlayPause.textContent = "⏸";
  } else {
    playerBarPlayPause.textContent = "▶";
  }
}

function saveFavoritesToStorage() {
  const arr = Array.from(favorites);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));
}

function loadFavoritesFromStorage() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  if (!raw) return;
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      favorites = new Set(arr);
    }
  } catch {
    // nada
  }
}

function saveLastStationToStorage(station) {
  if (!station) return;
  localStorage.setItem(LAST_STATION_KEY, JSON.stringify(station.name));
}

function loadLastStationFromStorage() {
  const raw = localStorage.getItem(LAST_STATION_KEY);
  if (!raw) return null;
  try {
    const name = JSON.parse(raw);
    if (typeof name === "string") {
      return stations.find((st) => st.name === name) || null;
    }
  } catch {
    return null;
  }
}

function getStationByNameFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const stationName = params.get("station");
  if (!stationName) return null;
  return stations.find((st) => st.name === decodeURIComponent(stationName)) || null;
}

function buildShareUrlForStation(station) {
  const url = new URL(window.location.href);
  url.searchParams.set("station", encodeURIComponent(station.name));
  return url.toString();
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // fallback
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
  return Promise.resolve();
}

// =======================
// INICIO
// =======================
function init() {
  if (!regionSelect || !countrySelect || !stationList || !player) return;

  // Cargar estado desde localStorage
  loadFavoritesFromStorage();

  cargarRegiones();
  actualizarPaises();
  renderStations();

  regionSelect.addEventListener("change", () => {
    actualizarPaises();
    renderStations();
  });

  countrySelect.addEventListener("change", () => {
    renderStations();
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      regionSelect.value = "Todas";
      actualizarPaises();
      countrySelect.value = "Todos";
      searchTerm = "";
      if (searchInput) searchInput.value = "";
      if (favoritesToggle) favoritesToggle.checked = false;
      renderStations();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      renderStations();
    });
  }

  if (favoritesToggle) {
    favoritesToggle.addEventListener("change", () => {
      renderStations();
    });
  }

  // Manejo básico de error del reproductor
  player.addEventListener("error", () => {
    updatePlayerHint("Error al reproducir la emisora. Intenta con otra estación.");
  });

  player.addEventListener("play", () => {
    updatePlayerBarPlayPauseIcon();
  });

  player.addEventListener("pause", () => {
    updatePlayerBarPlayPauseIcon();
  });

  // Player bar (mobile) botón play/pause
  if (playerBarPlayPause) {
    playerBarPlayPause.addEventListener("click", () => {
      if (!player) return;
      if (player.paused) {
        player.play().catch(() => {
          updatePlayerHint(
            "No se pudo iniciar la reproducción automáticamente. Pulsa play en el reproductor."
          );
        });
      } else {
        player.pause();
      }
    });
  }

  // Última emisora reproducida
  const stationFromQuery = getStationByNameFromQuery();
  const lastStation = stationFromQuery || loadLastStationFromStorage();

  if (lastStation) {
    currentStationData = lastStation;
    player.src = lastStation.url;
    setCurrentStationText(
      `Última emisora: ${lastStation.name} (${lastStation.country} · ${lastStation.region})`
    );
    updatePlayerHint("Pulsa play para continuar escuchando la última emisora.");
    updatePlayerBarText();
    updatePlayerBarVisibility();
  }
}

// =======================
// CARGAR REGIONES
// =======================
function cargarRegiones() {
  const regiones = ["Todas"];

  stations.forEach((st) => {
    if (!regiones.includes(st.region)) {
      regiones.push(st.region);
    }
  });

  regionSelect.innerHTML = "";
  regiones.forEach((region) => {
    const opt = document.createElement("option");
    opt.value = region;
    opt.textContent = region;
    regionSelect.appendChild(opt);
  });

  regionSelect.value = "Todas";
}

// =======================
// ACTUALIZAR PAÍSES
// =======================
function actualizarPaises() {
  const regionSeleccionada = regionSelect.value || "Todas";
  const paises = ["Todos"];

  stations.forEach((st) => {
    const coincideRegion =
      regionSeleccionada === "Todas" || st.region === regionSeleccionada;

    if (coincideRegion && !paises.includes(st.country)) {
      paises.push(st.country);
    }
  });

  countrySelect.innerHTML = "";
  paises.forEach((pais) => {
    const opt = document.createElement("option");
    opt.value = pais;
    opt.textContent = pais;
    countrySelect.appendChild(opt);
  });

  countrySelect.value = "Todos";
}

// =======================
// RENDERIZAR EMISORAS
// =======================
function renderStations() {
  const regionSeleccionada = regionSelect.value || "Todas";
  const paisSeleccionado = countrySelect.value || "Todos";
  const soloFavoritas = favoritesToggle ? favoritesToggle.checked : false;

  setStationListBusy(true);
  stationList.innerHTML = "";

  const filtradas = stations.filter((st) => {
    const coincideRegion =
      regionSeleccionada === "Todas" || st.region === regionSeleccionada;
    const coincidePais =
      paisSeleccionado === "Todos" || st.country === paisSeleccionado;
    const coincideBusqueda =
      !searchTerm ||
      st.name.toLowerCase().includes(searchTerm);

    const coincideFavorita = !soloFavoritas || favorites.has(st.name);

    return coincideRegion && coincidePais && coincideBusqueda && coincideFavorita;
  });

  if (filtradas.length === 0) {
    const p = document.createElement("p");
    p.className = "no-results";
    p.textContent = "No hay emisoras para este filtro.";
    stationList.appendChild(p);
    setStationListBusy(false);
    return;
  }

  // Agrupar por país
  const gruposPorPais = new Map();
  filtradas.forEach((st) => {
    if (!gruposPorPais.has(st.country)) {
      gruposPorPais.set(st.country, []);
    }
    gruposPorPais.get(st.country).push(st);
  });

  // Ordenar países alfabéticamente
  const paisesOrdenados = Array.from(gruposPorPais.keys()).sort((a, b) =>
    a.localeCompare(b, "es")
  );

  paisesOrdenados.forEach((pais) => {
    const groupWrapper = document.createElement("div");
    groupWrapper.className = "station-group";

    const heading = document.createElement("h3");
    heading.className = "country-heading";
    heading.textContent = pais;
    groupWrapper.appendChild(heading);

    const groupList = document.createElement("div");
    groupList.className = "station-group-list";

    gruposPorPais.get(pais).forEach((st) => {
      const card = createStationCard(st);
      groupList.appendChild(card);
    });

    groupWrapper.appendChild(groupList);
    stationList.appendChild(groupWrapper);
  });

  setStationListBusy(false);
}

// =======================
// CREAR TARJETA DE EMISORA
// =======================
function createStationCard(st) {
  const btn = document.createElement("button");
  btn.className = "station-btn";
  btn.type = "button";

  if (favorites.has(st.name)) {
    btn.classList.add("is-favorite");
  }

  const mainRow = document.createElement("div");
  mainRow.className = "station-main-row";

  const row = document.createElement("div");
  row.className = "station-row";

  // Icono por región
  const badge = document.createElement("div");
  const regionClass = regionClassMap[st.region] || "badge-internacional";
  badge.className = "station-icon " + regionClass;

  const info = document.createElement("div");
  info.className = "station-info";

  const title = document.createElement("div");
  title.className = "station-title";
  title.textContent = st.name;

  const meta = document.createElement("div");
  meta.className = "station-meta";
  meta.textContent = `${st.country} · ${st.region}`;

  info.appendChild(title);
  info.appendChild(meta);

  row.appendChild(badge);
  row.appendChild(info);

  const actions = document.createElement("div");
  actions.className = "station-actions";

  // Botón favorito
  const favBtn = document.createElement("button");
  favBtn.type = "button";
  favBtn.className = "icon-btn fav-btn";
  const isFav = favorites.has(st.name);
  favBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
  favBtn.setAttribute(
    "aria-label",
    isFav ? "Quitar de favoritas" : "Marcar como favorita"
  );
  favBtn.textContent = isFav ? "★" : "☆";

  favBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    toggleFavorite(st, btn, favBtn);
  });

  // Botón compartir
  const shareBtn = document.createElement("button");
  shareBtn.type = "button";
  shareBtn.className = "icon-btn share-btn";
  shareBtn.setAttribute("aria-label", "Compartir esta emisora");
  shareBtn.textContent = "↗";

  shareBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    shareStation(st);
  });

  actions.appendChild(favBtn);
  actions.appendChild(shareBtn);

  mainRow.appendChild(row);
  mainRow.appendChild(actions);

  btn.appendChild(mainRow);

  btn.addEventListener("click", () => playRadio(st, btn));

  return btn;
}

// =======================
// FAVORITOS
// =======================
function toggleFavorite(station, cardBtn, favBtn) {
  if (favorites.has(station.name)) {
    favorites.delete(station.name);
  } else {
    favorites.add(station.name);
  }
  saveFavoritesToStorage();

  const isFav = favorites.has(station.name);
  favBtn.setAttribute("aria-pressed", isFav ? "true" : "false");
  favBtn.setAttribute(
    "aria-label",
    isFav ? "Quitar de favoritas" : "Marcar como favorita"
  );
  favBtn.textContent = isFav ? "★" : "☆";

  if (isFav) {
    cardBtn.classList.add("is-favorite");
  } else {
    cardBtn.classList.remove("is-favorite");
  }
}

// =======================
// COMPARTIR
// =======================
function shareStation(station) {
  const url = buildShareUrlForStation(station);
  copyToClipboard(url)
    .then(() => {
      updatePlayerHint("Enlace copiado al portapapeles.");
    })
    .catch(() => {
      updatePlayerHint("No se pudo copiar el enlace. Copia la URL manualmente.");
    });
}

// =======================
// REPRODUCIR EMISORA
// =======================
function playRadio(station, btnClicked) {
  if (!player) return;

  currentStationData = station;
  player.src = station.url;

  player
    .play()
    .then(() => {
      setCurrentStationText(
        `Reproduciendo: ${station.name} (${station.country} · ${station.region})`
      );
      updatePlayerHint("Disfruta la emisora. Puedes cambiarla desde la lista.");
      updatePlayerBarText();
      updatePlayerBarVisibility();
      updatePlayerBarPlayPauseIcon();
      saveLastStationToStorage(station);
    })
    .catch(() => {
      setCurrentStationText(
        `Listo para reproducir: ${station.name} (${station.country} · ${station.region})`
      );
      updatePlayerHint(
        "No se pudo iniciar la reproducción automáticamente. Pulsa play en el reproductor."
      );
      updatePlayerBarText();
      updatePlayerBarVisibility();
      updatePlayerBarPlayPauseIcon();
      saveLastStationToStorage(station);
    });

  // Quitar estado activo de todos
  document.querySelectorAll(".station-btn").forEach((b) => {
    b.classList.remove("active");
  });

  // Marcar la actual
  if (btnClicked) {
    btnClicked.classList.add("active");
  }
}

// =======================
// INICIAR
// =======================
document.addEventListener("DOMContentLoaded", init);
