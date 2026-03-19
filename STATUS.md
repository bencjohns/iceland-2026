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
- [x] Leaderboard view ranked by net vote score with cost estimation, thumbnail images, and descriptions
- [x] Password gate ("ingeborg") — persists in localStorage

### Interactive Map View
- [x] Full-screen Leaflet map with CARTO Voyager tiles
- [x] 48 geocoded attractions with color-coded pins by day + category emoji icons
- [x] Compact popup on pin click (photo, name, cost, vote counts)
- [x] "View Full Details" expands to full CardComponent in modal overlay
- [x] Day filter legend — click a day to show only that day's pins
- [x] List/Map toggle in filter bar
- [x] All existing filters (type, cost, booking) apply to map view

### Personal Itinerary Builder
- [x] Each family member can build their own day-by-day itinerary
- [x] Family selector grid showing stop count and plan summary per person
- [x] Card picker modal with search to add stops to any day
- [x] Reorder stops with ▲/▼ buttons, remove with ✕
- [x] Drive time and distance computed between consecutive stops (haversine × 1.4 road factor ÷ 70 km/h)
- [x] Day summaries: stop count, total drive time, total cost per person
- [x] Others can view itineraries read-only and leave comments/suggestions
- [x] Real-time sync via Firebase

### Real-Time Sync (Firebase)
- [x] Firebase Realtime Database (Spark/free plan)
- [x] Votes, comments, suggestions, home base, itineraries, itinerary comments sync across all devices
- [x] Current user selection stays local (per-browser)

### Navigation & Filtering
- [x] Sticky header + filter bar (All Days, Must-Decide, Restaurants, Suggestions, Leaderboard, Itineraries)
- [x] Advanced filters: activity type, cost tier, booking lead time — toggle off by re-clicking
- [x] Day navigator (right-side dots, click to scroll)
- [x] Floating day bar (shows current day when scrolling) — fixed, uses portal to document.body

### Card Details
- [x] Image carousel (full left/right click zones, arrow key support)
- [x] Cost tier badges (free/moderate/splurge)
- [x] Reddit rating (1–5 stars)
- [x] Book-soon flags with lead time
- [x] Drive distance from previous stop
- [x] Google Search + Reddit Search links per card
- [x] Booking URLs

### UX
- [x] Onboarding tutorial modal (first visit)
- [x] "What's New" update notification banner
- [x] Configurable home base for distance display
- [x] Responsive design (3-col → 2-col → 1-col)

## Known Issues

- **Image count** — Many cards still have only 2–3 Unsplash photos instead of the target 5. The 12 restaurant cards have local images downloaded from official sites.
- **No offline support** — App requires internet for Firebase + Unsplash images + CDN scripts.
- **Firebase test mode** — Database rules are open (read/write: true). Fine for a private family app, but test mode expires after 30 days — rules will need to be updated before then.
- **Drive time estimates** — Itinerary drive times use haversine × 1.4 road factor, not real routing. Accuracy varies; Iceland's roads can be slower than the 70 km/h average assumed.

## Future Ideas

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
2. Bump `APP_VERSION` (line 91) and update `APP_UPDATE_NOTES` (line 92)
3. `git add index.html && git commit -m "description" && git push`
4. GitHub Pages auto-deploys in ~1 minute
5. Users see a blue "What's New" banner on next page load
