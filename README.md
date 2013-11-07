node-irc-bot
============

Node IRC Bot is an IRC bot written in Javascript that has the aim of being as modular 
as possible.

This project is still very much a work in progress.

Usage
===========
First copy ample_botConfig.json to botConfig.json and fill that out as needed.
Then, simply run ./bin/node-irc-bot.js and you are good to go.

Available Default Plugins
==============
Default plugins can be enabled by adding them to defaultPlugins in botConfig.json.

Ping Pong (ping)
-------------
If a user types "!ping" the bot will respond with "PONG!"

Twitter (twitter)
-------------
The twitter plugin lets users send twitter posts to a twitter feed that you
configure.  See the same bot config for an example of how to configure this.  You'll
need to get all the twitter api keys and what not before you can use this feature.

!tweet [message]  -- Tweets the message
!tweetUser [user] -- Tweets the last message that [user] sent.

