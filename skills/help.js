module.exports = function(controller) {
  return {
    description: 'Shows a list of commands I can execute',
    command: 'help',
    bindSkills: function() {
      console.info('SKILLS: Bound \'help\' skills');
      controller.hears('help', ['direct_message','mention','direct_mention'], function(bot, message) {
        bot.reply(message, 'Help!');
      });
    }
  };
}