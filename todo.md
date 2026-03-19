# Iceland Trip Planner — TODO

## 1. Onboarding Tutorial Modal
After the "Who are you?" user selection, show a brief welcome/tutorial modal explaining:
- What this app is (family trip planner where everyone votes on activities)
- How to vote (thumbs up/down on cards)
- How to comment and suggest new activities
- Keep it very simple and visual — target audience includes non-tech-savvy parents
- Maybe 2-3 slides/steps with icons, or a single concise screen with bullet points
- "Got it!" button to dismiss

## 2. Floating Day Navigator (Scroll Indicator)
- Fixed/floating indicator on the right side of the screen
- Shows Day 1 through Day 9 as the user scrolls
- Dynamically highlights the current day based on scroll position
- Clicking a day should scroll to that section
- Compact/minimal design so it doesn't compete with the cards

## 3. Flight Departure Info — Day 1 Adjustment
- Departing Denver on Sep 4 at 8:10 PM Mountain Time
- This means arrival in Iceland is Sep 5 (morning)
- If this effectively cuts off Day 1 as a full activity day, that's fine — adjust accordingly
- Consider showing flight info in the Day 1 header or hero section

## 4. Dynamic Distance Info on Day Headers
Each day's location header should show:
- **Distance from previous day's location** (e.g., "20 km from Golden Circle")
- **Distance from home base** (e.g., "50 km from Airbnb" or "50 km from Reykjavik")

Requirements:
- Add a **home base setting** — user can set an Airbnb address or custom location
- Default home base is "Reykjavik" if no Airbnb has been set
- Home base should be configurable (a small settings option somewhere in the UI)
- Store home base in shared storage so everyone sees the same base
- Format: `Day 3 — Snæfellsnes Peninsula · 20 km from Golden Circle · 50 km from Airbnb`

## 5. Google Search Links on Cards
- Each card should have a link/button that opens Google search results for that attraction/restaurant
- Something like: "🔍 Search on Google" link
- Opens in a new tab: `https://www.google.com/search?q={name}+Iceland`
- Simple, unobtrusive placement (near the booking info area or as a small icon)

## 6. Reddit Search Links on Cards
- Each card should have a link/button labelled "Reddit"
- Opens in a new tab: `https://www.google.com/search?q={name}+Iceland+reddit`
- Simple, unobtrusive placement alongside the Google search link

## 7. Side-by-Side Family Itinerary Comparison
- Easily view family itineraries side-by-side
- Compare what different family members have planned for the same days
- Could be a split-pane view or a merged timeline with color-coded entries per person

## 8. Itinerary View Design Consistency
- Decide if itinerary views (Browse Trips and Compare) should use the same card-grid list view design as the home page original itinerary
- Currently itinerary stops are compact rows; the home page shows full cards with image carousels, descriptions, and all details visible
- Evaluate which format works better for planning vs. browsing

## 9. My Trip Side Panel — Drag-and-Drop Not Working
- Click-and-drag on stop cards in the side panel does not move cards
- The mouse-based drag system (mousedown → mousemove → mouseup) fires events but cards don't visually reorder
- The dragged card should turn gray, move vertically in-place, and a teal insertion line should appear between other cards
- Other cards should slide around smoothly to show where the drop will land
- Cross-day dragging (moving a stop from one day to another) should also work
- Arrow buttons (▲/▼) still work as a fallback for reordering
- Needs debugging: verify event listeners attach correctly, check that `translateY` transform applies, ensure `setDragState` triggers re-renders with insertion line
