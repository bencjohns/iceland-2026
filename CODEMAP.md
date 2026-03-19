# Iceland Trip Planner — Code Map

Single-file React app (`index.html`, ~2550 lines). No build system — React 18, Babel, and Tailwind loaded via CDN. Firebase Realtime Database for shared state. Leaflet for map view.

## File Structure

```
index.html          — The entire app (HTML + CSS + JS/JSX)
images/{card-id}/   — Local images for restaurants (1.jpg, 2.jpg, etc.)
todo.md             — Feature backlog
CODEMAP.md          — This file
STATUS.md           — Project status
```

## index.html Layout (top to bottom)

### Head (lines 1–72)
- CDN scripts: React 18, ReactDOM 18, Babel Standalone, Tailwind CSS, Firebase (app + database compat), Leaflet 1.9.4 (JS + CSS)
- Google Fonts: Playfair Display (display) + DM Sans (body)
- Tailwind config: custom colors (`teal`, `terracotta`, `cream`), custom fonts
- CSS: animations (`fadeInUp`, `scaleClick`), card grid responsive breakpoints, day navigator dots, scrollbar styling, Leaflet popup overrides, itinerary stop hover styles

### Firebase Init (lines 73–82)
- `firebase.initializeApp(...)` with project config
- Exposes `window.db` (Firebase Realtime Database reference)

### Constants (lines 85–488)
| Constant | Line | Purpose |
|----------|------|---------|
| `FAMILY` | 89 | `['Murray', 'Laurel', 'Claire', 'Mati', 'Ben', 'Cade']` |
| `APP_VERSION` | 91 | Version string — bump to trigger "What's New" banner |
| `APP_UPDATE_NOTES` | 92 | Description shown in the update banner |
| `DAYS` | 94 | Array of 8 day objects (Day 1–8). Each has: `day`, `date`, `title`, `weather`, `flight?`, `distFromPrev?`, `distFromBase?`, `region` |
| `CARDS` | 113 | Array of ~48 hardcoded attraction/restaurant cards. Each has: `id`, `day`, `name`, `category`, `tier`, `description`, `costPerPerson`, `costDisplay`, `costTier`, `bookAhead`, `bookingUrl`, `driveFromPrevious`, `redditScore`, `images`, etc. |
| `CARD_COORDS` | 429 | GPS coordinates (lat/lng) for all 48 cards, used by map view and itinerary drive time calculations |
| `DAY_COLORS` | 487 | 8-color palette for day-coded map pins and itinerary badges |

### Image URLs (lines 493–738)
| Section | Lines | Source |
|---------|-------|--------|
| `IMAGE_URLS` (Unsplash + Guide to Iceland) | 493–663 | Remote URLs with sizing params |
| `IMAGE_URLS` (local) | 664–738 | `images/{card-id}/{n}.jpg` for 12 restaurants without remote coverage |

### Utility Functions (lines 739–838)
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
| `haversineKm(lat1, lng1, lat2, lng2)` | Straight-line distance in km between two GPS points |
| `getDriveInfo(cardIdA, cardIdB)` | Estimated road distance (×1.4 factor) and drive time (÷70 km/h) between two cards |

**Important:** Vote keys use `__` separator (e.g., `day1-blue-lagoon__Murray`) because Firebase keys can't contain `.` `#` `$` `[` `]`.

### Components (lines 844–2162)

| Component | Line | Purpose |
|-----------|------|---------|
| `PasswordGate` | 844 | Password screen (checks against "ingeborg", case-insensitive). Persists auth in `localStorage('icp_auth')` |
| `UserSelector` | 880 | "Who are you?" modal with 6 family member buttons |
| `TutorialModal` | 901 | Onboarding explainer (vote, comment, suggest, leaderboard) |
| `Header` | 949 | Sticky top bar: title, stats, home base button, user switcher |
| `HeroSection` | 986 | Trip overview: dates, travelers with vote counts, route map |
| `FilterBar` | 1035 | Tab filters (All Days, Must-Decide, Restaurants, Suggestions, Leaderboard, Itineraries) + expandable advanced filters (Type, Cost, Booking) + List/Map toggle |
| `DayNavigator` | 1139 | Fixed right-side dots (Day 1–8), click to scroll, highlights active day. Hidden on mobile (<900px) |
| `MapView` | 1158 | Full-screen Leaflet map with color-coded pins, compact popups, day filter legend, expanded card modal via portal |
| `DayHeaderContent` | 1288 | Shared markup for day headers (title, distances, weather, flight) |
| `DayHeader` | 1318 | In-page day section header with scroll anchor |
| `FloatingDayBar` | 1327 | Fixed-position compact day bar via portal to `document.body`, z-index 45, opacity-based fade transition |
| `ImageCarousel` | 1340 | Photo carousel with full left/right half click zones + arrow key support |
| `StarRating` | 1389 | Reddit score (1–5 stars) |
| `VoteButtons` | 1401 | Upvote/downvote buttons with voter name lists |
| `CommentSection` | 1457 | Expandable comments with threaded replies |
| `CardComponent` | 1555 | Full card: image carousel, cost badge, tier, description, details, Google/Reddit links, votes, comments |
| `SuggestionModal` | 1668 | Form to submit new activity/restaurant suggestion |
| `LeaderboardView` | 1770 | Ranked cards by net vote score with thumbnail images, descriptions, and estimated cost |
| `ItineraryView` | 1862 | Personal itinerary builder: family selector → day-by-day planner with card picker, reorder controls, drive time connectors, day summaries, and comment system |

### App Component (lines 2164–2540)

**State:**
| State | Storage | Shared? |
|-------|---------|---------|
| `currentUser` | localStorage `icp_currentUser` | No (per-browser) |
| `votes` | Firebase `/votes` | Yes (real-time) |
| `comments` | Firebase `/comments` | Yes (real-time) |
| `suggestions` | Firebase `/suggestions` | Yes (real-time) |
| `homeBase` | Firebase `/homeBase` | Yes (real-time) |
| `itineraries` | Firebase `/itineraries` | Yes (real-time) |
| `itineraryComments` | Firebase `/itinerary-comments` | Yes (real-time) |
| `authenticated` | localStorage `icp_auth` | No (per-browser) |
| `hasUpdate` | localStorage `icp_version` vs `APP_VERSION` | No (per-browser) |
| `activeFilter` | React state only | No |
| `advancedFilters` | React state only | No |
| `viewMode` | React state only (`'list'` or `'map'`) | No |
| `activeDay` | React state only (scroll-tracked) | No |
| `showFloatingDay` | React state only (scroll-tracked) | No |
| `stickyHeight` | React state (ResizeObserver + scroll handler) | No |

**Key handlers:**
| Handler | What it does |
|---------|-------------|
| `handleSelectUser` | Sets current user in localStorage, shows tutorial on first visit |
| `handleVote` | Writes/deletes vote at `db.ref('votes/{cardId}__{voter}')` |
| `handleAddComment` | Appends comment or replaces array (for replies) at `db.ref('comments/{cardId}')` |
| `handleAddSuggestion` | Appends to `db.ref('suggestions')` |
| `handleDeleteSuggestion` | Filters out and rewrites `db.ref('suggestions')` |
| `handleSetHomeBase` | Writes to `db.ref('homeBase')` |
| `handleSetItineraryDay` | Writes ordered card IDs to `db.ref('itineraries/{name}/days/{dayNum}/stops')` + updates timestamp |
| `handleAddItineraryComment` | Appends comment to `db.ref('itinerary-comments/{name}')` |

**Render flow:**
1. Loading spinner → PasswordGate → UserSelector → (TutorialModal) → Main app
2. Main app: sticky Header + FilterBar → then one of:
   - **Itineraries tab:** ItineraryView (family selector → day-by-day planner)
   - **Leaderboard tab:** LeaderboardView
   - **Map mode:** MapView (full-screen map with pins)
   - **List mode:** HeroSection → FloatingDayBar → DayNavigator → Day sections (DayHeader + CardGrid)

### Render Entry Point (lines 2542–2546)
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
/itineraries/{name}/days/{dayNum}/stops: ["cardId1", "cardId2", ...]
/itineraries/{name}/updatedAt: "2026-03-19T..."
/itinerary-comments/{name}: [{author, text, timestamp}]
```

## Deployment

- **Hosted on:** GitHub Pages (https://bencjohns.github.io/iceland-2026/)
- **Repo:** https://github.com/bencjohns/iceland-2026
- **Deploy:** `git push` to master → GitHub Pages auto-deploys
- **Update notification:** Bump `APP_VERSION` and edit `APP_UPDATE_NOTES` at line 91–92
