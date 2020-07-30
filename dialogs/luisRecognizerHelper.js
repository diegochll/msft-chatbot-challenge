// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require('botbuilder-ai');

class LuisRecognizerHelper {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            // Set the recognizer options depending on which endpoint version you want to use e.g v2 or v3.
            // More details can be found in https://docs.microsoft.com/azure/cognitive-services/luis/luis-migration-api-v3
            const recognizerOptions = {
                apiVersion: 'v3',
            };

            this.recognizer = new LuisRecognizer(config, recognizerOptions);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return await this.recognizer.recognize(context);
    }

    getCountryEntities(result) {
        let countryValue;
        if (result.entities.$instance.country) {
            countryValue = result.entities.$instance.country[0].text;
        }
        return { country: countryValue };
    }

    getTimeFrameEntities(result) {
        let timeFrameValue;
        if (result.entities.timeFrame && result.entities.timeFrame.length>0) {
            timeFrameValue = result.entities.timeFrame[0];
        }
        return { timeFrame: timeFrameValue };
    }
    
}

module.exports.LuisRecognizerHelper = LuisRecognizerHelper;
