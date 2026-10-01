import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import {
  users,
  workflows,
  workflowNodes,
} from "./schema.js";

const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";

const TEST_WORKFLOW_ID =
  "22222222-2222-2222-2222-222222222222";

const NODE_ONE_ID =
  "33333333-3333-3333-3333-333333333333";

const NODE_TWO_ID =
  "44444444-4444-4444-4444-444444444444";

async function seed() {
  console.log("Starting database seed...");

  
  await db
    .insert(users)
    .values({
      id: TEST_USER_ID,
      email: "seed@example.com",
      passwordHash:
        "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ123456",
      name: "Seed User",
    })
    .onConflictDoNothing();


  await db
    .insert(workflows)
    .values({
      id: TEST_WORKFLOW_ID,
      userId: TEST_USER_ID,
      name: "Sample Workflow",
      description: "Development sample workflow",
      status: "inactive",
      triggerType: "manual",
      triggerConfig: {},
      isDeleted: false,
    })
    .onConflictDoNothing();


  await db
    .insert(workflowNodes)
    .values([
      {
        id: NODE_ONE_ID,
        workflowId: TEST_WORKFLOW_ID,
        type: "http_request",
        name: "Example HTTP Request",
        config: {
          method: "GET",
          url: "https://example.com",
        },
        position: 0,
      },
      {
        id: NODE_TWO_ID,
        workflowId: TEST_WORKFLOW_ID,
        type: "delay",
        name: "Wait",
        config: {
          duration: 5,
          unit: "seconds",
        },
        position: 1,
      },
    ])
    .onConflictDoNothing();

  console.log("Database seed completed successfully.");
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });