/**
 * Updates the DRIVE_DISTANCES constant in index.html from distances.json.
 * Usage: node scripts/update-distances.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const distances = JSON.parse(readFileSync(join(root, 'distances.json'), 'utf8'));
let html = readFileSync(join(root, 'index.html'), 'utf8');

const marker = '    const DRIVE_DISTANCES = ';
const startIdx = html.indexOf(marker);
if (startIdx === -1) {
  console.error('ERROR: Could not find DRIVE_DISTANCES in index.html');
  process.exit(1);
}
// Find the end of the line (the semicolon + newline)
const lineEnd = html.indexOf(';\n', startIdx);
const oldLine = html.slice(startIdx, lineEnd + 1);
const newLine = `    const DRIVE_DISTANCES = ${JSON.stringify(distances)};`;

html = html.replace(oldLine, newLine);
writeFileSync(join(root, 'index.html'), html);
console.log(`Done! Updated DRIVE_DISTANCES (${Object.keys(distances).length} entries).`);
