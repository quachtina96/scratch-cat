/**
 * @fileoverview Define ScratchCatInstruction class for converting sentences
 * to Scratch programs
 * @author Tina Quach (quacht@mit.edu)
 */

class ScratchCatInstruction {
  constructor(rawInstruction) {
    this.raw = rawInstruction;
    this.steps = this.getSteps(rawInstruction);
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
   * Helper function for getSteps. Returns a JSON representing the instruction.
   * @param {!String} instruction A sentence that may contain a command.
   * @return JSON object encoding information for generating Scratch program.
   */
  extractArgs_(instruction) {
    var instructionJson = {
      original: instruction
    };

    if (!instruction) {
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

  /**
   * Helper function for getSteps. Returns a JSON representing the instruction.
   * @param {!String} instruction A sentence that may contain a command.
   */
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
      if (verb.toLowerCase() === 'say') {
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
}

module.exports = ScratchCatInstruction;