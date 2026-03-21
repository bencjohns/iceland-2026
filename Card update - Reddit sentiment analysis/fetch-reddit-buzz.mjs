#!/usr/bin/env node
// Reddit Buzz Scraper — fetches Reddit mentions of Iceland destinations
// and uses Claude API to classify sentiment and extract quotes.
//
// Usage:
//   node fetch-reddit-buzz.mjs                    # single card (legacy CARD config)
//   node fetch-reddit-buzz.mjs --card <id>        # single card by ID from card-configs
//   node fetch-reddit-buzz.mjs --all              # batch all cards
//   node fetch-reddit-buzz.mjs --all --resume     # batch, skip existing outputs
//   node fetch-reddit-buzz.mjs --raw              # dump raw mentions (no classification)
//
// Env: ANTHROPIC_API_KEY must be set (or in .env.local)

import Anthropic from "@anthropic-ai/sdk";
import { CARD_CONFIGS } from "./card-configs.mjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUZZ_DATA_DIR = join(__dirname, "buzz-data");

// Load .env.local from project root if it exists
const envPath = join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([\w]+)\s*=\s*(.+?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

// ── Configuration ──────────────────────────────────────────────────

const REDDIT_SEARCH_LIMIT = 10;
const COMMENT_LIMIT = 50;
const USER_AGENT = "IcelandTripPlanner/1.0 (family trip research)";
const RATE_LIMIT_MS = 2_000; // ~30 req/min (Reddit allows this with proper User-Agent)

// ── Helpers ────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function redditGet(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Reddit API ${res.status}: ${res.statusText} — ${url}`);
  }
  return res.json();
}

function mentionsPlace(text, name, aliases) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const terms = [name.toLowerCase(), ...aliases.map((a) => a.toLowerCase())];
  return terms.some((t) => lower.includes(t));
}

function truncateExcerpt(text, maxLen = 300) {
  if (!text || text.length <= maxLen) return text || "";
  return text.slice(0, maxLen).replace(/\s\S*$/, "") + "…";
}

// ── Step 1: Search Reddit ──────────────────────────────────────────

async function searchReddit(card) {
  const query = card.isGeneric
    ? `"${card.name}" Iceland`
    : `"${card.name}"`;
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&limit=${REDDIT_SEARCH_LIMIT}`;

  console.error(`[search] ${url}`);
  const data = await redditGet(url);
  const posts = (data?.data?.children || []).map((c) => c.data);
  console.error(`[search] Found ${posts.length} posts`);
  return posts;
}

// ── Step 2: Fetch comments & extract mentions ──────────────────────

async function fetchMentions(posts, card) {
  const mentions = [];

  for (const post of posts) {
    // Check post selftext
    if (mentionsPlace(post.selftext, card.name, card.aliases)) {
      mentions.push({
        text: truncateExcerpt(post.selftext),
        score: post.score,
        sub: `r/${post.subreddit}`,
        permalink: `https://reddit.com${post.permalink}`,
        isPost: true,
      });
    }

    // Fetch comments
    await sleep(RATE_LIMIT_MS);
    const commentUrl = `https://www.reddit.com${post.permalink}.json?sort=top&limit=${COMMENT_LIMIT}`;
    console.error(`[comments] ${post.subreddit}: "${post.title.slice(0, 60)}…"`);

    let commentData;
    try {
      commentData = await redditGet(commentUrl);
    } catch (e) {
      console.error(`[comments] Error: ${e.message}`);
      continue;
    }

    // commentData is an array: [post listing, comment listing]
    const commentListing = commentData?.[1]?.data?.children || [];
    for (const c of commentListing) {
      if (c.kind !== "t1") continue;
      const body = c.data.body;
      if (mentionsPlace(body, card.name, card.aliases)) {
        mentions.push({
          text: truncateExcerpt(body),
          score: c.data.score,
          sub: `r/${c.data.subreddit}`,
          permalink: `https://reddit.com${c.data.permalink}`,
          isPost: false,
        });
      }
    }
  }

  console.error(`[mentions] Extracted ${mentions.length} total mentions`);
  return mentions;
}

// ── Step 3: Claude API classification ──────────────────────────────

async function classifyWithClaude(mentions, card) {
  const client = new Anthropic();

  const mentionBlock = mentions
    .map(
      (m, i) =>
        `[${i + 1}] (score: ${m.score}, ${m.sub}) ${m.text}`
    )
    .join("\n\n");

  const prompt = `You are analyzing Reddit mentions of "${card.name}" (a destination/activity in Iceland).

Here are ${mentions.length} Reddit mentions (comments and posts) that reference this place:

${mentionBlock}

Classify EVERY mention and return a JSON object with exactly this structure (no markdown fences, just raw JSON):

{
  "sentiment": one of "legendary" | "loved" | "polarizing" | "mixed" | "overhyped" | "hidden-gem",
  "tensionSummary": a short quote-vs-quote tension line like "\\"Iconic experience\\" vs \\"It's just a hot dog\\"" — capture the core debate,
  "distribution": { "positive": <count>, "mixed": <count>, "negative": <count> },
  "quotes": [
    Classify EVERY SINGLE mention into the quotes array. Do NOT skip or deduplicate — include ALL ${mentions.length} mentions. Each as:
    {
      "text": "<exact or lightly cleaned quote>",
      "summary": "<3-5 word summary, e.g. 'Midnight sun magic' or 'Costco is right there'>",
      "emoji": "<single emoji hinting emotional register, e.g. 🌟, ⏰, 🤷, 😍, 💀>",
      "theme": "<tag: vibe, food_quality, wait_time, cost, crowds, scenery, weather, logistics, safety, overrated, underrated, tip>",
      "score": <number>,
      "sub": "<subreddit>",
      "camp": "positive"|"mixed"|"negative"
    }
  ],
  "tips": [
    0-3 practical tips extracted from mentions (can overlap with quotes), each as:
    { "text": "<tip text>", "score": <number>, "sub": "<subreddit>" }
  ],
  "alternatives": [
    any "instead go to..." recommendations mentioned, each as:
    { "name": "<place name>", "mentionCount": <how many mentions suggest it>, "context": "<why they suggest it, e.g. 'less crowded', 'cheaper', 'more authentic'>" }
  ]
}

Rules:
- "legendary" = overwhelmingly positive with almost no dissent
- "loved" = strongly positive with minor caveats
- "polarizing" = strong opinions on both sides
- "mixed" = no clear consensus
- "overhyped" = mostly negative, people think it's not worth it
- "hidden-gem" = positive but rarely mentioned / underrated
- IMPORTANT: Include ALL ${mentions.length} mentions in the quotes array — every single one. Do not summarize, merge, or skip any.
- For summary, write a vivid 3-5 word phrase capturing the quote's essence
- For emoji, pick ONE emoji that hints at the emotional register (not literal)
- For theme, use one of: vibe, food_quality, wait_time, cost, crowds, scenery, weather, logistics, safety, overrated, underrated, tip
- For tips, look for practical advice (best time to go, what to order, how to avoid crowds, etc.)
- For alternatives, include context explaining WHY they suggest it
- Return ONLY the JSON, no other text`;

  console.error(`[claude] Sending ${mentions.length} mentions for classification…`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text.trim();
  // Parse — handle potential markdown fences
  const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(jsonStr);
}

// ── Process a single card ──────────────────────────────────────────

async function processCard(card, { raw = false } = {}) {
  console.error(`\n=== Reddit Buzz: ${card.name} (${card.id}) ===\n`);

  // Search
  const posts = await searchReddit(card);
  if (posts.length === 0) {
    console.error("No posts found.");
    return { cardId: card.id, sentiment: null, mentionCount: 0, error: "no_posts", scrapedAt: new Date().toISOString() };
  }

  // Fetch mentions
  await sleep(RATE_LIMIT_MS);
  const mentions = await fetchMentions(posts, card);
  if (mentions.length === 0) {
    console.error("No mentions found.");
    return { cardId: card.id, sentiment: null, mentionCount: 0, error: "no_mentions", scrapedAt: new Date().toISOString() };
  }

  // If --raw flag, just dump mentions (for manual classification)
  if (raw) {
    return { cardId: card.id, mentions, scrapedAt: new Date().toISOString() };
  }

  // Classify
  const analysis = await classifyWithClaude(mentions, card);

  // Attach permalinks by matching quotes back to source mentions
  if (analysis.quotes) {
    for (const quote of analysis.quotes) {
      // Match by score first (most reliable), then by text overlap
      const match = mentions.find(m =>
        m.score === quote.score && m.sub === quote.sub
      ) || mentions.find(m =>
        m.score === quote.score
      ) || mentions.find(m =>
        quote.text && m.text && m.text.slice(0, 50) === quote.text.slice(0, 50)
      );
      if (match && match.permalink) {
        quote.permalink = match.permalink;
      }
    }
  }

  // Assemble final output
  return {
    cardId: card.id,
    sentiment: analysis.sentiment,
    mentionCount: mentions.length,
    tensionSummary: analysis.tensionSummary,
    distribution: analysis.distribution,
    quotes: analysis.quotes,
    tips: analysis.tips,
    alternatives: analysis.alternatives,
    scrapedAt: new Date().toISOString(),
  };
}

// ── Save output ────────────────────────────────────────────────────

function saveOutput(cardId, data) {
  mkdirSync(BUZZ_DATA_DIR, { recursive: true });
  const outPath = join(BUZZ_DATA_DIR, `${cardId}.json`);
  writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.error(`[saved] ${outPath}`);
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const raw = args.includes("--raw");
  const all = args.includes("--all");
  const resume = args.includes("--resume");
  const cardIdx = args.indexOf("--card");
  const cardId = cardIdx >= 0 ? args[cardIdx + 1] : null;

  if (all) {
    // Batch mode: process all cards
    console.error(`\n========== BATCH MODE: ${CARD_CONFIGS.length} cards ==========\n`);
    mkdirSync(BUZZ_DATA_DIR, { recursive: true });

    let processed = 0, skipped = 0, failed = 0;

    for (const card of CARD_CONFIGS) {
      const outPath = join(BUZZ_DATA_DIR, `${card.id}.json`);

      if (resume && existsSync(outPath)) {
        // Check if existing output has actual data (not just an error)
        try {
          const existing = JSON.parse(readFileSync(outPath, "utf-8"));
          if (existing.sentiment || existing.mentions) {
            console.error(`[skip] ${card.id} — already scraped`);
            skipped++;
            continue;
          }
        } catch { /* re-scrape if file is corrupted */ }
      }

      try {
        const result = await processCard(card, { raw });
        saveOutput(card.id, result);
        processed++;
        console.error(`[progress] ${processed + skipped}/${CARD_CONFIGS.length} (${processed} processed, ${skipped} skipped, ${failed} failed)\n`);
      } catch (e) {
        console.error(`[FAILED] ${card.id}: ${e.message}`);
        // Save error state so --resume can retry
        saveOutput(card.id, { cardId: card.id, error: e.message, scrapedAt: new Date().toISOString() });
        failed++;
      }

      // Brief pause between cards
      await sleep(1000);
    }

    console.error(`\n========== BATCH COMPLETE ==========`);
    console.error(`Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`);

  } else if (cardId) {
    // Single card by ID
    const card = CARD_CONFIGS.find(c => c.id === cardId);
    if (!card) {
      console.error(`Card not found: ${cardId}`);
      console.error(`Available IDs:\n${CARD_CONFIGS.map(c => `  ${c.id}`).join('\n')}`);
      process.exit(1);
    }

    const result = await processCard(card, { raw });
    saveOutput(card.id, result);
    console.log(JSON.stringify(result, null, 2));

  } else {
    // Legacy mode: single hardcoded card (Bæjarins Beztu)
    const card = CARD_CONFIGS.find(c => c.id === "day1-baejarins-beztu") || CARD_CONFIGS[0];
    const result = await processCard(card, { raw });
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
