#!/usr/bin/env node
/**
 * MCP Demos Server – registers all 8 demo tools and resources.
 * Transport: stdio (compatible with VS Code, Claude Desktop, any MCP host).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerDemo1 } from "./demos/demo1-polite-cli.js";
import { registerDemo2 } from "./demos/demo2-elicitation.js";
import { registerDemo3 } from "./demos/demo3-oauth.js";
import { registerDemo4 } from "./demos/demo4-async-progress.js";
import { registerDemo5 } from "./demos/demo5-cancel-retry.js";
import { registerDemo6 } from "./demos/demo6-color-picker.js";
import { registerDemo7 } from "./demos/demo7-component-gallery.js";
import { registerDemo8 } from "./demos/demo8-export-artifacts.js";

const server = new McpServer({
  name: "mcpdemos",
  version: "1.0.0",
});

// Register all demo tools & resources
registerDemo1(server);
registerDemo2(server);
registerDemo3(server);
registerDemo4(server);
registerDemo5(server);
registerDemo6(server);
registerDemo7(server);
registerDemo8(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[mcpdemos] Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
