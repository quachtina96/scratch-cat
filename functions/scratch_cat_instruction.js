/**
 * @fileoverview Define ScratchCatInstruction class for converting sentences
 * to Scratch programs
 * @author Tina Quach (quacht@mit.edu)
 */

/**
 * ScratchCatInstruction class
 */
class ScratchCatInstruction {
  /**
   * Constructor for the ScratchCatInstruction
   * @param {!String} rawInstruction - the utterance from the user.
   * @param {!ScratchCatAction} action - the action to which this instruction
   *    belongs.
   */
  constructor(rawInstruction, action) {
    this.raw = rawInstruction;
    this.steps = this.getSteps();
    this.action = action;
  }

  /**
   * Returns the sentences in the instruction that use undefined actions.
   * @param {!String} instruction - String containing the instruction
   * @param {!Array<!String>} an array of unsupported sentences.
   */
  static getUnsupportedSteps(instruction) {
    // Detect multiple statements and split them.
    let sentences = instruction.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
    var unknownActions = [];
    for (var i = 0; i < sentences.length; i++) {
      try {
        var instructionJson = ScratchCatInstruction.extractArgs(sentences[i]);
        var scratchInstruction = ScratchCatInstruction.jsonToScratch(instructionJson);
      } catch (e) {
        unknownActions.push(sentences[i]);
      }
    }
    return unknownActions;
  }

  /**
   * Returns the steps of the Scratch program.
   */
  getSteps() {
    // Detect multiple statements and split them.
    let sentences = this.raw.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|");
    var steps = [];
    for (var i = 0; i < sentences.length; i++) {
      try {
        var instructionJson = ScratchCatInstruction.extractArgs(sentences[i]);
        var scratchInstruction = ScratchCatInstruction.jsonToScratch(instructionJson);
        steps.push(scratchInstruction);
      } catch (e) {
        throw new Error("Failed to get steps from instruction: " + this.raw);
      }
    }
    return steps;
  }

  /**
   * Helper function for getSteps. Returns a JSON representing the instruction.
   * @param {!String} instruction A sentence that may contain a command.
   * @return JSON object encoding information for generating Scratch program.
   */
  static extractArgs(sentence) {
    var instructionJson = {
      original: sentence
    };

    if (!sentence) {
      return instructionJson;
    }

    let commandTemplates = {
      'when EVENT, you CMD': /[wW]hen (.*), you (.*)/,
      'when EVENT, CMD': /[wW]hen (.*), (.*)/,
      'then/next/after, CMD': /([Tt]hen|[nN]ext|[aA]fter), (.*)/,
      'first, CMD': /[fF]irst, (.*)/,
    };
    var keys = Object.keys(commandTemplates);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var matches = sentence.match(commandTemplates[key]);
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

    instructionJson.command = sentence;

    return instructionJson;
  }

  /**
   * Helper function for getSteps. Returns a JSON representing the instruction.
   * @param {!String} instruction A sentence that may contain a command.
   */
  static jsonToScratch(instructionJson) {
    if (!instructionJson.command) {
      return null;
    }

    // Process command.
    var instructionTokens = instructionJson.command.split(' ');
    if (instructionTokens) {
      // Assume first word is the verb and the rest of the command is an
      // argument.
      var verb = instructionTokens[0];

      // Check for all built in commands, mapped to Scratch programs.
      // TODO: add more cases to handle wider variety of possible scratch
      // commands.
      if (verb.toLowerCase() === 'say') {
        var opcode = 'say:';
      } else {
        // Verb is not recognized
        throw new Error("Scratch does not know how to '" + verb + "'");
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
   * Returns a version of the command with the identified user-defined actions
   * replaced by the actual action objects.
   * @param {!String} command - the command to parse
   * @return {Array<String|!ScratchCatAction>} an array chunking the command
   *    around known actions and replacing the string of these known actions
   *    with the actual ScratchCatAction object.
   */
  markUserDefinedActions(command) {
    // Find user-defined actions in the command.
    var markedActions = {}
    for (var action in this.action.model.actions) {
      var actionIndex = command.indexOf(action.name);
      if (actionIndex != -1) {
        // Instruction builds on learned action.
        // TODO: Address how actions may overlapped in name causing this to
        //  identify multiple actions within the same portion of the command.
        markedActions[actionIndex] = action;
      }
    }

    markedCommand = []
    start = 0;
    for (var index in markedActions) {
      markedCommand.push(command[start, index]);
      markedCommand.push(markedActions[index]);
      start = index + 1;
    }
    return markedCommand;
  }
}

module.exports = ScratchCatInstruction;