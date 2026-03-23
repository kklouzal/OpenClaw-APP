# OpenClaw-APP

Minimal GitHub App service for OpenClaw automation identities.

## Purpose

This repository exists to support a clean identity split for OpenClaw-driven GitHub automation:

- **Schwi user account** handles code pushes and normal git-authored repository changes
- **GitHub App identity** handles conversational and workflow operations such as:
  - creating issues
  - replying to issues
  - applying labels
  - applying milestones
  - issue close / reopen
  - pull-request workflow comments and metadata updates

The initial target is `_Vulkan`, but the service is intentionally shaped so other OpenClaw agents/repositories can reuse it later.

## What this service does

This service:
- authenticates as a GitHub App using the app id + private key
- discovers installation ids for target owners/repos
- creates installation-scoped Octokit clients and tokens
- exposes a tiny HTTP API for health, installation inspection, and token acquisition / future GitHub workflow actions

## What this service does *not* do

This service does **not** try to replace normal git push flows.
Code pushes and wiki git pushes should still happen through Schwi's user identity.

## Environment

Copy `.env.example` to `.env` and fill in the real values once the GitHub App exists.

Required:
- `GITHUB_APP_ID`
- `GITHUB_APP_PRIVATE_KEY_PATH`
- `GITHUB_APP_WEBHOOK_SECRET` (optional for now, useful later)
- `PORT`

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Current state

The service is already wired against the real GitHub App credentials and can mint installation tokens for installed repositories.

## Initial API surface

- `GET /healthz`
- `GET /app`
- `GET /installations`
- `POST /token` with JSON body `{ "owner": "kklouzal", "repo": "_Vulkan" }`

The `/token` endpoint is intentionally simple for the first cut so we can validate app auth before layering higher-level GitHub action helpers on top.

## Next likely expansions

Once the GitHub App credentials exist and the base auth path is verified, likely next steps are:

- repo-scoped issue comment endpoint
- repo-scoped issue create endpoint
- label / milestone mutation endpoints
- PR comment / state workflow endpoints
- optional audit logging
- optional allowlist of repos/actions
Claw integration patterns
