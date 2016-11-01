var saveQuote = function(quote, callback) {
  // Get the scores collection
  var col = db.collection('quotes');
  // Insert the quote
  col.insert({
      quoteId: quote.quoteId,
      userId: quote.userId
  }, function(err, result) {
      if (err) return callback(err);
      console.log("Inserted quote in the database", quote);
      callback(null, result);
  });
};

var controller = null;
var db = null;

module.exports = function(_controller, _db) {

  controller = _controller;
  db = _db;

  return {
    description: 'Saves a quote',
    command: 'addquote',
    bindSkills: function() {
      console.info('SKILLS: Bound \'addquote\' skills');
      controller.hears('addquote', ['direct_message','mention','direct_mention'], function(bot, message) {
        var quote = {
          quoteId: 1,
          userId: 1
        };
        saveQuote(quote, function(err) {
          bot.reply(message, 'Added a quote');
        });
      });
    }
  };
}