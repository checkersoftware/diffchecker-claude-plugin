// Prototype only, and not part of the plugin. Diffchecker Desktop does not
// write the plugin's registration file yet, so this copies the launch entry
// the app already wrote for Claude Code into the place the plugin reads. It
// never prints the key.
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

const source = path.join(homedir(), '.claude.json');
const targetDirectory = path.join(homedir(), '.diffchecker');
const target = path.join(targetDirectory, 'claude-plugin.json');

function stop(message) {
  console.error(message);
  process.exit(1);
}

let entry;
try {
  entry = JSON.parse(readFileSync(source, 'utf8')).mcpServers?.diffchecker;
} catch (error) {
  stop(`Could not read ${source}: ${error.message}`);
}
if (typeof entry?.command !== 'string') {
  stop(
    `${source} has no "diffchecker" server. In Diffchecker, open Preferences > Integrations > AI Assistants and set up Claude Code first.`,
  );
}

const registration = {
  version: 1,
  command: entry.command,
  args: entry.args ?? [],
  env: entry.env ?? {},
};

mkdirSync(targetDirectory, { recursive: true, mode: 0o700 });
const temporary = `${target}.${process.pid}.tmp`;
writeFileSync(temporary, `${JSON.stringify(registration, null, 2)}\n`, {
  flag: 'wx',
  mode: 0o600,
});
renameSync(temporary, target);

console.log(`Wrote ${target}`);
console.log(`  command: ${registration.command}`);
console.log(`  args: ${registration.args.length}`);
console.log(`  env: ${Object.keys(registration.env).join(', ')}`);
