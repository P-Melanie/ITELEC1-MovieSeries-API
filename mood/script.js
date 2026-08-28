// ==========================================================================
// CINEMAX - MOOD EXPLORER SCRIPT
// Based on original working code + layout improvements
// ==========================================================================

// --- TMDB Setup ---
const TMDB_TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";
const TMDB_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_TOKEN}`,
  },
};
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// --- Mood to TMDB Genres ---
const moodToGenres = {
  happiness: [35],
  sadness: [18, 10751],
  anger: [28, 53],
  fear: [27, 53],
  love: [10749, 35],
  excitement: [28, 12],
  relaxed: [16, 14],
};

// --- Create and Attach Mood Buttons (exact original pattern) ---
const moodButtonsContainer = document.getElementById("moodButtonsContainer");

const moods = [
  { name: "Happy",   key: "happiness" },
  { name: "Sad",     key: "sadness" },
  { name: "Angry",   key: "anger" },
  { name: "Scared",  key: "fear" },
  { name: "In-love", key: "love" },
  { name: "Excited", key: "excitement" },
  { name: "Relaxed", key: "relaxed" },
];

moods.forEach((m) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = m.name;
  btn.dataset.mood = m.key;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    suggestMoviesByMood(m.key);
    highlightActiveButton(btn);
  });
  if (moodButtonsContainer) moodButtonsContainer.appendChild(btn);
});

// --- Close/Reset button ---
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("closeResultsBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      resetMoodState();
    });
  }
});

// --- Reset State ---
function resetMoodState() {
  const overlay = document.getElementById("moodOverlay");
  const movieSection = document.getElementById("movieSection");
  if (overlay) overlay.classList.remove("has-results");
  if (movieSection) {
    movieSection.classList.remove("active");
    setTimeout(() => { movieSection.style.display = "none"; }, 400);
  }
  document.querySelectorAll(".mood-buttons button").forEach(b => b.classList.remove("active"));
}

// --- Highlight active button ---
function highlightActiveButton(activeBtn) {
  document.querySelectorAll(".mood-buttons button").forEach(b => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

// --- Fetch movies by mood ---
async function suggestMoviesByMood(userMood) {
  const overlay     = document.getElementById("moodOverlay");
  const movieSection    = document.getElementById("movieSection");
  const movieContainer  = document.getElementById("movieContainer");

  // Animate header upward
  if (overlay) overlay.classList.add("has-results");
  if (movieSection) {
    movieSection.style.display = "block";
    requestAnimationFrame(() => movieSection.classList.add("active"));
  }
  if (movieContainer) {
    movieContainer.innerHTML = "<p style='color:#94a3b8;padding:2rem;text-align:center;width:100%;'>Loading movies...</p>";
  }

  const genreIds  = moodToGenres[userMood] || [35];
  const randomPage = Math.floor(Math.random() * 5) + 1;

  try {
    const res  = await fetch(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${genreIds.join(",")}&language=en-US&page=${randomPage}`,
      TMDB_OPTIONS
    );
    const data = await res.json();
    if (data && data.results && data.results.length > 0) {
      const shuffled = data.results.sort(() => 0.5 - Math.random()).slice(0, 20);
      displayMovies(shuffled);
    } else {
      if (movieContainer) movieContainer.innerHTML = "<p style='color:#94a3b8;padding:2rem;text-align:center;width:100%;'>No movies found.</p>";
    }
  } catch (err) {
    console.error("TMDB error:", err);
    if (movieContainer) movieContainer.innerHTML = "<p style='color:#ef4444;padding:2rem;text-align:center;width:100%;'>Failed to fetch movies.</p>";
  }
}

// --- Display movies ---
function displayMovies(movies) {
  const movieContainer = document.getElementById("movieContainer");
  if (!movieContainer) return;
  movieContainer.innerHTML = "";
  movies.forEach(movie => movieContainer.appendChild(createMovieCard(movie)));
  syncAllFavoriteButtons();
}

// --- Create movie card (Discover-matching layout) ---
function createMovieCard(movie) {
  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown date";

  const rating = typeof movie.vote_average === "number"
    ? movie.vote_average.toFixed(1)
    : (movie.vote_average || "NR");

  const card = document.createElement("div");
  card.classList.add("movie-card");
  card.dataset.movieId = movie.id;
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

  card.addEventListener("click", (e) => {
    if (e.target.closest(".favorite-btn")) return;
    window.location.href = `../preview/preview.html?movieID=${movie.id}`;
  });

  return card;
}

// --- Add Favorite Button ---
function addFavoriteButton(movie, container) {
  const heart = document.createElement("button");
  heart.classList.add("favorite-btn");
  heart.setAttribute("aria-label", "Favorite movie");

  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  const isExisting = favs.some(f => Number(f.id) === Number(movie.id));
  heart.textContent = isExisting ? "❤️" : "🤍";
  if (isExisting) heart.classList.add("active");

  heart.addEventListener("click", (e) => {
    e.stopPropagation();
    let currentFavs = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFav = currentFavs.some(f => Number(f.id) === Number(movie.id));
    if (isFav) {
      currentFavs = currentFavs.filter(f => Number(f.id) !== Number(movie.id));
    } else {
      currentFavs.push(movie);
    }
    localStorage.setItem("favorites", JSON.stringify(currentFavs));
    syncAllFavoriteButtons();
  });

  container.appendChild(heart);
}

// --- Sync all heart buttons ---
function syncAllFavoriteButtons() {
  const favs   = JSON.parse(localStorage.getItem("favorites")) || [];
  const favIds = new Set(favs.map(f => Number(f.id)));
  document.querySelectorAll(".movie-card").forEach(card => {
    const mId = Number(card.dataset.movieId);
    const btn = card.querySelector(".favorite-btn");
    if (btn && mId) {
      const isFav = favIds.has(mId);
      btn.textContent = isFav ? "❤️" : "🤍";
      btn.classList.toggle("active", isFav);
    }
  });
}

window.addEventListener("storage", syncAllFavoriteButtons);
