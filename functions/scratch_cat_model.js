/**
 * This file describes the ScratchCatModel class for the voice user interface for
 * programming.
 */

let vm = require('scratch-vm');

class ScratchCatModel {
  constructor (opt_availableActions) {
    // Map actions to series of steps.
    this.actions = opt_availableActions ? opt_availableActions : new Map();
    // TODO: delete var below if not needed.
    // currentProgram maintains list of steps defining the current program.
    this.currentProgram = [];
  }

  getAvailableActions() {
    return Object.keys(this.actions);
  }

  hasAbilityTo(action) {
    return action in this.actions;
  }

  // TODO: move getSteps and extractArgs_ into a ScratchCatInstruction class?
  // extractArgs_ would be included in the initialization and would provide a
  // nice API for interacting with the arguments.
  /**
   * Helper function for getSteps. Returns a JSON representing the instruction.
   * @param {!String} instruction A sentence that may contain a command.
   */
  extractArgs_(instruction) {
    var instructionJson = {
      original: instruction
    };

    let commandTemplates = {
      'when EVENT, you CMD': /when (.*), you (.*)/,
      'when EVENT, CMD': /when (.*), (.*)/,
      'then/next/after, CMD': /[then|next|after], (.*)/,
      'first, CMD': /first, (.*)/,
    };
    var keys = Object.keys(commandTemplates);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var matches = instruction.match(commandTemplates[key]);
      if (matches) {
        console.log(key)
        console.log(matches);
        switch (key) {
          case 'when EVENT, you CMD':
            instructionJson.event = matches[1];
            instructionJson.command = matches[2];
            return instructionJson;
          case 'when EVENT, CMD':
            instructionJson.event = matches[1];
            instructionJson.command = matches[2];
            return instructionJson;
          case 'then/next/after, CMD':
            instructionJson.command = matches[1];
            return instructionJson;
          case 'first, CMD':
            instructionJson.command = matches[1];
            return instructionJson;
          default:
            console.log('CMD, i guess');
        }
      }
    }

    return instructionJson;
  }

  /**
   * Returns the steps of the Scratch program.
   */
  getSteps(instruction, opt_event) {
    var instructionTokens = instruction.split(' ');
    // TODO: Remove assumption that the instruction follows specific format in
    // which first word is the command and the rest of the instruction is a
    // single argument for the command.
    var statement = [instructionTokens[0], instructionTokens.slice(1, instructionTokens.length).join(' ')]

    if (opt_event) {
      var eventTokens = opt_event.split(' ');
      var event = eventTokens.slice(1, eventTokens.length).join(' ');
      // wrap the statement with the event.
    }

    return [statement];
  }

  /**
   * Everytime you want to execute the program, you add a
   * when green flag block to start it.
   */
  createProgram(steps) {
    return [['whenGreenFlag']].concat(steps);
  }

  /**
   * Adds a new ability and associates a new program containing given
   * instruction to it.
   * @param {!String} actionName Name of the action
   * @param {!Array<Array>} step The steps in the program
   **/
  addAction(actionName, steps) {
    this.actions[actionName] = steps;
  }

  /**
   * Adds step to program associated with existing ability.
   * @param {!String} actionName Name of the action
   * @param {!Object} step The new step
   **/
  appendSteps(actionName, steps) {
    for (var i = 0; i < steps.length; i++) {
      this.actions[actionName].push(steps[i]);
    }
  }

  /**
   * Replaces step at given index in program with new step.
   * @param {!String} actionName
   * @param {!Integer} index Location of step to replace
   * @param {!Object} step sequence of functions to evaluate
   **/
  replaceStep(actionName, index, step) {
    this.actions[actionName][index] = step;
  }
}

module.exports = ScratchCatModel;
