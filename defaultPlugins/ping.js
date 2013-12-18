/*
 * Basic plugin that says pong when someone types !ping
 */

function pingPong(from, to, text, client, next) {
  if (text === "!ping") {
    client.say(to, "PONG!");
  }

  next(null);
}

module.exports = pingPong;
