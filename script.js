let filmDatas = [];

axios
  .get("https://api.tvmaze.com/shows")
  .then((response) => {
    filmDatas = response.data;

    const top6 = filmDatas
      .filter((film) => film.rating.average !== null)
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, 6);


    top6.forEach((film) => {
      trending.innerHTML += `
    <div class="film-card" data-id=${film.id}>
          <img
            src="${film.image.original}"
            alt="${film.name}"
            style="height:275px; width:200px;"
          />
          <div class="film-text">
            <h3>${film.name}</h3>
            <h3><img src="./assets/images/image.png" style="width:20px; height:20px;">${film.rating.average}</h3>
            <h4>${film.genres}</h4>
          </div>
        </div>
        `;
    });
  })
  .catch((err) => console.log(err));

const trending = document.querySelector(".trending-now");

const bodytag = document.querySelector("body");

trending.addEventListener("click", function (e) {
  const card = e.target.closest(".film-card");
  const id = card.dataset.id;
  OpenPopUp(id);
});

function OpenPopUp(id) {
  const film = filmDatas.find((item) => item.id == id);

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
      <h3>Rating: ${film.rating.average} <img src="./assets/images/image.png" style="width:20px; height:20px;" ></h3>
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
