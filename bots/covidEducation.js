//COVID EDUCATION BOT

const { ActivityHandler } = require('botbuilder');
const { LuisRecognizer, QnAMaker } = require('botbuilder-ai');

class covidEducation extends ActivityHandler{

}
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