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
const AdaptiveCard = require("../resources/adaptiveCard.json");

const COVID_STATISTICS = "CovidStatistics";
const WATERFALL_DIALOG = "waterfallDialog";

class CovidStatistics extends ComponentDialog {
  constructor(id) {
    super(id || "CovidStatistics");

    this.addDialog(new TextPrompt("countryPrompt"))
      .addDialog(new ChoicePrompt("timeFramePrompt"))
      .addDialog(new ConfirmPrompt("confirmPrompt"))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.countryStep.bind(this),
          this.timeFrameStep.bind(this),
          this.showDataStep.bind(this),
          this.finalStep.bind(this),
        ])
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * If a country has not been provided, prompt for one.
   */
  async countryStep(stepContext) {
    const covidStatisticsDetails = stepContext.options;

    if (!covidStatisticsDetails.country) {
      const messageText =
        "From which country do you want to know the statistics?";
      const msg = MessageFactory.text(
        messageText,
        messageText,
        InputHints.ExpectingInput
      );
      return await stepContext.prompt("countryPrompt", { prompt: msg });
    } else {
      //LuisVerification
    }
    return await stepContext.next(covidStatisticsDetails.country);
  }

  /**
   * If an time frameStep has not been provided, prompt for one.
   */
  async timeFrameStep(stepContext) {
    const covidStatisticsDetails = stepContext.options;

    if (!covidStatisticsDetails.timeFrame) {
      const options = {
        prompt:
          "Which time frame do you want to know? You can click or type the time frame",
        retryPrompt:
          "That was not a valid choice, please select a time frame from 1 to 5.",
        choices: this.getChoices(),
      };
      return await stepContext.prompt("timeFramePrompt", options);
    }
    return await stepContext.next(covidStatisticsDetails.timeFrame);
  }

  /**
   * Complete the interaction and end the dialog.
   */
  async showDataStep(stepContext) {
    const covidStatisticsDetails = stepContext.options;

    await stepContext.context.sendActivity({
      attachments: [this.createAdaptiveCard()],
    });

    return await stepContext.prompt(
      "confirmPrompt",
      "Do you want to know information about another country?",
      ["yes", "no"]
    );
  }

  async finalStep(stepContext) {
    // User said "yes"
    if (stepContext.result) {
      // Start the covidStatistics dialog.
      const covidStatisticsDialog = this.findDialog(COVID_STATISTICS);
      return await stepContext.beginDialog(
        covidStatisticsDialog.id,
        covidStatisticsDetails
      );
    }
    return await stepContext.endDialog();
  }

  createAdaptiveCard() {
    return CardFactory.adaptiveCard(AdaptiveCard);
  }

  getChoices() {
    const timeFrameOptions = [
      {
        value: "Today",
        synonyms: ["today"],
      },
      {
        value: "Last Week",
        synonyms: ["last week"],
      },
      {
        value: "Last two Weeks",
        synonyms: ["last two weeks"],
      },
      {
        value: "Last Month",
        synonyms: ["last month"],
      },
      {
        value: "Overall",
        synonyms: ["overall"],
      },
    ];

    return timeFrameOptions;
  }
}

module.exports.CovidStatistics = CovidStatistics;
