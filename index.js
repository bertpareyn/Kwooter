/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');
var controller = null;
var skills = null;

/**
 * Validate the requirements for starting up the bot
 */
var doStartupValidation = function() {
  if (!process.env.clientId || !process.env.clientSecret || !process.env.port) {
    console.log('Error: Specify clientId, clientSecret and port in environment');
    process.exit(1);
  }
}

/**
 * Initialize the Botkit controller
 */
var initController = function() {
  controller = module.exports.controller = Botkit.slackbot({
    json_file_store: './db_slackbutton_bot/',
  }).configureSlackApp(
    {
      clientId: process.env.clientId,
      clientSecret: process.env.clientSecret,
      scopes: ['bot'],
    }
  );
};

/**
 * Start up the webserver and join the channels
 */
var initWebServer = function() {
  // Set up the webserver
  controller.setupWebserver(process.env.port,function(err,webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
      if (err) {
        res.status(500).send('ERROR: ' + err);
      } else {
        res.send('Success!');
      }
    });
  });


  // just a simple way to make sure we don't
  // connect to the RTM twice for the same team
  var _bots = {};
  function trackBot(bot) {
    _bots[bot.config.token] = bot;
  }

  // Create the bot in the channel
  controller.on('create_bot',function(bot,config) {

    if (_bots[bot.config.token]) {
      // already online! do nothing.
    } else {
      bot.startRTM(function(err) {
        if (!err) trackBot(bot);
        bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
          if (err) {
            console.log(err);
          } else {
            convo.say('I am a bot that has just joined your team');
            convo.say('You must now /invite me to a channel so that I can be of use!');
          }
        });
      });
    }
  });

  controller.storage.teams.all(function(err,teams) {
    if (err) {
      throw new Error(err);
    }

    // connect all teams with bots up to slack!
    for (var t  in teams) {
      if (teams[t].bot) {
        controller.spawn(teams[t]).startRTM(function(err, bot) {
          if (err) {
            console.log('Error connecting bot to Slack:',err);
          } else {
            trackBot(bot);
          }
        });
      }
    }
  });
};

/**
 * Initialize the bot's skills
 */
var initSkills = function() {
  // Load all skills
  var normalizedPath = require("path").join(__dirname, "skills") + "/";
  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    // Load each skill and pass it the controller to further initialize with
    var skill = require(normalizedPath + file.split('.js')[0])(controller);
    skill.bindSkills();
  });
};

/**
 * Initialize the Botkit bot
 */
var initBot = function() {
  doStartupValidation();
  initController();
  initWebServer();
  initSkills();
};

initBot();