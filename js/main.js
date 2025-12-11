// js/main.js

// Bloque de definición de clases (Reemplazar la línea 10 de su js/main.js)
// ========================================================================
// MAPA DE ASIGNACIÓN DE CLASES DE COLOR POR PAÍS 
const countryClassMap = {
  "España": "badge-spain", 
  "Francia": "badge-france",
  "Alemania": "badge-germany",
  "EE.UU": "badge-usa",
  "Honduras": "badge-honduras",
  "Nicaragua": "badge-nicaragua",
  "Perú": "badge-peru",
  "Argentina": "badge-argentina",
  "Chile": "badge-chile",
  "Colombia": "badge-colombia",
  "Bolivia": "badge-bolivia",
  "Venezuela": "badge-venezuela",
  "Guatemala": "badge-guatemala",
  "Ecuador": "badge-ecuador",
  "El Salvador": "badge-elsalvador",
  "Costa Rica": "badge-costarica",
  "Puerto Rico": "badge-puertorico",
  "México": "badge-mexico",
  "Custom": "badge-custom" 
};
// ========================================================================


// ... (El resto de las variables y funciones hasta renderList) ...


const renderList = () => {
  if(!els.list) return;
  els.list.innerHTML = "";
  
  const term = els.search ? els.search.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  const region = els.region ? els.region.value : "Todas";
  const country = els.country ? els.country.value : "Todos";
  const showFavs = els.favToggle ? els.favToggle.checked : false;

  const filtered = stations.filter(st => {
    const normName = st.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matchSearch = !term || normName.includes(term);
    const matchRegion = region === "Todas" || st.region === region;
    const matchCountry = country === "Todos" || st.country === country;
    const matchFav = !showFavs || favorites.has(st.name);
    return matchSearch && matchRegion && matchCountry && matchFav;
  });

  if (filtered.length === 0) {
    els.list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:rgba(255,255,255,0.5);">No se encontraron emisoras.</div>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach(st => {
    const isActive = currentStation && currentStation.name === st.name;
    const isFav = favorites.has(st.name);
    
    // CAMBIO CRÍTICO: Usar countryClassMap[st.country]
    const badgeClass = countryClassMap[st.country] || "badge-default"; 
    
    const animatingClass = (isActive && isPlaying) ? 'animating' : '';

    const div = document.createElement("div");
    div.className = `station-card ${isActive ? 'active' : ''} ${animatingClass}`;
    
    // CORRECCIÓN A11Y: Agregado title y aria-label
    const deleteBtn = st.isCustom ? `<button class="del-btn" title="Eliminar" aria-label="Eliminar emisora ${st.name}">×</button>` : '';

    div.innerHTML = `
      <div class="st-info">
        <div class="st-icon ${badgeClass}"></div>
        <div>
          <span class="st-name">${st.name}</span>
          <span class="st-meta">${st.country}</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        ${deleteBtn}
        <button class="fav-btn ${isFav ? 'is-fav' : ''}" aria-label="${isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}">★</button>
      </div>
    `;
    
    div.onclick = (e) => { 
      if(!e.target.closest('button')) playStation(st); 
    };
    
    div.querySelector('.fav-btn').onclick = (e) => {
      e.stopPropagation();
      if(favorites.has(st.name)) favorites.delete(st.name); else favorites.add(st.name);
      localStorage.setItem("ultra_favs", JSON.stringify([...favorites]));
      renderList();
    };

    if(st.isCustom) {
      div.querySelector('.del-btn').onclick = (e) => deleteCustomStation(e, st.name);
    }
    fragment.appendChild(div);
  });
  els.list.appendChild(fragment);
};
// ... (El resto de las funciones: addCustomStation, deleteCustomStation, etc.) ...
