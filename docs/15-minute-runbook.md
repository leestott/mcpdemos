# 15-Minute Runbook

Full demo covering all 8 demos with narrative transitions. Each section includes the stage timing, tools to call, and talking points.

## Prerequisites

```bash
node --version   # Must be 20+
npm install
npm run dev      # Server starts on stdio
```

---

## Act I: The Problem and Negotiation [0:00-5:00]

### [0:00-1:30] Demo 1 - Hook: "Polite CLI vs Teammate"

**Goal:** Show the pain of text-only tool responses.

```
Tool: demo1_polite_cli
Args: { command: "status", verbose: true }
```

- **[0:00]** Call the tool - get a wall of JSON
- **[0:20]** Scroll through it. Point out: "Buried in here is one useful fact: data-pipeline is degraded."
- **[0:40]** Call with `command: "deploy-check"` - another verbose response
- **[1:00]** Say: "Every answer requires us to parse through noise. What if the tool could negotiate with us?"
- **[1:15]** Show `verbose: false` - crisp one-liner answer
- **[1:30]** Transition: "MCP lets tools ask structured questions instead of guessing what you need."

### [1:30-3:30] Demo 2 - Elicitation Mid-Flow

**Goal:** Show server-driven structured input collection.

```
Tool: demo2_scaffold_start
Args: { projectName: "my-app" }
```

- **[1:30]** Call the tool - show the elicitation schema
- **[1:50]** Walk through the schema: template enum, Docker boolean, CI toggle, licence picker
- **[2:10]** Point out `_stage_script`: the flow is self-documenting
- **[2:30]** "Now the user responds..."

```
Tool: demo2_scaffold_confirm
Args: { projectName: "my-app", template: "react-app", includeDocker: true, includeCI: true, license: "MIT" }
```

- **[2:40]** Show the result: files created, dependencies listed, next steps
- **[3:00]** Key point: "The SERVER decided what templates exist. The host just rendered a form."
- **[3:20]** Transition: "But what about sensitive operations? We need consent gates."

### [3:30-5:00] Demo 3 - Secure OAuth Handoff

**Goal:** Show 3-step consent → approve → execute flow.

```
Tool: demo3_request_consent
Args: { action: "read-repos" }
```

- **[3:30]** Show consent prompt with scope, expiry, security notes
- **[3:50]** "The tool is asking permission, not just taking action."

```
Tool: demo3_approve_consent
Args: { consentId: "<from previous response>" }
```

- **[4:00]** Show the mock token - emphasise "scoped, ephemeral, in-memory only"

```
Tool: demo3_protected_action
Args: { token: "<from previous>", action: "read-repos" }
```

- **[4:15]** Success! Show the repos. Token is now consumed.
- **[4:30]** Try reusing the token - get "unauthorised". "One-time use. Secure by default."
- **[4:45]** Transition: "We can negotiate, we can secure. Now let's coordinate long work."

---

## Act II: Coordination [5:00-9:00]

### [5:00-7:00] Demo 4 - Async Progress ("3 of 12")

**Goal:** Show long-running task with live progress tracking.

```
Tool: demo4_start_pipeline
Args: { project: "acme-app", stepDelayMs: 800 }
```

- **[5:00]** Start the pipeline - receive taskId
- **[5:15]** Poll: `demo4_check_progress` - show "1 of 12"
- **[5:30]** Poll again - show "3 of 12" ← **Presenter timing cue**
- **[5:45]** "We can see exactly where we are. The tool reports progress, not just final results."
- **[6:00]** Poll 1-2 more times, show progress advancing
- **[6:30]** Wait for completion or move on
- **[6:45]** Start a FAILING pipeline for Demo 5:

```
Tool: demo4_start_pipeline
Args: { project: "acme-app", stepDelayMs: 400, failAtStep: 7 }
```

### [7:00-9:00] Demo 5 - Cancel / Retry / Resume

**Goal:** Show task lifecycle management.

- **[7:00]** Poll the failing task - show failure at step 7

```
Tool: demo4_check_progress
Args: { taskId: "<failing task>" }
```

- **[7:15]** Show error: "Building backend bundle failed"
- **[7:30]** "Let's fix it and resume from where it stopped."

```
Tool: demo5_retry_task
Args: { taskId: "<failing task>", mode: "resume", fixFailingStep: true }
```

- **[7:45]** New task picks up at step 7 - show "(fixed!)" annotation
- **[8:00]** Poll to completion

Now demo cancellation:

```
Tool: demo4_start_pipeline
Args: { project: "another-app", stepDelayMs: 1000 }
```

- **[8:15]** Start a new task. After 2-3 seconds:

```
Tool: demo5_cancel_task
Args: { taskId: "<new task>", reason: "Wrong config" }
```

- **[8:30]** Task stops. Show `demo5_list_tasks` - all task states visible.
- **[8:45]** Transition: "We've been working in text. Now let's go visual."

---

## Act III: Shared Artifacts [9:00-13:00]

### [9:00-11:00] Demo 6 - Colour Picker MCP App

**Goal:** Show interactive UI served via MCP resource.

```
Resource: ui://color-picker
```

- **[9:00]** Agent reads the resource - host renders the colour picker iframe
- **[9:15]** Pick colours interactively, name them
- **[9:30]** Click "Save Colour" - UI sends message to server
- **[9:45]** Call `demo6_get_palette` - show colours saved server-side
- **[10:00]** Click "Send to Chat" - summary flows back to conversation

**If host doesn't support `ui://`:**

```
Tool: demo6_save_color
Args: { color: "#FF5733", name: "Sunset Orange" }
```

- **[10:15]** "Even without UI rendering, the tools work as text-only fallback."

### [11:00-13:00] Demo 7 - Component Gallery Viewer

**Goal:** Show bidirectional server ↔ UI communication.

```
Resource: ui://component-gallery
```

- **[11:00]** Render the gallery - show button, card, chart tabs
- **[11:15]** Switch variants: primary → danger → outline
- **[11:30]** Toggle theme: dark → light
- **[11:45]** Each click sends a message back to the server
- **[12:00]** Call `demo7_gallery_state` with `action: "get"` - state matches UI

```
Tool: demo7_gallery_state
Args: { action: "set", component: "chart", variant: "danger", theme: "light" }
```

- **[12:15]** "The server can also push state TO the UI."
- **[12:30]** Transition: "Let's wrap up and package everything."

---

## Finale: Platform and Distribution [13:00-15:00]

### [13:00-15:00] Demo 8 - Export and Dev Mode

**Goal:** Generate a shareable report and explain the distribution story.

```
Tool: demo8_export_report
Args: { title: "MCP Demos – SF Presentation", includeDevMode: true, format: "markdown" }
```

- **[13:00]** Generate the report
- **[13:15]** Open and walk through it:
  - Demo summary table
  - VS Code MCP config sharing
  - Dev mode commands
  - Pre-share checklist
- **[13:45]** Call `demo8_list_exports` - show all generated artifacts

- **[14:00]** Key talking points:
  - "VS Code stores MCP config in `.vscode/settings.json` - share via repo"
  - "Dev mode: `npm run dev`. Production: `npm run build && npm start`"
  - "Checklist: verify all tools, test resources, confirm no secrets"
- **[14:30]** "This is the same server you'd package and share with your team."
- **[14:45]** Wrap up: "8 patterns. From text-only to interactive apps. All running locally."

---

## Quick Recovery Notes

| Situation | Action |
|-----------|--------|
| Server crashed | Re-run `npm run dev` - all state resets cleanly |
| Task IDs lost | `demo5_list_tasks` shows all tasks |
| UI doesn't render | Fall back to tool-based text interactions |
| Wrong demo order | Each demo is independent - skip or reorder freely |
| Need to reset | Restart the server - clean slate |
