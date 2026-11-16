# Diffchecker plugin for Claude (prototype)

A Claude plugin that connects Claude Code and Cowork to the desktop MCP server
in Diffchecker Desktop (`packages/mcp`, `packages/web/electron/ai`). Anthropic's
directory no longer lists a local MCP server by itself; it has to ship inside a
plugin, and a plugin may hold only readable text files. So the plugin holds a
launcher that starts the installed app.

| Folder | What it is |
| --- | --- |
| `plugin/` | The plugin as Claude loads it. This folder alone is what the directory would scan and what users would install. |
| `test/` | Tests for the launcher, run with Node's own test runner so they need no dependencies. |
| `dev/` | Prototype helpers. Never part of the plugin. |

## How it connects

`plugin/.mcp.json` starts `node plugin/server/launch.mjs`. The launcher reads
`~/.diffchecker/claude-plugin.json` and starts the program it names with
Claude's own input and output streams:

```json
{
  "version": 1,
  "command": "/Applications/Diffchecker.app/Contents/MacOS/Diffchecker",
  "args": [],
  "env": {
    "DIFFCHECKER_MCP_MODE": "desktop",
    "DIFFCHECKER_MCP_CAPABILITY": "<the app's registration key>"
  }
}
```

`command`, `args`, and `env` are the launch entry the app already builds for
every assistant (`launchEntry` in `packages/web/electron/ai/runtime-state.ts`),
so the Windows stdio launcher and `ELECTRON_RUN_AS_NODE` come along without
any platform code in the plugin.

Diffchecker writes the file when the user sets up the "Claude plugin" row in
Preferences > Integrations > AI Assistants, or confirms the prompt that
`diffchecker://ai-assistants?client=claude-plugin` opens. That registration is
the `claude-plugin` target in `packages/web/electron/ai/client-targets.ts`, and
"Client registration" in `packages/mcp/README.md` has its rules.

## Not built yet

- A released Diffchecker does not have the registration yet, so against an
  installed app the file comes from the helper below.
- Setting up both the plugin and Claude Code gives Claude Code every tool
  twice. Nothing removes the other entry.

## Try it

With a build of this branch, click Set up next to "Claude plugin" in
Diffchecker. With an installed release, set up Claude Code there instead, then
copy that entry to where the plugin reads it. The helper never prints the key:

```sh
node packages/claude-plugin/dev/write-registration.mjs
```

Check the plugin and load it for one session:

```sh
claude plugin validate packages/claude-plugin/plugin
claude --plugin-dir packages/claude-plugin/plugin
```

`/mcp` then lists the server as `plugin:diffchecker:diffchecker`, next to the
app's own `diffchecker` entry, so each tool appears twice while both exist.

Run the launcher tests:

```sh
node --test packages/claude-plugin/test/
```

To undo the helper, delete `~/.diffchecker/claude-plugin.json`.

## Moving it to its own repository

The directory reads a plugin from a GitHub repository that must be public
before the listing goes live, so the plugin cannot be published from this one.
Nothing here imports from the rest of the repository. To move it with its
history:

```sh
git subtree split --prefix=packages/claude-plugin -b claude-plugin-export
```

Push that branch to the new repository, drop `dev/`, and submit with `plugin`
as the plugin path. The plugin still needs a `LICENSE` file or a `license`
field in `plugin.json` before the directory accepts it.
