/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');
var MongoClient = require('mongodb').MongoClient
var assert = require('assert');

var controller = null;
var skills = null;
var db = null;

/**
 * Validate the requirements for starting up the bot
 */
var doStartupValidation = function() {
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT) {
    console.log('Error: Specify clientId, clientSecret and port in environment');
    process.exit(1);
  }
}

var initDbConnection = function(callback) {
  console.log("Setting up a connection to MongoDB");

  var DB_USER = process.env.DB_USER;
  var DB_PASSWORD = process.env.DB_PASSWORD;
  var DB_URL = process.env.DB_URL;
  var DB_PORT = process.env.DB_PORT;
  var DB_NAME = process.env.DB_NAME;
  // Connection URL 
  var url = 'mongodb://' + DB_USER + ':' + DB_PASSWORD + '@' + DB_URL + ':' + DB_PORT + '/' + DB_NAME;
  // Use connect method to connect to the Server 
  MongoClient.connect(url, function(err, db) {
    db = db;
    assert.equal(null, err);
    console.log("Connected successfully to MongoDB");
    callback();
  });
}

/**
 * Initialize the Botkit controller
 */
var initController = function() {
  controller = module.exports.controller = Botkit.slackbot({
    json_file_store: './db_quotebot/',
  }).configureSlackApp(
    {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scopes: ['bot']
    }
  );
};

/**
 * Start up the webserver and join the channels
 */
var initWebServer = function() {
  // Set up the webserver
  controller.setupWebserver(process.env.PORT, function(err,webserver) {
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

var initWebsockets = function() {
  // Handle events related to the websocket connection to Slack
  controller.on('rtm_open',function(bot) {
    console.log('** The RTM api just connected!');
  });

  controller.on('rtm_close',function(bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
  });
}

/**
 * Initialize the bot's skills
 */
var initSkills = function() {
  // Load all skills
  var normalizedPath = require("path").join(__dirname, "skills") + "/";
  require("fs").readdirSync(normalizedPath).forEach(function(file) {
    // Load each skill and pass it the controller to further initialize with
    var skill = require(normalizedPath + file.split('.js')[0])(controller, db);
    skill.bindSkills();
  });
};

/**
 * Initialize the Botkit bot
 */
var initBot = function() {
  doStartupValidation();
  initDbConnection(function() {
    initController();
    initWebServer();
    initWebsockets();
    initSkills();
  });
};

initBot();