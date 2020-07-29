// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require('botbuilder');
const { ChoicePrompt, ComponentDialog, TextPrompt, ConfirmPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { AttachmentLayoutTypes, CardFactory } = require('botbuilder');
const AdaptiveCard = require('../resources/adaptiveCard.json');
const COVID_STATISTICS = 'CovidStatistics';
const WATERFALL_DIALOG = 'waterfallDialog';

class Greet extends ComponentDialog {
    constructor(id) {
        super(id || 'Greet');

        this.addDialog(new ChoicePrompt('featureOptionsPrompt'))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.greetStep.bind(this),
                this.redirectStep.bind(this),
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async greetStep(stepContext) {
         const options = {
            prompt: 'Hello, I am XXX. Which of my features are you interested in?',
            retryPrompt: 'That was not a valid choice, please select a valid feature.',
            choices: this.getChoices()
        };
        return await stepContext.prompt('featureOptionsPrompt', options);    
    }
    async redirectStep(stepContext) {
        console.log(stepContext.result.value)
        switch (stepContext.result.value) {
            case 'Covid Statistics':
                return stepContext.next('Covid Statistics');
            default: {
                return stepContext.endDialog();
            }
        }
    }

    getChoices() {
        const featuresOptions = [
            {
                value: 'Covid Statistics',
            },
            {
                value: 'Relax',
            },
            {
                value: 'Hear Good News',
            }
        ];

        return featuresOptions;
    }
}

module.exports.Greet = Greet;
