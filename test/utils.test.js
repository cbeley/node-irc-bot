var expect = require("expect.js"),
    utils;

describe("Utils", function () {
  it("should load the utils module with a custom config", function () {
    utils = require("../lib/utils.js")({
      connectionConfig: {
        commandPrefix: "!"
      }
    });
  });

  describe("getCmd()", function () {
    it("should get a command out of various sample input with valid commands in them", function () {
      var i, j, result, expected, sampleInput = ["!bla", "!wee 42", "!mult multipe args"];

      expected = [{
          cmd: "bla",
          args: []
        },
        {
          cmd: "wee",
          args: ["42"]
        },
        {
          cmd: "mult",
          args: ["multipe", "args"]
        }];

      for (i = 0; i < sampleInput.length; i += 1) {
        result = utils.getCmd(sampleInput[i]);

        expect(result).to.be.an("object");
        expect(result.name).to.be(expected[i].cmd);
        expect(result.args.length).to.be(expected[i].args.length);

        for (j = 0; j < expected[i].args.length; j += 1) {
          expect(expected[i].args[j]).to.be(result.args[j]);
        }
      }
    });
  });

  describe("mapCmds()", function () {
    it("should run the right command when given a command in the cmds object", function (done) {
      utils.mapCmds("!bla yay args", {
        bla: function (args) {
          expect(args[0]).to.be("yay");
          expect(args[1]).to.be("args");

          done();
        }
      }, function () {
        throw new Error("command not found in command object when it should have!");
      });
    });

    it("should run the default function when the command is not found", function (done) {
      utils.mapCmds("!wee yay args", {
        bla: function () {
          throw new Error("There was no bla command in the command string!");
        }
      }, function () {
        done();
      });
    });

    it("should run the default function when there is not command in the passed in string", function (done) {
      utils.mapCmds("bla but this is not a command because it has no ! at the begining", {
        bla: function () {
          throw new Error("There was no bla command in the command string!");
        }
      }, function () {
        done();
      });
    });
  });
});