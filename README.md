# COVID-19 Positivity Bot

## Our Problem
Social media and news outlets love to focus too much on negative COVID-19 related news. This creates a negative effect on people all around the world, including but not limited to elevated levels of stress and anxiety.

## Our Solution
A Chat-bot that aims to help the user’s mental health through positivity, giving them resources to help ease the tension that these tough times bring.

### Features
- Good News Feed
 ... Fetches and displays the most upvoted posts from the r/Coronavirus subreddit flaired as **Good News** in a very friendly card for the user
- Mental Health care/Meditation Techniques
... Our bot guides the user through techniques for relaxation and anxiety relief
- Real-Time COVID-19 Statistics
... Cards with Real-Time statistics for a country of the users choice


## Prerequisites

- [Node.js](https://nodejs.org) version 10.14 or higher

    ```bash
    # determine node version
    node -v
    ```
- [BotFramework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases/tag/v4.9.0) to try out the bot locally

- Install the Bot Framework Emulator version 4.9.0 or greater from [here](https://github.com/Microsoft/BotFramework-Emulator/releases)

## To try our project

- Clone the repository

    ```bash
    git clone https://github.com/diegochll/msft-chatbot-challenge.git
    ```

- In a terminal, navigate to the folder created by the git clone

    ```bash
    cd msft-chatbot-challenge
    ```

- Install modules

    ```bash
    npm install
    ```

- Start the bot

    ```bash
    npm run watch
    ```

## Trying out the bot using Bot Framework Emulator

### Connect to the bot using Bot Framework Emulator

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`

Play around with the bot and enjoy!!!.

