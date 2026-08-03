# Langfuse Observability Plugin

This plugin ships bundled with KenXCode but is **opt-in** — it only loads when
you explicitly enable it.

## Enable

Pick one:

```bash
# Interactive: walks you through credentials + SDK install + enable
kenxcode tools  # → Langfuse Observability

# Manual
pip install langfuse
kenxcode plugins enable observability/langfuse
```

## Required credentials

Set these in `~/.kenxcode/.env` (or via `kenxcode tools`):

```bash
KENXCODE_LANGFUSE_PUBLIC_KEY=pk-lf-...
KENXCODE_LANGFUSE_SECRET_KEY=sk-lf-...
KENXCODE_LANGFUSE_BASE_URL=https://cloud.langfuse.com   # or your self-hosted URL
```

Without the SDK or credentials the hooks no-op silently — the plugin fails
open.

## Verify

```bash
kenxcode plugins list                 # observability/langfuse should show "enabled"
kenxcode chat -q "hello"              # then check Langfuse for a "KenXCode turn" trace
```

## Optional tuning

```bash
KENXCODE_LANGFUSE_ENV=production       # environment tag
KENXCODE_LANGFUSE_RELEASE=v1.0.0       # release tag
KENXCODE_LANGFUSE_SAMPLE_RATE=0.5      # sample 50% of traces
KENXCODE_LANGFUSE_MAX_CHARS=12000      # max chars per field (default: 12000)
KENXCODE_LANGFUSE_DEBUG=true           # verbose plugin logging
```

## Disable

```bash
kenxcode plugins disable observability/langfuse
```
