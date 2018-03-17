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

test('appendInstruction with unsupported steps', t => {
  var action1 = new ScratchCatAction('action1');

  // Add a new instruction.
  t.throws(function() {
    action1.appendInstruction('cmd arg 1. then cmd1 arg1')
  });

  // There should be two instructions.
  t.equals(action1.instructions.length, 0)

  t.end();
});

test('appendInstruction with supported steps', t => {
  // Define an action with one instruction.
  var action1 = new ScratchCatAction('action1');

  // Add a new instruction.
  action1.appendInstruction('Say hello');

  // There should be one instruction.
  t.ok(action1.instructions.length, 1)

  t.same(action1.instructions[0].raw, 'Say hello');
  t.same(action1.instructions[0].steps, [["say:", "hello"]]);

  t.end();
});