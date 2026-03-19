# Iceland Trip Planner — Code Map

Single-file React app (`index.html`, ~1960 lines). No build system — React 18, Babel, and Tailwind loaded via CDN. Firebase Realtime Database for shared state.

## File Structure

```
index.html          — The entire app (HTML + CSS + JS/JSX)
images/{card-id}/   — Local images for restaurants (1.jpg, 2.jpg, etc.)
todo.md             — Feature backlog
CODEMAP.md          — This file
STATUS.md           — Project status
```

## index.html Layout (top to bottom)

### Head (lines 1–60)
- CDN scripts: React 18, ReactDOM 18, Babel Standalone, Tailwind CSS, Firebase (app + database compat)
- Google Fonts: Playfair Display (display) + DM Sans (body)
- Tailwind config: custom colors (`teal`, `terracotta`, `cream`), custom fonts
- CSS: animations (`fadeInUp`, `scaleClick`), card grid responsive breakpoints, day navigator dots, scrollbar styling

### Firebase Init (lines 64–72)
- `firebase.initializeApp(...)` with project config
- Exposes `window.db` (Firebase Realtime Database reference)

### Constants (lines 85–112)
| Constant | Line | Purpose |
|----------|------|---------|
| `FAMILY` | 89 | `['Murray', 'Laurel', 'Claire', 'Mati', 'Ben', 'Cade']` |
| `APP_VERSION` | 91 | Version string — bump to trigger "What's New" banner |
| `APP_UPDATE_NOTES` | 92 | Description shown in the update banner |
| `DAYS` | 94 | Array of 9 day objects (Day 1–8 + departure). Each has: `day`, `date`, `title`, `weather`, `flight?`, `distFromPrev?`, `distFromBase?`, `region` |
| `CARDS` | 113 | Array of ~48 hardcoded attraction/restaurant cards. Each has: `id`, `day`, `name`, `category`, `tier`, `description`, `costPerPerson`, `costDisplay`, `costTier`, `bookAhead`, `bookingUrl`, `driveFromPrevious`, `redditScore`, `images`, etc. |

### Image URLs (lines 423–668)
| Section | Lines | Source |
|---------|-------|--------|
| `IMAGE_URLS` (Unsplash) | 423–593 | Remote URLs with `?w=600&h=375&fit=crop&q=75&auto=format` |
| `IMAGE_URLS` (local) | 594–668 | `images/{card-id}/{n}.jpg` for 12 restaurants without Unsplash coverage |

### Utility Functions (lines 669–751)
| Function | Purpose |
|----------|---------|
| `hashStr(s)` | Deterministic string hash for gradient assignment |
| `getGradient(cardId, idx)` | Fallback gradient when image fails |
| `getCostTierStyle(tier)` | Returns CSS classes for free/moderate/splurge |
| `getTierBadge(tier)` | Returns label + classes for core/must-decide/optional |
| `getCategoryIcon(cat)` | Emoji for sightseeing/activity/restaurant |
| `formatRelativeTime(ts)` | "just now", "5m ago", "3d ago" |
| `getNetScore(cardId, votes)` | Counts up/down votes, returns `{up, down, net}` |
| `getVoters(cardId, votes)` | Returns `{upVoters, downVoters}` name arrays |

**Important:** Vote keys use `__` separator (e.g., `day1-blue-lagoon__Murray`) because Firebase keys can't contain `.` `#` `$` `[` `]`.

### Components (lines 753–1620)

| Component | Line | Purpose |
|-----------|------|---------|
| `PasswordGate` | 753 | Password screen (checks against "ingeborg", case-insensitive). Persists auth in `localStorage('icp_auth')` |
| `UserSelector` | 789 | "Who are you?" modal with 6 family member buttons |
| `TutorialModal` | 810 | Onboarding explainer (vote, comment, suggest, leaderboard) |
| `Header` | 858 | Sticky top bar: title, stats, home base button, user switcher |
| `HeroSection` | 895 | Trip overview: dates, travelers, vote counts, route map |
| `FilterBar` | 944 | Tab filters (All Days, Must-Decide, Restaurants, Suggestions, Leaderboard) + expandable advanced filters (Type, Cost, Booking) |
| `DayNavigator` | 1035 | Fixed right-side dots (Day 1–9), click to scroll, highlights active day. Hidden on mobile (<900px) |
| `DayHeaderContent` | 1054 | Shared markup for day headers (title, distances, weather, flight) |
| `DayHeader` | 1084 | In-page day section header with scroll anchor |
| `FloatingDayBar` | 1093 | Fixed-position compact day bar that appears when scrolling past a day header |
| `ImageCarousel` | 1105 | Photo carousel with full left/right half click zones + arrow key support |
| `StarRating` | 1154 | Reddit score (1–5 stars) |
| `VoteButtons` | 1166 | Upvote/downvote buttons with voter name lists |
| `CommentSection` | 1222 | Expandable comments with threaded replies |
| `CardComponent` | 1320 | Full card: image carousel, cost badge, tier, description, details, Google/Reddit links, votes, comments |
| `SuggestionModal` | 1433 | Form to submit new activity/restaurant suggestion |
| `LeaderboardView` | 1535 | Ranked cards by net vote score with estimated cost |

### App Component (lines 1621–1955)

**State:**
| State | Storage | Shared? |
|-------|---------|---------|
| `currentUser` | localStorage `icp_currentUser` | No (per-browser) |
| `votes` | Firebase `/votes` | Yes (real-time) |
| `comments` | Firebase `/comments` | Yes (real-time) |
| `suggestions` | Firebase `/suggestions` | Yes (real-time) |
| `homeBase` | Firebase `/homeBase` | Yes (real-time) |
| `authenticated` | localStorage `icp_auth` | No (per-browser) |
| `hasUpdate` | localStorage `icp_version` vs `APP_VERSION` | No (per-browser) |
| `activeFilter` | React state only | No |
| `advancedFilters` | React state only | No |
| `activeDay` | React state only (scroll-tracked) | No |
| `showFloatingDay` | React state only (scroll-tracked) | No |
| `stickyHeight` | React state (ResizeObserver) | No |

**Key handlers:**
| Handler | What it does |
|---------|-------------|
| `handleSelectUser` | Sets current user in localStorage, shows tutorial on first visit |
| `handleVote` | Writes/deletes vote at `db.ref('votes/{cardId}__{voter}')` |
| `handleAddComment` | Appends comment or replaces array (for replies) at `db.ref('comments/{cardId}')` |
| `handleAddSuggestion` | Appends to `db.ref('suggestions')` |
| `handleDeleteSuggestion` | Filters out and rewrites `db.ref('suggestions')` |
| `handleSetHomeBase` | Writes to `db.ref('homeBase')` |

**Render flow:**
1. Loading spinner → PasswordGate → UserSelector → (TutorialModal) → Main app
2. Main app: sticky Header + FilterBar → HeroSection → FloatingDayBar → DayNavigator → Day sections (DayHeader + CardGrid) → Floating buttons

### Render Entry Point (lines 1956–1964)
```js
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

## Firebase Database Structure

```
/votes/{cardId}__{voterName}: "up" | "down"
/comments/{cardId}: [{author, text, timestamp, replies: [{author, text, timestamp}]}]
/suggestions: [{id, day, name, category, description, submittedBy, timestamp, ...}]
/homeBase: "Reykjavik"
```

## Deployment

- **Hosted on:** GitHub Pages (https://bencjohns.github.io/iceland-2026/)
- **Repo:** https://github.com/bencjohns/iceland-2026
- **Deploy:** `git push` to master → GitHub Pages auto-deploys
- **Update notification:** Bump `APP_VERSION` and edit `APP_UPDATE_NOTES` at line 91–92
