#!/usr/bin/env node
// Bundles individual buzz-data/*.json files into a single JS constant
// for pasting into index.html.
//
// Usage: node bundle-buzz-data.mjs > reddit-buzz-bundle.js

import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUZZ_DATA_DIR = join(__dirname, "buzz-data");

function main() {
  const files = readdirSync(BUZZ_DATA_DIR).filter(f => f.endsWith(".json"));
  console.error(`Found ${files.length} buzz data files`);

  const allData = {};
  let globalMaxScore = 0;
  let validCount = 0;

  for (const file of files) {
    const raw = readFileSync(join(BUZZ_DATA_DIR, file), "utf-8");
    const data = JSON.parse(raw);

    if (!data.sentiment || data.error) {
      console.error(`  [skip] ${file} — no sentiment data`);
      continue;
    }

    // Track global max score across all quotes
    if (data.quotes) {
      for (const q of data.quotes) {
        if (q.score > globalMaxScore) globalMaxScore = q.score;
      }
    }

    allData[data.cardId] = {
      sentiment: data.sentiment,
      mentionCount: data.mentionCount,
      tensionSummary: data.tensionSummary,
      distribution: data.distribution,
      quotes: data.quotes || [],
      tips: data.tips || [],
      alternatives: data.alternatives || [],
      scrapedAt: data.scrapedAt,
    };
    validCount++;
  }

  console.error(`\nBundled ${validCount} cards with data`);
  console.error(`Global max score: ${globalMaxScore}`);

  // Output JS constants
  console.log(`    const GLOBAL_MAX_SCORE = ${globalMaxScore};`);
  console.log(`    const REDDIT_BUZZ_DATA = ${JSON.stringify(allData, null, 2)};`);
}

main();
