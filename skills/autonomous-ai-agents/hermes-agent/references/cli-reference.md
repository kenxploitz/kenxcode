# KenXCode CLI Reference

Live sources when anything looks stale: `kenxcode --help`, `kenxcode <command> --help`,
https://kenxcode-agent.nousresearch.com/docs/reference/cli-commands

### Global Flags

```
kenxcode [flags] [command]        (no subcommand = interactive chat)

  --version, -V             Show version
  -z, --oneshot PROMPT      One-shot: print ONLY the final response (for scripts/pipes)
  -m MODEL  --provider P    Model/provider override for this invocation
  -t, --toolsets LIST       Comma-separated toolsets for this invocation
  --resume, -r SESSION      Resume session by ID or title
  --continue, -c [NAME]     Resume by name, or most recent session
  --worktree, -w            Isolated git worktree mode (parallel agents)
  --skills, -s SKILL        Preload skills (comma-separate or repeat)
  --profile, -p NAME        Use a named profile
  --yolo                    Skip dangerous command approval
  --tui / --cli             Force the Ink TUI / classic REPL
  --ignore-rules            Skip AGENTS.md/SOUL.md/memory/skill injection
  --safe-mode               Disable ALL customizations (troubleshooting)
  --pass-session-id         Include session ID in system prompt
```

### Chat

```
kenxcode chat [flags]
  -q, --query TEXT          Single query, non-interactive
  --image PATH              Attach a local image to a single query
  -Q, --quiet               Suppress banner, spinner, tool previews
  --checkpoints             Enable filesystem checkpoints (/rollback)
  --max-turns N             Cap tool-calling iterations
  --source TAG              Session source tag (default: cli)
```
(plus the global flags above)

### Configuration

```
kenxcode setup [section]      Wizard (model|tts|terminal|gateway|tools|agent)
kenxcode model                Interactive model/provider picker
kenxcode fallback [add|remove|list]  Fallback provider chain
kenxcode config [show|edit|get|set|unset|path|env-path|check|migrate]
kenxcode login / logout       OAuth sign-in / clear stored auth
kenxcode doctor [--fix]       Check dependencies and config
kenxcode status [--all]       Component status
```

### Tools & Skills

```
kenxcode tools [list|enable NAME|disable NAME]   Per-platform toolsets (curses UI with no args)

kenxcode skills list|browse|search QUERY|inspect ID
kenxcode skills install ID    Hub identifier OR a direct https://…/SKILL.md URL
kenxcode skills config        Enable/disable skills per platform
kenxcode skills check|update|uninstall|publish PATH
kenxcode skills tap add REPO  Add a GitHub repo as a skill source
kenxcode bundles              Skill bundles (one /<name> alias loads several skills)
```

### MCP Servers

```
kenxcode mcp add NAME (--url or --command) | remove | list | test NAME
kenxcode mcp catalog | install NAME     Curated catalog install
kenxcode mcp configure NAME             Toggle tool selection
kenxcode mcp serve                      Run KenXCode as an MCP server
```
Details (transport, tool discovery, catalog): `references/native-mcp.md`.

### Gateway (Messaging Platforms)

```
kenxcode gateway run|install|start|stop|restart|status|setup
```

20+ platforms: Telegram, Discord, Slack, WhatsApp (Baileys + Business Cloud API), iMessage (Photon — `kenxcode photon setup`), Signal, Email, SMS, Matrix, Mattermost, Teams, LINE, SimpleX, ntfy, Google Chat, Home Assistant, DingTalk, Feishu, WeCom, Weixin, API Server, Webhooks. Open WebUI connects via the API Server adapter. Most adapters ship under `plugins/platforms/`.
Docs: https://kenxcode-agent.nousresearch.com/docs/user-guide/messaging/

### Sessions

```
kenxcode sessions list|browse|rename ID TITLE|delete ID|export OUT|prune|stats
```

### Cron / Webhooks

```
kenxcode cron list|create SCHED|edit ID|pause|resume|run ID|remove|status
    Schedules: '30m', 'every 2h', '0 9 * * *', ISO timestamp
kenxcode webhook subscribe NAME|list|remove NAME|test NAME
```
Webhook payloads/routes: `references/webhooks.md`.

### Profiles

```
kenxcode profile list|create NAME (--clone|--clone-all|--clone-from)|use|show|delete
kenxcode profile rename A B | alias NAME | export NAME | import FILE
```

### Credentials & Pools

```
kenxcode auth                 Interactive credential manager
kenxcode auth add [PROVIDER]  Add OAuth or API-key credential (nous, openai-codex, qwen-oauth, …)
kenxcode auth list|remove P IDX|reset PROVIDER|status
```
Multiple credentials per provider form a pool that rotates automatically and skips exhausted keys.

### Other

```
kenxcode desktop / gui        Native desktop app
kenxcode dashboard            Web admin panel + embedded chat (--stop / --status)
kenxcode proxy                OpenAI-compatible local proxy backed by an OAuth provider
kenxcode portal               Quick setup / sign in via Nous Portal
kenxcode kanban <verb>        Multi-agent work-queue board
kenxcode project              Named multi-folder workspaces
kenxcode skin list|use|set    Switch/tweak skins (see references/themes.md)
kenxcode pets <verb>          Pet mascots (see references/petdex.md)
kenxcode memory setup|status|off|reset   Memory provider
kenxcode secrets bitwarden|onepassword   External secret stores
kenxcode moa                  Mixture-of-Agents slots
kenxcode hooks / security / backup / import / checkpoints / console
kenxcode logs [-f] [errors]   View agent/error logs
kenxcode send                 One-off message through a gateway platform
kenxcode pairing / plugins / insights / journey / computer-use
kenxcode acp                  ACP server (IDE integration)
kenxcode completion bash|zsh|fish
kenxcode update / uninstall / claw migrate
```

Plugin- and provider-supplied subcommands (e.g. `kenxcode photon setup`) only appear once their plugin is installed/active.

### Where to Find Things

| Looking for... | Location |
|---|---|
| Config options | `kenxcode config edit` · [Configuration docs](https://kenxcode-agent.nousresearch.com/docs/user-guide/configuration) |
| Tools / toolsets | `kenxcode tools list` · [Tools reference](https://kenxcode-agent.nousresearch.com/docs/reference/tools-reference) |
| Skills catalog | `kenxcode skills browse` · [Skills catalog](https://kenxcode-agent.nousresearch.com/docs/reference/skills-catalog) |
| Provider setup | `kenxcode model` · [Providers guide](https://kenxcode-agent.nousresearch.com/docs/integrations/providers) |
| Env variables | `kenxcode config env-path` · [Env vars reference](https://kenxcode-agent.nousresearch.com/docs/reference/environment-variables) |
| Gateway logs | `~/.kenxcode/logs/gateway.log` (or `kenxcode logs`) |
| Sessions | `kenxcode sessions browse` (reads state.db) |
