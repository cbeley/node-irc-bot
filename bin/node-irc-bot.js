#!/bin/env node

var irc = require("irc"),
        _ = require("lodash"),
        config = require("../botConfig.json"),
        connectionSettings, client, plugins = [];

/****** Instantiate our Plugins *******/
// Default Plugins
if (!_.isUndefined(config.defaultPlugins)) {
  _.each(config.defaultPlugins, function (plugin) {
    plugins.push(require("../defaultPlugins/" + plugin));
  });
}

// External Plugins -- installed via npm.
if (!_.isUndefined(config.plugins)) {
  _.each(config.plugins, function (plugin) {
    plugins.push(require(plugin));
  });
}

/****** Connect to the Server & Channels *******/
connectionSettings = {
  "userName": "nodeIrcBot",
  "realName": "nodeIrcBot",
  "port": 6667,
  "autoRejoin": true,
  "autoConnect": true,
  "floodProtection": true,
  "floodProtectionDelay": 500,
  "network": "chat.freenode.net",
  "channels": ["#nodeIrcBot"],
  "stripColors": true
};

_.merge(connectionSettings, config.connectionConfig);

client = new irc.Client(config.connectionConfig.network, config.connectionConfig.userName, config.connectionConfig);


/******* Event Listeners ***********/
client.addListener("message#", function (from, to, text) {
  console.log(from + " (" + to + "): " + text);

  _.each(plugins, function (plugin) {
    plugin(from, to, text, client);
  });
});

client.addListener("error", function (message) {
  console.log("error: ", message);
});
