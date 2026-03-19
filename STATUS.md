# Iceland Trip Planner — Project Status

**Last updated:** 2026-03-18
**Live URL:** https://bencjohns.github.io/iceland-2026/
**Repo:** https://github.com/bencjohns/iceland-2026

## Trip Details

- **Who:** Murray, Laurel, Claire, Mati, Ben, Cade (6 people)
- **When:** Sep 4–12, 2026 (fly out Thu Sep 4, arrive Fri Sep 5, depart Sat Sep 12)
- **Where:** Iceland ring road — Reykjavik → Golden Circle → Snæfellsnes → South Coast → Westman Islands → Glaciers/Jökulsárlón → back to Reykjavik

## What's Built

### Core Features
- [x] Card-based itinerary with 48 attractions/restaurants across 8 days
- [x] Per-user voting (upvote/downvote) with voter name display
- [x] Comments with threaded replies
- [x] User-submitted suggestions with delete capability
- [x] Leaderboard view ranked by net vote score with cost estimation
- [x] Password gate ("ingeborg") — persists in localStorage

### Real-Time Sync (Firebase)
- [x] Firebase Realtime Database (Spark/free plan)
- [x] Votes, comments, suggestions, home base sync across all devices
- [x] Current user selection stays local (per-browser)

### Navigation & Filtering
- [x] Sticky header + filter bar (All Days, Must-Decide, Restaurants, Suggestions, Leaderboard)
- [x] Advanced filters: activity type, cost tier, booking lead time
- [x] Day navigator (right-side dots, click to scroll)
- [x] Floating day bar (shows current day when scrolling) — **partially working, may need debugging**

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

## What's Not Done / Known Issues

### From todo.md (original backlog)
- [x] ~~Onboarding Tutorial Modal~~ — Done
- [x] ~~Floating Day Navigator~~ — Done
- [x] ~~Flight Departure Info~~ — Done
- [x] ~~Dynamic Distance Info~~ — Done
- [x] ~~Google Search Links~~ — Done
- [x] ~~Reddit Search Links~~ — Done

### Known Issues
- **Floating day bar** — Sometimes doesn't appear or has visibility glitches. Uses fixed positioning with scroll-based show/hide; the stacking context from `backdrop-blur` on the main header broke CSS `position: sticky`.
- **Filter bar bottom clipping** — Was fixed with extra padding but may recur if filter bar height changes.
- **Image count** — Many cards still have only 2–3 Unsplash photos instead of the target 5. The 12 restaurant cards have local images downloaded from official sites.
- **No offline support** — App requires internet for Firebase + Unsplash images + CDN scripts.
- **Firebase test mode** — Database rules are open (read/write: true). Fine for a private family app, but test mode expires after 30 days — rules will need to be updated before then.

### Future Ideas
- Bring all cards to 5 photos each
- Add a proper service worker for offline support + real "update available" refresh
- Tighten Firebase security rules (allow only authenticated family members)
- Add trip cost calculator / budget tracker
- Packing list feature
- Weather API integration for real forecasts closer to the trip
- Mobile app wrapper (PWA)

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 (CDN, no build step) |
| Styling | Tailwind CSS (CDN) |
| Transpilation | Babel Standalone |
| Database | Firebase Realtime Database (Spark plan) |
| Hosting | GitHub Pages |
| Images | Unsplash (remote) + local downloads in `/images/` |

## How to Deploy Updates

1. Edit `index.html`
2. Bump `APP_VERSION` (line 91) and update `APP_UPDATE_NOTES` (line 92)
3. `git add index.html && git commit -m "description" && git push`
4. GitHub Pages auto-deploys in ~1 minute
5. Users see a blue "What's New" banner on next page load
