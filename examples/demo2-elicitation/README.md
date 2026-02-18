# Demo 2: Elicitation Mid-Flow

## Purpose

Shows how an MCP tool can pause execution to request structured user input - config choice, confirmation, and selection - then resume with the user's answers. This keeps business logic server-side while the host only renders a structured form. Key pattern for Teams, Playground, and VS Code integration.

## Setup

```bash
npm install
npm run dev
```

Tools registered: `demo2_scaffold_start`, `demo2_scaffold_confirm`

## Stage Script (Timeline)

1. **[0:00]** Call `demo2_scaffold_start` with `projectName: "my-app"`
2. **[0:10]** Server returns an elicitation schema with template choices, Docker option, CI toggle, and licence selector
3. **[0:20]** Point out the `_stage_script` field - it documents the flow right in the response
4. **[0:30]** **Agent asks → User chooses**: User picks `react-app`, `includeDocker: true`, `includeCI: true`, `license: MIT`
5. **[0:40]** Call `demo2_scaffold_confirm` with those choices
6. **[0:50]** **Tool continues**: Server returns the list of files that would be created and next steps
7. **[1:00]** Explain: "The server decided what templates exist. The host just rendered a form."

## What Can Go Wrong + Fallback

| Issue | Fallback |
|-------|----------|
| Host doesn't support elicitation UI | The schema is returned as JSON - agent can interpret and ask user in chat |
| Invalid template name | Zod validation rejects it with a clear error |
| User skips the confirm step | No side effects occur - scaffold_start is read-only |

## Security Notes

- No files are actually written to disk (simulation only)
- Input validation via Zod schemas
- No external network calls
- projectName is sanitised to `[a-z0-9-]` only
