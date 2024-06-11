const API_URL = "https://restcountries.com/v3.1/all";

function countryCard(country) {
  const div = document.createElement("div");
  div.classList.add("countries", "w-[250px]", "mr-[50px]", "mb-8");
  div.setAttribute('data-region', country.region);

  const img = document.createElement("img");
  img.classList.add("w-[250px]", "h-[160px]", "mb-8");
  img.src = country.flags.png;
  div.appendChild(img);

  const nameDiv = document.createElement("div");
  nameDiv.innerHTML = `<h3> ${country.name.common} </h3>`;
  nameDiv.classList.add("font-bold", "mb-8", "ml-2");
  div.appendChild(nameDiv);

  const populationDiv = document.createElement("div");
  populationDiv.innerHTML = `<p> <b>Population</b>: ${country.population.toLocaleString()} </p>`;
  populationDiv.classList.add("ml-2");
  div.appendChild(populationDiv);

  const regionDiv = document.createElement("div");
  regionDiv.innerHTML = `<p><b>Region:</b> ${country.region} </p>`;
  regionDiv.classList.add("ml-2", "region");
  div.appendChild(regionDiv);

  const capitalDiv = document.createElement("div");
  if (Array.isArray(country.capital) && country.capital.length > 0) {
    capitalDiv.innerHTML = `<p><b>Capital:</b> ${country.capital[0]} </p>`;
  }
  capitalDiv.classList.add("ml-2");
  div.appendChild(capitalDiv);
  
  div.setAttribute('data-cca3', country.cca3);
  return div;
}

document.getElementById("dark-toggle").addEventListener("click", function () {
  document.body.classList.toggle("dark:bg-slate-800");
  document.body.classList.toggle("text-white");
});

document.getElementById("re-render").addEventListener("click", function () {
  document.getElementById("country-details").style.display = "none";
  document.getElementById("display-countries").style.display = "flex";
  document.getElementById("search").style.display = "flex";
});

function searchCountry(event) {
  const target = event.target.value.toUpperCase();
  document.querySelectorAll(".countries").forEach((country) => {
    const countryName = country.querySelector("h3").textContent.toUpperCase();
    country.style.display = countryName.includes(target) ? "block" : "none";
  });
}

function selectByRegion(event) {
  const target = event.target.value;
  document.querySelectorAll(".countries").forEach((country) => {
    const regionName = country.getAttribute("data-region");
    country.style.display = (target === regionName || target === "") ? "block" : "none";
  });
}

let API_DATA = [];

function loader() {
  const loader = document.getElementById("display-countries");

  const div = document.createElement('div');
  div.className = "flex justify-center mx-auto mt-20 loader";
  div.innerHTML = `<img src="./images/35.gif"> </img>`
  loader.appendChild(div);
}

async function fetchApi(API_URL) {
  const displayCountries = document.getElementById("display-countries");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch countries, status: " + response.status);
    }
    const data = await response.json();
    API_DATA = data;

    const loader = document.querySelector(".loader");
    loader.style.display = "none";

    data.forEach((item) => {
      const country = countryCard(item);
      displayCountries.appendChild(country);
    });

    displayCountries.addEventListener("click", showCountryDetails);
  } catch (error) {
    const loader = document.querySelector(".loader");
    loader.style.display = "none";
    const div = document.createElement('div');
    div.innerHTML = `<h1> Unable to fetch API DATA</h1>`;
    div.style.background ="red";
    div.className = "flex justify-center mx-auto";
    displayCountries.appendChild(div);
    console.error("Failed to fetch countries:", error);
  }
}

loader();

fetchApi(API_URL);

function showCountryDetails(event) {
  const country = event.target.closest(".countries");
  if (!country) return;

  const allCountries = document.getElementById("display-countries");
  const countryDetails = document.getElementById("country-details");
  const search = document.getElementById("search");

  search.style.display = "none";
  allCountries.style.display = "none";
  countryDetails.style.display = "block";

  const details = document.getElementById("details");
  const basicDetails = document.getElementById('basic-details');
  const advDetails = document.getElementById('adv-details');
  const flag = document.getElementById("flag");

  flag.innerHTML = "";
  basicDetails.innerHTML = '';
  advDetails.innerHTML = '';

  const cca3 = country.getAttribute('data-cca3');
  const target = API_DATA.find(each_country => each_country.cca3 === cca3);

  const img = document.createElement("img");
  img.src = target.flags.png;
  img.classList.add("w-[350px]", "h-[360px]", "mb-8");
  flag.appendChild(img);

  const nativeNames = Object.values(target.name.nativeName).map(name => name.common).join(", ");
  const basicDetailsContent = `
    <h1 style="font-size:40px"> <b> ${target.name.common} </b> </h1>
    <p><b>Native Name:</b> ${nativeNames}</p>
    <p><b>Region:</b> ${target.region}</p>
    <p><b>Population:</b> ${target.population.toLocaleString()}</p>
    <p><b>Subregion:</b> ${target.subregion}</p>`;
  basicDetails.innerHTML = basicDetailsContent;

  const advDetailsContent = `
    <p><b>Top Level Domain:</b> ${target.tld[0]}</p>
    <p><b>Capital:</b> ${target.capital}</p>`;
  advDetails.innerHTML = advDetailsContent;

  const borders = target.borders;
  const border_id = document.getElementById("border-countries");

  let storeCca3 = [];
  API_DATA.forEach((each_country) => {
    if (borders.includes(each_country.cca3)) {
      storeCca3[each_country.cca3] = each_country.capital;
    }
  });

  border_id.innerHTML = "<span class='pr-[10px]'><b>Borders:</b></span>";

  borders.forEach((border) => {
    if (border !== undefined) {
      const border_button = document.createElement('button');
      border_button.innerHTML = storeCca3[border] || border;
      border_button.setAttribute('data-cca3', border);
      border_button.style.margin = "0 10px 0 0";
      border_button.className = "bg-slate-400 px-4"
      border_id.appendChild(border_button);
    }
  });
}

function borderCountries(event) {
  const targetCountry = event.target.getAttribute('data-cca3');
  if (!targetCountry) return;
  
  const target = API_DATA.find(each_country => each_country.cca3 === targetCountry);
  if (target) {
    showCountryDetails({ target: document.querySelector(`[data-cca3='${targetCountry}']`) });
  }
}

document.getElementById("search").addEventListener("input", searchCountry);
document.getElementById("region-drop-down").addEventListener("change", selectByRegion);
document.getElementById('border-countries').addEventListener('click', borderCountries);
