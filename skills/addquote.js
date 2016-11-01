module.exports = function(controller) {
  return {
    description: 'Saves a quote',
    command: 'addquote',
    bindSkills: function() {
      console.info('SKILLS: Bound \'addquote\' skills');
      controller.hears('addquote', ['direct_message','mention','direct_mention'], function(bot, message) {
        bot.reply(message, 'Adding a quote');
      });
    }
  };
}