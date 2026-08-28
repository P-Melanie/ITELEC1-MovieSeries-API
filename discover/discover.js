// --- Load navbar (unchanged) ---
  fetch("../nav-bar/nav.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
  })
  .catch((error) => {
    console.error("Failed to load navbar:", error);
  });

// --- TMDB token and options ---
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

// --- Containers ---
const movieContainer = document.getElementById("movieContainer");
const highlightGrid = document.querySelector(".highlight-grid");
const actionContainer = document.getElementById("actionContainer");
const cartoonContainer = document.getElementById("cartoonContainer");

// --- Favorites State Synchronization ---
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
  favoritesContainer.innerHTML = "";
  if (favorites.length === 0) {
    favoritesContainer.innerHTML = "<p>No favorites yet.</p>";
    syncAllFavoriteButtons();
    return;
  }

  favorites.forEach((movie) => {
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

    const rating = (typeof movie.vote_average === "number") ? movie.vote_average.toFixed(1) : (movie.vote_average || "N/A");

    const card = document.createElement("div");
    card.classList.add("movie-card", "large-card");
    card.dataset.movieId = movie.id;
    card.style.position = "relative";
    card.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p class="movie-meta"><span class="release-date">${releaseDate}</span> <span class="meta-sep">•</span> <span class="rating-badge">⭐ ${rating}</span></p>
      </div>
    `;

    // ✅ Add favorite button so user can unfavorite
    addFavoriteButton(movie, card);
    makeCardClickable(card, movie);
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

    // Re-render favorites section AND immediately synchronize all hearts on page
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

  const rating = (typeof movie.vote_average === "number") ? movie.vote_average.toFixed(1) : (movie.vote_average || "N/A");

  const card = document.createElement("div");
  card.classList.add("movie-card", "large-card");
  card.dataset.movieId = movie.id;
  card.style.position = "relative";
  card.innerHTML = `
    <img src="${poster}" alt="${movie.title}">
    <div class="movie-info">
      <h3>${movie.title}</h3>
      <p class="movie-meta"><span class="release-date">${releaseDate}</span> <span class="meta-sep">•</span> <span class="rating-badge">⭐ ${rating}</span></p>
    </div>
  `;
  addFavoriteButton(movie, card);
  makeCardClickable(card, movie);
  return card;
}

window.addEventListener("DOMContentLoaded", () => {
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  updateFavorites();
  syncAllFavoriteButtons();
});

window.addEventListener("storage", () => {
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  updateFavorites();
  syncAllFavoriteButtons();
});




// --- Display Functions ---
function displayMovies(movies) {
  if (!movieContainer) return;
  movieContainer.innerHTML = "";
  if (!movies || movies.length === 0) {
    movieContainer.innerHTML = `<p>No movies found.</p>`;
    return;
  }

  const shuffledMovies = movies.sort(() => Math.random() - 0.5).slice(0, 8);
  shuffledMovies.forEach((movie) => {
    const movieCard = createMovieCard(movie);
    movieContainer.appendChild(movieCard);
  });
}

function display2025Highlights(movies) {
  if (!highlightGrid) return;
  highlightGrid.innerHTML = "";

  const movies2025 = movies
    .filter((movie) => movie.release_date && movie.release_date.startsWith("2025"))
    .slice(0, 20);

  if (movies2025.length === 0) {
    highlightGrid.innerHTML = `<p>No 2025 movies found.</p>`;
    return;
  }

  movies2025.forEach((movie) => {
    const card = createMovieCard(movie);
    highlightGrid.appendChild(card);
  });
}

function displayActionMovies(movies) {
  if (!actionContainer) return;
  actionContainer.innerHTML = "";
  movies.slice(0, 20).forEach((movie) => {
    const card = createMovieCard(movie);
    actionContainer.appendChild(card);
  });
}

function displayCartoonMovies(movies) {
  if (!cartoonContainer) return;
  cartoonContainer.innerHTML = "";
  movies.slice(0, 20).forEach((movie) => {
    const card = createMovieCard(movie);
    cartoonContainer.appendChild(card);
  });
}

// --- Initial Fetches ---
fetch("https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => display2025Highlights(data.results))
  .catch((err) => console.error(err));

fetch("https://api.themoviedb.org/3/movie/popular?language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayMovies(data.results))
  .catch((err) => console.error(err));

fetch("https://api.themoviedb.org/3/discover/movie?with_genres=28&language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayActionMovies(data.results))
  .catch((err) => console.error(err));

fetch("https://api.themoviedb.org/3/discover/movie?with_genres=16&language=en-US&page=1", options)
  .then((res) => res.json())
  .then((data) => displayCartoonMovies(data.results))
  .catch((err) => console.error(err));


// --- Scroll Bar Addition Animation ---
  document.querySelectorAll('.highlight-grid, .movie-grid').forEach(track => {
    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => {
      isDown = true;
      track.classList.add('dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      e.preventDefault();
    });

    window.addEventListener('mouseup', () => { isDown = false; track.classList.remove('dragging'); });
    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2; // scroll speed
      track.scrollLeft = scrollLeft - walk;
    });

    // touch support:
    track.addEventListener('touchstart', e => { startX = e.touches[0].pageX - track.offsetLeft; scrollLeft = track.scrollLeft; });
    track.addEventListener('touchmove', e => {
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = (x - startX) * 1.2;
      track.scrollLeft = scrollLeft - walk;
    });
  });


// --- Helper: Make Card Clickable ---


// --- Clickable cards ---
function makeCardClickable(card, movie) {
  card.addEventListener("click", (e) => {
    if (e.target.classList && e.target.classList.contains("favorite-btn")) return;
    window.location.href = `../preview/preview.html?movieID=${movie.id}`;
  });
}

// --- Escape HTML helper ---
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}