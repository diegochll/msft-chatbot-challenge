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
const RELAX = "Relax";
const WATERFALL_DIALOG = "waterfallDialog";

class Relax extends ComponentDialog {
  constructor(id) {
    super(id || "Relax");

    this.addDialog(new ChoicePrompt("relaxChoiceStep")).addDialog(
      new WaterfallDialog(WATERFALL_DIALOG, [
        this.relaxChoiceStep.bind(this),
        this.showRelaxCard.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * If an time frameStep has not been provided, prompt for one.
   */
  async relaxChoiceStep(stepContext) {
    console.log(stepContext);
    const relaxChoiceDetails = stepContext.options;
    const options = {
      prompt: "How would you like to relax?",
      retryPrompt:
        "That was not a valid choice, please select a time frame from 1 to 5.",
      choices: this.getChoices(),
    };
    return await stepContext.prompt("relaxChoiceStep", options);
  }

  async showRelaxCard(stepContext) {
    switch (stepContext.result.value) {
      case "Relax Video Card":
        await stepContext.context.sendActivity({
          attachments: [this.createRelaxVideoCard()],
        });
        break;
      case "Meditate Card":
        await stepContext.context.sendActivity({
          attachments: [this.createRelaxMeditateCard()],
        });
        break;
      case "Breathing Card":
        await stepContext.context.sendActivity({
          attachments: [this.createRelaxBreathingCard()],
        });
        break;
      case "Tensing Card":
        await stepContext.context.sendActivity({
          attachments: [this.createRelaxTensingCard()],
        });
        break;
      case "Audioguide Card":
        await stepContext.context.sendActivity({
          attachments: [this.createRelaxAudioCard()],
        });
        break;
    }
    await stepContext.context.sendActivity(
      "Type anything if you'd like to continue to another relaxation exercise"
    );

    return await stepContext.endDialog();
  }

  /**
   * Complete the interaction and end the dialog.
   */

  createAdaptiveCard() {
    return CardFactory.adaptiveCard(AdaptiveCard);
  }

  getChoices() {
    const relaxOptions = [
      {
        value: "Relax Video Card",
        synonyms: ["relax"],
      },
      {
        value: "Meditate Card",
        synonyms: ["meditate"],
      },
      {
        value: "Breathing Card",
        synonyms: ["breath"],
      },
      {
        value: "Tensing Card",
        synonyms: ["tense"],
      },
      {
        value: "Audioguide Card",
        synonyms: ["audioguide"],
      },
      {
        value: "All Cards",
        synonyms: ["all"],
      },
    ];

    return relaxOptions;
  }

  createRelaxVideoCard() {
    return CardFactory.videoCard(
      "Music might help improve your mood.",
      [{ url: "https://www.youtube.com/watch?v=lFcSrYw-ARY" }],
      [
        {
          type: "openUrl",
          title: "Learn More",
          value: "https://www.youtube.com/watch?v=lFcSrYw-ARY",
        },
      ],
      {
        subtitle: "Calm your mind with some soothing music.",
        text: "Take a moment to empty your mind as you listen to this music.",
      }
    );
  }

  createRelaxMeditateCard() {
    return CardFactory.heroCard(
      "Would you like to try meditation?",
      CardFactory.images([
        "https://upload.wikimedia.org/wikipedia/commons/b/b3/Meditation_%287912377858%29.jpg",
      ]),
      CardFactory.actions([
        {
          type: "openUrl",
          title: "Get started",
          value:
            "https://www.headspace.com/meditation/meditation-for-beginners",
        },
      ])
    );
  }

  createRelaxBreathingCard() {
    return CardFactory.animationCard(
      "Let's try taking ten deep breaths.",
      [{ url: "https://media.giphy.com/media/8YfwmT1T8PsfC/source.gif" }],
      [],
      {
        subtitle: "With each exhale, allow the tension leave your body.",
      }
    );
  }

  createRelaxTensingCard() {
    return CardFactory.animationCard(
      "This too will pass.",
      [{ url: "https://media.giphy.com/media/3ohhwNqFMnb7wZgNnq/source.gif" }],
      [],
      {
        text:
          "Tense everything in your whole body, stay with that tension. Hold it as long as you can without feeling pain. Slowly release the tension and very gradually feel it leave your body. Repeat three times.",
      }
    );
  }

  createRelaxAudioCard() {
    return CardFactory.audioCard(
      "Try a progressive muscle relaxation technique.",
      [
        "https://www.evergreenhealth.com/mpeg/Well_9_Progressive_Muscle_Relaxation_SHORT.mp3",
      ],
      CardFactory.actions([
        {
          type: "openUrl",
          title: "See other relaxation audio guides.",
          value: "https://www.healthiestbest.com/relaxation",
        },
      ]),
      {
        subtitle: "Follow this step-by-step audio guide.",
      }
    );
  }
}

module.exports.Relax = Relax;
