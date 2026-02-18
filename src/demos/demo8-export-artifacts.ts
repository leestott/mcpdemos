/**
 * DEMO 8 – Response-to-File Distribution + Dev Mode Narrative
 *
 * "Export demo artifacts" tool: writes a markdown report to /outputs
 * and explains sharing, VS Code config, and dev mode workflow.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

// Resolves relative to CWD; when run via VS Code MCP config, CWD is workspaceFolder
const OUTPUTS_DIR = path.resolve("outputs");

export function registerDemo8(server: McpServer): void {
  server.tool(
    "demo8_export_report",
    "Generate a markdown report of all demos and write it to /outputs. " +
      "Includes sharing guidance, VS Code config, and dev mode checklist.",
    {
      title: z.string().default("MCP Demos Report").describe("Report title"),
      includeDevMode: z
        .boolean()
        .default(true)
        .describe("Include dev mode section"),
      format: z
        .enum(["markdown", "json"])
        .default("markdown")
        .describe("Output format"),
    },
    async ({ title, includeDevMode, format }) => {
      await fs.mkdir(OUTPUTS_DIR, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const ext = format === "json" ? "json" : "md";
      const filename = `report-${timestamp}.${ext}`;
      const filepath = path.join(OUTPUTS_DIR, filename);

      const demoSummaries = [
        { id: 1, name: "Polite CLI vs Teammate", status: "✓", category: "Hook" },
        { id: 2, name: "Elicitation Mid-Flow", status: "✓", category: "Negotiation" },
        { id: 3, name: "Secure OAuth Handoff", status: "✓", category: "Security" },
        { id: 4, name: "Async Progress (3 of 12)", status: "✓", category: "Coordination" },
        { id: 5, name: "Cancel / Retry / Resume", status: "✓", category: "Coordination" },
        { id: 6, name: "Color Picker MCP App", status: "✓", category: "Shared Artifacts" },
        { id: 7, name: "Component Gallery Viewer", status: "✓", category: "Shared Artifacts" },
        { id: 8, name: "Export & Distribution", status: "✓", category: "Callback Platform" },
      ];

      if (format === "json") {
        const jsonReport = {
          title,
          generatedAt: new Date().toISOString(),
          demos: demoSummaries,
          devMode: includeDevMode
            ? {
                runLocally: "npm run dev",
                build: "npm run build && npm start",
                checklist: [
                  "All 8 tools register without errors",
                  "Resources ui://color-picker and ui://component-gallery resolve",
                  "Progress polling works end-to-end",
                  "OAuth flow completes 3-step sequence",
                  "Export writes to /outputs",
                ],
              }
            : undefined,
        };

        const content = JSON.stringify(jsonReport, null, 2);
        await fs.writeFile(filepath, content, "utf-8");

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { status: "exported", file: filepath, format, size: content.length },
                null,
                2
              ),
            },
          ],
        };
      }

      // Markdown format
      let md = `# ${title}\n\n`;
      md += `**Generated:** ${new Date().toISOString()}\n\n`;
      md += `## Demo Summary\n\n`;
      md += `| # | Demo | Category | Status |\n`;
      md += `|---|------|----------|--------|\n`;
      for (const d of demoSummaries) {
        md += `| ${d.id} | ${d.name} | ${d.category} | ${d.status} |\n`;
      }

      md += `\n## Sharing & Distribution\n\n`;
      md += `### VS Code MCP Server Configuration\n\n`;
      md += `VS Code stores MCP server configuration in workspace settings. Teams can share\n`;
      md += `server configurations by committing the settings to the repository.\n\n`;
      md += "```json\n";
      md += `// .vscode/settings.json\n`;
      md += `{\n`;
      md += `  "mcp": {\n`;
      md += `    "servers": {\n`;
      md += `      "mcpdemos": {\n`;
      md += `        "command": "node",\n`;
      md += `        "args": ["dist/index.js"],\n`;
      md += `        "cwd": "\${workspaceFolder}"\n`;
      md += `      }\n`;
      md += `    }\n`;
      md += `  }\n`;
      md += `}\n`;
      md += "```\n\n";
      md += `This allows any team member who clones the repo to automatically have the\n`;
      md += `MCP server available without manual configuration.\n\n`;

      md += `### Sharing this Report\n\n`;
      md += `This report was written to \`${filepath}\`. You can:\n`;
      md += `- Attach it to a PR or issue\n`;
      md += `- Share via Teams or Slack\n`;
      md += `- Include in sprint documentation\n\n`;

      if (includeDevMode) {
        md += `## Dev Mode\n\n`;
        md += `### Running Locally\n\n`;
        md += "```bash\n";
        md += `# Install dependencies\n`;
        md += `npm install\n\n`;
        md += `# Development (with tsx hot-reload)\n`;
        md += `npm run dev\n\n`;
        md += `# Production build\n`;
        md += `npm run build && npm start\n`;
        md += "```\n\n";
        md += `### Packaging for Distribution\n\n`;
        md += `1. Run \`npm run build\` to compile TypeScript\n`;
        md += `2. The \`dist/\` folder contains the production server\n`;
        md += `3. Distribute via npm package, Docker container, or repo clone\n`;
        md += `4. Recipients configure their MCP host to point at the server\n\n`;
        md += `### Pre-Share Checklist\n\n`;
        md += `- [ ] All 8 tools register without errors\n`;
        md += `- [ ] Resources \`ui://color-picker\` and \`ui://component-gallery\` resolve\n`;
        md += `- [ ] Progress polling works end-to-end (Demo 4 + 5)\n`;
        md += `- [ ] OAuth flow completes 3-step sequence (Demo 3)\n`;
        md += `- [ ] Export writes to \`/outputs\` without permission errors\n`;
        md += `- [ ] No real secrets or tokens are embedded\n`;
        md += `- [ ] README and runbooks are up to date\n`;
      }

      await fs.writeFile(filepath, md, "utf-8");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status: "exported",
                file: filepath,
                format,
                size: md.length,
                message: `Report written to ${filepath}. Share it via PR, chat, or docs.`,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool to list exported artifacts
  server.tool(
    "demo8_list_exports",
    "List all exported reports in the /outputs directory.",
    {},
    async () => {
      try {
        await fs.mkdir(OUTPUTS_DIR, { recursive: true });
        const files = await fs.readdir(OUTPUTS_DIR);
        const reports = files.filter((f) => f.startsWith("report-"));

        const details = await Promise.all(
          reports.map(async (f) => {
            const stat = await fs.stat(path.join(OUTPUTS_DIR, f));
            return {
              file: f,
              size: stat.size,
              created: stat.birthtime.toISOString(),
            };
          })
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { outputDir: OUTPUTS_DIR, reports: details, total: details.length },
                null,
                2
              ),
            },
          ],
        };
      } catch {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                { outputDir: OUTPUTS_DIR, reports: [], total: 0, note: "No exports yet." },
                null,
                2
              ),
            },
          ],
        };
      }
    }
  );
}
