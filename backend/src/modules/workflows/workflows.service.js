import * as workflowRepository from "./workflows.repository.js";

function createError(message, code, statusCode) {
  const error = new Error(message);

  error.code = code;
  error.statusCode = statusCode;

  return error;
}

function toWorkflowResponse({ workflow, nodes }) {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    status: workflow.status,

    trigger: {
      type: workflow.triggerType,
      config: workflow.triggerConfig,
    },

    actions: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      name: node.name,
      config: node.config,
      position: node.position,
    })),

    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
  };
}

export async function createWorkflow(userId, data) {
  const result = await workflowRepository.createWorkflow({
    userId,
    name: data.name,
    description: data.description,
    trigger: data.trigger,
    actions: data.actions,
  });

  return toWorkflowResponse(result);
}

export async function getWorkflow(userId, workflowId) {
  const result = await workflowRepository.findWorkflowById(
    userId,
    workflowId
  );

  if (!result) {
    throw createError(
      "Workflow not found",
      "WORKFLOW_NOT_FOUND",
      404
    );
  }

  return toWorkflowResponse(result);
}

export async function listWorkflows({
  userId,
  limit = 20,
  cursor,
  status,
}) {
  const result = await workflowRepository.listWorkflows({
    userId,
    limit,
    cursor,
    status,
  });

  return {
    data: result.rows.map((workflow) => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,

      trigger: {
        type: workflow.triggerType,
        config: workflow.triggerConfig,
      },

      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
    })),

    pagination: {
      nextCursor: result.nextCursor,
    },
  };
}

export async function updateWorkflow(userId, workflowId, data) {
  const existing = await workflowRepository.findWorkflowById(
    userId,
    workflowId
  );

  if (!existing) {
    throw createError(
      "Workflow not found",
      "WORKFLOW_NOT_FOUND",
      404
    );
  }

  if (existing.workflow.status === "active") {
    throw createError(
      "Active workflows cannot be updated. Deactivate the workflow first.",
      "WORKFLOW_ACTIVE",
      409
    );
  }

  const result = await workflowRepository.updateWorkflow(
    userId,
    workflowId,
    data
  );

  if (!result) {
    throw createError(
      "Workflow not found",
      "WORKFLOW_NOT_FOUND",
      404
    );
  }

  return toWorkflowResponse(result);
}

export async function deleteWorkflow(userId, workflowId) {
  const deleted = await workflowRepository.softDeleteWorkflow(
    userId,
    workflowId
  );

  if (!deleted) {
    throw createError(
      "Workflow not found",
      "WORKFLOW_NOT_FOUND",
      404
    );
  }
}

export async function activateWorkflow(userId, workflowId) {
  const existing = await workflowRepository.findWorkflowById(
    userId,
    workflowId
  );

  if (!existing) {
    throw createError(
      "Workflow not found",
      "WORKFLOW_NOT_FOUND",
      404
    );
  }

  const { workflow, nodes } = existing;

  if (!workflow.triggerType) {
    throw createError(
      "Workflow must have a trigger before activation",
      "TRIGGER_NOT_CONFIGURED",
      400
    );
  }

  if (
    !workflow.triggerConfig ||
    Object.keys(workflow.triggerConfig).length === 0
  ) {
    throw createError(
      "Workflow trigger is not configured",
      "TRIGGER_NOT_CONFIGURED",
      400
    );
  }

  if (nodes.length === 0) {
    throw createError(
      "Workflow must have at least one action before activation",
      "ACTIONS_NOT_CONFIGURED",
      400
    );
  }

  for (const node of nodes) {
    if (!node.type) {
      throw createError(
        "Workflow contains an action without a type",
        "ACTION_NOT_CONFIGURED",
        400
      );
    }

    if (
      !node.config ||
      Object.keys(node.config).length === 0
    ) {
      throw createError(
        `Action "${node.name}" is not configured`,
        "ACTION_NOT_CONFIGURED",
        400
      );
    }
  }

  const activated = await workflowRepository.activateWorkflow(
    userId,
    workflowId
  );

  if (!activated) {
    throw createError(
      "Workflow not found",
      "WORKFLOW_NOT_FOUND",
      404
    );
  }

  return {
    id: activated.id,
    status: activated.status,
    updatedAt: activated.updatedAt,
  };
}

export async function deactivateWorkflow(userId, workflowId) {
  const result = await workflowRepository.deactivateWorkflow(
    userId,
    workflowId
  );

  if (!result) {
    throw createError(
      "Workflow not found",
      "WORKFLOW_NOT_FOUND",
      404
    );
  }

  return {
    id: result.id,
    status: result.status,
    updatedAt: result.updatedAt,
  };
}