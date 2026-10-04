/**
 * @typedef {Object} WorkflowTrigger
 * @property {string} type
 * @property {Object} config
 */

/**
 * @typedef {Object} WorkflowAction
 * @property {string} type
 * @property {string} name
 * @property {Object} config
 */

/**
 * @typedef {Object} CreateWorkflowDTO
 * @property {string} name
 * @property {string} [description]
 * @property {WorkflowTrigger} trigger
 * @property {WorkflowAction[]} actions
 */

/**
 * @typedef {Object} UpdateWorkflowDTO
 * @property {string} [name]
 * @property {string} [description]
 * @property {WorkflowTrigger} [trigger]
 * @property {WorkflowAction[]} [actions]
 */