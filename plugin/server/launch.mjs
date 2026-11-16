import { spawn } from 'node:child_process';
import {
  closeSync,
  constants,
  fstatSync,
  openSync,
  readFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

// Diffchecker Desktop writes this file when the user approves the plugin in
// the app. It names the installed app and carries the key the app checks, so
// the plugin never has to find the app or ask the user for the key.
const registrationPath = path.join(
  homedir(),
  '.diffchecker',
  'claude-plugin.json',
);
const REGISTRATION_VERSION = 1;
const SETUP_HINT =
  'Open Diffchecker Desktop, go to Preferences > Integrations > AI Assistants, and set up the Claude plugin.';

class RegistrationError extends Error {}

function isStringArray(value) {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isStringRecord(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function readRegistrationText() {
  let descriptor;
  try {
    // O_NOFOLLOW is undefined on Windows, where the flag does not exist.
    descriptor = openSync(
      registrationPath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new RegistrationError(
        `Diffchecker Desktop has not set up this plugin. ${SETUP_HINT}`,
      );
    }
    throw new RegistrationError(
      `${registrationPath} could not be opened (${error.code}). ${SETUP_HINT}`,
    );
  }
  try {
    const stats = fstatSync(descriptor);
    if (!stats.isFile()) {
      throw new RegistrationError(`${registrationPath} is not a regular file.`);
    }
    // The file holds a key and names a program to run, so it must be the
    // user's own and closed to everyone else. Windows has no such mode bits;
    // the profile folder's access list does that job there.
    if (process.platform !== 'win32') {
      if (stats.uid !== process.getuid()) {
        throw new RegistrationError(
          `${registrationPath} belongs to another user.`,
        );
      }
      if ((stats.mode & 0o077) !== 0) {
        throw new RegistrationError(
          `${registrationPath} can be read or changed by other users. ${SETUP_HINT}`,
        );
      }
    }
    return readFileSync(descriptor, 'utf8');
  } finally {
    closeSync(descriptor);
  }
}

function readRegistration() {
  let registration;
  try {
    registration = JSON.parse(readRegistrationText());
  } catch (error) {
    if (error instanceof RegistrationError) {
      throw error;
    }
    throw new RegistrationError(
      `${registrationPath} is not valid JSON. ${SETUP_HINT}`,
    );
  }
  if (registration?.version !== REGISTRATION_VERSION) {
    throw new RegistrationError(
      `${registrationPath} was written for a different version of this plugin. Update Diffchecker Desktop and the plugin.`,
    );
  }
  const { command, args, env } = registration;
  if (
    typeof command !== 'string' ||
    !path.isAbsolute(command) ||
    !isStringArray(args) ||
    !isStringRecord(env)
  ) {
    throw new RegistrationError(
      `${registrationPath} is incomplete. ${SETUP_HINT}`,
    );
  }
  return { command, args, env };
}

function exitWith(message) {
  process.stderr.write(`Diffchecker plugin: ${message}\n`);
  process.exit(1);
}

function start({ command, args, env }) {
  // The app speaks MCP on the streams it inherits, so nothing is relayed or
  // parsed here.
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: 'inherit',
    windowsHide: true,
  });
  child.on('error', (error) => {
    exitWith(
      `Diffchecker could not be started at ${command} (${error.code ?? error.message}). ${SETUP_HINT}`,
    );
  });
  child.on('exit', (code) => {
    // A null code means a signal ended the app.
    process.exit(code ?? 1);
  });
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
      child.kill(signal);
    });
  }
}

try {
  start(readRegistration());
} catch (error) {
  if (!(error instanceof RegistrationError)) {
    throw error;
  }
  exitWith(error.message);
}
