/**
 * DEMO 6 – MCP Apps "Color Picker" Interactive UI
 *
 * Registers a resource (ui://color-picker) that serves self-contained HTML
 * for an interactive color picker. The UI sends messages back to the server
 * and can call a "saveColor" tool.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// In-memory saved colors
const savedColors: Array<{ color: string; name: string; savedAt: string }> = [];

const COLOR_PICKER_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MCP Color Picker</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #1e1e1e; color: #ccc; padding: 20px;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
  }
  h1 { font-size: 1.3rem; color: #fff; }
  .picker-area {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    background: #2d2d2d; padding: 20px; border-radius: 12px; width: 320px;
  }
  .color-preview {
    width: 200px; height: 200px; border-radius: 12px;
    border: 3px solid #555; transition: background 0.2s;
  }
  input[type="color"] {
    width: 200px; height: 40px; border: none; cursor: pointer;
    background: transparent;
  }
  .hex-display { font-family: monospace; font-size: 1.4rem; color: #fff; }
  .name-input {
    padding: 8px 12px; border-radius: 6px; border: 1px solid #555;
    background: #3d3d3d; color: #fff; font-size: 0.9rem; width: 200px;
  }
  button {
    padding: 10px 24px; border-radius: 8px; border: none;
    font-size: 0.9rem; cursor: pointer; font-weight: 600;
  }
  .btn-save { background: #0078d4; color: #fff; }
  .btn-save:hover { background: #106ebe; }
  .btn-send { background: #107c10; color: #fff; }
  .btn-send:hover { background: #0e6b0e; }
  .buttons { display: flex; gap: 8px; }
  .saved-list {
    width: 320px; background: #2d2d2d; border-radius: 12px; padding: 16px;
  }
  .saved-list h2 { font-size: 1rem; margin-bottom: 8px; color: #fff; }
  .saved-item {
    display: flex; align-items: center; gap: 8px; padding: 6px 0;
    border-bottom: 1px solid #3d3d3d;
  }
  .saved-swatch {
    width: 24px; height: 24px; border-radius: 4px; border: 1px solid #555;
  }
  .status { font-size: 0.8rem; color: #0a0; margin-top: 4px; min-height: 1.2em; }
</style>
</head>
<body>
  <h1>🎨 MCP Color Picker</h1>
  <div class="picker-area">
    <div class="color-preview" id="preview" style="background: #0078d4"></div>
    <input type="color" id="picker" value="#0078d4">
    <div class="hex-display" id="hex">#0078D4</div>
    <input type="text" class="name-input" id="colorName" placeholder="Color name (e.g., Brand Blue)">
    <div class="buttons">
      <button class="btn-save" id="saveBtn">💾 Save Color</button>
      <button class="btn-send" id="sendBtn">📨 Send to Chat</button>
    </div>
    <div class="status" id="status"></div>
  </div>
  <div class="saved-list" id="savedList" style="display:none">
    <h2>Saved Colors</h2>
    <div id="savedItems"></div>
  </div>

<script>
  const picker = document.getElementById('picker');
  const preview = document.getElementById('preview');
  const hex = document.getElementById('hex');
  const colorName = document.getElementById('colorName');
  const status = document.getElementById('status');
  const savedList = document.getElementById('savedList');
  const savedItems = document.getElementById('savedItems');

  const saved = [];

  picker.addEventListener('input', (e) => {
    const color = e.target.value;
    preview.style.background = color;
    hex.textContent = color.toUpperCase();
    sendToServer({ type: 'colorChanged', color });
  });

  document.getElementById('saveBtn').addEventListener('click', () => {
    const color = picker.value.toUpperCase();
    const name = colorName.value.trim() || color;
    saved.push({ color, name, savedAt: new Date().toISOString() });
    renderSaved();
    sendToServer({ type: 'saveColor', color, name });
    status.textContent = '✓ Saved ' + name;
    setTimeout(() => status.textContent = '', 2000);
  });

  document.getElementById('sendBtn').addEventListener('click', () => {
    const color = picker.value.toUpperCase();
    const name = colorName.value.trim() || color;
    sendToServer({ type: 'sendToChat', color, name, allSaved: saved });
    status.textContent = '📨 Sent to chat';
    setTimeout(() => status.textContent = '', 2000);
  });

  function renderSaved() {
    savedList.style.display = 'block';
    savedItems.innerHTML = saved.map(s =>
      '<div class="saved-item">' +
        '<div class="saved-swatch" style="background:' + s.color + '"></div>' +
        '<span>' + s.name + '</span>' +
        '<span style="color:#888;font-size:0.8rem;margin-left:auto">' + s.color + '</span>' +
      '</div>'
    ).join('');
  }

  function sendToServer(msg) {
    // MCP Apps messaging: postMessage to parent frame
    if (window.parent !== window) {
      // DEMO ONLY: production should restrict targetOrigin to the host's origin
      window.parent.postMessage({ source: 'mcp-app', ...msg }, '*');
    }
    // Also log for debugging
    console.log('[MCP ColorPicker]', msg);
  }

  // Listen for messages from the host
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.type === 'setColor') {
      picker.value = data.color;
      preview.style.background = data.color;
      hex.textContent = data.color.toUpperCase();
    }
  });
</script>
</body>
</html>`;

export function registerDemo6(server: McpServer): void {
  // Register the UI resource
  server.resource(
    "color-picker-ui",
    "ui://color-picker",
    {
      description: "Interactive color picker MCP App",
      mimeType: "text/html",
    },
    async () => ({
      contents: [
        {
          uri: "ui://color-picker",
          mimeType: "text/html",
          text: COLOR_PICKER_HTML,
        },
      ],
    })
  );

  // Tool to save a color (called by the UI via host)
  server.tool(
    "demo6_save_color",
    "Save a color to the server palette. Can be called by the Color Picker UI " +
      "or directly by an agent.",
    {
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #FF5733"),
      name: z.string().min(1).max(64).describe("Human-readable color name"),
    },
    async ({ color, name }) => {
      const entry = { color: color.toUpperCase(), name, savedAt: new Date().toISOString() };
      savedColors.push(entry);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                status: "saved",
                entry,
                totalSaved: savedColors.length,
                palette: savedColors,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // Tool to get saved palette
  server.tool(
    "demo6_get_palette",
    "Get all saved colors from the palette.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                palette: savedColors,
                total: savedColors.length,
                _note: savedColors.length === 0
                  ? "No colors saved yet. Use the Color Picker UI or demo6_save_color."
                  : undefined,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
