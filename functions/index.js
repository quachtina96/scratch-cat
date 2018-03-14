'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const ScratchCatModel = require('./scratch_cat_model.js');


/** Dialogflow Actions {@link https://dialogflow.com/docs/actions-and-parameters#actions} */
const Actions = {
  DISCOVER_ABILITY: 'discover_ability',
  TEACH_COMMAND: 'discover_ability.discover_ability-yes',
  CONFIRM_COMMMAND: 'confirm_command', //?
  CORRECT_COMMMAND: 'correct_command', //?
  CALL_COMMAND: 'call_command',
  CALL_COMMAND_YES: 'call_command.call_command-yes',
  DEFINE_PROGRAM: 'define_program',
  DEFINE_PROGRAM_FROM_ABILITY: 'discover_ability.discover_ability-yes.discover_ability-yes-yes',
  ADD_TO_PROGRAM: 'add_to_program', //?
  EDIT_PROGRAM: 'edit_program', //?
  ASK_TO_TEACH: 'ask_to_teach',
};

/**
 * The ScratchCat class handles Dialogflow requests.
 */
class ScratchCat {
  /**
   * Create a new instance of the app handler
   * @param {AoG.ExpressRequest} req
   * @param {AoG.ExpressResponse} res
   * @param {!DialogFlowApp} opt_app
   */
  constructor (request, response, opt_app) {
    this.app = opt_app ? opt_app : new App({request: request, response: response});
    this.model = new ScratchCatModel();
  }

  /**
   * Get the Dialogflow intent and handle it using the appropriate method
   */
  run() {
    const map = this;
    const action = this.app.getIntent();
    if (!action) {
      return this.app.tell("I didn't hear you say anything. If you want, you can program me by telling me what to do.");
    }

    try {
      map[action]();
    } catch (e){
      var errorReporting = [];
      errorReporting.push(e);
      errorReporting.push('ScratchCat failed on action: ' + action);
      errorReporting.push('ScratchCat looks like' + JSON.stringify(map));
      return errorReporting.join('\n');
    }
  }

  triggerEvent_(eventName, opt_dataMap) {
    var dataMap = opt_dataMap ? opt_dataMap : {}
    const response = {
        followupEvent: {
            name: eventName,
            data: dataMap
        }
      }
    return this.app.response_.status(200).send(response);
  }

  [Actions.DISCOVER_ABILITY]() {
    // TODO: provide the correct parameter
    var action = this.app.getArgument('command');
    if (!action) {
      this.app.tell("You can teach me by telling me what to do.");
      return;
    }
    // replace instances of 'me' with 'you' in the action.
    if (this.model.hasAbilityTo(action)) {
      action = action.replace(/me/i, 'you');
      this.app.tell("I can " + action);
    } else {
      action = action.replace(/me/i, 'you');
      this.app.ask("I don't know how to " + action + ". Can you teach me?");
    }
  }

  [Actions.DEFINE_PROGRAM_FROM_ABILITY]() {
    this.triggerEvent_(this.app, 'discover_unknown_ability');
  }

  /**
   * When a user has agreed to teach a command to Scratch and has said a step,
   * Scratch will ask if the instruction is correct.
   */
  [Actions.TEACH_COMMAND]() {
    // var action = app.getArgument('#discover_ability.command');
    var action = this.app.getArgument('action');
    var instruction = this.app.getArgument('command');
    this.app.ask("Okay. " + instruction + " like this?");
  }

  /**
   * When a user confirms that the instruction is correct, Scratch will save the
   * command into its definition of the program. As a result, the teachCommand's
   * context should be passed to the confirm command intention  (which should
   * follow the teachCommand.
   */
  [Actions.CONFIRM_COMMMAND]() {
  }

  /**
   * When a user confirms that the instruction is correct, Scratch will save the
   * command into its definition of the program. As a result, the teachCommand's
   * context should be passed to the confirm command intention  (which should
   * follow the teachCommand.
   */
  [Actions.CORRECT_COMMMAND]() {
  }

  [Actions.CALL_COMMAND]() {
    var instruction = this.app.getArgument('command');
    if (instruction) {
      // TODO: if you can parse the instruction successfully, get the steps and execute
      // them.
      if (this.model.hasAbilityTo(instruction)) {
        this.app.tell("Okay. I can do that. Let's pretend I just did.");
      } else {
        this.app.ask("I don't know how to do that. Can you teach me what I should when you say '" + instruction + "'?");
      }
    }
    else {
      // Prompt user to provide some sort of actionable input.
      this.app.tell("Sorry, what would you like me to do?");
    }
  }


  [Actions.AGREE]() {
    // Determine what context we're in.
    var contexts = this.app.getContexts();

    // Pull command from context.
    //
    var instruction = this.app.getArgument('command');
  }

  // followup intent to call_command_yes;
  [Actions.CALL_COMMAND_YES]() {
    const response = {
        followupEvent: {
            name: "call_command_unknown",
        }
      }
    // TODO: do i need to pass this command to the define program context then?
    return this.app.response_.status(200).send(response);
    }

  // TODO(quacht): unit test this.
  [Actions.DEFINE_PROGRAM]() {
    var action = this.app.getArgument('action');
    var instruction = this.app.getArgument('instruction');

    if (instruction) {
      try {
        this.model.addAction(action, instruction);
        this.app.ask("Okay, what's the next step?");
      } catch(e) {
        console.log(e);
        this.app.ask("I didn't understand. Can you teach me what I should do when you say '" + instruction + "'?");
      }
    }
    else {
      // Prompt user to provide some sort of actionable input.
      this.app.tell("I didn't get that.");
    }
  }

  [Actions.ADD_TO_PROGRAM]() {
    // TODO: set the correct context.
    var action = this.app.getArgument('CONTEXT_HERE.command');
    var instruction = this.app.getArgument('command');
    var event = this.app.getArgument('event');
    this.model.appendStep(action, this.model.getStep(instruction, event));
  }

  /**
   * Will be called when user wants to replace a statement in the program with
   * a new command.
   */
  [Actions.EDIT_PROGRAM]() {
    // TODO: how do we know what command to replace? We can get this from the
    // user. ("instead of COMMAND_OLD, COMMAND_NEW")
    // TODO: set the correct context.
    var action = this.app.getArgument('CONTEXT_HERE.command');
    var instruction = this.app.getArgument('command');
    var event = this.app.getArgument('event');
    // TODO: get index of command to replace.
    this.model.replaceStep(action, index,this.model.getStep(instruction, event));
  }
}

// HTTP Cloud Function for Firebase handler
exports.scratchCat = functions.https.onRequest((req, res) => {
  let scratch = new ScratchCat(req, res);
  scratch.run();
});

module.exports.Actions = Actions;
module.exports.ScratchCat = ScratchCat;