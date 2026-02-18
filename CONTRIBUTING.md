# Contributing to MCP Demos

Thanks for your interest in contributing! This project is a set of demo tools for the Model Context Protocol.

## Getting Started

```bash
git clone https://github.com/microsoft/mcpdemos.git
cd mcpdemos
npm install
npm run dev
```

Requires Node 20+.

## Project Structure

- `src/index.ts` - Server entry point, registers all demos
- `src/demos/demo*.ts` - Individual demo implementations
- `examples/demo*/README.md` - Per-demo documentation with stage scripts
- `docs/` - Runbooks and show run guide

## Making Changes

1. Create a branch from `main`
2. Make your changes in `src/demos/`
3. Run `npx tsc --noEmit` to type-check
4. Run `npm run build` to verify the production build
5. Test your changes by starting the server (`npm run dev`) and calling your tool via an MCP host or stdio
6. Update the relevant `examples/` README if you changed tool behaviour
7. Open a pull request

## Adding a New Demo

1. Create `src/demos/demo<N>-<name>.ts` exporting a `registerDemo<N>(server: McpServer)` function
2. Import and call it in `src/index.ts`
3. Create `examples/demo<N>-<name>/README.md` following the existing format:
   - Purpose (1 paragraph)
   - Setup steps
   - Stage script (bullet timeline)
   - "What can go wrong" + fallback table
   - Security notes
4. Update the root `README.md` demo table
5. Update the runbooks in `docs/` if appropriate

## Code Guidelines

- TypeScript strict mode - no `any` unless unavoidable
- Validate inputs with Zod schemas
- Keep demos self-contained - no external API calls or real credentials
- UI resources should be self-contained HTML (no external script/CDN loads)
- All data should be synthetic/mock - never use real user data

## Testing

Currently demos are verified by:
1. `npx tsc --noEmit` - type checking
2. `npm run build` - production compilation
3. Manual tool invocation via stdio or an MCP host

## Reporting Issues

Open an issue with:
- Which demo is affected
- Steps to reproduce
- Expected vs actual behaviour
- Node version (`node --version`)
