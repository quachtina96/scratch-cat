/**
 * @fileoverview Define ScratchCatAction class for representing a program in
 * both verbal and Scratch form.
 * @author Tina Quach (quacht@mit.edu)
 */
 const ScratchCatInstruction = require('./scratch_cat_instruction.js');



// Since the program needs to be communicated to the user, we need to have some
// sort of representation for each step.
class ScratchCatAction {
  /**
   * @constructor
   * @param {!String} name - The name of the action
   * @param {Array<ScratchCatInstruction>} opt_instructions
   */
  constructor(name, opt_instructions) {
    this.name = name;
    this.instructions = opt_instructions ? opt_instructions : [];
  }

  /**
   * Return Scratch program.
   * @return {Array<Array>} Scratch program generated from instructions
   */
  getScratchProgram() {
    let steps = this.instructions.map(instruction => instruction.steps[0]);
    // Everytime you want to execute the program, you add a
    // when green flag block to start it.
    return [['whenGreenFlag']].concat(steps);
  }

  /**
   * Get conversational representation of program.
   * @param {Boolean} opt_english If True, return conversational version of
   * @return {Array<Array>} Scratch program generated from instructions
   */
  getInstructions(opt_english) {
    if (opt_english)
      return this.instructions.map(instruction => instruction.raw);
    return this.instructions;
  }

  /**
   * Adds step to program associated with existing ability.
   * @param {!String} actionName Name of the action
   * @param {!Object} step The new step
   **/
  appendInstruction(instruction) {
    let newInstruction = new ScratchCatInstruction(instruction);
    console.dir('newInstruction');
    console.dir(newInstruction);
    this.instructions.push(newInstruction);
  }

  // TODO: Implement instruction replacement, deletion, and duplication.
}

module.exports = ScratchCatAction;