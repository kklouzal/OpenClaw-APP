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
- exposes a small local HTTP API for health, installation inspection, token acquisition, and GitHub workflow actions
- binds to loopback by default so it can be used as a local OpenClaw automation surface

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

## Local service

A user-level systemd unit can keep the service alive for local OpenClaw usage:

```bash
systemctl --user enable --now openclaw-app.service
systemctl --user status openclaw-app.service
```

## Current state

The service is already wired against the real GitHub App credentials and can mint installation tokens for installed repositories.

## API surface

- `GET /healthz`
- `GET /app`
- `GET /installations`
- `POST /token` with JSON body `{ "owner": "kklouzal", "repo": "_Vulkan" }`
- `GET /labels?owner=kklouzal&repo=_Vulkan`
- `POST /labels`
- `GET /milestones?owner=kklouzal&repo=_Vulkan&state=open`
- `POST /milestones`
- `POST /issues`
- `POST /issues/comment`
- `PUT /issues/labels`
- `PUT /issues/milestone`
- `PUT /issues/state`
- `POST /pulls/comment`
- `POST /pulls/review`

This is the first useful complete surface for our split:
- GitHub App identity handles issue / PR workflow conversation and metadata actions
- Schwi identity continues to own git pushes and wiki git pushes

## Future note: local GitHub event routing without public webhooks

A likely future expansion is to let `OpenClaw-APP` emulate webhook-style behavior **without** exposing the local network to the internet.

Preferred shape:
- poll GitHub every ~60 seconds for subscribed repositories
- maintain durable cursors / last-seen ids so events are emitted once
- support a local subscription registry such as:
  - repo owner/name
  - event type (`issue.opened`, `issue.comment.created`, `pull_request.opened`, `pull_request.review.submitted`, etc.)
  - local dispatch target inside OpenClaw
- dispatch matching events into OpenClaw through a local-only bridge rather than public inbound webhooks

Good v1 event candidates:
- issue opened
- issue commented
- issue closed / reopened
- pull request opened
- pull request commented
- pull request review submitted

This should be treated as a local event-router / subscription system, not as true public GitHub webhooks.

## Likely next expansions

- route protection / shared-secret auth in front of the local API
- repo allowlist / action allowlist
- audit logging
- higher-level compound workflow helpers for OpenClaw agents
- direct OpenClaw integration patterns
