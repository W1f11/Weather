// Quand la page est entièrement chargée
document.addEventListener("DOMContentLoaded", () => {
  const apiKey = "a949f88b6cf240332f29026997401262";
  const searchInput = document.getElementById("search-input");
  const forecastElements = document.querySelectorAll(".forecast .day");

  // 🌟 Sauvegarde des valeurs statiques HTML
  const valeursParDefaut = [];
  forecastElements.forEach(el => {
    const jour = el.querySelector("h3").textContent;
    const temp = el.querySelector("p").textContent;
    const icon = el.querySelector(".icons, .icon").innerHTML;
    valeursParDefaut.push({ jour, temp, icon });
  });

  // 📦 Fonction principale météo
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

        for (let i = 0; i < 7; i++) {
          const forecastEl = forecastElements[i];
          const index = i * 8;
          const dayName = jours[(currentDayIndex + i) % 7];

          if (data.list[index]) {
            const weather = data.list[index];
            const temp = Math.round(weather.main?.temp || 0);
            const weatherMain = weather.weather?.[0]?.main || "";
            const iconCode = weather.weather?.[0]?.icon || "01d";

            // 🎯 Icône personnalisée
            let customIcon = "❓";
            if (temp > 30) {
              customIcon = "☀️";
            } else if (temp < 10) {
              customIcon = "❄️";
            } else {
              switch (weatherMain) {
                case "Clear":
                  customIcon = "🌞"; break;
                case "Clouds":
                  customIcon = "☁️"; break;
                case "Rain":
                case "Drizzle":
                  customIcon = "🌧️"; break;
                case "Thunderstorm":
                  customIcon = "⛈️"; break;
                case "Snow":
                  customIcon = "🌨️"; break;
                case "Mist":
                case "Fog":
                  customIcon = "🌫️"; break;
              }
            }

            // 📝 Affichage des données
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

        // 📍 Affichage localisation
        document.querySelector(".location").innerHTML =
          `<i class="fa-solid fa-location-dot"></i> ${data.city.name}, ${data.city.country}`;
        // 👈 AJOUT : géolocalisation et météo actuelle
        const lat = data.city.coord.lat;
        const lon = data.city.coord.lon;
        document.getElementById("lat").textContent = lat.toFixed(2);
        document.getElementById("lon").textContent = lon.toFixed(2);

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
          .then(res => res.json())
          .then(weather => {
            const humidity = weather.main.humidity;
            const pressure = weather.main.pressure;
            document.getElementById("humidity").textContent = `Humidité (%): ${humidity}%`;
            document.getElementById("pressure").textContent = `Pression atmosphérique: ${pressure} hPa`;
          });

        // 👈 AJOUT : pollution de l’air
        fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
          .then(res => res.json())
          .then(pollutionData => {
            const aqi = pollutionData.list[0].main.aqi;
            const descriptions = [
              "Très bonne 🌱", "Bonne 🙂", "Moyenne 😐", "Mauvaise 😷", "Très mauvaise ☠️"
            ];
            document.getElementById("pollution").textContent =
              `Qualité de l'air : ${descriptions[aqi - 1]} (AQI: ${aqi})`;
          });

        // 🎬 Animation GSAP après chargement
        gsap.fromTo(".day",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }
        );
      })
      .catch(error => {
        alert("Erreur : " + error.message);
        console.error(error);
        

        forecastElements.forEach((el, i) => {
          el.querySelector("h3").textContent = valeursParDefaut[i].jour;
          el.querySelector("p").textContent = valeursParDefaut[i].temp;
          el.querySelector(".icons, .icon").innerHTML = valeursParDefaut[i].icon;
        });

        document.querySelector(".location").innerHTML =
          `<i class="fa-solid fa-location-dot"></i> Casablanca, Maroc`;
      });
  }

  

  // 🔍 Recherche ville au clavier
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const ville = searchInput.value.trim();
      if (ville) fetchWeather(ville);
    }
  });
});
const toggle = document.getElementById("toggle-checkbox");

// Charger le mode depuis le stockage local
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

