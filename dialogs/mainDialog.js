// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { AttachmentLayoutTypes, CardFactory, InputHints } = require('botbuilder');
const { ChoicePrompt, ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');
const AdaptiveCard = require('../resources/adaptiveCard.json');
const { CovidStatistics } = require('./covidStatistics');
const { Greet } = require('./greet');
const { GoodNews } = require('./goodNews');
const { LuisRecognizer } = require('botbuilder-ai');

const { ActivityTypes } = require('botbuilder-core');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
const COVID_STATISTICS = 'CovidStatistics';
const GOODNEWS = 'GoodNews';
const GREET = 'Greet';

class MainDialog extends ComponentDialog {
    constructor(luis) {
        super('MainDialog');

        this.luis_=luis;
        // Define the main dialog and its related components.
        this.addDialog(new CovidStatistics());
        this.addDialog(new Greet());
        this.addDialog(new GoodNews());
        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.processActivity.bind(this)
        ]));

        // The initial child Dialog to run.
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        console.log("Run --- ")
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async processActivity(stepContext) {
        // A skill can send trace activities, if needed.
        const traceActivity = {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            text: 'ActivityRouterDialog.processActivity()',
            label: `Got activityType: ${ stepContext.context.activity.type }`
        };
        await stepContext.context.sendActivity(traceActivity);

        switch (stepContext.context.activity.type) {
            case ActivityTypes.Event:
                return await this.onEventActivity(stepContext);
            case ActivityTypes.Message:
                return await this.onMessageActivity(stepContext);
            default:
                // Catch all for unhandled intents.
                await stepContext.context.sendActivity(
                    `Unrecognized ActivityType: "${ stepContext.context.activity.type }".`,
                    undefined,
                    InputHints.IgnoringInput
                );
                return { status: DialogTurnStatus.complete };
        }
        
    }

    /**
    * This method performs different tasks based on event name.
    */
    async onEventActivity(stepContext) {
        const activity = stepContext.context.activity;
        const traceActivity = {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            text: 'ActivityRouterDialog.onEventActivity()',
            label: `Name: ${ activity.name }, Value: ${ JSON.stringify(activity.value) }`
        };
        await stepContext.context.sendActivity(traceActivity);

        // Resolve what to execute based on the event name.
        switch (activity.name) {
            case 'CovidStatistics':
                return await this.beginCovidStatistics(stepContext);
            case 'Greet':
                return await this.beginGreet(stepContext);
            case 'GoodNews':
                    return await this.beginGoodNews(stepContext);
            default:
                // We didn't get an event name we can handle.
                await stepContext.context.sendActivity(
                    `Unrecognized EventName: "${ stepContext.context.activity.name }".`,
                    undefined,
                    InputHints.IgnoringInput
                );
                return { status: DialogTurnStatus.complete };
        }
    }

    /**
    * This method just gets a message activity and runs it through LUIS.
    */
    async onMessageActivity(stepContext) {
        const activity = stepContext.context.activity;
        const traceActivity = {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            text: 'ActivityRouterDialog.onMessageActivity()',
            label: `Text: ${ activity.text }, Value: ${ JSON.stringify(activity.value) }`
        };
        await stepContext.context.sendActivity(traceActivity);

        if (!this.luis_ || !this.luis_.isConfigured) {
            await stepContext.context.sendActivity(
                'NOTE: LUIS is not configured. To enable all capabilities, please add \'LuisAppId\', \'LuisAPIKey\' and \'LuisAPIHostName\' to the appsettings.json file.',
                undefined,
                InputHints.IgnoringInput
            );
        } else {
            // Call LUIS with the utterance.
            const luisResult = await this.luis_.executeLuisQuery(stepContext.context);
            const topIntent = LuisRecognizer.topIntent(luisResult);

            /*
            // Create a message showing the LUIS result.
            let resultString = '';
            resultString += `LUIS results for "${ activity.text }":\n`;
            resultString += `Intent: "${ topIntent }", Score: ${ luisResult.intents[topIntent].score }\n`;

            await stepContext.context.sendActivity(resultString, undefined, InputHints.IgnoringInput);
            */

            switch (topIntent) {
                case 'CovidStatistics':
                    return await this.beginCovidStatistics(stepContext);
                case 'Greet':
                    return await this.beginGreet(stepContext);
                case 'GoodNews':
                    return await this.beginGoodNews(stepContext);
                default: {
                    // Catch all for unhandled intents.
                    const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${ topIntent.intent })`;
                    await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
                    break;
                }
            }
        }
        return { status: DialogTurnStatus.complete };
    }

    async beginCovidStatistics(stepContext) {
        console.log("Begin Covid Stats")
        const activity = stepContext.context.activity;
        const covidStatisticsDetails = activity.value || {};
        // Start the covidStatistics dialog.
        const covidStatisticsDialog = this.findDialog(COVID_STATISTICS);
        return await stepContext.beginDialog(covidStatisticsDialog.id, covidStatisticsDetails);
    }
    
    async beginGreet(stepContext) {
        const activity = stepContext.context.activity;
        const greetDetails = activity.value || {};

        // Start the covidStatistics dialog.
        const greetDialog = this.findDialog(GREET);
        return await stepContext.beginDialog(greetDialog.id, greetDetails);
    }
    
    async beginGoodNews(stepContext) {
        console.log("Good News Started")
        const activity = stepContext.context.activity;
        const goodNewsDetails = activity.value || {};

        // Start the covidStatistics dialog.
        const goodNewsDialog = this.findDialog(GOODNEWS);
        return await stepContext.beginDialog(goodNewsDialog.id, goodNewsDetails);
    }
}

module.exports.MainDialog = MainDialog;
