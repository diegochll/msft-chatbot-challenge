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
      "Hello, I am positivity COVID Bot. Nice to meet you!",
      undefined,
      InputHints.IgnoringInput
    );
    await stepContext.context.sendActivity(
      "Would you like to relax, learn  good news about coronavirus, or get statistics on coronavirus?",
      undefined,
      InputHints.IgnoringInput
    );

    return stepContext.endDialog();
  }
}

module.exports.Greet = Greet;
