# Demo 8: Export Artifacts + Dev Mode Narrative

## Purpose

An "export demo artifacts" tool that writes markdown or JSON reports to `/outputs`. Includes guidance on sharing MCP server configurations via VS Code workspace settings, packaging for distribution, and a pre-share verification checklist.

## Setup

```bash
npm install
npm run dev
```

Tools registered: `demo8_export_report`, `demo8_list_exports`

## Stage Script (Timeline)

1. **[0:00]** Call `demo8_export_report` with `title: "Sprint Demo Report"`, `format: "markdown"`
2. **[0:10]** Report is written to `/outputs/report-<timestamp>.md`
3. **[0:15]** Open the generated file - show demo summary table, VS Code config example, dev mode section
4. **[0:25]** Call `demo8_list_exports` - show all generated reports
5. **[0:30]** Call `demo8_export_report` with `format: "json"` - show JSON alternative
6. **[0:40]** Walk through the report's "Sharing & Distribution" section
7. **[0:50]** Walk through the "Dev Mode" and "Pre-Share Checklist" sections
8. **[1:00]** Explain how `.vscode/settings.json` allows teams to share MCP server config

## What Can Go Wrong + Fallback

| Issue | Fallback |
|-------|----------|
| Permission error writing to /outputs | Ensure the process can write to the working directory |
| File already exists | Timestamps prevent collisions |
| Report is empty | Check that `format` is "markdown" or "json" |

## Security Notes

- Writes only to the local `/outputs` directory
- No external network calls
- Reports contain only synthetic demo data
- No secrets or tokens are included in reports
- The VS Code settings example uses `${workspaceFolder}` - no hardcoded paths

## VS Code MCP Server Config (Reference)

Teams can share MCP server configurations by committing `.vscode/settings.json`:

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

This is stored per-workspace and can be version-controlled in the repository.

## Dev Mode Quick Reference

| Action | Command |
|--------|---------|
| Run locally (dev) | `npm run dev` |
| Build for production | `npm run build` |
| Run production | `npm start` |
| Clean outputs | `npm run clean` |
