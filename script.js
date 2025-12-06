const filmsContainer = document.querySelector(".films");
const LoadMoreButton = document.querySelector(".load-more-button");
LoadMoreButton.addEventListener("click", LoadMore);

let filmsDatas = [];

fetch("https://api.tvmaze.com/shows")
  .then((res) => res.json())
  .then((data) => {
    filmsDatas = data;
    LoadMore();
  });

let count = 0;
let limit = 12;


function LoadMore() {
  let filmsCount = filmsDatas.length;
  for (let index = count * limit; index < count * limit + limit; index++) {
    if (index < filmsCount) {
      filmsContainer.innerHTML += `
                <div class="film-card">
                <img
                src="${filmsDatas[index].image.original}"
                alt="Film Photo"
                style="height:275px; width:200px;"
                />
                <h3>${filmsDatas[index].name}</h3>
                <h3><img src="image.png" style="width:20px; height:20px; vertical-align:middle;">${filmsDatas[index].rating.average}</h3>
                <h4>${filmsDatas[index].genres[0]}</h4>
                </div>`;
    }
    else {
        LoadMoreButton.style.display = "none";
        break;
    }
  }
  count++;
}
