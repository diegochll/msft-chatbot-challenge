/* eslint-disable */
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
const { ChoicePrompt, ComponentDialog, TextPrompt, ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const covidStatisticsCard = require('../resources/covidStatisticsCard.json');
const ACData = require('adaptivecards-templating');
const axios = require('axios');

const { countryLUT } = require('../resources/countryLUT.js');
const COVID_STATISTICS = 'CovidStatistics';
const WATERFALL_DIALOG = 'waterfallDialog';

class CovidStatistics extends ComponentDialog {
    constructor(id) {
        super(id || 'CovidStatistics');

        this.addDialog(new TextPrompt('countryPrompt',this.countryPromptValidator))
            .addDialog(new ChoicePrompt('timeFramePrompt'))
            .addDialog(new ConfirmPrompt('confirmPrompt'))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.countryStep.bind(this),
                this.timeFrameStep.bind(this),
                this.showDataStep.bind(this),
                this.finalStep.bind(this),
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    /**
     * If a country has not been provided, prompt for one.
     */
    async countryStep(stepContext) {
        const covidStatisticsDetails = stepContext.options;
        
        if (!covidStatisticsDetails.country) {
            const messageText = 'From which country do you want to know the statistics?';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt('countryPrompt', { prompt: msg, retryPrompt : 'Country not enlisted.' })
        }

        return await stepContext.next(covidStatisticsDetails.country);
    }

    /**
     * If an time frameStep has not been provided, prompt for one.
     */
    async timeFrameStep(stepContext) {
        if(!stepContext.options.country)
            stepContext.options.country=stepContext.result;
        
        let covidStatisticsDetails = stepContext.options;
        
        if (!covidStatisticsDetails.timeFrame) {
            const options = {
                prompt: 'Which time frame do you want to know? You can click or type the time frame',
                retryPrompt: 'That was not a valid choice, please select a time frame from 1 to 5.',
                choices: this.getChoices()
            };
            return await stepContext.prompt('timeFramePrompt', options);
        }
        return await stepContext.next(covidStatisticsDetails.timeFrame);
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async showDataStep(stepContext) {
        if(!stepContext.options.timeFrame && stepContext.result)
            stepContext.options.timeFrame=stepContext.result.value;
        
        
        let covidStatisticsDetails = stepContext.options;
        await stepContext.context.sendActivity({ attachments: [await this.createAdaptiveCard(covidStatisticsDetails)] });
        
        return await stepContext.prompt('confirmPrompt', 'Do you want to know information about another country?', ['yes', 'no']);
    }

    async finalStep(stepContext) {
        // User said "yes" 
        if (stepContext.result) {
            const covidStatisticsDialog = this.findDialog(WATERFALL_DIALOG);
            return await stepContext.beginDialog(covidStatisticsDialog.id);
        }   
        await stepContext.context.sendActivity('I hope I have been helpful, have a good day!!', undefined, InputHints.IgnoringInput);
           
        return await stepContext.endDialog();
    }

    async createAdaptiveCard(covidStatisticsDetails) {
        covidStatisticsDetails.country=covidStatisticsDetails.country.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
        const template = new ACData.Template(CardFactory.adaptiveCard(covidStatisticsCard));
        return this.getAPIData(covidStatisticsDetails).then(response => {
            const card = template.expand({
                $root: {
                    "title": "Covid-19 Statistics",
                    "country": covidStatisticsDetails.country,
                    "country_flag": "https://www.countryflags.io/"+countryLUT[covidStatisticsDetails.country]+"/flat/64.png",
                    "time_frame": covidStatisticsDetails.timeFrame,
                    "data": {
                        "confirmed": response.confirmed.toLocaleString(),
                        "deaths": response.deaths.toLocaleString(),
                        "recovered": response.recovered.toLocaleString(),
                        "rate_new_cases": (response.rate_new_cases.toFixed(4)*100)+"%"
                    }
                }
            });
            return card;
        })
        .catch(error => {
            console.log(error);
        });
    }

    getChoices() {
        const timeFrameOptions = [
            {
                value: 'Today',
            },
            {
                value: 'Last Week'
            },
            {
                value: 'Last Two Weeks'
            },
            {
                value: 'Last Month'
            },
            {
                value: 'Overall'
            }
        ];

        return timeFrameOptions;
    }

    getAPIData(covidStatisticsDetails){
        covidStatisticsDetails.country=covidStatisticsDetails.country.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
    
        
        const todayDate = new Date();
        const queryDate = todayDate.getDate() - 7;

        return axios.get('https://api.thevirustracker.com/free-api?countryTimeline='+countryLUT[covidStatisticsDetails.country])
        .then(response => {
            
            let index=0;let overallFlag=false;
            let timeFrame= covidStatisticsDetails.timeFrame;
           
            if(Array.isArray(covidStatisticsDetails.timeFrame)){
                timeFrame=covidStatisticsDetails.timeFrame[0];
            }else{
                timeFrame=covidStatisticsDetails.timeFrame;
            }
           
            switch(timeFrame){
                case 'today':
                    index=1;
                break;
                case 'overall':
                    overallFlag=true;
                break;
                case 'last two weeks':
                    index=15;
                break;
                case 'last month':
                    index=32;
                break;
                case 'last week':
                    index=8;
                break; 
            }
            const datesAvailable=Object.keys(response.data.timelineitems[0]);
           
            if(overallFlag){
                return {
                    confirmed: response.data.timelineitems[0][datesAvailable[datesAvailable.length-3]].total_cases,
                    deaths: response.data.timelineitems[0][datesAvailable[datesAvailable.length-3]].total_deaths,
                    recovered: response.data.timelineitems[0][datesAvailable[datesAvailable.length-3]].total_recoveries,
                    rate_new_cases:(response.data.timelineitems[0][datesAvailable[datesAvailable.length-4]].new_daily_cases !=0 ? 
                                (response.data.timelineitems[0][datesAvailable[datesAvailable.length-3]].new_daily_cases /
                                response.data.timelineitems[0][datesAvailable[datesAvailable.length-4]].new_daily_cases ): 0 )
                    };
            }else{
                return {
                    confirmed: response.data.timelineitems[0][datesAvailable[datesAvailable.length-3]].total_cases-
                                response.data.timelineitems[0][datesAvailable[datesAvailable.length-3-index]].total_cases,
                    deaths: response.data.timelineitems[0][datesAvailable[datesAvailable.length-3]].total_deaths-
                                response.data.timelineitems[0][datesAvailable[datesAvailable.length-3-index]].total_deaths,
                    recovered: response.data.timelineitems[0][datesAvailable[datesAvailable.length-3]].total_recoveries-
                                response.data.timelineitems[0][datesAvailable[datesAvailable.length-3-index]].total_recoveries,
                    rate_new_cases:(response.data.timelineitems[0][datesAvailable[datesAvailable.length-4]].new_daily_cases !=0 ? 
                                (response.data.timelineitems[0][datesAvailable[datesAvailable.length-3]].new_daily_cases /
                                response.data.timelineitems[0][datesAvailable[datesAvailable.length-4]].new_daily_cases ): 0 )
                };
            }
        })
        .catch(error => {
            console.log(error);
        });
    }

    async countryPromptValidator(promptContext) {
        if(!promptContext.recognized.succeeded)
            return false;

        let country=promptContext.recognized.value;
        country=country.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
        
        if(!country || !countryLUT.hasOwnProperty(country)){
            return false;
        }
        
        return true;
    }

}

module.exports.CovidStatistics = CovidStatistics;
