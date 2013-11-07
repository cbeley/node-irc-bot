/*
 * Basic plugin that says pong when someone types !ping
 */

function pingPong(from, to, text, client) {
  if (text === "!ping") {
    client.say(to, "PONG!");
  }
}

module.exports = pingPong;
