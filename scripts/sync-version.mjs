#!/usr/bin/env node
// Copies the version from package.json into .claude-plugin/plugin.json.
// Runs from the npm "version" hook, so `npm version patch` keeps both in step.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const pluginPath = path.join(ROOT, '.claude-plugin', 'plugin.json');
const plugin = JSON.parse(readFileSync(pluginPath, 'utf8'));
if (plugin.version !== version) {
  writeFileSync(pluginPath, JSON.stringify({ ...plugin, version }, null, 2) + '\n');
  console.log(`plugin.json version set to ${version}`);
}
