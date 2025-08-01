document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "a949f88b6cf240332f29026997401262";
  const searchInput = document.getElementById("search-input");
  const forecastElements = document.querySelectorAll(".forecast .day");

  // 🌟 Sauvegarde valeurs HTML initiales
  const valeursParDefaut = [];
  forecastElements.forEach(el => {
    const jour = el.querySelector("h3").textContent;
    const temp = el.querySelector("p").textContent;
    const icon = el.querySelector(".icons, .icon").innerHTML;
    valeursParDefaut.push({ jour, temp, icon });
  });

  function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=fr`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) throw new Error("Ville non trouvée");
        return response.json();
      })
      .then(data => {
        const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        const today = new Date();
        const currentDayIndex = today.getDay();

        // ✅ 7 jours (forecast principal)
        for (let i = 0; i < 7; i++) {
          const forecastEl = forecastElements[i];
          const index = i * 8;
          const dayName = jours[(currentDayIndex + i) % 7];

          if (data.list[index]) {
            const weather = data.list[index];
            const temp = Math.round(weather.main?.temp || 0);
            const weatherMain = weather.weather?.[0]?.main || "";
            const iconCode = weather.weather?.[0]?.icon || "01d";

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

            forecastEl.querySelector("h3").textContent = dayName;
            forecastEl.querySelector("p").textContent = `${temp}°`;
            forecastEl.querySelector(".icons, .icon").innerHTML =
              `<span style="font-size: 35px">${customIcon}</span>`;
          } else {
            forecastEl.querySelector("h3").textContent = dayName;
            forecastEl.querySelector("p").textContent = "--°";
            forecastEl.querySelector(".icons, .icon").innerHTML = `❓`;
          }
        }

        // 📍 Affichage lieu
        document.querySelector(".location").innerHTML =
          `<i class="fa-solid fa-location-dot"></i> ${data.city.name}, ${data.city.country}`;

        // 🌍 Coordonnées
        const lat = data.city.coord.lat;
        const lon = data.city.coord.lon;
        document.getElementById("lat").textContent = lat.toFixed(2);
        document.getElementById("lon").textContent = lon.toFixed(2);

        // 💧 Météo actuelle (pression/humidité)
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
          .then(res => res.json())
          .then(weather => {
            document.getElementById("humidity").textContent = `Humidité (%): ${weather.main.humidity}%`;
            document.getElementById("pressure").textContent = `Pression atmosphérique: ${weather.main.pressure} hPa`;
          });

        // 🏭 Pollution
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
          .then(res => res.json())
          .then(pollutionData => {
            const aqi = pollutionData.list[0].main.aqi;
            const descriptions = [
              "Très bonne 🌱", "Bonne 🙂", "Moyenne 😐", "Mauvaise 😷", "Très mauvaise ☠️"
            ];
            if (document.getElementById("pollution")) {
              document.getElementById("pollution").textContent =
                `Qualité de l'air : ${descriptions[aqi - 1]} (AQI: ${aqi})`;
            }
          });

        // 🔁 Prévision 3h
        const threeHourContainer = document.querySelector(".forecast-3h .cards");
        threeHourContainer.innerHTML = "";
        for (let i = 0; i < 5; i++) {
          const item = data.list[i];
          const heure = new Date(item.dt_txt).getHours().toString().padStart(2, "0") + ":00";
          const temperature = Math.round(item.main.temp);
          const iconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <p class="hour">${heure}</p>
            <img src="${iconUrl}" alt="icone météo" />
            <p class="temp">${temperature}°</p>
          `;
          threeHourContainer.appendChild(card);
        }

        // 📆 Prévision 5 jours
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

        // 🎬 Animation
        gsap.fromTo(".day",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }
        );
      })
      .catch(error => {
        alert("Erreur : " + error.message);
        console.error(error);

        // Restauration valeurs par défaut
        forecastElements.forEach((el, i) => {
          el.querySelector("h3").textContent = valeursParDefaut[i].jour;
          el.querySelector("p").textContent = valeursParDefaut[i].temp;
          el.querySelector(".icons, .icon").innerHTML = valeursParDefaut[i].icon;
        });

        document.querySelector(".location").innerHTML =
          `<i class="fa-solid fa-location-dot"></i> Casablanca, Maroc`;
      });
  }

  
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const ville = searchInput.value.trim();
      if (ville) fetchWeather(ville);
    }
  });

  
  fetchWeather("Casablanca");
});

// 🎨 Mode sombre
const toggle = document.getElementById("toggle-checkbox");

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  toggle.checked = true;
}

toggle.addEventListener("change", () => {
  if (toggle.checked) {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

// fonction pour convertir en F
function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('unit-checkbox');

  function updateTemperatures() {
    const tempsElems = document.querySelectorAll('[data-celsius]');
    tempsElems.forEach(elem => {
      const celsius = parseFloat(elem.dataset.celsius);
      if (toggle.checked) {
        // Afficher en °F
        const f = celsiusToFahrenheit(celsius);
        elem.textContent = `${f}°F`;
      } else {
        // Afficher en °C
        elem.textContent = `${celsius}°C`;
      }
    });
  }

  // Affichage initial en °C
  updateTemperatures();

  // Écoute sur le toggle
  toggle.addEventListener('change', updateTemperatures);
});

const map = L.map('map').setView([33.5731, -7.5898], 2); // Zoom 2 pour afficher le monde

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Tu peux ajouter un marqueur si tu veux
  L.marker([33.5731, -7.5898]).addTo(map)
    .bindPopup('Casablanca')
    .openPopup();