# Demo 7: MCP Apps "Storybook-like Component Gallery Viewer"

## Purpose

A component gallery showing 3 UI components (button, card, chart) with variant switching and theme toggling. Demonstrates **bidirectional** MCP App communication: the server can push state to the UI, and UI interactions feed back to the server.

## Setup

```bash
npm install
npm run dev
```

Resource: `ui://component-gallery`
Tool: `demo7_gallery_state`

## Stage Script (Timeline)

1. **[0:00]** Agent reads `ui://component-gallery` - host renders the gallery UI
2. **[0:10]** User clicks "Button" tab - sees the primary button variant
3. **[0:15]** User switches to "danger" variant - button turns red
4. **[0:20]** User clicks "Card" tab - sees styled card component
5. **[0:25]** User toggles theme to Light - entire gallery re-renders
6. **[0:30]** Each interaction sends a message back to the server (visible in logs)
7. **[0:40]** Call `demo7_gallery_state` with `action: "get"` - see current state matches UI
8. **[0:50]** Call `demo7_gallery_state` with `action: "set", component: "chart", variant: "danger"`
9. **[1:00]** Explain: "The server updated state. On next render, the UI would reflect this."

## What Can Go Wrong + Fallback

| Issue | Fallback |
|-------|----------|
| Host doesn't render `ui://` resources | Use `demo7_gallery_state` tool for text-only interaction |
| UI-to-server messages don't arrive | State changes are logged to console for debugging |
| Theme doesn't apply | Ensure body class toggling works - CSS handles both themes |

## Security Notes

- Self-contained HTML with no external dependencies
- No network calls from the UI
- All component rendering is pure CSS + vanilla JS
- No user data is collected or transmitted
- postMessage wildcard origin for demo purposes
