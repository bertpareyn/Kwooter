# Kwooter
## Run the bot
Create a Slack app. Make sure to configure the bot user!
- https://api.slack.com/applications/new
- Add the Redirect URI: http://localhost:3000/oauth

Run your bot from the command line:
`clientId=<my client id> clientSecret=<my client secret> port=3000 node index.js`

## Use the bot
Add the app to your Slack by visiting the login page:
- http://localhost:3000/login

After you've added the app, try talking to your bot!

## Extend the bot
Botkit has many features for building cool and useful bots!
Read all about it here:
- https://howdy.ai/botkit
