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

  // ❌ Ne pas charger Casablanca automatiquement ici

  // 🔍 Recherche ville au clavier
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const ville = searchInput.value.trim();
      if (ville) fetchWeather(ville);
    }
  });
});
