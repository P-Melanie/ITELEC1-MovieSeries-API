// ==================== MOOD PAGE SCRIPT ====================




// --- Show Mood Buttons ---
const moodButtonsContainer = document.getElementById("moodButtonsContainer");
const movieSection = document.getElementById("movieSection");
const movieContainer = document.getElementById("movieContainer");

const moods = [
  { name: "Happy", key: "happiness" },
  { name: "Sad", key: "sadness" },
  { name: "Angry", key: "anger" },
  { name: "Scared", key: "fear" },
  { name: "In-love", key: "love" },
  { name: "Excited", key: "excitement" },
  { name: "Relaxed", key: "relaxed" },
];

moods.forEach((m) => {
  const btn = document.createElement("button");
  btn.textContent = m.name;
  btn.addEventListener("click", () => {
    suggestMoviesByMood(m.key);
    highlightActiveButton(btn);
  });
  moodButtonsContainer.appendChild(btn);
});

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

// --- Mood → TMDB Genres ---
const moodToGenres = {
  happiness: [35],
  sadness: [18, 10751],
  anger: [28, 53],
  fear: [27, 53],
  love: [10749, 35],
  excitement: [28, 12],
  relaxed: [16, 14],
};

// --- Suggest movies based on mood ---
// --- Suggest movies based on mood (with Mood API integrated) ---
async function suggestMoviesByMood(userMood) {
  movieSection.style.display = "block";
  movieSection.classList.add("active");

  // Shrink hero when showing movies
  document.querySelector(".hero").classList.add("shrink");

  movieContainer.innerHTML = "<p>Loading movies...</p>";

  // 🟢 Mood API integration (new 3rd API)
  try {
    const moodApiUrl = `https://mood-based-quote-api.p.rapidapi.com/${userMood}`;
    const moodApiOptions = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "119a5a03a9mshc59cd19cf2c6aedp1db733jsnd34c9bcaac17",
        "x-rapidapi-host": "mood-based-quote-api.p.rapidapi.com",
      },
    };

    const response = await fetch(moodApiUrl, moodApiOptions);
    if (response.ok) {
      const quoteData = await response.json();
      console.log("Mood API success:", quoteData);

      // Optional: show quote result in UI
      const quoteEl = document.createElement("p");
      quoteEl.classList.add("mood-quote");
      quoteEl.textContent =
        quoteData.quote ||
        "Feeling the vibe... here are movies that match your mood!";
      movieContainer.prepend(quoteEl);
    } else {
      console.warn("Mood API failed or rate-limited.");
    }
  } catch (err) {
    console.error("Mood API error:", err);
  }

  // 🎬 Fetch movies from TMDB (main API)
  const genreIds = moodToGenres[userMood] || [35];
  const randomPage = Math.floor(Math.random() * 5) + 1;

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?with_genres=${genreIds.join(
        ","
      )}&language=en-US&page=${randomPage}`,
      TMDB_OPTIONS
    );
    const data = await res.json();
    const shuffled = data.results.sort(() => 0.5 - Math.random()).slice(0, 20);
    displayMovies(shuffled);
  } catch (err) {
    console.error(err);
    movieContainer.innerHTML = "<p>Failed to fetch movies.</p>";
  }
}


// --- Display movies ---
function displayMovies(movies) {
  movieContainer.innerHTML = "";
  if (!movies || movies.length === 0) {
    movieContainer.innerHTML = "<p>No movies found.</p>";
    return;
  }
  movies.forEach((movie) => movieContainer.appendChild(createMovieCard(movie)));
}

// --- Create movie card ---
function createMovieCard(movie) {
  const poster = movie.poster_path
    ? IMAGE_BASE_URL + movie.poster_path
    : "https://via.placeholder.com/500x750?text=No+Image";

  const card = document.createElement("div");
  card.classList.add("movie-card");
  card.innerHTML = `
    <img src="${poster}" alt="${movie.title}">
    <div class="movie-info">
      <h3>${movie.title}</h3>
      <p>⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</p>
    </div>
  `;

  // Add favorite heart button & click navigation
  addFavoriteButton(movie, card);
  makeCardClickable(card, movie);

  return card;
}

// --- Helper: Make Card Clickable ---
function makeCardClickable(card, movie) {
  card.addEventListener("click", (e) => {
    if (e.target.closest(".favorite-btn")) return;
    window.location.href = `../preview/preview.html?movieID=${movie.id}`;
  });
}

// --- Highlight Active Mood Button ---
function highlightActiveButton(activeBtn) {

  const allButtons = document.querySelectorAll(".mood-buttons button");
  allButtons.forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

// --- Favorites setup ---
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const mainContainer = document.querySelector("main.container");

const favoritesSection = document.createElement("section");
favoritesSection.classList.add("movies-section");
favoritesSection.id = "favoritesSection";
favoritesSection.innerHTML = `
  <h2>Favorites ❤️</h2>
  <div id="favoritesContainer" class="movie-grid"></div>
`;
mainContainer.appendChild(favoritesSection);

const favoritesContainer = document.getElementById("favoritesContainer");

// --- Helper: check if movie is in favorites ---
function isMovieFavorited(id) {
  return favorites.some((fav) => fav.id === id);
}

// --- Update Favorites Section ---
function updateFavorites() {
  favoritesContainer.innerHTML = "";
  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  favorites.forEach((movie) => {
    const poster = movie.poster_path
      ? `${IMAGE_BASE_URL}${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image";

    const releaseDate = movie.release_date
      ? new Date(movie.release_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Unknown date";

    const card = document.createElement("div");
    card.classList.add("movie-card", "large-card");
    card.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>${releaseDate} • ⭐ ${movie.vote_average.toFixed(1)}</p>
      </div>
    `;

    makeCardClickable(card, movie);
    favoritesContainer.appendChild(card);
  });

  // Refresh hearts in all sections when favorites change
  refreshAllFavoriteButtons();
}

// --- Add Favorite Button (Heart) ---
function addFavoriteButton(movie, container) {
  const heart = document.createElement("button");
  heart.classList.add("favorite-btn");
  heart.innerHTML = isMovieFavorited(movie.id) ? "❤️" : "🤍";

  heart.addEventListener("click", (e) => {
    e.stopPropagation();

    if (isMovieFavorited(movie.id)) {
      favorites = favorites.filter((fav) => fav.id !== movie.id);
      heart.innerHTML = "🤍";
    } else {
      favorites.push(movie);
      heart.innerHTML = "❤️";
    }

    // Update favorites + save
    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateFavorites();
  });

  container.appendChild(heart);
}

// --- Refresh all visible heart buttons (for mood + discover sync) ---
function refreshAllFavoriteButtons() {
  document.querySelectorAll(".favorite-btn").forEach((btn) => {
    const card = btn.closest(".movie-card");
    if (!card) return;

    const titleEl = card.querySelector("h3");
    if (!titleEl) return;

    const movieTitle = titleEl.textContent;
    const matchedFav = favorites.find((m) => m.title === movieTitle);

    btn.innerHTML = matchedFav ? "❤️" : "🤍";
  });
}

// --- Load Favorites on page start ---
updateFavorites();
