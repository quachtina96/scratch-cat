const test = require('tap').test;
const scratchCat = require('../../index.js');

// TODO: look at the API for this.
// TODO: address concern that I am abstracting too much away.
class mockDialogFlowApp {
	constructor() {
    // maintain the set of actions that occured.
    this.log = {};
	}

	getIntent() {
		return;
	}

	ask() {
		return;
	}

	tell() {
		return;
	}

	getArgument() {
		return;
	}

	// this.app.response_.status(200).send(response);
	// need to look into how the above can be tested?
}

test('run executes action matching the known intent', t => {
  t.end()
});

test('run prompts user if no intent detected', t => {
  t.end()
});

test('run catches error when action fails.', t => {
  t.end()
});

test('triggerEvent_ triggers intents responding to given event.', t => {
  // create intents, define what events they respond to, check that ONLY the
  // appropriate intents were triggered.
  // big question: Where do these intents live? They are stored on Google's
  // dialogflow server, and information about them is sent through HTTP requests
  // and responses that contain JSON.
  t.end()
});

test('triggerEvent_ triggers no intents and warns when given an unknown event.', t => {
  // create intents, define what events they respond to, check that ONLY the
  // appropriate intents were triggered.
  // big question: Where do these intents live? They are stored on Google's
  // dialogflow server, and information about them is sent through HTTP requests
  // and responses that contain JSON.
  t.end()
});

test('DISCOVER ABILITY', t => {
	var scratch = new ScratchCat();
	scratch.app = new mockDialogFlowApp();
	scratch.app.getIntent = new function() {
		return Actions.DISCOVER_ABILITY;
	}
	scratch.run();
});


// Plan
// investigate what the request and response passed into scratchCat function are.

// in each test...
// create a ScratchCat object.
// set its this.app = dialogflowMockApp
// let app.getIntent return the specific intent i aim to test.
//