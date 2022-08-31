var axios = require('axios');
var qs = require('qs');
var data = qs.stringify({

});
var config = {
  method: 'get',
  url: 'https://restapi.amap.com/v3/weather/weatherInfo?extensions=all&key=0a53d71fd6555c37cf58a1f2936a5884&city=341102',
  headers: {},
  data: data
};

var result;

axios(config)
  .then(function (response) {
    exports.weather = response.data.forecasts[0].casts[0];
    result = response.data;
  })
  .catch(function (error) {
    console.log(error);
  });