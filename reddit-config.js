var RedditAPI = require('reddit-wrapper-v2');

var redditConnection = new RedditAPI({
    username: 'CovidChatBot',
    password: 'MSFT-SLCC-2020',
    app_id: 'S64XB0zUQoxL3w',
    api_secret: 'FDObXptXzLodhDCprCvTBvPTDTo',
    user_agent: 'my user agent',
    retry_on_wait: true,
    retry_on_server_error: 5,
    retry_delay: 1,
    logs:true
});

module.exports = redditConnection;