# make-app-letmepost

A [Make](https://www.make.com/) custom app for [letmepost.dev](https://letmepost.dev).

letmepost.dev is an open-source social media publishing API for developers and agents. One endpoint
publishes to Bluesky, X/Twitter, LinkedIn, Instagram, Threads, Facebook, Pinterest, and TikTok — with
preflight validation that catches platform-specific problems before they fail, and transparent,
structured errors when a platform rejects a post.

This repository holds the app's source as Make Apps SDK component files (IML/JSON). It is the
standalone integration counterpart to the n8n community node — the same API, packaged for Make.

## What the app exposes

| Component | Kind | letmepost endpoint |
| --- | --- | --- |
| letmepost connection | Connection (API key) | `GET /v1/accounts` (validation) |
| Publish a Post | Action | `POST /v1/posts` |
| List Accounts | Search | `GET /v1/accounts` |
| List Media | Search | `GET /v1/media` |
| Get a Post | Action | `GET /v1/posts/:id` |
| Get Accounts | RPC (dynamic select) | `GET /v1/accounts` |
| `lmpTargets` | IML function | builds the `targets[]` body shape |

The full design surface — every parameter, output field, and the API contract — is documented in
[`docs/module-surface.md`](docs/module-surface.md). Review it before submitting the app for publication.

## Component layout

```
make-app-letmepost/
  makecomapp.json            App manifest (template — see note below)
  README.md
  LICENSE                    Apache-2.0
  .gitignore
  assets/letmepost.svg       App icon
  docs/module-surface.md     Design doc (review before first submission)
  src/
    general/
      base.imljson           Shared base request: baseUrl, auth header, error format, log sanitize
      common.json            Shared non-secret app data ({{common.*}})
      readme.md
    connections/letmepost/
      api.imljson             Connection validation request
      parameters.imljson      Connection parameters (apiKey)
    modules/
      publishPost/   api.imljson · parameters.imljson · interface.imljson · samples.imljson
      listAccounts/  api.imljson · parameters.imljson · interface.imljson
      listMedia/     api.imljson · parameters.imljson · interface.imljson
      getPost/       api.imljson · parameters.imljson · interface.imljson
    rpcs/
      getAccounts/   api.imljson
    functions/
      lmpTargets.js
```

### About `makecomapp.json`

`makecomapp.json` here is a **template**. The Make Apps SDK reconciles the exact component linkage —
app ID, version, component origins/remote IDs — when you run the SDK's **create** or **link** command
against your Make account. Treat the committed manifest as the local source-of-truth mapping of
component names to file paths; the SDK fills in the account-specific bits on link. Do not hand-edit
the SDK-generated `origins`/IDs once linked.

## Authentication

The app authenticates with a letmepost.dev API key.

1. Sign in to the [letmepost.dev dashboard](https://app.letmepost.dev).
2. Go to **API keys** and create a key — `lmp_live_…` for production or `lmp_test_…` for the test environment.
3. When you create a connection in Make, paste the key into the **API key** field.

The base request (`src/general/base.imljson`) sends `Authorization: Bearer <apiKey>` on every call and
sanitizes the auth header out of request logs.

## Wiring it into Make

1. **Install the Make Apps SDK VS Code extension** — search the marketplace for `Integromat.apps-sdk`
   and install it. Sign in with a Make API token for the account/region you develop in.
2. **Create or link the app.** Either create a new app in Make and link this folder to it, or use the
   extension's **create** command to scaffold a remote app from this source. This is the step that
   generates and reconciles `makecomapp.json` against your account.
3. **Map these component files.** The extension pushes the component sources (connection, modules,
   RPC, IML function, general base/common) from `src/` to the remote app per the manifest. Verify each
   module's `api`, `parameters`, `interface`, and (for `publishPost`) `samples` land on the right component.
4. **Test via a private invite link.** Make generates a private invite URL for an unpublished app so
   you can install it in a scenario, connect your API key, and run each module end to end against the
   live letmepost API before publishing.
5. **Request review to publish.** Submit the publication form; review is automatic checks followed by
   manual QA and typically takes ~2–4 weeks. **Once the app is public, components cannot be deleted and
   the app cannot be unpublished** — which is why the module surface (including the Bluesky reply
   collection) is built out in full from day one. See `docs/module-surface.md`.

## Notes / known follow-ups

- **`media` body handling.** The `publishPost` body passes `media` through as `{{parameters.media}}`.
  Depending on how Make serializes the array-of-collection parameter (and that empty `url`/`mediaId`
  fields may come through as empty strings), the body may need cleanup — e.g. dropping empty media
  items or empty `url`/`mediaId`/`altText` keys — before it matches the API's
  `media: [{ kind, url?|mediaId?, altText? }]` shape exactly. Consider moving the mapping into an IML
  function (like `lmpTargets`) if Make's pass-through proves lossy. See the `TODO` notes below.
- Likewise, optional top-level fields (`text`, `firstComment.text`, `profileId`, `scheduledAt`) are
  passed through directly; if Make sends empty strings rather than omitting them, the API may need
  them stripped. Validate during private-link testing.

### TODO (verify against Make Apps SDK docs / during testing)

- `makecomapp.json` shape: the manifest keys here (`generalCodeFiles`, `components.module[*].moduleType`,
  `codeFiles.communication`/`params`/`interface`/`samples`, etc.) follow the SDK's local-development
  manifest conventions, but the SDK reconciles exact linkage on `create`/`link`. Confirm field names
  against the installed extension's generated manifest and adjust if they differ.
- `media` parameter spec uses an `array` whose `spec` is a `collection` (nested). Confirm Make renders
  and serializes nested array-of-collection as expected; flatten if not.
- `media` request body cleanup (see note above).

## Resources

- [letmepost.dev documentation](https://docs.letmepost.dev)
- [letmepost.dev on GitHub](https://github.com/letmepost/letmepost.dev)
- [Make Apps SDK documentation](https://developers.make.com/custom-apps-documentation)

## License

Apache-2.0. See [LICENSE](LICENSE).
