const test = require('tap').test;
const sc = require('../../index.js');
const ScratchCatModel = require('../../scratch_cat_model.js');
const ScratchCatAction = require('../../scratch_cat_action.js');
const ScratchCatInstruction = require('../../scratch_cat_instruction.js');

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

  // Needs to be able to get arguments from within a context?
	getArgument(argName) {
    return this.args[argName];
	}
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
  let expected = `TypeError: map[action] is not a function\nScratchCat failed on action: Nonexistent Intent\nScratchCat looks like{"app":{"speechOutput":[],"mockIntent":"Nonexistent Intent","args":{}},"model":{"actions":{},"currentProgram":[],"currentAction":null}}`
  t.same(output, expected);
  t.end();
});

test('DISCOVER_ABILITY prompts for action', t => {
  var app = new mockDialogFlowApp();
  app.setIntent_(sc.Actions.DISCOVER_ABILITY);
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  scratch.run();
  t.same(app.speechOutput, ["tell", "You can teach me by telling me what to do."]);
  t.end();
});

test('DISCOVER_ABILITY with known action', t => {
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

test('DISCOVER_ABILITY asks user to teach unknown action', t => {
  var app = new mockDialogFlowApp();
  app.setIntent_(sc.Actions.DISCOVER_ABILITY);
  app.setArgument('command', 'tell me a joke');
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  scratch.run();
  t.same(app.speechOutput, ["ask", "I don't know how to tell you a joke. Can you teach me?"]);
  t.end();
});

test('DEFINE_PROGRAM modifies model and asks for next step', t => {
  var app = new mockDialogFlowApp();
  app.setIntent_(sc.Actions.DEFINE_PROGRAM);
  app.setArgument('action', 'tell me a joke');
  app.setArgument('instruction', 'first, say knock knock');
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  scratch.run();
  t.ok(scratch.model.hasAbilityTo('tell me a joke'));
  t.same(scratch.model.actions['tell me a joke'].getInstructions(true), ['first, say knock knock']);
  t.same(app.speechOutput, ["ask", "When you say 'tell me a joke', I'll first, say knock knock. What should I do next?"]);
  t.end();
});

test('DEFINE_PROGRAM notifies user of lack of input', t => {
  var app = new mockDialogFlowApp();
  app.setIntent_(sc.Actions.DEFINE_PROGRAM);
  app.setArgument('action', 'tell me a joke');
  app.setArgument('instruction', null);
  // Instead of passing a request and response, we pass null values;
  var scratch = new sc.ScratchCat(null, null, app);
  scratch.run();
  t.same(app.speechOutput, ["tell", "I didn't get that."]);
  t.end();
});

test('ADD_TO_PROGRAM modifies Scratch Cat model', t => {
  // Set up the program.
  var getPromise = function() {
      return new Promise(function(resolved, rejected) {
        var app = new mockDialogFlowApp();
        app.setIntent_(sc.Actions.DEFINE_PROGRAM);
        app.setArgument('action', 'tell me a joke');
        app.setArgument('instruction', 'say knock knock');
        // Instead of passing a request and response, we pass null values;
        var scratch = new sc.ScratchCat(null, null, app);
        scratch.run()
        resolved(scratch);
      });
  };

  // Add to the program.
  getPromise().then(scratch => {
    scratch.app.setIntent_(sc.Actions.ADD_TO_PROGRAM);
    scratch.app.setArgument('action', 'tell me a joke');
    scratch.app.setArgument('instruction', 'say who is there');
    return scratch;
  }).then(scratch => {
    scratch.run();
    t.same(scratch.model.actions['tell me a joke'].getInstructions(true), ['say knock knock']);
    t.same(scratch.model.actions['tell me a joke'].getScratchProgram(), [['whenGreenFlag'],['say:', 'knock knock']]);
    t.end();
  });
});

// TODO: enable the test of correct speech output for ADD_TO_PROGRAM
// t.same(scratch.app.speechOutput, ['tell', 'Okay, I will say who is there next.']);



