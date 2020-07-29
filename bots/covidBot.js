//COVID EDUCATION BOT

const { ActivityHandler } = require('botbuilder');
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');

class covidBot extends ActivityHandler{
  /**
     *
     * @param {ConversationState} conversationState
     * @param {UserState} userState
     * @param {Dialog} dialog
     */
    constructor(conversationState, userState, dialog) {
        super();
        if (!conversationState) throw new Error('[DialogBot]: Missing parameter. conversationState is required');
        if (!userState) throw new Error('[DialogBot]: Missing parameter. userState is required');
        if (!dialog) throw new Error('[DialogBot]: Missing parameter. dialog is required');

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');
      
        this.onMessage(async (context, next) => {
            console.log('Running dialog with Message Activity.');

            // Run the Dialog with the new message Activity.
            await this.dialog.run(context, this.dialogState);

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

    }

    /**
     * Override the ActivityHandler.run() method to save state changes after the bot logic completes.
    */
    async run(context) {
        await super.run(context);

        // Save any state changes. The load happened during the execution of the Dialog.
        await this.conversationState.saveChanges(context, false);
        await this.userState.saveChanges(context, false);
    }
}

module.exports.covidBot = covidBot;

/*
const reddit = require('../reddit-config');

reddit.api.get('/r/Coronavirus/search?q=flair_name%3A"Good%20News"&restrict_sr=1&t=day&sort=top', {})
.then(function(response) {
   console.log(response[1].data.children[0]) 
})
.catch(function(err) {
    console.log("Error getting karma: ", err);
})
*/