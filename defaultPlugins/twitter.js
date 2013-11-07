/*
 * Twitter Plugin!
 */

var Twit = require("twit"),
    config = require("../botConfig.json"),
    _ = require("lodash"),
    messageHistory = {},
    twit;

var twit = new Twit(config.pluginConfig.twitter);

function postTweet(message, cb) {
  if (message.substr(7).length > 140) {
    cb(new Error("Too Long"));
    return;
  }

  twit.post("statuses/update", {status: message}, function (error, reply) {
    if (error) {
      cb("Something went wrong.  Here is the error though: " + message);
      return;
    }

    console.log(JSON.stringify(reply));
    cb(null);
  });
}

function postTweetAndTellUser(client, from, to, message) {
  postTweet(message, function (error) {
    if (error) {
      if (error.message === "Too Long") {
        client.say(to, "Because Twitter is stupid, you can't make a post that is more than 140 characters.  So, sorry, I can't post that for you, " + from);
      }
      else {
        client.say(to, error.message);
      }

      return;
    }

    client.say(to, "Congrats!  You have now added more tweets to the twittersphere ...or whatever you kids call it now.  Check it out at " + config.pluginConfig.twitter.twitterUrl);
  });
}

function twitter(from, to, text, client) {
  if (text.substr(0, 7) === "!tweet ") {
    postTweetAndTellUser(client, from, to, text.substr(7));
  }
  else if (text.substr(0, 11) === "!tweetUser ") {
    if (_.isUndefined(messageHistory[to][text.substr(11)])) {
      client.say(to, from + ", you are stupid!  That user has never typed anything since I last was turned on!");
    }
    else {
      postTweetAndTellUser(client, from, to, messageHistory[to][text.substr(11)]);
    }
  }
  else {
    // Log the messages for the tweet last post feature
    if (_.isUndefined(messageHistory[to])) {
      messageHistory[to] = {};
    }

    messageHistory[to][from] = text;
  }
}

module.exports = twitter;
