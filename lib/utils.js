/**
 *
 * Various utility functions to help with parsing commands, hangling common tasks, etc.
 */

var _ = require("lodash");

module.exports = function (config) {
  var utils;

  utils = {
    /**
     * Retrieves a command from a command string.
     *
     * @param {String} text to check for the command
     * @returns {Object|null} returns object of the form {name: "foundCommand", args: [arg1, arg2, arg3]} or null if no command found.
     */
    getCmd: function(text) {
      var cmd, foundPrefix;

      text = text.split(" ");
      cmd = text[0].substr(config.connectionConfig.commandPrefix.length);
      foundPrefix = text[0].substr(0, config.connectionConfig.commandPrefix.length);

      if (foundPrefix === config.connectionConfig.commandPrefix) {
        text.splice(0, 1);

        return {
          name: cmd,
          args: text
        };
      }

      return null;
    },

    /**
     * Allows you to pass in an object with keys that represent
     * available commands and functions which are executed when that command
     * is found.  The arguments to the command will passed into the command functions.
     *
     * @param {String} cmdStr string that has the command.
     * @param {Object} cmds of the form {"cmdName1": function(args){}, ...}
     * @param {Function} defaultAction default function to run if no commands matched.
     */
    mapCmds: function(cmdStr, cmds, defaultAction) {
      var cmd = utils.getCmd(cmdStr);

      if (!cmd || _.isUndefined(cmds[cmd.name])) {
        defaultAction();
      }
      else {
        cmds[cmd.name](cmd.args);
      }
    }
  }

  return utils;
};
