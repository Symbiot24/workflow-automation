import { and, desc, eq, lt } from "drizzle-orm";
import db from "../../db/index.js";
import { workflows, workflowNodes } from "../../db/schema.js";

export async function createWorkflow({
  userId,
  name,
  description,
  trigger,
  actions,
}) {
  const [workflow] = await db
    .insert(workflows)
    .values({
      userId,
      name,
      description: description ?? null,
      triggerType: trigger.type,
      triggerConfig: trigger.config,
    })
    .returning();

  const nodes = await db
    .insert(workflowNodes)
    .values(
      actions.map((action, index) => ({
        workflowId: workflow.id,
        type: action.type,
        name: action.name,
        config: action.config,
        position: index + 1,
      }))
    )
    .returning();

  return {
    workflow,
    nodes,
  };
}

export async function findWorkflowById(userId, workflowId) {
  const workflowRows = await db
    .select()
    .from(workflows)
    .where(
      and(
        eq(workflows.id, workflowId),
        eq(workflows.userId, userId),
        eq(workflows.isDeleted, false)
      )
    )
    .limit(1);

  if (workflowRows.length === 0) {
    return null;
  }

  const workflow = workflowRows[0];

  const nodes = await db
    .select()
    .from(workflowNodes)
    .where(eq(workflowNodes.workflowId, workflow.id))
    .orderBy(workflowNodes.position);

  return {
    workflow,
    nodes,
  };
}

export async function listWorkflows({
  userId,
  limit,
  cursor,
  status,
}) {
  const conditions = [
    eq(workflows.userId, userId),
    eq(workflows.isDeleted, false),
  ];

  if (status) {
    conditions.push(eq(workflows.status, status));
  }

  if (cursor) {
    conditions.push(lt(workflows.createdAt, new Date(cursor)));
  }

  const rows = await db
    .select()
    .from(workflows)
    .where(and(...conditions))
    .orderBy(desc(workflows.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;

  const workflowRows = hasMore ? rows.slice(0, limit) : rows;

  const nextCursor = hasMore
    ? workflowRows[workflowRows.length - 1].createdAt.toISOString()
    : null;

  return {
    rows: workflowRows,
    nextCursor,
  };
}

export async function updateWorkflow(
  userId,
  workflowId,
  {
    name,
    description,
    trigger,
    actions,
  }
) {
  const existingRows = await db
    .select()
    .from(workflows)
    .where(
      and(
        eq(workflows.id, workflowId),
        eq(workflows.userId, userId),
        eq(workflows.isDeleted, false)
      )
    )
    .limit(1);

  if (existingRows.length === 0) {
    return null;
  }

  const workflowUpdates = {
    updatedAt: new Date(),
  };

  if (name !== undefined) {
    workflowUpdates.name = name;
  }

  if (description !== undefined) {
    workflowUpdates.description = description;
  }

  if (trigger !== undefined) {
    workflowUpdates.triggerType = trigger.type;
    workflowUpdates.triggerConfig = trigger.config;
  }

  const [workflow] = await db
    .update(workflows)
    .set(workflowUpdates)
    .where(
      and(
        eq(workflows.id, workflowId),
        eq(workflows.userId, userId),
        eq(workflows.isDeleted, false)
      )
    )
    .returning();

  if (actions !== undefined) {
    await db
      .delete(workflowNodes)
      .where(eq(workflowNodes.workflowId, workflowId));

    await db.insert(workflowNodes).values(
      actions.map((action, index) => ({
        workflowId,
        type: action.type,
        name: action.name,
        config: action.config,
        position: index + 1,
      }))
    );
  }

  const nodes = await db
    .select()
    .from(workflowNodes)
    .where(eq(workflowNodes.workflowId, workflowId))
    .orderBy(workflowNodes.position);

  return {
    workflow,
    nodes,
  };
}

export async function softDeleteWorkflow(userId, workflowId) {
  const result = await db
    .update(workflows)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(workflows.id, workflowId),
        eq(workflows.userId, userId),
        eq(workflows.isDeleted, false)
      )
    )
    .returning({
      id: workflows.id,
    });

  return result.length > 0;
}

export async function activateWorkflow(userId, workflowId) {
  const result = await db
    .update(workflows)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(workflows.id, workflowId),
        eq(workflows.userId, userId),
        eq(workflows.isDeleted, false)
      )
    )
    .returning();

  return result.length > 0 ? result[0] : null;
}

export async function deactivateWorkflow(userId, workflowId) {
  const result = await db
    .update(workflows)
    .set({
      status: "inactive",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(workflows.id, workflowId),
        eq(workflows.userId, userId),
        eq(workflows.isDeleted, false)
      )
    )
    .returning();

  return result.length > 0 ? result[0] : null;
}