# Reddit Scraping Optimization for Iceland Sentiment Analysis

**48 destinations · Node.js (ESM) · One-time scrape · Target: under 5 minutes**

---

## Current Pipeline & Bottleneck

- 11 requests per card (1 search + 10 comment pages) × 48 cards = **~528 requests**
- 2-second delay between requests → **20-25 minutes total**
- Using unauthenticated `.json` endpoint append trick

---

## 1. Reddit Unauthenticated Rate Limits (Corrected)

The official unauthenticated limit is **10 requests per minute**, IP-based. Some sources report the **search endpoint is stricter** — as low as **3-5 QPM** for `search.json` queries specifically. This is enforced via a rolling window, not a strict per-minute reset, meaning bursts can trigger throttling even if your average looks fine.

**What this means for your pipeline:** At 10 QPM for comment fetches and ~4 QPM for search, your 528 requests would take roughly ~55 minutes if you were strictly at the floor. Your current 2s delay (~30 QPM effective) works because Reddit's enforcement is somewhat loose for non-search endpoints, but you're likely getting silently throttled or receiving degraded results on some requests.

**Safe floor:** ~6s between search requests, ~3s between comment-fetch requests. Dropping below this risks 429s or silent empty responses. This alone won't get you to 5 minutes — you need to change the approach, not just the timing.

## 2. Reddit OAuth — No Longer Self-Service (Critical Update)

**As of November 2025, Reddit killed self-service API key creation.** You can no longer go to `reddit.com/prefs/apps` and instantly create an OAuth app. Reddit introduced the **Responsible Builder Policy** which requires:

1. Reading and agreeing to the policy at `support.reddithelp.com/hc/en-us/articles/42728983564564`
2. Submitting an application through Reddit's **Developer Support form** describing your use case, target subreddits, and expected request volume
3. Waiting for **manual review** — Reddit targets 7-day response for most apps, but commercial use can take weeks and may be denied

**If you already have OAuth credentials from before November 2025**, they still work. Check if you have any old Reddit apps registered.

**If approved**, OAuth gives you **60-100 QPM** (sources conflict — Reddit's wiki says 100 QPM per client ID, some guides say 60 QPM; the difference may be endpoint-dependent). Either way, it's a **6-10x improvement** over unauthenticated, with explicit `X-Ratelimit-Remaining` headers.

**Bottom line:** OAuth is no longer a "15-minute setup." It's a multi-day approval process with uncertain outcome. Not viable as a quick fix unless you already have credentials.

## 3. Archive APIs — What's Actually Working (March 2026)

### Arctic Shift ✅ (Best option for posts)

- **Status:** Active, operational
- **Base URL:** `https://arctic-shift.photon-reddit.com`
- **Status page:** `https://status.arctic-shift.photon-reddit.com`
- **Data freshness:** ~36 hours lag from Reddit
- **Rate limit:** Generous — "a couple requests per second" is fine. Check `X-RateLimit-Remaining` header.

**Key endpoints for this project:**

```
# Search posts by keyword (up to 100 results)
/api/posts/search?q=Seljalandsfoss&limit=100

# Get comments for a specific post by link_id
/api/comments/search?link_id=POST_ID&limit=100

# Bulk fetch posts by ID (up to 500 at once!)
/api/posts/ids?ids=id1,id2,id3
```

**Critical limitation:** Arctic Shift's full-text search on comments **only works when scoped to a specific subreddit or user** — it cannot do Reddit-wide comment keyword search. So you can't just search "Seljalandsfoss" across all comments globally. You *can* search post titles/selftext globally, and you *can* fetch all comments for a known post ID.

**Practical implication:** Use Arctic Shift for post discovery (global keyword search on titles) and for fetching comments on those discovered posts (by `link_id`). This replaces both your Reddit search and your per-post comment fetching.

### PullPush ✅ (Best option for Reddit-wide comment search)

- **Status:** Back online as of October 25, 2025
- **Base URL:** `https://api.pullpush.io`
- **Data cutoff:** Only has data **up to May 20, 2025**. No newer data.
- **Rate limits:** Soft limit at **15 req/min**, hard limit at **30 req/min**, long-term hard limit of **1000 req/hr**

**Key endpoints:**

```
# Reddit-wide comment search by keyword
/reddit/search/comment/?q=Seljalandsfoss&size=100

# Reddit-wide submission search
/reddit/search/submission/?q=Seljalandsfoss&size=100

# Get comment IDs for a submission
/reddit/submission/{submission_id}/comments/
```

**Key advantage over Arctic Shift:** PullPush can do **Reddit-wide full-text search on comments** — exactly what you need for finding mentions of destination names in comments across all subreddits without knowing the post IDs first.

**Key disadvantage:** Data only goes up to May 2025. If you need mentions from the last ~10 months, PullPush won't have them.

### Pushshift ❌ (Dead for public use)

Only available to Reddit-approved moderators. Not an option.

## 4. Parallelization Strategy

**Same-server parallelization: Risky, minimal gain.** Reddit rate-limits per IP, so 4 concurrent scrapers from one machine burn through the same 10 QPM budget faster without increasing throughput.

**Cross-server parallelization: This is the move.** Reddit, Arctic Shift, and PullPush are independent services with independent rate limit pools. Hit all three concurrently:

| Server | Role | Rate Budget | Concurrent? |
|--------|------|-------------|-------------|
| Arctic Shift | Post search + comment fetch by post ID | ~2-3 req/sec | ✅ |
| PullPush | Reddit-wide comment keyword search | ~15 req/min | ✅ |
| Reddit `.json` | Fresh posts (last 10 months) | ~10 req/min | ✅ |

All three can run simultaneously from the same machine since they're different domains/IPs with separate rate limit enforcement.

## 5. Other Approaches Considered

| Approach | Viability | Notes |
|----------|-----------|-------|
| Google Custom Search API (`site:reddit.com`) | Marginal | 100 queries/day free, $5/1000 after. Not enough for 48 destinations + comments. |
| Redlib instances (privacy frontends) | Works but fragile | Can append `.json` to Redlib URLs. No auth needed. But instances go down frequently and have their own rate limits. |
| Reddit gateway API (`gateway.reddit.com`) | Undocumented | Hidden internal API, could break at any time. Not recommended for a one-time scrape. |
| Reddit GraphQL (`gql.reddit.com`) | Undocumented | Same risks as gateway API. |
| Academic torrents (full Reddit dumps) | Overkill | Multi-TB downloads. Not practical for 48 keyword searches. |

---

## Ranked Recommendations (Effort → Speedup)

### Tier 1: Arctic Shift for Everything (1-2 hours, gets you to ~2-3 min)

**This is the single biggest win.** Replace your entire Reddit scraping pipeline with Arctic Shift:

1. **Post search** — 48 requests to `/api/posts/search?q="Place Name"&limit=50` at ~2 req/sec = **~24 seconds**
2. **Comment fetch** — For each discovered post, fetch comments via `/api/comments/search?link_id=POST_ID&limit=100`. If you get ~10 posts per destination, that's ~480 requests at ~2 req/sec = **~4 minutes**
3. **Optimization** — Use the bulk `/api/posts/ids` endpoint (up to 500 IDs per request) to batch-fetch post metadata

Total: **~4-5 minutes** with a single-threaded approach, under 3 minutes if you pipeline search and comment fetching.

**Caveat:** Arctic Shift has ~36-hour lag, so very recent posts won't appear. For static travel destinations, this is irrelevant.

### Tier 2: Add PullPush for Comment Discovery (+ 30 min, gets you to ~2 min)

Run PullPush concurrently with Arctic Shift to catch comment mentions that Arctic Shift can't find (since AS can't do Reddit-wide comment FTS):

1. **PullPush comment search** — 48 requests to `/reddit/search/comment/?q="Place Name"&size=100` at ~15 req/min = **~3.5 minutes**
2. **Run concurrently** with Arctic Shift post search (different servers, different rate limits)

Net wall-clock time: **~3.5 minutes** (bottleneck is PullPush's rate limit).

**Caveat:** PullPush data cuts off at May 2025. You'll miss ~10 months of comments. For travel sentiment on established destinations, the pre-May-2025 data is probably 90%+ of what you need.

### Tier 3: Supplement with Reddit `.json` for Fresh Data (+ 30 min, fills the gap)

If you need mentions from June 2025 – present that neither archive has:

1. Use Reddit's `search.json` for recent posts only: 48 requests at ~4 QPM = **~12 minutes** (can run concurrently with Tier 1+2)
2. Fetch comments for new-only posts via Reddit `.json` — scope this to just the posts not found in archives

This runs in parallel with the archive APIs, so it doesn't add wall-clock time unless it's the bottleneck (which it will be at ~12 min). Consider whether you actually need the last 10 months of data.

### Tier 4: Batch Claude API Calls (30 min refactor, saves cost + time)

Not a scraping optimization, but critical for end-to-end pipeline speed:

- Instead of 1 Claude call per mention, batch **5-10 destinations per prompt** with structured JSON output
- Use system prompt to define sentiment categories, then send all mentions for a batch of cards
- This can cut your Claude API time from minutes to seconds and reduce token costs by avoiding repeated system prompt overhead

### Tier 5: Reddit OAuth (Unknown timeline, 6-10x Reddit throughput)

Only worth pursuing if:
- You already have pre-November-2025 credentials (check `reddit.com/prefs/apps`)
- You need substantial fresh data that archives don't have
- You're willing to wait days/weeks for approval

The throughput gain (60-100 QPM vs 10 QPM) is real but only matters for the Reddit-direct portion of your pipeline, which should be a small supplement if you're using archives for the bulk of the work.

---

## Optimal Pipeline Architecture

```
┌─────────────────────────────────────────────────┐
│             CONCURRENT EXECUTION                │
│                                                 │
│  ┌───────────────────┐  ┌───────────────────┐  │
│  │  Arctic Shift      │  │  PullPush         │  │
│  │  Post search       │  │  Comment search   │  │
│  │  + comments by ID  │  │  (Reddit-wide)    │  │
│  │  ~2-3 req/sec      │  │  ~15 req/min      │  │
│  │  ~2-3 min          │  │  ~3.5 min         │  │
│  └─────────┬──────────┘  └─────────┬─────────┘  │
│            │                       │             │
│  ┌─────────┴───────────────────────┴──────────┐  │
│  │        Deduplicate + Merge Results         │  │
│  └──────────────────┬─────────────────────────┘  │
│                     │                            │
│  ┌──────────────────┴─────────────────────────┐  │
│  │      Batched Claude Classification         │  │
│  │      (5-10 destinations per call)          │  │
│  └────────────────────────────────────────────┘  │
│                                                 │
│  Optional: Reddit .json for Jun 2025+ data      │
│  (runs concurrently, fills archive gap)         │
└─────────────────────────────────────────────────┘

Total wall-clock: ~3.5-4 minutes (PullPush is the bottleneck)
```

---

## Quick Reference: API Endpoints

### Arctic Shift
```
Base: https://arctic-shift.photon-reddit.com

GET /api/posts/search?q=KEYWORD&limit=100&subreddit=OPTIONAL
GET /api/comments/search?link_id=POST_ID&limit=100
GET /api/posts/ids?ids=id1,id2,...  (up to 500)
GET /api/comments/ids?ids=id1,id2,...  (up to 500)
```

### PullPush
```
Base: https://api.pullpush.io

GET /reddit/search/comment/?q=KEYWORD&size=100&subreddit=OPTIONAL
GET /reddit/search/submission/?q=KEYWORD&size=100
GET /reddit/submission/{id}/comments/
```

### Reddit Unauthenticated
```
GET https://www.reddit.com/search.json?q=KEYWORD&limit=25
GET https://www.reddit.com/{permalink}.json?sort=top&limit=100

Headers required:
  User-Agent: YourApp/1.0 (by /u/YourUsername)
```

---

## Key Gotchas

- PullPush data cuts off at **May 20, 2025** — no newer content
- Arctic Shift has **~36-hour lag** from real-time Reddit
- Arctic Shift comment FTS **requires subreddit or user scope** — no Reddit-wide comment search
- Reddit `.json` is real-time but rate-limited to ~10 QPM (search may be 3-5 QPM)
- Reddit OAuth self-service **ended November 2025** — new apps require manual approval via Responsible Builder Policy
- Reddit enforces a **1,000-post pagination ceiling** on listing endpoints — you can't paginate past ~1000 results
- Always set a proper `User-Agent` header on Reddit requests — requests without one get more aggressively throttled
- Reddit's rate limiting is based on **rolling windows**, not strict per-minute resets — steady pacing beats bursts

*Last updated: March 2026*
