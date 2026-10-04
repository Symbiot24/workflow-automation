const workflowActionSchema = {
  type: "object",
  required: ["type", "name", "config"],
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      minLength: 1,
      maxLength: 50,
    },

    name: {
      type: "string",
      minLength: 1,
      maxLength: 255,
    },

    config: {
      type: "object",
      additionalProperties: true,
    },
  },
};

const workflowTriggerSchema = {
  type: "object",
  required: ["type", "config"],
  additionalProperties: false,
  properties: {
    type: {
      type: "string",
      minLength: 1,
      maxLength: 50,
    },

    config: {
      type: "object",
      additionalProperties: true,
    },
  },
};

export const createWorkflowSchema = {
  body: {
    type: "object",
    required: ["name", "trigger", "actions"],
    additionalProperties: false,

    properties: {
      name: {
        type: "string",
        minLength: 1,
        maxLength: 255,
      },

      description: {
        type: "string",
        maxLength: 2000,
      },

      trigger: workflowTriggerSchema,

      actions: {
        type: "array",
        minItems: 1,
        items: workflowActionSchema,
      },
    },
  },
};

export const updateWorkflowSchema = {
  body: {
    type: "object",
    additionalProperties: false,

    properties: {
      name: {
        type: "string",
        minLength: 1,
        maxLength: 255,
      },

      description: {
        type: "string",
        maxLength: 2000,
      },

      trigger: workflowTriggerSchema,

      actions: {
        type: "array",
        minItems: 1,
        items: workflowActionSchema,
      },
    },

    minProperties: 1,
  },
};

export const workflowParamsSchema = {
  params: {
    type: "object",
    required: ["id"],
    additionalProperties: false,

    properties: {
      id: {
        type: "string",
        format: "uuid",
      },
    },
  },
};

export const listWorkflowsSchema = {
  querystring: {
    type: "object",
    additionalProperties: false,

    properties: {
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        default: 20,
      },

      cursor: {
        type: "string",
      },

      status: {
        type: "string",
        enum: ["active", "inactive"],
      },
    },
  },
};