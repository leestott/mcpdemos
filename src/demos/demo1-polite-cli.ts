/**
 * DEMO 1 – "Polite CLI vs Teammate"
 *
 * A tool that returns only text/JSON, forcing back-and-forth.
 * Output is intentionally verbose to show the "before" experience.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerDemo1(server: McpServer): void {
  server.tool(
    "demo1_polite_cli",
    "Verbose CLI-style helper – returns long text/JSON requiring multiple round-trips. " +
      "Demonstrates the 'before' experience of chatting with a polite but wordy tool.",
    {
      command: z
        .enum(["status", "list-files", "deploy-check"])
        .describe("The CLI command to run"),
      verbose: z
        .boolean()
        .default(true)
        .describe("Enable verbose output (default: true for demo)"),
    },
    async ({ command, verbose }) => {
      const now = new Date().toISOString();

      if (command === "status") {
        const payload = {
          _notice:
            "This response is intentionally verbose to demonstrate the 'before' experience.",
          timestamp: now,
          system: {
            name: "acme-platform",
            version: "4.12.7-rc3",
            region: "us-west-2",
            uptime_seconds: 847291,
            uptime_human: "9 days 19 hours 21 minutes 31 seconds",
          },
          services: [
            {
              name: "api-gateway",
              status: "healthy",
              latency_ms: 23,
              last_check: now,
              instances: 4,
              cpu_percent: 12.3,
              memory_mb: 512,
            },
            {
              name: "auth-service",
              status: "healthy",
              latency_ms: 45,
              last_check: now,
              instances: 2,
              cpu_percent: 8.7,
              memory_mb: 256,
            },
            {
              name: "data-pipeline",
              status: "degraded",
              latency_ms: 1200,
              last_check: now,
              instances: 3,
              cpu_percent: 87.2,
              memory_mb: 2048,
              warnings: [
                "Queue depth exceeding threshold (1,247 items)",
                "Worker 3 restarted 2 times in last hour",
              ],
            },
            {
              name: "notification-service",
              status: "healthy",
              latency_ms: 67,
              last_check: now,
              instances: 2,
              cpu_percent: 5.1,
              memory_mb: 128,
            },
          ],
          _hint:
            "You probably wanted: data-pipeline is DEGRADED. " +
            "Everything else is fine. But I gave you 40 lines of JSON instead.",
        };

        return {
          content: [
            {
              type: "text" as const,
              text: verbose
                ? JSON.stringify(payload, null, 2)
                : "data-pipeline: DEGRADED (high CPU, queue depth warning). All other services healthy.",
            },
          ],
        };
      }

      if (command === "list-files") {
        const files = Array.from({ length: 25 }, (_, i) => ({
          name: `report-${String(i + 1).padStart(3, "0")}.csv`,
          size_bytes: Math.floor(Math.random() * 500_000) + 1000,
          modified: new Date(Date.now() - Math.random() * 86_400_000 * 30).toISOString(),
          owner: ["alice", "bob", "carol"][i % 3],
        }));

        const payload = {
          _notice: "Here are ALL 25 files with full metadata. You probably only needed the names.",
          total: files.length,
          files,
        };

        return {
          content: [
            {
              type: "text" as const,
              text: verbose
                ? JSON.stringify(payload, null, 2)
                : files.map((f) => f.name).join("\n"),
            },
          ],
        };
      }

      // deploy-check
      const checks = [
        { check: "Tests passing", result: "PASS", details: "247/247 tests passed in 34s" },
        { check: "Lint clean", result: "PASS", details: "0 errors, 0 warnings" },
        { check: "Build artifact", result: "PASS", details: "Bundle size 1.2 MB (limit 5 MB)" },
        { check: "Staging deploy", result: "PASS", details: "Deployed to staging-us-west-2" },
        {
          check: "Integration tests",
          result: "WARN",
          details: "2 flaky tests skipped (test-payment-retry, test-webhook-timeout)",
        },
        { check: "Security scan", result: "PASS", details: "0 critical, 0 high, 3 low findings" },
        { check: "Approval", result: "PENDING", details: "Waiting for @reviewer approval in PR #1042" },
      ];

      const payload = {
        _notice:
          "Full deploy readiness report below. TL;DR: blocked on PR approval, " +
          "2 flaky tests, otherwise ready.",
        deployment_id: "deploy-20260218-001",
        target: "production",
        checks,
        summary: {
          pass: checks.filter((c) => c.result === "PASS").length,
          warn: checks.filter((c) => c.result === "WARN").length,
          pending: checks.filter((c) => c.result === "PENDING").length,
          fail: 0,
        },
        recommendation: "HOLD – waiting for approval",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: verbose
              ? JSON.stringify(payload, null, 2)
              : "Deploy HOLD: PR #1042 needs approval. 2 flaky tests skipped. Otherwise ready.",
          },
        ],
      };
    }
  );
}
