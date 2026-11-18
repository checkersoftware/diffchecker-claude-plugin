# Diffchecker plugin for Claude

A Claude plugin that connects Claude Code, and chat and Cowork in the Claude
desktop app, to Diffchecker Desktop, so Claude can redline Word and PDF
documents and compare text, images, and spreadsheets on your computer. The
comparisons run in the installed app. This plugin holds no program, only two
skills and the setting that tells Claude to start the app's
`diffchecker-mcp` command.

| Folder | What it is |
| --- | --- |
| `plugin/` | The plugin as Claude loads it. Its [README](plugin/README.md) is the user-facing page. |
| `.claude-plugin/` | The marketplace file, so the plugin installs straight from this repository. |

## Install

In the Claude desktop app, open **Customize** > **Plugins**, select **Add
marketplace**, enter `checkersoftware/diffchecker-claude-plugin`, and install
Diffchecker. That saves it to your Claude account, so chat, Cowork, and Claude
Code all load it. Then ask Claude to "set up Diffchecker"; the plugin's
[setup skill](plugin/skills/setup/SKILL.md) connects it to Diffchecker Desktop.

To install it for Claude Code alone, run this in Claude Code instead:

```
/plugin install diffchecker --marketplace checkersoftware/diffchecker-claude-plugin
```

A copy installed this way stays on that computer and does not reach chat or
Cowork. The plugin's [README](plugin/README.md) has the full setup steps.

## How it connects

`plugin/.mcp.json` starts the command `diffchecker-mcp`, which Claude looks up
the way a shell would. The command ships inside Diffchecker Desktop and stays
there: setting the plugin up makes it findable, with a link at
`~/.local/bin/diffchecker-mcp` on macOS and by adding its folder in the
Diffchecker install to the user's `PATH` on Windows. Neither Claude Code nor
the Claude desktop app gives a plugin's server a runtime such as Node.js, so
the plugin cannot carry a script of its own.

The command reads `~/.diffchecker/claude-plugin.json` and starts the program
it names with Claude's own input and output streams:

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

Diffchecker Desktop writes that file, readable by its owner only, when the
user sets up "Claude plugin" in Preferences > Integrations > AI Assistants or
confirms the prompt that `diffchecker://ai-assistants?client=claude-plugin`
opens. The command refuses a file that is a link, belongs to another user, or
other users can read, and never prints the key. The file and the command both
belong to the app, so the format changes only with a Diffchecker release.

## Develop

Check the plugin and the marketplace, and load the plugin for one session:

```sh
claude plugin validate plugin --profile directory
claude plugin validate .
claude --plugin-dir plugin
```

`/mcp` then lists the server as `plugin:diffchecker:diffchecker`, connected
once Diffchecker Desktop has set the plugin up.

## License

[MIT](LICENSE). The license covers this repository only; Diffchecker Desktop
keeps its own terms.
