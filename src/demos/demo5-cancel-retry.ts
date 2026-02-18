/**
 * DEMO 5 – Cancel / Retry / Resume
 *
 * Adds ability to cancel the long task from Demo 4
 * and restart with modified parameters.
 * Demonstrates failure path and "resume with correct inputs" path.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { taskRegistry, type TaskState } from "./demo4-async-progress.js";

export function registerDemo5(server: McpServer): void {
  server.tool(
    "demo5_cancel_task",
    "Cancel a running pipeline task. The task will stop at its current step.",
    {
      taskId: z.string().describe("Task ID to cancel"),
      reason: z.string().default("User requested cancellation").describe("Cancellation reason"),
    },
    async ({ taskId, reason }) => {
      const task = taskRegistry.get(taskId);

      if (!task) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { error: "task_not_found", message: `No task with ID "${taskId}"` },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      if (task.status !== "running") {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error: "invalid_state",
                  message: `Task is "${task.status}", not running. Cannot cancel.`,
                  taskId: task.id,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      task.status = "cancelled";
      task.log.push(`[${new Date().toISOString()}] ⊘ Cancellation requested: ${reason}`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status: "cancelled",
                taskId: task.id,
                stoppedAt: `${task.completed} of ${task.total}`,
                reason,
                message: "Task cancelled. Use demo4_start_pipeline to start a new run, " +
                  "or demo5_retry_task to retry from a specific step.",
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "demo5_retry_task",
    "Retry a failed or cancelled task. Can resume from where it stopped " +
      "or restart entirely with modified parameters.",
    {
      taskId: z.string().describe("Original task ID to retry"),
      mode: z
        .enum(["resume", "restart"])
        .default("resume")
        .describe("Resume from last step or restart from beginning"),
      fixFailingStep: z
        .boolean()
        .default(true)
        .describe("If true, the previously failing step will succeed on retry"),
      stepDelayMs: z
        .number()
        .min(50)
        .max(5000)
        .default(300)
        .describe("Delay between steps"),
    },
    async ({ taskId, mode, fixFailingStep, stepDelayMs }) => {
      const originalTask = taskRegistry.get(taskId);

      if (!originalTask) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { error: "task_not_found", message: `No task with ID "${taskId}"` },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      if (originalTask.status === "running") {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error: "still_running",
                  message: "Task is still running. Cancel it first with demo5_cancel_task.",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      const STEP_LABELS = [
        "Cloning repository",
        "Installing dependencies",
        "Running linter",
        "Running unit tests",
        "Running integration tests",
        "Building frontend bundle",
        "Building backend bundle",
        "Optimizing assets",
        "Running security scan",
        "Generating documentation",
        "Creating deployment package",
        "Publishing artifacts",
      ];

      const startStep = mode === "resume" ? originalTask.completed : 0;
      const total = STEP_LABELS.length;
      const newTaskId = `${taskId}-retry-${Date.now().toString(36)}`;

      const task: TaskState = {
        id: newTaskId,
        status: "running",
        total,
        completed: startStep,
        log: [
          `[${new Date().toISOString()}] Retry of ${taskId} (mode: ${mode}, startStep: ${startStep + 1})`,
          ...(mode === "resume"
            ? originalTask.log
                .filter((l) => l.includes("✓"))
                .map((l) => `[retained] ${l}`)
            : []),
        ],
        startedAt: Date.now(),
      };
      taskRegistry.set(newTaskId, task);

      // Run remaining steps
      const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      (async () => {
        for (let i = startStep; i < total; i++) {
          if (task.status === "cancelled") {
            task.log.push(`[${new Date().toISOString()}] ✗ Cancelled at step ${i + 1}/${total}`);
            return;
          }

          await sleep(stepDelayMs);
          task.completed = i + 1;
          task.log.push(
            `[${new Date().toISOString()}] ✓ [${i + 1}/${total}] ${STEP_LABELS[i]}${
              fixFailingStep && i + 1 === originalTask.completed + 1
                ? " (fixed!)"
                : ""
            }`
          );
        }
        task.status = "completed";
        task.log.push(`[${new Date().toISOString()}] ✓ Pipeline completed on retry`);
      })();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                newTaskId,
                originalTaskId: taskId,
                mode,
                resumeFromStep: startStep + 1,
                total,
                fixFailingStep,
                message:
                  mode === "resume"
                    ? `Resuming from step ${startStep + 1}/${total}. Poll with demo4_check_progress.`
                    : `Restarting from step 1. Poll with demo4_check_progress.`,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "demo5_list_tasks",
    "List all tasks (running, completed, failed, cancelled) for visibility.",
    {},
    async () => {
      const tasks = Array.from(taskRegistry.values()).map((t) => ({
        id: t.id,
        status: t.status,
        progress: `${t.completed}/${t.total}`,
        error: t.error ?? null,
      }));

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ tasks, total: tasks.length }, null, 2),
          },
        ],
      };
    }
  );
}
