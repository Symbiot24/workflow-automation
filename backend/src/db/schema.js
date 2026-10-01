import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  email: varchar("email", {
    length: 255,
  }).notNull().unique(),

  passwordHash: varchar("password_hash", {
    length: 255,
  }).notNull(),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow().notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  }).defaultNow().notNull(),
});


export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    description: text("description"),

    status: varchar("status", {
      length: 20,
    })
      .notNull()
      .default("inactive"),

    triggerType: varchar("trigger_type", {
      length: 50,
    }).notNull(),

    triggerConfig: jsonb("trigger_config")
      .notNull()
      .default({}),

    isDeleted: boolean("is_deleted")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },

  (table) => ({
    userStatusIndex: index("workflows_user_status_idx").on(
      table.userId,
      table.status
    ),

    userDeletedIndex: index("workflows_user_deleted_idx").on(
      table.userId,
      table.isDeleted
    ),
  })
);


export const workflowNodes = pgTable(
  "workflow_nodes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workflowId: uuid("workflow_id")
      .notNull()
      .references(() => workflows.id, {
        onDelete: "cascade",
      }),

    type: varchar("type", {
      length: 50,
    }).notNull(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    config: jsonb("config")
      .notNull()
      .default({}),

    position: integer("position").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },

  (table) => ({
    workflowPositionIndex: index(
      "workflow_nodes_workflow_position_idx"
    ).on(table.workflowId, table.position),

    workflowPositionUnique: unique(
      "workflow_nodes_workflow_position_unique"
    ).on(table.workflowId, table.position),
  })
);


export const executions = pgTable(
  "executions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workflowId: uuid("workflow_id").references(
      () => workflows.id,
      {
        onDelete: "set null",
      }
    ),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    triggerType: varchar("trigger_type", {
      length: 50,
    }).notNull(),

    triggerData: jsonb("trigger_data"),

    status: varchar("status", {
      length: 20,
    }).notNull(),

    startedAt: timestamp("started_at", {
      withTimezone: true,
    }),

    finishedAt: timestamp("finished_at", {
      withTimezone: true,
    }),

    error: text("error"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },

  (table) => ({
    userCreatedIndex: index(
      "executions_user_created_idx"
    ).on(table.userId, table.createdAt),

    workflowCreatedIndex: index(
      "executions_workflow_created_idx"
    ).on(table.workflowId, table.createdAt),

    statusIndex: index(
      "executions_status_idx"
    ).on(table.status),
  })
);


export const executionSteps = pgTable(
  "execution_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    executionId: uuid("execution_id")
      .notNull()
      .references(() => executions.id, {
        onDelete: "cascade",
      }),

    nodeId: uuid("node_id").references(
      () => workflowNodes.id,
      {
        onDelete: "set null",
      }
    ),

    type: varchar("type", {
      length: 50,
    }).notNull(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    status: varchar("status", {
      length: 20,
    }).notNull(),

    input: jsonb("input"),

    output: jsonb("output"),

    error: text("error"),

    startedAt: timestamp("started_at", {
      withTimezone: true,
    }),

    finishedAt: timestamp("finished_at", {
      withTimezone: true,
    }),

    durationMs: integer("duration_ms"),

    position: integer("position").notNull(),
  },

  (table) => ({
    executionPositionIndex: index(
      "execution_steps_execution_position_idx"
    ).on(table.executionId, table.position),
  })
);


export const credentials = pgTable(
  "credentials",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    type: varchar("type", {
      length: 50,
    }).notNull(),

    data: jsonb("data").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).defaultNow().notNull(),
  },

  (table) => ({
    userTypeIndex: index(
      "credentials_user_type_idx"
    ).on(table.userId, table.type),
  })
);