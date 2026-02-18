# Demo 6: MCP Apps "Colour Picker" Interactive UI

## Purpose

An interactive colour picker served as an MCP App resource (`ui://color-picker`). Demonstrates self-contained HTML UI running in a sandboxed iframe that communicates with the MCP server via `postMessage`. Users can pick colours, save them to a server-side palette, and send summaries to chat.

## Setup

```bash
npm install
npm run dev
```

Resource: `ui://color-picker`
Tools: `demo6_save_color`, `demo6_get_palette`

## Stage Script (Timeline)

1. **[0:00]** Agent reads the `ui://color-picker` resource - host renders the HTML in an iframe
2. **[0:10]** User interacts with the colour wheel / input - preview updates live
3. **[0:20]** User types a colour name and clicks "Save Color"
4. **[0:30]** The UI sends a `saveColor` message via postMessage
5. **[0:40]** Call `demo6_get_palette` to show the colour was saved server-side
6. **[0:50]** User clicks "Send to Chat" - summary message appears in conversation
7. **[1:00]** Call `demo6_save_color` directly from agent (no UI) - palette updates

## What Can Go Wrong + Fallback

| Issue | Fallback |
|-------|----------|
| Host doesn't render `ui://` resources | Use `demo6_save_color` and `demo6_get_palette` as text-only tools |
| iframe sandbox blocks postMessage | UI logs to console; agent can use tools directly |
| Colour validation fails | Hex format enforced: `#RRGGBB` |
| Palette is empty | Expected on first run - save some colours first |

## Security Notes

- HTML is self-contained with no external script loads
- UI runs in a sandboxed iframe context
- `postMessage` uses wildcard origin for demo (production should restrict)
- No cookies, localStorage, or network requests from the UI
- Server-side palette is in-memory only, lost on restart
