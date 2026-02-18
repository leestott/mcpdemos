# 5-Minute Runbook

Quick demo path hitting the highlights. Use when time is tight.

## Prerequisites

```bash
node --version   # Must be 20+
npm install
npm run dev      # Server starts on stdio
```

## Timeline

### [0:00–0:45] Hook: The "Before" Experience (Demo 1)

```
Tool: demo1_polite_cli
Args: { command: "status", verbose: true }
```

- Show the wall of JSON (40+ lines)
- Point out the `_hint` buried at the bottom
- Say: "This is what happens when tools can only return text."

### [0:45–1:30] Elicitation: Tools That Ask Questions (Demo 2)

```
Tool: demo2_scaffold_start
Args: { projectName: "my-app" }
```

- Show the structured schema returned
- Walk through: "Agent asks → User chooses → Tool continues"

```
Tool: demo2_scaffold_confirm
Args: { projectName: "my-app", template: "react-app", includeDocker: true, includeCI: true, license: "MIT" }
```

- Show the generated project output

### [1:30–2:30] Security: Consent Before Action (Demo 3)

```
Tool: demo3_request_consent → demo3_approve_consent → demo3_protected_action
```

- Run all 3 steps quickly
- Emphasise: "Token is scoped, ephemeral, one-time use"

### [2:30–3:30] Progress: Watching Work Happen (Demo 4)

```
Tool: demo4_start_pipeline
Args: { project: "acme-app", stepDelayMs: 300 }
```

- Poll with `demo4_check_progress` 2-3 times
- Show "3 of 12" progress

### [3:30–4:15] Interactive UI: Colour Picker (Demo 6)

```
Resource: ui://color-picker
```

- If host renders it: pick a colour, save it
- If not: call `demo6_save_color` directly

### [4:15–5:00] Export and Share (Demo 8)

```
Tool: demo8_export_report
Args: { title: "Quick Demo", format: "markdown" }
```

- Show the generated report
- Mention VS Code settings sharing

## Demos Skipped (Cover in 15-min version)

- Demo 5: Cancel/retry/resume
- Demo 7: Component gallery
