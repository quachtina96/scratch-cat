const test = require('tap').test;
const ScratchCat = require('../../scratch_cat_model.js');
const util = require('../../util.js');

test('getAvailableActions', t => {
	var actions = {
		"a1": [["cmd1", "arg1"],["cmd2", "arg2"]],
		"a2": [["cmd1", "arg1"],["cmd2", "arg2"]]
	};
    var scratch = new ScratchCat(actions);
    t.same(scratch.getAvailableActions(), ["a1","a2"]);
	t.end();
});

// TODO: correct test
test('extractArgs_ ""', t => {
    var scratch = new ScratchCat();
    let parsed = scratch.extractArgs_("");
    t.same(parsed, {"original": ""});
	t.end();
});

test('extractArgs_ "when EVENT, you CMD"', t => {
	let instruction = "when i say knock knock, you say who's there";
	var scratch = new ScratchCat();
    var jsonInfo = scratch.extractArgs_(instruction);
	t.same(jsonInfo, {
		original: "when i say knock knock, you say who's there",
		event: "i say knock knock",
		command: "say who's there"
	});
	t.end();
});

test('extractArgs_ "when EVENT, CMD"', t => {
	let instruction = "when i say knock knock, say who's there";
	var scratch = new ScratchCat();
    var jsonInfo = scratch.extractArgs_(instruction);
	t.same(jsonInfo, {
		original: "when i say knock knock, say who's there",
		event: "i say knock knock",
		command: "say who's there"
	});
	t.end();
});

test('extractArgs_ identifies "CMD" structure', t => {
	let instruction = "say who's there";
	var scratch = new ScratchCat();
    var jsonInfo = scratch.extractArgs_(instruction);
    t.same(jsonInfo.command, instruction);
	t.end();
});

test('extractArgs_ "then/next/after, CMD"', t => {
	let instruction = "then, say who's there";
	var scratch = new ScratchCat();
    var jsonInfo = scratch.extractArgs_(instruction);
	t.same(jsonInfo, {
		original: instruction,
		event: "after last command",
		command: "say who's there"
	});
	t.end();
});

test('extractArgs_ "first, CMD"', t => {
	let instruction = "first, say who's there";
	var scratch = new ScratchCat();
    var jsonInfo = scratch.extractArgs_(instruction);
	t.same(jsonInfo, {
		original: instruction,
		event: "first",
		command: "say who's there"
	});
	t.end();
});

test('getSteps works with single instruction', t => {
	var scratch = new ScratchCat();
	let instruction = 'say King Tut-key fried chicken!';
	var step = scratch.getSteps(instruction);
	t.same(step, [['say:', 'King Tut-key fried chicken!']]);
	t.end();
});

test('getSteps works with single instruction with event', t => {
	var scratch = new ScratchCat();
	let instruction = "when I say knock knock, say who's there?";
	let step = scratch.getSteps(instruction);
	step.equals([["doAsk", ""],["doIf", ["=", ["answer"], "knock knock"], [["say:", "who's there?"]]]]);
	t.end();
});

test('getSteps works with multiple instructions in single utterance', t => {
	var scratch = new ScratchCat();
	let instruction = "First, say knock knock. Then, when I say who's there, you say King Tut";
	let step = scratch.getSteps(instruction);
	step.equals([["say:", "knock knock"],["doAsk", ""],["doIf", ["=", ["answer"], "who's there"], [["say:", "King Tut"]]]]);
	t.end();
});


test('createProgram returns valid program', t => {
    var scratch = new ScratchCat();
    let steps = [["doAsk", ""],["doIf", ["=", ["answer"], "knock knock"], [["say:", "who's there?"]]]];
    let prog = scratch.createProgram(steps);
    t.same(prog, [["whenGreenFlag"],
						["doAsk", ""],
						["doIf", ["=", ["answer"], "knock knock"], [["say:", "who's there?"]]]])
	t.end();
});

test('addAction', t => {
    var scratch = new ScratchCat();
 	let actionName = 'actionName';
 	let steps = [["cmd", "arg"],[ "cmd1", "arg1"]]
    scratch.addAction(actionName, steps)
    t.ok(actionName in scratch.actions);
    t.same(scratch.actions['actionName'], [["cmd", "arg"],[ "cmd1", "arg1"]]);
	t.end();
});

test('appendSteps', t => {
 	let actions = {'actionName': [["cmd", "arg"],[ "cmd1", "arg1"]]}
 	var scratch = new ScratchCat(actions);
 	let steps = [["cmd3", "arg3"],[ "cmd4", "arg4"]]
    scratch.appendSteps('actionName', steps)
    t.ok('actionName' in scratch.actions);
    t.same(scratch.actions['actionName'], [["cmd", "arg"],[ "cmd1", "arg1"], ["cmd3", "arg3"],[ "cmd4", "arg4"]]);
	t.end();
});

test('appendSteps on empty step list', t => {
 	let actions = {'actionName': [["cmd", "arg"],[ "cmd1", "arg1"]]}
 	var scratch = new ScratchCat(actions);
 	let steps = []
    scratch.appendSteps('actionName', steps)
    t.ok('actionName' in scratch.actions);
    t.same(scratch.actions['actionName'], [["cmd", "arg"],[ "cmd1", "arg1"]]);
	t.end();
});

test('replaceStep', t => {
  	let actions = {'actionName': [["cmd", "arg"],[ "cmd1", "arg1"]]}
 	var scratch = new ScratchCat(actions);
 	scratch.replaceStep('actionName', 1, ["cmd_replace", "arg_replace"]);
 	t.same(scratch.actions['actionName'], [["cmd", "arg"],["cmd_replace", "arg_replace"]]);
	t.end();
});