/**
 * DEMO 7 – MCP Apps "Storybook-like Component Gallery Viewer"
 *
 * A simple interactive UI showing 3 components (button, card, chart placeholder)
 * with variant switching. Demonstrates bidirectional updates:
 * server sends state, UI changes feed back.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Server-side component state
let componentState = {
  activeComponent: "button" as string,
  variant: "primary" as string,
  theme: "dark" as string,
};

const GALLERY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MCP Component Gallery</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    padding: 16px; transition: background 0.3s, color 0.3s;
  }
  body.dark { background: #1e1e1e; color: #ccc; }
  body.light { background: #f5f5f5; color: #333; }

  h1 { font-size: 1.2rem; margin-bottom: 12px; }
  .toolbar {
    display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .tab {
    padding: 8px 16px; border-radius: 6px; border: 1px solid #555;
    cursor: pointer; font-size: 0.85rem; transition: all 0.2s;
  }
  .dark .tab { background: #2d2d2d; color: #ccc; }
  .light .tab { background: #fff; color: #333; border-color: #ccc; }
  .tab.active { background: #0078d4; color: #fff; border-color: #0078d4; }

  .variant-bar {
    display: flex; gap: 6px; margin-bottom: 16px;
  }
  .variant-btn {
    padding: 4px 12px; border-radius: 4px; font-size: 0.8rem;
    cursor: pointer; border: 1px solid #666;
  }
  .dark .variant-btn { background: #3d3d3d; color: #aaa; }
  .light .variant-btn { background: #e0e0e0; color: #555; }
  .variant-btn.active { background: #005a9e; color: #fff; border-color: #005a9e; }

  .preview {
    border: 1px solid #444; border-radius: 12px; padding: 32px;
    display: flex; align-items: center; justify-content: center;
    min-height: 200px; transition: all 0.3s;
  }
  .dark .preview { background: #252525; border-color: #444; }
  .light .preview { background: #fff; border-color: #ddd; }

  /* Component styles */
  .demo-btn {
    padding: 12px 32px; border-radius: 8px; border: none;
    font-size: 1rem; font-weight: 600; cursor: pointer;
  }
  .demo-btn.primary { background: #0078d4; color: #fff; }
  .demo-btn.secondary { background: #6c757d; color: #fff; }
  .demo-btn.danger { background: #d13438; color: #fff; }
  .demo-btn.outline {
    background: transparent; border: 2px solid #0078d4; color: #0078d4;
  }

  .demo-card {
    border-radius: 12px; padding: 20px; width: 280px;
    transition: all 0.3s;
  }
  .dark .demo-card { background: #2d2d2d; }
  .light .demo-card { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .demo-card.primary { border-left: 4px solid #0078d4; }
  .demo-card.secondary { border-left: 4px solid #6c757d; }
  .demo-card.danger { border-left: 4px solid #d13438; }
  .demo-card.outline { border: 2px dashed #0078d4; }
  .demo-card h3 { margin-bottom: 8px; }
  .demo-card p { font-size: 0.9rem; opacity: 0.8; }

  .demo-chart {
    width: 280px; height: 160px; border-radius: 8px; position: relative;
    overflow: hidden;
  }
  .dark .demo-chart { background: #2d2d2d; }
  .light .demo-chart { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
  .chart-bar {
    position: absolute; bottom: 20px; width: 30px; border-radius: 4px 4px 0 0;
    transition: height 0.5s, background 0.3s;
  }
  .chart-label {
    position: absolute; bottom: 4px; font-size: 0.6rem; text-align: center; width: 30px;
  }

  .theme-toggle {
    position: absolute; top: 12px; right: 16px; font-size: 0.8rem;
    cursor: pointer; padding: 4px 10px; border-radius: 4px;
    border: 1px solid #555;
  }
  .dark .theme-toggle { background: #3d3d3d; color: #ccc; }
  .light .theme-toggle { background: #e0e0e0; color: #333; }

  .state-bar {
    margin-top: 16px; padding: 8px 12px; border-radius: 6px;
    font-family: monospace; font-size: 0.75rem;
  }
  .dark .state-bar { background: #1a1a2e; color: #8be9fd; }
  .light .state-bar { background: #e8f4f8; color: #1a1a2e; }
</style>
</head>
<body class="dark">
  <button class="theme-toggle" id="themeToggle">☀ Light</button>
  <h1>📦 Component Gallery</h1>

  <div class="toolbar" id="tabs"></div>
  <div class="variant-bar" id="variants"></div>
  <div class="preview" id="preview"></div>
  <div class="state-bar" id="stateBar"></div>

<script>
  const components = {
    button: {
      variants: ['primary', 'secondary', 'danger', 'outline'],
      render: (v) => '<button class="demo-btn ' + v + '">Click Me</button>'
    },
    card: {
      variants: ['primary', 'secondary', 'danger', 'outline'],
      render: (v) =>
        '<div class="demo-card ' + v + '">' +
          '<h3>Card Title</h3>' +
          '<p>This is a demo card component in the ' + v + ' variant.</p>' +
        '</div>'
    },
    chart: {
      variants: ['primary', 'secondary', 'danger', 'outline'],
      render: (v) => {
        const colors = { primary: '#0078d4', secondary: '#6c757d', danger: '#d13438', outline: '#0078d4' };
        const color = colors[v] || '#0078d4';
        const heights = [60, 100, 45, 80, 120, 70, 90];
        const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        let bars = '';
        heights.forEach((h, i) => {
          bars += '<div class="chart-bar" style="left:' + (20 + i * 38) + 'px;height:' + h + 'px;background:' + color + '"></div>';
          bars += '<div class="chart-label" style="left:' + (20 + i * 38) + 'px">' + labels[i] + '</div>';
        });
        return '<div class="demo-chart">' + bars + '</div>';
      }
    }
  };

  let state = { active: 'button', variant: 'primary', theme: 'dark' };

  function render() {
    // Tabs
    document.getElementById('tabs').innerHTML = Object.keys(components).map(c =>
      '<div class="tab' + (c === state.active ? ' active' : '') + '" data-comp="' + c + '">' +
        c.charAt(0).toUpperCase() + c.slice(1) +
      '</div>'
    ).join('');

    // Variants
    const comp = components[state.active];
    document.getElementById('variants').innerHTML = comp.variants.map(v =>
      '<div class="variant-btn' + (v === state.variant ? ' active' : '') + '" data-var="' + v + '">' +
        v +
      '</div>'
    ).join('');

    // Preview
    document.getElementById('preview').innerHTML = comp.render(state.variant);

    // State bar
    document.getElementById('stateBar').textContent =
      'State: { component: "' + state.active + '", variant: "' + state.variant + '", theme: "' + state.theme + '" }';

    // Theme
    document.body.className = state.theme;
    document.getElementById('themeToggle').textContent =
      state.theme === 'dark' ? '☀ Light' : '🌙 Dark';
  }

  // Event delegation
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-comp]');
    if (tab) {
      state.active = tab.dataset.comp;
      state.variant = components[state.active].variants[0];
      render();
      sendToServer({ type: 'componentChanged', component: state.active, variant: state.variant });
      return;
    }
    const varBtn = e.target.closest('[data-var]');
    if (varBtn) {
      state.variant = varBtn.dataset.var;
      render();
      sendToServer({ type: 'variantChanged', component: state.active, variant: state.variant });
      return;
    }
    if (e.target.id === 'themeToggle') {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      render();
      sendToServer({ type: 'themeChanged', theme: state.theme });
    }
  });

  function sendToServer(msg) {
    if (window.parent !== window) {
      // DEMO ONLY: production should restrict targetOrigin to the host's origin
      window.parent.postMessage({ source: 'mcp-app', ...msg }, '*');
    }
    console.log('[MCP Gallery]', msg);
  }

  // Listen for server-pushed state
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (data && data.type === 'setState') {
      if (data.component && components[data.component]) state.active = data.component;
      if (data.variant) state.variant = data.variant;
      if (data.theme) state.theme = data.theme;
      render();
    }
  });

  render();
</script>
</body>
</html>`;

export function registerDemo7(server: McpServer): void {
  // UI resource
  server.resource(
    "component-gallery-ui",
    "ui://component-gallery",
    {
      description: "Storybook-like component gallery MCP App",
      mimeType: "text/html",
    },
    async () => ({
      contents: [
        {
          uri: "ui://component-gallery",
          mimeType: "text/html",
          text: GALLERY_HTML,
        },
      ],
    })
  );

  // Tool to get / set gallery state (bidirectional)
  server.tool(
    "demo7_gallery_state",
    "Get or set the component gallery state. When setting, the server " +
      "updates its state which the UI can read on next render.",
    {
      action: z.enum(["get", "set"]).describe("Get current state or set new state"),
      component: z
        .enum(["button", "card", "chart"])
        .optional()
        .describe("Component to display (for set)"),
      variant: z
        .enum(["primary", "secondary", "danger", "outline"])
        .optional()
        .describe("Variant to display (for set)"),
      theme: z.enum(["dark", "light"]).optional().describe("Theme (for set)"),
    },
    async ({ action, component, variant, theme }) => {
      if (action === "set") {
        if (component) componentState.activeComponent = component;
        if (variant) componentState.variant = variant;
        if (theme) componentState.theme = theme;
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                state: componentState,
                _note:
                  action === "set"
                    ? "State updated. The UI will reflect changes on next message/render."
                    : "Current server-side gallery state.",
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
