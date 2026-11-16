import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const launcher = fileURLToPath(
  new URL('../plugin/server/launch.mjs', import.meta.url),
);
const posixOnly = { skip: process.platform === 'win32' };

// Stands in for the Diffchecker app: it reports its pid, then echoes each line
// with what it was started with.
const FAKE_APP = `
process.stdout.write(JSON.stringify({ pid: process.pid }) + '\\n');
process.stdin.setEncoding('utf8');
let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let end = buffer.indexOf('\\n');
  while (end >= 0) {
    const line = buffer.slice(0, end);
    buffer = buffer.slice(end + 1);
    if (line === 'exit 7') {
      process.exit(7);
    }
    process.stdout.write(
      JSON.stringify({
        line,
        argument: process.argv[2],
        mode: process.env.DIFFCHECKER_MCP_MODE,
      }) + '\\n',
    );
    end = buffer.indexOf('\\n');
  }
});
process.stdin.on('end', () => process.exit(0));
`;

let home;
let fakeApp;

beforeEach(() => {
  home = mkdtempSync(path.join(tmpdir(), 'diffchecker-plugin-'));
  fakeApp = path.join(home, 'fake-app.mjs');
  writeFileSync(fakeApp, FAKE_APP);
});

afterEach(() => {
  rmSync(home, { recursive: true, force: true });
});

function registrationPath() {
  return path.join(home, '.diffchecker', 'claude-plugin.json');
}

function writeRegistration(value, mode = 0o600) {
  mkdirSync(path.dirname(registrationPath()), { recursive: true });
  writeFileSync(
    registrationPath(),
    typeof value === 'string' ? value : JSON.stringify(value),
  );
  chmodSync(registrationPath(), mode);
}

function fakeRegistration(overrides = {}) {
  return {
    version: 1,
    command: process.execPath,
    args: [fakeApp, 'from-args'],
    env: { DIFFCHECKER_MCP_MODE: 'desktop' },
    ...overrides,
  };
}

function startLauncher() {
  const child = spawn(process.execPath, [launcher], {
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.setEncoding('utf8').on('data', (chunk) => {
    stderr += chunk;
  });
  const closed = new Promise((resolve) => {
    child.on('close', (code) => {
      resolve({
        code,
        stderr,
        lines: stdout
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line)),
      });
    });
  });
  const firstLine = new Promise((resolve) => {
    child.stdout.once('data', () => resolve());
  });
  return { child, closed, firstLine };
}

async function runLauncher(input = '') {
  const { child, closed } = startLauncher();
  child.stdin.end(input);
  return closed;
}

test('connects the client to the app named in the registration', async () => {
  writeRegistration(fakeRegistration());

  const result = await runLauncher('hello\nexit 7\n');

  assert.equal(result.code, 7);
  assert.deepEqual(result.lines[1], {
    line: 'hello',
    argument: 'from-args',
    mode: 'desktop',
  });
});

test('exits cleanly when the client closes its side', async () => {
  writeRegistration(fakeRegistration());

  const result = await runLauncher('hello\n');

  assert.equal(result.code, 0);
  assert.equal(result.lines[1].line, 'hello');
});

test(
  'stops the app when the client stops the launcher',
  posixOnly,
  async () => {
    writeRegistration(fakeRegistration());
    const { child, closed, firstLine } = startLauncher();
    await firstLine;

    child.kill('SIGTERM');
    const result = await closed;

    assert.equal(result.code, 1);
    assert.throws(() => process.kill(result.lines[0].pid, 0), {
      code: 'ESRCH',
    });
  },
);

test('explains setup when Diffchecker has not registered the plugin', async () => {
  const result = await runLauncher();

  assert.equal(result.code, 1);
  assert.match(result.stderr, /has not set up this plugin/);
  assert.match(result.stderr, /Preferences > Integrations > AI Assistants/);
});

test('refuses a registration other users can read', posixOnly, async () => {
  writeRegistration(fakeRegistration(), 0o644);

  const result = await runLauncher();

  assert.equal(result.code, 1);
  assert.match(result.stderr, /read or changed by other users/);
  assert.deepEqual(result.lines, []);
});

test('refuses a registration that is a link', posixOnly, async () => {
  const elsewhere = path.join(home, 'elsewhere.json');
  writeFileSync(elsewhere, JSON.stringify(fakeRegistration()), { mode: 0o600 });
  mkdirSync(path.dirname(registrationPath()), { recursive: true });
  symlinkSync(elsewhere, registrationPath());

  const result = await runLauncher();

  assert.equal(result.code, 1);
  assert.match(result.stderr, /could not be opened/);
  assert.deepEqual(result.lines, []);
});

for (const [name, registration, message] of [
  ['text that is not JSON', '{', /not valid JSON/],
  ['another version', fakeRegistration({ version: 2 }), /different version/],
  ['a relative command', fakeRegistration({ command: 'node' }), /incomplete/],
  ['a missing command', fakeRegistration({ command: undefined }), /incomplete/],
  [
    'arguments that are not text',
    fakeRegistration({ args: [1] }),
    /incomplete/,
  ],
  ['no arguments', fakeRegistration({ args: undefined }), /incomplete/],
  [
    'an environment that is not text',
    fakeRegistration({ env: { A: 1 } }),
    /incomplete/,
  ],
  ['an environment list', fakeRegistration({ env: [] }), /incomplete/],
]) {
  test(`refuses a registration with ${name}`, async () => {
    writeRegistration(registration);

    const result = await runLauncher();

    assert.equal(result.code, 1);
    assert.match(result.stderr, message);
    assert.deepEqual(result.lines, []);
  });
}

test('reports an app that is no longer where it was', async () => {
  writeRegistration(
    fakeRegistration({ command: path.join(home, 'Diffchecker'), args: [] }),
  );

  const result = await runLauncher();

  assert.equal(result.code, 1);
  assert.match(result.stderr, /could not be started/);
});
