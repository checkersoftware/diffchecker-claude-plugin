# Diffchecker plugin for Claude

A Claude plugin that connects Claude Code, and chat and Cowork in the Claude
desktop app, to Diffchecker Desktop, so Claude can redline Word and PDF
documents and compare text, images, and spreadsheets on your computer. The
comparisons run in the installed app; this plugin holds only a launcher that
starts it, and two skills.

| Folder | What it is |
| --- | --- |
| `plugin/` | The plugin as Claude loads it. Its [README](plugin/README.md) is the user-facing page. |
| `.claude-plugin/` | The marketplace file, so the plugin installs straight from this repository. |
| `test/` | Tests for the launcher, run with Node's own test runner, so they need no dependencies. |

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

Diffchecker Desktop writes that file, readable by its owner only, when the
user sets up "Claude plugin" in Preferences > Integrations > AI Assistants or
confirms the prompt that `diffchecker://ai-assistants?client=claude-plugin`
opens. The launcher refuses a file that is a link, belongs to another user, or
other users can read, and never prints the key.

The app writes this format, and its own tests run this launcher against a file
the app wrote. A change to the format has to land in both places.

## Develop

Check the plugin and the marketplace, and load the plugin for one session:

```sh
claude plugin validate plugin --profile directory
claude plugin validate .
claude --plugin-dir plugin
```

`/mcp` then lists the server as `plugin:diffchecker:diffchecker`.

Run the launcher tests:

```sh
node --test 'test/*.test.mjs'
```

## License

[MIT](LICENSE). The license covers this repository only; Diffchecker Desktop
keeps its own terms.
