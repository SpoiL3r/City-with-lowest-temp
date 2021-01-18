// require('dotenv').config()
// const apiKey = process.env.API_KEY
//const data = require('./de.json');
const port = process.env.PORT || 3001
const express = require('express')
const cities = require('./data/current.city.list')
const apiData = require('./config/api.data')
const weatherAPI = require('./weatherAPI')
weatherAPI.setLang('it')


const app= express();

weatherAPI.setAPPID(process.env.WEATHER_API_KEY || apiData.apiKey  );
//weatherAPI.setAPPID(apiData.apiKey);

weatherAPI.setCoordinate(apiData.latitude, apiData.longitude);


const filterCitiesByCountry = (countryCode) => {
  return cities.filter((city)=> city.country === countryCode);
}

const deCities = filterCitiesByCountry('DE');
console.log(deCities.length)

const getTemprature = function (citiesGroup) {
  return new Promise((resolve, reject)=> {
    const cityIds = citiesGroup.map((city) => city.id);
    weatherAPI.getWeatherForCities(cityIds,function(err, JSONObj){
      if(err) {
        reject(err);
      }
      resolve(JSONObj);
    });
  });
}

app.get('/temperature/lowest', async (req, res, next) => {
  let tempCities = [];
  for(let index = 0; index < deCities.length ; index = index + 20 ) {
    
    const deCities20 = deCities.slice(index, index + 20);
    const tempCities20 = await getTemprature(deCities20);
    const length = tempCities.push(...tempCities20.list);
  }

  tempCities.sort((city1, city2) =>  {
    if(city1.main && city2.main && city1.main.temp_min < city2.main.temp_min) {
      return -1;
    } else if(city1.main && city2.main && city1.main.temp_min > city2.main.temp_min) {
      return 1;
    }
    return 0;
  });

  const googleAPIURL = `https://maps.googleapis.com/maps/api/js?key=${(process.env.GOOGLE_MAPS_API_KEY || apiData.googleMaps.apiKey)}&callback=initialize`
  //const googleAPIURL = `https://maps.googleapis.com/maps/api/js?key=${apiData.googleMaps.apiKey}&callback=initialize`
   
  //res.json({"lowestTemp": tempCities[0], "googleMapURL": process.env.GOOGLE_MAPS_API_KEY});
  res.json({"lowestTemp": tempCities[0], "googleMapURL": googleAPIURL});
});

app.use(express.static('public'));

//start server
app.listen(port, function(){
  console.log('I am listening on ' + port )
});
