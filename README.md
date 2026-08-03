# KenXCode ⚡

AI Agent for Pentest, Coding, and Everything.

Based on [Hermes Agent](https://github.com/NousResearch/hermes-agent) by Nous Research.

## Quick Install

```bash
# One-liner install (download & run)
curl -fsSL https://raw.githubusercontent.com/kenxploitz/kenxcode/main/kenxcode.sh -o /tmp/kenxcode.sh && chmod +x /tmp/kenxcode.sh && /tmp/kenxcode.sh

# Or clone + install
git clone https://github.com/kenxploitz/kenxcode.git && cd kenxcode && ./kenxcode.sh
```

## Update

```bash
# One-liner update
curl -fsSL https://raw.githubusercontent.com/kenxploitz/kenxcode/main/update.sh | sh

# Or from menu
./kenxcode.sh
# → Select 6) Update KenXCode
```

## What You Get

- **Pentest Skills** — Recon, exploit, post-exploit, OSINT, reporting
- **Coding Skills** — Full-stack, debugging, refactoring, testing
- **DevOps Skills** — Docker, CI/CD, infrastructure, monitoring
- **YOLO Mode** — Auto-approve all tools
- **Session Management** — SQLite sessions with search
- **Messaging Gateway** — Telegram, Discord, Slack, WhatsApp
- **Background Tasks** — Run tasks in parallel
- **Cron Scheduling** — Automated tasks

## Usage

```bash
# Interactive mode
kenxcode

# Single query
kenxcode chat -q "scan target.com for SQLi"

# Auto-approve all tools
kenxcode --yolo

# Pentest mode
kenxcode /personality pentest

# Coding mode
kenxcode /personality coding

# Resume session
kenxcode --continue

# Messaging gateway
kenxcode gateway setup
kenxcode gateway start
```

## Skills

### Pentest Skills
- `kenxcode-recon` — Reconnaissance & information gathering
- `kenxcode-exploit` — Web exploitation techniques
- `kenxcode-post` — Post-exploitation & persistence
- `kenxcode-osint` — OSINT & intelligence gathering

### Coding Skills
- `kenxcode-code` — Full-stack development
- `kenxcode-review` — Code review & security audit
- `kenxcode-debug` — Debugging & troubleshooting
- `kenxcode-devops` — DevOps & automation

## Configuration

Config file: `~/.kenxcode/config.yaml`

```yaml
provider:
  name: openai-compatible
  base_url: https://api.farouter.tech/v1
  model: deepseek-v4-pro

agent:
  yolo_mode: true
  personalities:
    kenxcode: "You are KenXCode, a multi-purpose AI agent."
    pentest: "You are a penetration testing specialist."
    coding: "You are a senior software engineer."
```

## Uninstall

```bash
~/.kenxcode/uninstall.sh

# Or
./install.sh --uninstall
```

## License

MIT License — Based on Hermes Agent by Nous Research.

## Credits

- [Hermes Agent](https://github.com/NousResearch/hermes-agent) — Base framework
- [Nous Research](https://nousresearch.com) — Original author
- KenXCode Team — Fork & pentest/coding skills
