---
name: setup
description: Connect this plugin to the Diffchecker Desktop app installed on the user's computer. Use when the user asks to set up or connect Diffchecker, when the Diffchecker comparison tools are missing, or when a Diffchecker tool returns AUTHORIZATION_INVALID_CAPABILITY.
---

# Set up Diffchecker

The plugin does not contain Diffchecker. It starts `diffchecker-mcp`, a command
that belongs to the Diffchecker Desktop app installed on the user's computer.
The user approves the connection once in the app. The app then makes that
command findable and writes a small file the command reads each time it
starts.

## Rules

- The user approves setup in Diffchecker. Do not try to skip that step.
- Do not read, print, create, or edit `~/.diffchecker/claude-plugin.json`. It
  holds a secret key that only Diffchecker writes.
- Do not download or install software without asking the user.

## Requirements

- Diffchecker Desktop, up to date and signed in, on macOS or Windows.
- A Diffchecker Pro, Legal, or Enterprise plan, or an active free trial.
- Claude runs on the same computer and in the same desktop session as
  Diffchecker. This does not work over SSH, in a container, or in a browser.

## Steps

1. Open the setup link, but only from a shell on the user's own computer.
   In Claude Code it is. In chat and Cowork it is not: chat runs code in a
   sandbox, and Cowork runs shell commands in a virtual machine, so a command
   there cannot open Diffchecker. If `uname -s` prints `Linux`, the shell is not
   on the user's computer either, because Diffchecker Desktop runs only on macOS
   and Windows. In any of these cases, or if you cannot run commands, skip the
   commands below and ask the user to open Diffchecker, go to Preferences, then
   Integrations, find "AI Assistants", and click "Set up" next to "Claude
   plugin".

   macOS:

   ```
   open "diffchecker://ai-assistants?client=claude-plugin"
   ```

   Windows (PowerShell, cmd, or Git Bash):

   ```
   powershell.exe -NoProfile -Command "Start-Process 'diffchecker://ai-assistants?client=claude-plugin'"
   ```

2. If the link opened, tell the user: "Diffchecker is asking whether to set up
   the Claude plugin. Click Set up, then tell me when it is done." On the
   Preferences route, ask them to tell you once they have clicked Set up. Wait
   for the user.

   If Diffchecker was already set up in Claude Code or Claude Desktop on its
   own, the prompt says that setting up the plugin removes those entries. That
   is expected: with both, every Diffchecker tool would appear twice.

3. Reload the plugin so it starts again. In Claude Code the user runs
   `/reload-plugins` or starts a new session. Anywhere else, the user starts a
   new session. If the prompt said it removes Diffchecker from Claude Desktop,
   the user quits the Claude app fully and opens it again instead: until then
   it keeps the server it loaded at launch, and every tool appears twice.

   On Windows the first setup adds a folder to the user's `PATH`, and programs
   that are already open do not see it. If the tools are still missing there,
   the user quits the Claude app and opens it again, or opens a new terminal
   and starts Claude Code in it.

4. Try it: compare two files the user names by full path.

## If it does not work

| What happens | Cause | What to tell the user |
| --- | --- | --- |
| On the user's own computer, the command fails because nothing opens `diffchecker://` links | Diffchecker Desktop is not installed | Install it from https://www.diffchecker.com/desktop/ |
| Diffchecker opens with no prompt, or has no "Claude plugin" row | The installed Diffchecker is too old for this plugin | Update Diffchecker, then repeat step 1 |
| "Your plan does not include AI assistants." | The plan needs upgrading | https://www.diffchecker.com/pricing/ |
| A sign-in or welcome page | The user is signed out | Sign in to Diffchecker, then repeat step 1 |
| The tools are still missing after a reload, and "Claude plugin" in Diffchecker says "Needs updating" | The app was moved or reinstalled somewhere else | Click "Update" next to "Claude plugin" in Diffchecker, then reload |
| The tools are still missing, and Diffchecker shows "Claude plugin" as set up | Claude was open during setup, or Claude Code runs in a terminal whose `PATH` lacks `~/.local/bin` (macOS) | Quit Claude and open it again; in a terminal, `which diffchecker-mcp` (macOS) or `where diffchecker-mcp` (Windows) should print a path |
| A tool returns `AUTHORIZATION_INVALID_CAPABILITY` | The key was regenerated | Click "Update" next to "Claude plugin" in Diffchecker, then reload |
