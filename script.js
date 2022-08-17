navigator.geolocation.getCurrentPosition((position) => {
    console.log(position)
    
    const latitude = position.coords.latitude.toFixed(2);
    const longitude = position.coords.longitude.toFixed(2);
    
    const locationUri = `https://api.weather.gov/points/${latitude},${longitude}`;
    
    const futureForecastTemplate = document.querySelector('[data-next-day-template]');
    const futureForecastContainer = document.querySelector('[future-forecast]');
    const hourlyTemplate = document.querySelector('[data-hourly-forecast]');
    const hourlyContainer = document.querySelector('[hourly-forecast]')

    let h = new Headers();
    h.append("Accept", "application/json"),
    ("User-Agent", ("myWeatherApp", "testing@yahoo.com"));
    let req = new Request(locationUri, {
        method: "GET",
        headers: h,
        mode: "cors"
    });

    getLocation();
    // getCurrentForecast()
    
    function titleData() {
        let title = document.createElement("title");
        let txtNode = document.createTextNode("Weather for " + city + ", " + state);
        title.appendChild(txtNode);
        document.head.appendChild(title);
    }
    
    function getLocation() {
        return fetch(req).then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("unable to respond to server")
            }
        })
        .then((locationData) => {
            const location = locationData.properties;
            console.log(location);
            stationUri = location.forecast;
            stationHourlyUri = location.forecastHourly;
            let locationZone = location.forecastZone;
            city = location.relativeLocation.properties.city;
            state =  location.relativeLocation.properties.state;
            document.querySelector('.city').innerHTML = city;
            document.querySelector('.state').innerHTML = state;

            let zone = new Request(locationZone, {
                method: "GET",
                headers: h,
                mode: "cors"
            });

            getZone()

            function getZone() {
                return fetch(zone).then((response) => {
                    if (response.ok) {
                        return response.json()
                    }
                })
                .then((zoneInfo) => {
                    const zone = zoneInfo.properties.id
                    const alertUri = `https://api.weather.gov/alerts/active/zone/${zone}`
                    // console.log(alertUri)
                    
                    let alertData = new Request(alertUri, {
                        method: "GET",
                        headers: h,
                        mode: "cors"
                    });
                    
                    getAlertData()
                    
                    function getAlertData() {
                        return fetch(alertData).then((response) => {
                            if (response.ok) {
                                return response.json()
                            } 
                        })
                        .then((currentAlertData) => {
                            const currentAlert = currentAlertData.features[0].properties;
                            // console.log(currentAlert)
                            if (currentAlert !== "null") {
                                const alertLocation = currentAlert.areaDesc;
                                const alertSeverity = currentAlert.severity;
                                const alertEvent = currentAlert.event;
                                const alertDescription = currentAlert.description;
                    
                                // console.log(alertLocation, alertSeverity, alertEvent, alertDescription)
                                document.querySelector('.alertBanner').style.display = "block";
                                document.querySelector('.alert-location').innerHTML = alertLocation;
                                document.querySelector('.alert-severity').innerHTML = alertSeverity;
                                document.querySelector('.alert-event').innerHTML = alertEvent;
                                document.querySelector('.alert-description').innerText = alertDescription;
                    
                    
                    
                            } else {
                                console.log("no alerts at this time!")
                            }
                        })
                    }


                })
            }
            
            

            titleData()

            let forecastCurrent = new Request(stationUri, {
                method: "GET",
                headers: h,
                mode: "cors"
            });

            function getCurrentForecast() {
                return fetch(forecastCurrent).then((response) => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error("Unable to connect to server!")
                    }
                })
                .then((currentForecastData) => {
                    const currentForecast = currentForecastData.properties.periods;
                    // console.log(currentForecast);
                    return Object.entries(currentForecast).map(([Object, forecast]) => {
                        return {
                            keys: Object,
                            name: forecast.name,
                            icon: forecast.icon,
                            shortForecast: forecast.shortForecast,
                            detailedForecast: forecast.detailedForecast,
                            temperature: forecast.temperature,
                            temperatureUnit: forecast.temperatureUnit,
                            windDirection: forecast.windDirection,
                            windSpeed: forecast.windSpeed
                        }
                    })
                })
            }

            let selectedTimeDataIndex;
            getCurrentForecast().then(data => {
                selectedTimeDataIndex = data.length - data.length
                displayCurrentData(data)
                displayFutureData(data)
            })
            
            function displayCurrentData(data) {
                const selectedTime = data[selectedTimeDataIndex]
                document.querySelector('.icon').src = selectedTime.icon;
                document.querySelector('.current-temp').innerHTML = selectedTime.temperature
                document.querySelector('.title-name').innerHTML = selectedTime.name;
                document.querySelector('.speed').innerHTML = selectedTime.windSpeed
                document.querySelector('.long-forecast').innerHTML = selectedTime.detailedForecast
            }

            function displayFutureData(data) {
              futureForecastContainer.innerHTML = "";
              data.forEach((data, index) => {
                const forecastContainer = futureForecastTemplate.content.cloneNode(true);
                forecastContainer.querySelector('[next-name').innerHTML = data.name;
                forecastContainer.querySelector('[temp-next').innerHTML = data.temperature;
                forecastContainer.querySelector('[forecast-next]').innerHTML = data.shortForecast;
                forecastContainer.querySelector('[weather-icon]').src = data.icon;
                futureForecastContainer.appendChild(forecastContainer);
              })
            }
            let forecastHourly = new Request(stationHourlyUri, {
                method: "GET",
                headers: h,
                mode: "cors"
            });

            function getHourlyForecast() {
                return fetch(forecastHourly).then((response) => {
                    if (response.ok) {
                        return response.json()
                    } else {
                        throw new Error("Unable to connect to server")
                    }
                })
                .then((hourlyForecastData) => {
                    // console.log(hourlyForecastData)
                    const hourlyForecast = hourlyForecastData.properties.periods;
                    // console.log(hourlyForecast)
                    const eightHourForecast = hourlyForecast.slice(0, 8)
                    console.log(eightHourForecast)
                    return Object.entries(eightHourForecast).map(([Object, hourly]) => {
                        return {
                            keys: Object,
                            time: Date.parse(hourly.startTime),
                            icon: hourly.icon,
                            temperature: hourly.temperature,
                            shortForecast: hourly.shortForecast
                        }
                    } )
                    
                    
                })
            }

            getHourlyForecast().then(hourlyData => {
                displayHourlyData(hourlyData)
                console.log(hourlyData);
            })

            function displayHourlyData(hourlyData) {
                hourlyContainer.innerHTML = "";
                hourlyData.forEach((hourlyData, index) => {
                    const hourlyForecastContainer = hourlyTemplate.content.cloneNode(true);
                    hourlyForecastContainer.querySelector('[time]').innerHTML = new Date(
                    hourlyData.time).toLocaleTimeString();
                    hourlyForecastContainer.querySelector('[hourly-icon]').src = hourlyData.icon;
                    hourlyForecastContainer.querySelector('[hourly-temp]').innerHTML = hourlyData.temperature;
                    hourlyForecastContainer.querySelector('[hour-forecast]').innerHTML = hourlyData.shortForecast;
                    hourlyContainer.appendChild(hourlyForecastContainer);
                })
            }
            
        })
    }
});

function forecastAnimation() {
    const animate = document.querySelector('.hourly-container');
    if (animate.className === "hourly-container") {
        animate.className += " info";
    } else {
        animate.className = "hourly-container"
    }
    const carrot = document.querySelector('.carrot');
    if (carrot.className === "carrot") {
        carrot.className += " rotate";
    } else {
        carrot.className = "carrot"
    }
}

// console.log(getAlertData())
function alertAnimation() {
const action = document.querySelector('.alert-statement');
    if (action.className === "alert-statement") {
    action.className += " news"
    } else {
    action.className = "alert-statement"
    }
}