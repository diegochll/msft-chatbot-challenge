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
const AdaptiveCard = require("../resources/goodNewsCard.json");
const reddit = require("../reddit-config");

const COVID_STATISTICS = "CovidStatistics";
const WATERFALL_DIALOG = "waterfallDialog";

class GoodNews extends ComponentDialog {
  constructor(id) {
    super(id || "GoodNews");

    let response = reddit.api.get(
      '/r/Coronavirus/search?q=flair_name%3A"Good%20News"&restrict_sr=1&t=day&sort=top',
      {}
    );
    this.addDialog(new TextPrompt("countryPrompt"))
      .addDialog(new ChoicePrompt("timeFramePrompt"))
      .addDialog(new ConfirmPrompt("confirmPrompt"))
      .addDialog(
        new WaterfallDialog(WATERFALL_DIALOG, [
          this.showCard.bind(this, response),
        ])
      );

    this.initialDialogId = WATERFALL_DIALOG;
  }

  createAdaptiveCard(data, i) {
    let post = {
      title: data[i].data.title,
      thumbnail: data[i].data.thumbnail,
      newsUrl: data[i].data.url,
      created: data[i].data.created_utc,
    };

    //let shuffled = topGoodNews.sort(function(){return .5 - Math.random()});
    //let topNews = shuffled.slice(0,3);
    let dateCreated = new Date(0);
    dateCreated.setUTCSeconds(post.created);
    

    AdaptiveCard.body[1].items[0].url = post.thumbnail;
    AdaptiveCard.body[1].items[1].text = post.title;
    AdaptiveCard.body[1].items[2].text = dateCreated.toDateString();
    //AdaptiveCard.body[2].text = post.created;
    AdaptiveCard.actions[0].url = post.newsUrl;
    //  console.log(AdaptiveCard)
    return CardFactory.adaptiveCard(AdaptiveCard);
  }

  async showCard(response, stepContext) {
    const covidStatisticsDetails = stepContext.options;
    //console.log(response._rejectionHandler0[1].data)
    let data = response._rejectionHandler0[1].data.children;
    data = data.slice(0, 10);
    let shuffled = data.sort(function () {
      return 0.5 - Math.random();
    });
    let topNews = shuffled.slice(0, 3);

    await stepContext.context.sendActivity({
      attachments: [this.createAdaptiveCard(topNews, 0)],
    });
    await stepContext.context.sendActivity({
      attachments: [this.createAdaptiveCard(topNews, 1)],
    });
    await stepContext.context.sendActivity({
      attachments: [this.createAdaptiveCard(topNews, 2)],
    });
    await stepContext.context.sendActivity(
      "Hope this 3 Good News can cheer you up a bit! :)"
    );
    return await stepContext.endDialog();
  }
}

module.exports.GoodNews = GoodNews;
