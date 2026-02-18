# MCP Demos

8 runnable demos showcasing Model Context Protocol capabilities - from text-only tools to interactive MCP Apps with bidirectional communication.

## Quick Start

```bash
node --version   # Requires Node 20+
npm install
npm run dev      # Start MCP server (stdio transport)
```

For production:

```bash
npm run build
npm start
```

## VS Code Configuration

Add to `.vscode/settings.json` to auto-discover the server:

```json
{
  "mcp": {
    "servers": {
      "mcpdemos": {
        "command": "node",
        "args": ["dist/index.js"],
        "cwd": "${workspaceFolder}"
      }
    }
  }
}
```

For development with `tsx`:

```json
{
  "mcp": {
    "servers": {
      "mcpdemos": {
        "command": "npx",
        "args": ["tsx", "src/index.ts"],
        "cwd": "${workspaceFolder}"
      }
    }
  }
}
```

## Demos

| # | Demo | Category | Tools | Resources |
|---|------|----------|-------|-----------|
| 1 | [Polite CLI vs Teammate](examples/demo1-polite-cli/) | Hook | `demo1_polite_cli` | - |
| 2 | [Elicitation Mid-Flow](examples/demo2-elicitation/) | Negotiation | `demo2_scaffold_start`, `demo2_scaffold_confirm` | - |
| 3 | [Secure OAuth Handoff](examples/demo3-oauth/) | Security | `demo3_request_consent`, `demo3_approve_consent`, `demo3_protected_action` | - |
| 4 | [Async Progress](examples/demo4-async-progress/) | Coordination | `demo4_start_pipeline`, `demo4_check_progress` | - |
| 5 | [Cancel / Retry / Resume](examples/demo5-cancel-retry/) | Coordination | `demo5_cancel_task`, `demo5_retry_task`, `demo5_list_tasks` | - |
| 6 | [Colour Picker](examples/demo6-color-picker/) | Shared Artifacts | `demo6_save_color`, `demo6_get_palette` | `ui://color-picker` |
| 7 | [Component Gallery](examples/demo7-component-gallery/) | Shared Artifacts | `demo7_gallery_state` | `ui://component-gallery` |
| 8 | [Export Artifacts](examples/demo8-export-artifacts/) | Platform | `demo8_export_report`, `demo8_list_exports` | - |

## Runbooks
- [ShowRun All Demos](docs/showrun.md) - All Demos Walkthrough Script
- [5-Minute Runbook](docs/5-minute-runbook.md) - Quick highlights (Demos 1, 2, 3, 4, 6, 8)
- [15-Minute Runbook](docs/15-minute-runbook.md) - Full walkthrough with stage timing for all 8 demos

## Architecture

```
src/
  index.ts                     ← Server entry point (stdio transport)
  demos/
    demo1-polite-cli.ts        ← Tool: verbose CLI responses
    demo2-elicitation.ts       ← Tools: scaffold start + confirm
    demo3-oauth.ts             ← Tools: consent → approve → action
    demo4-async-progress.ts    ← Tools: pipeline + progress polling
    demo5-cancel-retry.ts      ← Tools: cancel, retry, list tasks
    demo6-color-picker.ts      ← Tool + Resource: colour picker UI
    demo7-component-gallery.ts ← Tool + Resource: gallery UI
    demo8-export-artifacts.ts  ← Tool: report generation
examples/
  demo{1-8}/README.md          ← Per-demo docs with stage scripts
docs/
  5-minute-runbook.md
  15-minute-runbook.md
outputs/                        ← Generated reports (Demo 8)
```

## Graceful Degradation

If a host doesn't support MCP Apps (`ui://` resources), all demos fall back to text-only tool interactions. The UI resources are optional enhancements.

## Dependencies

- `@modelcontextprotocol/sdk` - MCP server framework
- `zod` - Schema validation
- `tsx` (dev) - TypeScript execution
- No external APIs, databases, or cloud services required

## Licence

MIT
