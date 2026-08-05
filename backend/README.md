# XI Eleven XVI Sixteen — Convex Backend

Standalone copy of the storefront backend, split out so it can be inspected and deployed independently from the frontend.

## Security state

The legacy catalogue create/edit/image/sync/delete functions are `internalMutation` / `internalAction` only. Public catalogue management goes through the authenticated admin functions.

## Terminal deployment

```bash
bun install
CONVEX_DEPLOY_KEY="<production deploy key>" bun run deploy
```

The target must be the existing production deployment behind `calculating-octopus-439.convex.cloud`. Never commit deploy keys or environment values. Required runtime variables remain configured in Convex, not in this repository.

## Verify

```bash
bun run typecheck
bun run functions
```
