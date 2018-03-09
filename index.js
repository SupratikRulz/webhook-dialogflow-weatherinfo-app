'use strict';

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const wwoApiKey = 'f6d5fa45edf909eaa33b';

const restService = express();

function callWeatherApi (city, date) {
    return new Promise((resolve, reject) => {
      // Create the path for the HTTP request to get the weather
      let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
        '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
      console.log('API Request: ' + host + path);
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
          console.log(output);
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
    // var speech = 
    //     req.body.result &&
    //     req.body.result.parameters &&
    //     req.body.result.parameters.weatherinfo
    //         ? req.body.result.parameters.weatherinfo
    //         : 'Seems like a problem on my end. Can you speak again? Or you may try after sometime';
    // return res.json({
    //     speech: speech,
    //     displayText: speech,
    //     source: 'webhook-dialogflow-weatherinfo-app'
    // });
    // Get the city and date from the request
    let city = req.body.result.parameters['city']; // city is a required param
    // Get the date for the weather forecast (if present)
    let date = '';
    if (req.body.result.parameters['date']) {
        date = req.body.result.parameters['date'];
    }
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