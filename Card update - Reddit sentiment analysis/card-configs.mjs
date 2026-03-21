// Card configurations for Reddit Buzz scraper batch mode.
// Each entry matches a card from the main app's CARDS array.

export const CARD_CONFIGS = [
  // ── Day 1: Reykjavik ──
  { id: "day1-blue-lagoon", name: "Blue Lagoon", aliases: ["blue lagoon iceland", "blue lagoon reykjavik", "geothermal spa blue"], isGeneric: true },
  { id: "day1-sky-lagoon", name: "Sky Lagoon", aliases: ["sky lagoon reykjavik", "sky lagoon 7 step", "sky lagoon ritual"], isGeneric: false },
  { id: "day1-hallgrimskirkja", name: "Hallgrímskirkja Church Tower", aliases: ["hallgrimskirkja", "hallgrimskirkja tower", "hallgrims church", "reykjavik church tower"], isGeneric: false },
  { id: "day1-baejarins-beztu", name: "Bæjarins Beztu Pylsur", aliases: ["hot dog stand", "hot dog place", "pylsur", "famous hot dog", "baejarins", "best hot dog", "baejarins beztu"], isGeneric: false },
  { id: "day1-mat-bar", name: "Mat Bar", aliases: ["mat bar reykjavik", "matbar reykjavik"], isGeneric: true },
  { id: "day1-matur-og-drykkur", name: "Matur og Drykkur", aliases: ["matur og drykkur", "matur drykkur", "matur og drykkur reykjavik"], isGeneric: false },

  // ── Day 2: Golden Circle ──
  { id: "day2-thingvellir", name: "Þingvellir National Park", aliases: ["thingvellir", "pingvellir", "tectonic plates park", "almannagjá", "almannagja"], isGeneric: false },
  { id: "day2-silfra", name: "Silfra Snorkeling", aliases: ["silfra", "silfra fissure", "silfra snorkel", "silfra dive", "snorkel between plates"], isGeneric: false },
  { id: "day2-geysir", name: "Geysir / Strokkur", aliases: ["geysir", "strokkur", "geyser iceland", "strokkur geyser"], isGeneric: false },
  { id: "day2-gullfoss", name: "Gullfoss Waterfall", aliases: ["gullfoss", "golden falls", "gullfoss waterfall"], isGeneric: false },
  { id: "day2-kerid", name: "Kerið Crater", aliases: ["kerid", "kerid crater", "kerið", "crater lake golden circle"], isGeneric: false },
  { id: "day2-grillmarkadurinn", name: "Grillmarkaðurinn (Grill Market)", aliases: ["grillmarkadurinn", "grill market", "grillmarkadurinn reykjavik", "grill market reykjavik"], isGeneric: false },
  { id: "day2-fiskfelagid", name: "Fiskfélagið (Fish Company)", aliases: ["fiskfelagid", "fish company", "fish company reykjavik", "fiskfélagið"], isGeneric: false },

  // ── Day 3: Snæfellsnes Peninsula ──
  { id: "day3-ytri-tunga", name: "Ytri-Tunga Beach", aliases: ["ytri tunga", "ytri-tunga", "seal beach snaefellsnes", "golden sand beach iceland"], isGeneric: false },
  { id: "day3-budakirkja", name: "Búðakirkja (Black Church)", aliases: ["budakirkja", "budir church", "black church iceland", "búðakirkja", "buðakirkja"], isGeneric: false },
  { id: "day3-arnarstapi", name: "Arnarstapi–Hellnar Coastal Walk", aliases: ["arnarstapi", "hellnar", "arnarstapi hellnar", "gatklettur", "coastal walk snaefellsnes"], isGeneric: false },
  { id: "day3-djupalonssandur", name: "Djúpalónssandur Beach", aliases: ["djupalonssandur", "djúpalónssandur", "black pebble beach", "lifting stones beach"], isGeneric: false },
  { id: "day3-londrangar", name: "Lóndrangar Cliffs", aliases: ["londrangar", "lóndrangar", "londrangar cliffs", "basalt sea stacks snaefellsnes"], isGeneric: false },
  { id: "day3-kirkjufell", name: "Kirkjufell & Kirkjufellsfoss", aliases: ["kirkjufell", "kirkjufellsfoss", "arrowhead mountain", "game of thrones mountain", "most photographed mountain"], isGeneric: false },

  // ── Day 4: South Coast ──
  { id: "day4-seljalandsfoss", name: "Seljalandsfoss", aliases: ["seljalandsfoss", "walk behind waterfall", "waterfall you can walk behind"], isGeneric: false },
  { id: "day4-gljufrabui", name: "Gljúfrabúi (Hidden Waterfall)", aliases: ["gljufrabui", "gljúfrabúi", "hidden waterfall", "secret waterfall seljalandsfoss"], isGeneric: false },
  { id: "day4-skogafoss", name: "Skógafoss", aliases: ["skogafoss", "skógafoss", "527 steps waterfall"], isGeneric: false },
  { id: "day4-plane-wreck", name: "Sólheimasandur DC-3 Plane Wreck", aliases: ["solheimasandur", "plane wreck", "dc-3 plane wreck", "plane wreck iceland", "solheimasandur plane"], isGeneric: false },
  { id: "day4-dyrholaey", name: "Dyrhólaey", aliases: ["dyrholaey", "dyrhólaey", "dyrholaey arch", "dyrholaey lighthouse"], isGeneric: false },
  { id: "day4-reynisfjara", name: "Reynisfjara Black Sand Beach", aliases: ["reynisfjara", "black sand beach", "basalt columns beach", "reynisdrangar", "vik beach"], isGeneric: false },
  { id: "day4-smidjan", name: "Smiðjan Brugghús", aliases: ["smidjan", "smidjan brugghus", "smiðjan", "vik brewery", "vik brewpub"], isGeneric: false },
  { id: "day4-black-crust", name: "Black Crust Pizzeria", aliases: ["black crust", "black crust pizza", "black crust vik", "volcanic pizza vik"], isGeneric: false },

  // ── Day 5: Westman Islands ──
  { id: "day5-ferry", name: "Westman Islands Ferry", aliases: ["westman islands ferry", "herjolfur ferry", "vestmannaeyjar ferry", "heimaey ferry", "landeyjahofn ferry"], isGeneric: false },
  { id: "day5-eldfell", name: "Eldfell Volcano Hike", aliases: ["eldfell", "eldfell volcano", "eldfell hike", "heimaey volcano"], isGeneric: false },
  { id: "day5-eldheimar", name: "Eldheimar Museum", aliases: ["eldheimar", "eldheimar museum", "pompeii of the north", "1973 eruption museum"], isGeneric: false },
  { id: "day5-rib-tour", name: "RIB Boat Safari", aliases: ["rib safari", "rib boat westman", "rib tour vestmannaeyjar", "elephant rock boat", "westman islands boat tour"], isGeneric: false },
  { id: "day5-storhofdi", name: "Stórhöfði (Puffin Colony)", aliases: ["storhofdi", "stórhöfði", "puffin colony westman", "puffin heimaey", "windiest place europe"], isGeneric: false },
  { id: "day5-beluga", name: "Beluga Whale Sanctuary", aliases: ["beluga sanctuary", "sea life trust beluga", "beluga whale heimaey", "little white little grey"], isGeneric: false },
  { id: "day5-slippurinn", name: "Slippurinn", aliases: ["slippurinn", "slippurinn restaurant", "slippurinn vestmannaeyjar", "slippurinn heimaey"], isGeneric: false },

  // ── Day 6: Glaciers & Jökulsárlón ──
  { id: "day6-fjadrargljufur", name: "Fjaðrárgljúfur Canyon", aliases: ["fjadrargljufur", "fjaðrárgljúfur", "fjadra canyon", "justin bieber canyon"], isGeneric: false },
  { id: "day6-glacier-hike", name: "Glacier Hike at Skaftafell", aliases: ["glacier hike", "skaftafell glacier", "falljokull", "glacier walk iceland", "vatnajokull hike"], isGeneric: false },
  { id: "day6-svartifoss", name: "Svartifoss (Black Falls)", aliases: ["svartifoss", "black falls", "basalt column waterfall skaftafell"], isGeneric: false },
  { id: "day6-jokulsarlon-zodiac", name: "Jökulsárlón Zodiac Boat Tour", aliases: ["jokulsarlon zodiac", "jökulsárlón zodiac", "glacier lagoon zodiac", "zodiac boat tour iceland"], isGeneric: false },
  { id: "day6-jokulsarlon-amphibian", name: "Jökulsárlón Amphibian Boat Tour", aliases: ["jokulsarlon amphibian", "jökulsárlón amphibian", "glacier lagoon amphibian", "amphibian boat iceland"], isGeneric: false },
  { id: "day6-diamond-beach", name: "Diamond Beach", aliases: ["diamond beach", "diamond beach iceland", "ice on black sand", "jokulsarlon beach"], isGeneric: true },
  { id: "day6-humarhofnin", name: "Humarhöfnin", aliases: ["humarhofnin", "humarhöfnin", "langoustine hofn", "lobster hofn", "langoustine restaurant iceland"], isGeneric: false },

  // ── Day 7: Return West ──
  { id: "day7-secret-lagoon", name: "Secret Lagoon (Gamla Laugin)", aliases: ["secret lagoon", "gamla laugin", "secret lagoon fludir", "old pool fludir"], isGeneric: true },
  { id: "day7-reykjadalur", name: "Reykjadalur Hot Spring River", aliases: ["reykjadalur", "hot spring river", "hot river hike", "reykjadalur hike"], isGeneric: false },

  // ── Day 7 (Reykjavik return) / Day 8 ──
  { id: "day8-perlan", name: "Perlan Museum", aliases: ["perlan", "perlan museum", "perlan reykjavik", "ice cave museum reykjavik"], isGeneric: false },
  { id: "day8-whale-watching", name: "Whale Watching", aliases: ["whale watching reykjavik", "whale tour reykjavik", "elding whale watching"], isGeneric: true },
  { id: "day8-dill", name: "Dill Restaurant", aliases: ["dill restaurant", "dill reykjavik", "michelin star reykjavik", "dill iceland"], isGeneric: false },
  { id: "day8-ox", name: "Óx", aliases: ["ox restaurant", "ox reykjavik", "10 seat restaurant reykjavik", "ox sumac", "óx restaurant"], isGeneric: false },
  { id: "day8-skal", name: "Skál!", aliases: ["skal restaurant", "skál restaurant", "skal reykjavik", "skál reykjavik"], isGeneric: false },
];
