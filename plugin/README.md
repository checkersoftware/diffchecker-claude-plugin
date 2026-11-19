# Diffchecker

Compare files with [Diffchecker Desktop](https://www.diffchecker.com/desktop/)
from Claude. Ask Claude to redline two Word or PDF documents, or to compare two
texts, images, or spreadsheets, and it runs the comparison in the Diffchecker
app on your computer.

## What you can ask for

- A tracked-changes Word redline of two Word or PDF documents, with a PDF copy
  and a list of changes.
- A side-by-side page comparison of two PDF or Word documents, with a
  highlighted PDF.
- A diff of two texts or text files, as a change list, a patch, or a PDF.
- A pixel comparison of two images.
- A cell-by-cell comparison of two spreadsheets or CSV files.
- Opening two files side by side in the Diffchecker app.

## Requirements

- Diffchecker Desktop, signed in, on macOS or Windows.
- A Diffchecker Pro, Legal, or Enterprise plan, or an active free trial.
- Claude Code, or chat or a Cowork session in the Claude desktop app on your
  computer. Chat on claude.ai does not load local tools.

## Setup

1. Install the plugin in the Claude desktop app. Open **Customize** >
   **Plugins**, select **Add marketplace**, enter
   `checkersoftware/diffchecker-claude-plugin`, and install Diffchecker. That
   saves it to your Claude account, so chat, Cowork, and Claude Code all load
   it.

   To install it for Claude Code alone, run this in Claude Code instead:

   ```
   /plugin install diffchecker --marketplace checkersoftware/diffchecker-claude-plugin
   ```

   A copy installed this way stays on that computer and does not reach chat or
   Cowork. Step 3 removes Diffchecker's Claude Desktop entry, so if you use
   Diffchecker in chat or Cowork, install the plugin in the Claude app.

2. Ask Claude to "set up Diffchecker". In Claude Code, Diffchecker opens and
   asks you to confirm. In chat and Cowork, Claude cannot open Diffchecker for
   you, so it asks you to open Preferences in Diffchecker instead.
3. Click **Set up** in Diffchecker.
4. In Claude Code, type `/mcp`, select `plugin:diffchecker:diffchecker`, and
   choose **Reconnect**. A new session is not enough: Claude Code skips a
   plugin server for 15 minutes after it fails to start, and it failed in any
   session that started before setup. If setup removed Diffchecker from Claude Code,
   start a new session first and reconnect in that one: the session you set up
   in keeps Diffchecker's old server, so it would get every tool twice. In chat
   and Cowork, start a new session. If setup removed Diffchecker from Claude
   Desktop, quit the Claude app and open it again.

   On Windows, after the first setup, quit the Claude app and open it again,
   and open a new terminal before starting Claude Code, then reconnect in
   `/mcp` if the tools are missing: setup adds a folder to your `PATH`, which
   programs that are already open do not see.

You can also do step 2 by hand: in Diffchecker, open Preferences, then
Integrations, find "AI Assistants", and click **Set up** next to "Claude
plugin".

If you had already set up Claude Code or Claude Desktop in Diffchecker, setting
up the plugin removes those entries, so Claude does not get every Diffchecker
tool twice. Quit the Claude desktop app first if Diffchecker asks you to:
while it is open, it can put its entry back.

## What the plugin runs and reads

The plugin contains no program and makes no network requests. It holds
instructions for Claude and one setting: Claude starts the command
`diffchecker-mcp`.

That command is part of Diffchecker Desktop. It stays inside the app, and
clicking **Set up** makes it findable: on macOS with a link at
`~/.local/bin/diffchecker-mcp`, on Windows by adding its folder inside the
Diffchecker install to your `PATH`. **Remove** in Diffchecker undoes that. The
command:

1. Reads `~/.diffchecker/claude-plugin.json`. Diffchecker Desktop writes this
   file when you click **Set up**. It holds the location of the Diffchecker app
   and a key the app checks. The command refuses a file that other users can
   read or change.
2. Starts the Diffchecker app named in that file, in its background mode for AI
   assistants, and connects Claude to it.

Everything else happens in the Diffchecker app: it checks the key, your
license, and the "Let AI assistants use Diffchecker" switch on every request.
The plugin's two skills, `compare` and `setup`, are instructions for Claude
and run nothing by themselves.

## Privacy Policy

Comparisons run in the Diffchecker app on your computer, and the result files
are saved there. One step can leave your computer: on macOS, converting a PDF
with Microsoft Word, which is off unless you turn it on in Diffchecker
Preferences, uploads the PDF to Microsoft. What a comparison returns to Claude
is handled by Anthropic under its own terms.

Diffchecker Desktop's privacy policy:
https://www.diffchecker.com/desktop-privacy/

## Troubleshooting

- **The Diffchecker tools do not appear.** Update Diffchecker Desktop, then ask
  Claude to "set up Diffchecker" again. If Diffchecker shows "Claude plugin" as
  set up, reconnect `plugin:diffchecker:diffchecker` in `/mcp` in Claude Code,
  or quit Claude and open it again. For Claude Code on macOS, in a
  terminal or in the Claude app's Code tab, also check that `~/.local/bin` is
  on your `PATH`: `which diffchecker-mcp` should print a path. If it prints
  nothing, add `export PATH="$HOME/.local/bin:$PATH"` to `~/.zshrc`, then open
  a new terminal or quit and reopen the Claude app.
- **Claude Code background sessions do not get the tools (macOS).** Sessions
  started with `claude --bg` or from `claude agents` run with only the system
  `PATH`, so they do not find `diffchecker-mcp` even when your shell does. Set
  the `PATH` for Claude Code in `~/.claude/settings.json`, adding `PATH` to its
  `env` section if it already has one:

  ```json
  {
    "env": {
      "PATH": "/Users/you/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    }
  }
  ```

  Write out every folder in full: `$PATH` and `~` are not expanded there. The
  value replaces the `PATH` in every Claude Code session, so include every
  folder your other tools need. `echo $PATH` in a terminal prints the list to
  start from.
- **`AUTHORIZATION_INVALID_CAPABILITY`.** The key changed. In Diffchecker,
  click **Update** next to "Claude plugin", then reconnect
  `plugin:diffchecker:diffchecker` in `/mcp` in Claude Code, or start a new
  session in chat and Cowork.
- **`AUTHORIZATION_DISABLED`.** Turn on "Let AI assistants use Diffchecker" in
  Diffchecker Preferences.
- **`LICENSE_INVALID` or `ENTITLEMENT_MISSING`.** Sign in to Diffchecker, or
  see https://www.diffchecker.com/pricing/.

## Support

https://www.diffchecker.com/contact/
