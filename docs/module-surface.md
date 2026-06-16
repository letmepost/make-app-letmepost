# Module surface — letmepost.dev Make app

This is the design surface to review **before** the first submission to Make. It enumerates the
connection, modules, RPC, and IML function the app exposes, and the letmepost API endpoint each maps to.

## Why the surface is locked in up front

Make published (public) apps cannot delete components, and they cannot be unpublished. A breaking
change — renaming a parameter, removing a field, changing a body shape — forces a **new app version**
that existing users must manually upgrade their scenarios to. So the surface (especially the Bluesky
reply collection, which is easy to forget) is built out in full now, even where a field is optional
or rarely used, to avoid painful migrations later.

## Connection

| Item | Value |
| --- | --- |
| Name | `letmepost` |
| Type | API key (`password` parameter `apiKey`) |
| Validation | `GET https://api.letmepost.dev/v1/accounts` with `Authorization: Bearer {{parameters.apiKey}}`; valid when `statusCode === 200` |
| Auth (inherited) | `base.imljson` sets `Authorization: Bearer {{connection.apiKey}}` for every module/RPC |
| Error format | `[{{statusCode}}] {{body.error.code}}: {{body.error.message}}` (letmepost envelope) |
| Log sanitize | `request.headers.authorization` |

## Modules

### 1. Publish a Post — `publishPost` (action → `POST /v1/posts`)

| Parameter | Type | Notes |
| --- | --- | --- |
| `targets` | array of `select` (`rpc://getAccounts`) | required; accounts to publish to |
| `text` | text | post body |
| `media` | array of collection | each item: `kind` (select image/video), `url`, `mediaId`, `altText` |
| `firstComment` | text | sent as `{ text }` |
| `bluesky` | collection "Bluesky reply" | `replyToUri`, `replyToCid`, `replyRootUri`, `replyRootCid` |
| `scheduledAt` | date | publish time; empty = now |
| `publishNow` | boolean | default `true` |
| `profileId` | text (advanced) | attribute post to a profile |
| `idempotencyKey` | text (advanced) | sent as the `Idempotency-Key` header |

Body: `targets` is built by `{{lmpTargets(parameters.targets, parameters.bluesky)}}`; `text`,
`media`, `firstComment` (`{ text }`), `profileId`, `scheduledAt`, `publishNow` are passed through.
Output: full response `{{body}}` — `id`, `status`, `createdAt`, `scheduledAt?`, `results[]`
(`accountId`, `platform`, `postId?`, `status`, `uri?`, `cid?`, `firstCommentUri?`,
`firstCommentCid?`, `warnings?`, `error?`).

### 2. List Accounts — `listAccounts` (search → `GET /v1/accounts`)

No parameters. Iterates `body.data`, outputs each `{ id, platform, platformAccountId, displayName }`.

### 3. List Media — `listMedia` (search → `GET /v1/media`)

Parameter `limit` (number, default 50) → `qs.limit`. Iterates `body.data`, outputs each item.

### 4. Get a Post — `getPost` (action → `GET /v1/posts/{{parameters.postId}}`)

Parameter `postId` (text, required). Output: full response `{{body}}`.

## RPC

### `getAccounts` (`GET /v1/accounts`)

Backs the dynamic `select` for targets. Iterates `body.data` into
`{ label: "{{item.displayName}} ({{item.platform}})", value: "{{item.id}}" }`.

## Function

### `lmpTargets(accountIds, bluesky)` (`src/functions/lmpTargets.js`)

Maps selected account IDs into the API target shape `{ accountId }[]`. When the Bluesky reply
collection has both `replyToUri` and `replyToCid`, attaches
`options: { platform: "bluesky", replyToUri, replyToCid }`, and adds `replyRootUri`/`replyRootCid`
when both are present.

## letmepost API contract (reference)

- Base `https://api.letmepost.dev`, auth `Authorization: Bearer <apiKey>`.
- Error envelope: `{ error: { code, message, rule?, remediation? } }`.
- `POST /v1/posts` — body `{ targets: [{ accountId, options? }], text?, media?, firstComment?, profileId?, scheduledAt?, publishNow? }`, optional `Idempotency-Key` header.
  - Bluesky per-target `options`: `{ platform: "bluesky", replyToUri, replyToCid, replyRootUri?, replyRootCid? }`.
- `GET /v1/accounts` → `{ data: [{ id, platform, platformAccountId, displayName }] }`
- `GET /v1/media` → `{ data: [{ id, ... }] }` (supports `limit`)
- `GET /v1/posts/:id` → post detail object
