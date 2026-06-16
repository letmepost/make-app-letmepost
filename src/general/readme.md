# General

App-level shared configuration.

- `base.imljson` — the base HTTP request, inherited by every module and RPC. It sets the
  `baseUrl` (`https://api.letmepost.dev`), the `Authorization: Bearer {{connection.apiKey}}`
  header, the shared error formatter for the letmepost error envelope
  (`{ error: { code, message, rule?, remediation? } }`), and sanitizes the auth header from
  request logs. Modules only declare the request bits that differ (path, method, qs, body, output).
- `common.json` — shared, non-secret app data made available to every component as `{{common.*}}`.
  Empty for now; add shared constants here if needed later.
