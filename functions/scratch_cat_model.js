/**
 * This file describes the ScratchCatModel class for the voice user interface for
 * programming.
 */

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

    if (!instruction) {
      return instructionJson;
    }

    let commandTemplates = {
      'when EVENT, you CMD': /when (.*), you (.*)/,
      'when EVENT, CMD': /when (.*), (.*)/,
      'then/next/after, CMD': /(then|next|after), (.*)/,
      'first, CMD': /first, (.*)/,
    };
    var keys = Object.keys(commandTemplates);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var matches = instruction.match(commandTemplates[key]);
      if (matches) {
        switch (key) {
          case 'when EVENT, you CMD':
          case 'when EVENT, CMD':
            instructionJson.event = matches[1];
            instructionJson.command = matches[2];
            return instructionJson;
          case 'then/next/after, CMD':
            instructionJson.event = 'after last command';
            instructionJson.command = matches[2];
            return instructionJson;
          case 'first, CMD':
            instructionJson.event = 'first';
            instructionJson.command = matches[1];
            return instructionJson;
        }
      }
    }

    instructionJson.command = instruction;

    return instructionJson;
  }

  jsonToScratch_(instructionJson) {
    if (!instructionJson.command) {
      return null;
    }
    // Process command.
    var instructionTokens = instructionJson.command.split(' ');
    if (instructionTokens) {
      // Assume first word is the verb and the rest of the command is an
      // argument.
      var verb = instructionTokens[0];
      // TODO: add more cases to handle wider variety of possible scratch
      // commands.
      if (verb === 'say') {
        var opcode = 'say:';
      }
      var command = [opcode, instructionTokens.slice(1).join(' ')];
    }

    if (instructionJson.event) {
      if (instructionJson.event.toLowerCase().startsWith('i say')) {
        let argument = instructionJson.event.substring(5);
        command = [["doAsk", ""],["doIf", ["=", ["answer"], argument], [command]]];
      }
      // else if (instructionJson.event == 'first') {
      //   // TODO: Need some way to pass this information to Scratch model for building the progam.
      // } else if (instructionJson.event == 'after last command') {
      //   // TODO: Need some way to pass this information to Scratch model for building the progam.
      // }
    }
    return command;
  }

  /**
   * Returns the steps of the Scratch program.
   */
  getSteps(instruction) {
    //TODO: detect multiple statements and split them.
    let sentences = instruction.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
    var steps = []
    for (var i = 0; i < sentences.length; i++) {
      var instructionJson = this.extractArgs_(sentences[i]);
      var scratchInstruction = this.jsonToScratch_(instructionJson);
      steps.push(scratchInstruction);
    }
    return steps;
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
