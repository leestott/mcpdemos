# MCP Demos - Show Run Guide

How to demo all 8 MCP capabilities live, with exact prompts and talking points.

---

## Setup (Once)

Add to `.vscode/settings.json` so Copilot discovers the server:

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

Then open Copilot Chat in **agent mode** - all 18 tools are available automatically.

---

## Demo 1 - The Hook: "Polite CLI vs Teammate"

**Prompt Copilot:**
> "Use demo1_polite_cli to check system status"

It returns a wall of JSON (~40 lines). Then ask:
> "What's actually wrong?"

The agent digs through everything to find "data-pipeline: DEGRADED". That's the pain point. Then try:
> "Run it again with verbose false"

One-line answer.

**Transition:** "What if the tool could ask us what we need?"

---

## Demo 2 - Elicitation: Tools That Ask Questions

**Prompt Copilot:**
> "Scaffold a new project called my-app"

The agent calls `demo2_scaffold_start`. It gets back a structured schema - template picker, Docker toggle, CI checkbox, licence selector. The agent asks you to choose. You say:
> "React app, with Docker and CI, MIT licence"

Agent calls `demo2_scaffold_confirm` - project generated.

**Key point:** The server decided the options. The host just rendered the form.

---

## Demo 3 - Security: Consent Before Action

**Prompt Copilot:**
> "Read my repos - but go through the secure flow"

Agent calls `demo3_request_consent` → gets a consent prompt with scope and expiry. Then calls `demo3_approve_consent` → gets a scoped mock token. Finally calls `demo3_protected_action` → success, token consumed.

Now try:
> "Use that same token again"

"Unauthorised" - one-time use. Try wrong scope too - "insufficient_scope".

**Point:** Consent gates + scoped tokens built into the protocol.

---

## Demo 4 - Async Progress: "3 of 12"

**Prompt Copilot:**
> "Start a build pipeline for acme-app with 800ms delays"

Agent calls `demo4_start_pipeline`, gets a taskId. Then:
> "Check progress"

Agent polls `demo4_check_progress` - "3 of 12", "7 of 12", etc. Each poll shows step name, percentage, and log tail.

**Stage cue:** Pause at "3 of 12" to show progress UI.

---

## Demo 5 - Cancel / Retry / Resume

**Start a pipeline that fails:**
> "Start a pipeline that fails at step 7"

Poll until failure. Then:
> "Resume it and fix the failing step"

Agent calls `demo5_retry_task` with `mode: "resume"` - picks up at step 7, logs show "(fixed!)".

**For cancellation:**
> "Start another pipeline, then cancel it after a few seconds"

Shows clean lifecycle: running → cancelled → retried → completed.

---

## Demo 6 - Colour Picker: Interactive MCP App UI

**Prompt Copilot:**
> "Show me the colour picker"

If the host supports `ui://` resources, the agent reads `ui://color-picker` and an interactive colour picker renders in an iframe. Pick colours, name them, click Save. Then ask:
> "What colours have I saved?"

Agent calls `demo6_get_palette` - palette matches your picks.

**Fallback (no UI support):**
> "Save colour #FF5733 as Sunset Orange"

Works as a text-only tool.

---

## Demo 7 - Component Gallery: Bidirectional Updates

**Prompt Copilot:**
> "Show the component gallery"

Gallery renders with button/card/chart tabs, variant switcher, theme toggle. Click around - each interaction sends a message back to the server. Then:
> "Set the gallery to show the chart in danger variant with light theme"

Agent calls `demo7_gallery_state` with `action: "set"` - server state updates.

**Bidirectional:** UI → server and server → UI.

---

## Demo 8 - Export and Share

**Prompt Copilot:**
> "Generate a report of all demos in markdown"

Agent calls `demo8_export_report` - writes to `outputs/report-<timestamp>.md`. Open the file: demo summary table, VS Code config example, dev mode instructions, pre-share checklist.

> "List all exported reports"

Shows the artifacts.

**Wrap:** "This is the same server you'd commit to your repo and share with teammates via `.vscode/settings.json`."

---

## Timing Options

| Format | What to Cover | Runbook |
|--------|---------------|---------|
| 5 min | Demos 1, 2, 3, 4, 6, 8 | [5-minute-runbook.md](5-minute-runbook.md) |
| 15 min | All 8 with transitions | [15-minute-runbook.md](15-minute-runbook.md) |

Both runbooks have exact timestamps so you know when to move on.

---

## Recovery Cheat Sheet

| Situation | Action |
|-----------|--------|
| Server crashed | Re-run `npm run dev` - all state resets cleanly |
| Task IDs lost | Prompt: "List all tasks" → `demo5_list_tasks` |
| UI doesn't render | Fall back to text-only tool interactions |
| Wrong demo order | Each demo is independent - skip or reorder freely |
| Need a clean slate | Restart the server |
| Token expired/used | Start the OAuth flow again from `demo3_request_consent` |
