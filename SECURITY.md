# Security Policy

## Scope

This repository contains **demo/simulation code** for the Model Context Protocol. It is designed to run locally and does not connect to external services or handle real credentials.

## Security by Design

All 8 demos follow these principles:

| Principle | Implementation |
|-----------|---------------|
| No real secrets | All tokens are mock (`crypto.randomBytes`), in-memory only |
| No external calls | No HTTP requests, no database connections, no cloud APIs |
| Scoped tokens | Demo 3 tokens are scoped, ephemeral, and single-use |
| Input validation | All tool inputs validated via Zod schemas |
| No file reads | Only Demo 8 writes to a local `outputs/` directory |
| Self-contained UI | MCP App HTML has no external script/CDN loads |
| Sandboxed rendering | UIs are designed for iframe sandbox contexts |

## What This Project Does NOT Do

- Store or transmit real OAuth tokens
- Connect to any external authentication provider
- Access user files outside the working directory
- Persist any state beyond the server process lifetime
- Require or use any environment secrets (MCP_DEMO_SECRET is optional and unused)

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MCP_DEMO_SECRET` | No | Checked in Demo 3 to show env var awareness; safe default used if unset |

No other environment variables are read or required.

## Reporting a Vulnerability

If you discover a security issue:

1. **Do not** open a public issue
2. Email the maintainers directly or use the repository's private vulnerability reporting feature
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
4. We will acknowledge within 48 hours and aim to resolve within 7 days

## Dependencies

This project uses minimal dependencies:

- `@modelcontextprotocol/sdk` - MCP server framework
- `zod` - Input validation
- `tsx` (dev only) - TypeScript execution
- `typescript` (dev only) - Compiler

Run `npm audit` to check for known vulnerabilities in dependencies.

## Best Practices for Extending

If you add new demos or modify existing ones:

- Never embed real API keys, tokens, or passwords
- Never make external network requests without explicit user consent
- Always validate inputs at the tool boundary with Zod
- Keep UI resources self-contained (no external CDN loads)
- Use `crypto.randomBytes` for any mock token generation
- Ensure tokens/state are in-memory only and lost on restart
- Document any new permissions or file system access in the demo's README
