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
  DEFINE_PROGRAM: 'define_program',
  DEFINE_PROGRAM_FROM_ABILITY: 'discover_ability.discover_ability-yes.discover_ability-yes-yes',
  ADD_TO_PROGRAM: 'add_to_program', //?
  EDIT_PROGRAM: 'edit_program', //?
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
    // console.log('Request headers: ' + JSON.stringify(request.headers));
    // console.log('Request body: ' + JSON.stringify(request.body));
    this.model = new ScratchCatModel();
  }

  /**
   * Get the Dialogflow intent and handle it using the appropriate method
   */
  run() {
    const map = this;
    const action = this.app.getIntent();
    console.log(action);
    if (!action) {
      return this.app.tell("I didn't hear you say anything. If you want, you can program me by telling me what to do.");
    }

    try {
      map[action]();
    } catch (e){
      console.log(e);
      console.log('ScratchCat failed on action: ' + action);
      console.dir('ScratchCat looks like:');
      console.dir(map);
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
    var instruction = this.app.getArgument('command')[0];
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
      return this.app.response_.status(200).send(response);
    }
    else {
      this.app.tell("Sorry, please try again.");
    }
  }

  [Actions.DEFINE_PROGRAM]() {
    var action = this.app.getArgument('#call_command.command');
    var instruction = this.app.getArgument('command');
    var event = this.app.getArgument('event');
    this.model.addAction(action, this.model.getStep(instruction, event));
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
exports.scratchCat = functions.https.onRequest(
  /** @param {*} res */ (req, res) => new ScratchCat(req, res).run()
);

module.exports = {
  Actions,
  ScratchCat
};