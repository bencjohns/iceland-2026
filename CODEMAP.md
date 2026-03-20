# Iceland Trip Planner — Code Map

Single-file React app (`index.html`, ~4237 lines). No build system — React 18, Babel, and Tailwind loaded via CDN. Firebase Realtime Database for shared state. Leaflet for map view.

## File Structure

```
index.html              — The entire app (HTML + CSS + JS/JSX)
images/{card-id}/       — Local images for restaurants (1.jpg, 2.jpg, etc.)
distances.json          — Pre-computed OSRM driving distances for all 1,128 card pairs
scripts/
  compute-distances.mjs — One-time script: fetches real road distances from OSRM public API
  inject-distances.mjs  — Embeds distances.json into index.html as DRIVE_DISTANCES constant
todo.md                 — Feature backlog
CODEMAP.md              — This file
STATUS.md               — Project status
```

## index.html Layout (top to bottom)

### Head (lines 1–78)
- CDN scripts: React 18, ReactDOM 18, Babel Standalone, Tailwind CSS, Firebase (app + database compat), Leaflet 1.9.4 (JS + CSS)
- Google Fonts: Playfair Display (display) + DM Sans (body)
- Tailwind config: custom colors (`teal`, `terracotta`, `cream`), custom fonts
- CSS: animations (`fadeInUp`, `scaleClick`), card grid responsive breakpoints, day navigator dots, scrollbar styling, Leaflet popup overrides, itinerary stop hover styles, side panel slide transition

### Firebase Init (lines 79–95)
- `firebase.initializeApp(...)` with project config
- Exposes `window.db` (Firebase Realtime Database reference)

### Constants (lines 105–493)
| Constant | Line | Purpose |
|----------|------|---------|
| `FAMILY` | 105 | `['Murray', 'Laurel', 'Claire', 'Mati', 'Ben', 'Cade']` |
| `APP_VERSION` | 107 | Version string — bump to trigger "What's New" banner |
| `APP_UPDATE_NOTES` | 108 | Description shown in the update banner |
| `DAYS` | 110 | Array of 8 day objects (Day 1–8). Each has: `day`, `date`, `title`, `weather`, `flight?`, `distFromPrev?`, `distFromBase?`, `region` |
| `CARDS` | 129 | Array of ~48 hardcoded attraction/restaurant cards. Each has: `id`, `day`, `name`, `category`, `tier`, `description`, `costPerPerson`, `costDisplay`, `costTier`, `bookAhead`, `bookingUrl`, `driveFromPrevious`, `redditScore`, `images`, etc. |
| `CARD_COORDS` | 435 | GPS coordinates (lat/lng) for all 48 cards, used by map view and itinerary drive time calculations |
| `DRIVE_DISTANCES` | 867 | Pre-computed OSRM road distances/times for all 1,128 card pairs. Keyed as `"cardA|cardB"` (alphabetical). Values: `{km, minutes}` |
| `DAY_COLORS` | 493 | 8-color palette for day-coded map pins and itinerary badges |
| `REGION_CENTROIDS` | 495 | 7 GPS centroids (Reykjavik, Golden Circle, Snæfellsnes, South Coast, Westman Islands, Southeast/Glaciers, KEF Airport) for auto-detecting stop regions |

### Region Utilities (lines 505–535)
| Function | Purpose |
|----------|---------|
| `getRegionForCard(cardId)` | Returns nearest region name for a single card using GPS centroid matching |
| `getRegionForStops(stopIds)` | Returns region label for a set of stops; shows top 1–2 regions if split |

### Image URLs (lines 540–785)
| Section | Lines | Source |
|---------|-------|--------|
| `IMAGE_URLS` (Unsplash + Guide to Iceland) | 540–710 | Remote URLs with sizing params |
| `IMAGE_URLS` (local) | 710–785 | `images/{card-id}/{n}.jpg` for 12 restaurants without remote coverage |

### Utility Functions (lines 794–890)
| Function | Purpose |
|----------|---------|
| `hashStr(s)` | Deterministic string hash for gradient assignment |
| `getGradient(cardId, idx)` | Fallback gradient when image fails |
| `getCostTierStyle(tier)` | Returns CSS classes for free/moderate/splurge |
| `getCostTierLabel(tier)` | Returns emoji label for cost tier |
| `getTierBadge(tier)` | Returns label + classes for core/must-decide/optional |
| `getCategoryIcon(cat)` | Emoji for sightseeing/activity/restaurant |
| `formatRelativeTime(ts)` | "just now", "5m ago", "3d ago" |
| `getNetScore(cardId, votes)` | Counts up/down votes, returns `{up, down, net}` |
| `getVoters(cardId, votes)` | Returns `{upVoters, downVoters}` name arrays |
| `haversineKm(lat1, lng1, lat2, lng2)` | Straight-line distance in km between two GPS points |
| `getDriveInfo(cardIdA, cardIdB)` | Returns `{km, minutes, label}`. Uses pre-computed OSRM lookup (`DRIVE_DISTANCES`); falls back to haversine×1.4 estimate for user-submitted cards not in the table (prefixed with `~`) |

**Important:** Vote keys use `__` separator (e.g., `day1-blue-lagoon__Murray`) because Firebase keys can't contain `.` `#` `$` `[` `]`.

### Components (lines 891–3133)

| Component | Line | Purpose |
|-----------|------|---------|
| `PasswordGate` | 891 | Password screen (checks against "ingeborg", case-insensitive). Persists auth in `localStorage('icp_auth')` |
| `AnimatedModal` | 928 | Reusable animated modal wrapper — fade + scale in/out (300ms). Portals to `document.body`. Accepts `open`, `onClose`, `zIndex`, `className`. Manages mount/unmount lifecycle for smooth exit animations |
| `UserSelector` | 959 | "Who are you?" modal with 6 family member buttons |
| `HOW_IT_WORKS_SLIDES` | 983 | 6-slide tutorial data: Welcome, Browse & Filter, Vote & Comment, Build Your Trip, Explore the Map, Compare & Decide. Each has `icon`, `bg`, `title`, `body`, `target` (CSS selector for spotlight or null for centered) |
| `HowItWorksCarousel` | 1029 | Spotlight tour carousel. SVG overlay with animated cutout hole around `data-tour` target elements. Card positions near highlighted element (above/below/side) with smooth CSS transitions. Arrow keys, Escape, dot indicators, Skip link. Fade+scale enter/exit animation via `phase` state |
| `TutorialModal` | 1257 | Thin wrapper — renders `HowItWorksCarousel` starting at slide 0 |
| `Header` | 1261 | Sticky top bar: title (click returns to list view + all days), (i) info button (opens tour), card/vote stats, home base button, user switcher dropdown |
| `HeroSection` | 1305 | Trip overview: dates, travelers with vote counts, route map |
| `FilterBar` | 1354 | Tab filters (All Days, Must-Decide, Restaurants, Family Suggestions, Most Liked, Itineraries) + expandable advanced filters (Type, Cost, Booking, Hype) + List/Map toggle. Hype filter = Reddit rating minimum (5, 4+, 3+, 2+). Elements tagged with `data-tour` attributes for spotlight tour |
| `DayNavigator` | 1459 | Fixed right-side dots (Day 1–8) with "DAY" label header, click to scroll, highlights active day. Hidden on mobile (<900px) |
| `MapView` | 1479 | Full-screen Leaflet map with color-coded pins, compact popups (including Reddit rating), day filter legend with route indicators. Route visualization: fetches OSRM driving directions per day, draws road-following polylines, caches responses. Planned stops show numbered markers at 34px; unplanned stops fade to gray 22px/0.45 opacity. "Show Route"/"Hide Route" toggle (bottom-left). Receives `activeDraft`, `showRoute`, `onToggleRoute`, `onAddToTrip` |
| `DayHeaderContent` | 1606 | Shared markup for day headers (title at text-lg, distances, weather, flight). Used by both DayHeader and FloatingDayBar |
| `DayHeader` | 1636 | In-page day section header with scroll anchor |
| `FloatingDayBar` | 1645 | Fixed-position compact day bar via portal to `document.body`, z-index 45, opacity-based fade transition. Title font matches card titles (text-lg) |
| `ImageCarousel` | 1658 | Photo carousel with full left/right half click zones + arrow key support |
| `StarRating` | 1735 | Reddit hype score (1–5 stars) with tooltip explaining the scale (5 = bucket-list legendary, 1 = niche/skippable) |
| `VoteButtons` | 1719 | Upvote/downvote buttons with voter name lists. Tagged `data-tour="vote-buttons"` |
| `CommentSection` | 1775 | Expandable comments with threaded replies. Tagged `data-tour="comments"` |
| `CardComponent` | 1873 | Full card: image carousel, cost badge, tier, description, details, Google/Reddit links, votes, comments. + "Add to Trip" button (top-right) with day picker dropdown. Tagged `data-tour="add-to-trip"` |
| `SuggestionModal` | 2009 | Form to submit new activity/restaurant suggestion via `AnimatedModal`. Accepts `open` prop for animated lifecycle. Link field accepts bare domains (auto-prepends `https://`) |
| `LeaderboardView` | 2111 | "Most Liked" — ranked cards by net vote score with thumbnail images, descriptions, and estimated cost |
| `DraftCompareView` | 2207 | Side-by-side comparison of all drafts with 1+ stops. Horizontal scrolling grid (one column per draft, rows by day). Consensus highlighting for stops in 2+ drafts. Inline expand/collapse with horizontal card layout (image left, details right). Expand All / Collapse All. Uses composite keys (`draftId__cardId`) for independent expand per column |
| `ItineraryView` | 2483 | Two sub-tabs: **"Compare"** (default, renders DraftCompareView) and **"Browse Trips"** (family grid → person's drafts → expandable day-by-day view). Default subTab is `'compare'` |
| `ItinerarySidePanel` | 3086 | Slide-out right panel (380px, z-1003) via portal. Pre-seeded 8 trip days with dates/regions in headers (e.g., "Day 3 · Sep 7 📍 Snæfellsnes"). Draft switcher pills (hidden with 1 draft, shown with 2+), inline title rename, liked-but-unplanned cards grouped by region. Each stop in bordered card with mouse-based drag-and-drop: positions snapshotted at drag start for stable hit-testing, siblings displaced via `translateY` transforms with 200ms ease transitions (dnd-kit displacement model), absolutely-positioned teal indicator line, cross-day support, 5px movement threshold to distinguish clicks from drags, `didDrag` ref flag prevents click-on-release from opening card detail. Arrow buttons as desktop fallback. Card picker via `AnimatedModal` with Type/Cost/Booking/Hype filters. Expanded card modal via `AnimatedModal`. Reads/writes to active draft in `/trip-drafts/` |

### App Component (lines 3702–4233)

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
| `tripDrafts` | Firebase `/trip-drafts` | Yes (real-time) |
| `sidePanelOpen` | React state only | No |
| `showRoute` | React state only (auto-enabled when side panel opens) | No |
| `panelDayCount` | React state (derived from active draft) | No |
| `authenticated` | localStorage `icp_auth` | No (per-browser) |
| `hasUpdate` | localStorage `icp_version` vs `APP_VERSION` | No (per-browser) |
| `activeFilter` | React state only | No |
| `advancedFilters` | React state only (`{category, cost, booking, rating}`) | No |
| `viewMode` | React state only (`'list'` or `'map'`) | No |
| `activeDay` | React state only (scroll-tracked) | No |
| `showFloatingDay` | React state only (scroll-tracked) | No |
| `stickyHeight` | React state (ResizeObserver + scroll handler) | No |
| `showSuggestionModal` | React state only | No |
| `showHomeBaseModal` | React state only | No |

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
| `handleSetDraftDay` | Writes stops to `db.ref('trip-drafts/{user}/{draftId}/days/{dayNum}/stops')` |
| `handleUpdateDraftDayCount` | Writes dayCount to active draft in Firebase |
| `handleCreateDraft` | Creates new draft (max 5) at `db.ref('trip-drafts/{user}/{newKey}')`, sets as active |
| `handleDeleteDraft` | Removes draft, reassigns active if needed |
| `handleRenameDraft` | Updates draft title |
| `handleSetActiveDraft` | Sets `db.ref('trip-drafts/{user}/activeDraftId')` |
| `handleAddToTrip` | Adds card to active draft's target day, opens side panel |

**Derived values:**
| Value | Purpose |
|-------|---------|
| `getActiveDraftId()` | Returns current user's active draft ID from tripDrafts |
| `getActiveDraft()` | Returns the active draft object |
| `getUserDrafts()` | Returns all drafts (excluding activeDraftId key) for current user |
| `activeDraftDayCount` | Memoized day count from active draft (passed to CardComponent) |

**Render flow:**
1. Loading spinner → PasswordGate → UserSelector → (TutorialModal spotlight tour) → Main app
2. Main app: sticky Header (with info button) + FilterBar → then one of:
   - **Itineraries tab:** ItineraryView (sub-tabs: Compare (default) | Trip Drafts browser | Day-by-Day planner)
   - **Most Liked tab:** LeaderboardView
   - **Map mode:** MapView (full-screen map with pins)
   - **List mode:** HeroSection → FloatingDayBar → DayNavigator → Day sections (DayHeader + CardGrid)
3. Floating buttons (z-1001): "My Trip" (opens ItinerarySidePanel) + "Add a Suggestion"
4. ItinerarySidePanel (portal to body, z-1003) — always available from any page, edits active draft
5. All modals use `AnimatedModal` for fade+scale enter/exit transitions
6. Auto-creates first draft on initial load via `ensureActiveDraft` useEffect

### data-tour Attributes (Spotlight Tour Targets)
| Attribute | Element | Tour Step |
|-----------|---------|-----------|
| `data-tour="filter-bar"` | Filter bar wrapper div | Browse & Filter |
| `data-tour="compare-tabs"` | Most Liked / Itineraries buttons | Compare & Decide |
| `data-tour="view-toggle"` | List/Map toggle wrapper | Explore the Map |
| `data-tour="vote-buttons"` | Upvote/downvote button pair | Vote & Comment |
| `data-tour="comments"` | Comment section wrapper | Vote & Comment (fallback) |
| `data-tour="add-to-trip"` | + button wrapper on cards | Build Your Trip |
| `data-tour="my-trip-btn"` | Floating My Trip button | Build Your Trip (fallback) |
| `data-tour="add-suggestion-btn"` | Floating Add Suggestion button | (not in current 6-step tour) |

### Render Entry Point (lines 4130–4134)
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
/trip-drafts/{name}/{draftId}/title: "Draft 1"
/trip-drafts/{name}/{draftId}/days/{dayNum}/stops: ["cardId1", ...]
/trip-drafts/{name}/{draftId}/dayCount: 3
/trip-drafts/{name}/{draftId}/createdAt: "2026-03-19T..."
/trip-drafts/{name}/{draftId}/updatedAt: "2026-03-19T..."
/trip-drafts/{name}/activeDraftId: "draftKey123"
```

## Deployment

- **Hosted on:** GitHub Pages (https://bencjohns.github.io/iceland-2026/)
- **Repo:** https://github.com/bencjohns/iceland-2026
- **Deploy:** `git push` to master → GitHub Pages auto-deploys
- **Update notification:** Bump `APP_VERSION` and edit `APP_UPDATE_NOTES` at line 107–108
