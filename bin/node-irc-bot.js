#!/bin/env node

var irc = require("irc"),
        _ = require("lodash"),
        async = require("async"),
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

  // Execute each plugin, but wait until it has finished.  If a plugin has not called back,
  // that means that the no further plugins should be run.  This may happen if a plugin blocks a user or message.
  // Plugins are executed in the order in which they are defined in the configuration file, so order does matter.
  // In a nutshell, this all works very similiarly to Connect's middleware.
  async.eachSeries(plugins, function (plugin, cb) {
    plugin(from, to, text, client, cb);
  },
  function (error) {
    if (error) {
      console.log("Plugin Error:  ");
      console.log(error.stack);
      console.log("De-Acivating Plug-In...");
      plugins = _.without(plugin);
    }
  });
});

client.addListener("error", function (message) {
  console.log("error: ", message);
});