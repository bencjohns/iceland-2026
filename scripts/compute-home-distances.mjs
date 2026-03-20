#!/usr/bin/env node
/**
 * Pre-compute driving distances from home base locations to all cards.
 * Appends to existing distances.json.
 *
 * Usage: node scripts/compute-home-distances.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const CARD_COORDS = {
  "day1-blue-lagoon":      { lat: 63.8803, lng: -22.4495 },
  "day1-sky-lagoon":       { lat: 64.1215, lng: -21.9960 },
  "day1-hallgrimskirkja":  { lat: 64.1417, lng: -21.9267 },
  "day1-baejarins-beztu":  { lat: 64.1475, lng: -21.9342 },
  "day1-mat-bar":          { lat: 64.1470, lng: -21.9310 },
  "day1-matur-og-drykkur": { lat: 64.1510, lng: -21.9445 },
  "day2-thingvellir":      { lat: 64.2559, lng: -21.1290 },
  "day2-silfra":           { lat: 64.2558, lng: -21.1166 },
  "day2-geysir":           { lat: 64.3103, lng: -20.3024 },
  "day2-gullfoss":         { lat: 64.3271, lng: -20.1199 },
  "day2-kerid":            { lat: 64.0412, lng: -20.8853 },
  "day2-grillmarkadurinn": { lat: 64.1474, lng: -21.9335 },
  "day2-fiskfelagid":      { lat: 64.1480, lng: -21.9380 },
  "day3-ytri-tunga":       { lat: 64.7944, lng: -23.4953 },
  "day3-budakirkja":       { lat: 64.8193, lng: -23.3851 },
  "day3-arnarstapi":       { lat: 64.7660, lng: -23.6224 },
  "day3-djupalonssandur":  { lat: 64.7522, lng: -23.8987 },
  "day3-londrangar":        { lat: 64.7355, lng: -23.7792 },
  "day3-kirkjufell":       { lat: 64.9426, lng: -23.3054 },
  "day4-seljalandsfoss":   { lat: 63.6156, lng: -19.9886 },
  "day4-gljufrabui":       { lat: 63.6210, lng: -19.9847 },
  "day4-skogafoss":        { lat: 63.5321, lng: -19.5113 },
  "day4-plane-wreck":      { lat: 63.4591, lng: -19.3647 },
  "day4-dyrholaey":        { lat: 63.4003, lng: -19.1268 },
  "day4-reynisfjara":      { lat: 63.4044, lng: -19.0714 },
  "day4-smidjan":          { lat: 63.4186, lng: -19.0060 },
  "day4-black-crust":      { lat: 63.4190, lng: -19.0100 },
  "day5-ferry":            { lat: 63.4400, lng: -20.2700 },
  "day5-eldfell":          { lat: 63.4305, lng: -20.2433 },
  "day5-eldheimar":        { lat: 63.4400, lng: -20.2678 },
  "day5-rib-tour":         { lat: 63.4420, lng: -20.2750 },
  "day5-storhofdi":        { lat: 63.3964, lng: -20.2872 },
  "day5-beluga":           { lat: 63.4424, lng: -20.2630 },
  "day5-slippurinn":       { lat: 63.4410, lng: -20.2680 },
  "day6-fjadrargljufur":   { lat: 63.7713, lng: -18.1716 },
  "day6-glacier-hike":     { lat: 64.0146, lng: -16.9713 },
  "day6-svartifoss":       { lat: 64.0277, lng: -16.9753 },
  "day6-jokulsarlon-zodiac":    { lat: 64.0784, lng: -16.2306 },
  "day6-jokulsarlon-amphibian": { lat: 64.0800, lng: -16.2250 },
  "day6-diamond-beach":    { lat: 64.0770, lng: -16.2170 },
  "day6-humarhofnin":      { lat: 64.2532, lng: -15.2076 },
  "day7-secret-lagoon":    { lat: 64.1362, lng: -20.3092 },
  "day7-reykjadalur":      { lat: 64.0260, lng: -21.2023 },
  "day8-perlan":           { lat: 64.1290, lng: -21.9180 },
  "day8-whale-watching":   { lat: 64.1522, lng: -21.9509 },
  "day8-dill":             { lat: 64.1476, lng: -21.9275 },
  "day8-ox":               { lat: 64.1472, lng: -21.9310 },
  "day8-skal":             { lat: 64.1468, lng: -21.9285 },
};

// Home base locations to compute from
const HOME_BASES = {
  "home-reykjavik": { lat: 64.145, lng: -21.930 },
  "home-kef-airport": { lat: 63.985, lng: -22.605 },
};

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchRoute(coordA, coordB) {
  const url = `${OSRM_BASE}/${coordA.lng},${coordA.lat};${coordB.lng},${coordB.lat}?overview=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes?.length) return null;
  const route = data.routes[0];
  return { km: Math.round(route.distance / 1000), minutes: Math.round(route.duration / 60) };
}

function makeKey(a, b) { return a < b ? `${a}|${b}` : `${b}|${a}`; }

async function main() {
  const existing = JSON.parse(readFileSync(join(root, 'distances.json'), 'utf8'));
  const cardIds = Object.keys(CARD_COORDS);
  let added = 0;

  for (const [homeId, homeCoord] of Object.entries(HOME_BASES)) {
    console.log(`Computing routes from ${homeId}...`);
    for (const cardId of cardIds) {
      const key = makeKey(homeId, cardId);
      if (existing[key]) { continue; }
      try {
        const route = await fetchRoute(homeCoord, CARD_COORDS[cardId]);
        if (route) { existing[key] = route; added++; }
      } catch (err) {
        console.error(`  Error ${key}: ${err.message}`);
        await sleep(2000);
        try {
          const route = await fetchRoute(homeCoord, CARD_COORDS[cardId]);
          if (route) { existing[key] = route; added++; }
        } catch (e) { console.error(`  Retry failed: ${e.message}`); }
      }
      await sleep(100);
    }
  }

  console.log(`Added ${added} home base routes.`);
  writeFileSync(join(root, 'distances.json'), JSON.stringify(existing, null, 2));
  console.log('Written to distances.json');
}

main().catch(err => { console.error(err); process.exit(1); });
