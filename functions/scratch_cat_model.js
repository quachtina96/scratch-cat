/**
 * This file describes the ScratchCatModel class for the voice user interface for
 * programming.
 */
'use strict';
const ScratchCatAction = require('./scratch_cat_action.js');
const ScratchCatInstruction = require('./scratch_cat_instruction.js');


class ScratchCatModel {
  constructor (opt_availableActions) {
    // Map actions to series of steps.
    this.actions = opt_availableActions ? opt_availableActions : new Map();
    // TODO: delete var below if not needed.
    // currentProgram maintains list of steps defining the current program.
    this.currentProgram = [];
    this.currentAction = null;
  }

  getAvailableActions() {
    return Object.keys(this.actions);
  }

  hasAbilityTo(action) {
    return action in this.actions;
  }

  /**
   * Adds a new ability and associates a new program containing given
   * instruction to it.
   * @param {!String} actionName Name of the action
   * @param {!String} instruction The first instruction
   **/
  addAction(actionName, instruction) {
    this.actions[actionName] = new ScratchCatInstruction(instruction);
  }

  /**
   * Adds step to program associated with existing ability.
   * @param {!String} actionName Name of the action
   * @param {!Object} step The new step
   **/
  appendInstruction(instruction) {
    if (this.currentAction) {
      this.currentAction.appendInstruction(instruction);
    } else {
      throw Error("Cannot append instruction to null current action");
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
