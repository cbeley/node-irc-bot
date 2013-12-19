/*
 * Twitter Plugin!
 */

var Twit = require("twit"),
    config = require("../botConfig.json"),
    _ = require("lodash"),
    db = require("../lib/db.js"),
    utils = require("../lib/utils.js")(config),
    messageHistory = {},
    twit, allowList = null, lastPublicNotice = null;

twit = new Twit(config.pluginConfig.twitter);

function updateDb() {
  if (allowList.length !== 0) {
    db.put("twitterAllowList", allowList);
  }
  else {
    db.del("twitterAllowList");
  }
}

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

function postTweetAndTellUser(client, from, to, message, sendPMonly) {
  postTweet(message, function (error) {
    if (error) {
      if (error.message === "Too Long") {
        client.say(from, "Because Twitter is stupid, you can't make a post that is more than 140 characters.  So, sorry, I can't post that for you, " + from);
      }
      else {
        client.say(from, error.message);
      }

      return;
    }

    client.say(sendPMonly ? from : to, "Tweeted! Check it out at " + config.pluginConfig.twitter.twitterUrl);

    if (!sendPMonly) {
      lastPublicNotice = Date.now();
    }
  });
}

function userCanUseTwitter(from, client) {
  if (config.pluginConfig.twitter.useWhitelist && !_.contains(allowList, from) && (from !== config.connectionConfig.adminUser)) {
    client.say(from, "Sorry, you arn't on the list of approved users for using twitter. You should speak with " + config.connectionConfig.adminUser);
    return false;
  }

  return true;
}

function handleAvailableCommands(from, to, text, client) {
  var cmds, sendPMonly = true;

  if (!lastPublicNotice || (((Date.now() - lastPublicNotice) > config.pluginConfig.twitter.publicNoticeThrottle))) {
    sendPMonly = false;
  }

  cmds = {
    tweet: function () {
      if (userCanUseTwitter(from, client)) {
        postTweetAndTellUser(client, from, to, text.substr(7), sendPMonly);
      }
    },

    tweetUser: function () {
      if (userCanUseTwitter(from, client)) {
        if (_.isUndefined(messageHistory[to]) || _.isUndefined(messageHistory[to][text.substr(11)])) {
          client.say(from, from + ", you are stupid!  That user has never typed anything since I last was turned on!");
        }
        else {
          postTweetAndTellUser(client, from, to, messageHistory[to][text.substr(11)], sendPMonly);
        }
      }
    },

    addUser: function () {
      if (from !== config.connectionConfig.adminUser) {
        client.say(from, "Sorry, only my admin, " + config.connectionConfig.adminUser + ", can do that!");
        return;
      }

      allowList.push(text.substr(9));
      updateDb();
      client.say(to, text.substr(9) + " can now send tweets using !tweet and !tweetUser");
      return;
    },

    removeUser: function () {
      if (from !== config.connectionConfig.adminUser) {
        client.say(from, "Sorry, only my admin, " + config.connectionConfig.adminUser + ", can do that!");
        return;
      }

      allowList = _.without(allowList, text.substr(12));
      updateDb();
      client.say(to, text.substr(12) + " can no longer send tweets. :-(");
      return;
    },

    getAllowedUsers: function () {
      if (from !== config.connectionConfig.adminUser) {
        client.say(from, "Sorry, only my admin, " + config.connectionConfig.adminUser + ", can do that!");
        return;
      }

      client.say(from, "Allowed Users: " + JSON.stringify(allowList));
    }
  };

  utils.mapCmds(text, cmds, function () {
    // Default/no matching command
    // Log the messages for the tweet last post feature
    if (_.isUndefined(messageHistory[to])) {
      messageHistory[to] = {};
    }

    messageHistory[to][from] = text;
  });
}

function initAllowList(cb) {
  if (!allowList) {
    db.get("twitterAllowList", function (error, value) {
      if (error && error.type === "NotFoundError") {
        allowList = [];
        cb(null);
        return;
      }
      else if (error) {
        cb(error);
        return;
      }

      allowList = value;
      cb(null);
    });
  }
  else {
    cb(null);
  }
}

function twitter(from, to, text, client, next) {
  initAllowList(function (error) {
    if (error) {
      next(error);
      return;
    }

    handleAvailableCommands(from, to, text, client);
    next(null); // ok to call back before we are done.
  });
}

module.exports = twitter;
