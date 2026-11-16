---
name: setup
description: Connect this plugin to the Diffchecker Desktop app installed on the user's computer. Use when the user asks to set up or connect Diffchecker, when the Diffchecker comparison tools are missing, or when a Diffchecker tool returns AUTHORIZATION_INVALID_CAPABILITY.
---

# Set up Diffchecker

The plugin does not contain Diffchecker. It starts the Diffchecker Desktop app
that is installed on the user's computer. The user approves the connection
once in the app, and the app then writes a small file the plugin reads each
time it starts.

## Rules

- The user approves setup in Diffchecker. Do not try to skip that step.
- Do not read, print, create, or edit `~/.diffchecker/claude-plugin.json`. It
  holds a secret key that only Diffchecker writes.
- Do not download or install software without asking the user.

## Requirements

- Diffchecker Desktop, up to date and signed in, on macOS or Windows.
- A Diffchecker Pro, Legal, or Enterprise plan, or an active free trial.
- Node.js on the user's `PATH`. The plugin starts with `node`.
- Claude runs on the same computer and in the same desktop session as
  Diffchecker. This does not work over SSH, in a container, or in a browser.

## Steps

1. Open the setup link.

   macOS:

   ```
   open "diffchecker://ai-assistants?client=claude-plugin"
   ```

   Windows (PowerShell, cmd, or Git Bash):

   ```
   powershell.exe -NoProfile -Command "Start-Process 'diffchecker://ai-assistants?client=claude-plugin'"
   ```

   If you cannot run commands, ask the user to open Diffchecker, go to
   Preferences, then Integrations, find "AI Assistants", and click "Set up"
   next to "Claude plugin".

2. Tell the user: "Diffchecker is asking whether to set up the Claude plugin.
   Click Set up, then tell me when it is done." Wait for the user.

   If Diffchecker was already set up in Claude Code on its own, the prompt
   says that setting up the plugin removes that entry. That is expected: with
   both, every Diffchecker tool would appear twice.

3. Reload the plugin so it starts again. In Claude Code the user runs
   `/reload-plugins` or starts a new session. Anywhere else, the user starts a
   new session.

4. Try it: compare two files the user names by full path.

## If it does not work

| What happens | Cause | What to tell the user |
| --- | --- | --- |
| The command fails because nothing opens `diffchecker://` links | Diffchecker Desktop is not installed | Install it from https://www.diffchecker.com/desktop/ |
| Diffchecker opens with no prompt, or has no "Claude plugin" row | The installed Diffchecker is too old for this plugin | Update Diffchecker, then repeat step 1 |
| "Your plan does not include AI assistants." | The plan needs upgrading | https://www.diffchecker.com/pricing/ |
| A sign-in or welcome page | The user is signed out | Sign in to Diffchecker, then repeat step 1 |
| The tools are still missing after a reload | Node.js is not on the `PATH`, or the app was moved | Install Node.js; or click "Update" next to "Claude plugin" in Diffchecker |
| A tool returns `AUTHORIZATION_INVALID_CAPABILITY` | The key was regenerated | Click "Update" next to "Claude plugin" in Diffchecker, then reload |
