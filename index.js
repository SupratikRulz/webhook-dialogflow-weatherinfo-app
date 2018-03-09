'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();

restService.use(
    bodyParser.urlencoded({
        extended: true
    })
);

restService.use(bodyParser.json());

restService.post('/weatherinfo', (req, res) => {
    var speech = 
        req.body.result &&
        req.body.result.parameters &&
        req.body.result.parameters.weatherinfo
            ? req.body.result.parameters.weatherinfo
            : 'Seems like a problem on my end. Can you speak again? Or you may try after sometime';
    return res.json({
        speech: speech,
        displayText: speech,
        source: 'webhook-dialogflow-weatherinfo-app'
    });
});

restService.listen(process.env.PORT || 8000, () => {
    console.log('Server is running on port: ' + (process.env.PORT || 8000));
});