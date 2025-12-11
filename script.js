let filmDatas = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

const trending = document.querySelector(".trending-now");
const topRated = document.querySelector(".top-rated");
const recentlyAdded = document.querySelector(".recently-added");
const dramaShows = document.querySelector(".drama-shows");
const actionShows = document.querySelector(".action-shows");
const comedyShows = document.querySelector(".comedy-shows");
const loadingSpinner = document.querySelector(".loading-spinner");
const bodytag = document.querySelector("body");

// Show loading spinner
if (loadingSpinner) loadingSpinner.style.display = "block";

axios
  .get("https://api.tvmaze.com/shows")
  .then((response) => {
    filmDatas = response.data;

    // Trending Now - Top 8 highest rated
    const top8 = filmDatas
      .filter((film) => film.rating.average !== null)
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, 8);

    renderFilmSection(trending, top8);

    // Top Rated - 8 shows with highest ratings (different from trending)
    const topRatedShows = filmDatas
      .filter((film) => film.rating.average !== null && film.rating.average >= 8)
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(8, 16);

    renderFilmSection(topRated, topRatedShows);

    // Recently Added - Based on premiered date
    const recentShows = filmDatas
      .filter((film) => film.premiered)
      .sort((a, b) => new Date(b.premiered) - new Date(a.premiered))
      .slice(0, 8);

    renderFilmSection(recentlyAdded, recentShows);

    // Drama Shows
    const dramaFilms = filmDatas
      .filter((film) => film.genres.includes('Drama') && film.rating.average !== null)
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, 8);

    renderFilmSection(dramaShows, dramaFilms);

    // Action Shows
    const actionFilms = filmDatas
      .filter((film) => (film.genres.includes('Action') || film.genres.includes('Adventure')) && film.rating.average !== null)
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, 8);

    renderFilmSection(actionShows, actionFilms);

    // Comedy Shows
    const comedyFilms = filmDatas
      .filter((film) => film.genres.includes('Comedy') && film.rating.average !== null)
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, 8);

    renderFilmSection(comedyShows, comedyFilms);

    // Hide loading spinner
    if (loadingSpinner) loadingSpinner.style.display = "none";

    // Add event listeners to favorite buttons and cards
    attachFavoriteListeners();
    attachCardClickListeners();
  })
  .catch((err) => {
    console.log(err);
    if (loadingSpinner) loadingSpinner.style.display = "none";
    if (trending) trending.innerHTML = '<p style="color: white; text-align: center;">Failed to load shows. Please try again later.</p>';
  });

function renderFilmSection(container, films) {
  if (!container) return;
  
  container.innerHTML = "";
  films.forEach((film) => {
    const isFavorite = favorites.includes(film.id);
    container.innerHTML += `
    <div class="film-card" data-id=${film.id} style="display: flex;">
          <div class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${film.id}">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
            </svg>
          </div>
          <img
            src="${film.image.original}"
            alt="${film.name}"
            style="height:275px; width:200px;"
          />
          <div class="film-text">
            <h3>${film.name}</h3>
            <div class="rating">
              <span class="star">⭐</span>
              <span>${film.rating.average || 'N/A'}</span>
            </div>
            <h4>${film.genres.slice(0, 2).join(', ')}</h4>
          </div>
        </div>
        `;
  });
}

function attachCardClickListeners() {
  document.querySelectorAll(".film-card").forEach(card => {
    card.addEventListener("click", function (e) {
      // Check if favorite button was clicked
      if (e.target.closest(".favorite-btn")) {
        return;
      }
      
      const id = this.dataset.id;
      OpenPopUp(id);
    });
  });
}

function attachFavoriteListeners() {
  document.querySelectorAll(".favorite-btn").forEach(btn => {
    btn.addEventListener("click", function(e) {
      e.stopPropagation();
      const filmId = parseInt(this.dataset.id);
      toggleFavorite(filmId, this);
    });
  });
}

function toggleFavorite(filmId, button) {
  const index = favorites.indexOf(filmId);
  
  if (index > -1) {
    favorites.splice(index, 1);
    button.classList.remove('active');
  } else {
    favorites.push(filmId);
    button.classList.add('active');
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Add animation
  button.style.transform = 'scale(1.3)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 200);
}

function OpenPopUp(id) {
  const film = filmDatas.find((item) => item.id == id);
  const isFavorite = favorites.includes(film.id);

  const popupDiv = document.createElement("div");
  popupDiv.className = "popup";
  popupDiv.style.display = "block";
  
  const backdrop = document.createElement("div");
  backdrop.className = "popup-backdrop";
  bodytag.appendChild(backdrop);
  
  const genres = film.genres.slice(0, 3).join(', ') || 'N/A';
  
  popupDiv.innerHTML = `
    <span class="close-popup">&times;</span>
    <div class="image">
      <img src="${film.image.original}" alt="${film.name}" />
      <div class="favorite-btn-popup ${isFavorite ? 'active' : ''}" data-id="${film.id}">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="currentColor" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
        </svg>
      </div>
    </div>
    <div class="film-data">
      <h2>${film.name}</h2>
      <div class="film-meta">
        <span class="rating-badge">⭐ ${film.rating.average || 'N/A'}</span>
        <span class="language-badge">${film.language}</span>
        <span class="status-badge ${film.status === 'Running' ? 'status-running' : 'status-ended'}">${film.status || 'Unknown'}</span>
      </div>
      <div class="film-summary">${film.summary || 'No summary available.'}</div>
      <div class="film-info">
        <p><strong>Genres:</strong> ${genres}</p>
        <p><strong>Premiered:</strong> ${film.premiered || 'N/A'}</p>
        <p><strong>Network:</strong> ${film.network?.name || film.webChannel?.name || 'N/A'}</p>
      </div>
      <a href="${film.url}" target="_blank" class="more-info-btn">View More Details →</a>
    </div>`;

  bodytag.appendChild(popupDiv);

  // Add event listeners
  const closePopUpButton = popupDiv.querySelector(".close-popup");
  closePopUpButton.addEventListener("click", ClosePopUp);
  backdrop.addEventListener("click", ClosePopUp);
  
  const favBtnPopup = popupDiv.querySelector(".favorite-btn-popup");
  if (favBtnPopup) {
    favBtnPopup.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleFavorite(film.id, this);
    });
  }

  // Animate popup entrance
  setTimeout(() => {
    popupDiv.style.opacity = '1';
    popupDiv.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);
}

function ClosePopUp() {
  const popup = document.querySelector(".popup");
  const backdrop = document.querySelector(".popup-backdrop");
  
  if (popup) {
    popup.style.opacity = '0';
    popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
    
    setTimeout(() => {
      popup.remove();
      if (backdrop) backdrop.remove();
    }, 300);
  }
}
