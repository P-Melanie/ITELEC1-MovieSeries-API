// ==========================================================================
// CINEMAX - UNIFIED NAVBAR & GLOBAL SEARCH OVERLAY SCRIPT
// ==========================================================================

const NAV_TMDB_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";

const NAV_TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${NAV_TMDB_TOKEN}`,
  },
};

const GENRE_MAP = {
  Action: 28,
  Fantasy: 14,
  Horror: 27,
  "Science Fiction": 878,
  Comedy: 35,
  Romance: 10749,
  Animation: 16,
};


// --- GLOBAL SEARCH OVERLAY INITIALIZATION ---
function getOrCreateSearchOverlay() {
  let overlay = document.querySelector(".search-overlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.className = "search-overlay";
  overlay.innerHTML = `
    <div class="search-panel">
      <div class="search-row">
        <input type="text" id="overlaySearchInput" placeholder="Search movies, series, cast..." autocomplete="off" />
        <button class="search-cta" id="overlaySearchBtn">Search</button>
        <button class="close-overlay" title="Close">✕</button>
      </div>
      <div class="genres" id="overlayGenres"></div>
      <div class="results"><div id="overlayResults"></div></div>
    </div>

  `;
  document.body.appendChild(overlay);

  const overlayGenres = overlay.querySelector("#overlayGenres");
  Object.keys(GENRE_MAP).forEach((genreName) => {
    const pill = document.createElement("button");
    pill.className = "genre-pill";
    pill.textContent = genreName;
    pill.dataset.genre = genreName;
    overlayGenres.appendChild(pill);
  });

  const overlayInput = overlay.querySelector("#overlaySearchInput");
  const overlayBtn = overlay.querySelector("#overlaySearchBtn");
  const overlayResults = overlay.querySelector("#overlayResults");
  const closeBtn = overlay.querySelector(".close-overlay");

  function renderSearchMovieCard(movie) {
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Poster";

    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "NR";

    const card = document.createElement("div");
    card.className = "search-movie-card";
    card.innerHTML = `
      <img src="${poster}" alt="${movie.title || 'Movie Poster'}" loading="lazy">
      <div class="search-movie-info">
        <h3>${movie.title || "Untitled"}</h3>
        <p>${releaseYear} • ⭐ ${rating}</p>
      </div>
    `;

    // Add favorites heart
    const favBtn = document.createElement("button");
    favBtn.className = "search-fav-btn";
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFav = favorites.some((f) => f.id === movie.id);
    favBtn.textContent = isFav ? "❤️" : "🤍";

    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      let currentFavs = JSON.parse(localStorage.getItem("favorites")) || [];
      const exists = currentFavs.some((f) => f.id === movie.id);
      if (exists) {
        currentFavs = currentFavs.filter((f) => f.id !== movie.id);
        favBtn.textContent = "🤍";
      } else {
        currentFavs.push(movie);
        favBtn.textContent = "❤️";
      }
      localStorage.setItem("favorites", JSON.stringify(currentFavs));
      if (typeof updateFavorites === "function") updateFavorites();
    });

    card.appendChild(favBtn);

    // Card click navigation
    card.addEventListener("click", () => {
      window.location.href = `../preview/preview.html?movieID=${movie.id}`;
    });

    return card;
  }

  function performSearch(query) {
    if (!query) {
      overlayResults.innerHTML = `<p style="text-align:center;color:#94a3b8;grid-column:1/-1;padding:2rem;">Type a movie title or choose a genre above.</p>`;
      return;
    }
    overlayResults.innerHTML = `<p style="text-align:center;color:#94a3b8;grid-column:1/-1;padding:2rem;">Searching for "${query}"...</p>`;
    fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false`, NAV_TMDB_OPTIONS)
      .then((res) => res.json())
      .then((data) => {
        overlayResults.innerHTML = "";
        if (!data.results || data.results.length === 0) {
          overlayResults.innerHTML = `<p style="text-align:center;color:#94a3b8;grid-column:1/-1;padding:2rem;">No movies found for "${query}".</p>`;
          return;
        }
        data.results.forEach((movie) => {
          overlayResults.appendChild(renderSearchMovieCard(movie));
        });
      })
      .catch((err) => {
        console.error(err);
        overlayResults.innerHTML = `<p style="text-align:center;color:#ef4444;grid-column:1/-1;padding:2rem;">Failed to load results. Please try again.</p>`;
      });
  }

  function fetchByGenre(genreId, genreName) {
    overlayResults.innerHTML = `<p style="text-align:center;color:#94a3b8;grid-column:1/-1;padding:2rem;">Loading ${genreName} movies...</p>`;
    fetch(`https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=en-US&sort_by=popularity.desc&page=1`, NAV_TMDB_OPTIONS)
      .then((res) => res.json())
      .then((data) => {
        overlayResults.innerHTML = "";
        if (!data.results || data.results.length === 0) {
          overlayResults.innerHTML = `<p style="text-align:center;color:#94a3b8;grid-column:1/-1;padding:2rem;">No movies found for ${genreName}.</p>`;
          return;
        }
        data.results.forEach((movie) => {
          overlayResults.appendChild(renderSearchMovieCard(movie));
        });
      })
      .catch((err) => {
        console.error(err);
        overlayResults.innerHTML = `<p style="text-align:center;color:#ef4444;grid-column:1/-1;padding:2rem;">Failed to load ${genreName} movies.</p>`;
      });
  }

  overlayGenres.addEventListener("click", (e) => {
    const pill = e.target.closest(".genre-pill");
    if (!pill) return;
    overlayGenres.querySelectorAll(".genre-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    const name = pill.dataset.genre;
    const id = GENRE_MAP[name];
    if (id) fetchByGenre(id, name);
  });

  overlayBtn.addEventListener("click", () => performSearch(overlayInput.value.trim()));
  overlayInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") performSearch(overlayInput.value.trim());
  });

  function closeSearchOverlay() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    overlayInput.value = "";
    overlayResults.innerHTML = "";
    overlayGenres.querySelectorAll(".genre-pill").forEach((p) => p.classList.remove("active"));
  }

  closeBtn.addEventListener("click", closeSearchOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearchOverlay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeSearchOverlay();
  });

  overlay.openWithQuery = function (query = "") {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    overlayInput.value = query;
    overlayInput.focus();
    if (query) {
      performSearch(query);
    } else {
      overlayResults.innerHTML = `<p style="text-align:center;color:#94a3b8;grid-column:1/-1;padding:2rem;">Type a title or select a genre above to discover movies.</p>`;
    }
  };

  return overlay;
}

// --- AUTO LOAD NAVBAR IF PLACEHOLDER EXISTS & EMPTY ---
function autoLoadNavbar() {
  const placeholder = document.getElementById("navbar-placeholder");
  if (placeholder && !placeholder.innerHTML.trim()) {
    fetch("../nav-bar/nav.html")
      .then((r) => r.text())
      .then((html) => {
        placeholder.innerHTML = html;
        updateActiveNavLink();
        attachDirectNavbarEvents();
      })
      .catch((err) => console.error("Navbar failed to auto-load:", err));
  } else {
    attachDirectNavbarEvents();
  }
}

function attachDirectNavbarEvents() {
  const hamburger = document.getElementById("hamburger") || document.querySelector(".hamburger");
  const searchToggle = document.getElementById("searchToggle") || document.querySelector(".search-toggle");
  const searchInput = document.getElementById("searchInput");

  if (hamburger && !hamburger.dataset.hasDirectListener) {
    hamburger.dataset.hasDirectListener = "true";
    const toggleMenu = (e) => {
      e.stopPropagation();
      const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
      if (navLinks) navLinks.classList.toggle("open");
      hamburger.classList.toggle("active");
    };
    hamburger.addEventListener("click", toggleMenu);
    hamburger.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
  }

  if (searchToggle && !searchToggle.dataset.hasDirectListener) {
    searchToggle.dataset.hasDirectListener = "true";
    const triggerSearch = (e) => {
      e.stopPropagation();
      const input = document.getElementById("searchInput") || searchInput;
      const query = input ? input.value.trim() : "";
      const overlay = getOrCreateSearchOverlay();
      overlay.openWithQuery(query);
    };
    searchToggle.addEventListener("click", triggerSearch);
    searchToggle.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoLoadNavbar);
} else {
  autoLoadNavbar();
}

// --- NAVBAR INTERACTION DELEGATION (FALLBACK FOR DYNAMIC DOM) ---
document.addEventListener("click", function (e) {
  const hamburgerBtn = e.target.closest("#hamburger, .hamburger");
  const searchBtn = e.target.closest("#searchToggle, #searchBtn, .search-toggle, .search-container button");
  const navLinks = document.getElementById("navLinks") || document.querySelector(".nav-links");
  const searchInput = document.getElementById("searchInput");

  // 1. Hamburger menu toggle
  if (hamburgerBtn && !hamburgerBtn.dataset.hasDirectListener) {
    e.stopPropagation();
    if (navLinks) navLinks.classList.toggle("open");
    hamburgerBtn.classList.toggle("active");
    return;
  }

  // 2. Search button click -> Open Global Search Overlay
  if (searchBtn && !searchBtn.dataset.hasDirectListener) {
    e.stopPropagation();
    const query = searchInput ? searchInput.value.trim() : "";
    const overlay = getOrCreateSearchOverlay();
    overlay.openWithQuery(query);
    return;
  }

  // 3. Close hamburger when clicking a nav link
  if (e.target.closest(".nav-links a")) {
    if (navLinks) navLinks.classList.remove("open");
    const hamburger = document.querySelector("#hamburger, .hamburger");
    if (hamburger) hamburger.classList.remove("active");
    return;
  }

  // 4. Close mobile menu if clicked outside navbar
  if (!e.target.closest(".navbar") && navLinks && navLinks.classList.contains("open")) {
    navLinks.classList.remove("open");
    const hamburger = document.querySelector("#hamburger, .hamburger");
    if (hamburger) hamburger.classList.remove("active");
  }
});


// Search input Enter key opens overlay
document.addEventListener("keypress", function (e) {
  if (e.target && e.target.id === "searchInput" && e.key === "Enter") {
    const query = e.target.value.trim();
    const overlay = getOrCreateSearchOverlay();
    overlay.openWithQuery(query);
  }
});

// --- AUTO ACTIVE LINK DETECTION (ZERO LAYOUT SHIFT DATA-TEXT) ---
function updateActiveNavLink() {
  const links = document.querySelectorAll(".nav-links a");
  if (!links.length) return;
  const currentPath = window.location.pathname.toLowerCase();

  links.forEach((link) => {
    if (!link.getAttribute("data-text")) {
      link.setAttribute("data-text", link.textContent.trim());
    }
    link.classList.remove("active");
    const href = link.getAttribute("href") ? link.getAttribute("href").toLowerCase() : "";

    if (
      (currentPath.includes("discover") && href.includes("discover")) ||
      (currentPath.includes("about") && href.includes("about")) ||
      ((currentPath.includes("mood") || currentPath.includes("more")) && (href.includes("mood") || href.includes("more"))) ||
      ((currentPath.includes("home") || currentPath.endsWith("/") || currentPath.includes("index.html")) &&
        !currentPath.includes("mood") &&
        !currentPath.includes("discover") &&
        !currentPath.includes("about") &&
        href.includes("home"))
    ) {
      link.classList.add("active");
    }
  });
}

// Observe navbar insertion
const navObserver = new MutationObserver(() => {
  if (document.querySelector(".nav-links")) {
    updateActiveNavLink();
  }
});
navObserver.observe(document.body, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", updateActiveNavLink);






