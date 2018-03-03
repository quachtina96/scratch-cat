'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const ScratchCatModel = require('./scratch_cat_model.js');

exports.scratchCat = functions.https.onRequest((request, response) => {
  const app = new App({request: request, response: response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  // SCRATCHCAT INSTANCE
  var actions = {
    'sing': function(app) {
      app.tell('lalala');
    },
    'say': function(app, whatToSay) {
      app.tell(whatToSay);
    }
  };
  var scratchCat = new ScratchCatModel(actions);


  // DEFINING ACTION FULFILLMENT FUNCTIONS
  function discoverAbility (app) {
    // TODO: provide the correct parameter
    var action = app.getArgument('command');
    // replace instances of 'me' with 'you' in the action.
    action = action.replace(/me/i, 'you');
    if (scratchCat.hasAbilityTo(action)) {
      app.tell("I can " + action);
    } else {
      app.ask("I don't know how to " + action + ". Can you teach me?");
    }
  }

  /**
   * When a user has agreed to teach a command to Scratch and has said a step,
   * Scratch will ask if the instruction is correct.
   */
  function teachCommand(app) {
    // var action = app.getArgument('#discover_ability.command');
    var action = app.getArgument('action');
    var instruction = app.getArgument('command')[0];
    app.ask("Okay. " + instruction + " like this?");
  }
  /**
   * When a user confirms that the instruction is correct, Scratch will save the
   * command into its definition of the program. As a result, the teachCommand's
   * context should be passed to the confirm command intention  (which should
   * follow the teachCommand.
   */
  function confirmCommand(app) {
  }

  /**
   * When a user confirms that the instruction is correct, Scratch will save the
   * command into its definition of the program. As a result, the teachCommand's
   * context should be passed to the confirm command intention  (which should
   * follow the teachCommand.
   */
  function correctCommand(app) {
  }

  function callCommand(app) {
    var instruction = app.getArgument('command');
    if (instruction) {
      // if you can parse the instruction successfully, get the steps and execute
      // them. issues with parsing may arise because some higher level actions
      // have not yet been defined by the user.
      // otherwise,
      const response = {
          speech: "I don't know how to do that. What should I do when you say '" + instruction + "'?",
          followupEvent: {
              name: "call_command_unknown",
          }
        }
      return app.response_.status(200).send(response);
    }
    else {
      app.tell("Sorry, please try again.");
    }
  }

  function triggerEvent_(app, eventName, opt_dataMap) {
    var dataMap = opt_dataMap ? opt_dataMap : {}
    const response = {
        followupEvent: {
            name: eventName,
            data: dataMap
        }
      }
    return app.response_.status(200).send(response);
  }

  function defineProgram(app) {
    var action = app.getArgument('#call_command.command');
    var instruction = app.getArgument('command');
    var event = app.getArgument('event');
    scratchCat.addAction(action, scratchCat.getStep(instruction, event));
  }

  function addToProgram(app) {
    // TODO: set the correct context.
    var action = app.getArgument('CONTEXT_HERE.command');
    var instruction = app.getArgument('command');
    var event = app.getArgument('event');
    scratchCat.appendStep(action, scratchCat.getStep(instruction, event));
  }

  /**
   * Will be called when user wants to replace a statement in the program with
   * a new command.
   */
  function editProgram(app) {
    // TODO: how do we know what command to replace? We can get this from the
    // user. ("instead of COMMAND_OLD, COMMAND_NEW")
    // TODO: set the correct context.
    var action = app.getArgument('CONTEXT_HERE.command');
    var instruction = app.getArgument('command');
    var event = app.getArgument('event');
    // TODO: get index of command to replace.
    scratchCat.replaceStep(action, index,scratchCat.getStep(instruction, event));
  }


  let actionMap = new Map();
  actionMap.set('discover_ability', discoverAbility);
  actionMap.set('call_command', callCommand);
  actionMap.set('discover_ability.discover_ability-yes', teachCommand);
  actionMap.set('discover_ability.discover_ability-yes.discover_ability-yes-yes', app => {
    triggerEvent_(app, 'discover_unknown_ability');
  });
 actionMap.set('define_program', defineProgram);

app.handleRequest(actionMap);
});



