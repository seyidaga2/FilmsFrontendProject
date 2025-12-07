const filmsContainer = document.querySelector(".films");
const LoadMoreButton = document.querySelector(".load-more-button");
const searchInput = document.querySelector(".search-bar input");

LoadMoreButton.addEventListener("click", LoadMore);
searchInput.addEventListener("input", Search);

let filmsDatas = [];
let filteredFilms = [];

fetch("https://api.tvmaze.com/shows")
  .then((res) => res.json())
  .then((data) => {
    filmsDatas = data;
    filteredFilms = data;
    LoadMore();
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
      const genres = [film.genres[0],film.genres[1],film.genres[2]];
      const rating = film.rating.average;

      filmsContainer.innerHTML += `
        <div class="film-card" data-id=${film.id}>
          <img
            src="${film.image?.original}"
            alt="${film.name}"
            style="height:275px; width:200px;"
          />
          <div class="film-text">
            <h3>${film.name}</h3>
            <h3><img src="image.png" style="width:20px; height:20px;">${rating}</h3>
            <h4>${genres}</h4>
          </div>
        </div>`;
    } else {
      LoadMoreButton.style.display = "none";
      break;
    }
  }

  if (count * limit + limit < filmsCount) {
    LoadMoreButton.style.display = "block";
  }

  count++;
}

const bodytag = document.querySelector("body");

filmsContainer.addEventListener("click", function (e) {
  const card = e.target.closest(".film-card");
  const id = card.dataset.id;
  OpenPopUp(id);
});

function OpenPopUp(id) {
  const film = filmsDatas.find((item) => item.id == id);

  const popupDiv = document.createElement("div");
  popupDiv.className = "popup";
  popupDiv.style.display = "block";
  popupDiv.innerHTML = `
    <span class="close-popup">x</span>
    <div class="image">
      <img src="${film.image.original}" />
    </div>
    <div class="film-data">
      <h2>${film.name}</h2>
      <h3>${film.summary}</h3>
      <h3>Rating: ${film.rating.average}</h3>
      <h3>Genres: ${film.genres[0],film.genres[1],film.genres[2]}</h3>
      <h4>Language: ${film.language}</h4>
      <h4><a href="${film.url}" target="_blank">More Info</a></h4>
    </div>`;

  bodytag.appendChild(popupDiv);

  const closePopUpButton = popupDiv.querySelector(".close-popup");
  closePopUpButton.addEventListener("click", ClosePopUp);
}

function ClosePopUp() {
  const popup = document.querySelector(".popup");
  if (popup) {
    popup.remove();
  }
}
