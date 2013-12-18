/*
 * This module allows any plug-in to make use of a shared database.  The idea
 * behind this is so that one DB is open and can be easily included in any plugin without passing
 * in the DB manually.
 *
 */

var config = require("../botConfig.json"),
    levelup = require('levelup'),
    db = levelup(config.connectionConfig.dbFile);


module.exports = db;
