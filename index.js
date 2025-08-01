// Quand toute la page HTML est complètement chargée
document.addEventListener("DOMContentLoaded", () => {
  // Ta clé API pour OpenWeather (unique à ton compte)
  const apiKey = "a949f88b6cf240332f29026997401262";

  // On récupère la zone de recherche dans la page (input texte)
  const searchInput = document.getElementById("search-input");

  // On récupère tous les éléments affichant la météo par jour
  const forecastElements = document.querySelectorAll(".forecast .day");

  // 🌟 On sauvegarde les valeurs initiales affichées dans le HTML
  // pour pouvoir les restaurer en cas d'erreur
  const valeursParDefaut = [];
  forecastElements.forEach(el => {
    const jour = el.querySelector("h3").textContent;       // nom du jour
    const temp = el.querySelector("p").textContent;        // température affichée
    const icon = el.querySelector(".icons, .icon").innerHTML; // icône météo
    valeursParDefaut.push({ jour, temp, icon });           // on stocke tout ça
  });

  // Fonction principale qui va chercher la météo d'une ville donnée
  function fetchWeather(city) {
    // On construit l'URL de l'API avec la ville, la clé, unité en °C, et en français
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

    // On lance la requête vers l'API
    fetch(apiUrl)
      .then(response => {
        // Si la réponse n'est pas OK (ex : ville inconnue), on lance une erreur
        if (!response.ok) throw new Error("Ville non trouvée");
        return response.json(); // Sinon on récupère les données JSON
      })
      .then(data => {
        // Tableau des noms des jours en français
        const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

        const today = new Date();           // date actuelle
        const currentDayIndex = today.getDay();  // numéro du jour actuel (0 = dimanche)

        // Pour chaque jour des 7 prochains jours
        for (let i = 0; i < 7; i++) {
          const forecastEl = forecastElements[i];   // élément HTML du jour i
          const index = i * 8;  // dans la liste, données toutes les 3h, donc 8 * 3h = 24h
          const dayName = jours[(currentDayIndex + i) % 7]; // nom du jour (en boucle)

          if (data.list[index]) {
            const weather = data.list[index];
            const temp = Math.round(weather.main?.temp || 0);    // température arrondie
            const weatherMain = weather.weather?.[0]?.main || ""; // type de météo (Clear, Clouds...)
            // Code icône météo (ex: "01d")
            const iconCode = weather.weather?.[0]?.icon || "01d";

            // On choisit un emoji météo personnalisé selon la température et le type
            let customIcon = "❓";
            if (temp > 30) customIcon = "☀️";
            else if (temp < 10) customIcon = "❄️";
            else {
              switch (weatherMain) {
                case "Clear": customIcon = "🌞"; break;
                case "Clouds": customIcon = "☁️"; break;
                case "Rain":
                case "Drizzle": customIcon = "🌧️"; break;
                case "Thunderstorm": customIcon = "⛈️"; break;
                case "Snow": customIcon = "🌨️"; break;
                case "Mist":
                case "Fog": customIcon = "🌫️"; break;
              }
            }

            // Mise à jour du HTML pour le jour i : nom, température, icône
            forecastEl.querySelector("h3").textContent = dayName;
            forecastEl.querySelector("p").textContent = `${temp}°`;
            forecastEl.querySelector(".icons, .icon").innerHTML =
              `<span style="font-size: 35px">${customIcon}</span>`;
          } else {
            // Si pas de données, on affiche des valeurs par défaut
            forecastEl.querySelector("h3").textContent = dayName;
            forecastEl.querySelector("p").textContent = "--°";
            forecastEl.querySelector(".icons, .icon").innerHTML = `❓`;
          }
        }

        // Affiche la localisation (ville, pays)
        document.querySelector(".location").innerHTML =
          `<i class="fa-solid fa-location-dot"></i> ${data.city.name}, ${data.city.country}`;

        // Coordonnées géographiques (latitude et longitude)
        const lat = data.city.coord.lat;
        const lon = data.city.coord.lon;
        document.getElementById("lat").textContent = lat.toFixed(2);
        document.getElementById("lon").textContent = lon.toFixed(2);

        // Requête pour météo actuelle (pression, humidité) avec lat/lon
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
          .then(res => res.json())
          .then(weather => {
            // Mise à jour des infos d’humidité et pression
            document.getElementById("humidity").textContent = `Humidité (%): ${weather.main.humidity}%`;
            document.getElementById("pressure").textContent = `Pression atmosphérique: ${weather.main.pressure} hPa`;
          });

        // Requête pour qualité de l’air
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
          .then(res => res.json())
          .then(pollutionData => {
            const aqi = pollutionData.list[0].main.aqi; // indice de qualité de l’air
            const descriptions = [
              "Très bonne 🌱", "Bonne 🙂", "Moyenne 😐", "Mauvaise 😷", "Très mauvaise ☠️"
            ];
            // Si élément pollution existe dans la page, on affiche le texte
            if (document.getElementById("pollution")) {
              document.getElementById("pollution").textContent =
                `Qualité de l'air : ${descriptions[aqi - 1]} (AQI: ${aqi})`;
            }
          });

        // Mise à jour des prévisions sur 3 heures
        const threeHourContainer = document.querySelector(".forecast-3h .cards");
        threeHourContainer.innerHTML = "";  // on vide la zone avant d’ajouter

        // On crée 5 cartes avec les prochaines prévisions (3h)
        for (let i = 0; i < 5; i++) {
          const item = data.list[i];
          const heure = new Date(item.dt_txt).getHours().toString().padStart(2, "0") + ":00";
          const temperature = Math.round(item.main.temp);
          const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

          // Création du bloc HTML d'une carte météo 3h
          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <p class="hour">${heure}</p>
            <img src="${iconUrl}" alt="icone météo" />
            <p class="temp">${temperature}°</p>
          `;
          threeHourContainer.appendChild(card);
        }

        // Mise à jour des prévisions sur 5 jours
        const fiveDayContainer = document.querySelector(".forecast-5d");
        const dayElements = fiveDayContainer.querySelectorAll(".day");

        for (let i = 0; i < 5; i++) {
          const item = data.list[i * 8];
          const date = new Date(item.dt_txt);
          const jourNom = jours[date.getDay()];
          const humidite = item.main.humidity;
          const tempMin = Math.round(item.main.temp_min);
          const tempMax = Math.round(item.main.temp_max);

          const html = `
            <span>${jourNom}</span>
            <span>Humidité: ${humidite}%</span>
            <span>min : ${tempMin}°</span>
            <span>max : ${tempMax}°</span>
          `;
          if (dayElements[i]) {
            dayElements[i].innerHTML = html;
          }
        }

        // Animation avec la librairie GSAP (apparition en fondu et translation)
        gsap.fromTo(".day",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }
        );
      })
      .catch(error => {
        // En cas d’erreur (ex: ville non trouvée), on affiche une alerte
        alert("Erreur : " + error.message);
        console.error(error);

        // On restaure les valeurs météo par défaut qui étaient dans le HTML
        forecastElements.forEach((el, i) => {
          el.querySelector("h3").textContent = valeursParDefaut[i].jour;
          el.querySelector("p").textContent = valeursParDefaut[i].temp;
          el.querySelector(".icons, .icon").innerHTML = valeursParDefaut[i].icon;
        });

        // Et on remet la localisation Casablanca par défaut
        document.querySelector(".location").innerHTML =
          `<i class="fa-solid fa-location-dot"></i> Casablanca, Maroc`;
      });
  }

  // 🔍 Recherche météo par ville avec la touche "Entrée"
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {          // si on appuie sur la touche Entrée
      const ville = searchInput.value.trim();  // on récupère le texte entré
      if (ville) fetchWeather(ville);          // on lance la recherche si pas vide
    }
  });

  // Au chargement, on affiche la météo de Casablanca par défaut
  fetchWeather("Casablanca");
});

// 🎨 Gestion du mode sombre

const toggle = document.getElementById("toggle-checkbox");

// Si dans le localStorage on a enregistré "dark", on applique directement le mode sombre
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggle.checked = true;
}

// Quand on change le toggle mode sombre
toggle.addEventListener("change", () => {
  if (toggle.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");  // on enregistre la préférence
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

// Fonction pour convertir Celsius en Fahrenheit
function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

// Gestion du toggle °C / °F
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('unit-checkbox');

  // Met à jour toutes les températures affichées selon le toggle
  function updateTemperatures() {
    const tempsElems = document.querySelectorAll('[data-celsius]');  // tous les éléments qui ont la valeur °C dans un data attribute
    tempsElems.forEach(elem => {
      const celsius = parseFloat(elem.dataset.celsius);
      if (toggle.checked) {
        // Affiche en °F
        const f = celsiusToFahrenheit(celsius);
        elem.textContent = `${f}°F`;
      } else {
        // Affiche en °C
        elem.textContent = `${celsius}°C`;
      }
    });
  }

  updateTemperatures();  // mise à jour au chargement

  toggle.addEventListener('change', updateTemperatures);  // mise à jour quand on change le toggle
});
