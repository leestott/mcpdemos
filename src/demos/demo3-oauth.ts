/**
 * DEMO 3 – Secure OAuth Handoff Simulation
 *
 * When a tool needs a protected action, it requires a "consent" step
 * and returns a mock "token scoped to this server".
 *
 * No real secrets are used – all tokens are local stubs.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import crypto from "node:crypto";

// In-memory token store (never persisted, never leaves the process)
const tokenStore = new Map<string, { scope: string; expiresAt: number; userId: string }>();

function generateMockToken(): string {
  return `mcp_demo_${crypto.randomBytes(16).toString("hex")}`;
}

export function registerDemo3(server: McpServer): void {
  // Step 1: Request consent – returns an authorization URL and instructions
  server.tool(
    "demo3_request_consent",
    "Initiate a secure OAuth-style handoff. Returns a mock authorization prompt " +
      "that the user must approve before the protected action can proceed. " +
      "No real secrets are involved – this is a simulation.",
    {
      action: z
        .enum(["read-repos", "write-issues", "admin-settings"])
        .describe("The protected action being requested"),
      userId: z.string().default("demo-user").describe("Simulated user ID"),
    },
    async ({ action, userId }) => {
      const scopeMap: Record<string, string> = {
        "read-repos": "repos:read",
        "write-issues": "issues:write",
        "admin-settings": "admin:all",
      };

      const scope = scopeMap[action];
      const consentId = crypto.randomBytes(8).toString("hex");

      const response = {
        _type: "consent_required",
        consentId,
        action,
        scope,
        message:
          `This tool wants to perform "${action}" which requires "${scope}" permission. ` +
          `Please confirm by calling demo3_approve_consent with the consentId below.`,
        securityNotes: [
          "Token is scoped only to this MCP server instance",
          "Token expires in 5 minutes",
          "No real OAuth provider is contacted",
          "Token never leaves this process",
          `Environment variable MCP_DEMO_SECRET=${process.env.MCP_DEMO_SECRET ? "(set)" : "(not set – safe default used)"}`,
        ],
        consentPrompt: {
          consentId,
          scope,
          userId,
          expiresInSeconds: 300,
          _instruction: "Call demo3_approve_consent with this consentId to proceed",
        },
      };

      // Store pending consent
      tokenStore.set(consentId, {
        scope,
        expiresAt: Date.now() + 300_000,
        userId,
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  // Step 2: Approve consent and receive mock token
  server.tool(
    "demo3_approve_consent",
    "Approve a pending consent request and receive a scoped mock token. " +
      "The token is ephemeral and never leaves the server process.",
    {
      consentId: z.string().describe("The consent ID from demo3_request_consent"),
    },
    async ({ consentId }) => {
      const pending = tokenStore.get(consentId);

      if (!pending) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error: "invalid_consent",
                  message: "Consent ID not found or already used. Request a new one.",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      if (Date.now() > pending.expiresAt) {
        tokenStore.delete(consentId);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error: "consent_expired",
                  message: "Consent expired. Please request a new one via demo3_request_consent.",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      // Issue mock token
      const token = generateMockToken();
      tokenStore.delete(consentId); // One-time use

      const result = {
        status: "approved",
        token,
        scope: pending.scope,
        userId: pending.userId,
        expiresIn: "5 minutes",
        securityNotes: [
          "This token is a LOCAL MOCK – not a real OAuth token",
          "It exists only in server memory and will vanish on restart",
          "Real implementations should use PKCE + short-lived tokens",
          "Never log or return tokens in production MCP servers",
        ],
        _demo_usage: `Call demo3_protected_action with token="${token}" to simulate the protected operation.`,
      };

      // Store token for validation
      tokenStore.set(token, {
        scope: pending.scope,
        expiresAt: Date.now() + 300_000,
        userId: pending.userId,
      });

      return {
        content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Step 3: Execute the protected action
  server.tool(
    "demo3_protected_action",
    "Execute a protected action using the mock token from demo3_approve_consent. " +
      "Validates the token is present, unexpired, and properly scoped.",
    {
      token: z.string().describe("Mock token from demo3_approve_consent"),
      action: z
        .enum(["read-repos", "write-issues", "admin-settings"])
        .describe("Action to perform"),
    },
    async ({ token, action }) => {
      const session = tokenStore.get(token);

      if (!session) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error: "unauthorized",
                  message:
                    "Invalid or expired token. Start the flow with demo3_request_consent.",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      if (Date.now() > session.expiresAt) {
        tokenStore.delete(token);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { error: "token_expired", message: "Token has expired. Re-authenticate." },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      const scopeMap: Record<string, string> = {
        "read-repos": "repos:read",
        "write-issues": "issues:write",
        "admin-settings": "admin:all",
      };

      if (session.scope !== scopeMap[action]) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  error: "insufficient_scope",
                  required: scopeMap[action],
                  granted: session.scope,
                  message: "Token does not have the required scope for this action.",
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }

      // Simulate the protected action
      const mockResults: Record<string, unknown> = {
        "read-repos": {
          repos: [
            { name: "frontend-app", stars: 42, language: "TypeScript" },
            { name: "backend-api", stars: 18, language: "Python" },
            { name: "shared-utils", stars: 7, language: "TypeScript" },
          ],
        },
        "write-issues": {
          issue: {
            number: 1043,
            title: "Demo issue created via MCP",
            state: "open",
            url: "https://example.com/issues/1043",
          },
        },
        "admin-settings": {
          settings: {
            autoMerge: true,
            requiredReviewers: 2,
            branchProtection: "main",
            updated: true,
          },
        },
      };

      // Clean up token after use
      tokenStore.delete(token);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status: "success",
                action,
                scope: session.scope,
                userId: session.userId,
                result: mockResults[action],
                _note: "Token consumed. A new consent flow is required for the next action.",
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
