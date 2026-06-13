const DIFFICULTY_LABELS = {
  facile: "Facile",
  modere: "Modéré",
  difficile: "Difficile",
};

let randos = [];
let userPosition = null;

const $ = (sel) => document.querySelector(sel);

const listEl = $("#rando-list");
const emptyEl = $("#empty-state");
const detailEl = $("#detail");
const detailContent = $("#detail-content");
const mainEl = $("#main");
const aboutEl = $("#about");
const searchEl = $("#search");
const filterEl = $("#filter-difficulty");
const locationStatus = $("#location-status");

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

function getFilteredRandos() {
  const query = searchEl.value.trim().toLowerCase();
  const difficulty = filterEl.value;

  return randos
    .filter((r) => {
      const matchQuery =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.region.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query);
      const matchDiff = !difficulty || r.difficulty === difficulty;
      return matchQuery && matchDiff;
    })
    .map((r) => {
      const distance =
        userPosition != null
          ? haversineKm(userPosition.lat, userPosition.lng, r.lat, r.lng)
          : null;
      return { ...r, distanceFromUser: distance };
    })
    .sort((a, b) => {
      if (a.distanceFromUser != null && b.distanceFromUser != null) {
        return a.distanceFromUser - b.distanceFromUser;
      }
      return a.name.localeCompare(b.name, "fr");
    });
}

function renderList() {
  const items = getFilteredRandos();
  listEl.innerHTML = "";

  if (items.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;

  for (const r of items) {
    const li = document.createElement("li");
    li.innerHTML = `
      <article class="rando-card" data-id="${r.id}" tabindex="0" role="button" aria-label="Voir ${r.name}">
        <div class="rando-card__header">
          <div>
            <h2 class="rando-card__title">${r.name}</h2>
            <p class="rando-card__region">${r.region}</p>
          </div>
          <span class="badge badge--${r.difficulty}">${DIFFICULTY_LABELS[r.difficulty]}</span>
        </div>
        <div class="rando-card__meta">
          <span>${r.distance_km} km</span>
          <span>${formatDuration(r.duration_h)}</span>
          <span>+${r.elevation_m} m</span>
        </div>
        ${
          r.distanceFromUser != null
            ? `<p class="rando-card__distance-near">À ${r.distanceFromUser.toFixed(1)} km de vous</p>`
            : ""
        }
      </article>
    `;
    li.querySelector(".rando-card").addEventListener("click", () => showDetail(r.id));
    li.querySelector(".rando-card").addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showDetail(r.id);
      }
    });
    listEl.appendChild(li);
  }
}

function showDetail(id) {
  const r = randos.find((x) => x.id === id);
  if (!r) return;

  const distance =
    userPosition != null
      ? haversineKm(userPosition.lat, userPosition.lng, r.lat, r.lng)
      : null;

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;

  detailContent.innerHTML = `
    <div class="detail-hero">
      <h2>${r.name}</h2>
      <p>${r.region}</p>
    </div>
    <div class="detail-stats">
      <div class="stat">
        <span class="stat__value">${r.distance_km} km</span>
        <span class="stat__label">Distance</span>
      </div>
      <div class="stat">
        <span class="stat__value">${formatDuration(r.duration_h)}</span>
        <span class="stat__label">Durée</span>
      </div>
      <div class="stat">
        <span class="stat__value">+${r.elevation_m} m</span>
        <span class="stat__label">Dénivelé</span>
      </div>
      <div class="stat">
        <span class="stat__value">${DIFFICULTY_LABELS[r.difficulty]}</span>
        <span class="stat__label">Difficulté</span>
      </div>
    </div>
    <section class="detail-section">
      <h3>Description</h3>
      <p>${r.description}</p>
    </section>
    <section class="detail-section">
      <h3>Points d'intérêt</h3>
      <ul>${r.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
    </section>
    ${
      distance != null
        ? `<section class="detail-section"><h3>Distance depuis vous</h3><p>${distance.toFixed(1)} km</p></section>`
        : ""
    }
    <div class="detail-actions">
      <a class="btn-action btn-action--primary" href="${mapsUrl}" target="_blank" rel="noopener">Itinéraire GPS</a>
      <button type="button" class="btn-action btn-action--secondary" id="btn-share">Partager</button>
    </div>
  `;

  detailContent.querySelector("#btn-share")?.addEventListener("click", () => shareRando(r));

  mainEl.hidden = true;
  aboutEl.hidden = true;
  detailEl.hidden = false;
  document.querySelector(".search-bar").hidden = true;
  locationStatus.hidden = true;
  window.scrollTo(0, 0);
}

function hideDetail() {
  detailEl.hidden = true;
  mainEl.hidden = false;
  document.querySelector(".search-bar").hidden = false;
  if (userPosition) locationStatus.hidden = false;
  setActiveView("list");
}

async function shareRando(r) {
  const text = `${r.name} — ${r.distance_km} km, ${DIFFICULTY_LABELS[r.difficulty]} (${r.region})`;
  if (navigator.share) {
    try {
      await navigator.share({ title: r.name, text, url: location.href });
    } catch {
      /* cancelled */
    }
  } else {
    await navigator.clipboard?.writeText(text);
    alert("Informations copiées dans le presse-papiers.");
  }
}

function setActiveView(view) {
  document.querySelectorAll(".bottom-nav__item").forEach((btn) => {
    btn.classList.toggle("bottom-nav__item--active", btn.dataset.view === view);
  });

  if (view === "about") {
    mainEl.hidden = true;
    detailEl.hidden = true;
    aboutEl.hidden = false;
    document.querySelector(".search-bar").hidden = true;
    locationStatus.hidden = true;
  } else if (!detailEl.hidden) {
    return;
  } else {
    mainEl.hidden = false;
    aboutEl.hidden = true;
    document.querySelector(".search-bar").hidden = false;
    if (userPosition) locationStatus.hidden = false;
  }
}

function requestLocation() {
  if (!navigator.geolocation) {
    locationStatus.textContent = "La géolocalisation n'est pas disponible sur cet appareil.";
    locationStatus.hidden = false;
    return;
  }

  locationStatus.textContent = "Localisation en cours…";
  locationStatus.hidden = false;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locationStatus.textContent = "Randonnées triées par proximité.";
      renderList();
    },
    () => {
      locationStatus.textContent = "Impossible d'accéder à votre position. Autorisez le GPS dans les réglages du navigateur.";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function init() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch {
      /* offline mode optional */
    }
  }

  const response = await fetch("./data/randos.json");
  randos = await response.json();
  renderList();

  searchEl.addEventListener("input", renderList);
  filterEl.addEventListener("change", renderList);
  $("#btn-back").addEventListener("click", hideDetail);
  $("#btn-locate").addEventListener("click", requestLocation);

  document.querySelectorAll(".bottom-nav__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.view === "list" && !detailEl.hidden) hideDetail();
      else setActiveView(btn.dataset.view);
    });
  });
}

init();
