# Demo 4: Async Tasks + Progress Notifications ("3 of 12")

## Purpose

A long-running build pipeline with 12 steps that emits progress updates. Demonstrates task-like workflow patterns and progress reporting in MCP tools. The deterministic "3 of 12" progress point provides a reliable stage timing cue.

## Setup

```bash
npm install
npm run dev
```

Tools registered: `demo4_start_pipeline`, `demo4_check_progress`

## Stage Script (Timeline)

1. **[0:00]** Call `demo4_start_pipeline` with `project: "acme-app"`, `stepDelayMs: 500`
2. **[0:05]** Receive `taskId` - pipeline is running async in the background
3. **[0:10]** Call `demo4_check_progress` - show "1 of 12" progress
4. **[0:15]** Poll again - show "3 of 12" ← **stage timing cue for presenter**
5. **[0:20]** Poll once more - show progress advancing
6. **[0:30]** Wait for completion - show "12 of 12", status: "completed"
7. **[0:35]** (Optional) Start a new pipeline with `failAtStep: 7` to set up Demo 5

## What Can Go Wrong + Fallback

| Issue | Fallback |
|-------|----------|
| Task completes before polling | Increase `stepDelayMs` to 1000+ |
| taskId not found | Copy exact taskId from the start response |
| Pipeline runs too slow | Decrease `stepDelayMs` to 100 for fast demo |
| Need deterministic "3 of 12" | Set `stepDelayMs: 1500` and poll at ~4.5s |

## Security Notes

- All processing is simulated - no real builds are executed
- No file system writes
- Task state is in-memory only, lost on server restart
- No external network calls
