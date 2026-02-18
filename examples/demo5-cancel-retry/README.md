# Demo 5: Cancel / Retry / Resume

## Purpose

Extends Demo 4 with task lifecycle management: cancel running tasks, retry failed ones from where they stopped, or restart entirely with different parameters. Shows how MCP tools handle failure paths and recovery workflows.

## Setup

```bash
npm install
npm run dev
```

Tools registered: `demo5_cancel_task`, `demo5_retry_task`, `demo5_list_tasks`

## Stage Script (Timeline)

### Path A: Cancel and Restart

1. **[0:00]** Start a pipeline via `demo4_start_pipeline` with `stepDelayMs: 1000`
2. **[0:03]** Call `demo5_cancel_task` with the taskId - task stops at current step
3. **[0:05]** Call `demo5_list_tasks` - show the cancelled task
4. **[0:08]** Call `demo5_retry_task` with `mode: "restart"` - starts from step 1

### Path B: Failure and Resume

1. **[0:00]** Start a pipeline with `failAtStep: 7` (fails at "Building backend bundle")
2. **[0:05]** Poll progress until failure - show error message
3. **[0:08]** Call `demo5_retry_task` with `mode: "resume"`, `fixFailingStep: true`
4. **[0:10]** New task resumes from step 7 - the previously-failing step now succeeds
5. **[0:15]** Poll to completion - show "(fixed!)" annotation in logs

## What Can Go Wrong + Fallback

| Issue | Fallback |
|-------|----------|
| Task finishes before cancel | Use longer `stepDelayMs` or start a new task |
| Retry on running task | Error tells you to cancel first |
| Original taskId lost | Use `demo5_list_tasks` to find it |
| Resume starts at wrong step | Verify `mode: "resume"` (not "restart") |

## Security Notes

- No real processes are spawned or killed
- All state is in-memory and ephemeral
- No file system or network operations
