# sub-services

[![Update Nodes](https://github.com/jwyGithub/sub-services/actions/workflows/run.yml/badge.svg)](https://github.com/jwyGithub/sub-services/actions/workflows/run.yml)

A lightweight pipeline that aggregates proxy subscriptions, parses the nodes, de-duplicates them, filters by geo-location, and writes the result back into the repository. Updates run automatically via GitHub Actions every 8 hours.

## Features

- Supports `vmess`, `vless`, `trojan`, `ss`, `ssr`, `hysteria`, `hysteria2`
- Fetches and decodes Base64 subscriptions with retry
- De-duplicates nodes by `host:port`
- Filters by regex blacklist and country codes (via IP geo-lookup)
- Saves nodes grouped by protocol into the `address/` directory
- Scheduled updates with auto-commit through GitHub Actions

## Project Structure

```
sub-services/
├── packages/
│   ├── shared/         # Shared utilities (config loader, logger)
│   └── subs/           # Main entry: fetch -> parse -> process -> save
│       ├── config/     # default.yaml / dev.yaml
│       └── address/    # Generated output (vless_api.txt, vmess_api.txt, ...)
└── .github/workflows/
    └── run.yml         # Scheduled update workflow
```

## Requirements

- Node.js `>= 24`
- pnpm `>= 10`

## Usage

Install dependencies and build the shared package:

```bash
pnpm install
pnpm run build:shared
```

Run in development (uses `packages/subs/config/dev.yaml`):

```bash
pnpm start
```

Run in production (reads the YAML path from the `CONFIG` env variable):

```bash
CONFIG=/path/to/your/config.yaml pnpm run prod
```

## Configuration

- `packages/subs/config/default.yaml` — storage paths and filter rules (regex blacklist, country codes).
- `packages/subs/config/dev.yaml` — local subscription sources and per-protocol parser mapping.

Each entry under `vps` declares the protocol, the parser to use, and the query parameters appended to the upstream subscription URL.

## Output

Generated files are written to `packages/subs/address/`:

- `all.txt` — raw decoded content of every subscription
- `<protocol>_api.txt` — `host:port#remark` lines grouped by protocol

## License

ISC
