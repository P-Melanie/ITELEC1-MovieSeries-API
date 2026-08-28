// ==================== NAVBAR LOADER ====================
fetch("../nav-bar/nav.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;
  })
  .catch((error) => console.error("Failed to load navbar:", error));

// ==================== SPLASH SCREEN (FIRST VISIT ONLY, 1.3s DURATION) =====================
document.addEventListener("DOMContentLoaded", () => {
  const landing = document.getElementById("splashScreen") || document.querySelector(".landing");
  const dashboard = document.querySelector(".dashboard");
  const isSplashAlreadyShown = sessionStorage.getItem("cinemax_splash_shown");

  if (isSplashAlreadyShown) {
    // Skip splash immediately on repeat visits / navigation
    if (landing) landing.style.display = "none";
    if (dashboard) dashboard.classList.add("show-dashboard");
    document.body.classList.remove("splash-active");

    const revealInterval = setInterval(() => {
      const navbar = document.querySelector(".navbar");
      const chatbot = document.getElementById("chatbot-toggle");
      if (navbar) {
        navbar.classList.add("visible");
        navbar.classList.add("navbar-down");
      }
      if (chatbot) {
        chatbot.classList.add("visible");
      }
      if (navbar && chatbot) {
        clearInterval(revealInterval);
      }
    }, 50);
    setTimeout(() => clearInterval(revealInterval), 1000);
    return;
  }

  // First Visit in Session: Lock scroll and show splash
  document.body.classList.add("splash-active");
  let hasTransitioned = false;

  function triggerSplashTransition() {
    if (hasTransitioned) return;
    hasTransitioned = true;

    if (landing) landing.classList.add("slide-up");

    // Reveal navbar and chatbot
    setTimeout(() => {
      const navbar = document.querySelector(".navbar");
      const chatbot = document.getElementById("chatbot-toggle");
      if (navbar) {
        navbar.classList.add("visible");
        navbar.classList.add("navbar-down");
      }
      if (chatbot) {
        chatbot.classList.add("visible");
      }
    }, 300);

    // Fade in dashboard
    setTimeout(() => {
      if (dashboard) dashboard.classList.add("show-dashboard");
    }, 450);

    // Remove splash overlay and unlock scroll
    setTimeout(() => {
      document.body.classList.remove("splash-active");
      if (landing) landing.style.display = "none";
      sessionStorage.setItem("cinemax_splash_shown", "true");
    }, 800);
  }

  // Click screen to skip splash immediately
  if (landing) landing.addEventListener("click", triggerSplashTransition);

  // Auto transition after 1.3 seconds (1300ms)
  setTimeout(() => {
    triggerSplashTransition();
  }, 1300);
});




// ==================== WEATHER + MOVIE MOOD ====================
const WEATHER_API_KEY = "3e5a7eb1fa9e9597753931bac70bc76f";
const TMDB_JWT =
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMjA5YTIzMzJhNmNhMDBiZTlhZmU3ZDE1OTFlOTQ3ZCIsIm5iZiI6MTc2MTU0NzI0MS44MjcwMDAxLCJzdWIiOiI2OGZmMTNlOTE1NjE4ZjAzOThkYTAyMjAiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7BrLe9Tt81ZEIg2T0zV8elagGYC78noCauoVOJIMJHE";

// TMDB Genre Map
const GENRES = {
  romance: "10749",
  adventure: "12",
  drama: "18",
  comedy: "35",
  popular: "28",
};

async function getWeatherAndMood() {
  navigator.geolocation.getCurrentPosition(async position => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );
    const weather = await weatherRes.json();
    const temp = Math.round(weather.main.temp);
    const condition = weather.weather[0].main.toLowerCase();
    const icon = weather.weather[0].icon;
    const city = weather.name;

    // LEFT SIDE DETAILS
    document.getElementById("weatherTemp").textContent = `${temp}°C`;
    document.getElementById("weatherLocation").textContent = city;
    document.getElementById("weatherIcon").src =
      `https://openweathermap.org/img/wn/${icon}@2x.png`;

    // --- DYNAMIC BACKGROUND IMAGE BASED ON WEATHER ---
    const weatherContainer = document.getElementById("weatherContainer");
    let bgImage = "";

    if (condition.includes("rain")) {
      bgImage = "url('../images/rainy.jpg')";
    } else if (condition.includes("cloud")) {
      bgImage = "url('../images/cloudy.jpg')";
    } else if (condition.includes("clear")) {
      bgImage = "url('../images/sunny.jpg')";
    } else if (condition.includes("snow")) {
      bgImage = "url('../images/snowy.jpg')";
    } else {
      bgImage = "url('../images/homebg1.jpg')";
    }

    if (weatherContainer) {
      weatherContainer.style.backgroundImage = bgImage;
      weatherContainer.style.backgroundSize = "cover";
      weatherContainer.style.backgroundPosition = "center";
      weatherContainer.style.transition = "background-image 0.8s ease-in-out";
    }

    // RIGHT SIDE MOOD TEXT & GENRE
    let moodSuggestion = "";
    let genre = "";

    if (condition.includes("rain")) {
      moodSuggestion = "Rainy coziness — grab something heartwarming 💗";
      genre = "romance";
    } else if (condition.includes("clear")) {
      moodSuggestion = "Clear skies today! Something fun or adventurous ✨";
      genre = "adventure";
    } else if (condition.includes("cloud")) {
      moodSuggestion = "Cloudy calm vibes — a thoughtful drama fits 🎭";
      genre = "drama";
    } else if (temp > 30) {
      moodSuggestion = "Hot outside! Cool down with a refreshing comedy 😂";
      genre = "comedy";
    } else if (temp < 20) {
      moodSuggestion = "A bit chilly — warm it up with romance ❤️";
      genre = "romance";
    } else {
      moodSuggestion = "Weather is steady — mix it up, pick what feels good 🎬";
      genre = "popular";
    }

    document.getElementById("moodDescription").textContent = moodSuggestion;
    fetchMovies(GENRES[genre]);
  });
}

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
    syncAllFavoriteButtons();
  });

  container.appendChild(heart);
}

async function fetchMovies(genreId) {
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/movie?include_adult=false&sort_by=popularity.desc&with_genres=${genreId}`,
    { headers: { Authorization: `Bearer ${TMDB_JWT}` } }
  );
  const data = await res.json();
  const list = data.results.slice(0, 20);
  const movieListContainer = document.getElementById("movie-list");
  movieListContainer.innerHTML = ""; // clear before adding

  // Reload current favorites
  favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  // Create each card dynamically so we can attach click events & favorite button
  list.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.movieId = movie.id;
    card.style.position = "relative";
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
      <p>${movie.title}</p>
    `;
    // ✅ add favorite heart button
    addFavoriteButton(movie, card);
    // ✅ make it clickable to preview.html
    makeCardClickable(card, movie);
    movieListContainer.appendChild(card);
  });

  syncAllFavoriteButtons();


  // ==== Text suggestion (1–3 movie names) ====
  if (list.length >= 3) {
    document.getElementById("movieNameSuggestions").innerHTML =
      `Try <b>${list[0].title}</b>, <b>${list[1].title}</b>, or <b>${list[2].title}</b> today.<br>See more in our suggested movies below!`;
  }
}

// Refresh button
document.getElementById("refreshMoodBtn").onclick = getWeatherAndMood;

// "See More" button → Discover
document.getElementById("seeMoreBtn").onclick = () =>
  (window.location.href = "../discover/discover.html");

// Load at start
getWeatherAndMood();

// ==================== MOVIE FACTS ============================================= //
async function getMovieFact() {
  const factText = document.getElementById("movieFact");
  factText.textContent = "Loading a fun fact... 🎥";

  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();

    // Clean and show fact
    factText.textContent = data.text
      ? data.text
      : "No fact found — try again!";
  } catch (error) {
    console.error("Error fetching movie fact:", error);
    factText.textContent = "Sorry, couldn’t fetch a movie fact right now.";
  }
}

// Event listener
document.getElementById("factBtn").addEventListener("click", getMovieFact);

// ================================================================================= //
// --- Clickable cards ---//
function makeCardClickable(card, movie) {
  card.addEventListener("click", (e) => {
    if (e.target.closest(".favorite-btn")) return;
    window.location.href = `../preview/preview.html?movieID=${movie.id}`;
  });
}

