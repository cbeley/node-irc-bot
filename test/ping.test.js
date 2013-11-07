var expect = require("expect.js"),
    ping = require("../defaultPlugins/ping.js");

describe("Ping Pong Plugin", function () {
  it("Should respond with PONG if you say ping", function (done) {
    ping("bob", "#fakeChannel", "!ping", {
      say: function (to, message) {
        expect(to).to.be("#fakeChannel");
        expect(message).to.be("PONG!");
        done();
      }
    });
  });

  it("Should not respond if other junk is said", function (done) {
    ping("bob", "#fakeChannel", "other junk", {
      say: function () {
        throw new Error("say was called when it should not have been called!");
      }
    });

    done();
  });
});