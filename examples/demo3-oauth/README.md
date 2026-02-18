# Demo 3: Secure OAuth Handoff Simulation

## Purpose

Demonstrates a 3-step secure authorization flow: request consent → approve → execute protected action. All tokens are mock / ephemeral and never leave the server process. Shows how MCP tools can enforce consent gates and scope-limited tokens without leaking credentials.

## Setup

```bash
npm install
npm run dev
```

Optional: Set `MCP_DEMO_SECRET` environment variable (the demo works without it).

Tools registered: `demo3_request_consent`, `demo3_approve_consent`, `demo3_protected_action`

## Stage Script (Timeline)

1. **[0:00]** Call `demo3_request_consent` with `action: "read-repos"`
2. **[0:10]** Server returns a consent prompt with scope info, expiry, and a `consentId`
3. **[0:20]** Point out security notes: "Token scoped to this server, expires in 5 min"
4. **[0:30]** Call `demo3_approve_consent` with the `consentId`
5. **[0:40]** Server returns a mock token - explain it lives only in process memory
6. **[0:50]** Call `demo3_protected_action` with the token and matching `action`
7. **[1:00]** Success! Token is consumed (one-time use)
8. **[1:10]** Try reusing the token - get "unauthorised" error
9. **[1:20]** Try wrong scope: request `read-repos` consent but attempt `admin-settings` - get "insufficient_scope"

## What Can Go Wrong + Fallback

| Issue | Fallback |
|-------|----------|
| Consent expires | Re-run `demo3_request_consent` for a fresh consent |
| Token already used | Tokens are one-time; start the flow again |
| Wrong scope | Error message clearly states required vs granted scope |
| Server restarts | All tokens are lost (by design) - restart the flow |

## Security Notes

- **No real OAuth provider** is contacted
- All tokens are `crypto.randomBytes` generated locally
- Tokens exist only in Node.js process memory - never persisted
- Tokens auto-expire after 5 minutes
- One-time use: consumed on first protected action call
- `MCP_DEMO_SECRET` env var is checked but not required (safe default)
- Real implementations should use PKCE, short-lived tokens, and proper OAuth flows
