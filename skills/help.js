module.exports = function(controller) {
  return {
    description: 'Shows a list of commands I can execute',
    command: 'help',
    bindSkills: function() {
      console.info('SKILLS: Bound \'help\' skills');
      controller.hears('help', ['direct_message','mention','direct_mention'], function(bot, message) {
        bot.reply(message, 'Help!');
      });

      controller.hears('interactive', 'direct_message', function(bot, message) {
        bot.reply(message, {
          attachments:[
            {
              title: 'Do you want to interact with my buttons?',
              callback_id: '123',
              attachment_type: 'default',
              actions: [
                {
                  "name":"yes",
                  "text": "Yes",
                  "value": "yes",
                  "type": "button",
                },
                {
                  "name":"no",
                  "text": "No",
                  "value": "no",
                  "type": "button",
                }
              ]
            }
          ]
        });
      });
    }
  };
}