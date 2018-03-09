'use strict';

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const wwoApiKey = 'e52e6f3256fa4f1abda220042180903';
const host = 'api.worldweatheronline.com';

const restService = express();

function callWeatherApi (city, date) {
    return new Promise((resolve, reject) => {
      // Create the path for the HTTP request to get the weather
      let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
        '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;

      // Make the HTTP request to get the weather
      http.get({host: host, path: path}, (res) => {
        let body = ''; // var to store the response chunks
        res.on('data', (d) => { body += d; }); // store each response chunk
        res.on('end', () => {
          // After all the data has been received parse the JSON for desired data
          let response = JSON.parse(body);
          let forecast = response['data']['weather'][0];
          let location = response['data']['request'][0];
          let conditions = response['data']['current_condition'][0];
          let currentConditions = conditions['weatherDesc'][0]['value'];
          // Create response
          let output = `Current conditions in the ${location['type']} 
          ${location['query']} are ${currentConditions} with a projected high of
          ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of 
          ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on 
          ${forecast['date']}.`;
          // Resolve the promise with the output text
          resolve(output);
        });
        res.on('error', (error) => {
          reject(error);
        });
      });
    });
}

restService.use(
    bodyParser.urlencoded({
        extended: true
    })
);

restService.use(bodyParser.json());

restService.post('/weatherinfo', (req, res) => {
    // Get the city and date from the request
    let city = req.body.result.parameters['city']; // city is a required param
    // Get the date for the weather forecast (if present)
    let date = req.body.result.parameters['date'];
    // Call the weather API
    callWeatherApi(city, date).then((output) => {
        // Return the results of the weather API to Dialogflow
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
    }).catch((error) => {
        // If there is an error let the user know
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
    });


});


restService.listen(process.env.PORT || 8000, () => {
    console.log('Server is running on port: ' + (process.env.PORT || 8000));
});