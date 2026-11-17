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
- [Node.js](https://nodejs.org/) on your `PATH`.
- Claude Code, or a Cowork session that runs on your computer. Chat on
  claude.ai does not load local tools.

## Setup

1. Install the plugin. In Claude Code:

   ```
   /plugin install diffchecker --marketplace checkersoftware/diffchecker-claude-plugin
   ```

2. Ask Claude to "set up Diffchecker". Diffchecker opens and asks you to
   confirm.
3. Click **Set up** in Diffchecker.
4. Start a new session, or run `/reload-plugins` in Claude Code.

You can also do step 2 by hand: in Diffchecker, open Preferences, then
Integrations, find "AI Assistants", and click **Set up** next to "Claude
plugin".

If you had already set up Claude Code in Diffchecker, setting up the plugin
removes that entry, so Claude does not get every Diffchecker tool twice.

## What the plugin runs and reads

The plugin contains no part of Diffchecker and makes no network requests. It
has one script, `server/launch.mjs`, which Claude starts with `node`. The
script:

1. Reads `~/.diffchecker/claude-plugin.json`. Diffchecker Desktop writes this
   file when you click **Set up**. It holds the location of the Diffchecker app
   and a key the app checks. The script refuses a file that other users can
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

- **The Diffchecker tools do not appear.** Check that `node --version` works in
  a terminal, then ask Claude to "set up Diffchecker" again.
- **`AUTHORIZATION_INVALID_CAPABILITY`.** The key changed. In Diffchecker,
  click **Update** next to "Claude plugin", then start a new session.
- **`AUTHORIZATION_DISABLED`.** Turn on "Let AI assistants use Diffchecker" in
  Diffchecker Preferences.
- **`LICENSE_INVALID` or `ENTITLEMENT_MISSING`.** Sign in to Diffchecker, or
  see https://www.diffchecker.com/pricing/.

## Support

https://www.diffchecker.com/contact/
