const test = require('tap').test;
const ScratchCatAction = require('../../scratch_cat_action.js');

test('getScratchProgram', t => {
  var action = new ScratchCatAction('say hello 3 times');
  action.instructions = [{'raw': 'Say hello', 'steps': [['say:', 'hello']]},{'raw': 'Say hello', 'steps': [['say:', 'hello']]},{'raw': 'Say hello', 'steps': [['say:', 'hello']]}]
  t.same(action.getScratchProgram(), [['whenGreenFlag'],['say:', 'hello'], ['say:', 'hello'],['say:', 'hello']]);
  t.end();
});

test('getInstructions', t => {
  var action = new ScratchCatAction('say hello 3 times');
  action.instructions = [{'raw': 'Say hello', 'steps': [['say:', 'hello']]},{'raw': 'Say hello', 'steps': [['say:', 'hello']]},{'raw': 'Say hello', 'steps': [['say:', 'hello']]}]
  t.same(action.getInstructions(), action.instructions);
  t.end();
});

test('getInstructions in English', t => {
  var action = new ScratchCatAction('say hello 3 times');
  action.instructions = [{'raw': 'Say hello', 'steps': [['say:', 'hello']]},{'raw': 'Say hello', 'steps': [['say:', 'hello']]},{'raw': 'Say hello', 'steps': [['say:', 'hello']]}]
  t.same(action.getInstructions(true), ['Say hello','Say hello','Say hello']);
  t.end();
});

test('appendInstruction', t => {
  // Define an action with one instruction.
  let instructions = [{
    'raw': 'cmd arg 1. then cmd1 arg1',
    'steps': [["cmd", "arg"],[ "cmd1", "arg1"]]
  }];
  var action1 = new ScratchCatAction('action1', instructions);
  t.ok(action1.instructions.length, 1);

  // Add a new instruction.
  let newInstruction = "Say hello"
  action1.appendInstruction(newInstruction);

  // There should be two instructions.
  t.ok(action1.instructions.length, 2)
  t.same(action1.instructions, [{
    'raw': 'cmd arg 1. then cmd1 arg1',
    'steps': [["cmd", "arg"],[ "cmd1", "arg1"]]
  }, {
    'raw': 'Say hello',
    'steps': [["say:", "hello"]]
  }]);
  t.end();
});