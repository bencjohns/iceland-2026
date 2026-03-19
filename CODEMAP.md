# Iceland Trip Planner — Code Map

Single-file React app (`index.html`, ~3580 lines). No build system — React 18, Babel, and Tailwind loaded via CDN. Firebase Realtime Database for shared state. Leaflet for map view.

## File Structure

```
index.html          — The entire app (HTML + CSS + JS/JSX)
images/{card-id}/   — Local images for restaurants (1.jpg, 2.jpg, etc.)
todo.md             — Feature backlog
CODEMAP.md          — This file
STATUS.md           — Project status
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
| `getDriveInfo(cardIdA, cardIdB)` | Estimated road distance (×1.4 factor) and drive time (÷70 km/h) between two cards |

**Important:** Vote keys use `__` separator (e.g., `day1-blue-lagoon__Murray`) because Firebase keys can't contain `.` `#` `$` `[` `]`.

### Components (lines 891–2570)

| Component | Line | Purpose |
|-----------|------|---------|
| `PasswordGate` | 891 | Password screen (checks against "ingeborg", case-insensitive). Persists auth in `localStorage('icp_auth')` |
| `UserSelector` | 927 | "Who are you?" modal with 6 family member buttons |
| `TutorialModal` | 948 | Onboarding explainer (vote, comment, suggest, leaderboard) |
| `Header` | 996 | Sticky top bar: title, stats, home base button, user switcher |
| `HeroSection` | 1033 | Trip overview: dates, travelers with vote counts, route map |
| `FilterBar` | 1082 | Tab filters (All Days, Must-Decide, Restaurants, Suggestions, Leaderboard, Itineraries) + expandable advanced filters (Type, Cost, Booking) + List/Map toggle |
| `DayNavigator` | 1186 | Fixed right-side dots (Day 1–8), click to scroll, highlights active day. Hidden on mobile (<900px) |
| `MapView` | 1205 | Full-screen Leaflet map with color-coded pins, compact popups, day filter legend, expanded card modal via portal. Receives `onAddToTrip` for 📋 buttons |
| `DayHeaderContent` | 1336 | Shared markup for day headers (title, distances, weather, flight) |
| `DayHeader` | 1366 | In-page day section header with scroll anchor |
| `FloatingDayBar` | 1375 | Fixed-position compact day bar via portal to `document.body`, z-index 45, opacity-based fade transition |
| `ImageCarousel` | 1388 | Photo carousel with full left/right half click zones + arrow key support |
| `StarRating` | 1437 | Reddit score (1–5 stars) |
| `VoteButtons` | 1449 | Upvote/downvote buttons with voter name lists |
| `CommentSection` | 1505 | Expandable comments with threaded replies |
| `CardComponent` | 1603 | Full card: image carousel, cost badge, tier, description, details, Google/Reddit links, votes, comments. 📋 "Add to Trip" button (top-left) with day picker dropdown |
| `SuggestionModal` | 1739 | Form to submit new activity/restaurant suggestion |
| `LeaderboardView` | 1841 | Ranked cards by net vote score with thumbnail images, descriptions, and estimated cost |
| `ItineraryView` | 1933 | Two sub-tabs: **"Day-by-Day"** (fixed 8-day itinerary with expandable stops, expand/collapse all, auto region labels) and **"Trip Drafts"** (family grid → person's drafts → expandable day-by-day view with full card details, rename/delete/set-active controls) |
| `ItinerarySidePanel` | 2572 | Slide-out right panel (380px, z-1003) via portal. Draft switcher pills, inline title rename, liked-but-unplanned cards grouped by region, user-created days with stops/reorder/remove, card picker modal with Type/Cost/Booking filters. Expanded card modal renders centered in main content area (left of panel). Reads/writes to active draft in `/trip-drafts/` |

### App Component (lines 3042–3570)

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
| `panelDayCount` | React state (derived from active draft) | No |
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
1. Loading spinner → PasswordGate → UserSelector → (TutorialModal) → Main app
2. Main app: sticky Header + FilterBar → then one of:
   - **Itineraries tab:** ItineraryView (sub-tabs: Day-by-Day planner | Trip Drafts browser)
   - **Leaderboard tab:** LeaderboardView
   - **Map mode:** MapView (full-screen map with pins)
   - **List mode:** HeroSection → FloatingDayBar → DayNavigator → Day sections (DayHeader + CardGrid)
3. Floating buttons (z-1001): "My Trip" (opens ItinerarySidePanel) + "Add a Suggestion"
4. ItinerarySidePanel (portal to body, z-1003) — always available from any page, edits active draft
5. Auto-creates first draft on initial load via `ensureActiveDraft` useEffect

### Render Entry Point (lines 3576–3580)
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
