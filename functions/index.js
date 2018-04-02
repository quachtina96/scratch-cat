'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const ScratchCatModel = require('./scratch_cat_model.js');


/** Dialogflow Actions {@link https://dialogflow.com/docs/actions-and-parameters#actions} */
const Actions = {
  CALL_COMMAND: 'call_command',
  DEFINE_PROGRAM: 'define_program',
  ADD_TO_PROGRAM: 'add_to_program',
  EDIT_PROGRAM: 'edit_program',
  CORRECT_COMMMAND: 'correct_command',
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
    // Maintain a stack of calls.
    this.stack = [];
    // Maintain a queue of undefined actions.
    this.undefinedActions = [];
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

  /**
   * Trigger an event in order to trigger all associated intents.
   * @param {!String} eventName - the name of the event
   * @param {Object} opt_dataMap - data to pass to associated intents
   */
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
   * command into its definition of the program.
   */
  [Actions.CORRECT_COMMMAND]() {
    // TODO: implement
  }

  /**
   * If command is known, execute it. Otherwise, ask the user to teach how to
   * execute the command.
   */
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

  /**
   * This action gets utilized any time someone follows up with 'Yes.'
   */
  [Actions.AGREE]() {
    // Determine what context we're in.
    var contexts = this.app.getContexts();

    // Pull command from context.
    var instruction = this.app.getArgument('command');

    // IF statements based on context will determine what action we take.
  }

  /**
   * Execute workflow for user to start defining a program associated with an
   * action.
   */
  [Actions.DEFINE_PROGRAM]() {
    // The action the program will be saved under.
    var action = this.app.getArgument('action');
    // The first step in the program.
    var instruction = this.app.getArgument('instruction');

    try {
      // This whole undefined action flow is interesting. What if you waited til
      // the user finished defining the action? You would have a queue of
      // instructions that don't generate valid Scratch programs and the user
      // would be bombarded with requests.
      var undefinedActions = this.model.getUndefinedActions(instruction);
      if (undefinedActions.length) {
        // Maintain the current attempt to define the program?
        this.stack.push({
          'define_program' : {
            'action': action,
            'instruction': instruction
          }
        });

        // TODO: determine whether the list of undefined actions would be too long.
        this.app.ask("I don't know how to " + undefinedActions.join(" ") +
          ". Can you teach me what to do when you say " + undefinedActions[0]);

        // var dataMap = {
        //     'action': instruction,
        //     // TODO: What happens when I don't provide the instruction?
        // }
        // this.triggerEvent_(Actions.DEFINE_PROGRAM, dataMap)
      }

      this.model.addAction(action, instruction);
      // Remove punctuation from instruction.
      let instructionText = instruction.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      this.app.ask("When you say '" + action + "', I'll " + instructionText.toLowerCase() + ". What should I do next?");
    } catch (e) {
      this.app.ask("I didn't understand. Can you teach me what I should do when you say '" + instruction + "'?");
    }
  }

  /**
   * Attempt to add instruction to existing, known action.
   */
  [Actions.ADD_TO_PROGRAM]() {
    var action = this.app.getArgument('action');
    var instruction = this.app.getArgument('instruction');
    var message = "";
    try {
      this.model.appendInstructionTo(action, instruction);
      message = "Okay, I will " + instruction + " next.";
    } catch(e) {
      message = "Sorry, I didn't understand that so I couldn't add it to \
          the program";
    }
    this.app.tell(message);
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