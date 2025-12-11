const filmsContainer = document.querySelector(".films");
const LoadMoreButton = document.querySelector(".load-more-button");
const searchInput = document.querySelector(".search-bar input");
const loadingSpinner = document.querySelector(".loading-spinner");
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

LoadMoreButton.addEventListener("click", LoadMore);
searchInput.addEventListener("input", Search);

let filmsDatas = [];
let filteredFilms = [];

if (loadingSpinner) loadingSpinner.style.display = "block";

fetch("https://api.tvmaze.com/shows")
  .then((res) => res.json())
  .then((data) => {
    filmsDatas = data;
    filteredFilms = data;
    if (loadingSpinner) loadingSpinner.style.display = "none";
    LoadMore();
  })
  .catch((err) => {
    console.error(err);
    if (loadingSpinner) loadingSpinner.style.display = "none";
    filmsContainer.innerHTML = "<p style='text-align: center; font-size: 20px; color: white; margin-top: 50px;'>Failed to load films. Please try again later.</p>";
  });



let count = 0;
let limit = 12;

function Search(e) {
  const searchText = e.target.value.toLowerCase().trim();

  if (searchText === "") {
    filteredFilms = filmsDatas;
  } else {
    filteredFilms = filmsDatas.filter(
      (film) =>
        film.name.toLowerCase().includes(searchText) 
    );
  }

  count = 0;
  filmsContainer.innerHTML = "";
  LoadMore();
}

function LoadMore() {
  let filmsCount = filteredFilms.length;

  if (filmsCount === 0) {
    filmsContainer.innerHTML =
      "<p style='text-align: center; font-size: 20px; color: white; margin-top: 50px;'>No films found matching your search.</p>";
    LoadMoreButton.style.display = "none";
    return;
  }

  for (let index = count * limit; index < count * limit + limit; index++) {
    if (index < filmsCount) {
      const film = filteredFilms[index];
      const genres = film.genres.slice(0, 2).join(', ') || 'N/A';
      const rating = film.rating.average;
      const isFavorite = favorites.includes(film.id);

      const filmCard = document.createElement('div');
      filmCard.className = 'film-card';
      filmCard.dataset.id = film.id;
      filmCard.style.display = 'flex';
      
      filmCard.innerHTML = `
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
              <span>${rating ?? "N/A"}</span>
            </div>
            <h4>${genres}</h4>
          </div>`;
      
      filmsContainer.appendChild(filmCard);
    } else {
      LoadMoreButton.style.display = "none";
      break;
    }
  }

  if (count * limit + limit < filmsCount) {
    LoadMoreButton.style.display = "block";
  } else {
    LoadMoreButton.style.display = "none";
  }

  count++;
  attachFavoriteListeners();
}

const bodytag = document.querySelector("body");

filmsContainer.addEventListener("click", function (e) {
  if (e.target.closest(".favorite-btn")) {
    return;
  }
  
  const card = e.target.closest(".film-card");
  if (card) {
    const id = card.dataset.id;
    OpenPopUp(id);
  }
});

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
  
  button.style.transform = 'scale(1.3)';
  setTimeout(() => {
    button.style.transform = 'scale(1)';
  }, 200);
}

function OpenPopUp(id) {
  const film = filmsDatas.find((item) => item.id == id);
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

  const closePopUpButton = popupDiv.querySelector(".close-popup");
  closePopUpButton.addEventListener("click", ClosePopUp);
  backdrop.addEventListener("click", ClosePopUp);
  
  const favBtnPopup = popupDiv.querySelector(".favorite-btn-popup");
  if (favBtnPopup) {
    favBtnPopup.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleFavorite(film.id, this);
      
      document.querySelectorAll(`.favorite-btn[data-id="${film.id}"]`).forEach(btn => {
        if (favorites.includes(film.id)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });
  }

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


const ratingSort = document.querySelector("#ratingSort");
const genreFilter = document.querySelector("#genreFilter");
const statusFilter = document.querySelector("#statusFilter");

ratingSort.addEventListener("change", ApplyFilters);
genreFilter.addEventListener("change", ApplyFilters);
statusFilter.addEventListener("change", ApplyFilters);

function ApplyFilters() {
  let result = filmsDatas;

  const selectedGenre = genreFilter.value;
  if (selectedGenre !== "all") {
    result = result.filter(film => film.genres.includes(selectedGenre));
  }

  const selectedStatus = statusFilter.value;
  if (selectedStatus !== "all") {
    result = result.filter(film => film.status === selectedStatus);
  }

  const sortType = ratingSort.value;
  if (sortType === "desc") {
    result.sort((a, b) => (b.rating.average || 0) - (a.rating.average || 0));
  } else if (sortType === "asc") {
    result.sort((a, b) => (a.rating.average || 0) - (b.rating.average || 0));
  }

  filteredFilms = result;

  count = 0;
  filmsContainer.innerHTML = "";
  LoadMore();
}

const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top-btn';
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.style.display = 'none';
bodytag.appendChild(scrollTopBtn);

window.addEventListener('scroll', () => {
  if (window.pageYOffset > 300) {
    scrollTopBtn.style.display = 'block';
  } else {
    scrollTopBtn.style.display = 'none';
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
