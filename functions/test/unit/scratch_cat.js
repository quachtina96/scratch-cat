const test = require('tap').test;
const sc = require('../../index.js');

class mockDialogFlowApp {
	constructor() {
    // maintain the set of outputs that occured.
    this.speechOutput = [];
    this.mockIntent = '';
    this.args = {};
	}

  setIntent_(intent){
    this.mockIntent = intent;
  }

  setArgument(argName, value) {
    this.args[argName] = value;
  }

  setArguments(argsJson){
    this.args = argsJson;
  }

  addArguments(argsJson) {
    this.args = Object.assign(this.args, argsJson);
  }

	getIntent() {
		return this.mockIntent;
	}

	ask(whatToSay) {
		this.speechOutput.push('ask', whatToSay);
	}

	tell(whatToSay) {
    this.speechOutput.push('tell', whatToSay);
	}

	getArgument(argName) {
    return this.args[argName];
	}

	// this.app.response_.status(200).send(response);
  // IDEA:
}

test('run executes action matching the known intent', t => {
  var app = new mockDialogFlowApp();
  app.setIntent_(sc.Actions.DISCOVER_ABILITY);
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  scratch.run();
  t.same(app.speechOutput, ["tell", "You can teach me by telling me what to do."]);
  t.end();
});

test('run prompts user if no intent detected', t => {
  var app = new mockDialogFlowApp();
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  scratch.run();
  t.same(app.speechOutput, ["tell", "I didn't hear you say anything. If you want, you can program me by telling me what to do."]);
  t.end();
});

test('run catches error when action fails.', t => {
  var app = new mockDialogFlowApp()
  app.setIntent_('Nonexistent Intent');
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  let output = scratch.run();
  let expected = `TypeError: map[action] is not a function\nScratchCat failed on action: Nonexistent Intent\nScratchCat looks like{"app":{"speechOutput":[],"mockIntent":"Nonexistent Intent","args":{}},"model":{"actions":{},"currentProgram":[]}}`
  t.same(output, expected);
  t.end();
});

test('DiSCOVER_ABILITY prompts for action', t => {
  var app = new mockDialogFlowApp();
  app.setIntent_(sc.Actions.DISCOVER_ABILITY);
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  scratch.run();
  t.same(app.speechOutput, ["tell", "You can teach me by telling me what to do."]);
  t.end();
});

test('DiSCOVER_ABILITY with known action', t => {
  var app = new mockDialogFlowApp();
  app.setIntent_(sc.Actions.DISCOVER_ABILITY);
  app.setArgument('command', 'tell me a joke');
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  // Provide scratch with some known actions.
  scratch.model.actions['tell me a joke'] = [["whenGreenFlag"],
            ["doAsk", "Knock Knock"],
            ["doIf",
              ["=", ["answer"], "who's there?"],
              [["doAsk", "King Tut"],
                ["doIf", ["=", ["answer"], "King Tut who?"], [["say:", "King Tut-key fried chicken!"]]]]]];
  scratch.run();
  t.same(app.speechOutput, ["tell", "I can tell you a joke"]);
  t.end();
});

test('DiSCOVER_ABILITY asks user to teach unknown action', t => {
  var app = new mockDialogFlowApp();
  app.setIntent_(sc.Actions.DISCOVER_ABILITY);
  app.setArgument('command', 'tell me a joke');
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  scratch.run();
  t.same(app.speechOutput, ["ask", "I don't know how to tell you a joke. Can you teach me?"]);
  t.end();
});


