import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const credit = 'Created and maintained by <a href="https://zeespire.com" target="_blank" rel="noopener noreferrer">ZeeSpire Software Solutions</a>.';

async function htmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'tests') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

test('all Historical Yearbook pages use the canonical ZeeSpire credit', async () => {
  const files = await htmlFiles(projectRoot);
  assert.equal(files.length, 29);
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    assert.ok(html.includes(credit), `${file} is missing the canonical credit`);
    assert.doesNotMatch(html, /Created by\s*<a[^>]*>\s*ZeeSpire\.com/i);
  }
});
