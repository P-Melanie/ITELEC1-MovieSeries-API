// ==========================================================================
// CINEMAX - DISCOVER SCRIPT (2025 HIGHLIGHTS, FAVORITES, MULTI-GENRE ROWS)
// ==========================================================================

// --- TMDB Token and Options ---
const token =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  },
};

const imageBaseURL = "https://image.tmdb.org/t/p/w500";

// --- DOM Containers ---
const highlightGrid = document.querySelector(".highlight-grid");
const favoritesContainer = document.getElementById("favoritesContainer");
const movieContainer = document.getElementById("movieContainer");
const actionContainer = document.getElementById("actionContainer");
const fantasyContainer = document.getElementById("fantasyContainer");
const horrorContainer = document.getElementById("horrorContainer");
const sciFiContainer = document.getElementById("sciFiContainer");
const romanceContainer = document.getElementById("romanceContainer");
const cartoonContainer = document.getElementById("cartoonContainer");

// --- Favorites State Management ---
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function syncAllFavoriteButtons() {
  const currentFavs = JSON.parse(localStorage.getItem("favorites")) || [];
  const favIds = new Set(currentFavs.map((f) => Number(f.id)));
  document.querySelectorAll(".movie-card").forEach((card) => {
    const mId = Number(card.dataset.movieId);
    const btn = card.querySelector(".favorite-btn");
    if (btn && mId) {
      const isFav = favIds.has(mId);
      btn.textContent = isFav ? "❤️" : "🤍";
      if (isFav) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });
}

function updateFavorites() {
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favoritesContainer) return;
  favoritesContainer.innerHTML = "";

  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p style='color:#94a3b8;padding:1rem 0;font-size:0.95rem;'>No favorites yet. Click the heart icon on any movie to add it here!</p>";
    syncAllFavoriteButtons();
    return;
  }

  favorites.forEach((movie) => {
    const card = createMovieCard(movie);
    favoritesContainer.appendChild(card);
  });

  syncAllFavoriteButtons();
}

function addFavoriteButton(movie, container) {
  const heart = document.createElement("button");
  heart.classList.add("favorite-btn");
  heart.setAttribute("aria-label", "Favorite movie");

  const currentFavs = JSON.parse(localStorage.getItem("favorites")) || [];
  const isExisting = currentFavs.some((fav) => Number(fav.id) === Number(movie.id));
  heart.textContent = isExisting ? "❤️" : "🤍";
  if (isExisting) heart.classList.add("active");

  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    let currentFavs = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFavorited = currentFavs.some((fav) => Number(fav.id) === Number(movie.id));

    if (isFavorited) {
      currentFavs = currentFavs.filter((fav) => Number(fav.id) !== Number(movie.id));
    } else {
      currentFavs.push(movie);
    }

    favorites = currentFavs;
    localStorage.setItem("favorites", JSON.stringify(favorites));

    updateFavorites();
    syncAllFavoriteButtons();
  });
  container.appendChild(heart);
}

// --- Create Movie Card ---
function createMovieCard(movie) {
  const poster = movie.poster_path
    ? `${imageBaseURL}${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date";

  const rating = (typeof movie.vote_average === "number")
    ? movie.vote_average.toFixed(1)
    : (movie.vote_average || "N/A");

  const card = document.createElement("div");
  card.classList.add("movie-card", "large-card");
  card.dataset.movieId = movie.id;
  card.style.position = "relative";
  card.innerHTML = `
    <img src="${poster}" alt="${movie.title || 'Movie Poster'}" loading="lazy">
    <div class="movie-info">
      <h3>${movie.title || 'Untitled'}</h3>
      <p class="movie-meta">
        <span class="release-date">${releaseDate}</span>
        <span class="meta-sep">•</span>
        <span class="rating-badge">⭐ ${rating}</span>
      </p>
    </div>
  `;

  addFavoriteButton(movie, card);
  makeCardClickable(card, movie);
  return card;
}

function makeCardClickable(card, movie) {
  card.addEventListener("click", (e) => {
    if (e.target.classList && e.target.classList.contains("favorite-btn")) return;
    window.location.href = `../preview/preview.html?movieID=${movie.id}`;
  });
}

// --- Generic Section Population Helper ---
function renderMoviesToContainer(container, movies, limit = 20) {
  if (!container) return;
  container.innerHTML = "";
  if (!movies || movies.length === 0) {
    container.innerHTML = `<p style="color:#94a3b8;padding:1rem 0;">No movies found.</p>`;
    return;
  }
  movies.slice(0, limit).forEach((movie) => {
    container.appendChild(createMovieCard(movie));
  });
  syncAllFavoriteButtons();
}

// --- 2025 Highlights Loader ---
function load2025Highlights() {
  fetch("https://api.themoviedb.org/3/discover/movie?primary_release_year=2025&sort_by=popularity.desc&include_adult=false&language=en-US&page=1", options)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.results && data.results.length > 0) {
        renderMoviesToContainer(highlightGrid, data.results, 20);
      } else {
        // Fallback to top rated / upcoming
        fetch("https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1", options)
          .then((res) => res.json())
          .then((fallbackData) => renderMoviesToContainer(highlightGrid, fallbackData.results, 20))
          .catch((err) => console.error(err));
      }
    })
    .catch((err) => {
      console.error("2025 Highlights fetch error:", err);
      if (highlightGrid) highlightGrid.innerHTML = `<p style="color:#ef4444;padding:1rem 0;">Failed to load Highlights.</p>`;
    });
}

// --- Multi-Category Loaders ---
function loadAllMovieCategories() {
  // 1. 2025 Highlights
  load2025Highlights();

  // 2. Latest / Popular Movies
  fetch("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1", options)
    .then((res) => res.json())
    .then((data) => renderMoviesToContainer(movieContainer, data.results, 20))
    .catch((err) => console.error(err));

  // 3. Action Movies (Genre 28)
  fetch("https://api.themoviedb.org/3/discover/movie?with_genres=28&language=en-US&sort_by=popularity.desc&page=1", options)
    .then((res) => res.json())
    .then((data) => renderMoviesToContainer(actionContainer, data.results, 20))
    .catch((err) => console.error(err));

  // 4. Fantasy Movies (Genre 14)
  fetch("https://api.themoviedb.org/3/discover/movie?with_genres=14&language=en-US&sort_by=popularity.desc&page=1", options)
    .then((res) => res.json())
    .then((data) => renderMoviesToContainer(fantasyContainer, data.results, 20))
    .catch((err) => console.error(err));

  // 5. Horror Movies (Genre 27)
  fetch("https://api.themoviedb.org/3/discover/movie?with_genres=27&language=en-US&sort_by=popularity.desc&page=1", options)
    .then((res) => res.json())
    .then((data) => renderMoviesToContainer(horrorContainer, data.results, 20))
    .catch((err) => console.error(err));

  // 6. Science Fiction Movies (Genre 878)
  fetch("https://api.themoviedb.org/3/discover/movie?with_genres=878&language=en-US&sort_by=popularity.desc&page=1", options)
    .then((res) => res.json())
    .then((data) => renderMoviesToContainer(sciFiContainer, data.results, 20))
    .catch((err) => console.error(err));

  // 7. Romance Movies (Genre 10749)
  fetch("https://api.themoviedb.org/3/discover/movie?with_genres=10749&language=en-US&sort_by=popularity.desc&page=1", options)
    .then((res) => res.json())
    .then((data) => renderMoviesToContainer(romanceContainer, data.results, 20))
    .catch((err) => console.error(err));

  // 8. Cartoons / Animation (Genre 16)
  fetch("https://api.themoviedb.org/3/discover/movie?with_genres=16&language=en-US&sort_by=popularity.desc&page=1", options)
    .then((res) => res.json())
    .then((data) => renderMoviesToContainer(cartoonContainer, data.results, 20))
    .catch((err) => console.error(err));
}

// --- Attach Drag & Touch Scroll to All Grids ---
function initScrollDrag() {
  document.querySelectorAll(".highlight-grid, .movie-grid").forEach((track) => {
    if (track.dataset.dragInit) return;
    track.dataset.dragInit = "true";

    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener("mousedown", (e) => {
      if (e.target.closest("button") || e.target.closest(".favorite-btn")) return;
      isDown = true;
      track.classList.add("dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("dragging");
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.3;
      track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = (x - startX) * 1.3;
      track.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  });
}

// --- Initialize on Page Load ---
document.addEventListener("DOMContentLoaded", () => {
  updateFavorites();
  loadAllMovieCategories();
  setTimeout(initScrollDrag, 500);
});

window.addEventListener("storage", () => {
  updateFavorites();
  syncAllFavoriteButtons();
});