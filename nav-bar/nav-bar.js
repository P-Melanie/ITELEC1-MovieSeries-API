// Enhanced Navigation Bar Interactions (uses event delegation for dynamically injected nav)
document.addEventListener("click", function (e) {
  const hamburgerBtn = e.target.closest("#hamburger");
  const searchBtn = e.target.closest("#searchToggle");
  const searchContainer = document.querySelector(".search-container");
  const searchInput = document.getElementById("searchInput");
  const navLinks = document.getElementById("navLinks");
  const hamburger = document.getElementById("hamburger");

  // 1. Hamburger menu toggle
  if (hamburgerBtn) {
    if (navLinks) navLinks.classList.toggle("open");
    hamburgerBtn.classList.toggle("active");
    return;
  }

  // 2. Search bar toggle
  if (searchBtn) {
    if (searchContainer) {
      searchContainer.classList.toggle("active");
      if (searchInput && searchContainer.classList.contains("active")) {
        searchInput.focus();
      }
    }
    return;
  }

  // 3. Close hamburger when clicking a nav link
  if (e.target.closest(".nav-links a")) {
    if (navLinks) navLinks.classList.remove("open");
    if (hamburger) hamburger.classList.remove("active");
    return;
  }

  // 4. Close mobile menu if clicked outside navbar
  if (!e.target.closest(".navbar") && navLinks && navLinks.classList.contains("open")) {
    navLinks.classList.remove("open");
    if (hamburger) hamburger.classList.remove("active");
  }

  // 5. Close search bar if clicked outside search container and input is empty
  if (searchContainer && !e.target.closest(".search-container") && searchContainer.classList.contains("active")) {
    if (searchInput && !searchInput.value.trim()) {
      searchContainer.classList.remove("active");
    }
  }
});

