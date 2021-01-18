var http = require('http');
var https = require('https');
var querystring = require('querystring');
var options = {
    host : 'api.openweathermap.org',
    path: '/data/2.5/weather?' + querystring.stringify({q: 'fairplay'}),
    withCredentials: false
};

var config = {
    units : 'metric',
    lang: 'en'
}

var weatherAPI = exports;

weatherAPI.setLang = function(lang){
    config.lang = lang.toLowerCase();
};

weatherAPI.setAPPID = function(appid){
    config.APPID = appid;
};

weatherAPI.setCoordinate = function(latitude, longitude){
    config.latitude = latitude;
    config.longitude = longitude;
};

weatherAPI.getWeatherForCities = function(cities, callback){
    let path = buildPathForCities(cities)
    _getData(path, callback);
};

function getCoordinate(latitude, longitude){
    let coordinateQuery = {lat: latitude, lon: config.longitude};
    return querystring.stringify(coordinateQuery);
}

function getHttp(){
    return options.ssl ? https : http;
}

function buildPathForCities(cities){
    let list = cities.join(',');
    return '/data/2.5/group?' + getCoordinate() + '&' + querystring.stringify({units: config.units, lang: config.lang, mode: 'json', APPID: config.APPID, id: list});
}

function _getData(url, callback, tries){
    options.path = url;
    var conn = getHttp().get(options, function(res){
      var chunks = '';
      res.on('data', function(chunk) {
          chunks += chunk;
      });
      res.on('end', function () {
        try{
          var parsed = {};

          if (!chunks && (!tries || tries < 3)) {
              return _getData(url, callback, (tries||0)+1);
          }
          parsed = JSON.parse(chunks);
          if(res.statusCode >199 && res.statusCode <400){
            return callback(null,parsed);
          }else{
            return callback(new Error(parsed.message||`Request failed with status code: ${res.statusCode}`),null);
          }
        }catch(e){
          return callback(e,null);
        }
      });

      res.on('error', function(err){
          return callback(err, null);
      });
    });

    conn.on('error', function(err){
      return callback(err, null);
    });
}
