import { authenticate } from "../auth/auth.middleware.js";

import {
  createWorkflow,
  getWorkflow,
  listWorkflows,
  updateWorkflow,
  deleteWorkflow,
  activateWorkflow,
  deactivateWorkflow,
} from "./workflows.service.js";

import {
  createWorkflowSchema,
  updateWorkflowSchema,
  workflowParamsSchema,
  listWorkflowsSchema,
} from "./workflows.schema.js";

function sendError(reply, error) {
  return reply.code(error.statusCode ?? 500).send({
    error: {
      code: error.code ?? "INTERNAL_SERVER_ERROR",
      message: error.message ?? "Something went wrong",
    },
  });
}

export default async function workflowsRoutes(fastify) {
  // Create workflow
  fastify.post(
    "/",
    {
      preHandler: authenticate,
      schema: createWorkflowSchema,
    },
    async (request, reply) => {
      try {
        const workflow = await createWorkflow(
          request.user.sub,
          request.body
        );

        return reply.code(201).send({
          data: workflow,
        });
      } catch (error) {
        return sendError(reply, error);
      }
    }
  );

  // List workflows
  fastify.get(
    "/",
    {
      preHandler: authenticate,
      schema: listWorkflowsSchema,
    },
    async (request, reply) => {
      try {
        const result = await listWorkflows({
          userId: request.user.sub,
          limit: request.query.limit,
          cursor: request.query.cursor,
          status: request.query.status,
        });

        return reply.send(result);
      } catch (error) {
        return sendError(reply, error);
      }
    }
  );

  // Get single workflow
  fastify.get(
    "/:id",
    {
      preHandler: authenticate,
      schema: workflowParamsSchema,
    },
    async (request, reply) => {
      try {
        const workflow = await getWorkflow(
          request.user.sub,
          request.params.id
        );

        return reply.send({
          data: workflow,
        });
      } catch (error) {
        return sendError(reply, error);
      }
    }
  );

  // Update workflow
  fastify.put(
    "/:id",
    {
      preHandler: authenticate,
      schema: {
        ...workflowParamsSchema,
        ...updateWorkflowSchema,
      },
    },
    async (request, reply) => {
      try {
        const workflow = await updateWorkflow(
          request.user.sub,
          request.params.id,
          request.body
        );

        return reply.send({
          data: workflow,
        });
      } catch (error) {
        return sendError(reply, error);
      }
    }
  );

  // Delete workflow
  fastify.delete(
    "/:id",
    {
      preHandler: authenticate,
      schema: workflowParamsSchema,
    },
    async (request, reply) => {
      try {
        await deleteWorkflow(
          request.user.sub,
          request.params.id
        );

        return reply.code(204).send();
      } catch (error) {
        return sendError(reply, error);
      }
    }
  );

  // Activate workflow
  fastify.post(
    "/:id/activate",
    {
      preHandler: authenticate,
      schema: workflowParamsSchema,
    },
    async (request, reply) => {
      try {
        const result = await activateWorkflow(
          request.user.sub,
          request.params.id
        );

        return reply.send({
          data: result,
        });
      } catch (error) {
        return sendError(reply, error);
      }
    }
  );

  // Deactivate workflow
  fastify.post(
    "/:id/deactivate",
    {
      preHandler: authenticate,
      schema: workflowParamsSchema,
    },
    async (request, reply) => {
      try {
        const result = await deactivateWorkflow(
          request.user.sub,
          request.params.id
        );

        return reply.send({
          data: result,
        });
      } catch (error) {
        return sendError(reply, error);
      }
    }
  );
}