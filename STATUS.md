# Iceland Trip Planner — Project Status

**Last updated:** 2026-03-19
**Live URL:** https://bencjohns.github.io/iceland-2026/
**Repo:** https://github.com/bencjohns/iceland-2026

## Trip Details

- **Who:** Murray, Laurel, Claire, Mati, Ben, Cade (6 people)
- **When:** Sep 4–12, 2026 (fly out Fri Sep 4, arrive Sat Sep 5, depart Sat Sep 12)
- **Where:** Iceland ring road — Reykjavik → Golden Circle → Snæfellsnes → South Coast → Westman Islands → Glaciers/Jökulsárlón → back to Reykjavik

## What's Built

### Core Features
- [x] Card-based itinerary with 48 attractions/restaurants across 8 days
- [x] Per-user voting (upvote/downvote) with voter name display
- [x] Comments with threaded replies
- [x] User-submitted suggestions with delete capability
- [x] "Most Liked" view (formerly Leaderboard) ranked by net vote score with cost estimation, thumbnail images, and descriptions
- [x] Password gate ("ingeborg") — persists in localStorage

### Interactive Map View
- [x] Full-screen Leaflet map with CARTO Voyager tiles
- [x] 48 geocoded attractions with color-coded pins by day + category emoji icons
- [x] Compact popup on pin click (photo, name, cost, vote counts)
- [x] "View Full Details" expands to full CardComponent in modal overlay
- [x] Day filter legend — click a day to show only that day's pins
- [x] List/Map toggle in filter bar
- [x] All existing filters (type, cost, booking) apply to map view

### My Trip Side Panel (Primary Planning Interface)
- [x] Floating "My Trip" button accessible from all pages (List, Map, Most Liked, Itineraries)
- [x] Slide-out right panel (380px desktop, full-screen mobile) for personal trip planning
- [x] Pre-seeded with 8 days matching actual trip structure (dates, regions — e.g., "Day 3 · Sep 7 📍 Snæfellsnes")
- [x] Day headers: left side shows "Day N · date", right side shows "📍 Region"; stats row below (stops, drive time, cost/pp)
- [x] "Liked but unplanned" section — upvoted cards grouped by region (Reykjavik, Golden Circle, etc.)
- [x] Each stop in its own bordered card with drag handle, thumbnail, details, and action buttons
- [x] Drag-and-drop reordering — click and hold anywhere on a card to drag vertically; teal insertion line shows drop position; other cards slide around smoothly (mouse-event based, not HTML5 drag API)
- [x] Cross-day drag — drag stops between days, including into empty days ("Drop here" zone)
- [x] Arrow buttons (▲/▼) as fallback for reordering (hidden on mobile, visible on desktop)
- [x] Drive time connectors between stops
- [x] "+ Add stop" per day with searchable card picker modal (Type/Cost/Booking filters)
- [x] "+ Add Day" to create additional days beyond the 8 trip days
- [x] + button on every card (top-right, List + Map view) to add directly to trip
- [x] Auto-detect region labels for extra days using GPS nearest-centroid matching

### Trip Drafts System
- [x] Itineraries tab has two sub-tabs: "Compare" (default) and "Browse Trips"
- [x] Each family member can save up to 5 named drafts
- [x] Draft switcher pills in side panel header — hidden when only 1 draft, appears automatically with 2+
- [x] Click draft title to rename inline
- [x] Save & Start New / Rename / Delete controls per draft
- [x] "Set as Active" to choose which draft the side panel edits
- [x] Browse Trips tab: family grid → person's drafts → expandable day-by-day view
- [x] Click stops to expand with full card details + Expand All / Collapse All
- [x] Auto-creates "Draft 1" on first use
- [x] Stored in Firebase `/trip-drafts/` (separate from Day-by-Day `/itineraries/`)

### Draft Comparison View
- [x] "Compare" sub-tab (default when entering Itineraries) shows all drafts with 1+ stops side-by-side
- [x] Horizontal scrolling grid — one column per draft (360–440px), rows aligned by day
- [x] Column headers with person avatar, draft title, and stop count
- [x] Day rows with color-coded badges, region labels, and summary stats (stops, drive time, cost/pp)
- [x] Consensus highlighting — stops appearing in 2+ drafts get teal background + frequency badge (e.g., "3×")
- [x] Inline expand/collapse per stop with horizontal card layout (image left, details right)
- [x] Expand All / Collapse All button for all stops across all columns
- [x] Expanded cards show which other drafts include the same stop as teal pills
- [x] Drive time connectors between stops
- [x] Reads from existing `/trip-drafts/` — no new Firebase paths needed

### Real-Time Sync (Firebase)
- [x] Firebase Realtime Database (Spark/free plan)
- [x] Votes, comments, suggestions, home base, itineraries, itinerary comments, trip drafts sync across all devices
- [x] Current user selection stays local (per-browser)

### Navigation & Filtering
- [x] Sticky header + filter bar (All Days, Must-Decide, Restaurants, Suggestions, Most Liked, Itineraries)
- [x] Advanced filters: activity type, cost tier, booking lead time — toggle off by re-clicking
- [x] Day navigator (right-side dots with "DAY" label, click to scroll)
- [x] Floating day bar (shows current day when scrolling, text-lg title matching card titles) — fixed, uses portal to document.body

### Card Details
- [x] Image carousel (full left/right click zones, arrow key support)
- [x] Cost tier badges (free/moderate/splurge)
- [x] Reddit rating (1–5 stars)
- [x] Book-soon flags with lead time
- [x] Drive distance from previous stop
- [x] Google Search + Reddit Search links per card
- [x] Booking URLs

### UX & Onboarding
- [x] Spotlight tour (6-step carousel with coach marks) — shown on first visit after user selection
- [x] Each step highlights the real UI element with a dimmed overlay + rounded cutout
- [x] Tour card positions near the highlighted element (above/below/side), glides smoothly between steps
- [x] Arrow key navigation (left/right), Escape to close, clickable dot indicators, "Skip tour" link
- [x] Same tour accessible anytime via (i) info button in header next to card count
- [x] Graceful enter/exit animations (fade + scale) on open and close
- [x] "What's New" update notification banner
- [x] Configurable home base for distance display
- [x] Responsive design (3-col → 2-col → 1-col)

### Animated Modals
- [x] Reusable `AnimatedModal` component — all modals fade + scale in/out (300ms)
- [x] Applied to: Suggestion modal, Home Base modal, map expanded card, itinerary card pickers, side panel card picker, side panel expanded card
- [x] Side panel uses separate slide transition (already existed)

## Known Issues

- **Image count** — Many cards still have only 2–3 Unsplash photos instead of the target 5. The 12 restaurant cards have local images downloaded from official sites.
- **No offline support** — App requires internet for Firebase + Unsplash images + CDN scripts.
- **Firebase test mode** — Database rules are open (read/write: true). Fine for a private family app, but test mode expires after 30 days — rules will need to be updated before then.
- **Drive time estimates** — Itinerary drive times use haversine × 1.4 road factor, not real routing. Accuracy varies; Iceland's roads can be slower than the 70 km/h average assumed.

## Future Ideas

- Decide if itinerary views should use the same card-grid design as the home page
- Bring all cards to 5 photos each
- Add a proper service worker for offline support + real "update available" refresh
- Tighten Firebase security rules (allow only authenticated family members)
- Add trip cost calculator / budget tracker
- Packing list feature
- Weather API integration for real forecasts closer to the trip
- Mobile app wrapper (PWA)
- Real routing API (OSRM) for accurate drive times in itinerary builder

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 (CDN, no build step) |
| Styling | Tailwind CSS (CDN) |
| Transpilation | Babel Standalone |
| Database | Firebase Realtime Database (Spark plan) |
| Hosting | GitHub Pages |
| Maps | Leaflet 1.9.4 + CARTO Voyager tiles |
| Images | Unsplash (remote) + local downloads in `/images/` + Guide to Iceland |

## How to Deploy Updates

1. Edit `index.html`
2. Bump `APP_VERSION` (line 107) and update `APP_UPDATE_NOTES` (line 108)
3. `git add index.html && git commit -m "description" && git push`
4. GitHub Pages auto-deploys in ~1 minute
5. Users see a blue "What's New" banner on next page load
