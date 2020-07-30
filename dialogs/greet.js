/* eslint-disable */

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { InputHints, MessageFactory } = require("botbuilder");
const {
  ChoicePrompt,
  ComponentDialog,
  TextPrompt,
  ConfirmPrompt,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const { AttachmentLayoutTypes, CardFactory } = require("botbuilder");
const COVID_STATISTICS = "CovidStatistics";
const WATERFALL_DIALOG = "waterfallDialog";

class Greet extends ComponentDialog {
  constructor(id) {
    super(id || "Greet");

    this.addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [this.greetStep.bind(this)])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  async greetStep(stepContext) {
    await stepContext.context.sendActivity(
      "Hello, I the COVID-19 Positivity Bot. Nice to meet you!",
      undefined,
      InputHints.IgnoringInput
    );
    await stepContext.context.sendActivity(
      "Would you like some Relaxation Techniques? Maybe get some good news about COVID ? Or look up statistics on a country of your choice ?",
      undefined,
      InputHints.IgnoringInput
    );

    return stepContext.endDialog();
  }
}

module.exports.Greet = Greet;
