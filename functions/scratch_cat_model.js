/**
 * This file describes the ScratchCatModel class, which maintains the state of
 * the programs created.
 *
 * @author Tina Quach (quacht@mit.edu)
 */
'use strict';
const ScratchCatAction = require('./scratch_cat_action.js');
const ScratchCatInstruction = require('./scratch_cat_instruction.js');


class ScratchCatModel {
  constructor (opt_availableActions) {
    // Map actions to series of steps.
    this.actions = opt_availableActions ? opt_availableActions : new Map();
    this.currentAction = null;
  }

  /**
   * Get the names of known actions.
   * @return {!Array<String>} list of action names
   */
  getAvailableActions() {
    return Object.keys(this.actions);
  }

  /**
   * @param {!String} instruction - the instruction given by the user
   * @return {!Array<!String>} an array of unsupported sentences contained in
   *   given instruction.
   */
  getUndefinedActions(instruction) {
    // TODO: Add a way to parse these sentences for actual verbs. This could be
    // using a library to do part of speech tagging, or to build a tree
    // representing the sentence.
    if (!instruction) {
      throw new Error("Cannot get undefined actions from null instruction.")
    }
    return ScratchCatInstruction.getUnsupportedSteps(instruction);
  }

  /**
   * Return whether Scratch knows the action.
   * @param {!String} actionName - the name of the action
   * @return {!Boolean} True if Scratch knows the action under given name.
   */
  hasAbilityTo(actionName) {
    return actionName in this.actions;
  }

  /**
   * Adds a new ability and associates a new program containing given
   * instruction to it.
   * @param {!String} actionName Name of the action
   * @param {!String} instruction The first instruction
   **/
  addAction(actionName, instruction) {
    this.actions[actionName] = new ScratchCatAction(actionName);
    this.actions[actionName].appendInstruction(
        new ScratchCatInstruction(instruction, this.actions[actionName]));
    this.currentAction = this.actions[actionName];
  }

  /**
   * Adds step to program associated with existing ability.
   * @param {!Object} instruction The next instruction
   **/
  appendInstruction(instruction) {
    if (this.currentAction) {
      this.currentAction.appendInstruction(instruction);
    } else {
      throw Error("Cannot append instruction to null current action");
    }
  }

  /**
   * Adds step to program associated with existing ability.
   * @param {!String} actionName Name of the action
   * @param {!Object} instruction The next instruction
   **/
  appendInstructionTo(action, instruction) {
    if (action in this.actions) {
      this.actions[action].appendInstruction(instruction);
    } else {
      throw Error("Cannot append instruction to action that does not exist");
    }
  }

  /**
   * Return the action
   * @param {!String} actionName Name of the action
   * @param {ScratchCatAction}
   **/
  getAction(actionName) {
    return this.actions[actionName];
  }
}

module.exports = ScratchCatModel;
