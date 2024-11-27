const form = document.querySelector(".menu_form");
const latitude = document.getElementById("latitude");
const longitude = document.getElementById("longitude");
const msg = document.querySelector(".menu_msg");
const list = document.querySelector(".widgets_list");
const locationButton = document.getElementById('location');
const clearButton = document.getElementById('clear');

const app = async () => {
    addWidgets();
    getGeolocation();
    clearWidgets();
    checkLocalStorage();
}

function addWidgets() {
    form.addEventListener("submit", e => {
        e.preventDefault();
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude.value}&lon=${longitude.value}&appid=58708b9919c4c20d240b4430892a0623&lang=ru&units=metric`)
            .then(response => response.json())
            .then(weather => {
                console.log(weather)
                const icon = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
                const map = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=500&center=lonlat:${weather.coord.lon},${weather.coord.lat}&zoom=8&marker=lonlat:${weather.coord.lon},${weather.coord.lat};color:%23ff0000;size:medium&apiKey=cd3386bf280348a7931c870606015114`;
                addWidget(weather, icon, map)
            })
            .catch(() => {
                msg.textContent = "Введены неверные координаты. Попробуйте снова.";
            });
        msg.textContent = "";
        form.reset();
        latitude.focus();
    });
}

function addWidget(data, icon, map) {
    const coords = {
        latitude: data.coord.lat,
        longitude: data.coord.lon
    }
    const time = convertTimestampToTime(data.dt, data.timezone)
    const weatherData = {
        description: capitalize(data.weather[0].description),
        humidity: data.main.humidity,
        wind: {
            speed: data.wind.speed.toFixed(0)
        },
        temperature: Math.floor(data.main.temp)
    }
    const widget = document.createElement("li");
    widget.classList.add("widgets_widget");
    widget.innerHTML = `
        <h1 class="widgets_coordinates">${coords.latitude.toFixed(3)}°, ${coords.longitude.toFixed(3)}°</h1>
        <div class="widgets_wrapper">
            <h2 class="widgets_temperature">${weatherData.temperature}°C</h2>
            <div class="widgets_info">
                <p class="widgets_name">Ветер</p>
                <p class="widgets_value">${weatherData.wind.speed} м/c</p>
                <p class="widgets_name">Влажность</p>
                <p class="widgets_value">${weatherData.humidity}%</p>
                <p class="widgets_name">Время</p>
                <p class="widgets_value">${time}</p>
            </div>
        </div>
        <div class="widgets_weather">
            <img class="widgets_icon" src=${icon} alt="Иконка">
            <h3 class="widgets_description">${weatherData.description}</h3>
        </div>
        <div class="widgets_map-wrapper">
            <a href="https://maps.yandex.ru/?ll=${coords.longitude},${coords.latitude}&z=10" target="_blank"><img class="widgets_map" src=${map} alt="Карта"></a>
        </div>`;
    list.appendChild(widget);
    localStorage.setItem("list", JSON.stringify(list.innerHTML));
}

function clearWidgets() {
    clearButton.addEventListener("click", e => {
        list.innerHTML = "";
        latitude.value = "";
        longitude.value = "";
        localStorage.clear();
    });
}

function getGeolocation() {
    locationButton.addEventListener("click", e => {
        navigator.geolocation.getCurrentPosition((pos) => {
            latitude.value = pos.coords.latitude
            longitude.value = pos.coords.longitude
        })
    });
}

function checkLocalStorage() {
    if (list.innerHTML == "") {
        list.innerHTML = JSON.parse(localStorage.getItem("list", JSON.stringify(list)));
    }
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function convertTimestampToTime(timestamp, timeZone) {
    let dateObj = new Date((timestamp + timeZone) * 1000);

    let hours = dateObj.getUTCHours();
    let minutes = dateObj.getUTCMinutes(); 
    let seconds = dateObj.getUTCSeconds();

    let formattedTime = hours.toString().padStart(2, '0') 
        + ':' + minutes.toString().padStart(2, '0') 
        + ':' + seconds.toString().padStart(2, '0');

    return formattedTime;
}

await app()