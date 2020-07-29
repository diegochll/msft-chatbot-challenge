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
const covidStatisticsCard = require("../resources/covidStatisticsCard.json");
const ACData = require("adaptivecards-templating");

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
  }
  async finalStep(stepContext) {
    // User said "yes"
    if (stepContext.result) {
      const covidStatisticsDialog = this.findDialog(WATERFALL_DIALOG);
      return await stepContext.beginDialog(covidStatisticsDialog.id);
    }
    await stepContext.context.sendActivity(
      "I hope I have been helpful, have a good day!!",
      undefined,
      InputHints.IgnoringInput
    );

    return await stepContext.endDialog();
  }

  async createAdaptiveCard() {
    const template = new ACData.Template(
      CardFactory.adaptiveCard(covidStatisticsCard)
    );
    const card = template.expand({
      $root: {
        title: "Covid-19 Statistics",
        country: "Mexico",
        country_flag: "https://www.countryflags.io/MX/flat/64.png",
        time_frame: "Last Week",
        data: {
          confirmed: 2056055,
          deaths: 134178,
          recovered: 511019,
          active: 1410858,
        },
      },
    });
    await stepContext.context.sendActivity({
      attachments: [card],
    });
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
