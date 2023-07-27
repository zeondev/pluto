// export default {
//   name: "OpenWeatherMap",
//   description: "A service that fetches the current weather when requested",
//   ver: 1, // Compatible with core v1
//   type: "process",
//   exec: async function (Root) {
//     const WWO_CODE = {
//       "01d": "Sunny",
//       "01n": "Sunny",
//       "02d": "PartlyCloudy",
//       "02n": "PartlyCloudy",
//       "03d": "Cloudy",
//       "03n": "Cloudy",
//       "04d": "VeryCloudy",
//       "04n": "VeryCloudy",
//       "09d": "HeavyShowers",
//       "09n": "HeavyShowers",
//       "10d": "LightRain",
//       "10n": "LightRain",
//       "11d": "ThunderyShowers",
//       "11n": "ThunderyShowers",
//       "13d": "HeavySnow",
//       "13n": "HeavySnow",
//       "50d": "Fog",
//       "50n": "Fog",
//     };

//     const WEATHER_SYMBOL = {
//       Unknown: "✨",
//       Cloudy: "☁️",
//       Fog: "🌁",
//       HeavyRain: "🌧️",
//       HeavyShowers: "🌧️",
//       HeavySnow: "❄️",
//       HeavySnowShowers: "❄️",
//       LightRain: "🌦️",
//       LightShowers: "🌦️",
//       LightSleet: "🌨️",
//       LightSleetShowers: "🌨️",
//       LightSnow: "🌨️",
//       LightSnowShowers: "🌨️",
//       PartlyCloudy: "⛅️",
//       Sunny: "☀️",
//       ThunderyHeavyRain: "⛈️",
//       ThunderyShowers: "⛈️",
//       ThunderySnowShowers: "⛈️",
//       VeryCloudy: "☁️",
//     };

//     let NWSAlertsData;

//     let weatherData = {
//       coord: {
//         lon: 0,
//         lat: 0,
//       },
//       weather: [
//         {
//           id: 0,
//           main: "Clouds",
//           description: "overcast clouds",
//           icon: "04n",
//         },
//       ],
//       base: "stations",
//       main: {
//         temp: 0,
//         feels_like: 0,
//         temp_min: 0,
//         temp_max: 0,
//         pressure: 0,
//         humidity: 0,
//       },
//       visibility: 0,
//       wind: {
//         speed: 0,
//         deg: 0,
//       },
//       clouds: {
//         all: 0,
//       },
//       dt: 0,
//       sys: {
//         type: 2,
//         id: 0,
//         country: "XX",
//         sunrise: 0,
//         sunset: 0,
//       },
//       timezone: 0,
//       id: 0,
//       name: "",
//       cod: 200,
//     };
//     let weatherLocation = "Osaka";

//     /*
// {
//   "coord": {
//     "lon": -95.3633,
//     "lat": 29.7633
//   },
//   "weather": [
//     {
//       "id": 804,
//       "main": "Clouds",
//       "description": "overcast clouds",
//       "icon": "04n"
//     }
//   ],
//   "base": "stations",
//   "main": {
//     "temp": 76.06,
//     "feels_like": 77.04,
//     "temp_min": 70.99,
//     "temp_max": 78.15,
//     "pressure": 1013,
//     "humidity": 78
//   },
//   "visibility": 10000,
//   "wind": {
//     "speed": 5.75,
//     "deg": 220
//   },
//   "clouds": {
//     "all": 100
//   },
//   "dt": 1685340969,
//   "sys": {
//     "type": 2,
//     "id": 2001415,
//     "country": "US",
//     "sunrise": 1685359344,
//     "sunset": 1685409337
//   },
//   "timezone": -18000,
//   "id": 4699066,
//   "name": "Houston",
//   "cod": 200
// }
// */
//     // find your zone here: https://www.weather.gov/pimar/PubZone
//     // nevada zone 002
//     const NOAAWeatherZone = "NVZ002";
//     const NOAAWeatherOffice = "KFWS";
//     let units = "imperial";

//     /// Gets and returns the set city in the city variable
//     function getCity() {
//       return weatherLocation;
//     }
//     /// Gets and returns the set office in the office variable
//     function getOffice() {
//       return NOAAWeatherOffice;
//     }
//     /// Gets and returns the set zone in the zone variable
//     function getZone() {
//       return NOAAWeatherZone;
//     }
//     /// Takes the icon code from OWM API Data and converts it into an emoji.
//     function codeToEmoji() {
//       return WEATHER_SYMBOL[WWO_CODE[weatherData.weather[0].icon]];
//     }
//     /// Returns the title and description of the current weather status
//     function weatherNameDesc() {
//       return {
//         title: weatherData.weather.main,
//         description: weatherData.weather.description,
//       };
//     }
//     /// Returns a formatted temperature of the current weather
//     function weatherFFTemp() {
//       var x = Math.round(parseInt(weatherData.main.temp, 10));
//       if (units == "imperial") {
//         return x + "°F";
//       }
//       return x + "";
//     }
//     /// Returns the current weather temperature but not formatted or floored
//     function weatherTemp() {
//       return weatherData.main.temp;
//     }
//     /// Returns the feels like temperature
//     function weatherFeelsLike() {
//       return weatherData.main.feels_like;
//     }
//     /// Returns the LO of the temperature
//     function weatherLo() {
//       return weatherData.main.temp_min;
//     }
//     /// Returns the HI of the temperature
//     function weatherHi() {
//       return weatherData.main.temp_max;
//     }
//     /// Returns the barometric pressure of the current location
//     function weatherBaroPressure() {
//       return weatherData.main.pressure;
//     }
//     /// Returns the current humidity of the current location
//     function weatherHumidity() {
//       return weatherData.main.humidity;
//     }
//     /// Returns the wind speed of the current location
//     function weatherWindSpeed() {
//       return weatherData.wind.speed;
//     }
//     /// Returns the current wind degrees angle of the current location.
//     function weatherWindDeg() {
//       return weatherData.wind.deg;
//     }
//     /// Returns the sunrise time of the current location
//     function weatherSunrise() {
//       return new Date(weatherData.sys.sunrise * 1000);
//     }
//     /// Returns the sunset time of the current location
//     function weatherSunset() {
//       return new Date(weatherData.sys.sunset * 1000);
//     }
//     /// Returns the current visibility of the current location in percent
//     function weatherVisibilityPercent() {
//       return weatherData.visibility / 100;
//     }
//     /// Simplifies and returns alerts in active area (nws zone)
//     function activeAlertsInCurrentArea() {
//       let alerts = [];

//       for (let x = 0; x < NWSAlertsData.features.length; x++) {
//         let activeAreas = [];
//         for (
//           let y = 0;
//           y < NWSAlertsData.features[x].properties.geocode.UGC.length;
//           y++
//         ) {
//           activeAreas.push(NWSAlertsData.features[x].properties.geocode.UGC[y]);
//         }
//         alerts.push({
//           alert:
//             NWSAlertsData.features[x].properties.severity +
//             " " +
//             NWSAlertsData.features[x].properties.event,
//           extraIdentifiers:
//             NWSAlertsData.features[x].properties.certainty +
//             "," +
//             NWSAlertsData.features[x].properties.urgency,
//           activeAreas,
//           time:
//             NWSAlertsData.features[x].properties.effective +
//             " ^ " +
//             NWSAlertsData.features[x].properties.expires,
//           shortDesc: NWSAlertsData.features[x].properties.headline,
//           description: NWSAlertsData.features[x].properties.description,
//         });
//       }
//       return alerts;
//     }

//     let getUnits = (_) => units;
//     let setUnits = (u) => (units = u);

//     /// fetches the weather from multiple apis
//     async function fetchUpdateWD() {
//       NWSAlertsData = await fetch(
//         `https://api.weather.gov/alerts/active/zone/${NOAAWeatherZone}`
//       ).then((j) => j.json());
//       weatherData = await fetch(
//         `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
//           weatherLocation
//         )}&units=${units}&appid=bceda99c033865c389025abb023111b8`
//       ).then((j) => j.json());
//       return weatherData;
//     }

//     await fetchUpdateWD();
//     setInterval(fetchUpdateWD, 1000 * 60 * 3 /* <-- minutes */);

//     return {
//       // other functions can go here, available in .proc
//       /// Gets and returns the set city in the city variable
//       getCity,
//       /// Gets and returns the set office in the office variable
//       getZone,
//       /// Gets and returns the set zone in the zone variable
//       getOffice,
//       /// get units
//       getUnits,
//       /// set units
//       setUnits,
//       /// Takes the icon code from OWM API Data and converts it into an emoji.
//       codeToEmoji,
//       /// Simplifies and returns alerts in active area (nws zone)
//       activeAlertsInCurrentArea,
//       /// Returns the title and description of the current weather status
//       weatherNameDesc,
//       /// Returns the current weather temperature but not formatted or floored
//       weatherTemp,
//       /// Returns a formatted temperature of the current weather
//       weatherFFTemp,
//       /// Returns the feels like temperature
//       weatherFeelsLike,
//       /// Returns the LO of the temperature
//       weatherLo,
//       /// Returns the HI of the temperature
//       weatherHi,
//       /// Returns the barometric pressure of the current location
//       weatherBaroPressure,
//       /// Returns the current humidity of the current location
//       weatherHumidity,
//       /// Returns the wind speed of the current location
//       weatherWindSpeed,
//       /// Returns the current wind degrees angle of the current location.
//       weatherWindDeg,
//       /// Returns the sunrise time of the current location
//       weatherSunrise,
//       /// Returns the sunset time of the current location
//       weatherSunset,
//       /// Returns the current visibility of the current location in percent
//       weatherVisibilityPercent,
//     };
//   },
// };
