/**
 * DEMO 2 – Elicitation Mid-Flow
 *
 * A tool starts, then pauses to request structured user input
 * (config choice, confirmation, selection). Uses the MCP elicitation
 * capability to keep logic server-side while collecting structured data.
 *
 * Flow: agent asks → user chooses → tool continues.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Simulated project templates
const TEMPLATES: Record<string, { files: string[]; deps: string[] }> = {
  "react-app": {
    files: ["src/App.tsx", "src/index.tsx", "public/index.html", "vite.config.ts"],
    deps: ["react", "react-dom", "vite", "@vitejs/plugin-react"],
  },
  "express-api": {
    files: ["src/index.ts", "src/routes/health.ts", "src/middleware/auth.ts"],
    deps: ["express", "@types/express", "cors", "helmet"],
  },
  "static-site": {
    files: ["index.html", "styles/main.css", "scripts/app.js"],
    deps: [],
  },
};

export function registerDemo2(server: McpServer): void {
  // Step 1 tool: start project scaffold, returns elicitation request
  server.tool(
    "demo2_scaffold_start",
    "Begin project scaffolding – presents configuration choices via structured elicitation. " +
      "Returns a structured prompt for the user to choose template, name, and options.",
    {
      projectName: z
        .string()
        .min(1)
        .max(64)
        .regex(/^[a-z0-9-]+$/, "lowercase alphanumeric + hyphens only")
        .describe("Name for the new project"),
    },
    async ({ projectName }) => {
      // In a real MCP host with elicitation support, this would trigger
      // a structured UI prompt. We return the schema so the host can render it.
      const elicitationRequest = {
        _type: "elicitation_request",
        message: `Let's configure project "${projectName}". Please choose your options:`,
        schema: {
          type: "object",
          properties: {
            template: {
              type: "string",
              enum: Object.keys(TEMPLATES),
              description: "Project template to use",
              title: "Template",
            },
            includeDocker: {
              type: "boolean",
              default: false,
              title: "Include Dockerfile?",
              description: "Add Docker configuration files",
            },
            includeCI: {
              type: "boolean",
              default: true,
              title: "Include CI/CD?",
              description: "Add GitHub Actions workflow",
            },
            license: {
              type: "string",
              enum: ["MIT", "Apache-2.0", "BSD-3-Clause", "none"],
              default: "MIT",
              title: "License",
            },
          },
          required: ["template"],
        },
        _stage_script: [
          "1. Agent calls demo2_scaffold_start with project name",
          "2. Server returns this elicitation schema",
          "3. Host renders a form/picker for the user",
          "4. User selects template + options",
          "5. User calls demo2_scaffold_confirm with their choices",
          "6. Server generates the project and returns the result",
        ],
        _concept:
          "Elicitation keeps business logic server-side. The host only " +
          "renders a structured form – it never decides what templates exist " +
          "or what options are valid. This is a key MCP pattern for " +
          "Teams/Playground/VS Code integration.",
        resumeTool: "demo2_scaffold_confirm",
        resumeArgs: {
          projectName,
          template: "<chosen-template>",
          includeDocker: false,
          includeCI: true,
          license: "MIT",
        },
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(elicitationRequest, null, 2),
          },
        ],
      };
    }
  );

  // Step 2 tool: confirm and execute scaffold
  server.tool(
    "demo2_scaffold_confirm",
    "Complete project scaffolding after user has made their choices. " +
      "Resumes the flow started by demo2_scaffold_start.",
    {
      projectName: z.string().min(1).max(64),
      template: z.enum(["react-app", "express-api", "static-site"]),
      includeDocker: z.boolean().default(false),
      includeCI: z.boolean().default(true),
      license: z.enum(["MIT", "Apache-2.0", "BSD-3-Clause", "none"]).default("MIT"),
    },
    async ({ projectName, template, includeDocker, includeCI, license }) => {
      const tmpl = TEMPLATES[template];
      const allFiles = [...tmpl.files];

      if (includeDocker) {
        allFiles.push("Dockerfile", ".dockerignore");
      }
      if (includeCI) {
        allFiles.push(".github/workflows/ci.yml");
      }
      if (license !== "none") {
        allFiles.push("LICENSE");
      }
      allFiles.push("package.json", "README.md", ".gitignore");

      const result = {
        status: "created",
        project: projectName,
        template,
        options: { includeDocker, includeCI, license },
        files_created: allFiles.map((f) => `${projectName}/${f}`),
        dependencies: tmpl.deps,
        next_steps: [
          `cd ${projectName}`,
          tmpl.deps.length > 0 ? "npm install" : null,
          "npm run dev",
        ].filter(Boolean),
        _note:
          "In a real implementation, these files would be written to disk. " +
          "This demo shows the elicitation → confirmation → execution flow.",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
