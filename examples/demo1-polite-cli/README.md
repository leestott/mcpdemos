# Demo 1: Polite CLI vs Teammate

## Purpose

Demonstrates the "before" experience of interacting with a tool that returns only text/JSON and forces back-and-forth dialogue. The output is intentionally verbose to contrast with the streamlined MCP patterns shown in later demos. This is the **hook** - it shows what we're improving.

## Setup

```bash
npm install
npm run dev
```

The server registers the `demo1_polite_cli` tool automatically.

## Stage Script (Timeline)

1. **[0:00]** Presenter calls `demo1_polite_cli` with `command: "status"` and `verbose: true`
2. **[0:15]** Tool returns a massive JSON blob (~40 lines) - point out the `_hint` field buried at the bottom
3. **[0:30]** Presenter asks: "What's actually wrong?" - agent must parse through all that data
4. **[0:45]** Repeat with `command: "deploy-check"` - another wall of JSON
5. **[1:00]** Show the same calls with `verbose: false` - one-line answers
6. **[1:15]** Transition: "What if the tool could ask US what we need, instead of dumping everything?"

## What Can Go Wrong + Fallback

| Issue | Fallback |
|-------|----------|
| Server won't start | Check `npm run dev` output; ensure Node 20+ |
| Tool not found by host | Verify MCP host config points to this server |
| JSON too long for display | This is intentional - it's the demo point |

## Security Notes

- No external API calls are made
- All data is synthetic / hardcoded
- No file system writes
- No permissions required beyond stdio transport
