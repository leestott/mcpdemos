/**
 * DEMO 4 – Async Tasks + Progress Notifications ("3 of 12")
 *
 * A long-running tool that uses a task-like workflow and emits
 * progress updates displayable in logs and UI.
 * Deterministic "3 of 12" progress point for stage timing.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// In-memory task registry (shared with Demo 5)
export interface TaskState {
  id: string;
  status: "running" | "completed" | "failed" | "cancelled";
  total: number;
  completed: number;
  log: string[];
  startedAt: number;
  error?: string;
}

export const taskRegistry = new Map<string, TaskState>();

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function registerDemo4(server: McpServer): void {
  server.tool(
    "demo4_start_pipeline",
    "Start a long-running build pipeline with 12 steps. " +
      "Returns progress updates as the task runs. " +
      "Use demo4_check_progress to poll status.",
    {
      project: z.string().default("acme-app").describe("Project name"),
      stepDelayMs: z
        .number()
        .min(50)
        .max(5000)
        .default(500)
        .describe("Delay between steps in ms (for demo pacing)"),
      failAtStep: z
        .number()
        .min(0)
        .max(12)
        .default(0)
        .describe("Inject failure at this step (0 = no failure)"),
    },
    async ({ project, stepDelayMs, failAtStep }) => {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const total = STEP_LABELS.length;

      const task: TaskState = {
        id: taskId,
        status: "running",
        total,
        completed: 0,
        log: [`[${new Date().toISOString()}] Pipeline started for ${project}`],
        startedAt: Date.now(),
      };
      taskRegistry.set(taskId, task);

      // Run steps asynchronously (non-blocking to the tool response)
      (async () => {
        for (let i = 0; i < total; i++) {
          // Check for cancellation
          if (task.status === "cancelled") {
            task.log.push(
              `[${new Date().toISOString()}] ✗ Cancelled at step ${i + 1}/${total}`
            );
            return;
          }

          await sleep(stepDelayMs);

          // Inject failure if requested
          if (failAtStep > 0 && i + 1 === failAtStep) {
            task.status = "failed";
            task.error = `Step ${i + 1} "${STEP_LABELS[i]}" failed: simulated error (exit code 1)`;
            task.log.push(
              `[${new Date().toISOString()}] ✗ FAILED: ${STEP_LABELS[i]} — ${task.error}`
            );
            return;
          }

          task.completed = i + 1;
          task.log.push(
            `[${new Date().toISOString()}] ✓ [${i + 1}/${total}] ${STEP_LABELS[i]}`
          );
        }
        task.status = "completed";
        task.log.push(`[${new Date().toISOString()}] ✓ Pipeline completed successfully`);
      })();

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                taskId,
                status: "running",
                total,
                message: `Pipeline started with ${total} steps. Use demo4_check_progress to poll.`,
                _stage_note:
                  "At the '3 of 12' mark the presenter should pause to show progress UI",
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
    "demo4_check_progress",
    "Check progress of a running pipeline task. " +
      "Returns current step, percentage, and log entries.",
    {
      taskId: z.string().describe("Task ID from demo4_start_pipeline"),
    },
    async ({ taskId }) => {
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

      const elapsed = Date.now() - task.startedAt;
      const pct = Math.round((task.completed / task.total) * 100);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                taskId: task.id,
                status: task.status,
                progress: `${task.completed} of ${task.total}`,
                percentage: `${pct}%`,
                elapsedMs: elapsed,
                currentStep:
                  task.completed < task.total
                    ? STEP_LABELS[task.completed]
                    : "(done)",
                lastLog: task.log.slice(-5),
                error: task.error ?? null,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
