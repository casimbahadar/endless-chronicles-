// Endless Chronicle engine: generated FE-style campaign that plays itself. No DOM here.
(function (root) {
'use strict';
let W = 15, H = 10;
let ROMD = null;           // { maps:[{ch,w,h,terr}], classes:{id:{mov,def,avo,res,sms}} } decoded from the player's own FE8 ROM
function setRomData(d) { ROMD = d; }

function RNG(seed) {
  let s = seed >>> 0;
  const get = () => s, set = v => { s = v >>> 0; };
  const r = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.int = (a, b) => a + Math.floor(r() * (b - a + 1));
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.chance = (p) => r() * 100 < p;
  r.getState = get; r.setState = set;
  return r;
}

// ---------------------------------------------------------------- data (placeholder classes)
const TERRAIN = {
  plain:   { name: 'Plain',    cost: { foot: 1, armor: 1, horse: 1, fly: 1 }, def: 0, avo: 0 },
  forest:  { name: 'Forest',   cost: { foot: 2, armor: 2, horse: 3, fly: 1 }, def: 1, avo: 20 },
  hill:    { name: 'Hill',     cost: { foot: 3, armor: 99, horse: 99, fly: 1 }, def: 2, avo: 30 },
  water:   { name: 'River',    cost: { foot: 99, armor: 99, horse: 99, fly: 1 }, def: 0, avo: 0 },
  bridge:  { name: 'Bridge',   cost: { foot: 1, armor: 1, horse: 1, fly: 1 }, def: 0, avo: 0 },
  fort:    { name: 'Fort',     cost: { foot: 2, armor: 2, horse: 2, fly: 1 }, def: 2, avo: 20, heal: 20 },
  village: { name: 'Village',  cost: { foot: 1, armor: 1, horse: 1, fly: 1 }, def: 0, avo: 10 },
  wall:    { name: 'Wall',     cost: { foot: 99, armor: 99, horse: 99, fly: 99 }, def: 0, avo: 0 },
  floor:   { name: 'Floor',    cost: { foot: 1, armor: 1, horse: 1, fly: 1 }, def: 0, avo: 0 },
  throne:  { name: 'Throne',   cost: { foot: 1, armor: 1, horse: 1, fly: 1 }, def: 3, avo: 30, heal: 10 },
};
const WEAPONS = {
  sword: { type: 'sword', name: 'Iron Sword', mt: 5, hit: 90, crit: 0, min: 1, max: 1, uses: 46 },
  steel_sword: { type: 'sword', name: 'Steel Sword', mt: 8, hit: 75, crit: 0, min: 1, max: 1, uses: 30, tier: 2 },
  silver_sword: { type: 'sword', name: 'Silver Sword', mt: 13, hit: 80, crit: 0, min: 1, max: 1, uses: 20, tier: 3 },
  killing_edge: { type: 'sword', name: 'Killing Edge', mt: 9, hit: 75, crit: 30, min: 1, max: 1, uses: 20, tier: 3 },
  lance: { type: 'lance', name: 'Iron Lance', mt: 7, hit: 80, crit: 0, min: 1, max: 1, uses: 45 },
  steel_lance: { type: 'lance', name: 'Steel Lance', mt: 10, hit: 70, crit: 0, min: 1, max: 1, uses: 30, tier: 2 },
  silver_lance: { type: 'lance', name: 'Silver Lance', mt: 14, hit: 75, crit: 0, min: 1, max: 1, uses: 20, tier: 3 },
  killer_lance: { type: 'lance', name: 'Killer Lance', mt: 10, hit: 70, crit: 30, min: 1, max: 1, uses: 20, tier: 3 },
  javelin: { type: 'lance', name: 'Javelin', mt: 6, hit: 65, crit: 0, min: 1, max: 2, uses: 20, tier: 2, ranged: true },
  axe: { type: 'axe', name: 'Iron Axe', mt: 8, hit: 75, crit: 0, min: 1, max: 1, uses: 45 },
  steel_axe: { type: 'axe', name: 'Steel Axe', mt: 11, hit: 65, crit: 0, min: 1, max: 1, uses: 30, tier: 2 },
  silver_axe: { type: 'axe', name: 'Silver Axe', mt: 15, hit: 70, crit: 0, min: 1, max: 1, uses: 20, tier: 3 },
  killer_axe: { type: 'axe', name: 'Killer Axe', mt: 11, hit: 65, crit: 30, min: 1, max: 1, uses: 20, tier: 3 },
  hand_axe: { type: 'axe', name: 'Hand Axe', mt: 7, hit: 60, crit: 0, min: 1, max: 2, uses: 20, tier: 2, ranged: true },
  bow: { type: 'bow', name: 'Iron Bow', mt: 6, hit: 85, crit: 0, min: 2, max: 2, effFly: true, uses: 45 },
  steel_bow: { type: 'bow', name: 'Steel Bow', mt: 9, hit: 70, crit: 0, min: 2, max: 2, effFly: true, uses: 30, tier: 2 },
  silver_bow: { type: 'bow', name: 'Silver Bow', mt: 13, hit: 75, crit: 0, min: 2, max: 2, effFly: true, uses: 20, tier: 3 },
  killer_bow: { type: 'bow', name: 'Killer Bow', mt: 9, hit: 75, crit: 30, min: 2, max: 2, effFly: true, uses: 20, tier: 3 },
  longbow: { type: 'bow', name: 'Longbow', mt: 5, hit: 65, crit: 0, min: 2, max: 3, effFly: true, uses: 20, tier: 3 },
  fire: { type: 'fire', name: 'Fire', mt: 5, hit: 90, crit: 0, min: 1, max: 2, magic: true, uses: 40, spell: 'fire' },
  thunder: { type: 'fire', name: 'Thunder', mt: 8, hit: 80, crit: 5, min: 1, max: 2, magic: true, uses: 35, spell: 'thunder', tier: 2 },
  elfire: { type: 'fire', name: 'Elfire', mt: 10, hit: 85, crit: 0, min: 1, max: 2, magic: true, uses: 30, spell: 'elfire', tier: 3 },
  lightning: { type: 'fire', name: 'Lightning', mt: 4, hit: 95, crit: 5, min: 1, max: 2, magic: true, uses: 35, spell: 'lightning' },
  bolting: { type: 'fire', name: 'Bolting', mt: 12, hit: 65, crit: 0, min: 1, max: 2, magic: true, uses: 5, spell: 'bolting', tier: 3 },
  fimbulvetr: { type: 'fire', name: 'Fimbulvetr', mt: 13, hit: 80, crit: 0, min: 1, max: 2, magic: true, uses: 20, spell: 'fimbulvetr', tier: 3 },
  shine: { type: 'fire', name: 'Shine', mt: 6, hit: 90, crit: 8, min: 1, max: 2, magic: true, uses: 30, spell: 'shine', tier: 2 },
  divine: { type: 'fire', name: 'Divine', mt: 8, hit: 85, crit: 10, min: 1, max: 2, magic: true, uses: 25, spell: 'divine', tier: 3 },
  purge: { type: 'fire', name: 'Purge', mt: 10, hit: 75, crit: 5, min: 1, max: 2, magic: true, uses: 5, spell: 'purge', tier: 3 },
  eclipse: { type: 'fire', name: 'Eclipse', mt: 12, hit: 30 + 40, crit: 0, min: 1, max: 2, magic: true, uses: 5, spell: 'eclipse', tier: 3 },
  flux: { type: 'fire', name: 'Flux', mt: 7, hit: 80, crit: 0, min: 1, max: 2, magic: true, uses: 45, spell: 'flux' },
  armorslayer: { type: 'sword', name: 'Armorslayer', mt: 8, hit: 80, crit: 0, min: 1, max: 1, uses: 18, tier: 2, eff: 'armor' },
  wyrmslayer: { type: 'sword', name: 'Wyrmslayer', mt: 7, hit: 75, crit: 0, min: 1, max: 1, uses: 20, tier: 2, eff: 'dragon' },
  brave_sword: { type: 'sword', name: 'Brave Sword', mt: 9, hit: 75, crit: 0, min: 1, max: 1, uses: 30, tier: 3, brave: true },
  runesword: { type: 'sword', name: 'Runesword', mt: 12, hit: 65, crit: 0, min: 1, max: 2, uses: 15, tier: 3, drain: true, magicRanged: true },
  light_brand: { type: 'sword', name: 'Light Brand', mt: 9, hit: 70, crit: 0, min: 1, max: 2, uses: 25, tier: 2, magicRanged: true },
  wind_sword: { type: 'sword', name: 'Wind Sword', mt: 9, hit: 70, crit: 0, min: 1, max: 2, uses: 40, tier: 2, magicRanged: true, eff: 'flier' },
  lancereaver: { type: 'sword', name: 'Lancereaver', mt: 9, hit: 75, crit: 5, min: 1, max: 1, uses: 15, tier: 2, reaver: true },
  horseslayer: { type: 'lance', name: 'Horseslayer', mt: 7, hit: 70, crit: 0, min: 1, max: 1, uses: 16, tier: 2, eff: 'cavalry' },
  heavy_spear: { type: 'lance', name: 'Heavy Spear', mt: 9, hit: 70, crit: 0, min: 1, max: 1, uses: 16, tier: 2, eff: 'armor' },
  brave_lance: { type: 'lance', name: 'Brave Lance', mt: 10, hit: 70, crit: 0, min: 1, max: 1, uses: 30, tier: 3, brave: true },
  axereaver: { type: 'lance', name: 'Axereaver', mt: 10, hit: 70, crit: 5, min: 1, max: 1, uses: 15, tier: 2, reaver: true },
  poison_lance: { type: 'lance', name: 'Poison Lance', mt: 6, hit: 70, crit: 0, min: 1, max: 1, uses: 40, poison: true },
  hammer: { type: 'axe', name: 'Hammer', mt: 10, hit: 55, crit: 0, min: 1, max: 1, uses: 20, tier: 2, eff: 'armor' },
  halberd: { type: 'axe', name: 'Halberd', mt: 10, hit: 60, crit: 0, min: 1, max: 1, uses: 18, tier: 2, eff: 'cavalry' },
  brave_axe: { type: 'axe', name: 'Brave Axe', mt: 10, hit: 65, crit: 0, min: 1, max: 1, uses: 30, tier: 3, brave: true },
  swordreaver: { type: 'axe', name: 'Swordreaver', mt: 11, hit: 60, crit: 5, min: 1, max: 1, uses: 15, tier: 2, reaver: true },
  poison_axe: { type: 'axe', name: 'Poison Axe', mt: 7, hit: 65, crit: 0, min: 1, max: 1, uses: 40, poison: true },
  brave_bow: { type: 'bow', name: 'Brave Bow', mt: 10, hit: 70, crit: 0, min: 2, max: 2, effFly: true, uses: 30, tier: 3, brave: true },
  poison_bow: { type: 'bow', name: 'Poison Bow', mt: 4, hit: 65, crit: 0, min: 2, max: 2, effFly: true, uses: 40, poison: true },
  nosferatu: { type: 'fire', name: 'Nosferatu', mt: 10, hit: 70, crit: 0, min: 1, max: 2, magic: true, uses: 20, spell: 'lightning', tier: 3, drain: true },
  physic: { type: 'staff', name: 'Physic', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, physic: true, longRange: true, power: 10, uses: 15, rank: 71 },
  restore: { type: 'staff', name: 'Restore', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, cure: true, uses: 10, rank: 71 },
  barrier_staff: { type: 'staff', name: 'Barrier', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, barrier: true, uses: 15, rank: 71 },
  torch_staff: { type: 'staff', name: 'Torch', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, lightArea: true, uses: 10, rank: 31 },
  unlock: { type: 'staff', name: 'Unlock', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, unlock: true, longRange: true, uses: 10, rank: 31 },
  rescue_staff: { type: 'staff', name: 'Rescue', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, rescueStaff: true, longRange: true, uses: 3, rank: 121 },
  sleep_staff: { type: 'staff', name: 'Sleep', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, status: 'sleep', longRange: true, uses: 2, rank: 121 },
  silence_staff: { type: 'staff', name: 'Silence', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, status: 'silence', longRange: true, uses: 3, rank: 121 },
  berserk_staff: { type: 'staff', name: 'Berserk', mt: 0, hit: 0, crit: 0, min: 1, max: 1, util: true, status: 'berserk', longRange: true, uses: 3, rank: 181 },
  staff: { type: 'staff', name: 'Heal', mt: 0, hit: 0, crit: 0, min: 1, max: 1, heal: true, power: 10, uses: 30 },
  mend: { type: 'staff', name: 'Mend', mt: 0, hit: 0, crit: 0, min: 1, max: 1, heal: true, power: 20, uses: 20, tier: 2 },
  dance: { type: 'dance', name: 'Dance', mt: 0, hit: 0, crit: 0, min: 1, max: 1, refresh: true, uses: 0 },
  claw:  { type: 'claw', name: 'Claws', mt: 7, hit: 80, crit: 5, min: 1, max: 1, uses: 0 },
  eye:   { type: 'eye', name: 'Evil Eye', mt: 6, hit: 85, crit: 0, min: 1, max: 2, magic: true, uses: 0 },
  breath:{ type: 'breath', name: 'Breath', mt: 9, hit: 80, crit: 0, min: 1, max: 1, magic: true, uses: 0 },
  seraph_robe: { type: 'item', name: 'Seraph Robe', booster: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  energy_ring: { type: 'item', name: 'Energy Ring', booster: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  spirit_dust: { type: 'item', name: 'Spirit Dust', booster: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  secret_book: { type: 'item', name: 'Secret Book', booster: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  speedwings: { type: 'item', name: 'Speedwings', booster: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  goddess_icon: { type: 'item', name: 'Goddess Icon', booster: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  dragonshield: { type: 'item', name: 'Dragonshield', booster: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  talisman: { type: 'item', name: 'Talisman', booster: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  torch: { type: 'item', name: 'Torch', torch: true, uses: 3, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  chest_key: { type: 'item', name: 'Chest Key', key: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  door_key: { type: 'item', name: 'Door Key', key: true, uses: 1, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  vulnerary: { type: 'item', name: 'Vulnerary', consumable: true, power: 10, uses: 3, mt: 0, hit: 0, crit: 0, min: 9, max: 0 },
  elixir: { type: 'item', name: 'Elixir', consumable: true, power: 99, uses: 3, mt: 0, hit: 0, crit: 0, min: 9, max: 0, tier: 3 },
  none: { type: 'none', name: 'Unarmed', mt: 0, hit: 0, crit: 0, min: 9, max: 0, uses: 0 },
};
const wtype = id => (WEAPONS[id] && WEAPONS[id].type) || id;
// weapon ranks are weapon EXP, as in FE: E 1, D 31, C 71, B 121, A 181, S 251
const RANKS = [[251, 'S'], [181, 'A'], [121, 'B'], [71, 'C'], [31, 'D'], [1, 'E']];
const rankLetter = v => (RANKS.find(([t]) => v >= t) || [0, '-'])[1];
const ELEM = { nosferatu: 'light', fire: 'anima', thunder: 'anima', elfire: 'anima', bolting: 'anima', fimbulvetr: 'anima', lightning: 'light', shine: 'light', divine: 'light', purge: 'light', flux: 'dark', eclipse: 'dark' };
const rankKey = id => ELEM[id] || (WEAPONS[id] && WEAPONS[id].type === 'fire' ? 'anima' : wtype(id));
function rankReq(id) { const w = WEAPONS[id]; if (w && w.rank) return w.rank; if (!w || w.consumable || ['dance', 'claw', 'eye', 'breath', 'none'].includes(w.type)) return 0;
  if (/killer|killing|longbow/.test(id) || w.crit >= 30) return 71; if ((w.tier || 1) >= 3) return 121; if ((w.tier || 1) === 2) return 31; return 1; }
function startRanks(c) { if (c.ranks && Object.keys(c.ranks).length) return Object.assign({}, c.ranks); const t = wtype(c.wpn); return { [t === 'fire' ? 'anima' : t]: 31 }; }
// ---- inventories: up to five items; weapons wear out, consumables heal
const MAXITEMS = 5;
const item = id => ({ id, uses: WEAPONS[id].uses || 0, max: WEAPONS[id].uses || 0 });
function canWield(u, id) { const w = WEAPONS[id], c = CLASSES[u.cls]; if (!w || w.consumable || w.booster || w.torch || w.key || id === 'none') return false;
  if (['dance', 'claw', 'eye', 'breath'].includes(w.type)) return w.type === wtype(c.wpn);
  if (!u.wexp) u.wexp = startRanks(c); const k = rankKey(id); return (u.wexp[k] || 0) >= Math.max(1, rankReq(id)); }
function weaponsOf(u) { return (u.items || []).filter(it => canWield(u, it.id) && (it.max === 0 || it.uses > 0) && !WEAPONS[it.id].util && !WEAPONS[it.id].booster && !(hasStatus(u, 'silence') && (WEAPONS[it.id].magic || WEAPONS[it.id].heal))); }
function equipBest(u) { const ws = weaponsOf(u); u.weapon = ws.length ? ws[0].id : 'none'; }
function tomeFor(c, rng, n) {
  const nm = (c.name || '').toLowerCase();
  const late = n >= 10 && rng.chance(Math.min(50, (n - 8) * 6)), mid = n >= 5 && rng.chance(Math.min(60, (n - 3) * 8));
  if (/monk|bishop|priest|cleric|curate|saint|valkyrie|sister/.test(nm) && !c.healer) return late ? rng.pick(['divine', 'purge']) : mid ? 'shine' : 'lightning';
  if (/shaman|druid|summoner|dark|sorcer|necro/.test(nm)) return late && c.promoted ? 'eclipse' : 'flux';
  if (late && c.promoted) return rng.pick(['bolting', 'fimbulvetr', 'elfire']);
  return c.promoted ? 'elfire' : rng.chance(Math.min(60, 20 + n * 5)) ? 'thunder' : 'fire';
}
function loadout(rng, u, n, team) {
  const c = CLASSES[u.cls], t = wtype(c.wpn), out = []; u.wexp = startRanks(c); const knows = Object.keys(u.wexp);
  const tierRoll = () => { const r = rng.int(1, 100); return n >= 8 && r <= 10 + n ? 3 : n >= 3 && r <= 25 + n * 4 ? 2 : 1; };
  const pick = (tier, tt) => { const pool = Object.keys(WEAPONS).filter(k => WEAPONS[k].type === (tt || t) && !WEAPONS[k].ranged && (WEAPONS[k].tier || 1) === tier && !WEAPONS[k].consumable && !WEAPONS[k].poison && !WEAPONS[k].util && WEAPONS[k].type !== 'fire'); const ok = pool.filter(k => (u.wexp[rankKey(k)] || 0) >= rankReq(k)); return ok.length ? rng.pick(ok) : pool.find(k => (WEAPONS[k].tier || 1) === 1) || null; };
  const fits = id => (u.wexp[rankKey(id)] || 0) >= Math.max(1, rankReq(id));
  if (t === 'fire') { const tm = tomeFor(c, rng, n); out.push(item(fits(tm) ? tm : ELEM[tm] === 'light' ? 'lightning' : ELEM[tm] === 'dark' ? 'flux' : 'fire')); }
  else if (t === 'staff') out.push(item(c.promoted && fits('mend') ? 'mend' : 'staff'));
  else if (['dance', 'claw', 'eye', 'breath'].includes(t)) out.push(item(t));
  else { out.push(item(pick(tierRoll()) || c.wpn));
    if (n >= 2 && rng.chance(team === 'player' ? 35 : 25)) { const extra = t === 'lance' ? 'javelin' : t === 'axe' ? 'hand_axe' : t === 'bow' && n >= 6 ? 'longbow' : pick(Math.min(3, tierRoll() + 1)); if (extra && extra !== out[0].id) out.push(item(extra)); } }
  // a second weapon type the class also knows (Paladin: swords and lances), and a staff for fighters who can heal
  const others = knows.filter(k => ['sword', 'lance', 'axe', 'bow'].includes(k) && k !== t);
  if (others.length && out.length < 3 && rng.chance(70)) { const o = pick(1, rng.pick(others)); if (o) out.push(item(o)); }
  if (t !== 'staff' && knows.includes('staff') && out.length < 3) out.push(item('staff'));
  if (team === 'enemy' && knows.includes('staff') && n >= 5 && rng.chance(55)) { const s = rng.pick(['sleep_staff', 'silence_staff', 'berserk_staff', 'physic', 'sleep_staff']); u.wexp.staff = Math.max(u.wexp.staff || 0, rankReq(s)); out.push(item(s)); }
  if (team === 'enemy' && n >= 3 && rng.chance(12) && ['lance', 'axe', 'bow'].includes(t)) out.unshift(item('poison_' + t));
  if (team === 'player') out.push(item('vulnerary'));
  else if (rng.chance(20)) out.push(item(n >= 9 && rng.chance(20) ? 'elixir' : 'vulnerary'));
  u.items = out.slice(0, MAXITEMS); equipBest(u);
}
// between chapters: every unit keeps a usable weapon (or staff) and at least one healing item
const PRICE = { sword: 460, lance: 360, axe: 270, bow: 540, steel_sword: 600, steel_lance: 480, steel_axe: 360, steel_bow: 720, silver_sword: 1500, silver_lance: 1200, silver_axe: 1000, silver_bow: 1600,
  armorslayer: 1260, wyrmslayer: 1500, brave_sword: 3000, runesword: 3300, light_brand: 1500, wind_sword: 2000, lancereaver: 1800, horseslayer: 1300, heavy_spear: 1400, brave_lance: 3000, axereaver: 1950, hammer: 800, halberd: 1300, brave_axe: 3000, swordreaver: 2100, brave_bow: 3000,
  nosferatu: 3000, physic: 3750, restore: 2000, barrier_staff: 2000, torch_staff: 1000, unlock: 1500, torch: 250,
  javelin: 400, hand_axe: 375, fire: 560, thunder: 700, elfire: 1200, lightning: 630, shine: 900, flux: 900, staff: 600, mend: 1000, vulnerary: 300 };
function armory(rng, camp, u, n, notes) {
  if (!camp) return; camp.gold = camp.gold || 0;
  if (!u.leader && camp.gold >= 400 && !camp.army.some(o => (o.items || []).some(it => it.id === 'torch')) && (u.items || []).length < MAXITEMS && /thief|rogue|assassin|archer|cavalier|pegasus/i.test(className(u))) { camp.gold -= 250; u.items.push(item('torch')); notes.push(`Armory: ${u.name} picked up a Torch for dark battlefields (250 gold).`); }
  for (const it of [...(u.items || [])]) { const w = WEAPONS[it.id]; if (!w || w.consumable || !it.max || it.uses >= 15) continue;
    const base = (w.tier || 1) === 1 && !w.ranged, cost = base ? 0 : Math.round((PRICE[it.id] || 800) * 0.6);
    if (cost <= camp.gold) { camp.gold -= cost; it.uses = it.max; if (notes.length < 4) notes.push(`${u.name}'s worn ${w.name} was replaced${cost ? ` (${cost} gold)` : ''}.`); } }
  // battalions: a unit without one hires the kind that suits it; a worn one is resupplied for the endurance it lost
  if (u.bat && u.bat.endure < u.bat.max) { const cost = Math.round(BAT_PRICE[u.bat.key] * (u.bat.max - u.bat.endure) / u.bat.max * 0.5); if (cost <= camp.gold) { camp.gold -= cost; u.bat.endure = u.bat.max; notes.push(`Armory: resupplied ${u.bat.name} for ${u.name} (${cost} gold).`); } }
  // broken weapons kept by the unit are repaired, most valuable first, at the same rate as replacing a worn one
  if (u.brokenKept && u.brokenKept.length) { u.brokenKept.sort((a, b) => (PRICE[b] || 800) - (PRICE[a] || 800));
    for (const id of [...u.brokenKept]) { const cost = Math.round((PRICE[id] || 800) * 0.6), full = (u.items || []).length >= MAXITEMS; if (cost > camp.gold || (full && !camp.convoy)) continue;
      camp.gold -= cost; (full ? camp.convoy : u.items).push(item(id)); u.brokenKept.splice(u.brokenKept.indexOf(id), 1); (camp.repairs = camp.repairs || []).push(id);
      notes.push(`Armory: repaired ${u.name}'s ${WEAPONS[id].name} (${cost} gold)${full ? ', sent to the convoy' : ''}.`); } equipBest(u); }
  // a unit with no usable attack weapon gets a plain one of its kind, as worn plain weapons are replaced free
  { const kinds = (CLASSES[u.cls].wpn || '').split ? [wtype(CLASSES[u.cls].wpn)] : [], t0 = kinds[0];
    if (t0 && !['staff', 'dance'].includes(t0) && !weaponsOf(u).some(it => { const w = WEAPONS[it.id]; return w && !w.heal && !w.refresh && !w.util; }) && (u.items || []).length < MAXITEMS) {
      const id = Object.keys(WEAPONS).find(k => WEAPONS[k].type === t0 && (WEAPONS[k].tier || 1) === 1 && !WEAPONS[k].ranged && !WEAPONS[k].heal && !WEAPONS[k].util && canWield(u, k));
      if (id) { u.items.push(item(id)); equipBest(u); notes.push(`Armory: ${u.name} had no weapon left and was given a ${WEAPONS[id].name}.`); } } }
  if ((u.wexp || {}).staff >= 71) for (const sid of ['physic', 'restore']) if (!(u.items || []).some(it => it.id === sid) && camp.gold >= PRICE[sid] + 400 && (u.items || []).length < MAXITEMS && n >= 6) { camp.gold -= PRICE[sid]; u.items.push(item(sid)); notes.push(`Armory: ${u.name} bought a ${WEAPONS[sid].name} staff (${PRICE[sid]} gold).`); break; }
  const t = wtype(CLASSES[u.cls].wpn); if (['fire', 'staff', 'dance', 'claw', 'eye', 'breath'].includes(t)) return;
  const has = tier => (u.items || []).some(it => WEAPONS[it.id] && WEAPONS[it.id].type === t && (WEAPONS[it.id].tier || 1) >= tier);
  for (const [tier, minCh] of [[3, 8], [2, 3]]) { if (n < minCh || has(tier)) continue;
    const id = Object.keys(WEAPONS).find(k => WEAPONS[k].type === t && (WEAPONS[k].tier || 1) === tier && !WEAPONS[k].ranged && !/killer|killing|long/.test(k) && canWield(u, k));
    if (id && PRICE[id] && camp.gold >= PRICE[id] + 400 && (u.items || []).length < MAXITEMS) { camp.gold -= PRICE[id]; u.items.push(item(id)); if (notes.length < 4) notes.push(`Armory: ${u.name} bought a ${WEAPONS[id].name} (${PRICE[id]} gold).`); break; } }
}
function restock(rng, u, n, camp) {
  if (camp && camp.convoy && camp.convoy.length && u.items && u.items.length < MAXITEMS && !weaponsOf(u).some(it => !WEAPONS[it.id].heal)) { const k = camp.convoy.findIndex(it => canWield(u, it.id)); if (k >= 0) u.items.push(camp.convoy.splice(k, 1)[0]); }
  if (!u.items) loadout(rng, u, n, 'player');
  { const nr = startRanks(CLASSES[u.cls]); u.wexp = u.wexp || {}; for (const k in nr) u.wexp[k] = Math.max(u.wexp[k] || 0, nr[k]); }
  if (!weaponsOf(u).length) { const t = wtype(CLASSES[u.cls].wpn); const base = t === 'fire' ? tomeFor(CLASSES[u.cls], rng, n) : t === 'staff' ? 'staff' : CLASSES[u.cls].wpn; if (!addItem(u, base)) { u.items[0] = item(base); } }
  if (!u.items.some(it => WEAPONS[it.id] && WEAPONS[it.id].consumable)) addItem(u, 'vulnerary');
  equipBest(u);
}
function canOpenDoors(u) { return /thief|rogue|assassin/i.test((CLASSES[u.cls] && CLASSES[u.cls].name) || '') || (u.items || []).some(it => it.id === 'door_key' && it.uses > 0); }
function canOpenChests(u) { return /thief|rogue|assassin/i.test((CLASSES[u.cls] && CLASSES[u.cls].name) || '') || (u.items || []).some(it => it.id === 'chest_key' && it.uses > 0); }
function addItem(u, id) { if (!u.items) u.items = []; if (u.items.length >= MAXITEMS) return false; u.items.push(item(id)); return true; }
function useUp(u, id, n) { const it = (u.items || []).find(x => x.id === id && (x.max === 0 || x.uses > 0)); if (!it || it.max === 0) return null; it.uses -= n;
  if (it.uses <= 0) { u.items.splice(u.items.indexOf(it), 1); equipBest(u);
    // a weapon better than a plain tier-1 one is kept as broken, for the armory to repair between chapters
    const w = WEAPONS[id]; if (u.team === 'player' && w && !w.consumable && !w.heal && !w.refresh && !w.util && ((w.tier || 1) > 1 || w.ranged || w.brave || w.legend || w.prf || (PRICE[id] || 0) >= 700)) (u.brokenKept = u.brokenKept || []).push(id);
    return WEAPONS[id].name; } return null; }

const S = ['hp', 'str', 'mag', 'skl', 'spd', 'lck', 'def', 'res'];
const C = (wpn, mov, mt, base, gr, extra) => Object.assign({ wpn, mov, mt, base, gr }, extra || {});
const b = (hp, str, mag, skl, spd, lck, def, res) => ({ hp, str, mag, skl, spd, lck, def, res });
const CLASSES = {
  Lord:      C('sword', 5, 'foot',  b(18,5,1,7,8,6,4,2),  b(75,45,15,55,60,55,30,30), { lord: true }),
  Mercenary: C('sword', 5, 'foot',  b(18,5,0,8,7,2,4,0),  b(80,45,5,50,45,30,30,20)),
  Myrmidon:  C('sword', 5, 'foot',  b(16,4,0,9,10,3,2,1), b(70,35,5,55,65,40,20,25), { critBonus: 15 }),
  Soldier:   C('lance', 5, 'foot',  b(19,6,0,3,3,1,5,0),  b(80,50,0,35,30,25,40,15)),
  Knight:    C('lance', 4, 'armor', b(20,7,0,3,1,1,10,0), b(85,50,0,35,20,25,55,15)),
  Cavalier:  C('lance', 7, 'horse', b(19,6,0,5,6,3,6,1),  b(80,45,5,45,45,35,30,20)),
  Pegasus:   C('lance', 7, 'fly',   b(15,4,1,6,8,5,3,6),  b(60,35,15,50,60,50,15,50), { flier: true }),
  Fighter:   C('axe',   5, 'foot',  b(22,7,0,4,4,1,3,0),  b(90,60,0,35,40,25,25,10)),
  Brigand:   C('axe',   5, 'foot',  b(21,6,0,2,5,0,2,0),  b(85,55,0,25,40,20,20,5),  { climber: true }),
  Archer:    C('bow',   5, 'foot',  b(17,5,0,6,5,2,3,1),  b(70,45,0,55,45,35,25,20)),
  Mage:      C('fire',  5, 'foot',  b(16,0,5,4,5,3,2,4),  b(65,5,55,45,50,40,15,40)),
  Cleric:    C('staff', 5, 'foot',  b(16,0,4,3,6,6,1,6),  b(55,5,50,35,55,60,10,55), { healer: true }),
};
const FE8_CLASS = { Lord: [0x02, 0x01], Mercenary: [0x0F, 0x10], Myrmidon: [0x13, 0x14], Soldier: [0x4E, 0x4E], Knight: [0x09, 0x0A],
  Cavalier: [0x05, 0x06], Pegasus: [0x48, 0x48], Fighter: [0x3F, 0x3F], Brigand: [0x41, 0x41], Archer: [0x19, 0x1A], Mage: [0x25, 0x26], Cleric: [0x45, 0x4A] };
const PLAYER_POOL = ['Mercenary','Myrmidon','Soldier','Knight','Cavalier','Pegasus','Fighter','Archer','Mage','Cleric'];
const ENEMY_POOL  = ['Mercenary','Myrmidon','Soldier','Knight','Cavalier','Fighter','Brigand','Archer','Mage','Pegasus'];

// ---------------------------------------------------------------- names and text
const SYL1 = ['Ar','Be','Ca','Da','El','Fa','Ga','Hel','Is','Jo','Ka','Le','Ma','Ne','Or','Pe','Ra','Se','Ta','Ul','Va','Wy','Ze','Ro','Li','Mi','Sa','Ti'];
const SYL2 = ['ran','vin','lia','dor','mir','ric','nna','sha','th','ren','gus','ra','ven','lys','mon','dra','is','na','el','ian','os','ka'];
const PLACES1 = ['Ash','Raven','Glen','Thorn','Frost','Ember','Stone','Mist','Iron','Willow','Grey','Amber','Hollow','Storm'];
const PLACES2 = ['ford','moor','vale','watch','reach','mere','crest','fell','haven','gate','wood','march'];
const TITLES = ['Ashes at {p}','The Road to {p}','Siege of {p}','Night over {p}','The {p} Crossing','Blood on {p}','Shadows of {p}','The Fall of {p}','Last Light at {p}','Embers of {p}'];
function uniqueName(camp, rng) {
  if (!(camp.usedNames instanceof Set)) camp.usedNames = new Set([...(camp.army || []).map(u => u.name), ...(camp.fallen || []).map(f => f.name)]);
  for (let i = 0; i < 60; i++) { const n = makeName(rng); if (!camp.usedNames.has(n)) { camp.usedNames.add(n); return n; } }
  const n = makeName(rng) + ' ' + rng.pick(['the Younger', 'of the Vale', 'the Bold', 'of the March']); camp.usedNames.add(n); return n;
}
function unitLabel(u) { return u.name || className(u); }
function makeName(rng) { let n = rng.pick(SYL1) + rng.pick(SYL2); if (rng.chance(25)) n += rng.pick(['a','e','o','n']); return n; }
function makePlace(rng) { return rng.pick(PLACES1) + rng.pick(PLACES2); }

// ---------------------------------------------------------------- units
let UID = 1;
// everything in the campaign is saved (story, supports, gold, convoy, rival, names, used lines); Sets become arrays and back
function saveCampaign(camp) { const { rng, ...rest } = camp; return JSON.stringify(Object.assign({}, rest, { v: 1, uid: UID, rng: rng.getState() }), (k, v) => v instanceof Set ? { __set: [...v] } : v); }
function loadCampaign(json) { const d = JSON.parse(json, (k, v) => v && typeof v === 'object' && Array.isArray(v.__set) ? new Set(v.__set) : v); if (d.v !== 1) return null;
  for (const u of d.army) { if (!CLASSES[u.cls]) { u.cls = 'Mercenary'; u.fe8 = 0x0F; u.weapon = 'sword'; } if (!u.items) { u.items = [item(WEAPONS[u.weapon] ? u.weapon : CLASSES[u.cls].wpn), item('vulnerary')]; equipBest(u); } if (!u.aff) u.aff = AFF_NAMES[u.id % AFF_NAMES.length]; } const rng = RNG(d.seed); rng.setState(d.rng); UID = Math.max(UID, d.uid);
  for (const u of d.army) if (u.id === d.lord) u.leader = true;
  const camp = Object.assign({}, d, { rng }); delete camp.v; delete camp.uid;
  camp.fallen = camp.fallen || []; camp.log = camp.log || []; camp.supports = camp.supports || {}; camp.usedLines = camp.usedLines || {};
  if (!camp.story) { camp.story = STORY.premise(rng, camp, () => uniqueName(camp, rng)); if (camp.rival) camp.rival.motive = camp.story.motive; }
  return camp; }
// ---------------------------------------------------------------- crests (Three Houses): bloodlines of the run's own heroes of old.
// Each run has twelve, named for figures of its lore, each with its own effect; a minor crest fires 10% of the time, a major 20%.
// About one unit in five carries a minor crest and one in twenty a major one; plot generals carry major crests; children
// inherit a parent's crest. Rolled on their own stream, so a run's other rolls are unchanged.
// what each crest does, as the unit card and the log say it (ward, evade, thorns and resolve act when the carrier is attacked)
// (the first five keep v0.76's order, so crests already carried in a saved run keep their effect)
const CREST_FX = { might: '+5 damage on a hit', twin: 'may strike a second time', life: 'heals 30% of the damage it deals', sight: 'a miss may hit instead',
  ward: 'may halve the damage it takes', pierce: 'a hit may ignore defence', fury: 'a hit may become a critical', hunter: 'double damage to a foe below half HP',
  sunder: "a hit may cost the foe's weapon 3 uses", evade: 'may dodge a hit', thorns: 'may return half the damage it takes', resolve: 'may survive a killing blow with 1 HP' };
function crestsOf(camp) {
  if (camp.crests && camp.crests.length >= 12) return camp.crests; const r = RNG(((camp.seed || 0) >>> 0) ^ 0xC2E57), fx = Object.keys(CREST_FX), out = [];
  for (let i = 0; i < fx.length; i++) { let nm; for (let t = 0; t < 20 && (!nm || out.some(c => c.name === nm)); t++) nm = rootName(r); out.push({ id: 'c' + i, name: nm, fx: fx[i % fx.length] }); }
  return (camp.crests = out);
}
function rollCrest(camp, rng, major) { const cs = crestsOf(camp); return { id: rng.pick(cs).id, major: !!major }; }
function crestInfo(camp, u) { if (!u || !u.crest || !camp) return null; const c = crestsOf(camp).find(x => x.id === u.crest.id); return c ? Object.assign({ major: u.crest.major }, c) : null; }

function makeUnit(rng, cls, team, level, name) {
  const c = CLASSES[cls];
  const u = { id: UID++, name: name || makeName(rng), cls, team, level: 1, exp: 0, x: -1, y: -1,
    weapon: c.wpn, ai: 'pursue', boss: false, kills: 0,
    fe8: FE8_CLASS[cls] ? FE8_CLASS[cls][rng.int(0, 1)] : cls, aff: AFF_NAMES[rng.int(0, AFF_NAMES.length - 1)] };
  for (const k of S) u[k] = c.base[k] + (team === 'enemy' ? 0 : rng.int(0, k === 'hp' ? 3 : 2));
  u.maxhp = u.hp; delete u.hp;
  // growths: rerolled every run, centred on the class but kept inside a band for each stat (players), steadier for enemies
  const BAND = { hp: [40, 80], str: [15, 70], mag: [15, 70], skl: [20, 75], spd: [20, 75], lck: [15, 70], def: [15, 60], res: [15, 60] };
  u.gCls = cls; u.growth = {}; for (const k of S) { const g = c.gr[k] === undefined ? 30 : c.gr[k];
    u.growth[k] = team === 'enemy' ? Math.max(5, Math.min(90, g - 15)) : Math.min(k === 'hp' ? 95 : 85, rng.int(15, 45) + Math.round(Math.max(0, g) * 0.5)); }
  for (let l = 1; l < level; l++) levelUp(rng, u);
  u.hp = u.maxhp;
  if (team === 'player') { u.maxhp += 3; u.hp = u.maxhp; u.str += 1; u.mag += 1; u.skl += 1; u.spd += 1; u.def += 1; }
  loadout(rng, u, Math.max(1, Math.ceil(level * 0.8)), team);
  if (team === 'player') u.pskill = rng.pick(PSKILLS);
  return u;
}
// Per-class caps (SRR+): each stat's cap sits inside its tier's band (unpromoted 26-36, promoted 32-42; HP 99), placed by
// how strong that class's base is against the other classes of its tier. Class growth modifiers (SRR+): up to +/-10%
// (unpromoted) or +/-15% (promoted), following the class's own growth profile, in steps of 5.
let CLASS_TABLES = null;
function classTables() { if (CLASS_TABLES && CLASS_TABLES.n === Object.keys(CLASSES).length) return CLASS_TABLES; const caps = {}, mods = {}, keys = Object.keys(CLASSES), stats = ['str', 'mag', 'skl', 'spd', 'lck', 'def', 'res'];
  const caster = c => c.healer || ['fire', 'thunder', 'wind', 'anima', 'light', 'dark', 'staff'].includes(wtype(c.wpn)) || ['anima', 'light', 'dark', 'staff'].includes(rankKey(c.wpn));
  for (const tier of [false, true]) { const ks = keys.filter(k => !!CLASSES[k].promoted === tier && CLASSES[k].base), [lo, hi] = tier ? [32, 42] : [26, 36];
    // casters are scored against casters and physical classes against physical ones (SRR+); monsters stay out of the comparison
    const groups = [ks.filter(k => !CLASSES[k].monster && caster(CLASSES[k])), ks.filter(k => !CLASSES[k].monster && !caster(CLASSES[k]))];
    const hpAvg = ks.filter(k => CLASSES[k].gr).reduce((x, k) => x + (CLASSES[k].gr.hp || 0), 0) / Math.max(1, ks.filter(k => CLASSES[k].gr).length);
    for (const k of ks) { const c0 = CLASSES[k], peers = c0.monster ? ks : groups[caster(c0) ? 0 : 1], b = c0.base, c = { hp: 99 };
      // a stat's score is 4 x the class base + its growth rate (the GBA bases are tiny, 0-5, so growth carries the class's
      // character); the cap comes from the class's rank among its peers, not the raw spread, so one odd class cannot stretch it
      const sc = (k2, st) => 4 * ((CLASSES[k2].base || {})[st] || 0) + ((CLASSES[k2].gr || {})[st] || 0);
      for (const st of stats) { if ((st === 'mag' && !caster(c0) || st === 'str' && caster(c0) && !c0.healer && rankKey(c0.wpn) !== 'staff') && !c0.monster) { c[st] = 0; continue; } const mine = sc(k, st), v = (st === 'mag' || c0.monster ? peers : groups[0].concat(groups[1])).map(k2 => sc(k2, st));   // Magic among casters; other stats across every class
        const below = v.filter(x => x < mine).length, same = v.filter(x => x === mine).length, pct = v.length > 1 ? (below + (same - 1) / 2) / (v.length - 1) : 0.5;
        c[st] = pct; }
      caps[k] = c;
      const g = c0.gr || null, m = {}; if (g) { const vals = stats.map(st => g[st] || 0), mean = vals.reduce((x, y) => x + y, 0) / vals.length, dev = Math.max(1, ...vals.map(v => Math.abs(v - mean))), R = tier ? 15 : 10, step = v => Math.max(-R, Math.min(R, Math.round(v / 5) * 5));
        for (const st of stats) m[st] = step(((g[st] || 0) - mean) / dev * R); m.hp = step(((g.hp || 0) - hpAvg) / Math.max(1, hpAvg) * R * 2); }
      mods[k] = m; } }
  CLASS_TABLES = { caps, mods, n: keys.length }; return CLASS_TABLES; }
// SRR+'s four cap bands, following the level shown (one track to 40): 1-10 Civilian 22-30, 11-20 Tier 1 26-36, 21-30 Tier 2
// 32-42, 31-40 Tier 3 38-50; the class keeps its place (0-1) inside each band. HP 99.
const VICTORY_EXP = 35;   // percent of the next level's requirement (SRR+ curve)
const CAP_BANDS = [[22, 30], [26, 36], [32, 42], [38, 50]];
function capOf(u, k) { if (k === 'hp') return 99; const p = (classTables().caps[u.cls] || {})[k], bi = Math.max(0, Math.floor((lvShown(u) - 1) / 10)); const [lo, hi] = bi <= 3 ? CAP_BANDS[bi] : [38 + 6 * (bi - 3), 50 + 8 * (bi - 3)];
  return Math.round(lo + (hi - lo) * (p === undefined ? 0.5 : p)); }
function levelUp(rng, u) {
  // class growth modifiers apply as the difference from the class the unit's growths were made for (they already carry that
  // class's profile), so a unit only shifts when it promotes or reclasses
  if (!u.gCls) u.gCls = u.cls; const T = classTables(), now = T.mods[u.cls] || {}, was = T.mods[u.gCls] || {}, mod = {}; for (const k of S) mod[k] = (now[k] || 0) - (was[k] || 0);
  const gains = {};
  u.level++;
  for (const k of S) {
    const key = k === 'hp' ? 'maxhp' : k;
    if (u[key] >= capOf(u, k)) continue;   // at the class's cap
    if (rng.chance(u.growth[k] + (mod[k] || 0) + (u._bondGrowth && u._bondGrowth[k] || 0))) { u[key]++; gains[k] = 1; if (k === 'hp') u.hp = (u.hp || 0) + 1; }
  }
  return gains;
}

// ---------------------------------------------------------------- map generation
function inb(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
const N4 = [[1,0],[-1,0],[0,1],[0,-1]];

function genMap(rng, goal) {
  for (let tries = 0; tries < 200; tries++) {
    const m = Array.from({ length: H }, () => Array(W).fill('plain'));
    const blob = (t, n, len) => { for (let i = 0; i < n; i++) { let x = rng.int(2, W - 3), y = rng.int(0, H - 1);
      for (let j = 0; j < len; j++) { if (inb(x, y) && m[y][x] === 'plain') m[y][x] = t; const d = rng.pick(N4); x += d[0]; y += d[1]; } } };
    if (rng.chance(55)) {               // river with bridges
      let x = rng.int(5, 9); const bridges = new Set([rng.int(1, 3), rng.int(6, 8)]);
      for (let y = 0; y < H; y++) { m[y][x] = bridges.has(y) ? 'bridge' : 'water';
        if (y < H - 1 && rng.chance(30)) { const nx = x + rng.pick([-1, 1]); if (nx > 3 && nx < W - 4) { m[y][nx] = bridges.has(y) ? 'bridge' : 'water'; x = nx; } } }
    }
    blob('forest', rng.int(3, 5), rng.int(3, 6));
    blob('hill', rng.int(1, 3), rng.int(3, 5));
    for (let i = rng.int(1, 2); i > 0; i--) { const x = rng.int(3, W - 4), y = rng.int(0, H - 1); if (m[y][x] === 'plain') m[y][x] = 'fort'; }
    for (let i = rng.int(0, 2); i > 0; i--) { const x = rng.int(1, W - 2), y = rng.int(0, H - 1); if (m[y][x] === 'plain') m[y][x] = 'village'; }
    let throne = null;
    if (goal === 'seize' || goal === 'boss') {   // keep: walls on three sides of the throne, opening west
      const tx = W - 2, ty = rng.int(2, H - 3);
      for (let y = ty - 1; y <= ty + 1; y++) for (let x = tx - 1; x <= tx + 1; x++) m[y][x] = 'wall';
      m[ty][tx] = 'throne'; m[ty][tx - 1] = 'floor';
      if (goal === 'boss') m[ty][tx - 1] = 'floor';
      throne = { x: tx, y: ty };
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < 3; x++) if (m[y][x] === 'water' || m[y][x] === 'wall') m[y][x] = 'plain';
    // connectivity: every passable tile reachable on foot from the player zone
    const seen = new Set(); const q = [[0, Math.floor(H / 2)]]; m[Math.floor(H / 2)][0] = 'plain';
    while (q.length) { const [x, y] = q.pop(); const k = y * W + x; if (seen.has(k)) continue; seen.add(k);
      for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && TERRAIN[m[ny][nx]].cost.foot < 99) q.push([nx, ny]); } }
    let ok = true, open = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (TERRAIN[m[y][x]].cost.foot < 99) { open++; if (!seen.has(y * W + x)) ok = false; }
    if (throne && !seen.has(throne.y * W + throne.x)) ok = false;
    if (ok && open > W * H * 0.6) return { tiles: m, throne };
  }
  throw new Error('map generation failed');
}

// ---------------------------------------------------------------- pathing
const T_FORT = 0x0A, T_GATE = 0x0B, T_THRONE = 0x1F, T_GATE2 = 0x23;
function tid(st, x, y) { return st.map.terr ? st.map.terr[y * W + x] : st.map.tiles[y][x]; }
function moveCost(st, u, x, y) { if (st.homeground && u.team === 'enemy') { const c0 = moveCostRaw(st, u, x, y); return c0 > 1 && c0 < 99 ? 1 : c0; } return moveCostRaw(st, u, x, y); }
function moveCostRaw(st, u, x, y) { if (st.trapsShown && st.trapsShown.has(y * W + x) && st.traps.has(y * W + x) && u.team === 'player') return 99;
  if (st.map.terr) { const c = ROMD.classes[u.fe8].mov[tid(st, x, y)]; return c === 255 || c === undefined ? 99 : c; }
  const t = st.map.tiles[y][x];
  let c = TERRAIN[t].cost[CLASSES[u.cls].mt];
  if (t === 'hill' && CLASSES[u.cls].climber) c = 2;
  return c;
}
function tDef(st, u, x, y) { return st.map.terr ? (ROMD.classes[u.fe8].def[tid(st, x, y)] || 0) : TERRAIN[st.map.tiles[y][x]].def; }
function tRes(st, u, x, y) { return st.map.terr ? (ROMD.classes[u.fe8].res[tid(st, x, y)] || 0) : 0; }
function tAvo(st, u, x, y) { return st.map.terr ? (ROMD.classes[u.fe8].avo[tid(st, x, y)] || 0) : TERRAIN[st.map.tiles[y][x]].avo; }
function tHeal(st, x, y) {
  if (!st.map.terr) return TERRAIN[st.map.tiles[y][x]].heal || 0;
  const t = tid(st, x, y); return t === T_FORT ? 20 : (t === T_THRONE || t === T_GATE || t === T_GATE2) ? 10 : 0;
}
function unitAt(st, x, y) { return st.units.find(u => u.hp > 0 && (u.x === x && u.y === y || (u.big && x >= u.x && x <= u.x + 1 && y >= u.y && y <= u.y + 1))); }
// distance between two units' bodies (a beast fills its square and the three to its right and below)
function bodyDist(ax, ay, aBig, bx, by, bBig) { const dx = Math.max(0, bx - (ax + (aBig ? 1 : 0)), ax - (bx + (bBig ? 1 : 0))), dy = Math.max(0, by - (ay + (aBig ? 1 : 0)), ay - (by + (bBig ? 1 : 0))); return dx + dy; }
const PHASES = ['player', 'ally', 'neutral', 'enemy', 'other'];
function foes(a, b) {
  if (a === b) return false;
  if ((a.status && a.status.berserk > 0) || (b.status && b.status.berserk > 0)) return a.team !== 'neutral' && b.team !== 'neutral';
  if (a.team === b.team) return false;
  if (a.team === 'neutral' || b.team === 'neutral') { const n = a.team === 'neutral' ? a : b, o = n === a ? b : a; return !!n.hunted && (o.team === 'enemy' || o.team === 'other') || (!!n.hostile && !(n.bribed && (o.team === 'enemy' || o.team === 'other'))); }
  if (a.team === 'other' || b.team === 'other') { const o = a.team === 'other' ? a : b, x = o === a ? b : a; if (o.axis && (x.team === 'enemy' || (x.team === 'other' && x.axis))) return false; if (x.axis && o.team === 'other' && o.axis) return false; return true; }
  const side = t => t === 'enemy' ? 1 : 0; return side(a.team) !== side(b.team);
}

// Dijkstra from u; foes block, allies pass through. Returns Map key->{cost, prev}
function Heap() { const a = []; return { push(v) { a.push(v); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } },
  pop() { const top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i;
    if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; },
  get length() { return a.length; } }; }
function reach(st, u, limit) {
  const lim = limit === undefined ? Math.max(1, CLASSES[u.cls].mov - (st.snow && !CLASSES[u.cls].flier ? 1 : 0) - (st.squall && inSquall(st, u.x, u.y) ? 1 : 0)) : limit;
  const dist = new Map(); const open = Heap(); open.push([0, u.x, u.y, -1]);
  while (open.length) {
    const [c, x, y, p] = open.pop(); const k = y * W + x;
    if (dist.has(k)) continue; dist.set(k, { c, prev: p });
    for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue;
      const o = unitAt(st, nx, ny); if (o && foes(o, u)) continue;
      const nc = c + moveCost(st, u, nx, ny); if (nc <= lim && !dist.has(ny * W + nx)) open.push([nc, nx, ny, k]); }
  }
  return dist;
}
// distance field (ignores units) from a target, for this unit's movement type
function field(st, u, tx, ty) {
  const d = new Map(); const open = Heap(); open.push([0, tx, ty]);
  while (open.length) { const [c, x, y] = open.pop(); const k = y * W + x;
    if (d.has(k)) continue; d.set(k, c);
    for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny) || d.has(ny * W + nx)) continue;
      const mc = moveCost(st, u, nx, ny); if (mc < 99) open.push([c + mc, nx, ny]); } }
  return d;
}
function pathTo(dist, x, y) { const out = []; let k = y * W + x; while (k !== -1) { out.unshift([k % W, Math.floor(k / W)]); k = dist.get(k).prev; } return out; }
const manhattan = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// ---------------------------------------------------------------- combat
function tri(a, d) {
  const key = id => { const t = wtype(id); return t === 'fire' ? { anima: 3, light: 4, dark: 5 }[ELEM[id] || 'anima'] : { sword: 0, axe: 1, lance: 2 }[t]; };
  const A = key(a.weapon), D = key(d.weapon); if (A === undefined || D === undefined || A === D || (A < 3) !== (D < 3)) return 0;
  const base = A < 3 ? A : A - 3, def = D < 3 ? D : D - 3;
  // physical: sword beats axe, axe beats lance, lance beats sword; magic: anima beats light, light beats dark, dark beats anima
  const r0 = ((base + 1) % 3 === def) ? 1 : (((def + 1) % 3 === base) ? -1 : 0); let r = r0;
  if (WEAPONS[a.weapon] && WEAPONS[a.weapon].reaver || WEAPONS[d.weapon] && WEAPONS[d.weapon].reaver) r = -r * 2;
  return r;
}

function relicAura(st, u) { if (!st || !st._camp || u.x < 0) return u; let add = null;
  for (const h of st.units) { if (h === u || h.hp <= 0 || !(h.awake > 0) || h.team !== u.team || h.team !== 'player' || h.x < 0) continue; const r = relicOf(st._camp, h); if (!r) continue;
    if (Math.abs(h.x - u.x) + Math.abs(h.y - u.y) > ((r.tier || 0) >= 3 ? 3 : 2)) continue; add = add || {}; for (const k of Object.keys(r.boost)) add[k] = Math.max(add[k] || 0, 2); }
  // the holder's own bond: a small boost to the relic's stats even while it sleeps (awake, the full boost is already on the unit)
  const mine = relicOf(st._camp, u); if (mine && mine.owner !== 'enemy' && !(u.awake > 0)) { const [p0, p1] = BOND_PASSIVE[bondRank(mine)], ks = Object.keys(mine.boost); add = add || {}; if (p0) add[ks[0]] = (add[ks[0]] || 0) + p0; if (p1) add[ks[1]] = (add[ks[1]] || 0) + p1; }
  // fear: a foe within 3 squares of an awakened holder of rank A or higher loses 10 hit; a remembered place gives the holder +5 hit
  let fear = 0, memory = 0;
  for (const h of st.units) { if (h.hp <= 0 || !(h.awake > 0) || h.team !== 'player' || h.x < 0 || !foes(h, u)) continue; const r = relicOf(st._camp, h); if (r && bondRank(r) >= 3 && Math.abs(h.x - u.x) + Math.abs(h.y - u.y) <= 3) fear = 10; }
  if (mine && mine.owner !== 'enemy' && u.team === 'player' && u.awake > 0 && relicRemembers(st, mine)) memory = 5;      // only the army's relics remember
  let bhit = 0, bavo = 0; if (batLive(u)) { const B = BATTALIONS[u.bat.key]; add = add || {}; for (const [k, v] of Object.entries(B.bonus)) add[k] = (add[k] || 0) + v; bhit = B.hit || 0; bavo = B.avo || 0; }
  if (u._gbuff) { add = add || {}; for (const [k, v] of Object.entries(u._gbuff)) if (k !== 'team') { if (k === 'avo') bavo += v; else if (k === 'hit') bhit += v; else add[k] = (add[k] || 0) + v; } }
  if (!add && !fear && !memory && !bhit && !bavo) return u; const o = Object.create(u); for (const [k, v] of Object.entries(add || {})) o[k] = u[k] + v; o._hitMod = memory - fear + bhit; o._avoMod = bavo; return o; }
function relicRemembers(st, r) { return !!(r && ((r.places || []).includes(st.place) || (r.realm !== undefined && r.realm !== null && st.siteRealm === r.realm))); }
function stats(st, a0, d0, ax, ay) {
  const half = u => relicAura(st, u.carrying ? Object.assign(Object.create(u), { skl: Math.floor(u.skl / 2), spd: Math.floor(u.spd / 2) }) : u), a = half(a0), d = half(d0);
  const wa = WEAPONS[a.weapon], tr = tri(a, d), sa = supportBonus(st, a), sd = supportBonus(st, d);
  const art = a0.__art; let mt = wa.mt + (art ? art.mt || 0 : 0); if (art && art.eff && artEff(art, d)) mt *= 3; if (wa.effFly && CLASSES[d.cls].flier) mt *= 3; if (skillsOf(a).slayer && CLASSES[d.cls] && CLASSES[d.cls].monster) mt *= 3; if (wa.eff && CAT[wa.eff] && CAT[wa.eff](d)) mt *= 3;
  if (art && art.vsWounded && d.hp < d.maxhp / 2) mt *= 2;
  if (st && st.eclipse && st.turn <= st.eclipse && (wa.magic || wa.magicRanged || (art && art.magical))) mt *= 2;
  if (st && st.chant && a.team === 'enemy') { const B = st.units.find(o => o.id === st.chant && o.hp > 0); if (B && Math.abs(B.x - (ax === undefined ? a.x : ax)) + Math.abs(B.y - (ay === undefined ? a.y : ay)) <= 3) mt += 3; }      // the eclipse: every spell burns twice as hot
  const ranged = wa.magicRanged && Math.abs((ax ?? a.x) - d.x) + Math.abs((ay ?? a.y) - d.y) >= 2, magic = wa.magic || ranged || !!(art && art.magical);
  const charm = o => st && st.units && st.units.some(z => z !== o && z.hp > 0 && z.team === o.team && z.pskill === 'Charm' && Math.abs(z.x - o.x) + Math.abs(z.y - o.y) <= 2) ? 10 : 0;
  const atk = (magic ? a.mag : a.str) + mt + tr + sa.atk;
  const prot = (magic ? d.res + tRes(st, d, d.x, d.y) + (hasStatus(d, 'barrier') ? 7 : 0) : d.def + tDef(st, d, d.x, d.y)) + sd.def;
  const tdef = { avo: tAvo(st, d, d.x, d.y) };
  let dmg = Math.max(0, atk - (art && art.halfDef ? Math.floor(prot / 2) : prot));
  { const wt = wtype(a.weapon), dc = CLASSES[d.cls] || {}, effHit = (wa.eff && CAT[wa.eff] && CAT[wa.eff](d)) || (wa.effFly && dc.flier);
    if (wt === 'axe' && dmg < 5) dmg = 5; if (wt === 'lance' && (dc.canto || dc.flier) && !effHit) dmg *= 2; }
  const hit = Math.max(0, Math.min(100, wa.hit + (a._hitMod || 0) + (st && st.chant && a.team === 'enemy' && st.units.some(o => o.id === st.chant && o.hp > 0 && Math.abs(o.x - (ax === undefined ? a.x : ax)) + Math.abs(o.y - (ay === undefined ? a.y : ay)) <= 3) ? 10 : 0) - (st && st.squall && inSquall(st, ax === undefined ? a.x : ax, ay === undefined ? a.y : ay) ? 20 : 0) + (art ? art.hit || 0 : 0) + a.skl * 2 + Math.floor(a.lck / 2) + tr * 15 + sa.hit + charm(a0) - (d.spd * 2 + d.lck + tdef.avo + sd.avo + charm(d0)) - (st && st.storm ? 10 : 0) + (hasStatus(d, 'sleep') ? 30 : 0) - (d0.__art && d0.__art.avo ? d0.__art.avo : 0) - (d._avoMod || 0)));
  const hitF = art && art.sure ? 100 : hit;
  const crit = Math.max(0, Math.min(100, wa.crit + (art ? art.crit || 0 : 0) + Math.floor(a.skl / 2) + (CLASSES[a.cls].critBonus || 0) + sa.crit - d.lck - sd.dodge + (a0.pskill === 'Wrath' && a0.hp < a0.maxhp / 2 ? 50 : 0)));
  return { dmg, hit: hitF, crit, atk, dbl: !art && a.spd >= d.spd + 4 };
}
function inRange(a, d, ax, ay) { const w = WEAPONS[a.weapon]; if (w.heal || w.refresh) return false; const r = a.big || d.big ? bodyDist(ax, ay, a.big, d.x, d.y, d.big) : Math.abs(ax - d.x) + Math.abs(ay - d.y); return r >= w.min && r <= w.max; }
const AFF = {
  Fire:    { atk: .5, def: 0,  hit: 2.5, avo: 2.5, crit: 2.5, dodge: 0 },
  Thunder: { atk: 0,  def: .5, hit: 0,   avo: 2.5, crit: 2.5, dodge: 2.5 },
  Wind:    { atk: .5, def: 0,  hit: 2.5, avo: 0,   crit: 2.5, dodge: 2.5 },
  Ice:     { atk: 0,  def: .5, hit: 2.5, avo: 2.5, crit: 0,   dodge: 2.5 },
  Dark:    { atk: 0,  def: 0,  hit: 2.5, avo: 2.5, crit: 2.5, dodge: 2.5 },
  Light:   { atk: .5, def: .5, hit: 2.5, avo: 0,   crit: 2.5, dodge: 0 },
  Anima:   { atk: .5, def: .5, hit: 0,   avo: 2.5, crit: 0,   dodge: 2.5 } };
const AFF_NAMES = Object.keys(AFF);
let SEX = null, SEXn = 0;
function sexOf(u) { if (u.sex) return u.sex; const nk = Object.keys(CLASSES).length;
  if (!SEX || SEXn !== nk) { SEX = {}; SEXn = nk; const byName = {}; for (const [k, c] of Object.entries(CLASSES)) if (c && c.name) (byName[c.name] = byName[c.name] || []).push(k);
    const num = k => parseInt(String(k).split(':').pop(), 10) || 0;
    for (const [nm, ks] of Object.entries(byName)) { const so = ks.slice().sort((a, b) => num(a) - num(b)); so.forEach((k, i) => { SEX[k] = /pegasus|falco|cleric|troubad|valkyr|dancer/i.test(nm) || (so.length >= 2 && i === so.length - 1) ? 'f' : 'm'; }); } }
  const x = SEX[u.cls]; if (x) u.sex = x; return x || 'm'; }
function bondWord(a, b) { const x = sexOf(a), y = sexOf(b); return x === 'm' && y === 'm' ? 'brothers' : x === 'f' && y === 'f' ? 'sisters' : 'kin'; }
// Proficiencies (SRR+): Sword, Lance, Axe, Bow, Unarmed, Reason (anima + dark), Faith (light + staff), Armored, Mounted,
// Flying. The mobility three grow by fighting in a class of that kind (+2 a fight) and start at D in one.
function mobOf(c) { if (!c) return null; if (c.flier) return 'flying'; if (c.canto) return 'mounted'; if (/knight|general|armou?r|baron|fortress/i.test(c.name || '') && !c.canto) return 'armored'; return null; }
function profOf(u) { if (!u.prof) { const m = mobOf(CLASSES[u.cls]); u.prof = { armored: m === 'armored' ? 31 : 0, mounted: m === 'mounted' ? 31 : 0, flying: m === 'flying' ? 31 : 0, unarmed: 0 }; } return u.prof; }
function profTable(u) { const w = u.wexp || {}, P = profOf(u);
  return [['Sword', w.sword], ['Lance', w.lance], ['Axe', w.axe], ['Bow', w.bow], ['Unarmed', P.unarmed], ['Reason', Math.max(w.anima || 0, w.dark || 0)], ['Faith', Math.max(w.light || 0, w.staff || 0)], ['Armored', P.armored], ['Mounted', P.mounted], ['Flying', P.flying]].map(([k, v]) => [k, rankLetter(v)]); }
// the level shown (SRR+ one track to 40): a promoted class counts as levels 21-40
const lvShown = u => u.level + (CLASSES[u.cls] && CLASSES[u.cls].promoted ? 20 : 0);
// what the Advanced exam asks for a target class: C in its weapon, and D in Mounted/Flying/Armored for that kind of class
function examNeeds(u, T) { const key = rankKey(T.wpn), w = (u.wexp || {})[key] || 0, mb = mobOf(T), P = profOf(u);
  // SRR+ rule: the exam asks for the target class's own starting rank in its weapon (capped at C, at least E)
  const need = Math.max(1, Math.min(71, ((T.ranks || {})[key]) || 71)), letter = rankLetter(need);
  if (w < need) return { ok: false, why: `${letter} in ${prose(key)} for ${prose(T.name)}`, key };
  if (mb && P[mb] < 31) return { ok: false, why: `D in ${mb === 'mounted' ? 'Mounted' : mb === 'flying' ? 'Flying' : 'Armored'} for ${prose(T.name)}`, mob: mb };
  return { ok: true, over: w >= 251 ? 3 : w >= 181 ? 2 : w >= 121 ? 1 : 0 }; }
function rankOf(p) { return p >= 48 ? 3 : p >= 28 ? 2 : p >= 12 ? 1 : 0; }
function supportBonus(st, u) {
  const b = { atk: 0, def: 0, hit: 0, avo: 0, crit: 0, dodge: 0 };
  if (!st.supports || u.team !== 'player' || !u.aff) return b;
  const near = [];
  for (const o of st.units) { if (o === u || o.hp <= 0 || o.team !== 'player' || !o.aff || Math.abs(o.x - u.x) + Math.abs(o.y - u.y) > 3) continue;
    const L = rankOf(st.supports[pairKey(u, o)] || 0); if (L) near.push([L, o]); }
  near.sort((p, q) => q[0] - p[0]);
  for (const [L, o] of near.slice(0, 2)) for (const k in b) b[k] += L * (AFF[u.aff][k] + AFF[o.aff][k]);
  for (const k in b) b[k] = Math.floor(b[k]); return b;
}
function supportLevel(st, u) {
  if (!st.supports || u.team !== 'player') return 0; let lv = 0;
  for (const o of st.units) if (o !== u && o.hp > 0 && o.team === 'player' && Math.abs(o.x - u.x) + Math.abs(o.y - u.y) === 1) { const p = st.supports[pairKey(u, o)] || 0; lv += rankOf(p); }
  return Math.min(3, lv);
}
function pairKey(a, b) { return a.id < b.id ? a.id + '-' + b.id : b.id + '-' + a.id; }
function forecast(st, a, d, ax, ay) {
  const ox = a.x, oy = a.y; a.x = ax; a.y = ay;
  const A = stats(st, a, d), canCounter = !d.broken && !(a.__art && a.__art.noCounter) && inRange(d, a, d.x, d.y) && !WEAPONS[d.weapon].heal && !WEAPONS[d.weapon].refresh && !WEAPONS[d.weapon].util && !hasStatus(d, 'sleep') && !(hasStatus(d, 'silence') && WEAPONS[d.weapon].magic);
  const D = canCounter ? stats(st, d, a) : null;
  a.x = ox; a.y = oy;
  return { A, D };
}
function rollHit(rng, p) { return (rng.int(0, 99) + rng.int(0, 99)) / 2 < p; }
// resolve a fight; returns strike list for the renderer
function skillsOf(u) { const n = (CLASSES[u.cls] && CLASSES[u.cls].name || '').toLowerCase(), c = CLASSES[u.cls] || {}, s = {};
  if (c.canto !== undefined && /^(BE8E|AE7E|AFEJ)$/.test(c.game || '')) { if (c.canto) s.canto = true; }
  else if (c.flier || /cavalier|paladin|ranger|nomad|troubadour|valkyrie|horseman|rider|wyvern|pegasus|falco|social knight|lance knight|bow knight|axe knight|sword knight|duke knight|master knight|arch knight|forest knight|mage knight|great knight|lord knight/.test(n)) s.canto = true;
  if (/sniper/.test(n)) s.sure = true; if (/wyvern knight|wyvern lord|dracoknight/.test(n)) s.pierce = true; if (/general|great knight/.test(n)) s.shield = true;
  if (/assassin|rogue/.test(n)) s.silencer = true; if (/bishop|saint/.test(n)) s.slayer = true; return s; }
function fight(st, a, d) {
  const rng = st.rng, f = forecast(st, a, d, a.x, a.y), strikes = [];
  const brave = WEAPONS[a.weapon].brave || !!(a.__art && a.__art.twice), A1 = brave ? [[a, d, f.A], [a, d, f.A]] : [[a, d, f.A]];
  let order = [...A1]; if (f.D) order.push([d, a, f.D]);
  if (f.A.dbl) order.push([a, d, f.A, true], ...A1.slice(1)); else if (f.D && f.D.dbl) order.push([d, a, f.D, true]);
  if (f.D && d.pskill === 'Vantage' && d.hp < d.maxhp / 2) order = [[d, a, f.D], ...order.filter(o => o[0] !== d), ...(f.D.dbl ? [[d, a, f.D]] : [])];
  const dual = dualPartner(st, a, d); let dualDone = false, adeptUsed = {};
  for (let oi = 0; oi < order.length; oi++) { const [s, t, sv] = order[oi];
    if (s.hp <= 0 || t.hp <= 0) break;
    const sk = skillsOf(s), tk = skillsOf(t), proc = pct => rng.int(0, 99) < Math.max(5, Math.min(60, pct)); let skill = null;
    let hit = rollHit(rng, sv.hit); if (!hit && sk.sure && proc(s.level + (CLASSES[s.cls].promoted ? 10 : 0))) { hit = true; skill = 'Sure Strike'; }
    const cA = crestInfo(st._camp, s), cD = crestInfo(st._camp, t), fires = c => { const who = c === cA ? s : t; return c && rng.int(0, 99) < (c.major ? 20 : 10) * (who._resonant && who.awake > 0 ? 2 : 1); }; let crestA = null, crestD = null;
    if (cA && cA.fx === 'sight' && !hit && fires(cA)) { hit = true; crestA = cA; }
    let crit = hit && rng.int(0, 99) < sv.crit; let base = sv.dmg;
    if (hit && cD && cD.fx === 'evade' && fires(cD)) { hit = false; crit = false; crestD = cD; }
    if (hit && cA && !crestA) { const f = cA.fx, wounded = t.hp < t.maxhp / 2;
      if ((['might', 'life', 'twin', 'pierce', 'fury', 'sunder'].includes(f) || (f === 'hunter' && wounded)) && fires(cA)) { crestA = cA;
        if (f === 'might') base += 5; else if (f === 'pierce') base = Math.max(base, sv.atk || base); else if (f === 'fury') crit = true; else if (f === 'hunter') base *= 2; } }
    if (hit && sk.pierce && proc(s.level)) { base = Math.max(base, sv.atk || base); skill = 'Pierce'; }
    if (hit && sk.slayer && CLASSES[t.cls] && CLASSES[t.cls].monster) { base = Math.max(base, (sv.atk || base) * 1); skill = skill || 'Slayer'; }
    const half = pct => rng.int(0, 99) < Math.max(5, Math.floor(pct / 2));
    if (hit && s.pskill === 'Luna' && half(s.skl)) { base = Math.max(base, sv.atk || base); skill = 'Luna'; }
    let dmg = hit ? base * (crit ? 3 : 1) : 0; if (dmg > 0 && order[oi][3] && wtype(s.weapon) === 'sword') dmg = Math.round(dmg * 1.2);   // sword follow-up
    if (hit && crit && sk.silencer && rng.int(0, 99) < (t.boss ? 25 : 50)) { dmg = t.hp; skill = 'Silencer'; }
    if (hit && dmg > 0 && tk.shield && proc(t.level)) { dmg = 0; skill = 'Great Shield'; }
    const dist = Math.abs(s.x - t.x) + Math.abs(s.y - t.y);
    if (hit && dmg > 0 && dist >= 2 && t.pskill === 'Aegis' && half(t.skl)) { dmg = Math.floor(dmg / 2); skill = 'Aegis'; }
    if (hit && dmg > 0 && dist === 1 && t.pskill === 'Pavise' && half(t.skl)) { dmg = Math.floor(dmg / 2); skill = 'Pavise'; }
    if (hit && dmg > 0 && st.ward && t.team === 'enemy' && (WEAPONS[s.weapon] || {}).magic && st.units.some(o => st.ward.includes(o.id) && o.hp > 0 && Math.abs(o.x - t.x) + Math.abs(o.y - t.y) <= 2)) dmg = Math.ceil(dmg / 2);
    if (hit && t.spikes && s.hp > 1 && Math.abs(s.x - t.x) + Math.abs(s.y - t.y) === 1) s.hp = Math.max(1, s.hp - 3);
    let guardBy = null; if (hit && dmg > 0 && (t.sworn || []).length) { const g = st.units.find(o => o !== t && o.hp > 0 && o.x >= 0 && t.sworn.includes(o.id) && o.team === t.team && bodyDist(o.x, o.y, o.big, t.x, t.y, t.big) <= 2);   // a sworn sibling up to two squares away can leap in
      if (g && rng.int(0, 99) < 30) { dmg = 0; guardBy = g.id; } }
    let barrierHit = 0, barFell = 0; if (hit && dmg > 0 && t.barrier > 0) { dmg = Math.ceil(dmg / 2); t.barrier--; barrierHit = t.barrier > 0 ? 1 : 2; }   // 2 = the barrier breaks
    if (hit && dmg > 0 && cD && !crestD && cD.fx === 'ward' && fires(cD)) { dmg = Math.floor(dmg / 2); crestD = cD; }
    if (hit && dmg >= t.hp && t.hp > 1 && cD && !crestD && cD.fx === 'resolve' && fires(cD)) { dmg = t.hp - 1; crestD = cD; }
    let thorns = 0; if (hit && dmg > 1 && cD && !crestD && cD.fx === 'thorns' && fires(cD)) { thorns = Math.floor(dmg / 2); crestD = cD; }
    if (crestA || crestD) skill = 'Crest of ' + (crestA || crestD).name;
    // a thread of fate: a blow that would kill one of the army misses instead, while the chapter's threads last
    if (t.team === 'player' && dmg >= t.hp && st.fate && st.fate.left > 0) { st.fate.left--; (st.fate.saved = st.fate.saved || []).push(t.name);
      hit = false; crit = false; dmg = 0; skill = 'Fate'; }        // the killing blow misses
    t.hp = Math.max(0, t.hp - dmg); if (t.hp <= 0 && t.bars > 1) { t.bars--; t.hp = t.maxhp; barFell = t.bars; } if (thorns && hit) s.hp = Math.max(0, s.hp - thorns); if (hit && dmg > 0 && t.bat && t.bat.endure > 0) t.bat.endure--;
    if (crestA && crestA.fx === 'sunder' && hit && t.weapon && WEAPONS[t.weapon] && !WEAPONS[t.weapon].heal) { const nm = useUp(t, t.weapon, 3); if (nm) (t._sundered = t._sundered || []).push(nm); if (!weaponsOf(t).some(it => it.id === t.weapon)) equipBest(t); }
    // Break (Engage): a hit with the weapon triangle on your side breaks the foe; it cannot counter again until its own side's turn
    let broke = false; if (hit && dmg > 0 && t.hp > 0 && !t.broken && (tri(s, t) > 0 || (s.__art && s.__art.breaks))) { t.broken = true; broke = true; skill = skill || 'Break';
      for (let j = order.length - 1; j > oi; j--) if (order[j][0] === t) order.splice(j, 1); }
    let heal = 0; const w = WEAPONS[s.weapon] || {};
    if (crestA && crestA.fx === 'life' && dmg > 0) heal = Math.min(s.maxhp - s.hp, Math.ceil(dmg * 0.3));
    if (s.__art && s.__art.drain && dmg > 0) heal = Math.max(heal, Math.min(s.maxhp - s.hp, Math.ceil(dmg / 2)));
    if (crestA && crestA.fx === 'twin' && s.hp > 0 && t.hp > 0 && !adeptUsed['crest' + s.id]) { adeptUsed['crest' + s.id] = true; order.splice(oi + 1, 0, [s, t, sv]); }   // once per exchange
    if (dmg > 0 && (w.drain || (s.pskill === 'Sol' && half(s.skl) && (skill = skill || 'Sol')))) heal = Math.min(s.maxhp - s.hp, dmg);
    s.hp += heal;
    if (hit && (w.poison || (s.__art && s.__art.poison)) && t.hp > 0) { t.status = t.status || {}; t.status.poison = 3; }
    const sk2 = { by: s.id, on: t.id, hit, crit, dmg, hpAfter: t.hp, skill, heal, broke, barrier: barrierHit || undefined, barFell: barFell || undefined, guardBy: guardBy || undefined, crest: (crestA || crestD) ? { fx: (crestA || crestD).fx, on: crestA ? 'attacker' : 'defender', thorns } : null, poisoned: !!(hit && (w.poison || (s.__art && s.__art.poison)) && t.hp > 0) }; strikes.push(sk2);
    if (thorns && hit) strikes.push({ by: t.id, on: s.id, hit: true, crit: false, dmg: thorns, hpAfter: s.hp, skill: 'Thorns' });   // the crest's returned damage, shown as its own strike
    if (hit && dmg > 0 && dist === 1 && t.hp > 0 && t.pskill === 'Counter' && rng.int(0, 99) < 40) { const back = Math.min(s.hp, dmg); s.hp -= back; strikes.push({ by: t.id, on: s.id, hit: true, crit: false, dmg: back, hpAfter: s.hp, skill: 'Counter' }); }
    if (s.hp > 0 && t.hp > 0 && s.pskill === 'Adept' && !adeptUsed[s.id] && rng.int(0, 99) < Math.floor(s.spd / 2)) { adeptUsed[s.id] = true; order.splice(oi + 1, 0, [s, t, sv]); }
    // a supported partner next to the attacker may follow the attacker's first strike
    if (!dualDone && s === a && dual && t.hp > 0 && dual.o.hp > 0) { dualDone = true;
      if (rng.int(0, 99) < dual.chance) { const ph = rollHit(rng, dual.sv.hit), pc = ph && rng.int(0, 99) < dual.sv.crit, pd = ph ? dual.sv.dmg * (pc ? 3 : 1) : 0; t.hp = Math.max(0, t.hp - pd);
        strikes.push({ by: dual.o.id, on: t.id, hit: ph, crit: pc, dmg: pd, hpAfter: t.hp, skill: 'Dual Strike', dual: true }); } }
  }
  for (const u of [a, d]) if (u.hp <= 0 && u.bars > 1) { u.bars--; u.hp = u.maxhp; }
  const gems = []; for (const u of [a, d]) if (u.hp <= 0 && u.lives > 0) { u.lives--; u.hp = u.maxhp; gems.push(u.id); }   // Engage-style life gems
  for (const u of [a, d]) if (u.hp <= 0 && u.secondWind) { u.secondWind = false; u.hp = u.maxhp; u._windLine = true; }   // second wind: the first killing blow is shrugged off   // a beast's health bar catches any damage (thorns, counters), not only blows
  const out = { type: 'fight', a: a.id, d: d.id, strikes, deaths: [], exp: [], gems };
  for (const u of [a, d]) if (u.hp <= 0) { if (u.rival && !u.finalRival) u.escaped = true; out.deaths.push(u.id); const k = u === a ? d : a; k.kills++; k.chKills = (k.chKills || 0) + 1; }
  if (st.supports) for (const p of [a, d]) if (p.team === 'player' && p.hp > 0) for (const o of st.units) if (o !== p && o.hp > 0 && o.team === 'player' && Math.abs(o.x - p.x) + Math.abs(o.y - p.y) === 1) { const k = pairKey(p, o); st.supports[k] = (st.supports[k] || 0) + 2; }
  for (const [u, o] of [[a, d], [d, a]]) {
    if (u.team !== 'player' || u.hp <= 0) continue;
    const dealt = strikes.some(s => s.by === u.id && s.hit);
    const e = expFor(u, o, o.hp <= 0 ? 'kill' : gems.includes(o.id) ? 'gem' : dealt ? 'hit' : 'none');
    { const mb = mobOf(CLASSES[u.cls]); if (mb) { const P = profOf(u); P[mb] = Math.min(251, P[mb] + 2); } }
    out.exp.push(gainExp(st, u, Math.max(1, Math.min(100, e)))); if (st._camp) st._camp.bexp = (st._camp.bexp || 0) + Math.floor(e / 2);   // half of all EXP is banked as BEXP
  }
  return out;
}
// EXP (Casim, from SRR+): hits 3-12, kills 30-40, captains/generals 50-70, commanders 80-100 across an even fight to an
// underdog one; a much stronger unit gets far less. Effective level counts a promoted class as 20 levels higher. A broken
// life gem pays 75% of the kill.
function expFor(u, o, kind) { const lv = x => x.level + (CLASSES[x.cls] && CLASSES[x.cls].promoted ? 20 : 0), d = lv(o) - lv(u);
  if (kind === 'none') return 1; if (kind === 'hit') return d >= 0 ? Math.min(12, 10 + Math.floor(d / 2)) : Math.max(1, 10 + Math.round(d / 2));
  const tier = o.boss ? [80, 100, 10] : (o.captain || o.genTitle || o.keyholder) ? [50, 70, 6] : [30, 40, 2];
  const v = d >= 0 ? Math.min(tier[1], tier[0] + d * 2) : Math.max(tier[2], tier[0] + d * 3); return kind === 'gem' ? Math.round(v * 0.75) : v; }
// EXP curve (SRR+ s44ap, Casim's table): EXP to the next level by the level shown (one track, promoted level 1 = 21);
// past the table's level 39 it keeps SRR+'s late pace, +20 a level
const EXP_REQ = [100, 110, 120, 135, 145, 160, 175, 180, 200, 220, 240, 240, 240, 260, 260, 260, 280, 280, 300,
  300, 305, 310, 325, 330, 350, 360, 370, 375, 385, 395, 400, 410, 425, 440, 460, 470, 485, 500, 520];
const expReqAt = shown => shown < 1 ? 100 : shown <= 39 ? EXP_REQ[shown - 1] : 540 + (shown - 40) * 20;
const expReq = u => expReqAt(lvShown(u));
// where levelling stops: an unpromoted class at 20 until the exam; promoted at 40 in book 1, and (Casim: no level caps
// between books) up to 99 shown from book 2 on
function atLevelCap(st, u) { const c = CLASSES[u.cls] || {}; if (!c.promoted) return u.level >= 20; const book = (st && st._camp && st._camp.story && st._camp.story.book) || 1; return u.level >= (book >= 2 ? 79 : 20); }
function gainExp(st, u, e) { if (st.sideLvCap && u.team === 'player' && lvShown(u) >= st.sideLvCap) e = 0;
  const r = { id: u.id, exp: e, levels: [], reqs: [], from: u.exp, fromLevel: u.level };
  u.exp += e;
  for (let guard = 0; guard < 60; guard++) { const req = expReq(u); r.reqs.push(req); if (atLevelCap(st, u)) { u.exp = 0; break; } if (u.exp < req) break; u.exp -= req; r.levels.push(levelUp(st.rng, u)); }
  r.to = u.exp; return r;
}

// ---------------------------------------------------------------- failsafe: required enemies must be hittable
function failsafe(st) {
  const ps = st.units.filter(u => u.team === 'player' && u.hp > 0);
  const phys = ps.filter(u => !WEAPONS[u.weapon].magic && !WEAPONS[u.weapon].heal && !WEAPONS[u.weapon].refresh).map(u => u.str + WEAPONS[u.weapon].mt);
  const mag = ps.filter(u => WEAPONS[u.weapon].magic).map(u => u.mag + WEAPONS[u.weapon].mt);
  const avg = a => a.length ? Math.floor(a.reduce((s, v) => s + v, 0) / a.length) : null;
  const pa = avg(phys), ma = avg(mag);
  for (const e of st.units) {
    if (e.team !== 'enemy' || e.hp <= 0) continue;
    const needed = st.goal === 'rout' || e.boss;
    if (!needed) continue;
    const td = tDef(st, e, e.x, e.y), tr = tRes(st, e, e.x, e.y);
    if (pa !== null && e.def + td > pa - 1) e.def = Math.max(0, pa - 1 - td);
    if (ma !== null && e.res + tr > ma - 1) e.res = Math.max(0, ma - 1 - tr);
  }
}

// ---------------------------------------------------------------- AI
function threatAt(st, u, x, y) {           // how many foes could attack tile (x,y) next phase
  let n = 0;
  for (const e of st.units) { if (e.hp <= 0 || !foes(e, u) || WEAPONS[e.weapon].heal || WEAPONS[e.weapon].refresh) continue;
    const w = WEAPONS[e.weapon], mv = e.ai === 'hold' || e.rooted ? 0 : CLASSES[e.cls].mov;
    if (manhattan(e, { x, y }) <= mv + w.max) n++; }
  return n;
}
// worst-case damage u would take on tile (x,y) next enemy phase from foes able to get there
function danger(st, u, x, y, ignoreId) {
  const ox = u.x, oy = u.y; u.x = x; u.y = y; let d = 0;
  for (const e of st.units) {
    if (e.hp <= 0 || !foes(e, u) || e.id === ignoreId || WEAPONS[e.weapon].heal || WEAPONS[e.weapon].refresh) continue;
    const mv = e.ai === 'hold' || e.rooted ? 0 : CLASSES[e.cls].mov;
    if (manhattan(e, u) > mv + WEAPONS[e.weapon].max) continue;
    const s = stats(st, e, u); d += s.dmg * (s.dbl ? 2 : 1);
  }
  u.x = ox; u.y = oy; return d;
}
function allyNear(st, u, x, y) { let n = 0; for (const o of st.units) if (o !== u && o.hp > 0 && !foes(o, u) && Math.abs(o.x - x) + Math.abs(o.y - y) === 1) n++; return n; }
function planRaid(st, u) {
  const live = (st.villages || []).filter(v => st.map.terr[v] === 0x03 || st.map.terr[v] === 0x05); if (!live.length) return null;
  const v = live.sort((a, b) => (Math.abs(a % W - u.x) + Math.abs(Math.floor(a / W) - u.y)) - (Math.abs(b % W - u.x) + Math.abs(Math.floor(b / W) - u.y)))[0];
  const dist = reach(st, u), fd = field(st, u, v % W, Math.floor(v / W)); let best = [u.x, u.y], bd = fd.get(u.y * W + u.x) ?? 1e9;
  for (const k of dist.keys()) { const o = unitAt(st, k % W, Math.floor(k / W)); if (o && o !== u) continue; const d = fd.get(k); if (d !== undefined && d < bd) { bd = d; best = [k % W, Math.floor(k / W)]; } }
  return { type: bd === 0 ? 'raid' : 'wait', path: pathTo(dist, best[0], best[1]) };
}
function planCarry(st, u) {
  const dist = reach(st, u); let best = [u.x, u.y], bs = 1e9;
  for (const k of dist.keys()) { const x = k % W, y = Math.floor(k / W), o = unitAt(st, x, y); if (o && o !== u) continue; const s = danger(st, u, x, y) * 2 - allyNear(st, u, x, y); if (s < bs) { bs = s; best = [x, y]; } }
  return { type: 'drop', path: pathTo(dist, best[0], best[1]) };
}
// ---------------------------------------------------------------- combat arts (Three Houses, Fortune's Weave): a named attack that spends
// extra weapon uses for more might, hit or crit, or triple damage against one kind of foe; some leave the foe unable to counter.
// The attacker never follows up with an art. Each unit has its own order of arts per weapon type (sword, lance, axe, bow,
// tome): two known, a third at level 10 or promotion, a fourth when promoted at level 10+; the strongest only as 3rd or 4th. The army and named enemies (bosses, captains, rivals, generals) use them, ordinary enemy soldiers do not: the AI takes one when it kills where a plain attack would not, or does clearly more
// expected damage, and only when the weapon has the uses to spare.
// ordinary arts (Casim's caps): +2 to +4 might, at most +15 hit or +10 crit, and only mild extras (poison, breaking the foe,
// healing from the blow, a little avoid, hitting Res). The strong effects (striking twice, halving defence, no counter,
// cannot miss, double vs the wounded, triple vs a kind of foe) belong to the last two relics of each book.
const ARTS = {
  // swords
  wrath_strike: { name: 'Wrath Strike', type: 'sword', mt: 4, cost: 3 }, sword_dance: { name: 'Sword Dance', type: 'sword', mt: 3, avo: 15, cost: 3 },
  venin_edge: { name: 'Venin Edge', type: 'sword', mt: 2, poison: true, cost: 3 }, haze_slice: { name: 'Haze Slice', type: 'sword', mt: 2, hit: 15, cost: 3 },
  soulblade: { name: 'Soulblade', type: 'sword', mt: 3, magical: true, cost: 4 }, rending_cut: { name: 'Rending Cut', type: 'sword', mt: 3, crit: 10, cost: 3 },
  guard_break: { name: 'Guard Break', type: 'sword', mt: 3, hit: 10, breaks: true, cost: 4, late: true }, blood_edge: { name: 'Blood Edge', type: 'sword', mt: 3, drain: true, cost: 4, late: true },
  finesse_blade: { name: 'Finesse Blade', type: 'sword', mt: 4, hit: 15, crit: 10, cost: 4, late: true },
  // lances
  tempest_lance: { name: 'Tempest Lance', type: 'lance', mt: 4, crit: 10, hit: -10, cost: 4 }, frozen_lance: { name: 'Frozen Lance', type: 'lance', mt: 3, hit: 10, magical: true, cost: 3 },
  lance_jab: { name: 'Lance Jab', type: 'lance', mt: 3, breaks: true, cost: 4 }, drain_lance: { name: 'Drain Lance', type: 'lance', mt: 2, drain: true, cost: 4 },
  steady_thrust: { name: 'Steady Thrust', type: 'lance', mt: 2, hit: 15, cost: 3 }, sharp_thrust: { name: 'Sharp Thrust', type: 'lance', mt: 3, crit: 10, cost: 3 },
  shatter_strike: { name: 'Shatter Strike', type: 'lance', mt: 4, crit: 10, hit: 10, cost: 4, late: true }, iron_wall: { name: 'Iron Wall', type: 'lance', mt: 3, avo: 15, breaks: true, cost: 4, late: true },
  vengeful_thrust: { name: 'Vengeful Thrust', type: 'lance', mt: 4, hit: 10, drain: true, cost: 4, late: true },
  // axes
  smash: { name: 'Smash', type: 'axe', mt: 3, crit: 10, cost: 3 }, wild_abandon: { name: 'Wild Abandon', type: 'axe', mt: 4, crit: 10, hit: -15, cost: 4 },
  spike: { name: 'Spike', type: 'axe', mt: 2, breaks: true, cost: 3 }, focused_strike: { name: 'Focused Strike', type: 'axe', mt: 2, hit: 15, cost: 3 },
  cleaving_chop: { name: 'Cleaving Chop', type: 'axe', mt: 3, hit: 10, cost: 3 }, venom_axe: { name: 'Venom Axe', type: 'axe', mt: 2, poison: true, cost: 3 },
  bloodlust: { name: 'Bloodlust', type: 'axe', mt: 3, drain: true, cost: 4, late: true }, war_cry: { name: 'War Cry', type: 'axe', mt: 4, hit: 10, breaks: true, cost: 4, late: true },
  helm_crush: { name: 'Helm Crush', type: 'axe', mt: 4, crit: 10, hit: 10, cost: 4, late: true },
  // bows
  curved_shot: { name: 'Curved Shot', type: 'bow', mt: 2, hit: 15, cost: 3 }, heavy_draw: { name: 'Heavy Draw', type: 'bow', mt: 4, hit: -10, cost: 3 },
  pinning_shot: { name: 'Pinning Shot', type: 'bow', mt: 2, breaks: true, cost: 3 }, venom_shot: { name: 'Venom Shot', type: 'bow', mt: 2, poison: true, cost: 3 },
  schism_shot: { name: 'Schism Shot', type: 'bow', mt: 2, crit: 10, cost: 3 }, quick_shot: { name: 'Quick Shot', type: 'bow', mt: 3, hit: 10, cost: 3 },
  ward_arrow: { name: 'Ward Arrow', type: 'bow', mt: 3, avo: 15, cost: 4, late: true }, drain_arrow: { name: 'Drain Arrow', type: 'bow', mt: 3, drain: true, cost: 4, late: true },
  true_shot: { name: 'True Shot', type: 'bow', mt: 4, hit: 15, crit: 10, cost: 4, late: true },
  // tomes (any attack magic)
  focus: { name: 'Focus', type: 'tome', mt: 2, hit: 15, cost: 3 }, overcharge: { name: 'Overcharge', type: 'tome', mt: 4, crit: 10, hit: -10, cost: 4 },
  siphon: { name: 'Siphon', type: 'tome', mt: 2, drain: true, cost: 4 }, hex: { name: 'Hex', type: 'tome', mt: 2, breaks: true, cost: 4 },
  spellweave: { name: 'Spellweave', type: 'tome', mt: 4, hit: 15, crit: 10, cost: 4, late: true }, blight: { name: 'Blight', type: 'tome', mt: 3, poison: true, breaks: true, cost: 4, late: true },
};
// what an art does, in plain words, for the unit's items page and Command mode
function artText(art) { const p = [];
  if (art.mt) p.push((art.mt > 0 ? '+' : '') + art.mt + ' might'); if (art.hit) p.push((art.hit > 0 ? '+' : '') + art.hit + ' hit'); if (art.crit) p.push('+' + art.crit + ' crit');
  if (art.eff) p.push('triple vs ' + { flier: 'fliers', cavalry: 'cavalry', armor: 'armour', beast: 'monsters' }[art.eff]); if (art.magical) p.push('hits Res');
  if (art.noCounter) p.push('no counter'); if (art.avo) p.push('+' + art.avo + ' avoid'); if (art.poison) p.push('poisons'); if (art.breaks) p.push('breaks the foe');
  if (art.sure) p.push('cannot miss'); if (art.drain) p.push('heals half the damage'); if (art.halfDef) p.push('halves defence'); if (art.vsWounded) p.push('double vs the wounded');
  if (art.twice) p.push('strikes twice'); return p.join(', ') + ` (${art.cost} uses)`; }
const artEff = (art, d) => art.eff === 'beast' ? (CAT.dragon(d) || !!(CLASSES[d.cls] && CLASSES[d.cls].monster)) : !!(CAT[art.eff] && CAT[art.eff](d));
function artsFor(u) { const w = WEAPONS[u.weapon]; if (!w || w.heal || w.refresh || w.util || w.type === 'none') return [];
  if (u.team !== 'player' && !(u.boss || u.captain || u.rival || u.genTitle)) return [];
  const t0 = wtype(u.weapon), t = w.magic || ['fire', 'anima', 'light', 'dark', 'thunder', 'wind'].includes(t0) ? 'tome' : t0;
  if (!['sword', 'lance', 'axe', 'bow', 'tome'].includes(t)) return [];
  const promoted = !!(CLASSES[u.cls] && CLASSES[u.cls].promoted), n = 2 + (u.level >= 10 || promoted ? 1 : 0) + (promoted && u.level >= 10 ? 1 : 0);
  u.artOrder = u.artOrder || {}; if (u.artOrder[t] && u.artOrder[t].some(k => !ARTS[k])) delete u.artOrder[t];
  if (!u.artOrder[t]) { let h = 2166136261; for (const ch of String(u.name || '') + ':' + (u.id || 0) + ':' + t) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); const r = RNG(h >>> 0);
    const pool = Object.keys(ARTS).filter(k => ARTS[k].type === t), early = pool.filter(k => !ARTS[k].late), late = pool.filter(k => ARTS[k].late);
    const sh = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = r.int(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const E = sh(early), L = sh(late); u.artOrder[t] = [E[0], E[1], ...sh([E[2], L[0]]), ...sh([E[3], L[1]])].filter(Boolean); }
  const list = u.artOrder[t].slice(0, n); if (u.team === 'player' && !(u.awake > 0) && u._bondS && !u._sArtUsed && ARTS['relic_' + u.relic]) list.push('relic_' + u.relic);
  if (u.awake > 0 && u.relic !== undefined && u.relic !== null && ARTS['relic_' + u.relic]) { list.push('relic_' + u.relic); if (ARTS['relic_' + u.relic + '_b']) list.push('relic_' + u.relic + '_b'); } return list; }
function artUses(u) { const it = (u.items || []).find(x => x.id === u.weapon); return !it ? 0 : it.max === 0 ? 99 : it.uses; }
function chooseArt(st, u, act) {
  const t = st.units.find(o => o.id === act.target); if (!t) return; const at = act.path[act.path.length - 1], uses = artUses(u), plainF = forecast(st, u, t, at[0], at[1]);
  const plainKill = (plainF.A.dbl ? 2 : 1) * plainF.A.dmg >= t.hp, ev = f => f.A.hit / 100 * f.A.dmg * (f.A.dbl ? 2 : 1); let best = null;
  for (const k of artsFor(u)) { const art = ARTS[k]; if (uses < art.cost + 2) continue;          // keep the weapon from breaking on an art
    u.__art = art; const f = forecast(st, u, t, at[0], at[1]); u.__art = null;
    const kills = (art.twice ? 2 : 1) * f.A.dmg >= t.hp && f.A.hit >= 50, gain = ev(f) * (art.twice ? 2 : 1) / (f.A.dbl ? 2 : 1) - ev(plainF) + (art.drain ? Math.min(u.maxhp - u.hp, f.A.dmg / 2) * f.A.hit / 100 : 0) + (art.poison ? 2 : 0);
    const safer = (art.noCounter || art.breaks || (art.avo && f.D && f.D.hit < (plainF.D ? plainF.D.hit : 0))) && plainF.D && plainF.D.dmg > 0;
    const score = (kills && !plainKill ? 100 : 0) + gain + (safer ? plainF.D.dmg * plainF.D.hit / 100 : 0);
    if ((kills && !plainKill) || gain >= Math.max(2, ev(plainF) * 0.25) || safer) if (!best || score > best.score) best = { k, score }; }
  if (best) act.art = best.k;
}
// ---------------------------------------------------------------- relics (Engage's rings, tied to the run's lore): three per book, left
// by the heroes of old the crests are named for. Won from the commander of chapters 5, 15 and 25 of each book; one bonds to the
// lord, the others to the unit that did most that chapter. Once per chapter, with foes in reach, the holder awakens it for three
// turns: two stats rise and the relic's own art (no weapon uses) can be used. Relics stay with the army across books; a fallen
// holder's relic passes to the strongest unit, a child of the holder first.
const RELIC_KINDS = ['Ring', 'Brand', 'Seal', 'Mantle', 'Crown', 'Talisman'];
// a book's first four relics carry mild arts (within the ordinary caps); the last two carry the strong effects
const RELIC_ARTS = [{ tag: 'Emberwake', mt: 3, drain: true }, { tag: 'Stormcall', mt: 3, crit: 10, breaks: true }, { tag: 'Dawnlight', mt: 4, hit: 15 },
  { tag: 'Venomroot', mt: 3, hit: 10, poison: true }, { tag: 'Starshard', mt: 3, crit: 10, magical: true }, { tag: 'Bulwark', mt: 3, avo: 15, breaks: true }];
const RELIC_ARTS_STRONG = [{ tag: 'Starfall', mt: 3, twice: true }, { tag: 'Last Light', mt: 5, noCounter: true, hit: 10 }, { tag: 'Dawnbreak', mt: 5, sure: true, crit: 10 },
  { tag: 'Sundering', mt: 4, halfDef: true }, { tag: 'Reaping', mt: 3, vsWounded: true }, { tag: 'Wyrmbane', mt: 4, eff: 'beast' }, { tag: 'Horsebane', mt: 4, eff: 'cavalry' },
  { tag: 'Skyfall', mt: 4, eff: 'flier' }, { tag: 'Ironbane', mt: 4, eff: 'armor' }];
const RELIC_TIERS = [6, 15, 30];          // kills while awakened to reach legend tiers 1, 2 and 3
// bond ranks from chapters the same unit has held the relic: C, B, A, S. Each rank adds to the relic's stats even while it
// sleeps; B and S raise the holder's growth in them; A brings fear (foes near the awakened holder lose 10 hit); at S the
// relic's art can be used once a chapter without awakening it. After 15 chapters the holder earns a title and the relic
// a second name. A child who inherits starts one rank below the parent.
const BOND_AT = [3, 8, 15, 25], BOND_NAME = ['', 'C', 'B', 'A', 'S'];
const bondRank = r => { let k = 0; while (k < BOND_AT.length && (r.held || 0) >= BOND_AT[k]) k++; return k; };
const BOND_PASSIVE = [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]];
const RELIC_TITLE = { Ring: 'Ringbearer', Brand: 'Brandbearer', Seal: 'Sealkeeper', Mantle: 'Mantlebearer', Crown: 'Crownwarden', Talisman: 'Talismankeeper' };
const RELIC_ALIAS = ['Oath', 'Vow', 'Watch', 'Promise', 'Pledge', 'Vigil'];
const RELIC_STATS = [['str', 'def'], ['mag', 'res'], ['spd', 'skl'], ['str', 'spd'], ['mag', 'skl'], ['def', 'res']];
const STAT_NAME = { str: 'Str', mag: 'Mag', skl: 'Skl', spd: 'Spd', def: 'Def', res: 'Res', lck: 'Lck' };
const relicArtKey = r => 'relic_' + r.id;
function registerRelics(camp) { for (const r of (camp && camp.relics) || []) { const a = Object.assign({}, r.art); delete a.tag; ARTS[relicArtKey(r)] = Object.assign({ name: r.artName, type: 'any', cost: 0, relic: true }, a);
    if (r.art2) { const b = Object.assign({}, r.art2); delete b.tag; ARTS[relicArtKey(r) + '_b'] = Object.assign({ name: r.art2Name, type: 'any', cost: 0, relic: true }, b); } } }
// half the time the relic belongs to the hero of a crest someone in the army carries, so resonance has a real chance
function makeRelic(camp, rng, strong) { const cs = crestsOf(camp), i = (camp.relics || []).length, carried = [...new Set((camp.army || []).map(u => crestInfo(camp, u)).filter(Boolean).map(c => c.name))].filter(nm => !(camp.relics || []).some(r => r.hero === nm)),
  hero = carried.length && rng.chance(50) ? rng.pick(carried) : cs[(i * 5 + 3) % cs.length].name, pool = strong ? RELIC_ARTS_STRONG : RELIC_ARTS, a = pool[rng.int(0, pool.length - 1)], sb = RELIC_STATS[rng.int(0, RELIC_STATS.length - 1)];
  return { id: i, name: `${hero}'s ${RELIC_KINDS[rng.int(0, RELIC_KINDS.length - 1)]}`, hero, art: Object.assign({}, a), artName: `${hero}'s ${a.tag}`, boost: { [sb[0]]: 4, [sb[1]]: 3 }, holder: null, holderName: '', strong: !!strong, kills: 0, tier: 0, deeds: [] }; }
// a relic's history: three whole sentences (where it came from, one deed, how it reached this battle), each template a
// complete sentence with its own punctuation, filled from the book's premise and the chapter's commander and place
const RELIC_ORIGIN = ['{hero} carried it through {war}, from the first battle to the last.', 'The smiths of {home} made it for {hero} in the second year of {war}.',
  '{order} gave it to {hero} on the day {hero} swore the order\'s oath.', '{hero} found it in a flooded shrine and wore it for the rest of {war}.',
  'It was cut from the same stone as the old gates of {home}, and {hero} was the first to wear it.', '{hero} won it in a wager with a river captain and never gave it back.',
  'A dying priest of {order} pressed it into the hands of {hero}.', 'No one remembers who made it, only that {hero} wore it at every battle of {war}.'];
const RELIC_DEED = ['Near the end of {war}, {hero} held a mountain pass with it for {n} days.', '{hero} wore it the night {order} broke the siege of {home}.',
  'Soldiers who fought beside {hero} swore it turned aside a blade meant for the king.', '{hero} lent it once, to a squire who came home from {war} a captain.',
  'When {order} lost its banner, {hero} carried this into battle in its place.', '{hero} wore it into the burning chapel of {home} and carried out the last of the wounded.',
  'Enemy captains in {war} learned to fall back when they saw it on the field.', '{hero} broke a cavalry charge with it at a ford no wider than a cart.'];
const RELIC_LOSS = ['After {hero} died it passed through many hands, and {boss} wore it at {place}.', 'It lay sealed in a vault in {home} for {years} years, until {boss} broke the seal.',
  '{boss} took it from a temple near {place} and carried it into this battle.', 'Its last keeper sold it to {boss}, who lost it at {place}.',
  'A thief took it from the tomb of {hero}, and in time it came to {boss}.', 'For years it hung on a tavern wall in {place}, until {boss} knew it for what it was.'];
// the war, the order and the home are each named at most once per history, so no two sentences repeat the same name
function relicLore(r, f, rng) { const fill = t => t.replace(/\{(\w+)\}/g, (m, k) => f[k] !== undefined ? String(f[k]) : m).replace(/(^|[.!?] )([a-z])/g, (m, a, c) => a + c.toUpperCase());
  f = Object.assign({ hero: r.hero, n: rng.pick(['three', 'four', 'five', 'six', 'seven', 'nine', 'eleven']), years: rng.pick(['sixty', 'eighty', 'a hundred', 'two hundred', 'three hundred']) }, f);
  const used = new Set(), slots = t => (t.match(/\{(war|order|home)\}/g) || []).map(x => x.slice(1, -1));
  const seen = f.seen || new Set();             // templates this run's earlier relics used, avoided while others remain
  const pickFresh = pool => { let ok = pool.filter(t => !slots(t).some(k => used.has(k))); if (!ok.length) ok = pool; const fresh = ok.filter(t => !seen.has(t)), t = rng.pick(fresh.length ? fresh : ok); slots(t).forEach(k => used.add(k)); seen.add(t); return t; };
  return [pickFresh(RELIC_ORIGIN), pickFresh(RELIC_DEED), pickFresh(RELIC_LOSS)].map(fill).join(' '); }
// ---------------------------------------------------------------- legendary beasts (Casim: 2x2, one per book in a set chapter, chapter 17).
// It fills four squares, holds its lair (never moves), has three health bars (emptying one refills it), a barrier that halves
// damage until four hits break it, and a sweep that catches every foe beside its body for half damage. Named and given a
// history from the book's war, order and home.
const BEAST_NAMES = ['the Ash Wyrm', 'the Hollow King', 'the Stone Mother', 'the Drowned Beast', 'the Old Hunger', 'the Grave Warden', 'the Thousand-Eyed', 'the Ember Tyrant'];
const BEAST_ORIGIN = ['{order} chained it beneath {place} at the end of {war}.', 'It slept under {place} through all of {war}, and nobody living remembers who woke it.', 'The scholars of {home} wrote that it was the last of its kind long before {war}.'];
const BEAST_NOW = ['The chains broke this spring, and {home} has lost {n} villages since.', 'Herders around {place} stopped counting their losses after the {nth} night.', 'Every army sent against it since {war} has come back smaller, or not at all.'];
const WILD_KINDS = [
  { key: 'wolf', name: 'Dire Wolf', cls: /doog|gwyll|hound|dog/i, line: 'Wolves prowl this ground. A pack of {n} will fall on anyone who comes near, friend or foe.' },
  { key: 'bear', name: 'Great Bear', cls: /cyclops/i, line: 'Bears have made this place their own; {n} of them guard it against everyone.' },
  { key: 'spirit', name: 'Restless Spirit', cls: /mogall|wight|revenant|bonewalker/i, line: 'Restless spirits drift over the field, {n} of them, and they hate every living thing alike.' },
  { key: 'demon', name: 'Lesser Demon', cls: /gargoyle|bael|maelduin/i, line: 'Demons have crawled up through the old wounds in the earth here, {n} of them, hungry for anyone.' },
  { key: 'golem', name: 'Stone Golem', cls: /entomb|gorgon|golem/i, line: 'Old stone guardians wake as the armies arrive, {n} of them, and they do not choose sides.' }];
function makeBeast(camp, st, rng, boss) { const S = camp.story || {}, nm = rng.pick(BEAST_NAMES);
  const pool = POOL && (POOL.monstersHi && POOL.monstersHi.length ? POOL.monstersHi : POOL.monsters); const cls = pool && pool.length ? rng.pick(pool) : boss.cls;
  const b = makeUnit(rng, cls, 'enemy', boss.level + 2); b.name = nm.replace(/^the /, 'The '); b.boss = true; b.beast = true; b.big = true; b.rooted = true; b.ai = 'hold'; b.sweep = true;
  b.bars = 3; b.maxBars = 3; b.barrier = 4; for (const k of ['str', 'mag', 'def', 'res']) b[k] += 4; b.maxhp += 10; b.hp = b.maxhp;
  const f = { war: S.war || 'the old war', order: S.order || 'the old order', home: S.home || camp.realm, place: st.place, n: rng.pick(['three', 'four', 'six', 'seven']), nth: rng.pick(['third', 'fifth', 'ninth']) };
  const fill = t => t.replace(/\{(\w+)\}/g, (m, k) => f[k] ?? m).replace(/^([a-z])/, c => c.toUpperCase());
  b.lore = fill(rng.pick(BEAST_ORIGIN)) + ' ' + fill(rng.pick(BEAST_NOW)); return b; }
// a free 2x2 lair near (cx, cy): all four squares open to the beast and empty
function beastSpot(st, b, cx, cy) { let best = null, bd = 1e9; const W = st.map.w, H = st.map.h;
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) { let ok = true; for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const q = unitAt(st, x + dx, y + dy); if ((q && q !== b) || moveCost(st, b, x + dx, y + dy) >= 99) { ok = false; break; } }
    if (!ok) continue; const d = Math.abs(x - cx) + Math.abs(y - cy); if (d < bd) { bd = d; best = [x, y]; } }
  return best; }

// the next part of a multi-part battle: a new map for the same chapter; survivors keep their HP (plus a 20% rest); those who
// fell stay fallen and are carried into the new state off the map, so endChapter counts them once the whole battle is done
function nextPart(camp, st) { if (!st.part || st.part.k >= st.part.of) return null;
  const fallen = st.units.filter(u => u.team === 'player' && u.hp <= 0 && camp.army.includes(u)), prior = (st.priorParts || []).concat([{ k: st.part.k, turns: st.turn, place: st.place }]);
  const st2 = newChapter(camp, { part: { k: st.part.k + 1, of: st.part.of } });
  for (const d of fallen) if (!st2.units.includes(d)) { d.x = -1; d.y = -1; st2.units.push(d); }
  st2.priorParts = prior; st2.fate = st.fate; return st2; }

function relicOf(camp, u) { return u && u.relic !== undefined && u.relic !== null && camp && camp.relics ? camp.relics.find(r => r.id === u.relic) : null; }
function relicText(r) { const art = ARTS[relicArtKey(r)] || Object.assign({ name: r.artName, cost: 0 }, r.art);
  return `awakens: ${Object.entries(r.boost).map(([k, v]) => '+' + (v + ((r.tier || 0) >= 2 ? 1 : 0)) + ' ' + STAT_NAME[k]).join(', ')}; ${r.artName} (${artText(art).replace(/ \(0 uses\)$/, '')})${r.art2 ? `; ${r.art2Name} (${artText(ARTS[relicArtKey(r) + '_b']).replace(/ \(0 uses\)$/, '')})` : ''}`; }
function resonant(camp, u, r) { const c = crestInfo(camp, u); return !!(c && r && c.name === r.hero); }
// a relic's legend: kills made while it is awake raise its tier; each tier, and each commander felled with it, adds a line
const RELIC_DEED_TIER = ['In the battle at {place}, {holder} fought with it until the enemy line broke.', 'After the battle at {place}, the army began to tell stories about {holder} and the {kind}.',
  '{holder} has now felled {k} foes with it, more than {hero} is said to have managed in a lifetime.'];
const RELIC_DEED_BOSS = ['{holder} awakened it in the battle at {place} and struck down {boss}.', '{holder} carried it into the fight at {place}, and {boss} did not leave the field.'];
function relicDeed(r, tmpl, f) { if (f.place && !(r.places || []).includes(f.place)) (r.places = r.places || []).push(f.place); const t = tmpl.replace(/\{(\w+)\}/g, (m, k) => f[k] !== undefined ? String(f[k]) : m).replace(/^([a-z])/, c => c.toUpperCase()); (r.deeds = r.deeds || []).push(t); return t; }
function relicKill(st, u, victim) { const camp = st._camp, r = relicOf(camp, u); if (!r || r.owner === 'enemy' || u.team !== 'player' || !(u.awake > 0)) return null;
  r.kills = (r.kills || 0) + 1; const f = { holder: u.name, place: st.place || 'the field', n: st.chapter, kind: r.name.split("'s ")[1] ? r.name.split("'s ")[1].toLowerCase() : 'relic', hero: r.hero, k: r.kills, boss: victim.name }; const out = [];
  if (victim.boss || victim.genTitle) out.push(relicDeed(r, RELIC_DEED_BOSS[(r.deeds || []).length % RELIC_DEED_BOSS.length], f));
  while ((r.tier || 0) < RELIC_TIERS.length && r.kills >= RELIC_TIERS[r.tier || 0]) { r.tier = (r.tier || 0) + 1; out.push(relicDeed(r, RELIC_DEED_TIER[r.tier - 1], f));
    if (r.tier === 2 && !r.art2) { const pool = r.strong ? RELIC_ARTS_STRONG : RELIC_ARTS, a = pool.find(x => x.tag !== r.art.tag && !Object.keys(x).some(k => k !== 'tag' && k !== 'mt' && r.art[k])) || pool[0]; r.art2 = Object.assign({}, a); r.art2Name = `${r.hero}'s ${a.tag}`; registerRelics(camp); } }
  return out; }
function relicKind(r) { return (r.name.split("'s ")[1] || 'Relic'); }
function relicFull(r) { return r.alias ? `${r.name}, called ${r.alias}` : r.name; }
function bondRelic(camp, r, u, heirloom) { for (const o of camp.army) if (o.relic === r.id) o.relic = null; const prev = bondRank(r);
  u.relic = r.id; r.holder = u.id; r.holderName = u.name; r.held = heirloom && prev > 1 ? BOND_AT[prev - 2] : 0; }

// ---------------------------------------------------------------- battalions (Three Houses): a named company that rides with a unit. Its
// bonuses hold while it has endurance (taking hits wears it down); its gambit can be used once a chapter (twice from level 3)
// and cannot be countered. Attack gambits strike the target with extra might, and splash half that damage onto foes beside it
// (splash never finishes a foe). Support gambits heal or steady allies nearby until the army's next turn. The armory hires
// and resupplies them between chapters; commanders field them too.
// 21 companies in eight roles; a unit gets one that fits its role (bow users ranged, healers healing companies, and so on),
// and which of the role's companies varies from unit to unit
const BATTALIONS = {
  // foot soldiers
  pikemen: { kind: 'Pikemen', role: 'foot', bonus: { def: 3 }, hit: 5, gambit: { name: 'Spear Wall', type: 'assault', mt: 5 }, price: 800 },
  halberdiers: { kind: 'Halberdiers', role: 'foot', bonus: { str: 1, def: 2 }, gambit: { name: 'Halberd Sweep', type: 'assault', mt: 6 }, price: 900 },
  blades: { kind: 'Blade Company', role: 'foot', bonus: { skl: 2 }, hit: 5, gambit: { name: 'Blade Flurry', type: 'assault', mt: 4, hit: 10 }, price: 850 },
  hounds: { kind: 'Hound Pack', role: 'foot', bonus: { spd: 1 }, avo: 5, gambit: { name: 'Run Them Down', type: 'assault', mt: 4, breaks: true }, price: 800 },
  // ranged
  archers: { kind: 'Archers', role: 'ranged', bonus: { str: 2 }, hit: 5, gambit: { name: 'Arrow Volley', type: 'assault', mt: 4 }, price: 900 },
  crossbows: { kind: 'Crossbowmen', role: 'ranged', bonus: {}, hit: 10, gambit: { name: 'Bolt Storm', type: 'assault', mt: 5 }, price: 950 },
  slingers: { kind: 'Slingers', role: 'ranged', bonus: { spd: 1 }, avo: 5, gambit: { name: 'Stone Hail', type: 'assault', mt: 3, breaks: true }, price: 700 },
  // cavalry
  cavaliers: { kind: 'Cavaliers', role: 'cavalry', bonus: { str: 2 }, avo: 5, gambit: { name: 'Charge', type: 'assault', mt: 6 }, price: 1000 },
  lancers: { kind: 'Lancers', role: 'cavalry', bonus: { str: 1, def: 2 }, gambit: { name: 'Lance Charge', type: 'assault', mt: 5, hit: 10 }, price: 1000 },
  // fliers
  pegasus: { kind: 'Pegasus Wing', role: 'flier', bonus: { spd: 2 }, avo: 5, gambit: { name: 'Wind Veil', type: 'buff', buff: { avo: 10, spd: 2 }, radius: 2 }, price: 1000 },
  wyverns: { kind: 'Wyvern Riders', role: 'flier', bonus: { str: 2, def: 1 }, gambit: { name: 'Dive', type: 'assault', mt: 6 }, price: 1100 },
  // magic
  mages: { kind: 'Mage Circle', role: 'magic', bonus: { mag: 2, res: 2 }, gambit: { name: 'Firestorm', type: 'assault', mt: 5, magical: true }, price: 1000 },
  storm_choir: { kind: 'Storm Choir', role: 'magic', bonus: { mag: 3 }, gambit: { name: 'Thunderclap', type: 'assault', mt: 4, magical: true, breaks: true }, price: 1050 },
  // healers
  monks: { kind: 'Monks', role: 'healer', bonus: { res: 2 }, avo: 5, gambit: { name: 'Mercy', type: 'heal', amount: 10, radius: 2 }, price: 900 },
  priestesses: { kind: 'Priestesses', role: 'healer', bonus: { res: 3 }, gambit: { name: 'Blessing', type: 'heal', amount: 15, radius: 1 }, price: 950 },
  // armour
  shields: { kind: 'Shieldbearers', role: 'armor', bonus: { def: 4 }, gambit: { name: 'Shield Line', type: 'buff', buff: { def: 4 }, radius: 1 }, price: 800 },
  royal_guard: { kind: 'Royal Guard', role: 'armor', bonus: { def: 2, res: 2 }, gambit: { name: 'Oath of Iron', type: 'buff', buff: { def: 3, res: 3 }, radius: 1 }, price: 1050 },
  // support
  scouts: { kind: 'Scouts', role: 'support', bonus: {}, avo: 10, gambit: { name: 'Smoke', type: 'buff', buff: { avo: 15 }, radius: 2 }, price: 700 },
  drummers: { kind: 'Drummers', role: 'support', bonus: { spd: 2 }, gambit: { name: 'War Drums', type: 'buff', buff: { str: 2, mag: 2 }, radius: 2 }, price: 800 },
  bards: { kind: 'Bards', role: 'support', bonus: { lck: 3 }, hit: 5, gambit: { name: 'Battle Hymn', type: 'buff', buff: { skl: 3, hit: 10 }, radius: 2 }, price: 850 },
  quartermasters: { kind: 'Quartermasters', role: 'support', bonus: { def: 1, res: 1 }, gambit: { name: 'Field Rations', type: 'heal', amount: 8, radius: 2 }, price: 750 },
};
const BAT_PRICE = Object.fromEntries(Object.entries(BATTALIONS).map(([k, b]) => [k, Math.round(b.price * 0.6 / 10) * 10])), BAT_ENDURE = 20;   // 420-660 gold, so most of the army can afford one
function batKindFor(u) { const t = wtype(CLASSES[u.cls].wpn), w = WEAPONS[CLASSES[u.cls].wpn];
  const role = t === 'bow' ? 'ranged' : t === 'staff' ? 'healer' : w && w.magic ? 'magic' : CLASSES[u.cls].flier ? 'flier' : skillsOf(u).canto ? 'cavalry' : CAT.armor(u) ? 'armor' : (u.id || 0) % 3 === 0 ? 'support' : 'foot';
  const pool = Object.keys(BATTALIONS).filter(k => BATTALIONS[k].role === role); return pool[((u.id || 0) * 7 + (u.name || '').length) % pool.length]; }
function makeBattalion(key, place) { return { key, name: `the ${place} ${BATTALIONS[key].kind}`, endure: BAT_ENDURE, max: BAT_ENDURE, level: 1, exp: 0 }; }
function batText(b) { const B = BATTALIONS[b.key], g = B.gambit, p = Object.entries(B.bonus).map(([k, v]) => `+${v} ${STAT_NAME[k]}`); if (B.hit) p.push(`+${B.hit} hit`); if (B.avo) p.push(`+${B.avo} avoid`);
  const gd = g.type === 'assault' ? `+${g.mt} might${g.hit ? `, +${g.hit} hit` : ''}${g.magical ? ', hits Res' : ''}${g.breaks ? ', breaks the foe' : ''}, no counter, splash` : g.type === 'heal' ? `heals allies within ${g.radius} for ${g.amount}` : `${Object.entries(g.buff).map(([k, v]) => `+${v} ${k === 'avo' ? 'avoid' : k === 'hit' ? 'hit' : STAT_NAME[k]}`).join(', ')} to allies within ${g.radius}`;
  return `${p.join(', ')}; ${g.name} (${gd})`; }
const batLive = u => !!(u && u.bat && u.bat.endure > 0 && BATTALIONS[u.bat.key]);
const gambitUses = b => b.level >= 3 ? 2 : 1;
function gambitArt(u) { const g = BATTALIONS[u.bat.key].gambit; return { name: g.name, type: 'any', mt: g.mt, hit: g.hit || 0, breaks: !!g.breaks, noCounter: true, cost: 0, magical: !!g.magical, gambit: true }; }
// the AI: an attack gambit when its blow plus splash clearly beats the plain attack; a support gambit when it helps several allies
function chooseGambit(st, u, a) {
  if (!batLive(u) || !(u._gambits > 0)) return a; const g = BATTALIONS[u.bat.key].gambit, end = a.path[a.path.length - 1];
  if (g.type === 'assault' && a.type === 'attack') { const t = st.units.find(o => o.id === a.target); if (!t) return a;
    const plain = forecast(st, u, t, end[0], end[1]); u.__art = gambitArt(u); const gf = forecast(st, u, t, end[0], end[1]); u.__art = null;
    const splash = st.units.filter(o => o.hp > 1 && o !== t && o.x >= 0 && foes(u, o) && Math.abs(o.x - t.x) + Math.abs(o.y - t.y) === 1).length;
    const evP = plain.A.hit / 100 * plain.A.dmg * (plain.A.dbl ? 2 : 1) - (plain.D ? plain.D.hit / 100 * plain.D.dmg * 0.5 : 0), evG = gf.A.hit / 100 * (gf.A.dmg + splash * Math.floor(gf.A.dmg / 2));
    if (evG >= Math.max(3, evP * 1.25) || (gf.A.dmg >= t.hp && plain.A.dmg * (plain.A.dbl ? 2 : 1) < t.hp)) return Object.assign({}, a, { gambit: true, art: null }); return a; }
  if (g.type !== 'assault' && (a.type === 'wait' || (g.type === 'heal' && a.type === 'heal'))) { const near = st.units.filter(o => o.hp > 0 && o.x >= 0 && o.team === u.team && Math.abs(o.x - end[0]) + Math.abs(o.y - end[1]) <= g.radius);
    const threat = st.units.some(o => o.hp > 0 && o.x >= 0 && foes(u, o) && Math.abs(o.x - end[0]) + Math.abs(o.y - end[1]) <= 7);
    if (g.type === 'heal') { const need = near.reduce((n, o) => n + Math.min(g.amount, o.maxhp - o.hp), 0); if (need >= 15 && near.filter(o => o.hp < o.maxhp).length >= 2) return { type: 'wait', path: a.path, gambit: true }; }
    else if (threat && near.length >= (g.radius <= 1 ? 2 : 3)) return Object.assign({}, a, { gambit: true }); }
  return a; }

// walkable for a foot soldier by the ROM's own movement table (FE8 Mercenary, class 0x0F); doors count as open
function footWalk(t) { if (t === 0x1E) return true; const c = ROMD && ROMD.classes && ROMD.classes[0x0F] && ROMD.classes[0x0F].mov ? ROMD.classes[0x0F].mov[t] : undefined; return c !== undefined && c !== 255; }
// the most common tile of a given terrain across every real map of this map's tileset (null if the tileset has none)
function tileFor(entry, terrWanted) { if (!entry || !entry.cells || !ROMD || !ROMD.maps) return null; const key = MapGen.keyOf(entry), count = new Map();
  for (const m of ROMD.maps) { if (!m.cells || m.src === 'gen' || MapGen.keyOf(m) !== key) continue; for (let i = 0; i < m.cells.length; i++) if (m.terr[i] === terrWanted) count.set(m.cells[i], (count.get(m.cells[i]) || 0) + 1); }
  let best = null, bc = 0; for (const [tl, c] of count) if (c > bc) { bc = c; best = tl; } return best; }
// ---------------------------------------------------------------- interior generator (Casim chose B: grown tile by tile
// from castle tilesets; A, whole rooms cut from real maps, if B does not look right). A plan of rooms joined by two-wide
// corridors, walls elsewhere; then every square is filled with a tile of the right kind (wall or floor) that real castle
// maps show fitting beside the tiles already placed to its left and above, preferring tiles that complete a 2x2 pattern
// seen in real maps; then repair passes; the best of several attempts (fewest pairings never seen in a real map) is kept.
const IntGen = (() => {
  const models = new Map(), WALLS = new Set([0x1A, 0x3F, 0x00, 0x1B]);
  const isIndoorMap = m => m.terr.filter(t => t === 0x01 || t === 0x0C || t === 0x02).length < m.terr.length * 0.15;
  function model(key) { if (models.has(key)) return models.get(key);
    const maps = (ROMD && ROMD.maps || []).filter(m => m.cells && m.ids && m.src !== 'gen' && !m.ds && MapGen.keyOf(m) === key && isIndoorMap(m)); if (!maps.length) { models.set(key, null); return null; }
    const freq = new Map(), terr = new Map(), right = new Map(), down = new Map(), quad = new Map(); const add = (M, a, b) => { let r = M.get(a); if (!r) M.set(a, r = new Map()); r.set(b, (r.get(b) || 0) + 1); };
    for (const m of maps) for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const i = y * m.w + x, tl = m.cells[i]; freq.set(tl, (freq.get(tl) || 0) + 1); terr.set(tl, m.terr[i]);
      if (x + 1 < m.w) add(right, tl, m.cells[i + 1]); if (y + 1 < m.h) add(down, tl, m.cells[i + m.w]); if (x && y) { const k = m.cells[i - 1] + ',' + m.cells[i - m.w] + ',' + m.cells[i - m.w - 1]; add(quad, k, tl); } }
    // plain floor: the tiles that make up most of the open floor (no stairs, chests, doors or thrones in the fill)
    const floorT = [...freq.entries()].filter(([tl]) => terr.get(tl) === 0x17).sort((a, b) => b[1] - a[1]);
    const md = { key, maps, freq, terr, right, down, quad, game: maps[0].game, ids: maps[0].ids, cls: tl => WALLS.has(terr.get(tl)) ? 'wall' : terr.get(tl) === 0x17 ? 'floor' : 'other', floorT: new Set(floorT.slice(0, 12).map(([tl]) => tl)) };
    models.set(key, md); return md; }
  // rooms on a grid of cells, joined by a spanning tree of two-wide corridors plus a loop or two
  function plan(rng, w, h) { const want = new Array(w * h).fill('wall'), rooms = [];
    for (let t = 0; t < 200 && rooms.length < 7; t++) { const rw = rng.int(4, 8), rh = rng.int(3, 6), x = rng.int(1, w - rw - 1), y = rng.int(2, h - rh - 1);
      if (rooms.some(r => x < r.x + r.w + 2 && x + rw + 2 > r.x && y < r.y + r.h + 3 && y + rh + 3 > r.y)) continue; rooms.push({ x, y, w: rw, h: rh }); }
    for (const r of rooms) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) want[y * w + x] = 'floor';
    const cen = r => [r.x + (r.w >> 1), r.y + (r.h >> 1)], joined = [0], links = [];
    while (joined.length < rooms.length) { let best = null; for (const a of joined) for (let b = 0; b < rooms.length; b++) { if (joined.includes(b)) continue; const [ax, ay] = cen(rooms[a]), [bx, by] = cen(rooms[b]), d = Math.abs(ax - bx) + Math.abs(ay - by); if (!best || d < best[2]) best = [a, b, d]; } joined.push(best[1]); links.push(best); }
    if (rooms.length > 3) links.push([0, rooms.length - 1, 0]);
    const dig = (x, y) => { for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const xx = x + dx, yy = y + dy; if (xx > 0 && yy > 1 && xx < w - 1 && yy < h - 1) want[yy * w + xx] = 'floor'; } };
    for (const [a, b] of links) { const [ax, ay] = cen(rooms[a]), [bx, by] = cen(rooms[b]); let x = ax, y = ay; const hFirst = rng.chance(50);
      if (hFirst) { while (x !== bx) { dig(x, y); x += Math.sign(bx - x); } while (y !== by) { dig(x, y); y += Math.sign(by - y); } } else { while (y !== by) { dig(x, y); y += Math.sign(by - y); } while (x !== bx) { dig(x, y); x += Math.sign(bx - x); } } dig(x, y); }
    return { want, rooms }; }
  const pickW = (rng, cand) => { let tot = 0; for (const [, wg] of cand) tot += wg; let r = rng.int(0, 1e6) / 1e6 * tot; for (const [tl, wg] of cand) { r -= wg; if (r <= 0) return tl; } return cand[cand.length - 1][0]; };
  function fill(rng, md, w, h, want) { const cells = new Array(w * h).fill(-1), fits = (a, M, b) => { const r = M.get(a); return !!(r && r.has(b)); };
    const ok = (tl, i) => { const c = md.cls(tl); return want[i] === 'wall' ? c === 'wall' : c === 'floor' && md.floorT.has(tl); };
    const all = [...md.freq.keys()];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x, L = x ? cells[i - 1] : -1, U = y ? cells[i - w] : -1, fromL = L >= 0 ? md.right.get(L) : null, fromU = U >= 0 ? md.down.get(U) : null, Q = x && y ? md.quad.get(L + ',' + U + ',' + cells[i - w - 1]) : null; let cand = [];
      if (fromL && fromU) for (const [tl, c] of fromL) if (fromU.has(tl) && ok(tl, i)) cand.push([tl, Math.sqrt(c * fromU.get(tl)) * (Q && Q.has(tl) ? 6 : 1)]);
      if (!cand.length && (fromL || fromU)) for (const [tl, c] of (fromL || fromU)) if (ok(tl, i)) cand.push([tl, c]);
      if (!cand.length) for (const tl of all) if (ok(tl, i)) cand.push([tl, Math.sqrt(md.freq.get(tl))]);
      cells[i] = cand.length ? pickW(rng, cand) : all[0]; }
    const bad = i => { const x = i % w, y = (i / w) | 0, tl = cells[i]; let b = 0; if (x && !fits(cells[i - 1], md.right, tl)) b++; if (x + 1 < w && !fits(tl, md.right, cells[i + 1])) b++; if (y && !fits(cells[i - w], md.down, tl)) b++; if (y + 1 < h && !fits(tl, md.down, cells[i + w])) b++; return b; };
    for (let pass = 0; pass < 10; pass++) { let changed = 0;
      for (let i = 0; i < w * h; i++) { if (!bad(i)) continue; const keep = cells[i]; let best = keep, bb = bad(i); const x = i % w, y = (i / w) | 0, pool = new Set();
        for (const [nb, M] of [[x ? cells[i - 1] : -1, md.right], [y ? cells[i - w] : -1, md.down]]) if (nb >= 0) for (const tl of (M.get(nb) || new Map()).keys()) if (ok(tl, i)) pool.add(tl);
        for (const tl of pool) { cells[i] = tl; const b = bad(i); if (b < bb) { bb = b; best = tl; } } cells[i] = best; if (best !== keep) changed++; } if (!changed) break; }
    let pairs = 0, unseen = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (x + 1 < w) { pairs++; if (!fits(cells[i], md.right, cells[i + 1])) unseen++; } if (y + 1 < h) { pairs++; if (!fits(cells[i], md.down, cells[i + w])) unseen++; } }
    return { cells, terr: cells.map(tl => md.terr.get(tl)), unseen: unseen / pairs }; }
  function generate(rng, key, w, h, tries) { const md = model(key); if (!md) return null; let best = null;
    for (let t = 0; t < (tries || 4); t++) { const P = plan(rng, w, h); if (P.rooms.length < 3) continue; const r = fill(rng, md, w, h, P.want); if (!best || r.unseen < best.unseen) best = Object.assign(r, { rooms: P.rooms }); }
    return best && { src: 'gen', game: md.game, ids: md.ids, w, h, cells: best.cells, terr: best.terr, unseen: best.unseen, rooms: best.rooms.length, name: '', credit: `Generated from ${md.maps.length} castle map${md.maps.length > 1 ? 's' : ''}` }; }
  const keys = () => { const ks = new Set(); for (const m of (ROMD && ROMD.maps || [])) if (m.cells && m.ids && !m.ds && m.src !== 'gen' && isIndoorMap(m)) ks.add(MapGen.keyOf(m)); return [...ks]; };
  // option A (B's walls came out jumbled): stitch 8x8 blocks cut whole from real castle maps of the tileset; each placed
  // block is the one whose edges best fit what is already placed (fewest tile pairings never seen in a real map); the
  // map is kept only if all of its floor is connected
  // blocks: 8x8 windows of real castle maps, kept only when (1) every edge square is wall or that map's ordinary floor,
  // so no pool, rug or carpet is cut in half at a join, and (2) any water inside is a pond of at least four connected tiles
  function blocks(md, B) { md.bcache = md.bcache || {}; if (md.bcache[B]) { md.thrones = md.bcache[B].thrones; return md.bcache[B].list; } const list = []; md.thrones = []; md.mainFloor = [];
    const isWater = t => t === 0x15 || t === 0x16 || t === 0x10 || t === 0x3C;
    // ordinary floor: the most common walkable, non-water tiles of the map, whatever their terrain code (castles use 0x17,
    // some tilesets 0x2A or 0x31)
    md.maps.forEach((m, mi) => { const ff = new Map(); for (let i = 0; i < m.cells.length; i++) { const t = m.terr[i]; if (!WALLS.has(t) && !isWater(t) && t !== T_THRONE) ff.set(m.cells[i], (ff.get(m.cells[i]) || 0) + 1); }
      md.mainFloor[mi] = [...ff.entries()].sort((x, y) => y[1] - x[1]).map(([tl]) => tl)[0];
      const tot = [...ff.values()].reduce((a2, c) => a2 + c, 0), plainF = new Set(); let acc = 0; for (const [tl, c] of [...ff.entries()].sort((x, y) => y[1] - x[1])) { if (acc >= tot * 0.9) break; plainF.add(tl); acc += c; }
      for (let y = 0; y + B <= m.h; y++) for (let x = 0; x + B <= m.w; x++) { const cells = [], terr = []; let floor = 0, edgeOk = true, edgeOdd = 0;
        for (let yy = 0; yy < B; yy++) for (let xx = 0; xx < B; xx++) { const i = (y + yy) * m.w + x + xx, t = m.terr[i]; cells.push(m.cells[i]); terr.push(t); if (!WALLS.has(t)) floor++;
          if ((xx === 0 || yy === 0 || xx === B - 1 || yy === B - 1) && !WALLS.has(t) && !plainF.has(m.cells[i])) { edgeOk = false; edgeOdd++; } }
        const hasThrone = terr.includes(T_THRONE); if (!edgeOk && !(hasThrone && edgeOdd <= 4)) continue;   // throne blocks may cut a little carpet at the edge
        // water: either none, or ponds of four or more connected tiles
        const wseen = new Set(); let tiny = false; for (let i = 0; i < B * B && !tiny; i++) { if (!isWater(terr[i]) || wseen.has(i)) continue; const q = [i]; wseen.add(i); let n = 0;
          while (q.length) { const j = q.pop(); n++; const jx = j % B, jy = (j / B) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = jx + dx, ny = jy + dy, k = ny * B + nx; if (nx < 0 || ny < 0 || nx >= B || ny >= B || wseen.has(k) || !isWater(terr[k])) continue; wseen.add(k); q.push(k); } }
          if (n < 4) tiny = true; }
        if (tiny) continue;
        const thr = terr.reduce((a2, t, i) => t === T_THRONE ? a2.concat(i) : a2, []);
        if (floor >= B * B * 0.3 && floor <= B * B * 0.85 && !thr.length) list.push({ cells, terr, src: mi });
        else if (thr.length === 1 && floor >= B * B * 0.3) { const tx = thr[0] % B, ty = (thr[0] / B) | 0; if (tx >= 1 && ty >= 1 && tx <= B - 2 && ty <= B - 2) md.thrones.push({ cells, terr, throne: true, src: mi }); } } });
    md.bcache[B] = { list, thrones: md.thrones }; return list; }
  function patch(rng, key, bw, bh, B, opts) { const md = model(key); if (!md) return null; B = B || 8;
    // blocks pooled across every real map of the tileset that shares the same ordinary floor tile, so floors match;
    // if no floor style has enough 8x8 blocks, 6x6 blocks are tried (the map keeps about the same size)
    const groups = B2 => { const all = blocks(md, B2), by = new Map(); for (const P of all) { const g = md.mainFloor[P.src]; if (!by.has(g)) by.set(g, []); by.get(g).push(P); } return [...by.entries()].filter(([, L]) => L.length >= Math.max(6, bw * bh * 2)); };   // enough blocks for variety, or the tileset keeps its real maps
    let srcs = groups(B); if (!srcs.length && B > 6) { const B6 = 6; bw = Math.max(2, Math.round(bw * B / B6)); bh = Math.max(2, Math.round(bh * B / B6)); B = B6; srcs = groups(B); }
    if (!srcs.length) return null; const w = bw * B, h = bh * B; const [floorId, pool] = srcs[rng.int(0, srcs.length - 1)];
    const thronesHere = (md.thrones || []).filter(T => md.mainFloor[T.src] === floorId), thronePool = thronesHere.length ? thronesHere : (md.thrones || []);
    const fits = (a, M, b) => { const r = M.get(a); return !!(r && r.has(b)); }, wallish = t => WALLS.has(t) || t === 0x15;
    // a throne block goes in the middle of the row farthest from the top (the army deploys from the far side of the map)
    const thronePos = opts && opts.throne && thronePool.length ? [Math.floor(bw / 2), 0] : null;
    for (let attempt = 0; attempt < 12; attempt++) { const cells = new Array(w * h).fill(-1), terr = new Array(w * h).fill(0x1A); let seamBad = 0, seams = 0; const used = new Map();
      for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) { let best = null, bb = 1e9;
        const src = thronePos && bx === thronePos[0] && by === thronePos[1] ? thronePool : pool;
        for (let t = 0; t < 250; t++) { const P = src[rng.int(0, src.length - 1)]; let bad = 0;
          // a pairing never seen in a real map costs 1; wall meeting floor across the join costs 2 more (that is what shows)
          if (bx) for (let yy = 0; yy < B; yy++) { const i = (by * B + yy) * w + bx * B - 1; if (!fits(cells[i], md.right, P.cells[yy * B])) bad++; if (wallish(terr[i]) !== wallish(P.terr[yy * B])) bad += 2; }
          if (by) for (let xx = 0; xx < B; xx++) { const i = (by * B - 1) * w + bx * B + xx; if (!fits(cells[i], md.down, P.cells[xx])) bad++; if (wallish(terr[i]) !== wallish(P.terr[xx])) bad += 2; }
          bad += 3 * (used.get(P) || 0);   // a block already used in this map costs more, so repeats stay rare
          if (bad < bb) { bb = bad; best = P; } if (!bad) break; }
        used.set(best, (used.get(best) || 0) + 1);
        seamBad += bb; seams += (bx ? B : 0) + (by ? B : 0);
        for (let yy = 0; yy < B; yy++) for (let xx = 0; xx < B; xx++) { const i = (by * B + yy) * w + bx * B + xx; cells[i] = best.cells[yy * B + xx]; terr[i] = best.terr[yy * B + xx]; } }
      // all floor connected (one region): a room sealed off by a single wall square gets a door there (the tileset's own door
      // tile, so a key or a thief opens it; plain floor if the tileset has no door); anything else is drawn again
      const pass = i => footWalk(terr[i]), N4b = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      const regionOf = () => { const rid = new Int32Array(w * h).fill(-1), sizes = []; for (let i0 = 0; i0 < w * h; i0++) { if (rid[i0] >= 0 || !pass(i0)) continue; const r = sizes.length, q2 = [i0]; rid[i0] = r; let n = 0;
          while (q2.length) { const i = q2.pop(); n++; const x = i % w, y = (i / w) | 0; for (const [dx, dy] of N4b) { const nx = x + dx, ny = y + dy, j = ny * w + nx; if (nx < 0 || ny < 0 || nx >= w || ny >= h || rid[j] >= 0 || !pass(j)) continue; rid[j] = r; q2.push(j); } } sizes.push(n); } return { rid, sizes }; };
      const doorTile = md.doorTile !== undefined ? md.doorTile : (md.doorTile = (() => { const c = new Map(); for (const m of md.maps) for (let i = 0; i < m.cells.length; i++) if (m.terr[i] === 0x1E) c.set(m.cells[i], (c.get(m.cells[i]) || 0) + 1); let b = null, bc = 0; for (const [tl, n] of c) if (n > bc) { bc = n; b = tl; } return b; })());
      const floorTile = cells[terr.findIndex((t, i) => pass(i) && md.cls(cells[i]) === 'floor')];
      for (let fix = 0; fix < 8; fix++) { const { rid, sizes } = regionOf(); if (sizes.length <= 1) break; const main = sizes.indexOf(Math.max(...sizes)); let opened = false;
        for (let i = 0; i < w * h && !opened; i++) { if (pass(i)) continue; const x = i % w, y = (i / w) | 0; const nb = N4b.map(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx < 0 || ny < 0 || nx >= w || ny >= h ? -1 : rid[ny * w + nx]; });
          // a wall square with the main region on one side and another region on the opposite side
          if ((nb[0] === main && nb[1] >= 0 && nb[1] !== main) || (nb[1] === main && nb[0] >= 0 && nb[0] !== main) || (nb[2] === main && nb[3] >= 0 && nb[3] !== main) || (nb[3] === main && nb[2] >= 0 && nb[2] !== main)) {
            if (doorTile !== null) { cells[i] = doorTile; terr[i] = 0x1E; } else if (floorTile !== undefined) { cells[i] = floorTile; terr[i] = md.terr.get(floorTile); } opened = true; } }
        if (!opened) break; }
      const fin = regionOf(); if (fin.sizes.length !== 1) continue;
      const seen = { size: fin.sizes[0] };
      const floor = terr.filter((t, i) => pass(i)).length; if (seen.size < floor) continue;   // Casim: no sealed-off rooms; every floor square (doors count) joins the rest
      let jw = 0, jn = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (x && x % B === 0) { jn++; if (wallish(terr[i - 1]) !== wallish(terr[i])) jw++; } if (y && y % B === 0) { jn++; if (wallish(terr[i - w]) !== wallish(terr[i])) jw++; } }
      return { src: 'gen', game: md.game, ids: md.ids, w, h, cells, terr, seamUnseen: seams ? seamBad / seams : 0, joinMismatch: jn ? jw / jn : 0, name: '', credit: `Stitched from ${md.maps.length} castle map${md.maps.length > 1 ? 's' : ''}` }; }
    return null; }
  return { model, plan, fill, generate, keys, patch };
})();

// every square a foot soldier can walk (doors count) is reachable from the army's lord: used where a chapter changes the
// map (the maze), so nothing it adds can wall off part of the field
function allJoined(st, foot) { const lord = st.units.find(u => u.leader && u.team === 'player') || st.units.find(u => u.team === 'player'); if (!lord || !foot) return true;
  const MW = st.map.w, MH = st.map.h, pass = (x, y) => st.map.terr[y * W + x] === 0x1E || moveCost(st, foot, x, y) < 99, seen = new Uint8Array(W * MH + MW), q = [lord.y * W + lord.x]; seen[q[0]] = 1; let n = 1;
  while (q.length) { const i = q.pop(), x = i % W, y = (i / W) | 0; for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MW || ny >= MH) continue; const j = ny * W + nx; if (!seen[j] && pass(nx, ny)) { seen[j] = 1; n++; q.push(j); } } }
  let walk = 0; for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if (pass(x, y)) walk++; return n >= walk; }
// objective squares (banners, the armory): a unit that is not attacking heads for the nearest one it should reach
function seekSquare(st, u, targets) { if (!targets.length) return null; const dist = reach(st, u); let best = null, bd = 1e9;
  for (const [k] of dist) { const x = k % W, y = Math.floor(k / W), o = unitAt(st, x, y); if (o && o !== u) continue; const d = Math.min(...targets.map(([tx, ty]) => Math.abs(tx - x) + Math.abs(ty - y))); if (d < bd) { bd = d; best = [x, y]; } }
  return best ? { type: 'wait', path: pathTo(dist, best[0], best[1]) } : null; }
// a rooted unit (a 2x2 beast or creature) never moves, whatever its AI was switched to: it strikes from where it stands or waits
function rootPlan(st, u, a) { if (!a) return a; const last = a.path[a.path.length - 1]; if (last[0] === u.x && last[1] === u.y) return a;
  const t = a.type === 'attack' ? st.units.find(o => o.id === a.target) : null;
  return t && inRange(u, t, u.x, u.y) ? Object.assign({}, a, { path: [[u.x, u.y]] }) : { type: 'wait', path: [[u.x, u.y]] }; }
function plan(st, u) { if (u.rooted) return rootPlan(st, u, planInner(st, u));
  const a = planInner(st, u); if (u.bountyOn && a && a.type === 'attack' && a.target !== u.bountyOn) return { type: 'wait', path: a.path };   // bounty hunters strike only their mark
  if (st.jailbreak && u._stash && u.team === 'player') { const g = seekSquare(st, u, [st.jailbreak.armory]); if (g) return g; }       // unarmed: make for the armory
  if (st.banners && (u.team === 'player' || u.team === 'enemy') && a && a.type !== 'attack' && !u.rooted && !(u.leader && u.team === 'player' && u.hp < u.maxhp / 2)) {
    const want = st.banners.filter(b => b.owner !== u.team && !(unitAt(st, b.x, b.y) && unitAt(st, b.x, b.y).team === u.team)).map(b => [b.x, b.y]); const g = seekSquare(st, u, want); if (g) return g; }
  return a; }
function planInner(st, u) { let a = planUnit(st, u); if (a && (a.type === 'attack' || a.type === 'wait' || a.type === 'heal') && !hasStatus(u, 'berserk')) a = chooseGambit(st, u, a); if (a && a.type === 'attack' && !a.art && !a.gambit && !hasStatus(u, 'berserk')) chooseArt(st, u, a); return a; }
function planUnit(st, u) {
  if ((u.role === 'stealer' || u.fleeing) && u.hp > 0) { const r = planRunner(st, u); if (r) return r; }
  if (hasStatus(u, 'sleep')) return { type: 'wait', path: [[u.x, u.y]] };
  if (u.team === 'neutral' && !u.hostile) return planNeutral(st, u);   // hostile neutrals (wild creatures) fight like anyone else
  if (!hasStatus(u, 'berserk')) { const sa = planStaff(st, u); if (sa) return sa; }
  if (u.carrying) return planCarry(st, u);
  if (u.raider) { const near = st.units.some(o => o.hp > 0 && foes(o, u) && manhattan(o, u) <= 2); if (!near) { const r = planRaid(st, u); if (r) return r; } }
  if (!u.items) { u.items = [item(WEAPONS[u.weapon] ? u.weapon : CLASSES[u.cls].wpn)]; equipBest(u); }
  if (!WEAPONS[u.weapon] || (u.weapon !== 'none' && !weaponsOf(u).some(it => it.id === u.weapon))) equipBest(u);
  const opts = [...new Set(weaponsOf(u).map(it => it.id))];
  if (opts.length <= 1) return planCore(st, u);
  let best = null, bestW = null;
  for (const id of opts) { u.weapon = id; const a = planCore(st, u); if (a.type === 'attack' && (!best || (a.s || 0) > (best.s || 0))) { best = a; bestW = id; } }
  const staff = opts.find(id => WEAPONS[id].heal);
  if (staff) { u.weapon = staff; const h = planCore(st, u); if (h.type === 'heal' && (!best || (h.s || 0) >= (best.s || 0) * 0.8)) { h.weapon = staff; return h; } }
  if (best) { u.weapon = bestW; best.weapon = bestW; return best; }
  u.weapon = opts.find(id => !WEAPONS[id].heal) || opts[0]; return planCore(st, u);
}
function planCore(st, u) {
  const c = CLASSES[u.cls], w = WEAPONS[u.weapon];
  const lim = u.ai === 'hold' || u.rooted ? 0 : c.mov;   // 2x2 beasts and creatures are rooted: no events or rules may make them walk
  if (u.ai === 'wake') { if (st.units.some(o => o.hp > 0 && foes(o, u) && manhattan(o, u) <= 7)) u.ai = 'pursue'; }
  const dist = reach(st, u, u.ai === 'wake' ? 0 : lim);
  const seizeAt = st.goal === 'seize' && st.map.throne && u.team === 'player' && !u.leader ? st.map.throne : null;
  const ends = [...dist.keys()].map(k => [k % W, Math.floor(k / W)]).filter(([x, y]) => { const o = unitAt(st, x, y); return (!o || o === u) && !(seizeAt && x === seizeAt.x && y === seizeAt.y); });
  const pathOf = (x, y) => pathTo(dist, x, y);
  if (u.team === 'player') { const rr = st.units.find(o => o.recruitBy === u.id && o.team === 'enemy' && o.hp > 0);
    if (rr) for (const [dx, dy] of N4) { const x = rr.x + dx, y = rr.y + dy; if (!inb(x, y) || !dist.has(y * W + x)) continue; const occ = unitAt(st, x, y); if (occ && occ !== u) continue; if (danger(st, u, x, y) < u.hp * 0.7) return { type: 'recruit', path: pathOf(x, y), target: rr.id }; }
    if (rr && u.hp > u.maxhp * 0.4) { const fd = field(st, u, rr.x, rr.y); let pick = null; for (const k of dist.keys()) { const x = k % W, y = Math.floor(k / W), occ = unitAt(st, x, y); if (occ && occ !== u) continue; const d = fd.get(k); if (d === undefined) continue; const dg = danger(st, u, x, y); if (dg >= u.hp) continue; const s = -d - dg * 0.3; if (!pick || s > pick.s) pick = { s, x, y }; }
      if (pick && (fd.get(u.y * W + u.x) ?? 1e9) > -pick.s - 0.01) return { type: 'wait', path: pathOf(pick.x, pick.y) }; } }
  const lowHp = u.hp < u.maxhp * 0.4;

  if (w.refresh) {                                  // dancer/bard: let a strong ally who has already acted go again
    let best = null;
    for (const a of st.units) { if (a === u || a.hp <= 0 || foes(a, u) || !a.moved || CLASSES[a.cls].dancer) continue;
      for (const [x, y] of ends) if (manhattan({ x, y }, a) === 1) { if (u.team === 'player' && danger(st, u, x, y) >= u.hp) continue; const s = a.str + a.mag + a.spd + (a.leader ? -6 : 0) - threatAt(st, u, x, y) * 3; if (!best || s > best.s) best = { s, x, y, t: a }; } }
    if (best) return { type: 'refresh', path: pathOf(best.x, best.y), target: best.t.id };
  }
  if (w.heal) {                                     // healer: patch up the most hurt ally in reach
    let best = null;
    for (const a of st.units) { if (a === u || a.hp <= 0 || foes(a, u) || a.hp >= a.maxhp) continue;
      for (const [x, y] of ends) if (manhattan({ x, y }, a) === 1) {
        if (u.team === 'player' && danger(st, u, x, y) >= u.hp) continue;
        const s = (a.maxhp - a.hp) * (a.leader ? 2 : 1) - threatAt(st, u, x, y) * 3;
        if (!best || s > best.s) best = { s, x, y, t: a }; } }
    if (best && best.t.maxhp - best.t.hp >= 5) return { type: 'heal', path: pathOf(best.x, best.y), target: best.t.id, s: best.s };
  }
  let best = null;
  if (!w.heal) for (const e of st.units) {
    if (e.hp <= 0 || !foes(e, u) || (u.team === 'player' && !visible(st, e.x, e.y))) continue;
    if (u.team === 'player' && e.recruitBy && st.turn < 15 && st.units.some(o => o.id === e.recruitBy && o.hp > 0)) continue;
    for (const [x, y] of ends) {
      if (!inRange(u, e, x, y)) continue;
      const f = forecast(st, u, e, x, y);
      const hits = f.A.dbl ? 2 : 1, cHits = f.D ? (f.D.dbl ? 2 : 1) : 0;
      const expDealt = f.A.dmg * hits * f.A.hit / 100, expTaken = f.D ? f.D.dmg * cHits * f.D.hit / 100 : 0;
      const canKill = f.A.dmg * hits >= e.hp, maxTaken = f.D ? f.D.dmg * cHits : 0;
      const isLord = !!u.leader, firstKills = f.A.dmg >= e.hp && f.A.hit >= 90;
      if (u.team === 'player' && maxTaken >= u.hp) {
        const pFirst = f.A.dmg >= e.hp ? f.A.hit / 100 : 0, need = Math.ceil(u.hp / Math.max(1, f.D.dmg)), strikes = f.D.dbl ? 2 : 1;
        const pDie = need > strikes ? 0 : (1 - pFirst) * Math.pow(f.D.hit / 100, need);
        const stall = st.stall || 0, limit = isLord ? Math.min(.35, .05 + stall * .08) : Math.min(.85, .2 + stall * .15);
        if (pDie > limit) { st.riskSkip = st.turn; continue; } }
      if (isLord && maxTaken + danger(st, u, x, y, canKill ? e.id : -1) >= u.hp) continue;   // nor a lethal enemy phase
      let s = expDealt + (canKill ? 25 * f.A.hit / 100 : 0) - expTaken * 0.6 + tDef(st, u, x, y) * 2 + tAvo(st, u, x, y) / 10 + (e.boss ? 4 : 0) + (!f.D ? 3 : 0) + (isLord ? 3 : 0);
      if (u.team === 'player' && !isLord) {
        const hpAfter = u.hp - expTaken, dg = danger(st, u, x, y, canKill ? e.id : -1);
        if (dg >= hpAfter) s -= canKill ? 6 : 14;
        s += Math.min(2, allyNear(st, u, x, y)) * 1.5;
      }
      if (lowHp && u.team === 'player' && maxTaken >= u.hp) s -= 30;
      if (!best || s > best.s) best = { s, x, y, t: e };
    }
  }
  if (best && (best.s > -4 || u.team === 'enemy' || st.turn > 30)) return { type: 'attack', path: pathOf(best.x, best.y), target: best.t.id, s: best.s };
  if (u.team === 'player' && !lowHp) { const tt = talkTarget(st, u, dist); if (tt) return { type: 'talk', path: pathOf(tt.x, tt.y), target: tt.t.id }; }
  if (u.team === 'player') {
    const rs = rescueTarget(st, u, dist); if (rs) return { type: 'rescue', path: pathOf(rs.x, rs.y), target: rs.t.id }; }
  if (u.team === 'player' && st.villages && !lowHp) { let vb = null;
    for (const v of st.villages) { if (st.visited.has(v)) continue; const x = v % W, y = Math.floor(v / W); if (!dist.has(v)) continue; const o = unitAt(st, x, y); if (o && o !== u) continue;
      const dg = danger(st, u, x, y); if (dg < u.hp * (u.leader ? 0.3 : 0.6) && (!vb || dg < vb.dg)) vb = { x, y, dg }; }
    if (vb) return { type: 'visit', path: pathOf(vb.x, vb.y) }; }
  if (u.team === 'player' && st.chests && st.chests.length && !lowHp && !u.leader && canOpenChests(u)) { let cb = null;
    for (const v of st.chests) { if (st.map.terr[v] !== 0x21 || !dist.has(v)) continue; const x = v % W, y = Math.floor(v / W), o = unitAt(st, x, y); if (o && o !== u) continue;
      const dg = danger(st, u, x, y); if (dg < u.hp * 0.6 && (!cb || dg < cb.dg)) cb = { x, y, dg }; }
    if (cb) return { type: 'chest', path: pathOf(cb.x, cb.y) }; }
  if (u.team === 'player' && st.fog && !(u.torchTurns > 0) && (u.items || []).some(it => it.id === 'torch' && it.uses > 0) && !st.units.some(o => o.team === 'enemy' && o.hp > 0 && visible(st, o.x, o.y))) return { type: 'torch', path: [[u.x, u.y]] };
  const potion = (u.items || []).find(it => WEAPONS[it.id] && WEAPONS[it.id].consumable && it.uses > 0);
  if (lowHp && potion) return { type: 'vulnerary', item: potion.id, path: [[u.x, u.y]] };
  if (u.ai !== 'pursue' || lim === 0) return { type: 'wait', path: [[u.x, u.y]] };

  // move toward a goal: lord heads for the throne on seize maps once the boss is down; everyone else toward foes
  let target = null;
  if (u.leader && st.goal === 'seize' && !st.units.some(o => o.boss && o.hp > 0)) target = st.map.throne;
  if (u.team === 'player' && u.leader && st.goal === 'escape' && st.exitGoal) target = { x: st.exitGoal[0], y: st.exitGoal[1] };
  if (u.team === 'player' && st.goal === 'rescue' && st.captive) { const c = st.units.find(o => o.id === st.captive && o.hp > 0 && o.team === 'neutral'); if (c && !u.leader) target = c; }
  if (u.team === 'player' && st.goal === 'escort' && st.escortee) { const c = st.units.find(o => o.id === st.escortee && o.hp > 0); if (c) { const near = st.units.filter(o => o.hp > 0 && foes(o, u) && visible(st, o.x, o.y)).sort((a, b) => manhattan(a, c) - manhattan(b, c))[0]; target = near && manhattan(near, c) <= 8 ? near : c; } }
  if (u.team === 'player' && st.goal === 'flee') { const b = st.units.find(o => o.boss && o.hp > 0); if (b && visible(st, b.x, b.y)) target = b; }
  if (u.team === 'player' && st.goal === 'defend' && st.defendTile && !u.leader && manhattan(u, { x: st.defendTile[0], y: st.defendTile[1] }) > 3) target = { x: st.defendTile[0], y: st.defendTile[1] };
  if (u.team === 'enemy' && st.goal === 'defend' && st.defendTile && !u.boss && !u.guard) target = { x: st.defendTile[0], y: st.defendTile[1] };
  if (!target && st.mazeWalls) { const far = reach(st, u, 999); let nd = 1e9;      // in a maze: the nearest foe by real walking distance, skipping any it cannot reach
    for (const e of st.units) { if (e.hp <= 0 || !foes(e, u) || e.x < 0) continue; let best = 1e9; for (const [dx, dy] of N4) { const v = far.get((e.y + dy) * W + e.x + dx); if (v && v.c < best) best = v.c; } if (best < nd) { nd = best; target = e; } } }
  if (!target) { let nd = 1e9; for (const e of st.units) if (e.hp > 0 && foes(e, u) && (u.team !== 'player' || visible(st, e.x, e.y) || !st.fog || st.turn > 6)) { const d = manhattan(u, e); if (d < nd) { nd = d; target = e; } } }
  // with nobody left to fight on a seize or escape map, the army moves on toward the lord's objective, so it never stands packed in
  // a narrow lane between the lord and the throne or exit (it still never stands on the seize point itself)
  if (!target && u.team === 'player' && !u.leader) { const goalAt = st.goal === 'seize' && st.map.throne ? st.map.throne : st.goal === 'escape' && st.exitGoal ? { x: st.exitGoal[0], y: st.exitGoal[1] } : null,
      lord = goalAt && st.units.find(o => o.leader && o.team === 'player' && o.hp > 0);
    if (lord) { const lf = field(st, lord, goalAt.x, goalAt.y), route = new Set([goalAt.y * W + goalAt.x]); let k = lord.y * W + lord.x;
      for (let step = 0; step < W * H; step++) { const x = k % W, y = Math.floor(k / W); let nk = null, nd = lf.get(k); if (nd === undefined) break;
        for (const [dx, dy] of N4) { if (!inb(x + dx, y + dy)) continue; const kk = (y + dy) * W + x + dx, v = lf.get(kk); if (v !== undefined && v < nd) { nd = v; nk = kk; } }
        if (nk === null) break; route.add(nk); k = nk; }
      const inWay = (x, y) => route.has(y * W + x) || Math.abs(x - goalAt.x) + Math.abs(y - goalAt.y) <= 1;
      if (inWay(u.x, u.y)) { let pick = null; for (const [x, y] of ends) { if (inWay(x, y)) continue; const d = Math.abs(x - u.x) + Math.abs(y - u.y); if (!pick || d < pick.d) pick = { d, x, y }; }
        if (pick) return { type: 'wait', path: pathOf(pick.x, pick.y) }; } } }
  if (!target) return { type: 'wait', path: [[u.x, u.y]] };
  // a unit that can open chests heads for the nearest unopened one, over several turns, avoiding lethal tiles
  if (u.team === 'player' && !u.leader && !lowHp && st.chests && canOpenChests(u)) {
    const open = st.chests.filter(v => st.map.terr[v] === 0x21); let goal = null, gd = 1e9;
    for (const v of open) { const d = Math.abs(v % W - u.x) + Math.abs(Math.floor(v / W) - u.y); if (d < gd) { gd = d; goal = v; } }
    if (goal !== null) { const cf = field(st, u, goal % W, Math.floor(goal / W)); let pick = null;
      for (const [x, y] of ends) { const d = cf.get(y * W + x); if (d === undefined) continue; const dg = danger(st, u, x, y); const s = -d - (dg >= u.hp ? 100 : dg * 0.4); if (!pick || s > pick.s) pick = { s, x, y }; }
      if (pick && pick.s > -100) return { type: 'wait', path: pathOf(pick.x, pick.y) }; } }
  // healers and dancers follow the army instead of the enemy, and never stand where they can be killed
  if (u.team === 'player' && (c.healer || c.dancer || w.heal || w.refresh)) {
    const guards = st.units.filter(o => o.hp > 0 && o !== u && o.team === 'player' && !CLASSES[o.cls].healer && !CLASSES[o.cls].dancer);
    const anchor = guards.length ? guards.reduce((b, o) => (o.def + o.maxhp / 2) > (b.def + b.maxhp / 2) && manhattan(o, u) < 12 ? o : b, guards[0]) : null;
    let pick = null;
    for (const [x, y] of ends) { const dg = danger(st, u, x, y); let s = (dg >= u.hp ? -100 : -dg * 1.5) + Math.min(3, allyNear(st, u, x, y)) * 2;
      if (anchor) s -= Math.abs(Math.abs(anchor.x - x) + Math.abs(anchor.y - y) - 2) * 1.5;
      if (!pick || s > pick.s) pick = { s, x, y }; }
    return { type: 'wait', path: pick ? pathOf(pick.x, pick.y) : [[u.x, u.y]] };
  }
  { const dr = planDoor(st, u, target, ends, pathOf); if (dr) return dr; const br = planBreak(st, u, target, ends, pathOf); if (br) return br; }
  const fd = field(st, u, target.x, target.y);
  const objective = !target.team && ((st.map.throne && target === st.map.throne) || (st.exitGoal && target.x === st.exitGoal[0] && target.y === st.exitGoal[1]));
  let pick = null;
  for (const [x, y] of ends) { const d = fd.get(y * W + x); if (d === undefined) continue;
    let s = -d + (objective && d === 0 ? 50 : 0);
    if (u.leader) { const dg = danger(st, u, x, y); s -= dg >= u.hp ? 100 : dg >= u.hp * 0.6 ? 8 + dg : dg * 0.5; s += Math.min(2, allyNear(st, u, x, y)); }
    else if (u.team === 'player') { const dg = danger(st, u, x, y); if (dg >= u.hp) s -= 30; s += Math.min(2, allyNear(st, u, x, y)); }
    if (!pick || s > pick.s) pick = { s, x, y }; }
  return { type: 'wait', path: pick ? pathOf(pick.x, pick.y) : [[u.x, u.y]] };
}

// ---------------------------------------------------------------- breakables (ported from Ashen Banner Tactics Online)
// A cracked wall or a snag blocks like a wall until someone breaks it, and then its square is open ground. Either side may
// break one, as in the official games: a soldier spends their action striking it, and a unit that cannot reach anyone breaks
// through when a breakable is its way to them. A blow always lands, never crits, does the striker's full power plus the
// weapon's might with no defence against it, uses the weapon once, and earns no experience. Toughness grows through each
// book: 20 in its first chapter, rising evenly to 40 in its last (chapter 30).
const BREAK_T = { 0x33: 'snag', 0x1B: 'cracked wall' }, WET_T = new Set([0x10, 0x15, 0x16, 0x3C]);
function breakHp(n) { const jb = ((n - 1) % 30) + 1; return 20 + Math.round(20 * (jb - 1) / 29); }
function setupBreakables(st, n) {
  st.breaks = {}; st.rubble = []; st.groundArt = []; const T = st.map.terr; if (!T) return; const hp = breakHp(n);
  const wet = (x, y) => inb(x, y) && WET_T.has(T[y * W + x]), open = (x, y) => inb(x, y) && !BLOCK_T.has(T[y * W + x]) && !BREAK_T[T[y * W + x]];
  for (let k = 0; k < W * H; k++) { const kind = BREAK_T[T[k]]; if (!kind) continue; const b = { k, kind, hp, max: hp, fall: null };
    // a snag falls when it breaks, across water beside it that is a single square wide with open ground beyond, so the fallen
    // log is one tile, on the water, and reaches the far side; with no such crossing it simply clears
    if (kind === 'snag') { const x = k % W, y = Math.floor(k / W); for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) if (wet(x + dx, y + dy) && open(x + 2 * dx, y + 2 * dy)) { b.fall = { cells: [(y + dy) * W + x + dx], dir: dx ? 'H' : 'V' }; break; } }
    st.breaks[k] = b; }
}
// the weapon that does most to a breakable at this distance, and how much (staves and other tools cannot strike)
function breakBlow(u, d) { let best = null;
  for (const it of weaponsOf(u)) { const w = WEAPONS[it.id]; if (!w || w.heal || w.refresh || w.util || !(it.max === 0 || it.uses > 0) || d < w.min || d > w.max) continue;
    const dmg = Math.max(1, ((w.magic || (w.magicRanged && d >= 2)) ? u.mag : u.str) + w.mt); if (!best || dmg > best.dmg) best = { id: it.id, dmg }; }
  return best; }
function breakTargets(st, u, x, y) { return Object.values(st.breaks || {}).filter(b => breakBlow(u, Math.abs(b.k % W - x) + Math.abs(Math.floor(b.k / W) - y))); }
// walking costs to a target with every breakable open (striking through one costs 3) and fallen-snag crossings in place
function fieldOpen(st, u, tx, ty) { const bridge = new Set(Object.values(st.breaks).flatMap(b => b.fall ? b.fall.cells : []));
  const d = new Map(), open = Heap(); open.push([0, tx, ty]);
  while (open.length) { const [c, x, y] = open.pop(), k = y * W + x; if (d.has(k)) continue; d.set(k, c);
    for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy, nk = ny * W + nx; if (!inb(nx, ny) || d.has(nk)) continue;
      const mc = st.breaks[nk] ? 3 : bridge.has(nk) ? 1 : moveCost(st, u, nx, ny); if (mc < 99) open.push([c + mc, nx, ny]); } }
  return d; }
// A unit with nobody to attack this turn: is a breakable its way to its target? If breaking through saves at least two turns of
// walking, or is the only way at all, it goes for the first breakable on that route: strikes it from here if it can, otherwise
// walks towards it. Only units that hunt do this; ones guarding or holding a place stay put. Player units never strike from a
// square where they would die.
function planBreak(st, u, target, ends, pathOf) {
  if (!st.breaks || !st.map.terr) return null; const bs = Object.values(st.breaks); if (!bs.length) return null;
  const here = u.y * W + u.x, mov = CLASSES[u.cls].mov, a = field(st, u, target.x, target.y).get(here), of = fieldOpen(st, u, target.x, target.y), b = of.get(here);
  if (b === undefined || !(a === undefined || a - b >= 2 * mov)) return null;
  let k = here, pick = null;
  for (let step = 0; step < W * H && !pick; step++) { const x = k % W, y = Math.floor(k / W); let nk = null, nd = of.get(k);
    for (const [dx, dy] of N4) { const kk = (y + dy) * W + x + dx; if (!inb(x + dx, y + dy)) continue; const v = of.get(kk); if (v !== undefined && v < nd) { nd = v; nk = kk; } }
    if (nk === null) break; if (st.breaks[nk]) pick = st.breaks[nk]; k = nk; }
  if (!pick) return null; const px = pick.k % W, py = Math.floor(pick.k / W);
  let spot = null;
  for (const [x, y] of ends) { const blow = breakBlow(u, Math.abs(x - px) + Math.abs(y - py)); if (!blow) continue;
    const dg = u.team === 'player' ? danger(st, u, x, y) : 0; if (u.team === 'player' && dg >= u.hp) continue;
    if (!spot || dg < spot.dg) spot = { x, y, dg, w: blow.id }; if (u.team !== 'player') break; }
  if (spot) return { type: 'break', path: pathOf(spot.x, spot.y), target: pick.k, weapon: spot.w };
  let go = null;
  for (const [x, y] of ends) { const s = -(Math.abs(x - px) + Math.abs(y - py)) - (u.team === 'player' && danger(st, u, x, y) >= u.hp ? 100 : 0); if (!go || s > go.s) go = { s, x, y }; }
  return go ? { type: 'wait', path: pathOf(go.x, go.y) } : null;
}
// Doors open the official way: a thief, a Door Key (used up) or the Unlock staff. The square becomes floor. A unit that can open
// doors, with nobody to attack this turn, opens one when it is its way to its target (saves two turns of walking or is the only way).
function openDoor(st, k, res) { st.map.terr[k] = 0x17; (st.doorArt = st.doorArt || []).push(k); if (res) res.door = { x: k % W, y: Math.floor(k / W) }; }
function planDoor(st, u, target, ends, pathOf) {
  if (!st.map.terr || !canOpenDoors(u) || !st.map.terr.includes(0x1E)) return null;
  const here = u.y * W + u.x, mov = CLASSES[u.cls].mov, a = field(st, u, target.x, target.y).get(here);
  const d = new Map(), open = Heap(); open.push([0, target.x, target.y]);
  while (open.length) { const [c, x, y] = open.pop(), k = y * W + x; if (d.has(k)) continue; d.set(k, c);
    for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy, nk = ny * W + nx; if (!inb(nx, ny) || d.has(nk)) continue; const mc = st.map.terr[nk] === 0x1E ? 2 : moveCost(st, u, nx, ny); if (mc < 99) open.push([c + mc, nx, ny]); } }
  const b = d.get(here); if (b === undefined || !(a === undefined || a - b >= 2 * mov)) return null;
  let k = here, pick = null;
  for (let step = 0; step < W * H && pick === null; step++) { const x = k % W, y = Math.floor(k / W); let nk = null, nd = d.get(k);
    for (const [dx, dy] of N4) { const kk = (y + dy) * W + x + dx; if (!inb(x + dx, y + dy)) continue; const v = d.get(kk); if (v !== undefined && v < nd) { nd = v; nk = kk; } }
    if (nk === null) break; if (st.map.terr[nk] === 0x1E) pick = nk; k = nk; }
  if (pick === null) return null; const px = pick % W, py = Math.floor(pick / W);
  let spot = null;
  for (const [x, y] of ends) { if (Math.abs(x - px) + Math.abs(y - py) !== 1) continue; const dg = u.team === 'player' ? danger(st, u, x, y) : 0; if (u.team === 'player' && dg >= u.hp) continue; if (!spot || dg < spot.dg) spot = { x, y, dg }; }
  if (spot) return { type: 'door', path: pathOf(spot.x, spot.y), target: pick };
  let go = null; for (const [x, y] of ends) { const s = -(Math.abs(x - px) + Math.abs(y - py)) - (u.team === 'player' && danger(st, u, x, y) >= u.hp ? 100 : 0); if (!go || s > go.s) go = { s, x, y }; }
  return go ? { type: 'wait', path: pathOf(go.x, go.y) } : null;
}
// one blow; returns what happened, for the log
function strikeBreak(st, u, b, res) {
  const d = Math.abs(b.k % W - u.x) + Math.abs(Math.floor(b.k / W) - u.y), blow = breakBlow(u, d); if (!blow) return;
  u.weapon = blow.id; b.hp = Math.max(0, b.hp - blow.dmg); const nm = useUp(u, blow.id, 1); if (nm) res.broke = [{ id: u.id, name: nm }];
  if (!weaponsOf(u).some(it => it.id === u.weapon)) equipBest(u);
  res.brk = { kind: b.kind, hp: b.hp, max: b.max, x: b.k % W, y: Math.floor(b.k / W), dmg: blow.dmg };
  if (b.hp > 0) return; delete st.breaks[b.k]; st.map.terr[b.k] = 0x01; res.brk.broken = true;
  if (b.kind === 'snag') { st.groundArt.push([b.k, b.fall ? b.fall.cells[0] : -1]);            // its own square becomes plain ground
    if (b.fall) { for (const c of b.fall.cells) { st.map.terr[c] = 0x01; (st.logArt = st.logArt || []).push([c, b.fall.dir]); } res.brk.bridge = true; } }   // the log, across the water
  else st.rubble.push(b.k);
}

// ---------------------------------------------------------------- applying actions
function batGain(b) { b.exp = (b.exp || 0) + 1; const lv = b.exp >= 12 ? 4 : b.exp >= 7 ? 3 : b.exp >= 3 ? 2 : 1; const up = lv > (b.level || 1); b.level = lv; return up; }
function apply(st, u, act) {
  const last = act.path[act.path.length - 1]; u.x = last[0]; u.y = last[1];
  u.moved = true;
  const res = { type: act.type, unit: u.id }; st._acting = u;
  if (act.type === 'wait' && act.gambit && batLive(u) && u._gambits > 0 && BATTALIONS[u.bat.key].gambit.type !== 'assault') { const g = BATTALIONS[u.bat.key].gambit, ids = [];
    for (const o of st.units) { if (o.hp <= 0 || o.x < 0 || o.team !== u.team || Math.abs(o.x - u.x) + Math.abs(o.y - u.y) > g.radius) continue;
      if (g.type === 'heal') { if (o.hp >= o.maxhp) continue; const h = Math.min(g.amount, o.maxhp - o.hp); o.hp += h; ids.push({ id: o.id, heal: h }); }
      else { o._gbuff = Object.assign({ team: u.team }, g.buff); ids.push({ id: o.id }); } }
    u._gambits--; const lvUp = batGain(u.bat); res.gambit = { name: g.name, kind: g.type, ids, battalion: u.bat.name, levelUp: lvUp ? u.bat.level : 0 }; (st.gambitsUsed = st.gambitsUsed || []).push(g.name); }
  if (act.type === 'attack') { if (act.weapon && WEAPONS[act.weapon]) u.weapon = act.weapon; const t = st.units.find(o => o.id === act.target); const wa = u.weapon, wd = t.weapon;
    const gam = act.gambit && batLive(u) && u._gambits > 0 && BATTALIONS[u.bat.key].gambit.type === 'assault' ? gambitArt(u) : null;
    const art = gam || (act.art && ARTS[act.art] && artsFor(u).includes(act.art) && artUses(u) >= ARTS[act.art].cost ? ARTS[act.art] : null);
    // Chain Attack (Casim): before the unit strikes, up to two allies who can reach the target hit it for a fixed 4-6 (4 in a
    // book's chapters 1-10, 5 in 11-20, 6 in 21-30, +1 on a target of 45+ max HP, never over 6). Chain hits can kill; health
    // bars, life gems and second wind still catch the blow. If the target falls, the unit does not need to attack.
    let chainKill = null;
    if ((u.team === 'player' || u.team === 'ally') && t.hp > 0) { const jbC = ((st.chapter - 1) % 30) + 1, base = Math.min(6, 4 + Math.floor((jbC - 1) / 10) + (t.maxhp >= 45 ? 1 : 0));
      const mates = st.units.filter(o => o !== u && o.hp > 0 && o.x >= 0 && o.team === u.team && !o.rooted && WEAPONS[o.weapon] && !WEAPONS[o.weapon].heal && !WEAPONS[o.weapon].refresh && inRange(o, t, o.x, o.y)).slice(0, 2);
      for (const m of mates) { if (t.hp <= 0) break; t.hp = Math.max(0, t.hp - base); const c = { by: m.id, dmg: base, hpAfter: t.hp };
        if (t.hp <= 0) { if (t.bars > 1) { t.bars--; t.hp = t.maxhp; } else if (t.lives > 0) { t.lives--; t.hp = t.maxhp; (res.gems = res.gems || []).push(t.id); } else if (t.secondWind) { t.secondWind = false; t.hp = t.maxhp; t._windLine = true; } else chainKill = m; c.hpAfter = t.hp; }
        (res.chain = res.chain || []).push(c); }
      if (res.chain && res.chain.length) res.lines = [...(res.lines || []), ['', `${res.chain.map(c2 => { const m = st.units.find(o => o.id === c2.by); return m.name || className(m); }).join(' and ')} ${res.chain.length > 1 ? 'open' : 'opens'} with a chain attack${chainKill ? ', and it is enough' : ''}.`]]; }
    if (chainKill) { res.strikes = []; res.deaths = [t.id]; res.gems = res.gems || []; chainKill.kills++; chainKill.chKills = (chainKill.chKills || 0) + 1;
      const e0 = expFor(chainKill, t, 'kill'); res.exp = chainKill.team === 'player' ? [gainExp(st, chainKill, Math.max(1, Math.min(100, e0)))] : []; if (st._camp && chainKill.team === 'player') st._camp.bexp = (st._camp.bexp || 0) + Math.floor(e0 / 2); }
    else { const pre = { chain: res.chain, gems: res.gems, lines: res.lines }; u.__art = art; try { Object.assign(res, fight(st, u, t)); } finally { u.__art = null; } if (pre.chain) res.chain = pre.chain; res.gems = (pre.gems || []).concat(res.gems || []); res.lines = (pre.lines || []).concat(res.lines || []); }
    res.type = 'attack'; res.broke = [];
    for (const id of res.deaths || []) { const v = st.units.find(o => o.id === id); if (v && v !== u) { const d = relicKill(st, u, v); if (d && d.length) (st.relicDeeds = st.relicDeeds || []).push(...d); }
      if (st.graveyard && v && !v.risen && !v.wild && !v.big && !v.beast && !v.cart && !v.barricade && !v.tent && v.weapon !== 'none') (st.graveQueue = st.graveQueue || []).push({ x: v.x, y: v.y, cls: v.cls, level: v.level, name: v.name });
      if (v && st.decoy && v.id === st.decoy.decoy) { const R = st.units.find(o => o.id === st.decoy.real && o.hp > 0); if (R) { R.boss = true; R.name = st.decoy.name; st.bossName = R.name; res.lines = [...(res.lines || []), ['', `That was a double! The real ${st.decoy.name} has been hiding in the ranks all along.`]]; } st.decoy = null; }
      if (v && st.lastStand && v.id === st.lastStand) { st.lastStand = null; for (const o of st.units) if (o.team === 'enemy' && o.hp > 0) { o.str += 3; o.mag += 3; o.def += 2; } res.lines = [...(res.lines || []), ['', 'Their commander is down, and the rest do not break. They fight harder.']]; }
      if (v && v.shieldWall && st.shieldWall) { st.shieldWall = false; for (const o of st.units) if (o.shieldWall && o.hp > 0) o.ai = 'pursue'; res.lines = [...(res.lines || []), ['', 'The shield wall breaks, and its soldiers charge.']]; }
      if (v && (v.sworn || []).length) for (const o of st.units) if (o.hp > 0 && v.sworn.includes(o.id) && !o._grief) { o._grief = true; o.str += 3; o.mag += 3; res.lines = [...(res.lines || []), [o.name || '', `${v.name || 'My sworn ' + (bondWord(o, v) === 'kin' ? 'kin' : bondWord(o, v).replace(/s$/, ''))}! You will pay for this.`]]; }
      if (v && v.keyholder && st.keysLeft > 0) { st.keysLeft--; res.lines = [...(res.lines || []), ['', st.keysLeft ? `${v.name}'s key is taken. ${st.keysLeft === 1 ? 'One key remains' : 'Two keys remain'}.` : `The last key is taken. The throne room stands open.`]]; } }
    if (u.chainCaster && t.hp > 0 || u.chainCaster && t.hp <= 0) { const dealt = (res.strikes || []).filter(z => z.by === u.id && z.hit).reduce((n2, z) => n2 + z.dmg, 0), half = Math.floor(dealt / 2);
      const nx = half > 0 ? st.units.find(o => o !== t && o.hp > 1 && o.x >= 0 && foes(u, o) && Math.abs(o.x - t.x) + Math.abs(o.y - t.y) === 1) : null;
      if (nx) { const d = Math.min(half, nx.hp - 1); nx.hp -= d; res.splash = (res.splash || []).concat([{ id: nx.id, dmg: d, hpAfter: nx.hp }]); res.lines = [...(res.lines || []), ['', `The lightning leaps to ${nx.name || className(nx)}.`]]; } }
    if (u.trample && t.hp > 0 && (res.strikes || []).some(z => z.by === u.id && z.hit) && Math.abs(u.x - t.x) + Math.abs(u.y - t.y) === 1 && !t.big && !t.rooted) { const px = t.x + (t.x - u.x), py = t.y + (t.y - u.y);
      if (inb(px, py) && !unitAt(st, px, py) && moveCost(st, t, px, py) < 99) { t.x = px; t.y = py; res.pushed = t.id; } }
    for (const B of [t, u]) if (B._windLine) { delete B._windLine; res.lines = [...(res.lines || []), [B.name || '', 'Not yet! I am not finished!']]; }
    if (u.big && u.sweep) { const dealt = (res.strikes || []).filter(z => z.by === u.id && z.hit).reduce((n, z) => n + z.dmg, 0), half = Math.floor(dealt / 2); res.splash = res.splash || [];
      if (half > 0) for (const o of st.units) { if (o === t || o.hp <= 1 || o.x < 0 || !foes(u, o) || bodyDist(u.x, u.y, true, o.x, o.y, o.big) !== 1) continue; const d = Math.min(half, o.hp - 1); o.hp -= d; res.splash.push({ id: o.id, dmg: d, hpAfter: o.hp }); }
      if (res.splash.length) res.sweep = true; }
    if (gam) { u._gambits--; const dealt = (res.strikes || []).filter(z => z.by === u.id && z.hit).reduce((n, z) => n + z.dmg, 0), half = Math.floor(dealt / 2); res.splash = [];
      if (half > 0) for (const o of st.units) { if (o === t || o.hp <= 1 || o.x < 0 || !foes(u, o) || Math.abs(o.x - t.x) + Math.abs(o.y - t.y) !== 1) continue; const d = Math.min(half, o.hp - 1); o.hp -= d; res.splash.push({ id: o.id, dmg: d, hpAfter: o.hp }); }
      const lvUp = batGain(u.bat); res.gambit = { name: gam.name, kind: 'assault', battalion: u.bat.name, levelUp: lvUp ? u.bat.level : 0 }; (st.gambitsUsed = st.gambitsUsed || []).push(gam.name); }
    if (art && art.relic && !(u.awake > 0)) u._sArtUsed = true;
    if (art) { res.art = art.name; const first = (res.strikes || []).find(s => s.by === u.id); if (first && !first.skill) first.skill = art.name; if (first) first.art = art.name;
      const b = art.cost > 1 ? useUp(u, wa, art.cost - 1) : null; if (b) res.broke.push({ id: u.id, name: b }); (st.artsUsed = st.artsUsed || []).push(art.name); }
    if (u.team === 'player' && (res.strikes || []).some(s => s.by === u.id && s.hit)) st.lastPlayerDmg = st.turn;
    for (const [who, wid] of [[u, wa], [t, wd]]) { const n = (res.strikes || []).filter(s => s.by === who.id).length; if (n) { const b = useUp(who, wid, n); if (b) res.broke.push({ id: who.id, name: b });
        if (who.team === 'player' && rankReq(wid) > 0) { if (!who.wexp) who.wexp = startRanks(CLASSES[who.cls]); const k = rankKey(wid), before = rankLetter(who.wexp[k] || 0); who.wexp[k] = Math.min(251, (who.wexp[k] || 0) + 2 * n);
          const after = rankLetter(who.wexp[k]); if (after !== before) (res.rankUp = res.rankUp || []).push({ id: who.id, kind: k, rank: after }); } } }
    for (const dead of [t, u]) if (dead.hp <= 0 && dead.carrying) { const o = st.units.find(z => z.id === dead.carrying); dead.carrying = null; if (o) { o.carriedBy = null; const sp = freeTiles(st, [dead.x, dead.y], 1, 2)[0] || [dead.x, dead.y]; o.x = sp[0]; o.y = sp[1]; (res.setDown = res.setDown || []).push(o.id); } }
    for (const [dead, killer] of [[t, u], [u, t]]) if (dead.hp <= 0 && killer.hp > 0 && killer.team === 'player' && dead.drop && dead.items && dead.items.length) {
      const real = dead.items.filter(it => WEAPONS[it.id] && !['claw', 'eye', 'breath', 'dance', 'none'].includes(WEAPONS[it.id].type)); if (!real.length) continue;
      const loot = real.find(it => it.drop) || real[real.length - 1];
      if ((canWield(killer, loot.id) || WEAPONS[loot.id].consumable) && addItem(killer, loot.id)) { killer.items[killer.items.length - 1].uses = loot.uses; res.got = { id: killer.id, name: WEAPONS[loot.id].name }; }
      else { (st.convoy = st.convoy || []).push({ id: loot.id, uses: loot.uses, max: loot.max }); res.got = { id: killer.id, name: WEAPONS[loot.id].name, convoy: true }; } } }
  else if (act.type === 'heal') { if (act.weapon && WEAPONS[act.weapon]) u.weapon = act.weapon; const t = st.units.find(o => o.id === act.target); const amt = Math.min(t.maxhp - t.hp, u.mag + (WEAPONS[u.weapon].power || 10)); t.hp += amt; const br = useUp(u, u.weapon, 1); if (br) res.broke = [{ id: u.id, name: br }];
    res.target = t.id; res.amount = amt; if (u.team === 'player') { res.exp = [gainExp(st, u, 18)]; u.wexp = u.wexp || {}; u.wexp.staff = Math.min(251, (u.wexp.staff || 0) + 3); } }
  else if (act.type === 'refresh') { const t = st.units.find(o => o.id === act.target); t.moved = false; res.target = t.id; if (u.team === 'player') res.exp = [gainExp(st, u, 15)]; }
  else if (act.type === 'staff') applyStaff(st, u, act, res);
  else if (act.type === 'recruit') { const o = st.units.find(z => z.id === act.target); if (o && o.hp > 0 && o.team === 'enemy' && o.recruitBy === u.id) { const f = facts(st._camp, st, { name: o.name });
      res.lines = [[u.name, STORY.pick(st._camp, 'rec_open', HT.rec_open, st._camp.rng, f)], [o.name, STORY.pick(st._camp, 'rec_join', HT.rec_join, st._camp.rng, f)], ['', `${o.name} joins the army.`]]; o.recruitBy = null; joinArmy(st, o); res.target = o.id; } }
  else if (act.type === 'rescue') { const o = st.units.find(z => z.id === act.target); if (o && o.hp > 0 && !o.carriedBy && Math.abs(o.x - u.x) + Math.abs(o.y - u.y) === 1) { o.carriedBy = u.id; o.carryFrom = [o.x, o.y]; o.x = -99; o.y = -99; o.moved = true; u.carrying = o.id; res.target = o.id; res.rescued = o.id; res.lines = [[u.name, STORY.pick(st._camp, 'resc', HT.rescue_l, st._camp.rng, facts(st._camp, st))]]; } }
  else if (act.type === 'drop') { const sp = dropSpot(st, u); const o = st.units.find(z => z.id === u.carrying); if (o && sp) { o.x = sp.x; o.y = sp.y; o.carriedBy = null; u.carrying = null; o.moved = true; res.dropped = o.id; res.dropAt = [sp.x, sp.y]; } }
  else if (act.type === 'torch') { const it = (u.items || []).find(z => z.id === 'torch' && z.uses > 0); if (it) { it.uses--; if (it.uses <= 0) u.items.splice(u.items.indexOf(it), 1); u.torchTurns = 4; res.torch = true; } }
  else if (act.type === 'talk') { const o = st.units.find(z => z.id === act.target); res.target = act.target; res.lines = [];
    if (o && o.hp > 0 && o.team === 'neutral') {
      if (o.role === 'merchant') { const opts = Object.keys(WEAPONS).filter(id => canWield(u, id) && (WEAPONS[id].tier || 1) >= 2 && PRICE[id]).sort((a, b) => PRICE[b] - PRICE[a]); const left = st.campGold + (st.gold || 0) - st.spent;
        const id = opts.find(i => PRICE[i] <= left && !(u.items || []).some(it => it.id === i)); if (id && addItem(u, id)) { st.spent += PRICE[id]; o.sold = true; res.lines.push(['', `${u.name} bought a ${WEAPONS[id].name} from the merchant for ${PRICE[id]} gold.`]); } else o.sold = true; }
      else if (o.role === 'hero') { const f = facts(st._camp, st); res.lines.push([u.name, STORY.pick(st._camp, 'evhero_ask', EV.hero_ask, st._camp.rng, f)]); res.lines.push([o.name, STORY.pick(st._camp, 'evhero_join', EV.hero_join, st._camp.rng, f)]); joinArmy(st, o); }
      else if (o.role === 'prisoner') { res.lines.push(['', evLine(st, 'prison_free', { name: o.name })]); res.lines.push([o.name, speak(st._camp, o, 'recruit', facts(st._camp, st))]); joinArmy(st, o); }
      else if (o.role === 'deserter') { res.lines.push([o.name, speak(st._camp, o, 'recruit', facts(st._camp, st))]); joinArmy(st, o); } } }
  else if (act.type === 'raid') { const k = u.y * W + u.x; if (st.map.terr[k] === 0x03 || st.map.terr[k] === 0x05) { st.map.terr[k] = 0x25; res.burned = true; res.lines = [['', evLine(st, 'bandit_burn')]];
      if (st.plea === k && !st.pleaSaved) { st.pleaLost = true; res.lines.push(['', evLine(st, 'plea_lost')]); } } }
  else if (act.type === 'visit' && st.map.terr && st.map.terr[u.y * W + u.x] === 0x05) { const k = u.y * W + u.x; if (st.visited && !st.visited.has(k)) { st.visited.add(k); houseVisit(st, u, res); } }
  else if (act.type === 'visit') { const k = u.y * W + u.x; if (st.plea === k && !st.pleaLost) st.pleaSaved = true; if (st.visited && !st.visited.has(k)) { st.visited.add(k); const rng = st.rng;
      if (rng.chance(60)) { const g = 300 + rng.int(0, 7) * 100 + st.chapter * 50; st.gold = (st.gold || 0) + g; res.gold = g; }
      else { const opts = ['vulnerary', 'vulnerary', 'elixir', 'torch', 'chest_key', 'door_key', 'restore', 'barrier_staff', 'torch_staff', 'unlock', ...(rng.chance(20) ? [rng.pick(Object.keys(BOOSTERS))] : []), ...Object.keys(WEAPONS).filter(id => canWield(u, id) && (WEAPONS[id].tier || 1) >= 2)]; const id = rng.pick(opts);
        if (addItem(u, id)) res.gift = WEAPONS[id].name; else { (st.convoy = st.convoy || []).push(item(id)); res.gift = WEAPONS[id].name + ' (to the convoy)'; } } } }
  else if (act.type === 'door') { const k = act.target; if (st.map.terr[k] === 0x1E && Math.abs(k % W - u.x) + Math.abs(Math.floor(k / W) - u.y) === 1 && canOpenDoors(u)) {
      if (!/thief|rogue|assassin/i.test(CLASSES[u.cls].name || '')) { const key = u.items.find(it => it.id === 'door_key' && it.uses > 0); if (key) { key.uses--; if (key.uses <= 0) u.items.splice(u.items.indexOf(key), 1); } }
      openDoor(st, k, res); } }
  else if (act.type === 'break') { const b = st.breaks && st.breaks[act.target]; if (b) strikeBreak(st, u, b, res); }
  else if (act.type === 'chest') { const k = u.y * W + u.x; if (st.map.terr[k] === 0x21 && canOpenChests(u)) { const rng = st.rng; st.map.terr[k] = 0x20; res.chest = true;
      if (!/thief|rogue|assassin/i.test(CLASSES[u.cls].name || '')) { const key = u.items.find(it => it.id === 'chest_key' && it.uses > 0); if (key) { key.uses--; if (key.uses <= 0) u.items.splice(u.items.indexOf(key), 1); } }
      if (rng.chance(50)) { const g = 500 + rng.int(0, 15) * 100 + st.chapter * 80; st.gold = (st.gold || 0) + g; res.gold = g; }
      else { const opts = ['elixir', 'chest_key', 'door_key', 'physic', 'restore', 'rescue_staff', rng.pick(Object.keys(BOOSTERS)), rng.pick(Object.keys(BOOSTERS)), ...Object.keys(WEAPONS).filter(id => (WEAPONS[id].tier || 1) >= 2 && !WEAPONS[id].consumable && WEAPONS[id].uses)]; const id = rng.pick(opts);
        if (addItem(u, id)) res.gift = WEAPONS[id].name; else { (st.convoy = st.convoy || []).push(item(id)); res.gift = WEAPONS[id].name + ' (to the convoy)'; } } } }
  else if (act.type === 'vulnerary') { const id = act.item || 'vulnerary', amt = Math.min(WEAPONS[id] ? WEAPONS[id].power : 10, u.maxhp - u.hp); u.hp += amt; res.amount = amt; res.item = WEAPONS[id] ? WEAPONS[id].name : 'Vulnerary';
    const it = (u.items || []).find(x => x.id === id && x.uses > 0); if (it) { it.uses--; if (it.uses <= 0) u.items.splice(u.items.indexOf(it), 1); } }
  if (st.goal === 'seize' && u.leader && st.map.throne && u.x === st.map.throne.x && u.y === st.map.throne.y && !(st.keysLeft > 0)) { st.seized = true; res.seized = true; }
  if (act.type === 'steal') { const k = u.y * W + u.x; if (st.map.terr[k] === 0x21) { st.map.terr[k] = 0x20; u.stole = true; const loot = rng0(st).pick(['elixir', 'silver_sword', 'silver_lance', 'brave_axe', 'physic', 'chest_key']); u.items.push(Object.assign(item(loot), { drop: true })); u.drop = true; res.lines = [['', mvLine(st, 'thief_steal')]]; } }
  if (act.type === 'flee') { if (u.courier) { st.enemyCourierArrived = st.enemyCourierArrived || st.turn; u.hp = 0; u.escaped = true; res.lines = [['', `The enemy's rider reaches ${st.courier ? st.courier.cmd : 'the commander'} first.`]]; } else if (u.role === 'stealer') { u.hp = 0; u.escaped = true; res.escapedRunner = true; res.lines = [['', mvLine(st, 'thief_gone')]]; } else if (u.fleeing) { st.bossEscaped = true; u.hp = 0; u.escaped = true; res.escapedRunner = true; } }
  if (u.team === 'player' && u.leader && st.goal === 'escape' && st.exitGoal && u.x === st.exitGoal[0] && u.y === st.exitGoal[1]) st.escaped = true;
  if (st.traps && st.traps.has(u.y * W + u.x)) { const k = u.y * W + u.x, a = Math.min(10, u.hp - 1); st.traps.delete(k); st.trapsShown.delete(k); (st.sprung = st.sprung || []).push(k); if (a > 0) u.hp -= a; res.trap = { id: u.id, dmg: a }; res.lines = [...(res.lines || []), ['', `${u.name || className(u)} steps on a hidden spike trap${a > 0 ? ` and takes ${a} damage` : ''}.`]]; }
  if (st.jailbreak && u._stash && Math.abs(u.x - st.jailbreak.armory[0]) + Math.abs(u.y - st.jailbreak.armory[1]) <= 1) { u.items = u._stash.concat(u.items); delete u._stash; equipBest(u); res.lines = [...(res.lines || []), [u.name, 'My own blade again. Now we fight.']]; }
  if (u.team === 'neutral' && u.role === 'escort' && st.exitGoal && Math.abs(u.x - st.exitGoal[0]) + Math.abs(u.y - st.exitGoal[1]) <= 1) { st.escorted = true; if (u.cub) for (const o of st.units) if (o.wild === u.wild && o.hostile) o.hostile = false; }
  if (u.team === 'neutral' && u.role === 'deserter' && st.units.some(o => o.team === 'player' && o.hp > 0 && manhattan(o, u) === 1)) { res.lines = [[u.name, speak(st._camp, u, 'recruit', facts(st._camp, st))]]; joinArmy(st, u); }
  if (u.team === 'neutral' && u.role === 'refugee' && st.exitTile && Math.abs(u.x - st.exitTile[0]) + Math.abs(u.y - st.exitTile[1]) <= 1) { u.hp = 0; u.saved = true; st.refugees = (st.refugees || 0) + 1; res.saved = true; res.lines = [[u.name, evLine(st, 'refugee_safe')]]; }
  if (u.hp > 0 && !act.commanded && skillsOf(u).canto && act.type !== 'vulnerary' && !res.seized) {
    const left = CLASSES[u.cls].mov - Math.max(0, act.path.length - 1);
    if (left >= 1) { const dist = reach(st, u, left); let best = [u.x, u.y], bs = danger(st, u, u.x, u.y);
      for (const k of dist.keys()) { const x = k % W, y = Math.floor(k / W), o = unitAt(st, x, y); if (o && o !== u) continue; const dg = danger(st, u, x, y) - (allyNear(st, u, x, y) ? 1 : 0); if (dg < bs - 2) { bs = dg; best = [x, y]; } }
      if (best[0] !== u.x || best[1] !== u.y) { res.canto = { from: [u.x, u.y], path: pathTo(dist, best[0], best[1]) }; u.x = best[0]; u.y = best[1]; } } }
  return res;
}
function outcome(st) {
  const lord = st.units.find(u => u.leader);
  if (!lord || lord.hp <= 0) return st.side ? 'retreat' : 'defeat';
  const live = st.units.filter(u => u.team === 'enemy' && u.hp > 0);
  if (st.goal === 'rout' && live.length === 0 && !st.units.some(u => u.axis && u.hp > 0)) return 'victory';
  if (st.goal === 'boss' && !live.some(u => u.boss)) return 'victory';
  if (st.goal === 'seize' && st.seized) return 'victory';
  if (st.goal === 'carts' && !st.units.some(u => u.cart && u.hp > 0)) return 'victory';
  if (st.goal === 'banners') { if (st.bannerHeld >= 2 || live.length === 0) return 'victory'; if (st.bannerLost >= 4 && st.turn >= 6) return 'retreat';
    if (st.turn > 15) { const p = st.banners.filter(b => b.owner === 'player').length, e = st.banners.filter(b => b.owner === 'enemy').length; return p >= e ? 'victory' : 'retreat'; } }
  if (st.goal === 'escape' && st.escaped) return 'victory';
  if (st.goal === 'rescue' && st.captive && st.units.some(o => o.id === st.captive && o.team === 'player')) return 'victory';
  if (st.goal === 'escort') { const e = st.units.find(o => o.id === st.escortee); if (st.escorted) return 'victory'; if (!e || e.hp <= 0) return 'retreat'; }
  if (st.goal === 'flee') { if (st.bossEscaped) return 'retreat'; if (!live.some(u => u.boss)) return 'victory'; }
  if (st.goal === 'defend' && st.defendTile) { const on = unitAt(st, st.defendTile[0], st.defendTile[1]); if (on && on.team === 'enemy' && st.phase === 'enemy') return 'retreat'; if (st.turn > st.defendTurns) return 'victory'; }
  if (st.goal === 'survive' && st.turn > st.surviveTurns) return 'victory';
  if (st.goal === 'survive' && live.length === 0) return 'victory';
  const players = st.units.filter(u => u.team === 'player' && u.hp > 0).length;
  if (players === 1 && live.length && st.goal !== 'survive') {          // lord alone: retreat if nothing changes
    const enemyHp = live.reduce((a, u) => a + u.hp, 0);
    if (st.aloneHp !== enemyHp) { st.aloneHp = enemyHp; st.aloneTurn = st.turn; }
    if (st.turn - st.aloneTurn >= 4) return 'retreat';
  }
  if (st.turn > 45 + Math.max(0, Math.floor(((st._startEnemies || 0) - 20) / 2))) return 'retreat';        // stalemate guard (Casim 3A: +1 turn per two enemies above 20)
  return null;
}
function phaseOrder(st, team) {
  if (st.side || st.clampLv) for (const u of st.units) if (u.team !== 'player' && u.team !== 'ally' && u.hp > 0 && !u._clamped) { u._clamped = true; sideClamp(st, u); }   // after every arrival this turn (risen and shades come in the hazard step)
  const us = st.units.filter(u => u.team === team && u.hp > 0 && !u.carriedBy && u.x >= 0);
  const rank = u => u.leader ? 9 : CLASSES[u.cls].dancer ? 7 : CLASSES[u.cls].healer ? 8 : (WEAPONS[u.weapon].max > 1 ? 1 : 2);
  return us.sort((a, b) => rank(a) - rank(b) || a.id - b.id);
}
// an allied army: soldiers of the realm's doctrine around their own named commander, on the enemy's side but not under its banner
function axisArmy(st, rng, plan, ax, ay) { const W = st.map.w, H = st.map.h, out = [], lv = Math.max(1, enemyLevel(st._camp || {}, st.chapter));
  const lead = makeUnit(rng, plan.leaderCls || (POOL ? poolPick(rng, c => !c.healer, true) : 'Knight'), 'other', lv + 2); lead.axis = true; lead.name = plan.leader; lead.axisLeader = true; lead.ai = 'wake';
  const players = st.units.filter(o => o.team === 'player' && o.hp > 0), farOk = (x, y) => !players.some(p => Math.abs(p.x - x) + Math.abs(p.y - y) < 8);
  const place = (u, cx, cy) => { for (let r = 0; r <= 3; r++) { const ring = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= W || y >= H || unitAt(st, x, y) || moveCost(st, u, x, y) >= 99 || !farOk(x, y)) continue; ring.push([x, y]); } if (ring.length) { const [x, y] = rng.pick(ring); u.x = x; u.y = y; return true; } } return false; };
  if (place(lead, ax, ay)) { st.units.push(lead); out.push(lead.id); }
  for (let i = 0; i < plan.size; i++) { const cls = POOL ? poolPick(rng, c => (plan.doc && rng.chance(70) ? DOCTRINE_TEST[plan.doc](c) : !c.healer) && !c.dancer, st.chapter >= 12 && rng.chance(25)) : 'Soldier';
    const u = makeUnit(rng, cls || 'Soldier', 'other', lv); u.axis = true; u.name = null; u.ai = rng.chance(60) ? 'wake' : 'pursue'; if (place(u, ax, ay)) { st.units.push(u); out.push(u.id); } }
  return out; }
function spawnWave(st) {
  const R = st.reinforce, rng = st.rng, n = st.chapter, out = [], count = Math.min(3, 1 + Math.floor(n / 6) + rng.int(0, 1));
  const slots = (st.eSlots || []).filter(([x, y]) => !unitAt(st, x, y) && !st.units.some(o => o.hp > 0 && o.team === 'player' && Math.abs(o.x - x) + Math.abs(o.y - y) < 5));
  for (let i = 0; i < count && slots.length; i++) { const cls = POOL ? poolPick(rng, c => !c.healer && !c.dancer, n >= 12 && rng.chance(25)) : rng.pick(['Soldier', 'Fighter', 'Mercenary', 'Archer']);
    const e = makeUnit(rng, cls, 'enemy', R.lv); const [x, y] = slots.splice(rng.int(0, slots.length - 1), 1)[0]; if (moveCost(st, e, x, y) >= 99) continue; e.x = x; e.y = y; e.ai = 'pursue'; e.name = null; st.units.push(e); out.push(e.id); }
  return out;
}
// vision in fog, as in FE: 3 tiles, fliers 5, thieves 8, and a lit torch adds 5 for four turns
function visionOf(o) { const n = (CLASSES[o.cls] && CLASSES[o.cls].name || '').toLowerCase(); return (/thief|rogue|assassin/.test(n) ? 8 : CLASSES[o.cls].flier ? 5 : 3) + (o.torchTurns > 0 ? 5 : 0); }
function visible(st, x, y) { if (!st.fog) return true; if ((st.braziers || []).some(l => Math.abs(l.x - x) + Math.abs(l.y - y) <= l.r)) return true; if ((st.lights || []).some(l => Math.abs(l.x - x) + Math.abs(l.y - y) <= l.r)) return true; return st.units.some(o => o.hp > 0 && o.team === 'player' && Math.abs(o.x - x) + Math.abs(o.y - y) <= visionOf(o)); }
function relicSleep(u) { if (u._relicBoost) for (const [k, v] of Object.entries(u._relicBoost)) u[k] -= v; u._relicBoost = null; u.awake = 0; u._resonant = false; }
function endPhase(st, team) { for (const u of st.units) if (u.team === team && u.awake > 0 && --u.awake <= 0) relicSleep(u); st.arrivals = null; st.arrivalLabel = null; if (team === 'enemy' && st.reinforce && st.reinforce.turns.includes(st.turn)) st.arrivals = spawnWave(st);
  // an allied army marches in from the edge farthest from the player's side
  if (team === 'enemy' && st.axis && st.axis.mode === 'march' && !st.axis.arrived && st.turn >= st.axis.turn) { const W = st.map.w, H = st.map.h, wk = st._walk || [], rng = st.rng; let best = null;
    for (let k = 0; k < W * H; k++) { const x = k % W, y = (k / W) | 0; if (x && y && x < W - 1 && y < H - 1) continue; if (!(wk[k] >= 0) || unitAt(st, x, y)) continue; if (st.units.some(o => o.hp > 0 && o.team === 'player' && Math.abs(o.x - x) + Math.abs(o.y - y) < 7)) continue; if (!best || wk[k] > best.d) best = { d: wk[k], x, y }; }
    if (best) { const ids = axisArmy(st, rng, st.axis, best.x, best.y); st.axis.arrived = true; st.axis.corner = (best.y < H / 2 ? 'north' : 'south') + (best.x < W / 2 ? '-west' : '-east'); st.arrivals = (st.arrivals || []).concat(ids); st.arrivalLabel = `Soldiers from ${st.axis.realm} have arrived in the ${st.axis.corner} corner to help ${st.axis.with}.`; } }
  return st.arrivals; }
function riseFallen(st) { if (!st.graveyard || !(st.graveQueue || []).length) return []; const out = [], camp = st._camp, rng = st.rng;
  // each of the fallen rises at even odds, at most eight in a chapter, so the dead unsettle the battle without swamping it
  for (const g of st.graveQueue.splice(0)) { if (unitAt(st, g.x, g.y) || (st.risenCount || 0) >= 8 || !rng.chance(50)) continue; st.risenCount = (st.risenCount || 0) + 1; const z = makeUnit(rng, g.cls, 'neutral', g.level);
    Object.assign(z, { team: 'neutral', hostile: true, wild: 'spirit', risen: true, name: 'Risen ' + (g.name || className({ cls: g.cls })), x: g.x, y: g.y }); z.hp = Math.ceil(z.maxhp * 0.7); st.units.push(z); out.push(z.name); }
  if (out.length) (st.eventLines = st.eventLines || []).push(['', out.length > 1 ? `${out.length} of the fallen rise again: ${out.join(', ')}.` : `${out[0]} rises from the dead.`]); return out; }
function startPhase(st, team) {
  if (st.side || st.clampLv) for (const u of st.units) if (u.team !== 'player' && u.team !== 'ally' && u.hp > 0 && !u._clamped) { u._clamped = true; sideClamp(st, u); }   // arrivals by any path on the second route
  st.phase = team; failsafe(st); for (const u of st.units) { if (u.team === team) u.broken = false; if (u._gbuff && u._gbuff.team === team) u._gbuff = null; }
  if (st._camp && (st._camp.relics || []).length) { st.awoke = st.awoke || {};
    for (const u of st.units) { if (u.team !== team || u.awake > 0) continue; const r = relicOf(st._camp, u); if (!r || u.hp <= 0 || u.x < 0 || (st.awoke[u.id] || 0) >= ((r.tier || 0) >= 3 ? 2 : 1)) continue;
      const reach = (CLASSES[u.cls].mov || 5) + 3; if (!st.units.some(o => o.hp > 0 && o.x >= 0 && foes(u, o) && Math.abs(o.x - u.x) + Math.abs(o.y - u.y) <= reach)) continue;
      // a commander wielding the relic against the army awakens it for two turns, without resonance or aura; the army's holders get the full relic
      const foe = u.team !== 'player', res = !foe && resonant(st._camp, u, r), extra = (res ? 2 : 0) + ((r.tier || 0) >= 2 ? 1 : 0);
      const remembers = !foe && relicRemembers(st, r);
      st.awoke[u.id] = (st.awoke[u.id] || 0) + 1; u.awake = foe ? 2 : 3 + (res ? 1 : 0) + ((r.tier || 0) >= 1 ? 1 : 0) + (remembers ? 1 : 0); u._resonant = res;
      u._relicBoost = {}; for (const [k, v] of Object.entries(r.boost)) { u._relicBoost[k] = v + extra; u[k] += v + extra; }
      (st.relicLines = st.relicLines || []).push([u.name, `awakens ${relicFull(r)}.${res ? ` The crest of ${r.hero} answers it.` : ''}${remembers ? ' It remembers this ground.' : ''}`]); } }
  st.eventLines = team === 'player' ? [...fireEvents(st), ...fireMapEvent(st)] : [];
  if (st.relicLines) { st.eventLines.push(...st.relicLines); st.relicLines = null; }
  if (team === 'player' && st.sideLines) { st.eventLines.unshift(...st.sideLines); st.sideLines = null; }
  if (team === 'neutral') riseFallen(st);
  if (st.banners) { for (const b of st.banners) { const o = unitAt(st, b.x, b.y); if (o && (o.team === 'player' || o.team === 'enemy')) b.owner = o.team; }
    if (team === 'player') { st.bannerHeld = st.banners.every(b => b.owner === 'player') ? st.bannerHeld + 1 : 0; st.bannerLost = st.banners.every(b => b.owner === 'enemy') ? st.bannerLost + 1 : 0;
      if (st.bannerHeld === 1) st.eventLines.push(['', 'All three banners fly our colours. Hold them one more turn.']); if (st.bannerLost === 3) st.eventLines.push(['', 'The enemy holds every banner. One more turn and the field is theirs.']); } }
  if (st.jailbreak && team === 'enemy' && st.turn >= st.jailbreak.wake && !st.jailbreak.woke) { st.jailbreak.woke = true; for (const u of st.units) if (u.team === 'enemy' && u._wasAi !== undefined) { u.ai = u._wasAi === 'hold' ? 'pursue' : u._wasAi; delete u._wasAi; }
    st.eventLines.push(['', 'The cells are empty! Sound the alarm!']); }
  if (team === 'player' && st.smokeUntil && st.turn > st.smokeUntil && st.fog) { st.fog = false; st.smokeUntil = 0; st.eventLines.push(['', 'The smoke thins and blows away. The field is clear again.']); }
  if (team === 'enemy' && st.hospital) { const T = st.units.find(u => u.id === st.hospital && u.hp > 0); if (!T) { st.hospital = null; st.eventLines.push(['', 'The field hospital burns. Their wounded will not be patched up again.']); }
    else for (const u of st.units) if (u.team === 'enemy' && u.hp > 0 && u !== T && u.hp < u.maxhp && Math.abs(u.x - T.x) + Math.abs(u.y - T.y) <= 2) u.hp = Math.min(u.maxhp, u.hp + 5); }
  if (team === 'enemy' && st.retreatBoss && st.turn >= st.retreatBoss.turn && !st.retreatBoss.done) { st.retreatBoss.done = true; const B = st.units.find(u => u.id === st.retreatBoss.id && u.hp > 0);
    if (B && st._camp) { st._camp.returnBoss = { name: B.name, cls: B.cls, level: B.level, at: st.chapter + 2 }; B.hp = 0; B.escaped = true; B.x = -1; B.y = -1; st.eventLines.push([B.name || '', 'This is not over. I will be back, and I will not come alone.']); } }
  if (team === 'enemy' && st.feint && st.turn >= st.feint.turn && !st.feint.done) { st.feint.done = true; const camp = st._camp, P = st.units.filter(u => u.team === 'player' && u.hp > 0 && u.x >= 0);
    for (const u of st.units) if (st.feint.ids.includes(u.id) && u.hp > 0) u.ai = u._feignAi === 'hold' ? 'pursue' : (u._feignAi || 'pursue');
    if (camp && P.length) { const c = st.rng.pick(P); let k = 0; for (const at of freeTiles(st, [c.x, c.y], 3, 4)) { spawn(st, POOL ? poolPick(st.rng, c2 => !c2.monster && !c2.healer, false) : 'Fighter', 'enemy', Math.max(1, enemyLevel(camp, st.chapter)), at); k++; }
      if (k) st.eventLines.push(['', 'The retreat was a lie. Enemy soldiers rise out of cover all around the army.']); } }
  if (team === 'enemy' && st.flankers && st.turn >= st.flankers.turn && !st.flankers.done) { st.flankers.done = true; const camp = st._camp, P = st.units.filter(u => u.team === 'player' && u.hp > 0);
    if (camp && P.length) { const cx = Math.round(P.reduce((a, u) => a + u.x, 0) / P.length), cy = Math.round(P.reduce((a, u) => a + u.y, 0) / P.length), E2 = st.units.filter(u => u.team === 'enemy' && u.hp > 0);
      const ex = E2.length ? E2.reduce((a, u) => a + u.x, 0) / E2.length : cx, ey = E2.length ? E2.reduce((a, u) => a + u.y, 0) / E2.length : cy, bx = Math.max(0, Math.min(st.map.w - 1, Math.round(cx + (cx - ex) * 0.6))), by = Math.max(0, Math.min(st.map.h - 1, Math.round(cy + (cy - ey) * 0.6)));
      let k = 0; for (const at of freeTiles(st, [bx, by], 3, 5)) { spawn(st, POOL ? poolPick(st.rng, c => c.canto && !c.flier && !c.monster && c.wpn !== 'staff', false) || poolPick(st.rng, c => !c.monster, false) : 'Cavalier', 'enemy', Math.max(1, enemyLevel(camp, st.chapter)), at); k++; }
      if (k) st.eventLines.push(['', 'Hoofbeats from behind. Enemy riders have come round the flank.']); } }
  if (team === 'enemy' && st.ritual && st.turn >= st.ritual.turn && !st.ritual.done) { st.ritual.done = true; const alive = st.units.some(u => st.ritual.ids.includes(u.id) && u.hp > 0);
    if (alive) { for (const u of st.units) if (u.team === 'enemy' && u.hp > 0) u.hp = u.maxhp; st.eventLines.push(['', 'The chant ends. A dark light washes over the enemy, and every wound on their side closes.']); }
    else st.eventLines.push(['', 'The chanters are down. Their ritual dies with them.']); }
  if (team === 'enemy' && st.seaborne && st.turn >= st.seaborne.turn && !st.seaborne.done) { st.seaborne.done = true; const camp = st._camp; let k = 0;
    if (camp) for (const [x, y] of st.seaborne.at) { if (k >= 3 || unitAt(st, x, y)) continue; spawn(st, POOL ? poolPick(st.rng, c => !c.monster && !c.healer, false) : 'Pirate', 'enemy', Math.max(1, enemyLevel(camp, st.chapter)), [x, y]); k++; }
    if (k) st.eventLines.push(['', 'Boats run up onto the shore and fresh troops leap into the surf.']); }
  if (team === 'enemy' && st.traitor && st.turn >= st.traitor.turn && !st.traitor.done) { st.traitor.done = true; const t = st.units.find(u => u.id === st.traitor.id && u.hp > 0);
    if (t) { t.team = 'enemy'; t.ai = 'pursue'; t.traitorTurned = true; st.eventLines.push([t.name, 'I was paid to join you, and paid well. Nothing personal.']); } }
  if (team === 'enemy' && st.falseFlag && st.turn >= 3 && !st.falseFlagDone) { st.falseFlagDone = true; let k = 0;
    for (const u of st.units) if (st.falseFlag.includes(u.id) && u.hp > 0) { u.team = 'enemy'; u.ai = 'pursue'; k++; }
    if (k) st.eventLines.push(['', `The soldiers of ${st.falseFlagFrom} turn their blades on the army. It was a trap from the start.`]); }
  if (team === 'enemy' && st.hostages) for (const g of st.units) { if (!g.hostageOf || g.hp <= 0 || g.team !== 'enemy') continue; const c = st.units.find(o => o.id === g.hostageOf && o.hp > 0 && o.team === 'neutral');
    if (c && g.hp < (g._hp0 || g.hp) && Math.abs(c.x - g.x) + Math.abs(c.y - g.y) <= 2) { const a = Math.min(8, c.hp - 1); if (a > 0) { c.hp -= a; st.eventLines.push([g.name || '', `You were warned. ${c.name} pays for that.`]); } } g._hp0 = g.hp; }
  if (team === 'enemy' && st.wedding && !st.wedding.sprung && st.turn >= 2) { st.wedding.sprung = true; let k = 0;
    for (const u of st.units) if (u.disguised && u.hp > 0) { u.team = 'enemy'; u.disguised = false; u.role = null; u.ai = 'pursue'; u.name = u.name || 'Assassin'; k++; }
    if (k) st.eventLines.push(['', `${k === 1 ? 'One of the guests throws off a cloak' : k + ' of the guests throw off their cloaks'}. They were never guests.`]); }
  if (team === 'enemy' && st.stealth && !st.stealth.alarm) { const sent = st.units.filter(u => u.sentry && u.hp > 0), P = st.units.filter(u => u.team === 'player' && u.hp > 0 && u.x >= 0);
    const seen = sent.find(sn => sn.hp < sn.maxhp || P.some(p => Math.abs(p.x - sn.x) + Math.abs(p.y - sn.y) <= 3));
    if (seen) { st.stealth.alarm = st.turn; for (const u of st.units) if (u.team === 'enemy' && u.hp > 0) { u.sentry = false; if (u.ai === 'hold' && !u.boss && !u.rooted) u.ai = 'pursue'; }
      const far = (st.eSlots || []).slice(-6); const camp = st._camp; if (camp) for (let i = 0; i < 3 && i < far.length; i++) spawn(st, POOL ? poolPick(st.rng, c => !c.healer && !c.monster, false) : 'Fighter', 'enemy', Math.max(1, enemyLevel(camp, st.chapter)), far[i]);
      st.eventLines.push([seen.name || '', 'Alarm! To arms, they are inside the camp!']); } }
  if (team === 'player' && st.sideArrive && st.turn >= st.sideArrive) { st.sideArrive = 0; let came = 0, who = null;
    for (const u of st.waiting || []) { if (!u._arriveAt || u.hp <= 0) continue; const [ax, ay] = u._arriveAt; let spot = !unitAt(st, ax, ay) && moveCost(st, u, ax, ay) < 99 ? [ax, ay] : null;
      for (let r = 1; !spot && r < 6; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) { const x = ax + dx, y = ay + dy; if (inb(x, y) && !unitAt(st, x, y) && moveCost(st, u, x, y) < 99) spot = [x, y]; }
      if (spot) { u.x = spot[0]; u.y = spot[1]; st.units.push(u); came++; if (u.coLord) who = u; } u._arriveAt = null; } st.waiting = null;
    if (came) st.eventLines.push([who ? who.name : '', `${who ? who.name + "'s army" : 'The second army'} reaches the field and cuts into the enemy's flank.`]); }
  st.arrivals = null;
  if (team === 'player') for (const o of st.units) if (o.team === 'player' && o.torchTurns > 0) o.torchTurns--;
  if (team === 'player' && st.supports) { const ps = st.units.filter(o => o.team === 'player' && o.hp > 0); for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) if (Math.abs(ps[i].x - ps[j].x) + Math.abs(ps[i].y - ps[j].y) === 1) { const k = pairKey(ps[i], ps[j]); st.supports[k] = (st.supports[k] || 0) + 1; } }
  if (team === 'player') { if (st.lastPlayerDmg === st.turn - 1) st.stall = 0; else if (st.riskSkip === st.turn - 1) st.stall = (st.stall || 0) + 1; }
  const out = [];
  const statusHeals = []; tickStatus(st, team, statusHeals); tickHazards(st, team, statusHeals);
  for (const u of st.units) if (u.team === team && u.hp > 0 && !hasStatus(u, 'sleep')) { u.moved = false;
    const h = tHeal(st, u.x, u.y); if (h && u.hp < u.maxhp) { const a = Math.min(u.maxhp - u.hp, Math.ceil(u.maxhp * h / 100)); u.hp += a; out.push({ id: u.id, amount: a }); } }
  return out.concat(statusHeals);
}

// ---------------------------------------------------------------- campaign
const GOALS = ['rout', 'rout', 'seize', 'boss', 'survive'];
const GOAL_TEXT = { rout: 'Defeat all enemies', seize: 'Seize the throne', boss: 'Defeat the commander', survive: 'Survive {n} turns' };

function newCampaign(seed) {
  const rng = RNG(seed);
  const anyLeader = OPTIONS.leader === 'any' && POOL;
  const lord = makeUnit(rng, anyLeader ? poolPick(rng, c => !c.healer && !c.dancer) : POOL && POOL.lords.length ? rng.pick(POOL.lords) : 'Lord', 'player', 1); lord.leader = true; lord.maxhp += 4; lord.hp = lord.maxhp; lord.def += 2;
  const army = [lord];
  const starters = POOL ? [poolPick(rng, c => !c.healer && (c.mov >= 7)), poolPick(rng, c => !c.healer && c.wpn !== 'bow' && c.wpn !== 'fire' && c.mov < 7), poolPick(rng, c => c.wpn === 'bow' || c.wpn === 'fire'), poolPick(rng, c => c.healer)]
    : [rng.pick(['Cavalier','Knight','Soldier']), rng.pick(['Mercenary','Myrmidon','Fighter']), rng.pick(['Archer','Mage']), 'Cleric'];
  for (const cls of starters) army.push(makeUnit(rng, cls, 'player', rng.int(1, 2)));
  const tmp = { army: [], fallen: [] }; for (const u of army) u.name = uniqueName(tmp, rng);
  const faction = rng.pick(['the Ashen Order', 'the Crimson Legion', 'the Iron Pact', 'the Black Fang Remnant', 'the Thorn Banner', 'the Hollow Crown', 'the Grey Wolves', 'the Sable Host']);
  const rival = { name: uniqueName(tmp, rng), meetings: 0, defeated: false };
  const campTmp = { realm: null };
  return finishCampaign({ seed, rng, chapter: 0, lord: lord.id, army, fallen: [], log: [], realm: makePlace(rng), usedNames: tmp.usedNames, faction, rival, supports: {}, supportSeen: {}  }, tmp);
}
function poolPick(rng, test, promoted) {
  const keys = (promoted ? POOL.advanced : POOL.basic).filter(k => test(CLASSES[k]));
  return keys.length ? rng.pick(keys) : rng.pick(promoted ? POOL.advanced : POOL.basic);
}
function avgLevel(units) { return units.reduce((s, u) => s + u.level, 0) / Math.max(1, units.length); }

// ---------------------------------------------------------------- converging lords (Casim's design): about one book in three follows two
// lords. Chapters 1-10 are shared ground: the rival fights the lord (chapters 3, 6, 9) or an allied lord fights beside the army
// (chapter 8). After chapter 10 the rival turns (or the ally departs). The main lord plays on to the chapter before the meeting
// point (22-24); then the second lord's whole story plays (12-14 chapters of their own, the main chapter count does not move);
// then the armies join at the meeting chapter and finish the book together. The second path wins two relics of its own.
function convOf(camp) { const b = (camp.story && camp.story.book) || 1;
  if (!camp.conv || camp.conv.book !== b) { const r = RNG((((camp.seed || 0) >>> 0) ^ 0xC0B5) + b * 977);
    if (!camp.rival || camp.rival.defeated || camp.rival.turned) camp.rival = { name: uniqueName(camp, r), meetings: 0, defeated: false, book: b, motive: camp.story && camp.story.motive };   // a rival for each book
    const meetAt = 22 + r.int(0, 2);
    camp.conv = { book: b, on: r.chance(33), state: 'before', meetAt, sideLen: meetAt - 11, sideDone: 0, kind: null,
      allyName: uniqueName(camp, r), allyRealm: makePlace(r), sideRelics: 0 }; camp.conv.kind = camp.rival && !camp.rival.defeated && !camp.rival.turned && r.chance(50) ? 'rival' : 'ally'; }   // a mix: the turned rival or an allied lord
  return camp.conv; }
function sideLordOf(camp) { return camp.sideArmy && camp.sideArmy[0]; }
function buildSideArmy(camp, rng) { const c = camp.conv, rv = camp.rival, lvl = 1, avgShown = c.lv11 !== undefined ? c.lv11 : Math.max(1, Math.round(camp.army.filter(u => u.hp > 0).reduce((a, u) => a + lvShown(u), 0) / Math.max(1, camp.army.filter(u => u.hp > 0).length)));
  const classes = [...new Set(camp.army.filter(u => !u.leader).map(u => u.cls))]; const pick = () => classes.length ? rng.pick(classes) : camp.army[0].cls;
  const lordCls = c.kind === 'rival' && rv.cls && CLASSES[rv.cls] ? rv.cls : pick();
  const lord = makeUnit(rng, lordCls, 'player', lvl + 1); lord.name = c.kind === 'rival' ? rv.name : c.allyName; lord.leader = true; lord.sideLord = true; persona(camp, lord);
  const army = [lord]; for (let i = 0; i < 6; i++) { const u = makeUnit(rng, pick(), 'player', 1); u.name = uniqueName(camp, rng); persona(camp, u); army.push(u); }
  // Casim (1A): the second army starts at the main army's average level (1-40) as it stood at the book's chapter 11, where the
  // second lord's story begins, so both armies reach the meeting at about the same level; its enemies scale to it
  // a promoted class drawn below level 21 starts in its base class (it counted as Lv 21 at once, outranking its own lord)
  for (const u of army) { const goal = Math.min(40, avgShown + (u === lord ? 1 : rng.int(-1, 1))); u._sideGoal = goal;
    if (CLASSES[u.cls] && CLASSES[u.cls].promoted && goal <= 20) { const b = baseClassOf(u.cls); if (b && b !== u.cls && CLASSES[b]) { const f = makeUnit(rng, b, 'player', 1); u.cls = b; u.fe8 = b; for (const k of STATK) u[k] = f[k]; u.growth = f.growth; u.gCls = b; if (f.items) { u.items = f.items; u.weapon = f.weapon; } u.level = 1; } } }
  for (const u of army) { growTo(rng, u, u._sideGoal, null); delete u._sideGoal; }
  return army; }

function fixFooting(st) {
  // a non-player unit setup could not place (still at its starting -1,-1) is dropped rather than left to act from off the map
  st.units = st.units.filter(u => !(u.x < 0 && u.hp > 0 && u.team !== 'player' && !u._arriveAt && !u.carriedBy));
  for (const u of st.units) { if (u.hp <= 0 || u.x < 0 || moveCost(st, u, u.x, u.y) < 99) continue; const seen = new Set([u.y * W + u.x]), q = [[u.x, u.y]]; let spot = null;
    while (q.length && !spot) { const [x, y] = q.shift(); for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (!inb(nx, ny) || seen.has(k)) continue; seen.add(k);
        if (st.map.terr[k] === undefined) continue; if (moveCost(st, u, nx, ny) < 99 && !unitAt(st, nx, ny)) { spot = [nx, ny]; break; } q.push([nx, ny]); } }
    if (spot) { u.x = spot[0]; u.y = spot[1]; } } }
function newChapter(camp, opts) {
  const rng = camp.rng, skirmish = !!(opts && opts.skirmish), conv = convOf(camp), sideNow = !skirmish && conv.on && conv.state === 'side';
  const partMode = !!(opts && opts.part);
  if (skirmish) camp.lastSkirmish = camp.chapter; else if (!sideNow && !partMode) camp.chapter++;
  // the second lord's chapters: their army takes the field; the main army waits until the story comes back to it
  if (sideNow) { if (!camp.sideArmy) camp.sideArmy = buildSideArmy(camp, rng); camp._mainArmy = camp.army; camp._mainLord = camp.lord; camp.army = camp.sideArmy; camp.lord = camp.army[0].id; }
  // the meeting chapter: the two armies become one
  let reunion = null; if (!skirmish && !sideNow && conv.on && conv.state === 'reunite') { const side = (camp.sideArmy || []).filter(u => u.hp > 0 || u.maxhp); for (const u of side) { u.leader = false; u.coLord = !!u.sideLord; u.fromSide = true; }
    reunion = { lord: side.find(u => u.sideLord), count: side.length, kind: conv.kind, outcome: conv.sideOutcome }; camp.army = camp.army.concat(side); camp.sideArmy = null; conv.state = 'together';
    const mr = RNG((((camp.seed || 0) >>> 0) ^ 0xBEE5) + conv.book * 131), x = mr.int(0, 99);
    conv.meetKind = conv.kind === 'ally' && conv.sideOutcome === 'fallen' && side.length ? 'rescue' : !side.length ? 'rout' : x < 40 ? 'rout' : x < 70 ? 'boss' : 'ambush'; conv.thirdParty = conv.meetKind !== 'rescue' && mr.chance(30); }
  const n = Math.max(1, camp.chapter);
  const site = chapterSite(camp, !!(opts && opts.skirmish) || sideNow); const place = site ? site.name : makePlace(rng);
  const st = { rng, siteRealm: site ? site.realm : null, chapter: n, place, turn: 1, phase: 'player', seized: false, surviveTurns: rng.int(6, 9), part: null,
    title: (camp.story ? STORY.pick(camp, 'title', STORY.P.title_a, rng) : rng.pick(['Ashes at'])) + ' ' + place, units: [] };
  // multi-part battles (Casim: damage carries over with a short rest; now and then, for big moments): a book's final battle
  // (60%, two or three parts), the legendary beast's chapter (50%, two: the approach, then the lair) and the generals'
  // chapters 24-28 (30%, two). The villain, the beast and the generals wait in the last part.
  { const jbP = ((n - 1) % 30) + 1;
    if (partMode) st.part = { k: opts.part.k, of: opts.part.of };
    else if (!skirmish && !sideNow && !(conv.on && conv.state === 'reunite')) { const pr = RNG((((camp.seed || 0) >>> 0) ^ 0x9A27) + n * 7);
      const of = jbP === 30 && pr.chance(60) ? (pr.chance(50) ? 3 : 2) : jbP === 17 && pr.chance(50) ? 2 : jbP >= 24 && jbP <= 28 && pr.chance(30) ? 2 : 0; if (of) st.part = { k: 1, of }; }
    if (st.part) st.title += ` (Part ${st.part.k} of ${st.part.of})`; }
  const lastPart = !st.part || st.part.k === st.part.of;
  if (sideNow) { st.side = { idx: conv.sideDone + 1, len: conv.sideLen, ch: 11 + conv.sideDone, lord: camp.army[0].name, kind: conv.kind }; st.title = `${camp.army[0].name}'s Road, Chapter ${st.side.ch}: ` + st.title;
    st.sideLines = st.side.idx === 1 ? (conv.kind === 'rival' ? [['', `Elsewhere, ${camp.army[0].name} gathers the few soldiers who still trust a deserter.`], [camp.army[0].name, `I served the wrong banner long enough. What I broke, I will mend on my own road.`]]
      : [['', `Far from the main army, ${camp.army[0].name} of ${conv.allyRealm} marches with soldiers of their own.`], [camp.army[0].name, `${conv.allyRealm} will not wait for anyone to save it. We go now.`]]) : [['', `${camp.army[0].name}'s road, chapter ${st.side.ch}.`]]; }
  if (reunion) st.sideLines = [['', `At ${place}, two armies that marched apart meet again.`], ...(reunion.lord ? [[reunion.lord.name, conv.kind === 'rival' ? `I came back the way I said I would. Point me at the enemy.` : `${conv.allyRealm} keeps its word. We fight beside you to the end.`]] : [['', `Only the soldiers of the second army arrive; the one who led them did not survive the road.`]])];
  st.relicKey = sideNow ? `s${conv.sideDone + 1}:${n}` : n; if (reunion) { st.reunion = true; st.meetKind = conv.meetKind; }
  let goal, pSlots, eSlots;
  // the objective twist (defend, escape, rescue, escort, flee) is rolled before the map, so escape chapters can get a long map
  const shapeR = RNG(((camp.seed || 0) >>> 0 ^ 0x7A11) + Math.imul(n, 7919) + (skirmish ? 104729 : 0));
  const TWISTS = ['defend', 'escape', 'rescue', 'escort', 'flee', 'courier', 'keys', 'bounty', 'stealth', 'caravan', 'cub', 'tribunal', 'sabotage', 'hostages', 'banners', 'jailbreak', 'treasure', 'maze'];
  st.twist = n >= 3 && shapeR.chance(35) ? shapeR.pick(TWISTS) : null; st.twistAlt = shapeR.pick(TWISTS.slice(0, 4));
  // tall maps: a quarter of generated maps, and most escape and escort chapters, are portrait shaped (Engage's long retreat maps)
  const exitPlan = st.twist === 'escape' || st.twist === 'escort' || st.twist === 'courier' || st.twist === 'caravan' || st.twist === 'cub', tallWanted = shapeR.chance(exitPlan ? 75 : 25);
  const tallSize = area => { const a = 1.6 + shapeR() * 0.6; let h = Math.min(48, Math.round(Math.sqrt(area * a))); const w = Math.max(10, Math.round(area / h)); return { w, h: Math.max(h, w + 4) }; };
  const isTall = m => m.h >= m.w * 1.25;
  if (ROMD) {
    // FE Infinity style: fight on a real FE8 map from the player's ROM, early chapters on smaller maps
    // a chapter's map needs enough walkable ground for its enemies to spread out: about 12 walkable tiles for each enemy
    const jb = st.side ? Math.min(((n - 1) % 30) + 1, 3 + Math.floor(st.side.idx / 2)) : ((n - 1) % 30) + 1, [aLo, aHi] = areaRange(jb), roomFor2 = m => (m._walkN !== undefined ? m._walkN : (m._walkN = (m.terr || []).filter(t => !BLOCK_T.has(t)).length)) >= enemyTarget(jb) * 12;
    const good = ROMD.maps.filter(m => mapQuality(m) && roomFor2(m)), sized = good.filter(m => m.w * m.h >= aLo && m.w * m.h <= aHi);
    let pool = sized, fitted = null;
    const wantIndoor = site && site.struct && INDOOR_SITE.has(site.struct);
    const realArea = () => { const as = good.map(m => m.w * m.h).filter(a => a >= aLo && a <= aHi * 1.6); return as.length ? rng.pick(as) : aLo + rng.int(0, aHi - aLo); };
    if (sized.length < 4 || (wantIndoor && !sized.some(m => !isOutdoor({ map: { terr: m.terr } })))) { const area = aLo + rng.int(0, aHi - aLo), h0 = Math.max(10, Math.round(Math.sqrt(area / 1.35))), w0 = Math.max(10, Math.round(area / h0));
      if (wantIndoor) fitted = cropMap(rng, good, w0, h0, true); else if (site && site.kind === 'coast') fitted = cropMap(rng, good, w0, h0, false, true);
      // a generated map takes the size of a real map the picker could have chosen here, so generated and real chapters play alike
      const gArea = realArea(), gh = Math.max(10, Math.round(Math.sqrt(gArea / 1.35))), gw = Math.max(10, Math.round(gArea / gh));
      const tallHere = tallWanted && !wantIndoor && !(site && (site.kind === 'coast' || site.sea)), ts = tallHere ? tallSize(gArea) : null;
      if (!fitted) { const base = pickMapFor(rng, good.filter(m => isOutdoor({ map: { terr: m.terr } })), site), kind = site ? site.kind : 'plains';
        fitted = (ts && MapGen.generate(rng, base, kind, ts)) || MapGen.generate(rng, base, kind, { w: gw, h: gh }) || cropMap(rng, good, w0, h0); }
      if (fitted) fitted.name = place; }
    if (!pool.length) pool = good.filter(m => m.w * m.h <= aHi * 1.6).length ? good.filter(m => m.w * m.h <= aHi * 1.6) : good;
    const plainSite = !(site && (site.sea || site.kind === 'coast' || (site.struct && INDOOR_SITE.has(site.struct))));
    if (!fitted && exitPlan && tallWanted && plainSite) { const tallReal = pool.filter(m => isTall(m) && isOutdoor({ map: { terr: m.terr } }));
      if (tallReal.length) pool = tallReal;
      else { const outdoor = good.filter(m => isOutdoor({ map: { terr: m.terr } })); if (outdoor.length) { const g = MapGen.generate(rng, pickMapFor(rng, outdoor, site), site ? site.kind : 'plains', tallSize(realArea())); if (g) { g.name = place; fitted = g; } } } }
    let m = fitted || pickMapFor(rng, pool.length ? pool : ROMD.maps, site);
    st.shape = { tallWanted, exitPlan, plainSite, fitted: !!fitted };      // why this chapter's map has its shape (read by the tests)
    // about a third of outdoor chapters get a freshly generated map in the same tileset, themed by the place
    if (!fitted && rng.chance(33) && !(site && (site.sea || (site.struct && INDOOR_SITE.has(site.struct)))) && isOutdoor({ map: { terr: m.terr } })) { const kind = site ? site.kind : 'plains', g = (tallWanted && MapGen.generate(rng, m, kind, isTall(m) ? { w: m.w, h: m.h } : tallSize(m.w * m.h))) || MapGen.generate(rng, m, kind); if (g) { g.name = place; m = g; } }
    // 40% of castle chapters try a stitched interior in the same tileset (8x8 blocks from one real castle map); tilesets
    // without enough clean blocks keep the real map
    if (!fitted && !m.ds && m.src !== 'snes' && m.src !== 'gen' && !isOutdoor({ map: { terr: m.terr } }) && rng.chance(40)) { const g = IntGen.patch(rng, MapGen.keyOf(m), Math.max(2, Math.round(m.w / 8)), Math.max(2, Math.round(m.h / 8)), 8, { throne: rng.chance(50) }); if (g) m = g; }
    W = m.w; H = m.h;
    st.map = { terr: Array.from(m.terr), w: m.w, h: m.h, entry: m, throne: null };
    for (let i = 0; i < m.terr.length; i++) if (m.terr[i] === T_THRONE) st.map.throne = { x: i % W, y: Math.floor(i / W) };
    const hasPoint = st.map.throne || m.terr.some(t => t === T_GATE || t === T_GATE2 || t === T_FORT);
    goal = n === 1 ? 'rout' : rng.pick(hasPoint ? ['seize', 'seize', 'boss', 'rout', 'survive'] : ['rout', 'boss', 'rout', 'survive', 'boss']);
    const foot = { fe8: 0x0F, cls: 'Mercenary', x: 0, y: 0 };
    // the largest foot-connected region
    const comp = new Int32Array(W * H).fill(-1); let best = -1, bestN = 0;
    for (let i = 0, c = 0; i < W * H; i++) { if (comp[i] >= 0 || moveCost(st, foot, i % W, Math.floor(i / W)) >= 99) continue;
      let cnt = 0; const q = [i]; comp[i] = c;
      while (q.length) { const k = q.pop(); cnt++; const x = k % W, y = Math.floor(k / W);
        for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue; const nk = ny * W + nx;
          if (comp[nk] < 0 && moveCost(st, foot, nx, ny) < 99) { comp[nk] = c; q.push(nk); } } }
      if (cnt > bestN) { bestN = cnt; best = c; } c++; }
    const inMain = (x, y) => comp[y * W + x] === best;
    let ea = st.map.throne && inMain(st.map.throne.x, st.map.throne.y) ? st.map.throne : null;
    st.seizeKind = st.map.throne && inMain(st.map.throne.x, st.map.throne.y) ? 'throne' : null;
    if (!ea && goal === 'seize') { const spots = [];
      for (let i = 0; i < W * H; i++) if (comp[i] === best && [T_GATE, T_GATE2, T_FORT].includes(m.terr[i])) spots.push(i);
      if (spots.length) { const gates = spots.filter(i => m.terr[i] !== T_FORT), k = rng.pick(gates.length ? gates : spots);
        st.map.throne = ea = { x: k % W, y: Math.floor(k / W) }; st.seizeKind = m.terr[k] === T_FORT ? 'fort' : 'gate'; } }
    if (!ea) { if (goal === 'seize') goal = 'rout'; st.map.throne = st.map.throne && inMain(st.map.throne.x, st.map.throne.y) ? st.map.throne : null;
      const cand = []; for (let i = 0; i < W * H; i++) if (comp[i] === best) cand.push(i);
      const cd = i => Math.hypot((i % W) - (W - 1) / 2, Math.floor(i / W) - (H - 1) / 2), byCorner = cand.slice().sort((a, b) => cd(b) - cd(a)), k = rng.pick(byCorner.slice(0, Math.max(1, Math.floor(byCorner.length * 0.12)))); ea = { x: k % W, y: Math.floor(k / W) }; }
    if (!st.map.throne && goal === 'seize') goal = 'rout';
    const fe = field(st, foot, ea.x, ea.y);
    let far = null, fd = -1; for (const [k, d] of fe) if (d > fd && inMain(k % W, Math.floor(k / W))) { fd = d; far = k; }
    const longMap = Math.max(W, H) >= Math.min(W, H) * 1.6;
    st.centerStart = W * H >= 200 && ((goal === 'survive' && rng.chance(50)) || (goal === 'rout' && !longMap && !exitPlan && rng.chance(15)));
    if (st.centerStart) { let bc = null, bd = 1e9; for (const [k] of fe) { const x = k % W, y = Math.floor(k / W); if (!inMain(x, y)) continue; const d = Math.abs(x - (W - 1) / 2) + Math.abs(y - (H - 1) / 2); if (d < bd) { bd = d; bc = k; } } if (bc !== null) far = bc; }
    const pa = { x: far % W, y: Math.floor(far / W) };
    const fp = field(st, foot, pa.x, pa.y);
    pSlots = [...fp.entries()].sort((a, b) => a[1] - b[1]).map(([k]) => [k % W, Math.floor(k / W)]);
    const maxd = Math.max(...fp.values());
    eSlots = [...fp.entries()].filter(([k, d]) => st.reunion ? d >= maxd * 0.3 && d <= maxd * 0.72 : d >= maxd * 0.45).map(([k]) => [k % W, Math.floor(k / W)]);
    if (st.reunion) st.sideSlots = [...fp.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => [k % W, Math.floor(k / W)]);
    for (let i = eSlots.length - 1; i > 0; i--) { const j = rng.int(0, i); [eSlots[i], eSlots[j]] = [eSlots[j], eSlots[i]]; }
  } else {
    W = 15; H = 10;
    goal = n === 1 ? 'rout' : rng.pick(GOALS);
    st.map = genMap(rng, goal);
    if (st.reunion) { st.sideSlots = []; for (let x = W - 1; x >= W - 3; x--) for (let y = 0; y < H; y++) if (TERRAIN[st.map.tiles[y][x]].cost.foot < 99) st.sideSlots.push([x, y]); }
    pSlots = []; for (let x = 0; x < 3; x++) for (let y = 0; y < H; y++) if (TERRAIN[st.map.tiles[y][x]].cost.foot < 99) pSlots.push([x, y]);
    pSlots.sort((a, b) => Math.abs(a[1] - H / 2) - Math.abs(b[1] - H / 2) || a[0] - b[0]);
    eSlots = []; for (let x = 6; x < W; x++) for (let y = 0; y < H; y++) { const t = st.map.tiles[y][x]; if (TERRAIN[t].cost.foot < 99 && t !== 'throne') eSlots.push([x, y]); }
    for (let i = eSlots.length - 1; i > 0; i--) { const j = rng.int(0, i); [eSlots[i], eSlots[j]] = [eSlots[j], eSlots[i]]; }
    eSlots.sort((a, b) => b[0] - a[0] + (rng() - 0.5) * 6);
  }
  st.goal = goal;
  const taken = new Set();
  const deploy = (u, list) => { const s = list.find(([x, y]) => !taken.has(y * W + x) && moveCost(st, u, x, y) < 99 && !(st.map.throne && x === st.map.throne.x && y === st.map.throne.y)); if (!s) return false;
    taken.add(s[1] * W + s[0]); u.x = s[0]; u.y = s[1]; return true; };
  st.armoryNotes = [];
  // hiring battalions: one a chapter, before the armory spends on weapons (after it, little gold was ever left); roles the
  // army lacks come first, so a healer is not always last in line, then by level
  if (!partMode) { const have = new Set(camp.army.filter(u => u.bat && BATTALIONS[u.bat.key]).map(u => BATTALIONS[u.bat.key].role)), roleOf = u => BATTALIONS[batKindFor(u)].role;
    const want = camp.army.filter(u => !u.bat).sort((a, b) => (have.has(roleOf(a)) ? 1 : 0) - (have.has(roleOf(b)) ? 1 : 0) || b.level - a.level);
    for (const u of want) { const k = batKindFor(u), cost = BAT_PRICE[k]; if (camp.gold < cost + 600) continue; camp.gold -= cost; u.bat = makeBattalion(k, makePlace(rng)); st.armoryNotes.push(`Armory: ${u.name} hired ${u.bat.name} (${cost} gold).`); break; } }
  if (!partMode) camp.army.slice().sort((a, b) => b.level - a.level).forEach(u => armory(rng, camp, u, n, st.armoryNotes));
  registerRelics(camp);
  const allArmy = camp.army.concat(camp._mainArmy || [], camp.sideArmy || []);
  for (const r of camp.relics || []) { if (r.owner === 'enemy' || allArmy.some(u => u.id === r.holder && u.relic === r.id)) continue;
    const free = camp.army.filter(u => u.relic === undefined || u.relic === null), pick = RNG(((camp.seed || 0) ^ 0x4E1B) + n * 31 + r.id), heir = free.find(u => (u.parents || []).includes(r.holderName)) || free.find(u => resonant(camp, u, r)) || (free.length ? free[pick.int(0, free.length - 1)] : null);
    if (heir) { const was = r.holderName, child = (heir.parents || []).includes(was); bondRelic(camp, r, heir, child); st.armoryNotes.push(`${relicFull(r)}${was ? `, once ${was}'s,` : ''} now answers to ${heir.name}.${child && bondRank(r) ? ' It knows the family.' : ''}`); } }
  for (const u of camp.army) { const r = relicOf(camp, u), k = r && r.owner !== 'enemy' ? bondRank(r) : 0; u._bondS = k >= 4; u._sArtUsed = false;
    u._bondGrowth = k >= 2 && r ? Object.fromEntries(Object.keys(r.boost).map(x => [x, k >= 4 ? 20 : 10])) : null; }
  // on the second lord's road, enemies follow that army's own level (rising one every three chapters), not the main chapter's
  if (st.side && camp._mainArmy) { const ma = camp._mainArmy.filter(u => u.hp > 0); st.sideLvCap = Math.round(ma.reduce((a, u) => a + lvShown(u), 0) / Math.max(1, ma.length)) + 2; } camp._sideCap = st.sideLvCap || null;   // Casim: the second army stops at the main army's average + 2
  // (Casim) its enemies stand at the second army's average level shown (1-40) - 2, rising one every three of its chapters, and
  // are unpromoted while most of that army is; the old formula counted promotion as only +10 and let in promoted enemies early
  const sideAl = st.side ? camp.army.filter(u => u.hp > 0) : [], sidePro = st.side && sideAl.filter(u => CLASSES[u.cls] && CLASSES[u.cls].promoted).length * 2 >= sideAl.length;
  const sideShown = st.side ? Math.round(sideAl.reduce((a, u) => a + lvShown(u), 0) / Math.max(1, sideAl.length)) - 2 + Math.floor((st.side.idx - 1) / 3) : 0;
  camp._sideEnemyLv = st.side ? { shown: sideShown, pro: sidePro } : null;
  // (later books) a new generation starts low: every main-route enemy is held to the army's average level + 4, and promoted
  // classes only once most of the army is promoted (a returning foe at its old strength killed a new lord)
  if (!st.side && (((camp.story && camp.story.book) || 1) >= 2)) { const al = camp.army.filter(u => u.hp > 0), avgA = Math.round(al.reduce((a, u) => a + lvShown(u), 0) / Math.max(1, al.length));
    st.clampLv = { shown: avgA + 1, avg: avgA, pro: al.filter(u => CLASSES[u.cls] && CLASSES[u.cls].promoted).length * 2 >= al.length }; }
  const D = DIFF[OPTIONS.difficulty] || DIFF.normal, sideLv = st.side ? (sidePro ? Math.max(1, sideShown - 20) : Math.max(1, Math.min(20, sideShown))) : 0,
    // (Casim) later books: enemies stand at the army's average level shown, 1 below to 1 above, not a slow restart from low
    laterShown = st.clampLv ? st.clampLv.avg + rng.int(-1, 1) : 0, laterLv = st.clampLv ? (st.clampLv.pro ? Math.max(1, laterShown - 20) : Math.max(1, Math.min(20, laterShown))) : 0,
    lv = Math.max(1, (st.side ? sideLv : st.clampLv ? laterLv : enemyLevel(camp, n)) + D.lv), nPro = st.side ? (sidePro ? n : 99) : st.clampLv ? (st.clampLv.pro ? n : 99) : n;
  const area = W * H, scale = Math.max(1, Math.min(1.5, area / 220)), baseCount = Math.round((3 + Math.floor(n * 0.4) + rng.int(0, 1)) * scale);
  const bookD = (camp.story && camp.story.book) || 1, favourNew = bookD >= 2;   // Casim: from book 2, a book's new units are favoured over veterans (carry runs above all)
  const power = u => u.level + (CLASSES[u.cls].promoted ? 12 : 0) + (u.str + u.mag + u.skl + u.spd + u.def + u.res) / 6 + (favourNew && u.joinedBook === bookD ? 6 : 0);
  const ambushNow = skirmish && camp.ambushOffer && !camp.ambushOffer.fought;
  const jbD = ((n - 1) % 30) + 1; let deployN = Math.min(camp.army.length, deploySlots(jbD));   // Casim: 5 slots at a book's start, 16 by chapters 29-30
  const lordU = camp.army.find(u => u.id === camp.lord) || camp.army[0], rest = camp.army.filter(u => u !== lordU && (!partMode || u.hp > 0)).sort((a, b) => power(b) - power(a));
  if (ambushNow) deployN = Math.min(deployN, 5);   // a detachment, chosen automatically; the rest of the army rests for the main battle
  const healers = rest.filter(u => CLASSES[u.cls].healer), chosen = [lordU];
  if (healers.length && deployN > 1) chosen.push(healers[0]); for (const u of rest) { if (chosen.length >= deployN) break; if (!chosen.includes(u)) chosen.push(u); }
  // the meeting chapter: both lords fight, and at least a third of the places go to the second army
  if (st.reunion) { const co = camp.army.find(u => u.coLord), sideR = rest.filter(u => u.fromSide && u !== co), mainR = rest.filter(u => !u.fromSide);
    chosen.length = 0; chosen.push(lordU); if (co) chosen.push(co); const wantSide = Math.ceil(deployN / 3);
    for (const u of sideR) { if (chosen.filter(x => x.fromSide).length >= wantSide || chosen.length >= deployN) break; chosen.push(u); }
    for (const u of [...mainR, ...sideR]) { if (chosen.length >= deployN) break; if (!chosen.includes(u)) chosen.push(u); } }
  // (Casim 2A) from book 2, half the deploy slots go to units who joined this book (children included) when enough are
  // available, strongest first; the rest to the strongest of anyone. Mentors: 1 a battle before the book's chapter 10,
  // 2 before chapter 20, then no limit.
  if (bookD >= 2 && !st.reunion && !ambushNow && !partMode && !sideNow) { const mentorCap = jbD < 10 ? 1 : jbD < 20 ? 2 : 999, pick = [lordU]; let mentors = lordU.mentor ? 1 : 0;
    const ok = u => !pick.includes(u) && u.hp > 0 && (!u.mentor || mentors < mentorCap), add = u => { pick.push(u); if (u.mentor) mentors++; };
    const heal = rest.find(u => CLASSES[u.cls].healer && ok(u)); if (heal && deployN > 1) add(heal);
    const half = Math.max(1, Math.floor(deployN / 2)); for (const u of rest) { if (pick.length - 1 >= half || pick.length >= deployN) break; if (u.joinedBook === bookD && ok(u)) add(u); }
    for (const u of rest) { if (pick.length >= deployN) break; if (ok(u)) add(u); }
    chosen.length = 0; chosen.push(...pick); }
  st.reserve = camp.army.filter(u => !chosen.includes(u)).map(u => u.id);
  ensureAges(camp, rng);
  for (const c of Object.values(CLASSES)) if (!c.promoted && (c.canto || c.flier) && !c.monster && (c.mov || 0) < 7) c.mov = 7;   // SRR+: mounted and flying T1 classes move 7
  remount(camp.army); camp.army.forEach(settleLevel);
  camp.army.forEach(u => { if (u.crest === undefined) { const cr = RNG(((camp.seed || 0) ^ 0x7C1E5) + (u.id || 0) * 9973), x = cr.int(0, 99); u.crest = x < 5 ? rollCrest(camp, cr, true) : x < 25 ? rollCrest(camp, cr, false) : null; } if (!partMode) { u.chKills = 0; u.hp = u.maxhp; } else if (u.hp > 0) u.hp = Math.min(u.maxhp, u.hp + Math.ceil(u.maxhp * 0.2)); u.team = 'player'; u.carrying = null; u.carriedBy = null; u.torchTurns = 0; u.status = {}; if (!u.pskill) u.pskill = rng.pick(PSKILLS); restock(rng, u, n, camp); });
  let centre = null; if (st.reunion && (st.meetKind === 'ambush' || st.meetKind === 'rescue')) { const cx = (W - 1) / 2, cy = (H - 1) / 2, all = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (moveCost(st, lordU, x, y) < 99) all.push([x, y]); centre = all.sort((a, b) => Math.abs(a[0] - cx) + Math.abs(a[1] - cy) - Math.abs(b[0] - cx) - Math.abs(b[1] - cy));
    // the enemy closes in from all sides: anywhere at least six squares from the middle
    eSlots = all.filter(([x, y]) => Math.abs(x - cx) + Math.abs(y - cy) >= 6); for (let i = eSlots.length - 1; i > 0; i--) { const j = rng.int(0, i); [eSlots[i], eSlots[j]] = [eSlots[j], eSlots[i]]; } }
  chosen.forEach(u => { const list = !st.reunion ? pSlots : st.meetKind === 'ambush' ? (u.fromSide ? st.sideSlots || pSlots : centre) : st.meetKind === 'rescue' ? (u.fromSide ? centre : pSlots) : (u.fromSide && st.sideSlots && st.sideSlots.length ? st.sideSlots : pSlots);
    if (deploy(u, list)) st.units.push(u); });
  // ambush: the second army waits off the field (out of the battle entirely) and arrives on the army's turn 3
  if (st.reunion && st.meetKind === 'ambush') { st.waiting = []; for (const u of st.units.filter(o => o.fromSide)) { u._arriveAt = [u.x, u.y]; u.x = -1; u.y = -1; st.waiting.push(u); } st.units = st.units.filter(o => !o._arriveAt); st.sideArrive = 3; }
  const jb2 = ((n - 1) % 30) + 1, roomFor = Math.floor((st.map.terr || []).filter(t => t !== 0x15 && t !== 0x16 && t !== 0x1A && t !== 0x1B && t !== 0x00 && t !== 0x12 && t !== 0x26).length / 2 / 5);
  // the target includes the commander, so the soldiers are one fewer
  const count = st.side ? Math.max(4, Math.min(roomFor || 999, Math.round(st.units.filter(u => u.team === 'player').length * (st.side.idx <= 2 ? 1.5 : 2) + Math.floor(st.side.idx / 2)) - 1))
    : (() => { const mn = enemyMin(jb2); let c = mn + rng.int(0, Math.round(mn * ENEMY_SPREAD)); if (c === camp.lastEnemyCount) c += rng.chance(50) || c === mn ? 1 : -1; c = Math.max(3, Math.min(roomFor || 999, Math.round(c * (D.n || 1)))); return c; })();
  if (!st.side && !skirmish) camp.lastEnemyCount = count;   // the next chapter avoids this exact number
  // every chapter has a commander: on the throne when there is one, otherwise holding the far end of the map
  st.supports = camp.supports || (camp.supports = {});
  setupBreakables(st, n); st.fate = { left: 2, saved: [] }; st.villages = []; st.chests = []; for (let i = 0; i < W * H; i++) { if (st.map.terr && (st.map.terr[i] === 0x03 || st.map.terr[i] === 0x05)) st.villages.push(i); if (st.map.terr && st.map.terr[i] === 0x21) st.chests.push(i); } st.visited = new Set(); st.gold = 0;
  if (st.map.terr && st.map.terr.includes(0x1E) && !camp.army.some(canOpenDoors)) { const who = camp.army.filter(u => !u.leader && (u.items || []).length < MAXITEMS).sort((a, b) => b.spd - a.spd)[0]; if (who && !(who.items || []).some(it => it.id === 'door_key')) { who.items.push(item('door_key')); (st.armoryNotes = st.armoryNotes || []).push(`Armory: ${who.name} was given a Door Key for this map's doors.`); } }
  if (st.chests.length && !camp.army.some(canOpenChests)) { const who = camp.army.filter(u => !u.leader && (u.items || []).length < MAXITEMS).sort((a, b) => b.spd - a.spd)[0]; if (who && !(who.items || []).some(it => it.id === 'chest_key')) { who.items.push(item('chest_key')); (st.armoryNotes = st.armoryNotes || []).push(`Armory: ${who.name} was given a Chest Key for this map's chests.`); } }
  const rv = camp.rival, jbR = ((n - 1) % 30) + 1, rivalBook = conv.on && conv.kind === 'rival' && conv.state === 'before', rivalHere = rv && !rv.defeated && !rv.turned && !sideNow && !skirmish && n >= 3 && (n % 3 === 0 || (rivalBook && jbR === 10));
  st.major = n % 5 === 0 || (rivalHere && rv.meetings >= 2) || (n >= 4 && rng.chance(3));
  const bc = rivalHere && rv.cls && CLASSES[rv.cls] && (n >= 10 || !CLASSES[rv.cls].promoted) ? rv.cls : POOL && POOL.advanced.length ? poolPick(rng, c => !c.healer && !c.dancer, nPro >= 10) : rng.pick(['Knight','Fighter','Mercenary','Soldier']);
  const boss = makeUnit(rng, bc, 'enemy', lv + 3); boss.boss = true;
 boss.ai = 'hold'; boss.name = rivalHere ? rv.name : uniqueName(camp, rng);
  let gen = camp.story && st.major && !rivalHere ? STORY.generalFor(camp.story, n) : null;
  if (st.side && camp.story && st.side.idx === Math.ceil(st.side.len / 2)) { const g = STORY.generalFor(camp.story, ((camp.story.book || 1) - 1) * 30 + 25); if (g && !g.fallen) { gen = g; st.roadGeneral = g; st.major = true; } }
  else if (gen && gen.fallen) gen = null;          // a general who fell on the second road is gone from the main story
  if (gen) boss.name = gen.name;
  st.final = camp.story && n % 30 === 0 && lastPart; if (st.final) { boss.name = camp.story.villain.name; boss.villain = true; st.major = true; boss.maxhp += 10; boss.hp = boss.maxhp; for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res']) boss[k] += 3; }
  st.bossTitle = gen ? gen.title : rivalHere ? '' : rng.pick(['Captain', 'Commander', 'Lieutenant', 'Sergeant']); st.general = !!gen;
  if (st.final) st.bossTitle = camp.story.villain.title;
  if (rivalHere) { rv.cls = bc; boss.rival = true; boss.finalRival = rv.meetings >= 2; boss.maxhp += 2 * rv.meetings; boss.str += rv.meetings; boss.def += rv.meetings; }
  const walk = (() => { const probe = st.units.find(u => u.team === 'player' && CLASSES[u.cls] && !CLASSES[u.cls].flier) || boss, D = new Int16Array(W * H).fill(-1), q = [];
    const starts = st.units.filter(u => u.team === 'player').map(u => [u.x, u.y]); for (const [x, y] of starts.length ? starts : (pSlots || []).slice(0, 10)) { const k = y * W + x; if (D[k] < 0) { D[k] = 0; q.push(k); } }
    for (let h = 0; h < q.length; h++) { const k = q[h], x = k % W, y = (k / W) | 0; for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (!inb(nx, ny)) continue; const j = ny * W + nx; if (D[j] >= 0 || moveCost(st, probe, nx, ny) >= 99) continue; D[j] = D[k] + 1; q.push(j); } }
    return D; })();
  const maxWalk = Math.max(1, ...walk);
  let bossSpot = st.map.throne && !taken.has(st.map.throne.y * W + st.map.throne.x) ? [st.map.throne.x, st.map.throne.y] : null;
  // with no throne, the commander waits among the tiles farthest the army would have to walk
  st._walk = walk; st._maxWalk = maxWalk;
  if (!bossSpot) { const far = []; for (let k = 0; k < W * H; k++) if (walk[k] >= maxWalk * 0.85 && !taken.has(k) && moveCost(st, boss, k % W, (k / W) | 0) < 99) far.push([k % W, (k / W) | 0]); bossSpot = far.length ? rng.pick(far) : null; }
  if (!bossSpot) bossSpot = eSlots.find(([x, y]) => !taken.has(y * W + x) && moveCost(st, boss, x, y) < 99);
  if (bossSpot) { boss.x = bossSpot[0]; boss.y = bossSpot[1]; taken.add(boss.y * W + boss.x); boss.hp = boss.maxhp; st.units.push(boss); st.bossName = boss.name; st.rivalHere = rivalHere;
    { const jit = new Map(eSlots.map(s => [s, rng.int(0, 5)])); eSlots.sort((a, b) => (Math.abs(a[0] - boss.x) + Math.abs(a[1] - boss.y) + jit.get(a)) - (Math.abs(b[0] - boss.x) + Math.abs(b[1] - boss.y) + jit.get(b))); } }
  for (let i = 0; i < count; i++) {
    const mon = POOL && POOL.monsters.length && n >= 4 && rng.chance(Math.min(35, n * 3));
    const healerHere = POOL && i === 2 && n >= 3 && rng.chance(60);
    const doc = site && camp.world ? (bookInfo(camp).doctrine || [])[site.realm] : null, docPick = doc && POOL && !healerHere && !mon && rng.chance(50) ? poolPick(rng, c => DOCTRINE_TEST[doc](c) && (doc === 'healers' ? true : !c.healer), n >= 9 && rng.chance(Math.min(60, (n - 8) * 8))) : null;
    const e = makeUnit(rng, docPick ? docPick : healerHere ? poolPick(rng, c => c.healer) : mon ? rng.pick(n >= 10 && POOL.monstersHi.length && rng.chance(40) ? POOL.monstersHi : POOL.monsters) : POOL ? poolPick(rng, c => !c.healer, nPro >= 9 && rng.chance(Math.min(60, (nPro - 8) * 8))) : rng.pick(ENEMY_POOL), 'enemy', Math.max(1, lv + rng.int(-1, 1)));
    if (!deploy(e, eSlots)) continue;
    e.name = null;
    if (i === 0 && st.bossName) { e.ai = 'hold'; e.guard = true; st.units.push(e); const bz = st.units.find(u => u.boss), dB = s => bz ? Math.abs(s[0] - bz.x) + Math.abs(s[1] - bz.y) : 5;
      // the rest spread through the commander's area: random spots 2 to 9 tiles from the commander first, then anywhere in the enemy's ground
      for (let a = eSlots.length - 1; a > 0; a--) { const b = rng.int(0, a); [eSlots[a], eSlots[b]] = [eSlots[b], eSlots[a]]; }
      const nearB = eSlots.filter(s => dB(s) >= 2 && dB(s) <= 9), rest = eSlots.filter(s => !(dB(s) >= 2 && dB(s) <= 9)); eSlots.length = 0; eSlots.push(...nearB, ...rest); continue; }
    e.ai = rng.chance(15) ? 'hold' : (rng.chance(50) ? 'wake' : 'pursue');
    if (goal === 'rout' && e.ai === 'hold' && !e.rooted) e.ai = 'wake';
    st.units.push(e);
  }
  // placement, as official FE maps do it: groups of every size spread over the whole map by walking distance,
  // posted on gates, forts, villages, bridges, doorways and good cover, thicker toward the commander
  { const wk = st._walk, mw = st._maxWalk || 1, regs = st.units.filter(u => u.team === 'enemy' && !u.boss && !u.guard);
    st._placeRan = { wk: !!wk, regs: regs.length };
    if (wk && regs.length >= 3) { const players = st.units.filter(u => u.team === 'player'), bz = st.units.find(u => u.boss), old = regs.map(u => [u.x, u.y]); for (const u of regs) { u.x = -9; u.y = -9; }
      const small = regs.length <= 8, nearP = small ? 3 : 5, terr = st.map.terr || [], pass = k => wk[k] >= 0;
      const FEAT = new Set([T_GATE, T_GATE2, T_FORT, 0x03, 0x05, 0x13, 0x14, 0x21]), COVER = new Set([0x0C, 0x0D, 0x11, 0x1C]);
      const score = k => { const x = k % W, y = (k / W) | 0; let s0 = 0; if (FEAT.has(terr[k])) s0 += 3; else if (COVER.has(terr[k])) s0 += 1;
        let open = 0; for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && pass(ny * W + nx)) open++; } if (open <= 2) s0 += 2.5;
        for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (inb(nx, ny) && FEAT.has(terr[ny * W + nx])) { s0 += 1; break; } } return s0 + rng.int(0, 15) / 10; };
      const cand = []; for (let k = 0; k < W * H; k++) { if (!pass(k)) continue; const x = k % W, y = (k / W) | 0; if (players.some(p => Math.abs(p.x - x) + Math.abs(p.y - y) < nearP)) continue; if (bz && Math.abs(bz.x - x) + Math.abs(bz.y - y) < 2) continue; cand.push({ k, x, y, d: wk[k] / mw, s: score(k) }); }
      // group sizes: singles, pairs, trios and squads, as official maps mix them
      const total = regs.length + 1, roomy = cand.length / Math.max(1, total) >= 8, maxGroup = total < 24 ? 2 : total <= 35 || !roomy ? 3 : 6;
      // while groups are small, a soldier never stands next to a soldier from another group, even diagonally
      const groupOf = new Map(); let gid = 0; const apart = true;
      const touches = (x, y, g) => { if (!apart) return false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const o = unitAt(st, x + dx, y + dy); if (o && o.team === 'enemy' && !o.boss && groupOf.has(o) && groupOf.get(o) !== g) return true; } return false; };
      const sizes = []; let left = regs.length; while (left > 0) { const r = rng.int(0, 99); let sz = maxGroup === 2 ? (r < 60 ? 1 : 2) : maxGroup === 3 ? (r < 40 ? 1 : r < 75 ? 2 : 3) : (r < 30 ? 1 : r < 55 ? 2 : r < 75 ? 3 : 4 + rng.int(0, 2)); sz = Math.min(sz, maxGroup, left); sizes.push(sz); left -= sz; }
      const sep = Math.max(2, Math.round(Math.sqrt(cand.length / (sizes.length + 1)) * 0.8)), anchors = [];
      // the commander's end pulls harder with more enemies and more room per enemy (a held stronghold on big, busy maps);
      // on tight maps or with few enemies the troops spread to cover the ground instead
      const clamp01 = v => Math.max(0, Math.min(1, v)), pull = clamp01((total - 15) / 30) * clamp01((cand.length / total - 9) / 9);
      const dPw = 0.35 * (0.35 + (1 - 0.35) * pull), pullW = 3.5 * pull;
      const bandOf = () => { const r = rng.int(0, 99); return r < 25 ? [small ? 0.15 : 0.25, 0.5] : r < 65 ? [0.45, 0.75] : [0.7, 1.01]; };
      const ranged = u => { const c = CLASSES[u.cls] || {}; return c.wpn === 'bow' || c.wpn === 'fire' || c.wpn === 'staff' || c.healer; };
      // same-type zones about half the time: monsters, fliers, cavalry, armour, archers and mages each hold their own ground
      const kind = u => { const c = CLASSES[u.cls] || {}; return c.monster ? 0 : c.flier ? 1 : c.canto ? 2 : /knight|general|armou?r/i.test(c.name || '') ? 3 : c.wpn === 'bow' || c.wpn === 'fire' ? 4 : 5; };
      let pool = regs.slice().sort(() => rng.int(-1, 1)); if (rng.chance(50)) pool.sort((a, b) => kind(a) - kind(b)); let pi = 0;
      // a map that mirrors left to right or top to bottom gets mirrored groups
      let mirror = null; { let sx = 0, sy = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (terr[y * W + x] === terr[y * W + (W - 1 - x)]) sx++; if (terr[y * W + x] === terr[(H - 1 - y) * W + x]) sy++; } if (sx >= W * H * 0.85) mirror = 'x'; else if (sy >= W * H * 0.85) mirror = 'y'; }
      let mirrorNext = null;
      for (const sz of sizes) { let best = null;
        if (mirrorNext) { const mc = cand.find(c => c.x === mirrorNext[0] && c.y === mirrorNext[1] && !unitAt(st, c.x, c.y)); if (mc) best = mc; mirrorNext = null; }
        if (!best) { const seeds = anchors.concat(bz ? [bz] : []), near = c => { let d = 99; for (const a of seeds) d = Math.min(d, Math.abs(a.x - c.x) + Math.abs(a.y - c.y)); return d; };
          // spacing relaxes step by step when the map runs out of room; touching another group never does
          for (const spacing of [maxGroup === 2 ? 4 : 3, 3, 2, 0]) { let bestV = -1e9;
            for (const c of cand) { if (unitAt(st, c.x, c.y) || touches(c.x, c.y, -1)) continue; const dA = near(c); if (anchors.some(a => Math.abs(a.x - c.x) + Math.abs(a.y - c.y) < spacing)) continue;
              // the map's border is used now and then, not by default: posts lean toward the interior
              const edge = Math.min(c.x, c.y, W - 1 - c.x, H - 1 - c.y), ep = edge === 0 ? 2.2 : edge === 1 ? 0.8 : 0;
              const dP = Math.min(...players.map(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y))), v = Math.min(dA, 12) * 1.0 + Math.min(dP, 10) * dPw + pullW * c.d + c.s * 0.35 - ep; if (v > bestV) { bestV = v; best = c; } }
            if (best) break; } }
        if (!best) for (const c of cand) if (!unitAt(st, c.x, c.y) && (!best || c.s > best.s)) best = c;
        if (!best) break; anchors.push(best);
        if (mirror && !mirrorNext && anchors.length % 2 === 1) { const mx = mirror === 'x' ? W - 1 - best.x : best.x, my = mirror === 'y' ? H - 1 - best.y : best.y; if (Math.abs(mx - best.x) + Math.abs(my - best.y) >= 4) mirrorNext = [mx, my]; }
        const members = pool.slice(pi, pi + sz); pi += sz; gid++; for (const u of members) groupOf.set(u, gid);
        // shape: a loose cluster, a line along a path or wall, a tight block, or a pair stacked in a corridor
        const shape = sz < 2 ? 'cluster' : sz === 2 ? 'stack' : rng.pick(['cluster', 'cluster', 'line', 'block']);
        if (shape !== 'cluster') { const dirs = shape === 'stack' ? [[1, 0], [0, 1]] : shape === 'line' ? [[1, 0], [0, 1], [1, 1], [1, -1]] : [[1, 0]], [dx0, dy0] = rng.pick(dirs), cells = [];
          if (shape === 'block') { const bw = sz <= 4 ? 2 : 3; for (let i = 0; i < sz; i++) cells.push([best.x + (i % bw), best.y + Math.floor(i / bw)]); }
          else for (let i = 0; i < sz; i++) { const off = i - Math.floor(sz / 2); cells.push([best.x + dx0 * off, best.y + dy0 * off]); }
          const fits = cells.every(([x, y]) => inb(x, y) && pass(y * W + x) && !unitAt(st, x, y) && !touches(x, y, gid) && !players.some(p => Math.abs(p.x - x) + Math.abs(p.y - y) < nearP));
          // the group's own members (taken above) fill the line or block; taking a second set here used to strand the first
          if (fits) { let ok = true; members.forEach((u, i) => { const [x, y] = cells[i]; if (moveCost(st, u, x, y) >= 99) ok = false; }); if (ok) { members.forEach((u, i) => { u.x = cells[i][0]; u.y = cells[i][1]; }); continue; } } }
        // arrangement: fighters in front, mixed, or archers and mages on high ground when there is some
        const style = rng.int(0, 2), spots = []; const rad = 1 + Math.ceil(sz / 2);
        for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { const x = best.x + dx, y = best.y + dy; if (!inb(x, y) || Math.abs(dx) + Math.abs(dy) > rad) continue; const k = y * W + x; if (!pass(k) || players.some(p => Math.abs(p.x - x) + Math.abs(p.y - y) < nearP)) continue; spots.push({ x, y, near: Math.abs(dx) + Math.abs(dy), front: wk[k], cover: COVER.has(terr[k]) }); }
        spots.sort((a, b) => a.near - b.near);
        const ord = style === 0 ? members.slice().sort((a, b) => (ranged(a) ? 1 : 0) - (ranged(b) ? 1 : 0)) : members;
        for (const u of ord) { let pick = null;
          if (style === 0) pick = spots.filter(s => !unitAt(st, s.x, s.y) && !touches(s.x, s.y, gid) && moveCost(st, u, s.x, s.y) < 99).sort((a, b) => ranged(u) ? b.front - a.front : a.front - b.front)[0];
          else if (style === 2 && ranged(u)) pick = spots.find(s => s.cover && !unitAt(st, s.x, s.y) && !touches(s.x, s.y, gid) && moveCost(st, u, s.x, s.y) < 99);
          if (!pick) pick = spots.find(s => !unitAt(st, s.x, s.y) && !touches(s.x, s.y, gid) && moveCost(st, u, s.x, s.y) < 99);
          if (pick) { u.x = pick.x; u.y = pick.y; } }
      }
      st._placeRan.leftover = regs.filter(u => u.x < 0).length;
      // anyone still without a spot goes where the map is emptiest, not to the first free square in reading order
      const roomAt = c2 => { let d = 99; for (const o of st.units) if (o.hp > 0 && o.x >= 0) d = Math.min(d, Math.abs(o.x - c2.x) + Math.abs(o.y - c2.y)); return d; };
      const emptiest = ok => { let b = null, bd = -1; for (const c2 of cand) { if (unitAt(st, c2.x, c2.y) || !ok(c2)) continue; const d = roomAt(c2); if (d > bd) { bd = d; b = c2; } } return b; };
      for (let i = 0; i < regs.length; i++) if (regs[i].x < 0) { gid++; groupOf.set(regs[i], gid); const c = emptiest(c2 => !touches(c2.x, c2.y, gid) && moveCost(st, regs[i], c2.x, c2.y) < 99) || emptiest(c2 => moveCost(st, regs[i], c2.x, c2.y) < 99); if (c) { regs[i].x = c.x; regs[i].y = c.y; } else { const [ox, oy] = old[i]; regs[i].x = ox; regs[i].y = oy; } }
    } }
  // captains: the commander's lieutenants, only in major battles (the rival's chapters, every fifth chapter, the odd set-piece)
  const regulars = st.units.filter(u => u.team === 'enemy' && !u.boss).sort((a, b) => b.level - a.level);
  for (const old of st.major ? regulars.slice(0, n >= 5 && regulars.length > 6 ? 2 : regulars.length > 2 ? 1 : 0) : []) {
    const c = makeUnit(rng, old.cls, 'enemy', old.level + 2); c.captain = true; c.name = uniqueName(camp, rng); c.x = old.x; c.y = old.y; c.ai = old.ai === 'pursue' ? 'wake' : old.ai;
    st.units[st.units.indexOf(old)] = c;
    const bz = st.units.find(u => u.boss), caps = st.units.filter(u => u.captain && u !== c), posts = [];
    for (let k = 0; k < W * H; k++) { const x = k % W, y = (k / W) | 0, wd = walk[k]; if (wd < 0 || wd < maxWalk * 0.4 || wd > maxWalk * 0.85 || wd < 7) continue; if (unitAt(st, x, y) || moveCost(st, c, x, y) >= 99) continue;
      if (bz && Math.abs(bz.x - x) + Math.abs(bz.y - y) < 5) continue; if (caps.some(o => Math.abs(o.x - x) + Math.abs(o.y - y) < 5)) continue; posts.push([x, y]); }
    if (posts.length) { const [px, py] = rng.pick(posts); c.x = px; c.y = py; c.posted = true; }
  }
  { const j = ((n - 1) % 30) + 1, S0 = camp.story, gens = S0 && S0.generals || [], b0 = st.units.find(u => u.boss);
    camp.pincerBook = camp.pincerBook || {}; const bk = S0 ? S0.book || 1 : 1, had = camp.pincerBook[bk] || 0;
    const genWant = !(opts && opts.skirmish) && !st.final && lastPart && b0 && gens.length >= 2 && n >= 10 && j >= 24 && j <= 28 && st.goal !== 'seize' && had < 2 && (rng.chance(35) || (j === 28 && !had));
    // several commanders, not just one (Casim): from chapter 6, about one chapter in six (at most four a book), two or three captains
    // each lead their own force; and the meeting chapter's commander hunt is two or three of the book's generals
    camp.capBook = camp.capBook || {}; const capHad = camp.capBook[bk] || 0;
    const meetWant = !!(st.reunion && st.meetKind === 'boss' && b0 && gens.length >= 2);
    const capWant = !genWant && !meetWant && !(opts && opts.skirmish) && !st.final && !st.reunion && b0 && !st.rivalHere && j >= 6 && j < 24 && st.goal !== 'seize' && capHad < 4 && j !== 17 && rng.chance(18);
    const want = genWant || capWant || meetWant;
    if (want) {
      // troop types a general's force is built from; each general draws one or two, different from the others
      // each type: its name alone, its short name in a pair, and which classes it covers
      const TYPES = [['mages and shamans', 'mages', c => c.wpn === 'fire'], ['pegasus and wyvern riders', 'fliers', c => !!c.flier], ['cavalry', 'cavalry', c => c.canto && !c.flier && c.wpn !== 'staff'], ['armoured infantry', 'armour', c => /knight|general|armou?r|fighter|warrior|soldier|halberd/i.test(c.name || '') && !c.canto && !c.flier],
        ['mercenaries and myrmidons', 'swordsmen', c => /mercenary|hero|myrmidon|swordmaster|assassin/i.test(c.name || '')], ['axemen and brigands', 'axemen', c => c.wpn === 'axe' && !c.flier], ['knights and lancers', 'lancers', c => c.wpn === 'lance' && !c.flier], ['archers and snipers', 'archers', c => c.wpn === 'bow']];
      if (POOL && POOL.monsters && POOL.monsters.length && n >= 12) TYPES.push(['monsters', 'monsters', c => !!c.monster]);
      const usable = TYPES.filter(([, , f]) => POOL ? !!poolPick(rng, f, false) : false), bag = usable.slice().sort(() => rng.int(-1, 1)), FORCES = [];
      for (let g = 0; g < 3; g++) { const a = bag.shift(); if (!a) break; const two = bag.length > 3 && rng.chance(60) ? bag.shift() : null; FORCES.push(two ? [a[1] + ' and ' + two[1], c => a[2](c) || two[2](c)] : [a[0], a[2]]); }
      while (FORCES.length < 3) FORCES.push(['soldiers of every kind', c => !c.healer]);
      const players = st.units.filter(u => u.team === 'player'), cxp = players.reduce((a, u) => a + u.x, 0) / Math.max(1, players.length), cyp = players.reduce((a, u) => a + u.y, 0) / Math.max(1, players.length);
      const wk = st._walk || [], corners = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]].map(([cx, cy]) => { let best = null; for (let k = 0; k < W * H; k++) { if (!(wk[k] >= 0)) continue; const x = k % W, y = (k / W) | 0; if (unitAt(st, x, y) && !unitAt(st, x, y).boss) continue; const d = Math.abs(x - cx) + Math.abs(y - cy); if (!best || d < best.d) best = { d, x, y }; } return best; }).filter(Boolean)
        .sort((a, b) => (wk[b.y * W + b.x] || 0) - (wk[a.y * W + a.x] || 0));
      const pool = capWant ? [0, 1, 2].map(() => ({ name: uniqueName(camp, rng), title: 'Captain', captain: true })) : gens;
      const nGen = Math.min(pool.length, (capWant ? j >= 15 : n >= 18) && rng.chance(40) ? 3 : 2), picked = [];
      const armyDist = c => Math.min(...players.map(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y)));
      // on a long map the corner across the short side is close to the army: there a general's corner is at least 60% of the long side away
      const minArmy = Math.max(W, H) >= Math.min(W, H) * 1.6 ? Math.ceil(Math.max(W, H) * 0.6) : 9;
      for (const c of corners) { if (picked.length >= nGen) break; if (armyDist(c) < minArmy) continue; if (picked.some(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) < Math.max(W, H) * 0.5)) continue; picked.push(c); }
      if (picked.length >= 2) {
        const order = pool.slice().sort(() => rng.int(-1, 1)), forceOrder = [0, 1, 2].sort(() => rng.int(-1, 1)), bosses = [];
        picked.forEach((pc, gi) => { const g = order[gi], force = FORCES[forceOrder[gi]];
          let B = gi === 0 ? b0 : null; if (!B) { const cls = POOL ? poolPick(rng, force[1], n >= 10) || b0.cls : b0.cls; B = makeUnit(rng, cls, 'enemy', b0.level); B.boss = true; B.ai = 'hold'; st.units.push(B); }
          B.name = g.name; if (g.captain) { B.capTitle = g.title; B.captain = true; } else B.genTitle = g.title; B.x = pc.x; B.y = pc.y; B.hp = B.maxhp; B.force = force[0]; B.corner = (pc.y < H / 2 ? 'north' : 'south') + (pc.x < W / 2 ? '-west' : '-east'); bosses.push(B); });
        // each general's soldiers gather around them, most of them re-recruited to fit that general's force
        const regs = st.units.filter(u => u.team === 'enemy' && !u.boss);
        regs.forEach((u, k) => { const B = bosses[k % bosses.length], fit = FORCES.find(f => f[0] === B.force);
          let unit = u; if (POOL && rng.chance(65)) { const cls = poolPick(rng, fit[1], n >= 9 && rng.chance(Math.min(60, (n - 8) * 8))); if (cls) { unit = makeUnit(rng, cls, 'enemy', u.level); unit.ai = u.ai; unit.captain = u.captain; unit.name = u.name; st.units[st.units.indexOf(u)] = unit; } }
          let spot = null; for (let r2 = 1; r2 < 8 && !spot; r2++) { const ring = []; for (let dy = -r2; dy <= r2; dy++) for (let dx = -r2; dx <= r2; dx++) { const x = B.x + dx, y = B.y + dy; if (!inb(x, y) || unitAt(st, x, y) || moveCost(st, unit, x, y) >= 99) continue; if (Math.abs(x - cxp) + Math.abs(y - cyp) < 6) continue; ring.push([x, y]); } if (ring.length) spot = rng.pick(ring); }
          if (spot) { unit.x = spot[0]; unit.y = spot[1]; } unit.ai = unit.ai === 'pursue' ? 'wake' : unit.ai; });
        st.goal = 'boss'; st.pincer = bosses.map(B => ({ name: B.name, title: B.genTitle || B.capTitle, force: B.force, corner: B.corner })); st.bossName = bosses[0].name; st.major = true;
        if (capWant) camp.capBook[bk] = capHad + 1; else if (genWant) camp.pincerBook[bk] = had + 1;
      }
    }
  }
  { const AL = camp.world ? alliancesOf(camp) : [], here = site && AL.find(A => A.realm === site.realm);
    if (AL.length && n >= 6 && !st.pincer && !st.final && !(opts && opts.skirmish) && rng.chance(here ? 35 : 12)) {
      const A = here || rng.pick(AL), doc = (bookInfo(camp).doctrine || [])[A.realm], players = st.units.filter(u => u.team === 'player'), wk = st._walk || [];
      const size = Math.min(6, 3 + Math.floor(n / 10) + rng.int(0, 1)), leaderCls = POOL ? poolPick(rng, c => (doc ? DOCTRINE_TEST[doc](c) : true) && !c.healer, n >= 10) : null;
      const plan = { realm: A.name, reason: A.reason, size, doc, leaderCls, mode: rng.chance(50) ? 'start' : 'march', turn: 2 + rng.int(0, 2), leader: uniqueName(camp, rng), with: (facts(camp, st).faction || 'the enemy') };
      st.axis = plan; (camp.history = camp.history || []).push({ type: 'alliance', chapter: n, realm: A.name, leader: plan.leader, mode: plan.mode });
      if (plan.mode === 'start') { const corners = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1]].map(([cx, cy]) => { let best = null; for (let k = 0; k < W * H; k++) { if (!(wk[k] >= 0)) continue; const x = k % W, y = (k / W) | 0; if (unitAt(st, x, y)) continue; const d = Math.abs(x - cx) + Math.abs(y - cy); if (!best || d < best.d) best = { d, x, y }; } return best; }).filter(Boolean)
          .filter(c => Math.min(...players.map(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y))) >= 10).sort((a, b) => (wk[b.y * W + b.x] || 0) - (wk[a.y * W + a.x] || 0));
        const bz = st.units.find(u => u.boss), spot = corners.find(c => !bz || Math.abs(c.x - bz.x) + Math.abs(c.y - bz.y) >= 6) || corners[0];
        if (spot) { st.axisUnits = axisArmy(st, rng, plan, spot.x, spot.y); plan.corner = (spot.y < H / 2 ? 'north' : 'south') + (spot.x < W / 2 ? '-west' : '-east'); } else st.axis = null; } } }
  for (const e of st.units) if (e.team === 'enemy') {
    if (e.boss || (e.captain && rng.chance(60))) { const t = wtype(CLASSES[e.cls].wpn), up = Object.keys(WEAPONS).filter(k => WEAPONS[k].type === t && (WEAPONS[k].tier || 1) === (n >= 7 ? 3 : 2));
      if (up.length && e.items.length < MAXITEMS) { e.items.unshift(Object.assign(item(rng.pick(up)), { drop: true })); equipBest(e); } else if (e.items[0]) e.items[0].drop = true; e.drop = true; }
    else if (!e.captain && rng.chance(17) && e.items) { const extra = rng.chance(8) ? rng.pick(Object.keys(BOOSTERS)) : rng.pick(['vulnerary', 'vulnerary', 'elixir', 'torch', 'chest_key', 'door_key', 'own', 'own']);
      if (extra === 'own' || e.items.length >= MAXITEMS) { if (e.items.length) e.items[0].drop = true; } else e.items.push(Object.assign(item(extra), { drop: true })); e.drop = true; } }
  st.reinforce = goal === 'survive' ? { turns: [3, 5, 7, 9, 11, 13].filter(t => t <= st.surviveTurns), lv } : n >= 3 && rng.chance(40) ? { turns: [3 + rng.int(0, 2), 6 + rng.int(0, 2)], lv } : null;
  st.fog = n >= 4 && rng.chance(17); st.eSlots = eSlots;
  // early commanders stay close to their soldiers: before chapter 10, no stat more than 2 above the strongest ordinary enemy's (HP 5)
  if (n < 10) { const regs = st.units.filter(u => u.team === 'enemy' && !u.boss && !u.captain); const bossU = st.units.find(u => u.boss && !u.rival);
    if (bossU && regs.length) { for (const k of ['str', 'mag', 'skl', 'spd', 'lck', 'def', 'res']) bossU[k] = Math.min(bossU[k], Math.max(...regs.map(r => r[k])) + 2); bossU.maxhp = Math.min(bossU.maxhp, Math.max(...regs.map(r => r.maxhp)) + 5); bossU.hp = bossU.maxhp; } }
  // among enemies only the book's plot generals field battalions (commanders with them nearly doubled the army's losses)
  for (const u of st.units) { if (u.team === 'enemy' && u.genTitle && !u.bat) { const k = batKindFor(u); u.bat = makeBattalion(k, makePlace(rng)); }
    u._gambits = batLive(u) && (u.team === 'player' || u.genTitle) ? gambitUses(u.bat) : 0; }   // among enemies only plot generals use gambits; other commanders keep the bonuses
  { const c = convOf(camp), jb = ((n - 1) % 30) + 1, lordU = st.units.find(u => u.leader && u.team === 'player');
    if (!skirmish && !sideNow && c.on && c.kind === 'ally' && c.state === 'before' && jb === 8 && lordU) { st._camp = st._camp || camp; const lv = lordU.level + 1, cls = st.units.filter(u => u.team === 'player' && !u.leader).map(u => u.cls);
      const al = spawn(st, cls.length ? rng.pick(cls) : lordU.cls, 'ally', lv, [lordU.x, lordU.y], { name: c.allyName, allyLord: true }); for (let i = 0; i < 2; i++) spawn(st, cls.length ? rng.pick(cls) : lordU.cls, 'ally', lv - 1, [lordU.x, lordU.y]);
      st.sideLines = [['', `Riders from ${c.allyRealm} reach the field. ${c.allyName} brings soldiers to stand with you for this battle.`], [c.allyName, `${c.allyRealm} remembers its friends. Today we fight together.`]]; } }
  { const c = convOf(camp), jb = ((n - 1) % 30) + 1, lordU = st.units.find(u => u.leader && u.team === 'player');
    if (!skirmish && !sideNow && c.on && c.state === 'together' && c.freed && (jb === 27 || jb === 30) && lordU && !(c.helped || []).includes(jb)) { st._camp = st._camp || camp; (c.helped = c.helped || []).push(jb);
      const cls = st.units.filter(u => u.team === 'player' && !u.leader).map(u => u.cls); for (let i = 0; i < 3; i++) spawn(st, cls.length ? rng.pick(cls) : lordU.cls, 'ally', lordU.level, [lordU.x, lordU.y]);
      st.sideLines = [...(st.sideLines || []), ['', `Soldiers of ${c.freed} march in. ${c.freedBy} freed their home; they came to repay it.`]]; } }
  { const jb = ((n - 1) % 30) + 1, boss = st.units.find(u => u.boss && u.team === 'enemy' && !u.rival);
    // chapter 17: not a rival (every third) or relic (every fifth) chapter
    if (!skirmish && !sideNow && !st.reunion && !st.final && jb === 17 && boss && !st.pincer && lastPart) { const b = makeBeast(camp, st, rng, boss), spot = (() => { st.units.splice(st.units.indexOf(boss), 1); return beastSpot(st, b, boss.x, boss.y); })();
      if (spot) { b.x = spot[0]; b.y = spot[1]; st.units.push(b); st.beast = b.name; st.goal = 'boss'; st.goalText = `Bring down ${b.name.replace(/^The /, 'the ')}`; st.bossName = b.name; st.major = true;
        st.sideLines = [...(st.sideLines || []), ['', `${b.name} waits at ${st.place}. ${b.lore}`]]; }
      else st.units.push(boss); } }
  // wild creatures (Casim): orange, hostile to everyone (the army, the enemy, third armies). From chapter 9, about a third of
  // chapters bring a pack of 2-5 of one kind, spread across the map: wolves, bears, spirits, demons or golems. Each is a
  // 2x2 giant holding its ground: one health bar (two from chapter 15 at even odds), a barrier of two hits, the sweep.
  { const jb = ((n - 1) % 30) + 1, mons = POOL && POOL.monsters;
    if (!skirmish && !st.reunion && !st.final && !st.beast && jb >= 9 && mons && mons.length && (st.cubKind || rng.chance(33))) {
      const kind = st.cubKind ? WILD_KINDS.find(k => k.key === st.cubKind) : rng.pick(WILD_KINDS), cls = (mons.filter(k => kind.cls.test(className({ cls: k }))).length ? rng.pick(mons.filter(k => kind.cls.test(className({ cls: k })))) : rng.pick(mons));
      const want = 2 + rng.int(0, jb >= 20 ? 3 : 2), placed = [], W = st.map.w, H = st.map.h;
      for (let g = 0; g < want * 4 && placed.length < want; g++) { const wi = makeUnit(rng, cls, 'neutral', Math.max(1, lv + (jb >= 15 ? 1 : 0)));
        Object.assign(wi, { team: 'neutral', hostile: true, wild: kind.key, big: true, rooted: true, ai: 'hold', sweep: true, giant: true, bars: jb >= 15 && rng.chance(50) ? 2 : 1, barrier: 2, name: kind.name });
        wi.maxBars = wi.bars; wi.def += 2; wi.maxhp += 6; wi.hp = wi.maxhp; if (!WEAPONS[wi.weapon] || WEAPONS[wi.weapon].mt === undefined || wi.weapon === 'none') { wi.items = [item('claw')]; wi.weapon = 'claw'; }
        const tx = rng.int(1, W - 3), ty = rng.int(1, H - 3), spot = beastSpot(st, wi, tx, ty);
        if (!spot || placed.some(([x, y]) => Math.abs(x - spot[0]) + Math.abs(y - spot[1]) < 5) || st.units.some(u => u.team === 'player' && Math.abs(u.x - spot[0]) + Math.abs(u.y - spot[1]) < 4)) continue;
        wi.x = spot[0]; wi.y = spot[1]; st.units.push(wi); placed.push(spot); }
      if (placed.length) { st.giants = placed.length; st.wildKind = kind.key; st.sideLines = [...(st.sideLines || []), ['', kind.line.replace('{n}', ['', 'one', 'two', 'three', 'four', 'five'][placed.length] || placed.length)]]; } } }
  { const ce = camp.courierEffect, lordU = st.units.find(u => u.leader && u.team === 'player');
    if (ce && !skirmish && !sideNow && n >= ce.at && lordU) { st._camp = st._camp || camp; const cls = st.units.filter(u => u.team === 'player' && !u.leader).map(u => u.cls);
      if (ce.kind === 'ally') { for (let i = 0; i < 3; i++) spawn(st, cls.length ? rng.pick(cls) : lordU.cls, 'ally', lordU.level, [lordU.x, lordU.y]); st.sideLines = [...(st.sideLines || []), ['', `Soldiers of ${ce.ally} arrive, sent by ${ce.cmd} as promised.`]]; }
      else { const far = (st.eSlots || []).slice(-6); for (let i = 0; i < 4 && i < far.length; i++) spawn(st, POOL ? poolPick(rng, c => !c.healer && !c.monster, false) : 'Fighter', 'enemy', Math.max(1, lv), far[i]); st.sideLines = [...(st.sideLines || []), ['', `${ce.ally}'s soldiers march with the enemy today. ${ce.cmd} chose the other side.`]]; }
      camp.courierEffect = null; } }
  // a wedding (Casim): from chapter 8, two living units with an A support who are not yet married may wed; guests gather
  // around them, and on turn 2 three of the guests reveal themselves as assassins while the enemy force closes in
  { const jb = ((n - 1) % 30) + 1, A = camp.army.filter(u => u.hp > 0 && !u.spouse && st.units.includes(u)), sup = camp.supports || {};
    if (!skirmish && !sideNow && !st.reunion && !st.final && !st.beast && !st.wedding && n >= 8 && jb !== 17 && A.length >= 2 && rng.chance(15)) { let pair = null, best = 0;
      for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) { const p = sup[pairKey(A[i], A[j])] || 0; if (rankOf(p) >= 3 && A[i].beloved === A[j].id && p > best) { best = p; pair = [A[i], A[j]]; } }
      const lordU = st.units.find(u => u.leader && u.team === 'player');
      if (pair && lordU) { st._camp = st._camp || camp; st.wedding = { a: pair[0].id, b: pair[1].id, names: [pair[0].name, pair[1].name] }; st.title = `The Wedding of ${pair[0].name} and ${pair[1].name}`;
        const civ = POOL ? (c => !c.monster && !c.promoted) : null; let guests = 0;
        // (Casim) the attack grows with the wedding party: a disguised guest per three attending units (at least 3), about twice
        // as many guests in all, and one more enemy for each unit attending, coming in from the far side
        const att = st.units.filter(u => u.team === 'player' && u.hp > 0).length, nDis = Math.max(3, Math.round(att / 3)), nGuest = Math.max(6, nDis * 2);
        const spots = freeTiles(st, [lordU.x, lordU.y], nGuest, 6); for (let i = 0; i < nGuest; i++) { const spot = spots[i]; if (!spot) break; const g = spawn(st, POOL ? poolPick(rng, civ, false) : 'Villager', 'neutral', Math.max(1, n - 2), spot, { role: 'guest' }); guests++;
          if (i < nDis) g.disguised = true; }
        { let k = 0; for (const at of (st.eSlots || []).slice().reverse()) { if (k >= att) break; if (unitAt(st, at[0], at[1])) continue; spawn(st, POOL ? poolPick(rng, c2 => !c2.monster && !c2.healer, false) : 'Fighter', 'enemy', Math.max(1, lv), at); k++; } st.wedding.extra = k; st.wedding.guests = guests; st.wedding.disguised = nDis; }
        st.goal = 'rout'; st.goalText = `Protect the wedding: defeat all enemies`;
        st.sideLines = [...(st.sideLines || []), ['', `${pair[0].name} and ${pair[1].name} have asked for one quiet morning at ${place} to marry. The army's officers stand as witnesses.`]]; } } }
  { const jb = ((n - 1) % 30) + 1, plain = st.units.filter(u => u.team === 'enemy' && u.hp > 0 && !u.boss && !u.name && !u.big && !u.courier);
    if (!skirmish && n >= 4 && plain.length >= 3 && rng.chance(35)) for (const u of plain.slice().sort(() => rng.int(-1, 1)).slice(0, rng.int(1, 3))) u.name = uniqueName(camp, rng);
    const named = st.units.filter(u => u.team === 'enemy' && u.hp > 0 && !u.boss && !u.big && !u.courier);
    if (!skirmish && n >= 6 && named.length >= 4 && rng.chance(15)) { const a = rng.pick(named), b = named.filter(o => o !== a).sort((x, y) => (Math.abs(x.x - a.x) + Math.abs(x.y - a.y)) - (Math.abs(y.x - a.x) + Math.abs(y.y - a.y)))[0];
      if (b) { a.name = a.name || uniqueName(camp, rng); b.name = b.name || uniqueName(camp, rng); a.sworn = [b.id]; b.sworn = [a.id]; const w = bondWord(a, b);
        st.sideLines = [...(st.sideLines || []), ['', `${a.name} and ${b.name} fight in the enemy line as ${w === 'kin' ? 'sworn kin' : 'sworn ' + w}. Each will guard the other.`]]; } } }
  // shades of the fallen (Casim): from chapter 10, when the army has lost at least two, about one chapter in eight brings
  // two or three of them back as shades in the enemy ranks, with their old class and level
  { const fallen = (camp.fallen || []).filter(f => f.chapter < n); if (!skirmish && !st.reunion && !st.final && !st.beast && n >= 10 && fallen.length >= 2 && rng.chance(12)) {
      st._camp = st._camp || camp; const E0 = (st.eSlots || []).slice(0, 12), made = [];
      for (const f of fallen.slice().sort(() => rng.int(-1, 1)).slice(0, 2 + rng.int(0, 1))) { const key = Object.keys(CLASSES).find(k => CLASSES[k].name === f.cls); const at = E0.find(([x, y]) => !unitAt(st, x, y)); if (!key || !at) continue;
        const sh = spawn(st, key, 'enemy', Math.max(1, f.level), at, { shade: true }); sh.name = 'Shade of ' + f.name; sh.ai = 'pursue'; made.push(f.name); }
      if (made.length) st.sideLines = [...(st.sideLines || []), ['', `Among the enemy walk shapes the army knows: ${made.join(' and ')}, who fell in battles past. Their eyes are empty.`]]; } }
  if (partMode) st.sideLines = [['', st.part.k === st.part.of ? `One last push. The battle for ${place} comes down to this.` : `The fighting moves on to ${place}. The army has had only a short rest.`], ...(st.sideLines || [])];
  // life gems (Engage-style, SRR+ rule): from chapter 8, commanders carry them (Easy/Normal 1, Hard 2) and captains or
  // generals one (Normal and Hard); beasts keep their health bars instead
  if (!skirmish && n >= 8) { const hard = OPTIONS.difficulty === 'hard', easy = OPTIONS.difficulty === 'easy';
    for (const u of st.units) { if (u.team !== 'enemy' || u.big || u.bars || u.cart) continue; if (u.boss) u.lives = (u.lives || 0) + (hard ? 2 : 1); else if ((u.captain || u.genTitle) && !easy) u.lives = (u.lives || 0) + 1; } }
  // events that help the enemy (Casim: sea landings, a traitor, a war chant, home ground, a false flag), at most one a chapter
  { const jb = ((n - 1) % 30) + 1, lordU = st.units.find(u => u.leader && u.team === 'player'), bossE = st.units.find(u => u.boss && u.team === 'enemy');
    const quiet = !skirmish && !sideNow && !st.reunion && !st.final && !st.beast && !st.wedding && !st.part && lordU;
    if (camp.returnBoss && !skirmish && !sideNow && n >= camp.returnBoss.at && bossE && !bossE.villain && !bossE.beast) { const R = camp.returnBoss; camp.returnBoss = null; st._camp = st._camp || camp;
      bossE.name = R.name; bossE.level = Math.max(bossE.level, R.level + 2); for (const k2 of ['str', 'mag', 'skl', 'spd', 'def', 'res']) bossE[k2] += 2; bossE.maxhp += 4; bossE.hp = bossE.maxhp;
      for (const at of freeTiles(st, [bossE.x, bossE.y], 3, 4)) spawn(st, POOL ? poolPick(rng, c => !c.monster && !c.healer, false) : 'Fighter', 'enemy', Math.max(1, lv), at);
      st.sideLines = [...(st.sideLines || []), [R.name || '', 'I told you I would be back. This time I brought friends.']]; }
    // an allied column that got past the ambush joins this battle
    if (camp.ambushJoin && !skirmish && !sideNow && lordU) { const A = camp.ambushJoin, far = (st.eSlots || []).slice(-8); st._camp = st._camp || camp; let k = 0;
      for (const at of far) { if (k >= A.size || unitAt(st, at[0], at[1])) continue; const e = spawn(st, POOL ? poolPick(rng, c => !c.monster, false) : 'Fighter', 'enemy', Math.max(1, lv), at); if (!k) e.name = A.leader; k++; }
      camp.ambushJoin = null; st.sideLines = [...(st.sideLines || []), ['', `${A.leader}'s column from ${A.realm} marches onto the field. The ambush on the road failed.`]]; }
    else if (quiet && n >= 5) { const roll = rng.int(0, 99);
      const shore = []; for (let y = 0; y < st.map.h; y++) for (let x = 0; x < st.map.w; x++) { if (unitAt(st, x, y) || !footWalk(st.map.terr[y * W + x])) continue; if (N4.some(([dx, dy]) => inb(x + dx, y + dy) && [0x10, 0x15, 0x16].includes(st.map.terr[(y + dy) * W + x + dx]))) shore.push([x, y]); }
      const recruits = camp.army.filter(u => u !== lordU && !u.leader && u.joined !== undefined && n - u.joined <= 3 && !u.spouse && !u.beloved && !(u.sworn || []).length && u.relic == null && st.units.includes(u));
      if (roll < 6 && shore.length >= 6) { st.seaborne = { turn: 3 + rng.int(0, 1), at: shore.filter(([x, y]) => lordU && Math.abs(x - lordU.x) + Math.abs(y - lordU.y) >= 6).slice(0, 12) };
        st.sideLines = [...(st.sideLines || []), ['', 'Sails on the horizon. The enemy has boats, and the coast is open.']]; }
      else if (roll < 10 && n >= 8 && recruits.length) { const t = rng.pick(recruits); st.traitor = { id: t.id, turn: 3 }; }
      else if (roll < 18 && n >= 6 && bossE) { st.chant = bossE.id; st.sideLines = [...(st.sideLines || []), [bossE.name || '', 'Sing, all of you! Let them hear what is coming for them!']]; }
      else if (roll < 26 && isOutdoor(st)) { st.homeground = true; st.sideLines = [...(st.sideLines || []), ['', 'The enemy knows this land; forest and hill do not slow them today.']]; }
      else if (roll < 31 && n >= 6) { st._camp = st._camp || camp; const spots = freeTiles(st, [lordU.x, lordU.y], 3, 4); const cls = st.units.filter(u => u.team === 'player').map(u => u.cls); st.falseFlag = [];
        for (const at of spots) { const a = spawn(st, cls.length ? rng.pick(cls) : lordU.cls, 'ally', lordU.level, at); st.falseFlag.push(a.id); }
        if (st.falseFlag.length) { st.falseFlagFrom = makePlace(rng); st.sideLines = [...(st.sideLines || []), ['', `Soldiers wearing the colours of ${st.falseFlagFrom} fall in beside the army and offer their swords.`]]; } }
      else if (roll >= 31) { const r2 = rng.int(0, 99), E0 = (st.eSlots || [])[0], mid = E0 ? [Math.round((lordU.x + E0[0]) / 2), Math.round((lordU.y + E0[1]) / 2)] : null; st._camp = st._camp || camp;
        const say2 = l => { st.sideLines = [...(st.sideLines || []), ['', l]]; };
        // field hospital: an enemy tent heals every enemy within two squares each turn until it is destroyed
        if (r2 < 5 && E0) { const at = freeTiles(st, E0, 1, 4)[0]; if (at) { const t = spawn(st, POOL ? poolPick(rng, c2 => /knight|armou?r/i.test(c2.name || '') && !c2.monster, false) : 'Knight', 'enemy', Math.max(1, lv), at, { tent: true, cart: true, rooted: true }); t.ai = 'hold'; t.items = []; t.weapon = 'none'; t.name = 'Field Hospital'; t.def += 4; t.maxhp += 10; t.hp = t.maxhp; st.hospital = t.id; say2('The enemy has pitched a field hospital behind its lines. While it stands, their wounded keep coming back.'); } }
        // the commander's retreat: on turn 6 an unbeaten commander escapes, and returns two chapters later with fresh troops
        else if (r2 < 10 && bossE && st.goal !== 'boss' && st.goal !== 'flee' && st.goal !== 'escort') st.retreatBoss = { id: bossE.id, turn: 6 };
        // bribed creatures: a wild pack the enemy has fed, which attacks only the army
        else if (r2 < 15 && st.wildKind) { for (const u of st.units) if (u.wild && u.hostile) u.bribed = true; st.bribed = true; say2('The beasts here have been fed by the enemy. They leave its soldiers alone and wait for ours.'); }
        // smoke screen: fog for the first three turns
        else if (r2 < 20 && !st.fog) { st.fog = true; st.smokeUntil = 3; say2('The enemy fires the dry grass. Smoke rolls over the field and nobody can see far.'); }
        // mounted flankers: three riders come in behind the army on turn 4
        else if (r2 < 25) st.flankers = { turn: 4 };
        // shield wall: a line of armour between the armies holds still until one of them falls
        else if (r2 < 30 && mid) { const spots = freeTiles(st, mid, 4, 4).filter(([x, y]) => footWalk(st.map.terr[y * W + x])); let k = 0;
          for (const at of spots.slice(0, 4)) { const a = spawn(st, POOL ? poolPick(rng, c2 => /knight|general|armou?r/i.test(c2.name || '') && !c2.monster, false) : 'Knight', 'enemy', Math.max(1, lv), at, { shieldWall: true }); a.ai = 'hold'; k++; }
          if (k) { st.shieldWall = true; say2('Armoured soldiers lock shields across the middle of the field. They will not move until the line breaks.'); } }
        // dark ritual: two chanting mages; if either still stands on turn 5, every enemy heals fully
        else if (r2 < 35 && E0) { const spots = freeTiles(st, E0, 2, 5); const ids = [];
          for (const at of spots) { const m = spawn(st, POOL ? poolPick(rng, c2 => (c2.wpn === 'fire' || c2.wpn === 'dark') && !c2.monster, false) || poolPick(rng, () => true, false) : 'Mage', 'enemy', Math.max(1, lv), at, { ritual: true }); m.ai = 'hold'; ids.push(m.id); }
          if (ids.length) { st.ritual = { ids, turn: 5 }; say2('Two robed figures begin a chant behind the enemy lines. If they finish, every wound on that side will close.'); } }
        // rain of arrows: a marked area near the army is hit every other turn by archers out of sight
        else if (r2 < 40) { st.volley = { next: 2, warn: null }; say2('Archers somewhere out of sight have the range of this field. Watch for the marked ground.'); }
        // the decoy commander: the commander in plain sight is a double; the real one hides in the ranks as an ordinary soldier
        else if (r2 < 46 && bossE && st.goal === 'boss' && !st.pincer) { const ranks = st.units.filter(u => u.team === 'enemy' && u.hp > 0 && !u.boss && !u.big && !u.cart && !u.name);
          const real = ranks.sort((a, b) => (Math.abs(b.x - bossE.x) + Math.abs(b.y - bossE.y)) - (Math.abs(a.x - bossE.x) + Math.abs(a.y - bossE.y)))[0];
          if (real) { st.decoy = { decoy: bossE.id, real: real.id, name: bossE.name }; real.level += 2; for (const k2 of ['str', 'skl', 'spd', 'def']) real[k2] += 2; real.maxhp += 6; real.hp = real.maxhp; } }
        // feigned retreat: the front holds back two turns; on turn 3 ambushers rise beside the army
        else if (r2 < 52) { const front = st.units.filter(u => u.team === 'enemy' && u.hp > 0 && !u.boss).sort((a, b) => (Math.abs(a.x - lordU.x) + Math.abs(a.y - lordU.y)) - (Math.abs(b.x - lordU.x) + Math.abs(b.y - lordU.y))).slice(0, 3);
          for (const u of front) { u._feignAi = u.ai; u.ai = 'hold'; } st.feint = { ids: front.map(u => u.id), turn: 3 }; }
        // wolf handlers: a handler and three wolves that fight for the enemy
        else if (r2 < 58 && E0 && POOL && POOL.monsters && POOL.monsters.length) { const dogs = POOL.monsters.filter(k2 => /doog|gwyll|hound|dog/i.test(className({ cls: k2 }))); const spots = freeTiles(st, E0, 4, 5);
          if (dogs.length && spots.length >= 2) { const h = spawn(st, POOL ? poolPick(rng, c2 => !c2.monster && !c2.healer, false) : 'Fighter', 'enemy', Math.max(1, lv), spots[0]); h.name = h.name || uniqueName(camp, rng);
            for (const at of spots.slice(1, 4)) { const w = spawn(st, rng.pick(dogs), 'enemy', Math.max(1, lv), at, { wild: 'wolf', handled: true }); w.name = 'War Hound'; }
            say2(`${h.name} has brought hunting dogs to this fight, trained to go for the throat.`); } }
        // holy ward: two enemy priests; magic does half damage to enemies within two squares of one
        else if (r2 < 64 && E0) { const ids = []; for (const at of freeTiles(st, E0, 2, 5)) { const pr = spawn(st, POOL ? poolPick(rng, c2 => c2.healer && !c2.monster, false) || poolPick(rng, () => true, false) : 'Priest', 'enemy', Math.max(1, lv), at, { warder: true }); ids.push(pr.id); }
          if (ids.length) { st.ward = ids; say2('Enemy priests raise a holy ward. Spells lose their bite near them.'); } }
        // chain lightning: an enemy sage whose hits arc to one of the army's units beside the target
        else if (r2 < 70 && E0) { const at = freeTiles(st, E0, 1, 5)[0]; if (at) { const sg = spawn(st, POOL ? poolPick(rng, c2 => c2.wpn === 'fire' && !c2.monster, true) || poolPick(rng, c2 => c2.wpn === 'fire', false) : 'Sage', 'enemy', Math.max(1, lv + 1), at, { chainCaster: true }); sg.name = sg.name || uniqueName(camp, rng); st.chainCaster = sg.id; say2(`${sg.name} calls lightning that does not stop at one target.`); } }
        // trampling cavalry: enemy riders knock what they hit back a square
        else if (r2 < 76) { let k2 = 0; for (const u of st.units) if (u.team === 'enemy' && CLASSES[u.cls] && CLASSES[u.cls].canto && !CLASSES[u.cls].flier) { u.trample = true; k2++; } if (k2) { st.trample = true; say2('The enemy horse is heavy and well drilled. Whatever they hit, they ride over.'); } }
        // spiked barricades: barriers between the armies that hurt whoever strikes them
        else if (r2 < 82 && mid) { let k2 = 0; for (const at of freeTiles(st, mid, 3, 5)) { const b = spawn(st, POOL ? poolPick(rng, c2 => /knight|armou?r/i.test(c2.name || '') && !c2.monster, false) : 'Knight', 'enemy', Math.max(1, lv), at, { cart: true, barricade: true, rooted: true, spikes: true }); b.ai = 'hold'; b.items = []; b.weapon = 'none'; b.name = 'Spiked Barricade'; b.def += 6; b.maxhp += 6; b.hp = b.maxhp; k2++; }
          if (k2) say2('Spiked barricades stand across the approach. Breaking through will cost blood.'); }
        // second wind (sometimes): the commander heals to full once, the first time they drop below 30%
        else if (r2 < 86 && bossE) bossE.secondWind = true;
        // last stand: in a chapter not about the commander, their fall makes the rest fight harder
        else if (r2 < 92 && bossE && st.goal !== 'boss' && st.goal !== 'flee') st.lastStand = bossE.id; } } }
  // last check: anyone standing on ground they cannot use (an armoured general on a mountain) moves to the nearest free square they can
  fixFooting(st);
  for (const u of st.units) if (u.team === 'enemy' && (u.boss || u.rival || (u.captain && rng.chance(50))) && !u.pskill) u.pskill = rng.pick(PSKILLS);
  for (const u of st.units) if (u.team === 'enemy' && !u.crest) { if (u.genTitle) u.crest = rollCrest(camp, rng, true); else if ((u.boss || u.rival) && rng.chance(35)) u.crest = rollCrest(camp, rng, false); }
  { const jb = ((n - 1) % 30) + 1, boss = st.units.find(u => u.boss && u.team === 'enemy'); camp.relics = (camp.relics || []).filter(r => r.owner !== 'enemy');
    // the commander of every fifth chapter carries the book's next relic and will awaken it against the army; the last two of a book are strong
    const mainCount = camp.relics.filter(r => !r.side).length, relicHere = st.side ? [5, 10].includes(st.side.idx) && conv.sideRelics < 2 : jb % 5 === 0 && mainCount < 6 * Math.ceil(n / 30);
    if (relicHere && boss) { const pr = RNG(((camp.seed || 0) ^ 0x2E11C) + n * 977), r = makeRelic(camp, pr, jb >= 25), S = camp.story || {};
      r.owner = 'enemy'; r.chapter = st.relicKey; r.side = !!st.side; if (st.side) conv.sideRelics++; camp.loreSeen = camp.loreSeen || []; const seen = new Set(camp.loreSeen);
      r.lore = relicLore(r, { seen, war: S.war || 'the old war', order: S.order || 'the old order', home: S.home || camp.realm, boss: boss.name, place: st.place || 'the field' }, pr); camp.loreSeen = [...seen].slice(-40);
      r.places = [st.place]; r.realm = st.siteRealm;
      camp.relics.push(r); boss.relic = r.id; r.holder = boss.id; r.holderName = boss.name; registerRelics(camp); (st.armoryNotes = st.armoryNotes || []).push(`Scouts say ${boss.name} carries ${r.name} into this battle.`); }
    // fame: a relic held at rank A or higher is known to the enemy before the battle
    const famed = boss && (camp.relics || []).filter(r => r.owner !== 'enemy' && bondRank(r) >= 3).map(r => [r, camp.army.find(u => u.id === r.holder)]).find(([r, h]) => h);
    if (famed) (st.armoryNotes = st.armoryNotes || []).push(`Word of ${relicFull(famed[0])} has reached ${boss.name}'s camp. They know ${famed[1].name} carries it.`); }
  if (D.st) for (const u of st.units) if (u.team === 'enemy') { u.maxhp += D.st * 2; u.hp = u.maxhp; for (const k of ['str', 'mag', 'skl', 'spd', 'def', 'res']) u[k] += D.st; }
  const boss0 = st.units.find(u => u.boss);
  st.enemyArmy = boss0 ? `${boss0.name}\u2019s army` : `the ${place} garrison`;
  st.goalText = GOAL_TEXT[goal].replace('{n}', st.surviveTurns).replace('the throne', st.seizeKind === 'gate' ? 'the gate' : st.seizeKind === 'fort' ? 'the fort' : 'the throne');
  st.intro = introText(camp, st);
  worldNode(camp, place, skirmish); { const nd = camp.world.nodes[camp.world.nodes.length - 1]; if (site) { nd.pos = site.pos; nd.kind = site.kind; nd.struct = site.struct; nd.realm = site.realm; nd.landmark = site.landmark; } st.site = site; }
  if (skirmish && ambushNow) { const A = camp.ambushOffer; A.fought = true; st.ambush = A;   // keep only a column on the march, led by its commander
    const foesA = st.units.filter(u => u.team === 'enemy'), bossA = foesA.find(u => u.boss) || foesA[0]; const keep = new Set([bossA, ...foesA.filter(u => u !== bossA).sort((a, b) => Math.abs(a.x - bossA.x) + Math.abs(a.y - bossA.y) - Math.abs(b.x - bossA.x) - Math.abs(b.y - bossA.y)).slice(0, A.size - 1)]);
    st.units = st.units.filter(u => u.team !== 'enemy' || keep.has(u)); if (bossA) bossA.name = A.leader;
    st.intro.push(['', `${A.leader}'s column from ${A.realm} is on the road to join the enemy. A small detachment has gone ahead to catch it before it arrives.`]); }
  if (skirmish) { st.skirmish = true; st.goal = 'rout'; st.goalText = st.ambush ? `Ambush ${st.ambush.leader}'s column before it joins the enemy` : 'Skirmish: defeat all enemies'; st.major = false; st.final = false; st.reinforce = null; st.title = (st.ambush ? 'Ambush on the Road at ' : 'Skirmish at ') + place;
  if (st.reunion) st.major = true;
    const mons = POOL && POOL.monsters && POOL.monsters.length && rng.chance(60);
    for (let i = 0; i < st.units.length; i++) { const o = st.units[i]; if (o.team !== 'enemy') continue; o.boss = false; o.captain = false; o.guard = false; o.ai = 'pursue';
      if (mons) { const m = makeUnit(rng, rng.pick(POOL.monsters), 'enemy', o.level); m.x = o.x; m.y = o.y; m.ai = 'pursue'; st.units[i] = m; } }
    st.bossName = null; const f = facts(camp, st), lord = camp.army.find(u => u.id === camp.lord) || camp.army[0];
    st.intro = [['', STORY.pick(camp, 'skb', SK.brief, rng, f)], [lord.name, STORY.pick(camp, 'skl', SK.lord, rng, f)]];
    st._camp = camp; st.events = []; st.joined = []; st.eventLines = []; st.spent = 0; st.campGold = camp.gold || 0; st.pSlots = pSlots; st.eSlots = st.eSlots || eSlots; if (st.side || st.clampLv) for (const u of st.units) sideClamp(st, u); dismount(st); fixFooting(st); return st; }
  scheduleEvents(camp, st, rng, n, lv, pSlots, eSlots);
  scheduleRecruit(camp, st, rng, n);
  setObjective(camp, st, rng, n, pSlots);
  scheduleMapEvents(camp, st, rng, n);
  failsafe(st);
  if (st.beast) { st.goal = 'boss'; st.goalText = `Bring down ${st.beast.replace(/^The /, 'the ')}`; delete st.defendTurns; st.escortee = null; st.rescueTarget = null; }   // the beast's chapter is always the hunt
  if (st.reunion) { const mk = st.meetKind; st.goal = mk === 'boss' ? 'boss' : 'rout'; delete st.defendTurns; st.escortee = null; st.rescueTarget = null;
    st.goalText = mk === 'boss' ? (st.pincer && st.pincer.length > 1 ? 'Join the two armies: defeat the enemy commanders' : 'Join the two armies: defeat the enemy commander') : mk === 'ambush' ? 'Ambushed: hold until the second army arrives, then defeat all enemies' : mk === 'rescue' ? 'Break through to the survivors: defeat all enemies' : 'Join the two armies: defeat all enemies';
    if (mk === 'ambush') st.sideLines = [['', `The main army is caught in the open at ${place}, enemies on every side.`], ...(st.sideLines || [])];
    if (mk === 'rescue') st.sideLines = [['', `What is left of ${(reunion && reunion.lord) ? reunion.lord.name : 'the second army'}'s soldiers hold out at ${place}, surrounded.`], ...(st.sideLines || []).filter(l => l[0] === '')];
    if (conv.thirdParty && !st.axis) { const ax = Math.floor(W / 2), ay = rng.chance(50) ? 1 : H - 2, plan = { leader: uniqueName(camp, rng), size: 4 + rng.int(0, 1), mode: 'start', realm: makePlace(rng) };
      st._camp = st._camp || camp; try { axisArmy(st, rng, plan, ax, ay); st.axis = plan; st.sideLines = [...(st.sideLines || []), ['', `A third banner rises over ${place}: ${plan.leader} of ${plan.realm}, whose company answers to no one here.`]]; } catch (e) { } } }
  if (st.side || st.clampLv) { st._camp = st._camp || camp; for (const u of st.units) sideClamp(st, u); }
  // (Casim: no swarming) events stack enemies on the chapter's own count; at the start no main-route chapter holds more than
  // twice its minimum, trimming the most recently added ordinary enemies first
  if (!st.side && !skirmish) { const lim = 2 * enemyMin(((n - 1) % 30) + 1), plainE = st.units.filter(u => u.team === 'enemy' && u.hp > 0 && !u.boss && !u.captain && !u.name && !u.big && !u.cart && !u.wild && !u.villain && !u.genTitle && !u.keyholder);
    let over = st.units.filter(u => u.team === 'enemy' && u.hp > 0).length - lim; while (over > 0 && plainE.length) { const x = plainE.pop(); st.units.splice(st.units.indexOf(x), 1); over--; } }
  dismount(st); fixFooting(st);   // again, after every class change in setup (and the indoor dismount)
  st._startEnemies = st.units.filter(u => u.team === 'enemy' && u.hp > 0).length;
  return st;
}
function inRangeAny() { return false; }

// ---------------------------------------------------------------- STORY
// Each campaign gets its own premise and world. Every line is written whole and filled only with facts the
// engine holds (names, places, the real objective). A run never repeats a line: picks are tracked per campaign.
const STORY = (() => {
  const VOICES = ['blunt', 'formal', 'warm', 'anxious', 'wry', 'cold'];

  // ---- world pieces
  const HOME_KIND = ['kingdom', 'duchy', 'border province', 'free city', 'island realm', 'river kingdom'];
  const FALL = [
    'Its king was killed on the steps of his own hall',
    'Its gates were opened from the inside by a steward who had been bribed',
    'Its army was tricked into marching to the border to fight a war that was never real, and the capital fell while it was gone',
    'Its walls held for forty days, until the wells were poisoned',
    'Its queen surrendered to save the city, and was imprisoned anyway',
    'Its harbour burned in a single night, with the fleet still at anchor',
  ];
  const VILLAIN_TITLE = ['Emperor', 'High Priest', 'Warlord', 'Regent', 'Grand Duke', 'Archmage'];
  const VILLAIN_GOAL = [
    'wants {relic} because the old texts say it can wake what sleeps beneath the mountains',
    'claims {relic} proves his blood is royal, and means to crown himself with it',
    'believes {relic} will end every war if one hand holds it, and has decided the hand is his',
    'needs {relic} to open a sealed vault his order has searched for since {war}',
    'fears {relic} more than any army, and wants it destroyed before anyone else can use it',
  ];
  const RELIC = ['Ember Crown', 'Tidestone', 'Gleaming Lance', 'Sealed Codex', 'Dragon Heart', 'Moon Blade', 'Ashen Mirror', 'Star Banner'];
  const WAR_A = ['Long', 'Red', 'Silent', 'Second', 'Broken', 'Winter', 'Hundred Days\u2019'];
  const WAR_B = ['War', 'Crusade', 'Schism', 'Rebellion'];
  const ORDER_A = ['Silver', 'Thorned', 'Dawn', 'Iron', 'Lantern', 'Ninth'];
  const ORDER_B = ['Lance', 'Shield', 'Rose', 'Watch', 'Oath', 'Gate'];
  const GENERAL_TITLE = ['General', 'Marshal', 'Commander', 'Lord-Captain', 'Warden'];
  const RIVAL_MOTIVE = [
    'served {order} until it was disbanded, and blames your family for it',
    'lost a brother at the fall of {home} and believes the lord\u2019s father gave the order',
    'was promised the lordship of {home} once the war is won',
    'trained beside the lord as a child and chose the other side when it came',
    'wants {relic} for reasons the faction does not know about',
  ];

  function fill(s, f) { return s.replace(/\{(\w+)\}/g, (m, k) => f[k] !== undefined ? f[k] : m).replace(/ {2,}/g, ' ').replace(/ ([.,!?])/g, '$1').trim()
    .replace(/\b([Tt]he) the\b/g, '$1').replace(/\b([Aa]) ([aeiouAEIOU])/g, (m, a, v) => a + 'n ' + v).replace(/(^|[.!?] )([a-z])/g, (m, p, c) => p + c.toUpperCase()); }

  function premise(rng, camp, nameFn) {
    const relic = 'the ' + rng.pick(RELIC), war = 'the ' + rng.pick(WAR_A) + ' ' + rng.pick(WAR_B), order = 'the Order of the ' + rng.pick(ORDER_A) + ' ' + rng.pick(ORDER_B);
    const f = { home: camp.realm, relic, war, order };
    const villain = { name: nameFn(), title: rng.pick(VILLAIN_TITLE) };
    villain.goal = rng.pick(VILLAIN_GOAL).replace(/\{(\w+)\}/g, (m, k) => f[k] !== undefined ? f[k] : m);
    const generals = []; for (let i = 0; i < 5; i++) generals.push({ name: nameFn(), title: rng.pick(GENERAL_TITLE) });
    return { home: camp.realm, homeKind: rng.pick(HOME_KIND), fall: rng.pick(FALL), relic, war, order, villain, generals, motive: rng.pick(RIVAL_MOTIVE).replace(/\{(\w+)\}/g, (m, k) => f[k] !== undefined ? f[k] : m), book: 1 };
  }
  const actOf = n => Math.ceil(n / 5);
  const generalFor = (story, n) => story.generals[(actOf(n) - 1) % story.generals.length];

  // ---- voices: from class and stats, with some chance, fixed for the run
  function voiceFor(rng, cname, u) {
    const n = (cname || '').toLowerCase();
    const lean = /knight|general|paladin|great|lord/.test(n) ? ['formal', 'blunt'] : /thief|rogue|assassin|archer|sniper|hunter|nomad|ranger/.test(n) ? ['wry', 'anxious']
      : /cleric|priest|troubadour|valkyrie|monk|bishop|dancer|bard/.test(n) ? ['warm', 'anxious'] : /mage|sage|shaman|druid|summoner/.test(n) ? ['formal', 'cold']
      : /myrmidon|swordmaster|assassin|mercenary|hero/.test(n) ? ['cold', 'wry'] : /fighter|warrior|brigand|pirate|berserker|axe/.test(n) ? ['blunt', 'warm'] : VOICES;
    return rng.chance(70) ? rng.pick(lean) : rng.pick(VOICES);
  }

  // ---- line pools. {name} a speaker or subject, {other} a second unit, {place}, {lord}, {faction}, {commander}, {title}, {turns}, {home}, {relic}, {villain}, {vtitle}, {war}, {order}
  const P = {
    briefing_rout: [
      'Scouts count soldiers of {faction} spread across {place}. They will have to be driven out before the army can move on.',
      'The road runs straight through {place}, and {faction} has filled it with soldiers. None of them can be left behind the march.',
      'A company of {faction} has dug in at {place}. The only way forward is through all of them.',
      '{place} sits on the only crossing for miles. Its garrison answers to {faction}, and it will fight to the last man.',
      'Smoke rises over {place}. Soldiers of {faction} are looting what is left, and they are not expecting company.',
      'The villagers who fled {place} say the soldiers there are tired and badly fed. They are still soldiers.',
      'Every soldier of {faction} at {place} has to fall before the army can rest tonight.',
      'There is no way around {place}. The enemy knows it and has filled the field with spears.',
    , "{faction} has scattered its soldiers across {place}. Hunt every one of them down.", "There are too many soldiers at {place} to leave behind. They all have to fall.", "The soldiers at {place} are cut off from their army. Make sure none of them rejoin it."],
    briefing_boss: [
      '{title} {commander} holds {place}. If the commander falls, the rest of this army will scatter.',
      'The soldiers at {place} take their orders from {title} {commander}. Remove the commander and the orders stop.',
      '{commander} commands at {place}, and the soldiers there are loyal to their commander, not to {faction}. Defeat {commander} and the field is won.',
      'The enemy at {place} is more than the army can grind down. Strike at {title} {commander} instead.',
      'Word from {place} is that {commander} leads from the front. That makes {commander} easy to find.',
    , "{title} {commander} is the only reason the soldiers at {place} still hold. Take that reason away.", "Spies say {commander} has never lost a battle at {place}. That ends today.", "The army at {place} answers to {title} {commander} alone. Break the commander and you break the army."],
    briefing_seize: [
      '{title} {commander} holds the {point} at {place}. Take it and the region is free of {faction}.',
      'The {point} at {place} controls every road in the valley. {commander} will not give it up without a fight.',
      'Whoever holds the {point} at {place} holds the pass. Today that is {title} {commander}.',
      'The army needs the {point} at {place}. {commander} stands on it, and {lord} has to stand on it last.',
    , "Take the {point} at {place} and the enemy loses its hold on the region. {commander} knows it too.", "{title} {commander} waits on the {point} at {place}. Reach it and the battle is won."],
    briefing_survive: [
      'The army is surrounded at {place}. Reinforcements from the east are {turns} turns away, if everyone holds until then.',
      '{faction} has caught the army in the open at {place}. Hold for {turns} turns and the road behind will open.',
      'There is no winning the field at {place}. There is only holding it for {turns} turns.',
      'The scouts were wrong about {place}. The army will have to dig in and last {turns} turns.',
    , "Night is coming and {faction} has the army surrounded at {place}. Last {turns} turns and help will arrive.", "Help is {turns} turns out. Until then, {place} is all the army has.", "Hold your ground at {place}. You only need to survive for {turns} turns."],
    commander_officer: [
      'You came all this way to die at {place}? Very well.',
      'My orders are to hold {place}. Nobody said anything about mercy.',
      'So this is the army that has been embarrassing {faction}. You look smaller up close.',
      'Turn back now and I will tell my superiors I never saw you.',
      'Every one of you is worth a bounty. I intend to collect.',
      'I was told to expect you. I was not told you would be this few.',
      'Kill them quickly. I want to be home before the rain.',
      'If you want {place}, come and take it from me.',
    , "Another band of rebels. Try to make this interesting.", "I have orders, and you are in the way of them.", "Hold the line! Nobody passes {place}.", "You are brave. Brave and foolish usually go together.", "Surrender now and I will make it quick.", "I will be a general by the end of the month. Your head will help."],
    commander_general: [
      '{vtitle} {villain} sends his regards, and me. You will not need anything else.',
      'I have held {place} for {faction} since before you could lift a sword. I am not letting go now.',
      'You are after {relic}. Everyone is. Only one of us is going to leave {place}.',
      'I knew {order} before it fell. You fight the way they did. That is not a compliment.',
      'This war has a winner already. I am sorry you are on the wrong side of it.',
    , "I trained half the officers in {faction}. You have met my students. Now meet me.", "The {war} taught me everything I know about killing. Let me share it.", "Turn back, {lord}. I am giving you that chance once.", "I have no quarrel with you. My orders do."],
    rival_first: [
      'So you are {lord}. I have waited a long time to see your face.',
      'Do you even know who I am, {lord}? You will.',
      '{lord}. I thought you would be taller.',
    , "I have heard a great deal about you, {lord}. All of it disappointing.", "At last. Let us see what all the fuss is about."],
    rival_again: [
      'Twice now. I will not miss you a third time.',
      'You were lucky last time, {lord}. Luck runs out.',
      'I have thought about our last fight every night since.',
    , "Still alive, {lord}? Not for long.", "You have grown stronger. So have I."],
    rival_final: [
      'No more running, for either of us.',
      'This ends here, {lord}, whichever way it goes.',
      'I {motive}. That is why I am here. Now draw.',
    ],
    rival_escape: ['Not today. But soon.', 'Fall back! This is not over, {lord}.', 'Remember my face. You will see it again.', 'I will not die for {faction}. Not here.', "Fall back. Let them have {place}. I will have them later.", "This is not finished, {lord}. Not by a long way."],
    rival_down: ['{rival} is gone. I wish it had ended some other way.', 'It is over. {rival} chose this road a long time ago.', 'Bury {rival} with the others. Whatever else, that was a soldier.'],
    // the lord before battle, by situation
    lord_first: [
      '{home} fell because we were not ready. This time we are.',
      'We march for {home}. Everything between here and there belongs to {faction}, so we take it back one field at a time.',
      'They burned {home} and called it peace. Let us show them what peace costs.',
    ],
    lord_loss: [
      'We buried {fallen} this morning. Let us make sure it means something.',
      'I keep looking for {fallen} in the line. Watch each other today.',
      '{fallen} would tell us to stop standing around. So, let us move.',
    , "{fallen}\u2019s place in the line stays empty today. Fight for both of you.", "I am not ready to talk about {fallen}. So let us fight.", "We march without {fallen}. Let us make every step count.", "Keep {fallen} in mind and each other in sight."],
    lord_major: [
      'This is the battle the rest of the war has been leading to. Stay close and stay alive.',
      'If we break {faction} here, the road to {relic} opens. Everyone, with me.',
      'I will not ask more of anyone than I ask of myself today. Which is everything.',
    , "This is where {faction} expects us to break. Prove them wrong.", "One of their generals waits ahead. Everything we have done leads here.", "Win here and the whole war turns. Stay with me.", "I will not lose anyone today. Do not make a liar of me."],
    lord_plain: [
      'Keep the line tight and do not chase anyone into the trees.',
      'Healers stay behind the shields. Everyone else, follow my lead.',
      'We take {place} and we rest. That is the whole plan.',
      'Watch the flanks. {faction} likes to come from the side.',
      'Nobody fights alone today. Pair up.',
      'One more field. Then we will have earned a fire and a hot meal.',
      'Take it slow. A careful march is still a march.',
      'If it looks like a trap, it probably is. Move together.',
    , "Scouts first, then the rest of us. Nobody rushes.", "We have done this before. We will do it again.", "Keep the wounded behind the line and the archers on high ground.", "Look after the person next to you. That is all I ask.", "We move as one army. No heroes, no stragglers."],
    // a companion before battle, by voice
    companion: {
      blunt: ['Point me at them.', 'Talk later. Fight now.', 'I am ready. I was ready an hour ago.', 'The sooner we start, the sooner we finish.', 'Just tell me where to stand.'],
      formal: ['I am at your command, {lord}.', 'My blade is yours, as it has been since {home}.', 'We will not shame the banner today.', 'Give the order, and it will be done.', 'I have studied the ground. We can win this.'],
      warm: ['Stay safe out there, everyone. I mean it.', 'We have come this far together. We will go further.', 'I brought extra bandages. Try not to need them.', 'Whatever happens, I am glad to be here with all of you.', 'Eat something first. You fight better fed.'],
      anxious: ['There are more of them than last time, are there not?', 'I will do my best. I just hope it is enough.', 'Stay close to me? Please?', 'My hands are shaking. That is normal, right?', 'Nobody mentioned the enemy would have archers.'],
      wry: ['Another day, another army that wants us dead.', 'I was promised this would get easier.', 'Wake me when it is my turn to be brilliant.', 'Do we ever get to fight anyone who is outnumbered?', 'I have a good feeling about this. That usually means trouble.'],
      cold: ['They will not see me coming.', 'Count them for me. I will count the fallen.', 'Fear is useful. Theirs, not mine.', 'Finish it quickly. Leave nothing standing.', 'Do not slow me down.'],
    },
    // death: the unit's last words, by voice
    last_words: {
      blunt: ['Should have ducked.', 'Keep going. Do not wait for me.', 'Damn it. Not here.', 'Get them for me.', 'I held as long as I could.', 'Tell {lord}... I tried.'],
      formal: ['It was an honour to serve, {lord}.', 'Forgive me. I could not hold the line.', 'Carry on without me. That is an order, of sorts.', 'My oath ends here. See it kept.', 'I am sorry, {lord}. I fell short.', 'Tell {home} that I did not run.'],
      warm: ['Do not cry for me. Promise?', 'Look after each other.', 'It is all right. It does not hurt now.', 'I wanted to see {home} again.', 'Thank you. For everything.', 'Go on. I will catch up.'],
      anxious: ['I knew this would happen.', 'It is so cold all of a sudden.', 'I am sorry, I am so sorry.', 'Please do not leave me here.', 'I was not ready.', 'Is it over? I cannot see.'],
      wry: ['Well. That did not go to plan.', 'At least I will not have to march tomorrow.', 'I always said I would go out stylishly. This is not it.', 'Tell the others I was winning.', 'Remember me as taller.', 'Bad luck. Story of my life.'],
      cold: ['So this is how it ends.', 'No regrets.', 'Finish them.', 'Do not look back.', 'I expected worse.', 'Hm. Someone was better today.'],
    },
    lord_mourns: [
      'We lost {name} at {place}. I will carry the name with me.',
      '{name} fell at {place}. Nobody fights in that spot again without thinking of {name}.',
      '{name} should have been here to see this. {name} paid for it instead.',
      'I promised {name} we would see the end of this war together. I will keep half of that promise.',
      'Write it down. {name}, fallen at {place}, in chapter {chapter}.',
      '{name} held the line at {place} when no one else could. Remember that.',
    , "{name} gave everything at {place}. We will not waste it.", "Somebody write to {name}\u2019s family tonight. I will sign it.", "There will be a stone for {name} when this war is done.", "I keep turning to say something to {name}."],
    partner_mourns: {
      blunt: ['{name} was the best of us. Whoever did that is mine.', 'I should have been next to {name}. I was not.'],
      formal: ['I will see {name} honoured, when this is done.', '{name} deserved a better end than this.'],
      warm: ['{name}... I cannot believe it. We were going to see the sea together.', 'Somebody hold on to me for a minute.'],
      anxious: ['It should have been me. It should have been me.', 'I keep thinking {name} will walk back into camp.'],
      wry: ['{name} owed me a drink. Now I will never collect.', 'I always thought {name} would outlive the rest of us.'],
      cold: ['{name} is gone. Nothing changes that. Keep moving.', 'Mourning can wait until the fighting stops.'],
    },
    victory_clean: ['Not a single soldier lost. Rest, all of you. You earned it.', '{place} is ours, and everyone is still standing. That does not happen often.', 'A clean win at {place}. Let us not get used to it.', "Everyone walks away from {place}. Keep that feeling.", "No graves to dig tonight. That is the best kind of victory.", "We took {place} without losing a soul. Somebody tell the cooks.", "All present and breathing. Well fought.", "Not one name to add to the list today."],
    victory_losses: ['{place} is ours. It cost more than it should have.', 'We hold {place}. I will not call it a celebration.', 'We won. Count the living, then count the dead.', "{place} is ours, and the price was too high.", "The field is quiet. So is the camp.", "Victory. I wish it felt like one.", "We hold {place}. Light a fire for the ones who are not here.", "We won, and I will remember what it cost."],
    victory_major: ['{commander} is down, and with {commander} the heart of this army. The road ahead is open.', 'That was {faction}\u2019s best, and it was not enough. The war turns here.', 'One general fewer. {vtitle} {villain} will have heard by morning.', "{commander} has fallen. {faction} will feel that loss for a long time.", "The general is gone and the army behind {commander} is breaking. Push on.", "With {commander} gone, the way to {relic} is open.", "Word of {commander}\u2019s defeat will spread before we reach the next town."],
    victory_plain: ['{place} is ours. Rest while you can.', 'We move at first light. Get some sleep.', 'Good work today. Every one of you.', 'Another field behind us. Let us not look back at it.', 'Tend the wounded and eat. We march soon.', 'The army holds {place}. Post a watch and get some rest.', "The army camps at {place} tonight.", "That is {place} done. On to the next.", "Well fought. Get some rest before the march.", "We hold the field. Check your weapons and sleep.", "Another battle behind us. Count the wounded and see them tended."],
    retreat: ['Fall back! There is nothing left to hold at {place}.', 'We cannot win this one. Pull back to the road.', 'Retreat. We will choose a better field next time.', 'Get everyone out. I will not lose the army for {place}.', "Pull back to the trees! We regroup there.", "We are leaving {place}. Carry anyone who cannot walk.", "This is not a defeat. It is a delay. Fall back.", "Everyone out, now. There will be other days."],
    // recruiting: the reason, then the recruit's own words in their voice
    recruit_reason: [
      'A {cls} who had been hiding from the patrols near {place} came out once the fighting stopped.',
      'One of the prisoners {faction} kept at {place} turned out to be a {cls}, and wanted a weapon back.',
      'A {cls} from a village near {place} walked into camp at dusk and asked to see {lord}.',
      'A {cls} watched the battle at {place} from the edge of the forest, and decided to join your side.',
      'The garrison at {place} had pressed a local {cls} into service. That {cls} chose to leave with the army instead.',
      'A {cls} who fought for {home} before it fell found the army at {place}.',
      'A wandering {cls} had been following the army for days, and finally said why.',
      'A {cls} the army freed from a cart of prisoners at {place} refused to go home.',
    ],
    recruit_words: {
      blunt: ['I want to fight them. You are fighting them. Simple.', 'Give me a place in the line. I will earn it.', 'I am not good with speeches. I am good with an axe.', 'I hate {faction} more than I fear them. That is enough.', 'Feed me and point me at the enemy.'],
      formal: ['I would be honoured to serve under your banner, {lord}.', 'My family served {home} for three generations. Let me be the fourth.', 'I offer my skill and my loyalty, such as they are.', 'I have heard what you did at {place}. I wish to be part of it.', 'Accept my oath, {lord}, and I will not break it.'],
      warm: ['You looked like you could use a friend. Or several.', 'I cannot stand by while people are hurt. Let me help.', 'I do not have much, but I can share it with all of you.', 'Everyone deserves someone at their back. Let me be that.', 'My mother always said to follow kind people. You seem kind.'],
      anxious: ['I am not very brave, but I am very determined.', 'If I stay here alone, they will find me. Can I come with you?', 'I will try not to slow you down. I promise.', 'I have never been in a real battle. Is it always this loud?', 'Please, let me come. I do not have anywhere else to go.'],
      wry: ['Your army needs someone with a sense of humour. I volunteer.', 'I was going to rob you, but this seems like a better job.', 'Lost causes are my favourite kind.', 'I hear the pay is terrible. I am in.', 'Somebody has to keep you all from dying of seriousness.'],
      cold: ['I go where the fighting is. Right now that is with you.', 'Do not mistake this for friendship. We want the same enemy dead.', 'I work alone, usually. Usually.', 'You fight well enough. I will stay, for now.', 'I have a debt to settle with {faction}. You are my best chance.'],
    },
    // supports: an opener in one voice and a reply in the other, per rank
    support_open: {
      C: {
        blunt: ['You fought well at {place}. Do not let it go to your head.', 'You keep ending up next to me in a fight. I do not mind.', 'Your footwork is sloppy. You still won, though.', "I saw you take that hit at {place}. You did not even flinch.", "We should spar sometime. You might teach me something."],
        formal: ['I noticed you covered my left at {place}. Thank you.', 'May I ask where you trained? Your form is unusual.', 'We have not spoken much, though we fight side by side.', "I owe you thanks for {place}. I do not forget such debts.", "Your discipline in the line is admirable."],
        warm: ['Are you hurt? You took a hard hit at {place}.', 'I saved you some of the stew. You looked hungry.', 'I am glad you are here. It feels safer, somehow.', "You always save the last ration for someone else. I noticed.", "Do you want company on watch tonight?"],
        anxious: ['Can I fight near you next time? I feel braver.', 'Sorry, I did not mean to stare. You are very good at this.', 'Was it me, or did that last fight nearly go badly?', "You are very calm in a fight. How do you do that?", "I dropped my weapon at {place}. Did you see? Please say no."],
        wry: ['If you keep saving me, I am going to owe you money.', 'You look like you have a story. Do you have a story?', 'Nice work at {place}. Almost as good as mine.', "We keep surviving together. People will start to talk.", "Is it me, or do the enemies always aim for us?"],
        cold: ['You fight well. For someone so loud.', 'You were in my way at {place}. Do not be next time.', 'Hm. You are still alive. Good.', "Your aim is acceptable.", "Stay out of my way and we will get along."],
      },
      B: {
        blunt: ['I trust you to have my back. That is not something I say.', 'After {place}, I figure we are past the small talk.', 'You nearly died at {place}. Do not do that again.', "I was wrong about you. You are tougher than you look.", "When things went bad at {place}, you were the first one I looked for."],
        formal: ['I have come to rely on you. I wanted you to know that.', 'Since {place}, I think of you as a true comrade.', 'Would you tell me why you joined this war?', "I have told no one else this, but I am not sure I believe in this war anymore.", "You fought like a knight of {home} at {place}."],
        warm: ['You have been quiet lately. Want to talk about it?', 'I worry about you in the thick of things. Is that strange?', 'Whatever is weighing on you, you do not have to carry it alone.', "I wrote to my family about you. They want to meet you.", "You smiled today. You should do that more."],
        anxious: ['When things get bad, I look for you. Is that all right?', 'I had a nightmare about {place}. You were in it.', 'I am less scared when we are together. I wanted you to know.', "I think I am getting braver. It is because of you.", "Can I tell you something embarrassing? I practise speeches to you in my head."],
        wry: ['We make a decent team. Do not tell anyone I said so.', 'Every battle you survive ruins my plan to inherit your boots.', 'You know, you are tolerable. That is high praise from me.', "I have started saving you a seat by the fire. Purely tactical.", "You are the only one who laughs at my jokes. I need you alive."],
        cold: ['You are the only one here who does not get in my way.', 'I watched you at {place}. You did not hesitate. Neither will I.', 'I have no use for friends. You might be an exception.', "I used to fight only for myself. That is changing.", "You remind me of someone I lost. That is not a bad thing."],
      },
      A: {
        blunt: ['Whatever comes next, I want you beside me for it.', 'You are family now. That is just how it is.', 'If anything happens to you, I will not forgive whoever did it.', "I am no good at this kind of talk, so I will say it once. You matter to me.", "When this is over, come home with me. My family will feed you."],
        formal: ['When this war ends, I hope our paths do not part.', 'I would trust you with my life. I already have, many times.', 'You have my loyalty, and more than that, my friendship.', "Should I fall, I want you to carry my blade.", "I have sworn many oaths. This one I make freely: I will stand by you."],
        warm: ['I cannot imagine this army without you in it.', 'Promise me we both see the end of this. Together.', 'You are the person I would want to come home to.', "Whatever happens tomorrow, today I am happy. Because of you.", "You are my dearest friend. I needed you to hear that."],
        anxious: ['I used to be afraid of everything. Now I am mostly afraid of losing you.', 'Stay alive. I could not bear the alternative.', 'You make me feel like I can do anything. Even this.', "I wrote down what I want to say to you, and then I lost the paper. So: thank you. For everything.", "If we survive this, will you stay?"],
        wry: ['Fine. I admit it. You are my favourite person in this whole miserable war.', 'If we live through this, the first drink is on me. And the second.', 'I have decided you are not allowed to die. That is final.', "I had a whole speech planned. It was very moving. You missed out.", "After everything, I suppose I am stuck with you. Good."],
        cold: ['I would die for you. Do not make me prove it.', 'You are the one thing in this war worth protecting.', 'I do not say this lightly. I trust you completely.', "I do not know how to say this kindly. You are everything to me.", "If anyone harms you, they answer to me."],
      },
    },
    support_reply: {
      C: {
        blunt: ['Same to you.', 'Fair. I will work on it.', 'Fine by me.', "Any time.", "Do not mention it."],
        formal: ['The feeling is mutual.', 'You are too kind, truly.', 'Then let us continue to do so.', "I am glad to have been of use.", "I look forward to it."],
        warm: ['That is sweet of you. Thank you.', 'I am glad too. Really.', 'Anytime. That is what we are here for.', "Of course! I would love that.", "Thank you for saying so."],
        anxious: ['Oh. Um. Thank you?', 'I did not think anyone noticed.', 'I will try to keep up.', "I will try not to let you down.", "Really? Thank you."],
        wry: ['I will add it to your tab.', 'Flattery will get you everywhere.', 'Careful, you will make me blush.', "I aim to please.", "Only because I like you a little."],
        cold: ['Noted.', 'Do not get used to it.', 'Hm.', "As long as you keep up.", "I will consider it."],
      },
      B: {
        blunt: ['Same. Do not make it weird.', 'I know. I trust you too.', 'I will not. You either.', "Good. I feel the same.", "I noticed. I was looking for you too."],
        formal: ['It would be my honour to tell you, in time.', 'And I, you. I will not forget it.', 'You have my word on that.', "I will keep your confidence.", "Then I will try to deserve it."],
        warm: ['Thank you for asking. It means more than you know.', 'You are not strange. You are a good friend.', 'Then let us carry it together.', "I would like that very much.", "Only if you smile with me."],
        anxious: ['Of course it is all right. I look for you too.', 'I have them too, about all of us.', 'Me too. Is that silly?', "You make me braver too.", "That is not embarrassing. Well, a little."],
        wry: ['Your secret is safe. Mostly.', 'You will have to try harder than that to get my boots.', 'High praise indeed. I will frame it.', "A tactical seat. Of course.", "I promise to keep laughing."],
        cold: ['Good. Keep it that way.', 'Then we understand each other.', 'Do not make me regret it.', "Change is not weakness.", "Then I will try to live up to them."],
      },
      A: {
        blunt: ['You have it. Always.', 'Family. Yes. I like that.', 'Same goes for you. Twice over.', "You matter to me too. That is all there is to it.", "I will hold you to that."],
        formal: ['They will not part, if I have any say in it.', 'And I, mine with you. Always.', 'I accept it gladly, and return it in full.', "I will carry it with honour. But I would rather you carried it yourself.", "I accept, and swear the same."],
        warm: ['I promise. With everything I have.', 'I cannot either. I do not want to.', 'Then I will always come home.', "And you are mine. Always.", "I am happy too. More than I can say."],
        anxious: ['I am not going anywhere. I promise.', 'I will. For you, I will.', 'You do the same for me, you know.', "I will stay. Of course I will stay.", "You do not need the paper. I understood."],
        wry: ['I will hold you to both drinks.', 'Agreed. You are not allowed either.', 'Your favourite? I knew it. Took you long enough.', "I will expect the speech in writing.", "Stuck with each other, then."],
        cold: ['You will not have to. I will make sure of it.', 'I feel the same. I will not say it twice.', 'Then we stand together. To the end.', "Then we protect each other.", "I would not have it any other way."],
      },
    },
    promote: {
      blunt: ['New gear, same job. Let us get back to it.', 'Stronger now. Good. I will need it.'],
      formal: ['I will wear this title with pride, {lord}.', 'A new rank brings a new duty. I accept it.'],
      warm: ['I did not do this alone. Thank you, all of you.', 'Look at me! I can help even more now.'],
      anxious: ['Me? Are you sure? I will not let you down.', 'This is a lot of responsibility. I will manage.'],
      wry: ['Finally, they recognise my genius.', 'Does this come with a raise? No? Typical.'],
      cold: ['I will make good use of it.', 'Power is a tool. I intend to use it.'],
    },
    title_a: ['Ashes at', 'Embers of', 'The Road to', 'The Fall of', 'Siege of', 'Blood on', 'Last Light at', 'Night over', 'The Gates of', 'Rain on', 'Echoes of', 'Smoke over', 'The Bridge at', 'Shadows of', 'Dawn at', 'The Price of', 'Ruins of', 'The Watch at', 'Fire at', 'Banners over', 'The Hunt at', 'Ambush at', 'The Long March to', 'Storm over', 'The Stand at', 'Ghosts of', 'Thunder at'],
  };

  // ---- picking without repeats: every line has an id; a campaign never reuses one while unused lines remain
  function pick(camp, key, list, rng, f) {
    const used = camp.usedLines || (camp.usedLines = {});
    const fresh = list.map((l, i) => i).filter(i => !used[key + i]);
    const pool = fresh.length ? fresh : list.map((l, i) => i).sort((a, b) => (used[key + a] || 0) - (used[key + b] || 0)).slice(0, 2);
    const i = rng.pick(pool); used[key + i] = (used[key + i] || 0) + 1;
    return fill(list[i], f || {});
  }
  // ten more voices, so each of the 16 types speaks in a voice of its own
  const NEWV = {"gentle": {"companion": ["Let me know if anyone needs a hand today.", "I will stay close to the wounded. Call if you need me.", "We will be careful, won\u2019t we?", "I said a quiet prayer for all of us this morning.", "Please come back in one piece."], "last": ["It is all right. Do not worry about me.", "Take care of the others for me.", "I hope I helped, even a little.", "I am just tired now.", "Be gentle with yourselves."], "mourn": ["I will keep {name}\u2019s things safe until we can send them home.", "{name} was always kind to me. I will try to be kind for both of us."], "recruit": ["I only want to help. I will carry whatever needs carrying.", "I nursed the wounded at {place}. I can keep doing it for you.", "I am not much in a fight, but I can be useful.", "If you will have me, I will try to make things easier for everyone."], "promote": ["Thank you. I will try to deserve it.", "I hope this means I can help a little more."], "openC": ["You look cold. Take my blanket.", "I mended your cloak. It was torn at {place}.", "You always eat last. Please do not."], "replyC": ["That is very kind. Thank you.", "You did not have to. But thank you.", "I will try to remember."], "openB": ["I worry about you more than I should.", "You were so brave at {place}. I was frightened for you.", "I feel safe when you are nearby."], "replyB": ["It is nice to have someone worry.", "I was frightened too. I just hid it.", "Then I will stay nearby."], "openA": ["I would like to look after you for a long time.", "You make the hard days easier. Every one of them.", "Whatever happens, I want to be the one beside you."], "replyA": ["I would like that. Very much.", "And you do the same for me.", "Then stay. Always."]}, "earnest": {"companion": ["We are doing the right thing. Hold on to that.", "I believe in this army. I believe in all of you.", "Today matters. I can feel it.", "Let us fight so the people here can sleep tonight.", "I will not let anyone down. Not today."], "last": ["I tried to do what was right. Did I?", "Keep fighting for what is good.", "It was worth it. All of it.", "Do not let this be for nothing.", "I meant every word I said."], "mourn": ["{name} believed in us. I will make sure that belief was not wasted.", "I promised {name} I would see this through. I will."], "recruit": ["I have been looking for something worth fighting for. I think I found it.", "What you did at {place} was right. I want to stand with you.", "I cannot watch {faction} hurt people any longer.", "Let me help. I mean it with my whole heart."], "promote": ["I will use this strength for good. I promise.", "This is a responsibility. I will not take it lightly."], "openC": ["I saw you help that family at {place}. Thank you.", "Why do you fight? I would really like to know.", "You seem like a good person. I wanted to say so."], "replyC": ["Someone had to. I am glad it was me.", "That is a long story. Ask me tonight.", "I try to be."], "openB": ["I trust you completely. I hope you know that.", "You make me want to be better.", "After {place}, I knew you were someone I could count on."], "replyB": ["I trust you too. Truly.", "You already are, more than you think.", "You can. Always."], "openA": ["Whatever comes, I want to face it with you.", "You are the truest friend I have ever had.", "I would follow you anywhere. I mean that."], "replyA": ["Then we face it together.", "And you are mine.", "I would never lead you anywhere you should not go."]}, "laconic": {"companion": ["Ready.", "Left side. Mine.", "Let\u2019s go.", "Quiet. Listen.", "Watch the trees."], "last": ["Huh.", "Took long enough.", "Not bad.", "Keep going.", "Done, then."], "mourn": ["{name}. Gone.", "I will finish it. For {name}."], "recruit": ["Need a blade? I have one.", "I fight. You pay. Fair?", "Saw {place}. I\u2019m in.", "I don\u2019t talk much. Good with that?"], "promote": ["Better.", "Fine. Let\u2019s use it."], "openC": ["Good work.", "You hit hard.", "At {place}. Saw that."], "replyC": ["Thanks.", "You too.", "Yeah."], "openB": ["You\u2019re all right.", "Trust you. Mostly.", "Stay close next fight."], "replyB": ["Same.", "Mostly is good.", "Will do."], "openA": ["Stay. After the war.", "You matter. That\u2019s it.", "I\u2019d die for you."], "replyA": ["I\u2019ll stay.", "You too.", "Don\u2019t."]}, "dreamy": {"companion": ["The clouds look like ships today.", "I wonder what this field looked like in spring.", "Someone left flowers by the road. I hope they are safe.", "I will fight. Then I would like to sit by the river.", "Do you hear the birds? They have not left yet."], "last": ["The sky is very blue.", "I can hear the river.", "It is like falling asleep.", "I wanted to see one more sunrise.", "Everything is so quiet."], "mourn": ["{name} liked the stars. I will look at them for both of us.", "There is a flower here the colour of {name}\u2019s cloak."], "recruit": ["I was wandering anyway. Wandering with you seems nicer.", "The road led me to {place}, and then to you.", "I do not care for war, but I care for people.", "You seemed lonely. So did I."], "promote": ["It feels like growing a new wing.", "Oh. Everything looks a little brighter now."], "openC": ["Do you ever look at the sky during a battle?", "You have kind eyes. I noticed at {place}.", "I found this stone. It reminded me of you."], "replyC": ["Sometimes. When I remember to.", "That is a strange thing to notice.", "I will keep it."], "openB": ["I painted the camp last night. You were in every picture.", "When I am frightened, I think of you.", "You are like a quiet harbour."], "replyB": ["May I see them?", "I think of you too.", "Then rest here a while."], "openA": ["I want to see every season with you.", "You are my favourite colour.", "When the war ends, let us find a quiet place."], "replyA": ["Every one. I promise.", "You are the brightest thing I have seen in years.", "I know just the place."]}, "scholarly": {"companion": ["Their formation is a textbook mistake. Page forty, I believe.", "Interesting terrain. The high ground will matter.", "I have read about battles like this. Most went well. Some did not.", "Statistically, we should win. Let us not test the statistics.", "Note how their archers cluster. That is a weakness."], "last": ["Fascinating. So this is how it happens.", "Record what I got wrong, so the next one does not.", "My notes are in my pack. They are thorough.", "I never finished my treatise.", "Curious. It does not hurt as much as the books say."], "mourn": ["{name} asked me questions no one else ever thought to ask.", "I will write {name} into the history. Accurately."], "recruit": ["I study wars. Yours is unusually interesting.", "The old texts mention {relic}. I would like to see it.", "I can read maps, ciphers and stars. You will find me useful.", "I have questions about {faction} that only fighting can answer."], "promote": ["A new set of abilities to study. Excellent.", "I had predicted this. It is nice to be right."], "openC": ["Your technique at {place} was unusual. Where did you learn it?", "Have you read anything about {war}?", "You ask good questions. Rare, in an army."], "replyC": ["From my father, mostly.", "Only what the songs say about it.", "You answer them well."], "openB": ["I have been taking notes on you. Favourable ones.", "You challenge my assumptions. I find that I enjoy it.", "Our conversations are the best part of the march."], "replyB": ["I would like to read them sometime.", "Then I will keep challenging them.", "I look forward to them too."], "openA": ["I have studied many things. You are the only one I never want to finish.", "I would like to write our story together. All of it.", "You are the most interesting person I have ever met."], "replyA": ["Then keep studying.", "Let us make it a long book.", "You need to get out more. But thank you."]}, "cheerful": {"companion": ["Good morning, everyone! Beautiful day for a fight!", "Smile! We are winning before we even start.", "I made a bet with myself that today goes great.", "Let\u2019s make this one quick and fun!", "Who wants to hear a song on the march?"], "last": ["Aw. And it was such a nice day.", "Keep smiling for me, all right?", "Sing something loud tonight.", "Don\u2019t be glum. I had fun.", "Well, that is a shame."], "mourn": ["{name} always laughed at my songs. Even the bad ones.", "Camp is so quiet without {name}. I hate it."], "recruit": ["Hi! You all look like you need cheering up.", "Saw your army at {place}. Looked like fun! Can I come?", "I can fight, sing and cook. Two of them well.", "Life is short. I\u2019d like to spend it somewhere exciting."], "promote": ["Look at me! Brand new and shiny!", "This calls for a party!"], "openC": ["You never smile! Let me fix that.", "That was amazing at {place}! Do it again!", "Want to hear a joke? It is terrible."], "replyC": ["Good luck with that.", "Maybe next time.", "Go on, then."], "openB": ["You laughed yesterday! I heard it!", "I like it when we are on the same side of the field.", "You are much nicer than you pretend to be."], "replyB": ["Do not tell anyone.", "Me too.", "Keep that a secret."], "openA": ["You make every day brighter. Even the awful ones.", "Let\u2019s be happy together after all this.", "I would sing for you every night if you let me."], "replyA": ["You do that for me too.", "I would like that more than anything.", "Then sing. I will listen."]}, "gruff": {"companion": ["Eyes front. Weapons ready. Nobody wanders.", "I want this done before sundown. Move.", "Stop chattering and check your gear.", "If you fall behind, I am not carrying you.", "Good. Now we fight properly."], "last": ["Hold the line, damn it.", "Somebody take over. Now.", "I said hold.", "Report it straight. No fuss.", "Finish the job."], "mourn": ["{name} did the job right. That is the best I can say of anyone.", "We march on. {name} would have shouted at us otherwise."], "recruit": ["Your camp is sloppy. I will fix it.", "I trained soldiers for twenty years. Yours need me.", "Saw your fight at {place}. Needs discipline. I am discipline.", "Give me a squad and stop asking questions."], "promote": ["About time. Back to work.", "Rank is just more work. Fine."], "openC": ["Your stance is wrong. Fix it.", "You held at {place}. Adequate.", "Stand up straight when you are on watch."], "replyC": ["Yes, sir.", "Adequate. I will take that.", "I was standing up straight."], "openB": ["You are the only one I do not have to shout at.", "I put you on the front line because I trust you.", "Not bad, at {place}. Not bad at all."], "replyB": ["I will keep it that way.", "I will not waste it.", "High praise, from you."], "openA": ["I do not say this. You are the best soldier I have known.", "After the war, you have a place at my table.", "I would trust you with my command. And my life."], "replyA": ["And you are the best I have served beside.", "I will be there.", "Then you have mine."]}, "kindly": {"companion": ["Has everyone had a bite to eat? Good.", "Look after the young ones today.", "I have hot water ready for after the battle.", "Be careful, dears. I want everyone back.", "We are all family here. Let us act like it."], "last": ["Is everyone else safe?", "Do not cry. Eat something.", "Keep the fire lit for the others.", "I love you all. Remember that.", "Tell the young ones it was quick."], "mourn": ["I set {name}\u2019s bowl out tonight before I remembered.", "{name} was one of ours. We will grieve together."], "recruit": ["Someone has to look after all of you. It may as well be me.", "I fed your soldiers at {place}. They were half starved.", "I raised five children. I can manage an army.", "Every camp needs someone who notices things."], "promote": ["Well, would you look at that. Thank you, everyone.", "I will put it to good use looking after you all."], "openC": ["You have not eaten. Sit. Eat.", "You were limping after {place}. Let me see.", "Come sit by the fire with the rest of us."], "replyC": ["Yes, ma\u2019am.", "It is nothing. Really.", "I would like that."], "openB": ["You remind me of my eldest. Stubborn and good.", "I worry when you go out alone.", "You have become family to me."], "replyB": ["Stubborn? I prefer determined.", "I will try not to go alone.", "You feel like home."], "openA": ["I want to see you happy and safe when this is over.", "You will always have a place with me.", "I am so proud of who you have become."], "replyA": ["I will be, if you are there.", "And you with me.", "That means the world to me."]}, "rousing": {"companion": ["Look around you! These are the best soldiers alive!", "Today we write a page they will sing about!", "Chins up. We have come too far to give up now.", "Fight for each other. That is how we win.", "Every one of you matters to this army. Show them!"], "last": ["Keep going. All of you. Go!", "Do not stop for me. Lead them.", "I was proud to stand with you.", "Carry the banner a little further.", "Make them remember us."], "mourn": ["{name} lit up this army. Let us carry that light.", "Tell everyone what {name} did today. Tell them loudly."], "recruit": ["Your army has heart. Let me give it a voice.", "I watched your stand at {place}. I want to fight beside people like that.", "Together, we can do more than any of us alone.", "People are waiting for someone to follow. Let me help you lead them."], "promote": ["This belongs to all of us! Thank you!", "With this, I can lift everyone higher."], "openC": ["You have more in you than you show. I can tell.", "The others look to you more than you know.", "You were a rock at {place}."], "replyC": ["You think so?", "They do?", "I just did not want to run."], "openB": ["Watching you grow has been a joy.", "You inspire me as much as I hope I inspire you.", "At {place}, you led without being asked."], "replyB": ["I had a good example.", "You do. Every day.", "Someone had to."], "openA": ["I want to stand beside you for every battle that remains.", "You are the reason I believe we can win.", "Whatever comes after, let us face it side by side."], "replyA": ["Then stand, and I will stand with you.", "You are the reason I keep fighting.", "Side by side. Always."]}, "imperious": {"companion": ["Victory is the only acceptable result.", "Their commander is mine. Do not interfere.", "I expect flawless execution today.", "We do not win this. We crush it.", "Keep pace with me, if you can."], "last": ["Unacceptable.", "Win. That is an order.", "Finish what I began.", "I will not be forgotten.", "This changes nothing. Advance."], "mourn": ["{name} served well. We will make the enemy pay for it.", "Grief later. Victory first. {name} would agree."], "recruit": ["Your army has potential. With me, it will have results.", "I watched you at {place}. Adequate, but you need a real commander.", "I do not join causes. I join winners. You will win.", "I am the best soldier you will ever recruit. You may thank me later."], "promote": ["As expected. Now we move faster.", "Power suits me. It always has."], "openC": ["You performed well at {place}. Continue.", "You have ambition. I approve.", "You are less incompetent than most."], "replyC": ["I will.", "Thank you. I think.", "High praise indeed."], "openB": ["You are the only one who tells me when I am wrong.", "I am planning the next battle around you.", "I find I value your counsel."], "replyB": ["Someone has to.", "Then I will not fail you.", "Then listen to it."], "openA": ["I have conquered many things. You are the only one I wish to keep.", "When this war is won, rule beside me.", "You are my equal. There is no higher compliment."], "replyA": ["Then do not let go.", "Beside you. Not beneath you.", "I know. That is why I stay."]}};
  for (const [v, d] of Object.entries(NEWV)) { P.companion[v] = d.companion; P.last_words[v] = d.last; P.partner_mourns[v] = d.mourn; P.recruit_words[v] = d.recruit; P.promote[v] = d.promote;
    for (const r of ['C', 'B', 'A']) { P.support_open[r][v] = d['open' + r]; P.support_reply[r][v] = d['reply' + r]; } VOICES.push(v); }
  const TYPE_VOICE = {"ISTJ": "formal", "ISFJ": "gentle", "INFJ": "earnest", "INTJ": "cold", "ISTP": "laconic", "ISFP": "dreamy", "INFP": "anxious", "INTP": "scholarly", "ESTP": "blunt", "ESFP": "cheerful", "ENFP": "warm", "ENTP": "wry", "ESTJ": "gruff", "ESFJ": "kindly", "ENFJ": "rousing", "ENTJ": "imperious"};
  // 16 personality types: each has its own lines and a base voice whose lines it also uses
  const TYPES = {"ISTJ": {"base": "formal", "label": "dutiful planner", "companion": ["I checked the supplies twice. We have enough for today.", "Follow the plan and we lose fewer people.", "I have marked the safe ground on the map. Use it.", "We do this the way we drilled it."], "last": ["I kept my post. That is something.", "The duty roster. Someone else will have to take my watch.", "Do it properly without me.", "I followed the plan. The plan was not enough."], "recruit": ["I keep my word and my weapons clean. You will find both useful.", "Tell me my post and my hours. I will not miss either.", "I served in the guard at {home}. I know how an army should run.", "I do not need thanks. I need orders."], "promote": ["A new rank means new duties. I will learn them all by tomorrow.", "I will not let the extra authority change how I work."], "mourn": ["{name} never missed a watch. I will take theirs from now on.", "We will record it properly. {name} deserves that much."], "openC": ["You were exactly where you said you would be at {place}. I appreciate that.", "Your gear is in good order. Few people bother."], "replyC": ["It seemed the sensible thing to do.", "Thank you. I try to keep it that way."], "openB": ["I have noticed you check on the others after every fight. I do the same.", "I wrote you into my reports from {place}. You earned the mention."], "replyB": ["Somebody has to. It might as well be both of us.", "I did not expect that. Thank you."], "openA": ["I trust very few people to change my plans. You are one of them.", "When the war is over, I would like to keep standing watch beside you."], "replyA": ["Then I will try never to make you regret it.", "I would like that more than I can say properly."]}, "ISFJ": {"base": "warm", "label": "quiet protector", "companion": ["I packed extra bandages. Just in case.", "Please do not take any foolish risks today.", "I will be right behind you if anyone falls.", "Everyone ate breakfast? Good. Then I am ready."], "last": ["Tell my family I was looking after people.", "I wish I could have patched one more wound.", "Do not let anyone else get hurt for me.", "I hope I was useful."], "recruit": ["I cannot fight like the others, but I can keep them alive.", "I saw your wounded at {place}. Let me take care of them.", "I will cook, mend, carry. Whatever is needed.", "I just want to help people get home."], "promote": ["I hope this means I can protect more of you now.", "Oh. I did not think anyone noticed what I do."], "mourn": ["I should have been closer to {name}. I should have been there.", "I folded {name}\u2019s cloak. I did not know what else to do."], "openC": ["You keep giving your rations away. Please eat.", "I sewed the tear in your sleeve while you slept. I hope that is all right."], "replyC": ["I will. Thank you for noticing.", "It is more than all right. Thank you."], "openB": ["You never complain about your wounds. I wish you would, so I could help.", "I remember how you protected the wounded at {place}."], "replyB": ["I will try to tell you next time.", "Someone had to. I am glad it helped."], "openA": ["I want to spend the rest of my life making sure you are safe.", "You are the person I worry about first when the fighting starts."], "replyA": ["Then let me do the same for you.", "And you are the one I look for first when it ends."]}, "INFJ": {"base": "warm", "label": "quiet idealist", "companion": ["I have a feeling about today. Stay close to each other.", "Remember why we are fighting. It will matter later.", "Some of them do not want to be here either. Remember that.", "We are part of something larger than this field."], "last": ["I saw this coming. I came anyway.", "It was worth it. Tell them it was worth it.", "I wanted to see what this war becomes.", "Keep believing. Even now."], "recruit": ["I have watched your army for a while. You are trying to do the right thing.", "I dreamed of a banner like yours. I am not joking.", "The world {faction} wants is not one I can live in.", "I believe you can end this war well. I want to help."], "promote": ["Strength is only useful if it serves something good.", "I hope I deserve this. I will try to."], "mourn": ["{name} believed in what we are doing. That has to mean something.", "I keep hearing {name}\u2019s voice. I think I always will."], "openC": ["You carry something heavy. I can see it in how you fight.", "You looked troubled after {place}. Do you want to talk?"], "replyC": ["You see more than most people.", "Maybe later. But thank you for asking."], "openB": ["I think you understand why this war matters as much as I do.", "I told you something at {place} I have never told anyone."], "replyB": ["I do. And I am glad I am not alone in it.", "Your secret is safe with me. Always."], "openA": ["When I imagine the world after this war, you are in it.", "You are the person who makes me believe the ending can be good."], "replyA": ["Then let us build that world together.", "And you are the reason I keep going."]}, "INTJ": {"base": "cold", "label": "cold strategist", "companion": ["Their left flank is weak. I have already told the archers.", "I have considered every way this could fail. Most of them are your fault.", "Follow my lead and this will be quick.", "We win this by the third turn, if nobody improvises."], "last": ["A miscalculation. Mine.", "The plan still works. Use it.", "Interesting. I did not account for that.", "Finish what I started."], "recruit": ["Your strategy is sound but wasteful. I can improve it.", "I have studied {faction} for years. I know where it is weak.", "I join because your odds of winning just went up.", "Sentiment does not interest me. Results do."], "promote": ["Predictable, but welcome.", "Good. Now I can do what I planned three months ago."], "mourn": ["{name} should not have died there. The plan was wrong. I will fix it.", "Losses were expected. {name} was not supposed to be one of them."], "openC": ["Your tactics at {place} were nearly competent.", "You question my plans. Most people just follow them."], "replyC": ["Nearly. I will take it.", "Someone has to keep you honest."], "openB": ["I rewrote tomorrow\u2019s plan with you at the centre of it.", "You are the only one here whose judgement I do not double-check."], "replyB": ["Then I will not let it fail.", "I will try to keep it that way."], "openA": ["I have planned for every outcome except losing you. I refuse to plan for that one.", "You are the one variable I never want to remove."], "replyA": ["Then we will make sure it never happens.", "That is the closest thing to a love letter you will ever write, is it not?"]}, "ISTP": {"base": "blunt", "label": "calm craftsman", "companion": ["Weapon is sharp. I am ready.", "Let me handle the ones on the left.", "Talking does not help. Moving does.", "I fixed the hinge on the supply cart. Now let us fight."], "last": ["Huh. Missed that one.", "Keep my tools. They are good tools.", "Not bad, for a last fight.", "Should have checked the angle."], "recruit": ["I fix things and I hit things. You need both.", "I was passing through. Your fight looked more interesting.", "Just give me something sharp.", "I do not do speeches. I do results."], "promote": ["New gear. Let me take it apart and see how it works.", "Fine. Stronger is useful."], "mourn": ["{name} is gone. I will finish the job {name} started.", "I keep fixing {name}\u2019s gear out of habit."], "openC": ["Your blade is dull. Give it here.", "You fight like someone who learned on their own."], "replyC": ["Thanks. I owe you one.", "I did. You too, I think."], "openB": ["I made you something. A better grip for your weapon.", "At {place}, you did the thing I would have done."], "replyB": ["It fits perfectly. Thank you.", "Then we think alike."], "openA": ["I do not need many people. I need you.", "Stay. After all this. I mean it."], "replyA": ["Then I am not going anywhere.", "I will stay."]}, "ISFP": {"base": "anxious", "label": "gentle artist", "companion": ["The light on {place} is beautiful. Shame about the soldiers.", "I will do my part. Quietly.", "Please be careful, all of you.", "I would rather paint this field than fight on it."], "last": ["The sky is so pretty from down here.", "I never finished my sketches.", "It is all right. I am not scared now.", "Keep my drawings safe."], "recruit": ["I am not much of a soldier, but I could not stand by any longer.", "They burned my village and every painting in it. I want to stop them.", "I go where my heart tells me. It tells me to follow you.", "I will fight. But I will not pretend I like it."], "promote": ["I feel different. Stronger. I am not sure I like it.", "Thank you. I will use it gently."], "mourn": ["I drew {name} last night by the fire. It is all I have now.", "The world is quieter without {name}."], "openC": ["I drew you. I hope you do not mind.", "You hum when you sharpen your blade. It is a nice tune."], "replyC": ["May I see it?", "I did not know I did that."], "openB": ["You are the only one I have shown my sketchbook to.", "After {place}, I could not sleep. I painted you instead."], "replyB": ["They are beautiful. Like you.", "Show me sometime. Please."], "openA": ["Everything I make now, I make thinking of you.", "You are the most beautiful thing in this whole war."], "replyA": ["Then I will try to be worth it.", "That is the kindest thing anyone has ever said to me."]}, "INFP": {"base": "anxious", "label": "dreamer", "companion": ["I wrote a poem about our march. I will read it after, if we live.", "I keep thinking about the soldiers on the other side.", "Let us be kind when this is over.", "I am scared, but I am here."], "last": ["I had so many stories left to write.", "Was I brave? Tell me I was brave.", "It is strange. I feel peaceful.", "Remember the good parts."], "recruit": ["I believe in what you are doing. That is why I am here.", "I cannot fight well, but I can fight for something good.", "Every story needs someone who refuses to give up. Let me be one.", "Please let me come. I want my life to mean something."], "promote": ["I hope I can be the hero I always wrote about.", "This is like a dream. A good one, for once."], "mourn": ["I will write about {name}. Someone has to remember.", "{name} was kind to me when no one else was."], "openC": ["You remind me of a character in a story I loved.", "You looked sad after {place}. Me too."], "replyC": ["Was it a happy story?", "Then let us be sad together for a while."], "openB": ["I wrote you into my journal. Is that strange?", "You are the first person here who really listens to me."], "replyB": ["It is lovely. Can I read it?", "You are worth listening to."], "openA": ["You are the best part of my story.", "Whatever happens, I am glad I met you."], "replyA": ["Then let us make it a long one.", "I am glad too. Every day."]}, "INTP": {"base": "wry", "label": "curious thinker", "companion": ["Fascinating. Their formation is completely wrong.", "I have a theory about that fortress. I will test it.", "Statistically, someone is about to do something foolish.", "Wait. Do they not realise the river is at their backs?"], "last": ["So that is what it feels like. Write it down.", "I had a theory about this. I was right, unfortunately.", "Odd. I expected to be more surprised.", "Tell the others to check my notes."], "recruit": ["Your army is an interesting problem. I would like to study it from the inside.", "I have questions about {relic}. You seem to be heading toward it.", "I was bored. Then you arrived.", "Logically, you are the side most likely to win and least likely to be cruel."], "promote": ["Ah. A new set of variables.", "I will need to recalculate everything. Excellent."], "mourn": ["{name} asked me a question once that I still have not answered.", "I keep trying to work out what went wrong. There is no answer."], "openC": ["Why do you always circle left before you attack?", "At {place}, you did something I cannot explain."], "replyC": ["Habit. I never thought about it.", "I am not sure I can explain it either."], "openB": ["I have stopped trying to predict you. It is refreshing.", "I enjoy our arguments more than I enjoy winning them."], "replyB": ["I will take that as a compliment.", "That is almost sentimental, coming from you."], "openA": ["I have tried to analyse how I feel about you. The result is very simple.", "You are the only question I never want to finish answering."], "replyA": ["And what is the result?", "Then keep asking."]}, "ESTP": {"base": "blunt", "label": "daring fighter", "companion": ["Let's go already, I'm bored.", "Watch me take the big one first.", "Plans are fine. Charging is better.", "Last one to the commander buys drinks."], "last": ["Ha. Got me good.", "Worth it. Totally worth it.", "Tell them I went down swinging.", "Next time, I win."], "recruit": ["I like a fight. You seem to have plenty.", "I saw you charge at {place}. Crazy. I like it.", "Point me at something dangerous.", "Why wait for the war to come to me?"], "promote": ["Now that is what I call an upgrade.", "Look at this! Who's next?"], "mourn": ["{name} should be here laughing at this. It is not right.", "I am going to hit the next one twice as hard. For {name}."], "openC": ["You were fast at {place}. Race you next time?", "You do not flinch. I like that."], "replyC": ["You're on.", "Neither do you."], "openB": ["Nobody else keeps up with me. You do.", "After {place}, I figured you would have my back for good."], "replyB": ["Somebody has to stop you from getting killed.", "You figured right."], "openA": ["I do not stop for much. I would stop for you.", "Stick with me. Life is more fun with you around."], "replyA": ["Then do not stop. Just slow down a little, for me.", "Try and lose me."]}, "ESFP": {"base": "wry", "label": "crowd-pleaser", "companion": ["Smile, everyone! We look like a funeral.", "I will sing the victory song tonight. Get ready.", "Who wants to see something impressive?", "Big crowd today. Let us give them a show."], "last": ["Well. Make it a good song, at least.", "Do not be sad. Have a party for me.", "The show must go on.", "I always wanted a dramatic exit."], "recruit": ["Your army needs more fun. I volunteer!", "I saw your fight at {place}. Best show in town.", "Everyone looks so serious here. I can fix that.", "Sign me up. I hear the songs about you are getting good."], "promote": ["Look at me! Shinier and better!", "Somebody throw a party. I deserve it."], "mourn": ["Camp is too quiet without {name} laughing.", "I will sing for {name} tonight. Loudly."], "openC": ["You laughed at my joke. Nobody laughs at my jokes.", "You were amazing at {place}! Did you see yourself?"], "replyC": ["It was a good joke.", "Not really. I was busy not dying."], "openB": ["I perform better when you are watching.", "After {place}, you are officially my favourite."], "replyB": ["Then I will always watch.", "Only your favourite? I aim higher."], "openA": ["Every song I sing now is secretly about you.", "You make this whole war feel like it is worth smiling through."], "replyA": ["Secretly? Everyone knows.", "Then keep smiling. For me."]}, "ENFP": {"base": "warm", "label": "bright spark", "companion": ["I have the best feeling about today!", "We are going to win this, and then we are going to have a feast.", "Everyone has a part to play. I love that.", "Who needs a pep talk? Everyone? Great."], "last": ["I had so many plans!", "This was the best adventure. Thank you.", "Do not stop. Promise me.", "I am glad I met all of you."], "recruit": ["Your army is going places. Can I come?", "I have a hundred ideas to help. Let me try one!", "I met three of your soldiers at {place}. I love them already.", "I cannot sit still while the world needs saving."], "promote": ["This is amazing! Think of everything I can do now!", "Oh, I have so many new ideas."], "mourn": ["{name} was going to come to my village and meet everyone. I was so excited.", "I keep looking for {name} to tell them something funny."], "openC": ["I have decided we are friends now. Is that all right?", "You were brilliant at {place}! Teach me?"], "replyC": ["I suppose it is.", "Only if you teach me something too."], "openB": ["Talking to you is the best part of my day.", "I told everyone about what you did at {place}."], "replyB": ["Mine too, honestly.", "Everyone? That explains the looks."], "openA": ["I want to share every adventure with you, forever.", "You are my favourite person in the whole world. That is not an exaggeration."], "replyA": ["Then let us start with the next one.", "Coming from you, I believe it."]}, "ENTP": {"base": "wry", "label": "clever provocateur", "companion": ["I have a terrible idea. You are going to love it.", "What if we did the opposite of what they expect?", "Rules are suggestions. Suggestions are optional.", "Bet I can win this before lunch."], "last": ["Well. That was not the clever plan I thought it was.", "Argue with my ghost. I will win that too.", "At least it was interesting.", "Admit it. That was a good try."], "recruit": ["Your strategies are fun. I could make them better.", "I argued with your scouts at {place}. They lost. Let me join.", "I hear {faction} hates surprises. I am full of surprises.", "A lost cause with a good argument? Count me in."], "promote": ["Oh, this is going to make things so much more interesting.", "More power. More options. Perfect."], "mourn": ["{name} won our last argument. I will never get the rematch.", "I keep thinking of things to say to {name}."], "openC": ["You are wrong about the river crossing, and I can prove it.", "You argued back at {place}. Nobody argues back."], "replyC": ["Go on, then. Prove it.", "Somebody had to."], "openB": ["I have started losing arguments to you on purpose. Do not tell anyone.", "You make me think harder than anyone else here."], "replyB": ["I knew it. I am telling everyone.", "Good. You need it."], "openA": ["I have argued against every feeling I have for you. I lost every time.", "You are the only person I would not want to outsmart."], "replyA": ["Good. Stop arguing.", "You could not if you tried."]}, "ESTJ": {"base": "blunt", "label": "firm organiser", "companion": ["Form up. Nobody wanders off today.", "I have assigned watches for tonight. No complaints.", "Do your job and we all go home.", "Discipline wins wars. Let us be disciplined."], "last": ["Someone take command. Now.", "Hold the formation.", "Report my death properly.", "I expect you to finish this."], "recruit": ["Your camp is a mess. I will fix it, then I will fight.", "I commanded a company at {home}. I can do it again.", "You need structure. I am structure.", "I respect an army that wins. Yours wins."], "promote": ["About time. Now let us get to work.", "I will make sure this rank is respected."], "mourn": ["{name} followed every order I gave. I will honour that.", "We keep marching. {name} would expect nothing less."], "openC": ["You were on time to your post at {place}. Good.", "Your report was clear. Most are not."], "replyC": ["That is the job.", "I appreciate you reading it."], "openB": ["I am putting you in charge of the left flank. I trust you.", "You held at {place} when others ran."], "replyB": ["I will not let you down.", "Running was never an option."], "openA": ["I do not say this often. You are the best soldier I have served with, and more than that.", "Whatever comes after this war, I want you there."], "replyA": ["And you are the best I have served under.", "Then I will be there."]}, "ESFJ": {"base": "warm", "label": "caring host", "companion": ["Has everyone had water? Good. Now, battle.", "Stay together and look after each other.", "I am so proud of all of you already.", "Let us make sure everyone comes back tonight."], "last": ["Is everyone else all right?", "Look after each other for me.", "Tell my friends I love them.", "Do not be sad too long."], "recruit": ["Your camp needs someone to keep everyone together. I can do that.", "I helped the villagers at {place}. Now I want to help you.", "Everyone should have a friend at their side. Let me be that.", "I could not let you all face this alone."], "promote": ["Thank you, everyone! I could not have done it without you.", "I will use this to look after all of you."], "mourn": ["I planned a birthday supper for {name}. I will still cook it.", "{name} was part of our family. Families grieve together."], "openC": ["You sit alone at supper. Come sit with us.", "I saw you help the wounded at {place}. That was kind."], "replyC": ["I would like that.", "It was the least I could do."], "openB": ["You have become part of the family here.", "I worry when you are out of sight. Is that silly?"], "replyB": ["It feels like home with you all.", "Not silly. Kind."], "openA": ["I want you in every happy memory I make from now on.", "You are family to me. Truly."], "replyA": ["Then let us make many.", "And you to me."]}, "ENFJ": {"base": "formal", "label": "inspiring leader", "companion": ["Everyone, look at me. We can do this, together.", "I believe in every one of you.", "Let us show {faction} what we are made of.", "Fight for each other today."], "last": ["Keep them together. Keep them going.", "You will be all right without me. I know it.", "Lead them, {lord}.", "I believed in all of you. Still do."], "recruit": ["Your army has heart. Let me help it grow.", "I spoke with your soldiers at {place}. They deserve more allies.", "People follow you for good reasons. I want to be one of them.", "Together we can do more than any one of us alone."], "promote": ["I will use this to lift everyone up with me.", "Thank you. This belongs to all of us."], "mourn": ["{name} made everyone around them better. Let us carry that on.", "We will tell {name}\u2019s story to anyone who will listen."], "openC": ["You have more potential than you think.", "I saw how the others looked to you at {place}."], "replyC": ["You think so?", "I did not notice."], "openB": ["Watching you grow has been one of the best parts of this war.", "You inspire me as much as anyone here."], "replyB": ["You helped more than you know.", "That means a great deal from you."], "openA": ["I hope to stand beside you for the rest of my life.", "You are the person who makes me want to be better."], "replyA": ["Then stand. I will be here.", "You make me better too, every single day."]}, "ENTJ": {"base": "formal", "label": "commanding visionary", "companion": ["We do not just win today. We win decisively.", "I expect excellence. I will accept nothing less.", "Their commander is mine.", "This battle is one step. Keep your eyes on the war."], "last": ["Win. Win anyway.", "This changes nothing. Keep moving.", "Take my command. Use it well.", "I wanted to see the end."], "recruit": ["Your army has promise. With me, it will have results.", "I will help you win this war, and win it properly.", "I do not join causes. I join winners.", "I watched you at {place}. You need a second commander."], "promote": ["Excellent. Now we move faster.", "Power is a responsibility. I accept it."], "mourn": ["{name} died for our victory. We will make sure there is one.", "We do not stop for grief. We honour {name} by winning."], "openC": ["You performed well at {place}. I want more of that.", "You have ambition. Good."], "replyC": ["Then you will have it.", "You noticed."], "openB": ["I am planning the next campaign around your strengths.", "You are the only one who tells me when I am wrong."], "replyB": ["I will not disappoint you.", "Someone needs to."], "openA": ["I want you at my side for every battle after this one, and for whatever comes after war.", "I have conquered many things. You are the only one I want to keep."], "replyA": ["You will have me.", "Then do not let go."]}};
  const LEAN = [[/knight|general|paladin|great|cavalier/, ['ISTJ', 'ESTJ', 'ENTJ', 'ISFJ']], [/cleric|priest|troubadour|valkyrie|monk|bishop|saint|sister|curate/, ['ISFJ', 'ESFJ', 'INFJ', 'ENFJ']],
    [/mage|sage|shaman|druid|summoner|sorcer/, ['INTJ', 'INTP', 'INFJ', 'INFP']], [/thief|rogue|assassin|archer|sniper|hunter|nomad|ranger/, ['ISTP', 'ESTP', 'ENTP', 'INTP']],
    [/dancer|bard|bard/, ['ESFP', 'ENFP', 'ISFP']], [/myrmidon|swordmaster|mercenary|hero/, ['ISTP', 'INTJ', 'ESTP', 'ISFP']], [/fighter|warrior|brigand|pirate|berserker/, ['ESTP', 'ESTJ', 'ESFP', 'ISTP']],
    [/pegasus|falco|wyvern|dracoknight/, ['ENFP', 'ESFJ', 'ENTJ', 'ISFP']], [/lord|prince|princess/, ['ENFJ', 'ENTJ', 'INFJ', 'ISFJ']]];
  for (const t of Object.keys(TYPES)) TYPES[t].base = TYPE_VOICE[t];
  const ALL = Object.keys(TYPES);
  function typeFor(rng, cname) { const n = (cname || '').toLowerCase(); const lean = (LEAN.find(([re]) => re.test(n)) || [0, ALL])[1]; return rng.chance(70) ? rng.pick(lean) : rng.pick(ALL); }
  const MOMENT = { companion: ['companion', 'companion'], last: ['last_words', 'last'], recruit: ['recruit_words', 'recruit'], promote: ['promote', 'promote'], mourn: ['partner_mourns', 'mourn'] };
  // the combined pool for one unit and moment: its type's lines plus its voice's lines
  function poolFor(type, moment, rank) { const t = TYPES[type], v = t.base;
    if (moment === 'open' || moment === 'reply') return [...(moment === 'open' ? P.support_open : P.support_reply)[rank][v], ...t[moment + rank]];
    const [pk, tk] = MOMENT[moment]; return [...P[pk][v], ...t[tk]]; }
  return { VOICES, P, TYPES, typeFor, poolFor, premise, actOf, generalFor, voiceFor, pick, fill };
})();

function persona(camp, u) { if (!u.mbti || !STORY.TYPES[u.mbti]) u.mbti = STORY.typeFor(camp.rng, className(u)); u.voice = STORY.TYPES[u.mbti].base; return u.mbti; }
function voice(camp, u) { persona(camp, u); return u.voice; }
function speak(camp, u, moment, f, rank) { const t = persona(camp, u); return STORY.pick(camp, 'm' + moment + (rank || '') + t, STORY.poolFor(t, moment, rank), camp.rng, f); }
const NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function counted(a) { const m = new Map(); for (const x of a) m.set(x, (m.get(x) || 0) + 1); return [...m].map(([k, n]) => n > 1 ? `${NUM[n] || n} ${k}s` : k); }
function listJoin(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
function finishCampaign(camp, tmp) {
  camp.story = STORY.premise(camp.rng, camp, () => uniqueName(tmp, camp.rng)); camp.story.tone = camp.rng.pick(Object.keys(TONES)); camp.progression = camp.rng.pick(PROGRESSIONS); camp.genLimit = 15 + camp.rng.int(0, 5); camp.years = 0; camp.usedLines = {};
  if (camp.rival) camp.rival.motive = camp.story.motive;
  for (const u of camp.army) voice(camp, u);
  return camp;
}
function prose(n) { return String(n || '').replace(/Kn\.?$/, 'Knight').replace(/\bPeg\b/, 'Pegasus').replace(/\bNmd\b/, 'Nomad').replace(/\bTrbdr\b/, 'Troubadour').replace(/\.$/, '').trim(); }
function facts(camp, st, extra) {
  const S = camp.story || {}, lord = camp.army.find(u => u.id === camp.lord) || camp.army[0], fac = camp.faction || 'the enemy';
  return Object.assign({ lord: lord ? lord.name : '', place: st ? st.place : '', faction: fac, home: S.home || camp.realm, homeKind: S.homeKind || 'kingdom', relic: S.relic || 'the relic', war: S.war || 'the old war',
    order: S.order || 'the old order', villain: S.villain ? S.villain.name : '', vtitle: S.villain ? S.villain.title : '', commander: st && st.bossName || '', title: st && st.bossTitle || '', turns: st && st.surviveTurns || 0,
    point: st && st.seizeKind && st.seizeKind !== 'throne' ? st.seizeKind : 'throne', chapter: st ? st.chapter : 0, motive: camp.rival && camp.rival.motive || '' }, extra || {});
}
function introText(camp, st) {
  const rng = camp.rng, lord = camp.army.find(u => u.id === camp.lord) || camp.army[0], P = STORY.P, f = facts(camp, st), lines = [], cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  const brief = st.final ? PR.final_brief : ({ rout: P.briefing_rout, boss: P.briefing_boss, seize: P.briefing_seize, survive: P.briefing_survive }[st.goal] || P.briefing_rout);
  if (st.chapter === 1 && camp.story) { const S = camp.story;
    lines.push(['', `${S.home} was a ${S.homeKind} in the west. ${S.fall}.`]);
    lines.push(['', `${S.villain.title} ${S.villain.name} ${S.villain.goal}.`]);
    lines.push([lord.name, STORY.pick(camp, 'lf', P.lord_first, rng, f)]); }
  st.briefLine = STORY.pick(camp, 'br' + st.goal, brief, rng, f);
  { const tp = !st.final && !st.skirmish && rng.chance(60) ? toneParts(camp, st, toneFacts(camp, st)) : null; if (tp) { st.toneSW = tp.sit + ' ' + tp.wrong; if (tp.task) st.briefLine = st.toneSW + ' ' + tp.task; } }
  if (st.pincer) st.briefLine = st.pincer.map((g, k) => `${k ? (k === st.pincer.length - 1 ? 'And ' : '') : ''}${g.name}, ${g.title}, holds the ${g.corner} corner with ${g.force}.`).join(' ') + ` Defeat ${st.pincer.length === 2 ? 'them both' : 'all three'} to win.`;
  lines.push(['', st.briefLine]);
  if (st.axis && st.axis.mode === 'start' && st.axis.corner) lines.push(['', `Soldiers from ${st.axis.realm} are on this battlefield too, in the ${st.axis.corner} corner, led by ${st.axis.leader}. They fight for ${st.axis.with}, because ${st.axis.reason}.`]);
  const lastFallen = camp.log.length ? camp.log[camp.log.length - 1].lost : [];
  if (st.chapter > 1) lines.push([lord.name, lastFallen.length ? STORY.pick(camp, 'll', P.lord_loss, rng, Object.assign({}, f, { fallen: lastFallen[0] })) : st.major ? STORY.pick(camp, 'lm', P.lord_major, rng, f) : STORY.pick(camp, 'lp', P.lord_plain, rng, f)]);
  if (st.rivalHere) { const m = camp.rival.meetings; lines.push([st.bossName, STORY.pick(camp, 'rv' + Math.min(m, 2), m === 0 ? P.rival_first : m === 1 ? P.rival_again : P.rival_final, rng, f)]); }
  else if (st.final && st.bossName) lines.push([st.bossName, STORY.pick(camp, 'fv', PR.final_villain, rng, f)]);
  else if (st.bossName) lines.push([st.bossName, STORY.pick(camp, st.general ? 'cg' : 'co', st.general ? P.commander_general : P.commander_officer, rng, f)]);
  const others = camp.army.filter(u => u.id !== lord.id && u.hp > 0 && !(st.reserve || []).includes(u.id));
  if (others.length) { const o = rng.pick(others); lines.push([o.name, speak(camp, o, 'companion', f)]); }
  return lines;
}
// ---------------------------------------------------------------- RANDOM EVENTS: other armies, civilians and changes to the field
const EV = {
  alliance_n: ['A column of riders under a green banner crests the hill behind the army.', 'Fresh soldiers arrive on the {home} road, flying colours not seen since the war began.', 'A company of loyalists has trailed the army for days. Today they choose to fight beside it.'],
  alliance_l: ['{lord}! {ally} of {order}, at your service. We fight with you today.', 'We heard you were marching on {place}. We could not let you do it alone.', 'My soldiers are tired, but they are yours for this battle.'],
  alliance_join: ['I have seen enough to know where I belong. Let me march with you.', 'My company goes home tonight. I do not. I want to see this through.', 'Keep a place for me in your line. I am staying.'],
  rivalry_n: ['A third army marches onto the field: {band}, sworn enemies of {faction} and no friends of {lord}.', 'Banners of {band} appear on the far ridge. They attack anyone in their path.', 'The fighting has drawn {band}. They mean to take {place} from whoever holds it.'],
  rivalry_l: ['Two armies tearing each other apart. How convenient.', '{place} belongs to {band}. Everyone else can die for it.', 'Kill them all. We will sort out the bodies later.'],
  defect_n: ['In the middle of the fighting, one of the enemy soldiers throws down the colours of {faction}.', 'An enemy soldier turns around and walks toward the army with empty hands raised.', "A soldier in the enemy line lowers a spear and steps out of formation.", "Shouting breaks out in the enemy ranks. One of their own is crossing the field toward the army."],
  defect_l: ['I am done fighting for them. Let me fight for you.', 'They burned my village too. I only found out this morning.', 'I will not die for {faction}. Better to die for something worth it.'],
  merc_n: ['A band of sellswords calling themselves {band} offers its blades for {cost} gold. {lord} pays.', '{band} were waiting at the crossroads. For {cost} gold, they will fight this battle and no other.', "A captain of {band} offers terms at the edge of camp: {cost} gold for one battle. {lord} agrees.", "The sellswords of {band} have no cause but coin. For {cost} gold, today it is this one."],
  merc_l: ['Coin first, then corpses. Pleasure doing business.', 'You paid well. We will earn it.', 'Point us at the enemy and keep your purse close.'],
  refugee_n: ['Villagers fleeing {place} are caught between the armies. If they reach the army\u2019s lines, they will live.', 'A family with a cart is trying to cross the field. Soldiers of {faction} have seen them too.', 'Refugees from the burning farms run toward the army\u2019s banner.'],
  refugee_l: ['Get those people behind our line!', 'Nobody touches the villagers. Cover them.', 'Make a path for them. Now!'],
  refugee_safe: ['Thank you, all of you.', 'We made it. We actually made it.', 'Bless you. We will not forget this.'],
  refugee_end: ['{count} of the villagers reached safety. They gave the army what they could spare: {reward} gold.', 'The villagers who escaped pressed {reward} gold into the quartermaster\u2019s hands before going on their way.'],
  plea_n: ['A rider from a nearby village begs for help. Bandits are on their way to burn it.', 'Smoke signals rise from a village near {place}. Brigands are closing in on it.', "A boy runs into camp, out of breath. Brigands are heading for his village.", "A village elder sends word: bandits are coming, and the village has no one left to fight."],
  plea_v: ['Please, they will be at our doors before dark!', 'Our village has nothing left but the people in it. Please help us.', "We have children in the village. Please hurry.", "If you come now, there is still time."],
  plea_saved: ['The village is safe. One of the villagers asks to come with the army.', 'The brigands find soldiers waiting at the village gate instead of easy pickings.', "The villagers come out of hiding to thank the soldiers who reached them in time."],
  plea_lost: ['The bandits reached the village first. Nothing is left but ash.', 'Too late. The village is burning.', "Smoke rises where the village stood. The bandits got there first."],
  merchant_n: ['A travelling merchant has set up a cart in the middle of the battlefield, which seems unwise.', 'A merchant waves from beside a loaded wagon. War is good for business.', "A trader has wandered onto the battlefield with a cart full of goods and no apparent fear.", "A merchant\u2019s wagon sits by the road, its owner calling out prices over the noise of battle."],
  merchant_l: ['Fine wares, fair prices! Well, prices.', 'Everything must go, before somebody sets it on fire.', 'Steel, tomes and tonics. Gold only, no refunds.'],
  storm_n: ['Thunder rolls over {place}. Rain sweeps across the field and the far side disappears.', 'A storm breaks over the battlefield. Bowstrings slacken and nobody can see far.', "Dark clouds roll in over {place}. Within minutes the rain is coming down in sheets.", "Wind and rain tear across the field. Arrows go wide and the far end of {place} is lost in grey."],
  storm_l: ['Keep close. In this rain we will lose each other.', 'The storm hides them as well as us. Use it.', "Watch your footing. The ground is turning to mud.", "Nobody can aim in this. Close the distance."],
  quake_n: ['The ground heaves under {place}. A bridge gives way with a roar.', 'An earthquake splits the earth. When the dust settles, the bridge is gone.', "A deep rumble shakes {place}. Stones fall from the bridge, then the bridge falls too.", "The earth shudders. One of the crossings cracks in two and slides into the water."],
  flood_n: ['The river breaks its banks and spills across the fields of {place}.', 'Rain upriver has swollen the water. The fords are gone.', "Water rises fast over the low ground of {place}. What was a field is now a river.", "The banks give way and the river spreads across the plain."],
  rival_n: ['A rider in black cuts across the field. {rival} has come for {lord}.', '{rival} arrives with a handful of soldiers who answer to no one.', "Hoofbeats from the east. {rival} rides in at the head of a small band, ignoring {faction} entirely.", "{rival} has followed the army here. This time, alone and on no one\u2019s orders."],
  rival_l: ['I did not come for {faction}. I came for you, {lord}.', 'Let the others fight over {place}. You are mine.', 'I told you we would meet again.'],
  prison_n: ['Scouts say {faction} holds a prisoner at the far end of {place}. Someone should get them out.', 'There is a captive in the enemy camp. Whoever reaches the cell first can set them free.', "A captured soldier is held in chains on the enemy side of {place}.", "Word comes of a prisoner at {place}, kept alive for questioning. Not for long."],
  prison_free: ['{name} is free, and asks for a weapon.', 'The cell door gives way. {name} steps out, blinking at the light.', "The chains fall away. {name} rubs both wrists and looks for a sword."],
  desert_n: ['A wounded enemy soldier breaks from the line and runs toward the army. The enemy turns to give chase.', 'One of the soldiers of {faction} is fleeing. The enemy wants that soldier dead more than they want you.', "An enemy soldier drops a shield and sprints toward the army. Arrows follow.", "Someone in the enemy line has had enough. They run, and their old comrades give chase."],
  desert_l: ['Help me! They will kill me for running!', 'I am done with them. Please, I need your protection!', "Do not shoot! I am coming over!", "Take me in, please. I know their plans."],
  desert_boss: ['Bring that traitor back to me. In pieces, if you must.', 'Nobody leaves my army alive.', "After that deserter! Nobody walks away from me.", "A traitor running to the enemy? Cut them down."],
  bandit_n: ['Brigands pour out of the hills, heading for the villages around {place}.', 'A bandit gang has picked today to raid the villages. They care nothing for either army.', "A gang of brigands comes down from the hills, torches already lit.", "Bandits have heard the armies are busy. They are heading for the villages of {place}."],
  bandit_l: ['Burn it all and take what shines!', 'The soldiers are busy. The villages are ours.', "Grab everything that is not nailed down. Then burn the rest.", "No soldiers in the villages today. Go!"],
  bandit_burn: ['Brigands have set a village alight.', 'A village goes up in flames behind the bandits.', "Flames climb a village roof. The brigands move on to the next."],
  hero_n: ['A lone {cls} stands at the edge of the field, watching. Anyone old enough to remember {order} would know those colours.', 'Someone stands apart from both armies: a {cls} who has not yet drawn a weapon.', "A traveller in old armour waits on a ridge above the battle, sword still sheathed.", "A {cls} sits by the road at {place}, watching both armies with tired eyes."],
  hero_l: ['I fought in {war}. I have no wish to fight in another, unless it is worth it.', 'I was the last of {order}. I have walked alone since it fell.', 'I am looking for someone who deserves this blade.'],
  hero_ask: ['You fight like one of {order}. Will you fight with us?', 'We could use someone like you. What would it take?', 'I know those colours. Come with us. Please.'],
  hero_join: ['{order} fell because no one stood up for it. I will not make that mistake twice.', 'For {home}, then, and for the ones I could not save in {war}.', 'Very well. Show me your cause deserves it.'],
  night_n: ['The sun sets over {place}. The fighting goes on in the dark.', 'Night falls. Torches flicker, and every shadow could be a soldier.', "Dusk turns to night over {place}. Neither army is willing to stop.", "The last light fades. Now the battle is fought by torchlight and moonlight."],
  night_l: ['Stay close and watch the dark.', 'Keep the torches high. Nobody wanders off alone.', "Stay in pairs. Call out before you move.", "Darkness hides us as well as them. Use it."],
};
const BANDS = ['the Red Hand', 'the Lantern Company', 'the Iron Crows', 'the Free Blades', 'the Black Rams', 'the Dusk Riders', 'the Salt Dogs', 'the Last Banner'];
function evLine(st, key, extra) { const camp = st._camp; return STORY.pick(camp, 'ev' + key, EV[key], camp.rng, facts(camp, st, extra)); }
function freeTiles(st, near, count, maxD) {
  const out = [], seen = new Set();
  const cand = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.abs(x - near[0]) + Math.abs(y - near[1]); if (d <= (maxD || 4)) cand.push([d, x, y]); }
  cand.sort((a, b) => a[0] - b[0]);
  for (const [, x, y] of cand) { if (out.length >= count) break; if (unitAt(st, x, y) || seen.has(y * W + x)) continue; const probe = { cls: 'Soldier', fe8: 0x0F, team: 'neutral' }; if (moveCost(st, probe, x, y) >= 99) continue; seen.add(y * W + x); out.push([x, y]); }
  return out;
}
function spawn(st, cls, team, lv, at, extra) { const camp = st._camp, rng = camp.rng; const u = makeUnit(rng, cls, team === 'enemy' ? 'enemy' : 'ally', lv); u.team = team; u.x = at[0]; u.y = at[1]; u.ai = 'pursue';
  u.name = uniqueName(camp, rng); Object.assign(u, extra || {});
  if (moveCost(st, u, u.x, u.y) >= 99) { let best = null; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (unitAt(st, x, y) || moveCost(st, u, x, y) >= 99) continue; const d = Math.abs(x - at[0]) + Math.abs(y - at[1]); if (!best || d < best[0]) best = [d, x, y]; } if (best) { u.x = best[1]; u.y = best[2]; } }
  if (st.side || st.clampLv) sideClamp(st, u);
  st.units.push(u); return u; }
const pickCls = (rng, f, promoted) => POOL ? poolPick(rng, f, promoted) : rng.pick(['Soldier', 'Fighter', 'Mercenary', 'Archer']);
function scheduleEvents(camp, st, rng, n, lv, pSlots, eSlots) {
  st._camp = camp; st.events = []; st.joined = []; st.eventLines = []; st.spent = 0; st.campGold = camp.gold || 0; st.pSlots = pSlots; st.eSlots = st.eSlots || eSlots;
  const bridges = [], rivers = []; for (let i = 0; i < W * H; i++) { const t = st.map.terr ? st.map.terr[i] : -1; if (t === 0x13 || t === 0x14) bridges.push(i); if (t === 0x10) rivers.push(i); }
  const rivalFree = camp.rival && !camp.rival.defeated && !st.rivalHere && n >= 4;
  const pool = [['alliance', 10, n >= 2], ['rivalry', 8, n >= 3], ['defect', 8, n >= 2], ['merc', 7, (camp.gold || 0) >= 1200 && n >= 3], ['refugee', 8, n >= 2], ['plea', 8, st.villages.length > 0], ['merchant', 9, n >= 2],
    ['storm', 7, n >= 3 && !st.fog && isOutdoor(st)], ['quake', 4, bridges.length > 0 && n >= 4], ['flood', 4, rivers.length > 6 && n >= 4], ['rival', 6, rivalFree], ['prison', 8, n >= 2], ['desert', 7, n >= 3], ['bandit', 7, st.villages.length > 1 && n >= 3],
    ['hero', 4, n >= 4 && !camp.heroMet], ['night', 6, n >= 3 && !st.fog]].filter(e => e[2]);
  const count = n <= 1 ? 0 : rng.chance(n <= 3 ? 40 : 65) ? (rng.chance(25) ? 2 : 1) : 0;
  for (let k = 0; k < count && pool.length; k++) { const tot = pool.reduce((a, e) => a + e[1], 0); let r = rng.int(1, tot), i = 0; while (r > pool[i][1]) r -= pool[i++][1];
    const kind = pool.splice(i, 1)[0][0]; const turn = ['merchant', 'prison', 'hero', 'merc', 'refugee', 'plea'].includes(kind) ? 1 : rng.int(2, 4);
    st.events.push({ kind, turn, bridges, rivers }); }
}
function rng0(st) { return st.rng; }
function stillWinnable(st) {
  const lord = st.units.find(u => u.leader && u.hp > 0); if (!lord) return true;
  const seen = new Set([lord.y * W + lord.x]), q = [[lord.x, lord.y]];
  while (q.length) { const [x, y] = q.pop(); for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (!inb(nx, ny) || seen.has(k) || moveCost(st, lord, nx, ny) >= 99) continue; seen.add(k); q.push([nx, ny]); } }
  const near = (x, y) => seen.has(y * W + x) || N4.some(([dx, dy]) => seen.has((y + dy) * W + x + dx));
  const must = st.goal === 'seize' && st.map.throne ? [[st.map.throne.x, st.map.throne.y]] : st.units.filter(u => u.team === 'enemy' && u.hp > 0 && !CLASSES[u.cls].flier && (st.goal !== 'boss' || u.boss)).map(u => [u.x, u.y]);
  return must.every(([x, y]) => near(x, y)) && st.units.filter(u => u.team === 'player' && u.hp > 0 && !CLASSES[u.cls].flier).every(u => near(u.x, u.y));
}
function fireEvents(st) {
  const camp = st._camp; if (!camp || !st.events) return [];
  const rng = camp.rng, n = st.chapter, lord = st.units.find(u => u.leader), lv = enemyLevel(camp, n), lines = [];
  const side = (list, i) => (list && list.length ? list[Math.min(list.length - 1, i || 0)] : [lord.x, lord.y]);
  const P0 = side(st.pSlots), E0 = side(st.eSlots), mid = [Math.round((P0[0] + E0[0]) / 2), Math.round((P0[1] + E0[1]) / 2)];
  for (const ev of st.events) { if (ev.done || ev.turn !== st.turn) continue; ev.done = true; const say = (who, l) => lines.push([who, l]);
    if (ev.kind === 'alliance') { const spots = freeTiles(st, P0, 4, 6); if (!spots.length) continue; const lead = spawn(st, pickCls(rng, c => !c.healer, false), 'ally', lv + 1, spots[0], { allyLeader: true });
      for (const at of spots.slice(1, 3 + rng.int(0, 1))) spawn(st, pickCls(rng, () => true, false), 'ally', lv, at); st.allyLeader = lead.id;
      say('', evLine(st, 'alliance_n')); say(lead.name, evLine(st, 'alliance_l', { ally: lead.name })); }
    if (ev.kind === 'rivalry' || ev.kind === 'bandit') { const band = rng.pick(BANDS), far = [W - 1 - P0[0], E0[1]], spots = freeTiles(st, ev.kind === 'bandit' ? [rng.pick([0, W - 1]), Math.floor(H / 2)] : far, 4, 6); if (!spots.length) continue;
      const brig = c => /brigand|bandit|pirate|fighter|berserker|barbarian/i.test(c.name || '');
      const lead = spawn(st, pickCls(rng, ev.kind === 'bandit' ? brig : (c => !c.healer), false), 'other', lv + 1, spots[0], { band, raider: ev.kind === 'bandit' });
      for (const at of spots.slice(1, 3 + rng.int(0, 1))) spawn(st, pickCls(rng, ev.kind === 'bandit' ? brig : (c => !c.healer && !c.dancer), false), 'other', lv, at, { band, raider: ev.kind === 'bandit' });
      say('', evLine(st, ev.kind === 'bandit' ? 'bandit_n' : 'rivalry_n', { band })); say(lead.name, evLine(st, ev.kind === 'bandit' ? 'bandit_l' : 'rivalry_l', { band })); }
    if (ev.kind === 'defect') { const cands = st.units.filter(u => u.team === 'enemy' && u.hp > 0 && !u.boss && !u.captain && !u.guard); if (!cands.length) continue; const u = rng.pick(cands);
      if (!u.name || u.name === className(u)) u.name = uniqueName(camp, rng); u.team = 'player'; u.ai = 'pursue'; u.moved = false; st.joined.push(u.id); say('', evLine(st, 'defect_n')); say(u.name, evLine(st, 'defect_l')); }
    if (ev.kind === 'merc') { const cost = 800 + n * 60; if (st.campGold + (st.gold || 0) - st.spent < cost) continue; const band = rng.pick(BANDS), spots = freeTiles(st, P0, 3, 6); if (!spots.length) continue; st.spent += cost;
      const lead = spawn(st, pickCls(rng, c => /mercenar|hero|myrmidon|sword|fighter|warrior/i.test(c.name || ''), n >= 10), 'ally', lv + 2, spots[0], { band, merc: true });
      for (const at of spots.slice(1)) spawn(st, pickCls(rng, c => !c.healer, false), 'ally', lv + 1, at, { band, merc: true });
      say('', evLine(st, 'merc_n', { band, cost })); say(lead.name, evLine(st, 'merc_l', { band })); }
    if (ev.kind === 'refugee') { const spots = freeTiles(st, mid, 3, 5); if (!spots.length) continue; st.exitTile = P0; st.refugees = 0;
      for (const at of spots.slice(0, 2 + rng.int(0, 1))) spawn(st, pickCls(rng, c => !c.promoted && !c.monster && c.mov <= 6, false), 'neutral', 1, at, { role: 'refugee', hunted: true });
      say('', evLine(st, 'refugee_n')); say(lord.name, evLine(st, 'refugee_l')); }
    if (ev.kind === 'plea') { const v = rng.pick(st.villages); const vx = v % W, vy = Math.floor(v / W); const spots = freeTiles(st, [Math.min(W - 1, vx + 6), vy], 3, 5); if (!spots.length) continue;
      st.plea = v; for (const at of spots) spawn(st, pickCls(rng, c => /brigand|bandit|pirate|fighter/i.test(c.name || ''), false), 'other', lv, at, { raider: true, band: 'brigands' });
      say('', evLine(st, 'plea_n')); say('Villager', evLine(st, 'plea_v')); }
    if (ev.kind === 'merchant') { const spots = freeTiles(st, mid, 1, 4); if (!spots.length) continue; const m = spawn(st, pickCls(rng, c => !c.monster && !c.promoted, false), 'neutral', 1, spots[0], { role: 'merchant' });
      say('', evLine(st, 'merchant_n')); say(m.name, evLine(st, 'merchant_l')); }
    if (ev.kind === 'storm') { st.fog = true; st.storm = true; say('', evLine(st, 'storm_n')); say(lord.name, evLine(st, 'storm_l')); }
    if (ev.kind === 'night') { st.fog = true; st.night = true; say('', evLine(st, 'night_n')); say(lord.name, evLine(st, 'night_l'));
      for (let b = 0, t = 0; b < 2 + rng.int(0, 1) && t < 60; t++) { const x = rng.int(1, st.map.w - 2), y = rng.int(1, st.map.h - 2); if (unitAt(st, x, y) || st.map.terr[y * W + x] === 0x15) continue; (st.braziers = st.braziers || []).push({ x, y, r: 3 }); b++; }
      if (rng.chance(50)) { st.dawn = st.turn + 3 + rng.int(0, 2); say('', 'It will not stay dark forever. Dawn is a few hours off.'); } }
    if (ev.kind === 'quake') { let k = 0; for (const b of ev.bridges.slice().sort(() => rng.int(0, 1) - 0.5)) { if (k >= 2) break; if (unitAt(st, b % W, Math.floor(b / W))) continue; const was = st.map.terr[b]; st.map.terr[b] = 0x15; if (stillWinnable(st)) k++; else st.map.terr[b] = was; } if (k) say('', evLine(st, 'quake_n')); }
    if (ev.kind === 'flood') { let k = 0; for (const r of ev.rivers) for (const [dx, dy] of N4) { const x = r % W + dx, y = Math.floor(r / W) + dy; if (!inb(x, y) || k >= 8) continue; const i = y * W + x; if (st.map.terr[i] === 0x01 && !unitAt(st, x, y) && rng.chance(40)) { st.map.terr[i] = 0x10; if (stillWinnable(st)) k++; else st.map.terr[i] = 0x01; } } if (k) say('', evLine(st, 'flood_n')); }
    if (ev.kind === 'rival') { const rv = camp.rival, spots = freeTiles(st, [W - 1 - P0[0], Math.floor(H / 2)], 3, 6); if (!spots.length || !rv) continue;
      const r = spawn(st, rv.cls && CLASSES[rv.cls] ? rv.cls : pickCls(rng, c => !c.healer, n >= 10), 'other', lv + 3 + rv.meetings, spots[0], { rival: true, name: rv.name }); r.name = rv.name; rv.cls = r.cls;
      for (const at of spots.slice(1)) spawn(st, pickCls(rng, c => !c.healer, false), 'other', lv, at, { band: 'the rival\u2019s soldiers' });
      say('', evLine(st, 'rival_n', { rival: rv.name })); say(rv.name, evLine(st, 'rival_l')); }
    if (ev.kind === 'prison') { const spots = freeTiles(st, E0, 1, 5); if (!spots.length) continue; const p = spawn(st, pickCls(rng, c => !c.monster && !c.dancer, false), 'neutral', Math.max(1, lv - 1), spots[0], { role: 'prisoner' }); p.hp = Math.ceil(p.maxhp / 2);
      say('', evLine(st, 'prison_n')); }
    if (ev.kind === 'desert') { const spots = freeTiles(st, E0, 1, 4); if (!spots.length) continue; const d = spawn(st, pickCls(rng, c => !c.healer && !c.monster, false), 'neutral', lv, spots[0], { role: 'deserter', hunted: true }); d.hp = Math.ceil(d.maxhp * 0.45);
      say('', evLine(st, 'desert_n')); say(d.name, evLine(st, 'desert_l')); const boss = st.units.find(u => u.boss && u.hp > 0); if (boss) say(boss.name, evLine(st, 'desert_boss')); }
    if (ev.kind === 'hero') { const spots = freeTiles(st, [Math.floor(W / 2), rng.pick([1, H - 2])], 1, 6); if (!spots.length) continue; camp.heroMet = true;
      const h = spawn(st, pickCls(rng, c => !c.healer && !c.dancer && !c.monster, true), 'neutral', lv + 4, spots[0], { role: 'hero' });
      say('', evLine(st, 'hero_n', { cls: prose(className(h)).toLowerCase() })); say(h.name, evLine(st, 'hero_l')); }
  }
  return lines;
}
// a neutral unit's turn: refugees run for the army, deserters run to the nearest friend, the rest wait
function planNeutral(st, u) {
  const goal = u.role === 'escort' ? st.exitGoal : u.role === 'refugee' ? st.exitTile : u.role === 'deserter' ? (st.units.filter(o => o.team === 'player' && o.hp > 0).sort((a, b) => manhattan(a, u) - manhattan(b, u))[0] || null) : null;
  if (!goal) return { type: 'wait', path: [[u.x, u.y]] };
  const g = Array.isArray(goal) ? goal : [goal.x, goal.y], dist = reach(st, u), fd = field(st, u, g[0], g[1]); let best = [u.x, u.y], bd = fd.get(u.y * W + u.x) ?? 1e9;
  for (const k of dist.keys()) { const x = k % W, y = Math.floor(k / W), o = unitAt(st, x, y); if (o && o !== u) continue; const d = fd.get(k); if (d === undefined || d >= bd) continue;
    if (u.role === 'escort' && st.units.some(z => z.hp > 0 && (z.team === 'enemy' || z.team === 'other') && Math.abs(z.x - x) + Math.abs(z.y - y) <= 4)) continue; bd = d; best = [x, y]; }
  return { type: 'wait', path: pathTo(dist, best[0], best[1]) };
}
// what the player's army can do with a neutral: free a prisoner, take in a deserter, buy from a merchant, and (the lord only) talk to the wandering hero
function talkTarget(st, u, dist) {
  let best = null;
  for (const o of st.units) { if (o.team !== 'neutral' || o.hp <= 0) continue;
    if (o.role === 'hero' && !u.leader) continue; if (o.role === 'refugee') continue;
    if (o.role === 'merchant' && (o.sold || st.campGold + (st.gold || 0) - st.spent < 600)) continue;
    for (const [dx, dy] of N4) { const x = o.x + dx, y = o.y + dy; if (!inb(x, y) || !dist.has(y * W + x)) continue; const occ = unitAt(st, x, y); if (occ && occ !== u) continue;
      const dg = danger(st, u, x, y); if (dg >= u.hp * (u.leader ? 0.35 : 0.6)) continue; const pri = { hero: 4, prisoner: 3, deserter: 3, merchant: 1 }[o.role] || 0;
      if (!best || pri > best.pri || (pri === best.pri && dg < best.dg)) best = { pri, dg, x, y, t: o }; } }
  return best;
}
// a recruit (SRR+ style, Casim): rebuilt from its class's level-1 stats, then one level-up per level, with its own growths,
// up to the higher of its generated level and the army's average level shown (1-40); certification past 20. Each step is
// kept in u._joinUps so the page can play it on the level-up screen at normal speed.
const STATK = ['hp', 'maxhp', 'str', 'mag', 'skl', 'spd', 'lck', 'def', 'res'];
function growTo(rng, u, goal, rec) { let n = 0; while (lvShown(u) < goal && n++ < 45) { const was = u.cls, lv0 = lvShown(u), g = levelUp(rng, u); if (rec) rec.push({ shown: lv0 + 1, cls: CLASSES[was].name, gains: g }); settleLevel(u); if (rec && u.cls !== was) rec.push({ promote: CLASSES[u.cls].name }); } u.hp = u.maxhp; }
function growRecruit(camp, u) { const rng = camp.rng, others = camp.army.filter(o => o !== u && o.hp > 0); settleLevel(u);
  const start = lvShown(u), avg = others.length ? Math.round(others.reduce((a, o) => a + lvShown(o), 0) / others.length) : start, cap = camp._sideCap || 40, goal = Math.min(40, cap, Math.max(Math.min(start, cap), avg));
  const fresh = makeUnit(rng, u.cls, 'player', 1); for (const k of STATK) u[k] = fresh[k]; u.level = 1; u.exp = 0;
  const ups = []; growTo(rng, u, goal, ups); u._joinUps = ups; u.joinedBook = (camp.story && camp.story.book) || 1; }
function catchUp(camp, u) { const others = camp.army.filter(o => o !== u && o.hp > 0); if (others.length < 3) return; const lv = others.map(lvShown).sort((a, b) => a - b), target = Math.min(40, lv[Math.floor(lv.length / 2)] - 3);
  let n = 0; while (lvShown(u) < target && n++ < 40) { levelUp(camp.rng, u); settleLevel(u); } }
function settleLevel(u) { const c = CLASSES[u.cls]; if (!c || c.promoted || u.level <= 20) return;
  const to = (c.promoTo && CLASSES[c.promoTo] && CLASSES[c.promoTo].promoted && c.promoTo) || (c.branches || []).find(k => CLASSES[k] && CLASSES[k].promoted);
  if (to) { u.cls = to; u.fe8 = to; u.level = Math.max(1, u.level - 20); const nr = startRanks(CLASSES[to]); u.wexp = u.wexp || {}; for (const k in nr) u.wexp[k] = Math.max(u.wexp[k] || 0, nr[k]); } else u.level = 20; }
// Dismounting (SRR+, as FE4/5 do indoors): on an indoor map, riders and fliers fight on foot. The unit takes a foot class
// with the same weapon, tier and sex for the chapter, so movement (5), weaknesses, map sprite and battle animation all
// follow; its own class comes back before rewards and promotion.
const FOOT_PREF = ['Soldier', 'Mercenary', 'Fighter', 'Archer', 'Mage', 'Monk', 'Priest', 'Shaman', 'Hero', 'Halberdier', 'Warrior', 'Sniper', 'Sage', 'Bishop', 'Druid', 'Swordmaster', 'General', 'Myrmidon', 'Knight'];
function footFor(u) { const c = CLASSES[u.cls]; if (!c || (!c.canto && !c.flier) || c.monster) return null; const wt = rankKey(c.wpn);
  const cands = Object.keys(CLASSES).filter(k => { const f = CLASSES[k]; return f && !f.canto && !f.flier && !f.monster && !f.lord && !f.trainee && !f.dancer && !!f.promoted === !!c.promoted && rankKey(f.wpn) === wt && f.game === c.game; });
  if (!cands.length) return null; const rank = k => { const i = FOOT_PREF.indexOf(CLASSES[k].name); return i < 0 ? 99 : i; }; cands.sort((a, b) => rank(a) - rank(b));
  const name = CLASSES[cands[0]].name, same = cands.filter(k => CLASSES[k].name === name); return (u.sex === 'F' && same[1]) || same[0]; }
function dismount(st) { if (isOutdoor(st)) return; let n = 0;
  for (const u of st.units) { if (u.hp <= 0 || u.big || u.wild || u.cart || u._mountCls) continue; const f = footFor(u); if (!f) continue; u._mountCls = u.cls; u._mountFe8 = u.fe8; u.cls = f; u.fe8 = f; n++; }
  if (n) st.sideLines = [...(st.sideLines || []), ['', 'Indoors, the riders leave their mounts at the door and fight on foot.']]; }
function remount(units) { for (const u of units) if (u._mountCls) { u.cls = u._mountCls; u.fe8 = u._mountFe8; delete u._mountCls; delete u._mountFe8; } }
// the second army holds at most 15 (Casim): past that, a joiner fights beside it this once as an ally and leaves after
// the second route's enemies never exceed the second army's average level + 3 (Casim): anyone above it, from setup or any
// mid-battle spawn (captains, events, waves), is rebuilt at that level, in its base class while that army is mostly unpromoted
function sideClamp(st, u) { const L = st.side ? st._camp && st._camp._sideEnemyLv : st.clampLv; if (!L || u.team === 'player' || u.team === 'ally' || u.big || u.cart || (u.wild && !u.risen) || u.barricade || u.tent) return;
  const capShown = L.shown + 3; if (lvShown(u) <= capShown) return; let cls = u.cls;
  if (CLASSES[cls] && CLASSES[cls].promoted && !L.pro) { const b = baseClassOf(cls); if (b && CLASSES[b]) cls = b; }
  const lv = CLASSES[cls].promoted ? Math.max(1, capShown - 20) : Math.max(1, Math.min(20, capShown)), f = makeUnit(st.rng, cls, 'enemy', lv);
  u.cls = cls; u.fe8 = cls; u.level = lv; for (const k of STATK) u[k] = f[k]; u.growth = f.growth; u.gCls = cls; if (f.items) { u.items = f.items; u.weapon = f.weapon; } u.hp = u.maxhp; }
function joinArmy(st, o) { if (st.side && st._camp && st._camp.army.filter(u => u.hp > 0).length + (st.joined || []).length >= 15) { o.team = 'ally'; o.ai = 'pursue'; o.role = null; o.hunted = false; o.moved = true; o.sideGuest = true; return; } if (st._camp && !o.wild) growRecruit(st._camp, o); else settleLevel(o); o.team = 'player'; o.ai = 'pursue'; o.role = null; o.hunted = false; o.moved = true; o.joined = st.chapter; st.joined.push(o.id); }

// ---------------------------------------------------------------- HOUSES, TALK-TO-RECRUIT AND RESCUE
const HT = {
  house_greet: ['An old woman opens the door a crack and looks the soldier over.', 'A farmer steps out of the doorway, wiping his hands.', 'Inside, a family is hiding under the table. The father comes out first.', 'The door opens on a cramped room and a man who has clearly not slept.'],
  hint_boss: ['The one in charge is called {commander}. Gets angry fast, and angry soldiers make mistakes.', 'That {commander} has been bullying this village for weeks. Make them pay.', '{commander} keeps the best soldiers close. Do not walk into them alone.'],
  hint_reinf: ['More of them are coming. I heard the officers talk about the turn after next.', 'My son saw soldiers marching this way. They will arrive before long, so finish quickly.'],
  hint_chest: ['There is treasure in this place. The soldiers locked it up. A thief could get it out.', 'The old lord kept a strongbox here. Nobody has found the key since he fled.'],
  hint_fog: ['When the mist comes down here, you cannot see your own hand. Carry a light.', 'Do not trust your eyes on this field. The fog hides whole companies.'],
  hint_general: ['Stay out of the open ground. Their archers are better than they look.', 'The soldiers here are tired and badly paid. Push hard and some will break.', 'Fight from the forest if you can. It has saved this village more than once.'],
  lore: ['My grandfather rode with {order}. He said they swore never to leave a village undefended. Then they were gone.', 'People here still remember {war}. Half the graves on the hill are from it.', 'They say {relic} was carried through this valley once, the year the river froze.', '{home} used to send soldiers to protect us. That stopped when {home} fell.', 'Everyone says {vtitle} {villain} wants {relic}. Nobody says what happens if he gets it.'],
  house_recruit: ['My daughter wants to fight. I cannot stop her. Please, look after her.', 'I am coming with you. I have watched {faction} long enough.', 'Wait. Take me with you. I can still swing a blade.'],
  rec_brief: ['{talker} recognises one of the enemy soldiers: {name}, {tie}.', 'Among the soldiers of {faction}, {talker} spots a familiar face. {name}, {tie}.'],
  rec_open: ['{name}? It is me. Put the weapon down. You do not belong with them.', 'I knew you before all this, {name}. You were better than {faction}.', '{name}, please. Whatever they promised you, it is not worth this.', 'Do you remember what you said to me, before the war? Come with us, {name}.'],
  rec_join: ['I have been waiting for someone to say that.', 'You are right. I hated every day of it.', 'I will come. Just do not make me regret it.', 'All right. For you, I will switch sides.'],
  rescue_l: ['Grab on! I have you!', 'Up you come. Hold tight.', 'Not today. You are coming with me.'],
};
const TIES = ['a childhood friend from the same village', 'an old comrade from the militia', 'a cousin who left home years ago', 'a former squire from the same training yard', 'a sibling who took the other side'];
function houseVisit(st, u, res) {
  const camp = st._camp, rng = camp.rng, f = facts(camp, st), P = HT, lines = [['', STORY.pick(camp, 'h_greet', P.house_greet, rng, f)]];
  const boss = st.units.find(o => o.boss && o.hp > 0); if (boss) f.commander = boss.name;
  const options = [];
  if (boss) options.push(['hint_boss', 3]); if (st.reinforce && st.reinforce.turns.some(t => t > st.turn)) options.push(['hint_reinf', 3]);
  if (st.chests && st.chests.some(v => st.map.terr[v] === 0x21)) options.push(['hint_chest', 2]); if (st.fog) options.push(['hint_fog', 2]);
  options.push(['hint_general', 1], ['lore', 3]); if (rng.chance(15) && camp.army.length < 30) options.push(['house_recruit', 3]);
  const tot = options.reduce((a, o) => a + o[1], 0); let r = rng.int(1, tot), i = 0; while (r > options[i][1]) r -= options[i++][1]; const kind = options[i][0];
  if (kind === 'house_recruit') { const cls = POOL ? poolPick(rng, c => !c.promoted && !c.monster, false) : 'Fighter'; const spots = freeTiles(st, [u.x, u.y], 1, 3);
    if (spots.length) { const nu = spawn(st, cls, 'player', Math.max(1, st.chapter), spots[0]); nu.team = 'player'; joinArmy(st, nu); nu.moved = true; lines.push([nu.name, STORY.pick(camp, 'h_rec', P.house_recruit, rng, f)]); lines.push(['', `${nu.name} joins the army.`]); } }
  else lines.push(['Villager', STORY.pick(camp, 'h_' + kind, P[kind], rng, f)]);
  res.lines = lines; res.house = true;
}
function scheduleRecruit(camp, st, rng, n) {
  if (n < 2 || !rng.chance(30)) return;
  const cands = st.units.filter(u => u.team === 'enemy' && !u.boss && !u.captain && !u.guard && !CLASSES[u.cls].monster); if (!cands.length) return;
  const e = rng.pick(cands), talker = rng.pick(camp.army.filter(o => !(st.reserve || []).includes(o.id))); if (!talker) return;
  e.name = uniqueName(camp, rng); e.recruitBy = talker.id; e.tie = rng.pick(TIES);
  st.intro.push(['', STORY.pick(camp, 'rec_brief', HT.rec_brief, rng, facts(camp, st, { talker: talker.name, name: e.name, tie: e.tie }))]);
}
// rescue: mounted and flying units can carry an adjacent foot ally; skill and speed are halved while carrying
const canCarry = u => !!CLASSES[u.cls].flier || skillsOf(u).canto;
const carriable = (o) => !CLASSES[o.cls].flier && !skillsOf(o).canto;
function dropSpot(st, u) { let best = null;
  for (const [dx, dy] of N4) { const x = u.x + dx, y = u.y + dy; if (!inb(x, y) || unitAt(st, x, y)) continue; const c = st.units.find(o => o.id === u.carrying); if (!c || moveCost(st, c, x, y) >= 99) continue;
    const dg = danger(st, c, x, y); if (!best || dg < best.dg) best = { x, y, dg }; } return best; }
function rescueTarget(st, u, dist) {
  if (u.carrying || !canCarry(u)) return null; let best = null;
  for (const o of st.units) { if (o.team !== u.team || o === u || o.hp <= 0 || o.carriedBy || !carriable(o)) continue;
    const frail = CLASSES[o.cls].healer || CLASSES[o.cls].dancer || o.hp < o.maxhp * 0.35; if (!frail || danger(st, o, o.x, o.y) < o.hp) continue;
    for (const [dx, dy] of N4) { const x = o.x + dx, y = o.y + dy; if (!inb(x, y) || !dist.has(y * W + x)) continue; const occ = unitAt(st, x, y); if (occ && occ !== u) continue;
      const dg = danger(st, u, x, y); if (dg >= u.hp * 0.6) continue; if (!best || dg < best.dg) best = { x, y, dg, t: o }; } }
  return best;
}

// ---------------------------------------------------------------- COMBAT LAYER: staves, statuses, weapon effects, personal skills, dual attacks
const CAT = {
  armor: u => /knight|general|armou?r|baron|great knight/i.test(className(u)) && !skillsOf(u).canto,
  cavalry: u => skillsOf(u).canto && !CLASSES[u.cls].flier,
  flier: u => !!CLASSES[u.cls].flier,
  dragon: u => /wyvern|dragon|manakete|draco|wyrm/i.test(className(u)),
};
const PSKILLS = ['Luna', 'Sol', 'Vantage', 'Wrath', 'Adept', 'Counter', 'Charm', 'Renewal', 'Aegis', 'Pavise'];
const PSKILL_TEXT = { Luna: 'ignores defence', Sol: 'heals the damage dealt', Vantage: 'strikes first when below half HP', Wrath: '+50 crit when below half HP', Adept: 'may strike again',
  Counter: 'returns melee damage', Charm: 'nearby allies +10 hit and avoid', Renewal: 'recovers 20% HP each turn', Aegis: 'halves ranged damage', Pavise: 'halves melee damage' };
const STATUS_NAME = { sleep: 'Sleep', silence: 'Silence', berserk: 'Berserk', poison: 'Poison', barrier: 'Barrier' };
const hasStatus = (u, k) => !!(u.status && u.status[k] > 0);
function staffRange(u, w) { return w.longRange ? Math.max(1, Math.floor(u.mag / 2)) : (w.max || 1); }
function staffHit(u, t, w) { if (!w.status) return 100; const d = Math.abs(u.x - t.x) + Math.abs(u.y - t.y); return Math.max(0, Math.min(100, 30 + u.mag * 5 + u.skl - t.res * 5 - d * 2)); }
function dualPartner(st, a, d) {
  if (!st || !st.supports || (a.team !== 'player' && a.team !== 'ally')) return null; let best = null;
  for (const o of st.units) { if (o === a || o.hp <= 0 || o.team !== a.team || o.carriedBy || Math.abs(o.x - a.x) + Math.abs(o.y - a.y) !== 1) continue;
    const w = WEAPONS[o.weapon]; if (!w || w.heal || w.refresh || w.consumable || w.type === 'none' || hasStatus(o, 'sleep')) continue;
    const r = rankOf(st.supports[pairKey(a, o)] || 0); if (!r) continue; const chance = [0, 20, 30, 45][r];
    if (!best || chance > best.chance) best = { o, chance, rank: 'CBA'[r - 1] }; }
  if (!best) return null; const sv = stats(st, best.o, d, best.o.x, best.o.y); return Object.assign(best, { sv });
}
// a staff turn: status staves on dangerous foes, cures, barriers, light, unlocking and pulling allies out of danger
function planStaff(st, u) {
  if (hasStatus(u, 'silence')) return null;
  const staves = (u.items || []).filter(it => WEAPONS[it.id] && WEAPONS[it.id].util && (it.uses > 0) && canWield(u, it.id)); if (!staves.length) return null;
  const dist = reach(st, u), ends = []; for (const k of dist.keys()) { const x = k % W, y = Math.floor(k / W), o = unitAt(st, x, y); if (!o || o === u) ends.push([x, y]); }
  let best = null; const consider = (s, x, y, t, it, extra) => { if (!best || s > best.s) best = Object.assign({ s, x, y, t, it }, extra || {}); };
  for (const it of staves) { const w = WEAPONS[it.id];
    for (const [x, y] of ends) { const dg = danger(st, u, x, y); if (u.team === 'player' && dg >= u.hp * 0.6) continue; const me = { x, y, mag: u.mag, skl: u.skl };
      const inR = t => { const d = Math.abs(t.x - x) + Math.abs(t.y - y); return d >= 1 && d <= staffRange(u, w); };
      for (const t of st.units) { if (t.hp <= 0 || t.carriedBy || !inR(t)) continue;
        if (w.status && foes(u, t) && !hasStatus(t, w.status) && !t.boss) { const h = staffHit(me, t, w); if (h < (u.team === 'player' ? 40 : 30)) continue; const threat = (WEAPONS[t.weapon] && WEAPONS[t.weapon].magic ? t.mag : t.str) + t.level; consider(h / 100 * threat - dg * 0.2, x, y, t, it, { hit: h }); }
        if (w.cure && !foes(u, t) && t.status && (t.status.sleep > 0 || t.status.silence > 0 || t.status.berserk > 0 || t.status.poison > 0)) consider(14 - dg * 0.2, x, y, t, it);
        if (w.barrier && !foes(u, t) && !hasStatus(t, 'barrier') && danger(st, t, t.x, t.y) > t.hp * 0.5) consider(8 - dg * 0.2, x, y, t, it);
        if (w.physic && !foes(u, t) && t.maxhp - t.hp >= 8) consider((t.maxhp - t.hp) * 0.7 * (t.leader ? 2 : 1) - dg * 0.2, x, y, t, it);
        if (w.rescueStaff && !foes(u, t) && !t.leader && t !== u && danger(st, t, t.x, t.y) >= t.hp && (CLASSES[t.cls].healer || t.hp < t.maxhp * 0.4)) { const spot = N4.map(([dx, dy]) => [x + dx, y + dy]).find(([ax, ay]) => inb(ax, ay) && !unitAt(st, ax, ay) && moveCost(st, t, ax, ay) < 99); if (spot) consider(16 - dg * 0.2, x, y, t, it, { to: spot }); } }
      if (w.unlock && st.chests) for (const v of st.chests) { if (st.map.terr[v] !== 0x21) continue; const d = Math.abs(v % W - x) + Math.abs(Math.floor(v / W) - y); if (d <= staffRange(u, w)) consider(9 - dg * 0.2, x, y, null, it, { chest: v }); }
      if (w.lightArea && st.fog && !st.units.some(o => o.team === 'enemy' && o.hp > 0 && visible(st, o.x, o.y))) consider(6 - dg * 0.2, x, y, null, it, { light: [x, y] }); } }
  if (!best || best.s < 4) return null;
  return { type: 'staff', path: pathTo(dist, best.x, best.y), target: best.t ? best.t.id : null, staff: best.it.id, chest: best.chest, light: best.light, to: best.to, s: best.s };
}
function applyStaff(st, u, act, res) {
  const it = (u.items || []).find(z => z.id === act.staff && z.uses > 0), w = WEAPONS[act.staff]; if (!it || !w) return; it.uses--; if (it.uses <= 0) { u.items.splice(u.items.indexOf(it), 1); equipBest(u); }
  const t = act.target ? st.units.find(o => o.id === act.target) : null; res.staff = { name: w.name, target: act.target };
  if (w.status && t) { const h = staffHit(u, t, w), ok = st.rng.int(0, 99) < h; res.staff.hit = ok; if (ok) { t.status = t.status || {}; t.status[w.status] = 3; if (w.status === 'sleep') t.moved = true; } }
  if (w.cure && t) { t.status = {}; res.staff.cured = true; }
  if (w.barrier && t) { t.status = t.status || {}; t.status.barrier = 3; }
  if (w.physic && t) { const amt = Math.min(t.maxhp - t.hp, u.mag + w.power); t.hp += amt; res.amount = amt; }
  if (w.rescueStaff && t && act.to) { t.x = act.to[0]; t.y = act.to[1]; res.staff.moved = true; }
  if (w.unlock && act.door !== undefined && st.map.terr[act.door] === 0x1E) openDoor(st, act.door, res);
  if (w.unlock && act.chest !== undefined && st.map.terr[act.chest] === 0x21) { st.map.terr[act.chest] = 0x20; const rng = st.rng, g = 500 + rng.int(0, 15) * 100 + st.chapter * 80; st.gold = (st.gold || 0) + g; res.gold = g; res.chest = true; }
  if (w.lightArea && act.light) { (st.lights = st.lights || []).push({ x: act.light[0], y: act.light[1], r: 5, turns: 4 }); res.staff.lit = true; }
  if (u.team === 'player') { res.exp = [gainExp(st, u, w.status ? (res.staff.hit ? 20 : 8) : 15)]; u.wexp = u.wexp || {}; u.wexp.staff = Math.min(251, (u.wexp.staff || 0) + 3); }
}
// statuses tick at the start of the unit's own phase; Renewal heals; poison never kills
function tickStatus(st, team, heals) {
  for (const u of st.units) { if (u.team !== team || u.hp <= 0) continue;
    if (u.pskill === 'Renewal' && u.hp < u.maxhp) { const a = Math.min(u.maxhp - u.hp, Math.max(1, Math.round(u.maxhp * 0.2))); u.hp += a; heals.push({ id: u.id, amount: a }); }
    if (!u.status) continue;
    if (u.status.poison > 0) { const a = Math.min(3, u.hp - 1); if (a > 0) { u.hp -= a; heals.push({ id: u.id, amount: -a, poison: true }); } }
    for (const k of Object.keys(u.status)) { if (u.status[k] > 0) u.status[k]--; if (u.status[k] <= 0) delete u.status[k]; }
    if (hasStatus(u, 'sleep')) u.moved = true; }
  if (team === 'player' && st.lights) { for (const l of st.lights) l.turns--; st.lights = st.lights.filter(l => l.turns > 0); }
}

// ---------------------------------------------------------------- MAP VARIETY: objectives, thieves, hazards, map events
const MV = {
  brief_defend: ['{faction} wants the {point} at {place}. Hold it for {turns} turns and the army behind us can get through.', 'Scouts expect {faction} to strike at the {point}. If no enemy stands on it after {turns} turns, the day is ours.'],
  brief_escape: ['The army is boxed in at {place}. The only way out is the far road. {lord} has to reach it.', 'There is no winning this field. Get {lord} to the marked exit and the army will follow.'],
  brief_rescue: ['{name} is held prisoner somewhere in {place}. Reach the cell and bring {name} home.', '{faction} has taken {name}. Get to the prisoner before they move the cell.'],
  brief_escort: ['{name} has to reach the far side of {place} alive. {faction} will try to stop that.', 'The army is escorting {name} across {place}. Keep {name} breathing until the road is reached.'],
  brief_flee: ['{commander} is running for the edge of {place} with whatever can be carried. Catch the commander before the trail goes cold.', 'The enemy commander is fleeing. If {commander} reaches the far road, this war gets longer.'],
  escort_l: ['I will walk as fast as I can. Please, do not let them catch me.', 'Just get me to the road. I will do the rest.', 'I am not a soldier. I am trusting all of you with my life.'],
  flee_l: ['Hold them off! I will not die in this backwater.', 'Cover my retreat. That is an order!', 'Let the others fight. I have somewhere better to be.'],
  captive_l: ['Is someone there? Please, get me out of here.', 'I knew you would come. I did not think it would take this long.'],
  thief_n: ['A thief slips out of the enemy lines, heading for the treasure.', 'Someone is going for the chests. If that thief escapes, the loot goes too.'],
  thief_l: ['Finders keepers.', 'Nobody will miss a little gold.', 'In and out. Nobody gets hurt. Well, nobody important.'],
  thief_steal: ['The thief prises the chest open and stuffs a pack full.', 'A chest swings open. The thief grins and turns to run.'],
  thief_gone: ['The thief vanishes over the edge of the map with the loot.', 'Too slow. The thief is gone, and so is the treasure.'],
  fire_n: ['Flames catch in the dry trees of {place}. The fire is spreading.', 'Someone has set the forest alight. Smoke rolls across the field.'],
  snow_n: ['Snow begins to fall over {place}, thick and fast. Every step is harder.', 'A cold wind brings snow. The ground disappears under it within the hour.'],
  ambush_n: ['Enemy soldiers burst out of hiding behind the army. It was a trap.', 'An ambush. {faction} had soldiers waiting behind the lines all along.'],
  ambush_l: ['Turn around! They are behind us!', 'Protect the rear. Now!'],
  door_n: ['A door bursts open and more soldiers of {faction} pour through.', 'With a crash, the doors give way. Enemy reinforcements are inside.'],
};
const DEFEND_TEXT = { defend: 'Defend the {point} for {n} turns', escape: 'Get the lord to the exit', rescue: 'Rescue {name}', escort: 'Escort {name} to the exit', flee: 'Stop {commander} escaping' };
function mvLine(st, key, extra) { const camp = st._camp; return STORY.pick(camp, 'mv' + key, MV[key], camp.rng, facts(camp, st, extra)); }
// the farthest tile on the map edge that a foot unit can walk to from here, for exits
function farEdge(st, from) {
  const probe = { cls: 'Soldier', fe8: 0x0F, team: 'neutral' }, seen = new Map([[from[1] * W + from[0], 0]]), q = [from]; let best = null;
  while (q.length) { const [x, y] = q.shift(), d = seen.get(y * W + x);
    if ((x === 0 || y === 0 || x === W - 1 || y === H - 1) && (!best || d > best[2])) best = [x, y, d];
    for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (!inb(nx, ny) || seen.has(k) || moveCost(st, probe, nx, ny) >= 99) continue; seen.set(k, d + 1); q.push([nx, ny]); } }
  return best ? [best[0], best[1]] : null;
}
function setObjective(camp, st, rng, n, pSlots) {
  if (!st.twist || st.goal === 'survive') return;
  const lord = st.units.find(u => u.leader); if (!lord) return;
  const boss = st.units.find(u => u.boss && u.hp > 0), P0 = pSlots[0] || [lord.x, lord.y];
  const kind = st.twist === 'flee' && !boss ? st.twistAlt : st.twist, exit = farEdge(st, [lord.x, lord.y]);
  st.markers = [];
  if (kind === 'defend') { let pt = null, bd = 1e9; for (let i = 0; i < W * H; i++) { const t = st.map.terr ? st.map.terr[i] : -1; if (t !== T_FORT && t !== T_GATE && t !== T_GATE2 && t !== T_THRONE) continue; const d = Math.abs(i % W - P0[0]) + Math.abs(Math.floor(i / W) - P0[1]); if (d < bd) { bd = d; pt = [i % W, Math.floor(i / W)]; } }
    if (!pt || bd > 8) pt = [P0[0], P0[1]]; st.defendTile = pt; st.defendTurns = 7 + rng.int(0, 3); st.markers.push({ x: pt[0], y: pt[1], kind: 'defend' }); }
  if ((kind === 'escape' || kind === 'escort') && !exit) return;
  // courier race (n>=5): our courier makes for one exit, the enemy's rider for another; the first to arrive decides whether a
  // commander's force helps the army in the next chapter or turns against it
  if (kind === 'courier') { if (!exit || n < 5) return; const spot = freeTiles(st, P0, 1, 3)[0]; if (!spot) return; const ccls = POOL ? poolPick(rng, c2 => !c2.promoted && !c2.monster && c2.mov >= 6, false) : 'Cavalier';
    const e = spawn(st, ccls, 'neutral', Math.max(5, n), spot, { role: 'escort', courier: true }); st.escortee = e.id; st.exitGoal = exit; st.markers.push({ x: exit[0], y: exit[1], kind: 'exit' });
    const E0 = (st.eSlots || [])[0], es = E0 && freeTiles(st, E0, 1, 3)[0]; if (es) { const ec = spawn(st, ccls, 'enemy', Math.max(5, n), es, { courier: true, fleeing: true }); ec.ai = 'pursue'; const far = farEdge(st, es); if (far) { st.fleeExit = far; st.markers.push({ x: far[0], y: far[1], kind: 'exit' }); } st.enemyCourier = ec.id; }
    st.courier = { ally: makePlace(rng), cmd: uniqueName(camp, rng), ours: e.name }; st.goal = 'escort'; st.goalText = `Get ${e.name} to ${st.courier.cmd} before the enemy's rider`;
    st.intro.push(['', `${e.name} carries word to ${st.courier.cmd} of ${st.courier.ally}. An enemy rider races for the same commander; whoever arrives first decides which side ${st.courier.ally} takes.`]); return; }
  // three keys (n>=6, seize chapters): three captains each hold a key; the throne opens only when all three have fallen
  if (kind === 'keys') { if (st.goal !== 'seize' || !st.map.throne || n < 6) return; const cands = st.units.filter(u => u.team === 'enemy' && !u.boss && u.hp > 0).sort((a, b) => b.level - a.level).slice(0, 3); if (cands.length < 3) return;
    for (const u of cands) { u.keyholder = true; u.captain = true; u.name = u.name || uniqueName(camp, rng); u.level++; } st.keysLeft = 3;
    st.goalText = 'Take the three keys from their captains, then seize the throne'; st.intro.push(['', `The throne room is sealed. ${cands.map(u => u.name).join(', ')} each carry one of its keys.`]); return; }
  // bounty hunters (n>=8): a third party that wants one unit of the army and ignores everyone else
  if (kind === 'bounty') { if (n < 8) return; const P = st.units.filter(u => u.team === 'player' && !u.leader && u.hp > 0); if (!P.length) return; const tgt = P.sort((a, b) => (b.kills || 0) - (a.kills || 0) || b.level - a.level)[0];
    const far = (st.eSlots || [])[Math.floor((st.eSlots || []).length / 2)] || exit; if (!far) return; const plan = { leader: uniqueName(camp, rng), size: 3 + rng.int(0, 1), mode: 'start', realm: makePlace(rng) };
    st._camp = st._camp || camp; axisArmy(st, rng, plan, far[0], far[1]); if (!st.axis) st.axis = plan; for (const u of st.units) if (u.axis && u.team === 'other' && !u.bountyOn) u.bountyOn = tgt.id;
    st.bounty = { target: tgt.id, name: tgt.name, by: plan.leader }; st.intro.push(['', `Bounty hunters led by ${plan.leader} have come for ${tgt.name}. They want no one else, and will walk past anyone to reach them.`]); return; }
  // stealth (n>=4): the enemy camp has not seen the army; sentries hold still until one spots a unit within three squares or
  // is struck, then the alarm brings the whole camp and reinforcements; finishing unseen earns a reward
  if (kind === 'stealth') { if (n < 4) return; const foesE = st.units.filter(u => u.team === 'enemy' && u.hp > 0 && !u.boss); if (foesE.length < 3) return; for (const u of foesE) { u.sentry = true; u.ai = 'hold'; } st.stealth = { alarm: false };
    st.intro.push(['', 'The enemy camp has not seen you yet. Sentries watch the approaches; if one raises the alarm, the whole camp will come.']); return; }
  // the caravan (n>=4): a slow, sturdy supply cart drives itself to the far side; it pays if it arrives
  if (kind === 'caravan') { if (!exit || n < 4) return; const spot = freeTiles(st, P0, 1, 3)[0]; if (!spot) return; const ccls = POOL ? poolPick(rng, c2 => /knight|armou?r/i.test(c2.name || '') && !c2.monster, false) : 'Knight';
    const e = spawn(st, ccls, 'neutral', Math.max(5, n), spot, { role: 'escort', caravan: true }); e.name = 'Supply Caravan'; e.maxhp += 12; e.hp = e.maxhp; e.def += 4;
    st.escortee = e.id; st.exitGoal = exit; st.markers.push({ x: exit[0], y: exit[1], kind: 'exit' }); st.caravan = true; st.goal = 'escort'; st.goalText = 'Get the supply caravan to the far side';
    st.intro.push(['', 'The army\'s supply caravan has to cross this ground. It is slow, and the enemy knows exactly what is in it.']); return; }
  // the cub (n>=9): poachers hunt a wild creature's young while its pack watches; if it reaches safety the pack calms and
  // the cub or its parent joins the army
  if (kind === 'cub') { if (!exit || n < 9 || !POOL || !POOL.monsters || !POOL.monsters.length) return; const spot = freeTiles(st, P0, 1, 3)[0]; if (!spot) return;
    const kd = rng.pick(WILD_KINDS.filter(k => k.key === 'wolf' || k.key === 'bear')), mons = POOL.monsters.filter(k => kd.cls.test(className({ cls: k }))), mc = mons.length ? rng.pick(mons) : rng.pick(POOL.monsters);
    const c = spawn(st, mc, 'neutral', Math.max(1, n - 6), spot, { role: 'escort', cub: true, hunted: true }); c.wild = kd.key; c.name = kd.name + ' cub'; c.maxhp += 12; c.hp = c.maxhp; c.def += 3;   // young but tough, or the poachers win every time
    st.escortee = c.id; st.exitGoal = exit; st.markers.push({ x: exit[0], y: exit[1], kind: 'exit' }); st.cubKind = kd.key; st.cubCls = mc; st.goal = 'escort';
    st.goalText = `Get the ${kd.name.toLowerCase()} cub to safety`; st.intro.push(['', `Poachers have run down a ${kd.name.toLowerCase()} cub. Its pack is close, and will spare whoever brings it home.`]); return; }
  // the tribunal (n>=6): a judge of the realm watches the battle; raiders hunt the civilians on the field; if the army
  // saves at least half, the judge rules for it (gold, and the judge's guards in the next battle)
  if (kind === 'tribunal') { if (n < 6) return; const mid = [Math.floor(st.map.w / 2), Math.floor(st.map.h / 2)], spots = freeTiles(st, mid, 6, 6); if (spots.length < 5) return;
    const j = spawn(st, POOL ? poolPick(rng, c2 => !c2.monster && c2.healer, true) || poolPick(rng, () => true, true) : 'Bishop', 'neutral', Math.max(5, n), spots[0], { role: 'judge', rooted: true }); j.ai = 'hold'; j.name = uniqueName(camp, rng); j.items = []; j.weapon = 'none';
    const civ = []; for (const at of spots.slice(1, 5)) civ.push(spawn(st, POOL ? poolPick(rng, c2 => !c2.promoted && !c2.monster && c2.mov <= 6, false) : 'Villager', 'neutral', 1, at, { role: 'refugee', hunted: true, civilian: true }).id);
    if (!st.exitTile) { st.exitTile = [P0[0], P0[1]]; st.markers.push({ x: P0[0], y: P0[1], kind: 'exit' }); }   // the townsfolk run for the army's lines
    st.tribunal = { judge: j.name, realm: makePlace(rng), civ }; st.intro.push(['', `${j.name}, a judge of ${st.tribunal.realm}, has come to see how this war is fought. Raiders are already among the townsfolk.`]); return; }
  // sabotage (n>=7): three supply carts; the chapter is won when they are all destroyed
  if (kind === 'sabotage') { if (n < 7) return; const E0 = (st.eSlots || [])[Math.floor((st.eSlots || []).length / 2)]; if (!E0) return; const spots = freeTiles(st, E0, 3, 6); if (spots.length < 3) return;
    for (const at of spots) { const c = spawn(st, POOL ? poolPick(rng, c2 => /knight|armou?r/i.test(c2.name || '') && !c2.monster, false) : 'Knight', 'enemy', Math.max(1, n), at, { cart: true, rooted: true }); c.ai = 'hold'; c.items = []; c.weapon = 'none'; c.name = 'Supply Cart'; c.def += 4; c.maxhp += 8; c.hp = c.maxhp; }
    st.goal = 'carts'; st.goalText = "Destroy the enemy's three supply carts"; st.intro.push(['', 'The enemy army lives on what its carts carry. Burn the carts and this campaign of theirs is over.']); return; }
  // hostages (n>=6): two or three prisoners under guard; a guard who is struck and survives hurts its prisoner on the
  // enemy's turn (never fatally), so who to strike first matters
  if (kind === 'hostages') { if (n < 6) return; const ES = st.eSlots || []; const picks = [ES[Math.floor(ES.length * 0.3)], ES[Math.floor(ES.length * 0.6)], ES[Math.floor(ES.length * 0.9)]].filter(Boolean); let made = 0, first = null;
    for (const at0 of picks.slice(0, 2 + rng.int(0, 1))) { const sp = freeTiles(st, at0, 2, 3); if (sp.length < 2) continue;
      const c = spawn(st, POOL ? poolPick(rng, c2 => !c2.monster && !c2.dancer, false) : 'Fighter', 'neutral', Math.max(1, n - 1), sp[0], { role: 'prisoner', captive: true }); c.hp = Math.ceil(c.maxhp * 0.7);
      const g = spawn(st, POOL ? poolPick(rng, c2 => !c2.healer && !c2.monster, false) : 'Fighter', 'enemy', Math.max(1, enemyLevel(camp, n)), sp[1], { hostageOf: c.id }); g.ai = 'hold'; g._hp0 = g.hp; made++; first = first || c; }
    if (!made) return; st.captive = first.id; st.hostages = true; st.goal = 'rescue'; st.goalText = `Free the hostages, starting with ${first.name}`;
    st.intro.push(['', `The enemy holds ${made} prisoners here. Each has a guard with orders: if the guard is attacked, the prisoner pays for it.`]); return; }
  // hold the banners (n>=6): three banners across the middle; holding all three at the start of two army turns in a row wins
  if (kind === 'banners') { if (n < 6) return; const E0 = (st.eSlots || [])[0]; if (!E0) return; const pts = [];
    for (const f of [0.35, 0.5, 0.65]) { const cx = Math.round(P0[0] + (E0[0] - P0[0]) * f), cy = Math.round(P0[1] + (E0[1] - P0[1]) * f), side = pts.length === 1 ? 0 : pts.length ? 4 : -4;
      const sp = freeTiles(st, [Math.max(0, Math.min(st.map.w - 1, cx + (Math.abs(E0[1] - P0[1]) > Math.abs(E0[0] - P0[0]) ? side : 0))), Math.max(0, Math.min(st.map.h - 1, cy + (Math.abs(E0[1] - P0[1]) > Math.abs(E0[0] - P0[0]) ? 0 : side)))], 1, 5)[0]; if (sp && !pts.some(p => p[0] === sp[0] && p[1] === sp[1])) pts.push(sp); }
    if (pts.length < 3) return; st.banners = pts.map(([x, y]) => ({ x, y, kind: 'banner', owner: null })); st.markers.push(...st.banners); st.bannerHeld = 0; st.bannerLost = 0; st.goal = 'banners';
    st.goalText = 'Hold all three banners at the start of two turns'; st.intro.push(['', 'Three banners stand across this field. Whoever holds all three holds the ground, and the enemy knows it as well as we do.']); return; }
  // prison break (n>=6): the army starts with its weapons locked in an armory across the field; whoever reaches it takes
  // them back; the guards notice on turn 3
  if (kind === 'jailbreak') { if (n < 6) return; const E0 = (st.eSlots || [])[0]; if (!E0) return; const ax = Math.round(P0[0] + (E0[0] - P0[0]) * 0.4), ay = Math.round(P0[1] + (E0[1] - P0[1]) * 0.4), ar = freeTiles(st, [ax, ay], 1, 4)[0]; if (!ar) return;
    st.jailbreak = { armory: ar, wake: 4 }; st.markers.push({ x: ar[0], y: ar[1], kind: 'armory' });
    for (const u of st.units) if (u.team === 'player' && !u.leader && weaponsOf(u).length) { u._stash = u.items.filter(it => WEAPONS[it.id] && !WEAPONS[it.id].heal && !WEAPONS[it.id].refresh); u.items = u.items.filter(it => !u._stash.includes(it)); equipBest(u); }
    for (const u of st.units) if (u.team === 'enemy' && !u.boss) { u._wasAi = u.ai; u.ai = 'hold'; }
    st.intro.push(['', "The army wakes in the enemy's cells with nothing in its hands. Only the lord kept a hidden blade; everyone else's weapons are piled in an armory across the yard, and the guards have not noticed yet."]); return; }
  // the maze (n>=8): a maze carved into the open ground between the armies, corridors one square wide with dead ends,
  // fogged; a wall goes only on open ground and only while the two armies can still reach each other (stillWinnable)
  if (kind === 'maze') { if (n < 8) return; const E0 = (st.eSlots || [])[0]; if (!E0) return; const MW = st.map.w, MH = st.map.h;
    const vertical = Math.abs(E0[1] - P0[1]) >= Math.abs(E0[0] - P0[0]); const lo = vertical ? Math.min(P0[1], E0[1]) + 3 : Math.min(P0[0], E0[0]) + 3, hi = vertical ? Math.max(P0[1], E0[1]) - 3 : Math.max(P0[0], E0[0]) - 3;
    if (hi - lo < 5) return; const x0 = vertical ? 0 : lo, x1 = vertical ? MW - 1 : hi, y0 = vertical ? lo : 0, y1 = vertical ? hi : MH - 1;
    // a perfect maze on the odd squares of the region (recursive backtracker); everything not carved is a wall candidate
    const cw = Math.floor((x1 - x0) / 2), ch = Math.floor((y1 - y0) / 2); if (cw < 2 || ch < 2) return; const open = new Set(), seen = new Set(), stack = [[0, 0]]; seen.add('0,0');
    const sq = (cx, cy) => [x0 + 1 + cx * 2, y0 + 1 + cy * 2]; open.add(sq(0, 0).join(','));
    while (stack.length) { const [cx, cy] = stack[stack.length - 1]; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy]).filter(([a, b]) => a >= 0 && b >= 0 && a < cw && b < ch && !seen.has(a + ',' + b));
      if (!nb.length) { stack.pop(); continue; } const [nx, ny] = nb[rng.int(0, nb.length - 1)]; seen.add(nx + ',' + ny); const [ax, ay] = sq(cx, cy), [bx, by] = sq(nx, ny); open.add(bx + ',' + by); open.add(((ax + bx) / 2) + ',' + ((ay + by) / 2)); stack.push([nx, ny]); }
    const foot = st.units.find(u => u.team === 'player' && !CLASSES[u.cls].flier) || st.units.find(u => u.team === 'player'); let walls = 0; st.mazeWalls = []; const orig = {}, origCell = {};
    const indoor = !isOutdoor(st), wallT = indoor ? 0x1A : 0x0D, ent0 = st.map.entry, tile = ent0 && (ent0.ds || ent0.src === 'snes') ? null : (tileFor(ent0, wallT) ?? (indoor ? null : tileFor(ent0, 0x0C)));   // outdoors with no thicket tile: the tileset's forest tile, kept impassable as dense forest   // DS and SNES maps draw from their own art, so they keep the drawn walls
    if (tile !== null) st.map.entry = Object.assign({}, st.map.entry, { cells: st.map.entry.cells.slice() });     // this chapter's copy: the library map stays untouched
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (open.has(x + ',' + y) || !inb(x, y) || unitAt(st, x, y)) continue; const k = y * W + x, t = st.map.terr[k];
      if (!foot || moveCost(st, foot, x, y) >= 99 || t === T_THRONE || t === T_FORT || t === T_GATE || t === T_GATE2 || (st.chests || []).includes(k)) continue;
      st.map.terr[k] = wallT; if (stillWinnable(st) && allJoined(st, foot)) { st.mazeWalls.push(k); orig[k] = t; if (tile !== null) { origCell[k] = st.map.entry.cells[k]; st.map.entry.cells[k] = tile; } walls++; } else st.map.terr[k] = t; }
    const undo = k => { st.map.terr[k] = orig[k]; if (origCell[k] !== undefined) st.map.entry.cells[k] = origCell[k]; };
    if (walls < 12) { for (const k of st.mazeWalls) undo(k); st.mazeWalls = null; return; }
    // braid it: open about a quarter of the walls again so there are loops, not only long dead ends (no fog: in fog the
    // army only hunts what it can see, and in a maze that is nobody, so the battle stalls)
    st.mazeWalls = st.mazeWalls.filter(k => { if (rng.chance(25)) { undo(k); return false; } return true; }); st.mazeDrawn = tile === null; st.mazeIndoor = !isOutdoor(st); st.intro.push(['', st.mazeIndoor ? 'The halls here twist back on themselves, and every corridor looks like the last. The enemy is somewhere in the middle of them.' : 'A hedge maze, grown wild and taller than a rider, stands between the two armies. There is a way through; finding it is another matter.']); return; }
  // the treasure race (n>=5, maps with at least two chests): a rival band of treasure hunters goes for the chests
  if (kind === 'treasure') { if (n < 5 || (st.chests || []).length < 2) return; const E0 = (st.eSlots || [])[Math.floor((st.eSlots || []).length / 2)]; if (!E0) return; const sp = freeTiles(st, E0, 3, 5); if (sp.length < 2) return;
    const band = uniqueName(camp, rng); for (const at of sp.slice(0, 3)) { const t = spawn(st, POOL ? poolPick(rng, c => /thief|rogue/i.test(c.name || ''), false) || poolPick(rng, c => !c.monster, false) : 'Thief', 'other', Math.max(1, n), at, { role: 'stealer', axis: true }); t.ai = 'pursue'; }
    st.treasure = { band }; st.intro.push(['', `${band}'s treasure hunters have heard about the chests in these ruins too. Whatever they reach first is gone.`]); return; }
  if (kind === 'escape') { st.exitGoal = exit; st.markers.push({ x: exit[0], y: exit[1], kind: 'exit' }); }
  if (kind === 'rescue') { const E0 = (st.eSlots || [])[0] || exit; if (!E0) return; const spot = freeTiles(st, E0, 1, 4)[0]; if (!spot) return;
    const c = spawn(st, POOL ? poolPick(rng, c2 => !c2.monster && !c2.dancer, false) : 'Fighter', 'neutral', Math.max(1, n - 1), spot, { role: 'prisoner', captive: true }); c.hp = Math.ceil(c.maxhp / 2); st.captive = c.id; st.markers.push({ x: c.x, y: c.y, kind: 'captive' }); }
  if (kind === 'escort') { const spot = freeTiles(st, P0, 1, 3)[0]; if (!spot) return; const e = spawn(st, POOL ? poolPick(rng, c2 => !c2.promoted && !c2.monster && c2.mov <= 6, false) : 'Recruit', 'neutral', Math.max(5, n), spot, { role: 'escort', hunted: true }); e.maxhp += 8; e.hp = e.maxhp; e.def += 3;
    st.escortee = e.id; st.exitGoal = exit; st.markers.push({ x: exit[0], y: exit[1], kind: 'exit' }); }
  if (kind === 'flee') { const far = farEdge(st, [boss.x, boss.y]); if (!far) return; boss.fleeing = true; boss.ai = 'pursue'; st.fleeExit = far; st.markers.push({ x: far[0], y: far[1], kind: 'exit' }); }
  st.goal = kind === 'flee' ? 'flee' : kind;
  const who = st.units.find(o => o.id === (st.captive || st.escortee)), f = facts(camp, st, { name: who ? who.name : '', commander: boss ? boss.name : '', turns: st.defendTurns || 0, point: st.map.terr && st.defendTile && st.map.terr[st.defendTile[1] * W + st.defendTile[0]] === T_FORT ? 'fort' : st.defendTile && st.map.terr[st.defendTile[1] * W + st.defendTile[0]] === T_THRONE ? 'throne' : 'gate' });
  st.goalText = DEFEND_TEXT[kind].replace('{n}', st.defendTurns || 0).replace('{name}', who ? who.name : '').replace('{commander}', boss ? boss.name : 'the commander').replace('{point}', f.point === 'gate' && kind === 'defend' && st.defendTile && st.defendTile[0] === P0[0] && st.defendTile[1] === P0[1] ? 'camp' : f.point);
  if (kind === 'defend' && st.defendTile[0] === P0[0] && st.defendTile[1] === P0[1]) f.point = 'camp';
  // the briefing replaces the old one, and the people involved speak
  const nb = STORY.pick(camp, 'mvb' + kind, MV['brief_' + (kind === 'flee' ? 'flee' : kind)], rng, f), bi = st.intro.findIndex(([s, l]) => s === '' && l === st.briefLine);
  const nb2 = st.toneSW ? st.toneSW + ' ' + nb : nb; if (bi >= 0) st.intro[bi] = ['', nb2]; else st.intro.push(['', nb2]); st.briefLine = nb2;
  if (kind === 'escort' && who) st.intro.push([who.name, STORY.pick(camp, 'mvesc', MV.escort_l, rng, f)]);
  if (kind === 'flee') st.intro.push([boss.name, STORY.pick(camp, 'mvfl', MV.flee_l, rng, f)]);
  if (kind === 'rescue' && who) st.intro.push([who.name, STORY.pick(camp, 'mvcap', MV.captive_l, rng, f)]);
}
// hazards: a spreading forest fire, and snow that slows every ground unit
// the squall: a band of storm three columns wide, moving one column a turn across the map
function inSquall(st, x, y) { const q = st.squall; return !!q && x >= q.x && x < q.x + q.w; }
// the rift: a crack across the middle of the map, perpendicular to the line between the armies; ground units cannot
// cross (terrain 0x15, which fliers can); never where it would leave the chapter unwinnable; cave-ins use the same ground
function chasmAt(st, k) { if (unitAt(st, k % W, Math.floor(k / W))) return false; const was = st.map.terr[k]; st.map.terr[k] = 0x15; if (stillWinnable(st)) { (st.chasm = st.chasm || []).push(k); return true; } st.map.terr[k] = was; return false; }
function carveRift(st, rng) { const P = st.units.filter(u => u.team === 'player' && u.hp > 0), E2 = st.units.filter(u => u.team === 'enemy' && u.hp > 0); if (!P.length || !E2.length) return 0;
  const px = P.reduce((a, u) => a + u.x, 0) / P.length, py = P.reduce((a, u) => a + u.y, 0) / P.length, ex = E2.reduce((a, u) => a + u.x, 0) / E2.length, ey = E2.reduce((a, u) => a + u.y, 0) / E2.length;
  const vertical = Math.abs(ex - px) > Math.abs(ey - py); let made = 0, off = Math.round(vertical ? (px + ex) / 2 : (py + ey) / 2);
  const len = vertical ? st.map.h : st.map.w; for (let i = 0; i < len; i++) { if (i % 3 === 0) off += rng.int(-1, 1); const x = vertical ? off : i, y = vertical ? i : off; if (!inb(x, y)) continue; if (chasmAt(st, y * W + x)) made++; }
  return made; }
function placeTraps(st, rng) { st.traps = new Set(); st.trapsShown = new Set(); const P = st.units.filter(u => u.team === 'player'); let t = 0;
  while (st.traps.size < 6 && t++ < 400) { const x = rng.int(0, st.map.w - 1), y = rng.int(0, st.map.h - 1), k = y * W + x; if (unitAt(st, x, y) || st.map.terr[k] === 0x15 || P.some(u => Math.abs(u.x - x) + Math.abs(u.y - y) < 4)) continue; const probe = P[0]; if (probe && moveCost(st, probe, x, y) >= 99) continue; st.traps.add(k); } }
// dragon flyover: the row or column with the most units is marked; at the next army phase the dragon breathes along it
function markDragon(st) { let best = null, bc = -1;
  for (let y = 0; y < st.map.h; y++) { const c = st.units.filter(u => u.hp > 0 && u.x >= 0 && u.y === y).length; if (c > bc) { bc = c; best = ['row', y]; } }
  for (let x = 0; x < st.map.w; x++) { const c = st.units.filter(u => u.hp > 0 && u.x >= 0 && u.x === x).length; if (c > bc) { bc = c; best = ['col', x]; } }
  const keys = new Set(); if (best[0] === 'row') for (let x = 0; x < st.map.w; x++) keys.add(best[1] * W + x); else for (let y = 0; y < st.map.h; y++) keys.add(y * W + best[1]);
  st.dragon.warn = keys; st.dragon.at = st.turn + 1; }
// cursed ground: three dark patches that drain, two blessed spots that heal, away from where the army starts
function makeCurse(st, rng) { st.curse = new Set(); st.bless = new Set(); const P = st.units.filter(u => u.team === 'player');
  const far = (x, y) => !P.some(u => Math.abs(u.x - x) + Math.abs(u.y - y) < 4);
  for (let i = 0; i < 5; i++) { let cx = 0, cy = 0, t = 0; do { cx = rng.int(1, st.map.w - 2); cy = rng.int(1, st.map.h - 2); t++; } while (!far(cx, cy) && t < 40);
    const r = i < 3 ? 2 : 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= st.map.w || y >= st.map.h || Math.abs(dx) + Math.abs(dy) > r) continue; (i < 3 ? st.curse : st.bless).add(y * W + x); } } }
function tickHazards(st, team, heals) {
  // rain of arrows: a 3x3 area around one of the army's units is marked, then struck at the next army phase (up to 6, never lethal)
  if (team === 'player' && st.volley) { const V = st.volley;
    if (V.warn && st.turn >= V.at) { for (const u of st.units) { if (u.hp <= 0 || u.x < 0 || u.team === 'enemy' || !V.warn.has(u.y * W + u.x)) continue; const a = Math.min(6, u.hp - 1); if (a > 0) { u.hp -= a; heals.push({ id: u.id, amount: -a, fire: true }); } }
      V.warn = null; V.next = st.turn + 2; (st.eventLines = st.eventLines || []).push(['', 'Arrows fall out of the sky onto the marked ground.']); }
    if (!V.warn && st.turn >= V.next) { const P = st.units.filter(u => u.team === 'player' && u.hp > 0 && u.x >= 0); if (P.length) { const c = st.rng.pick(P); V.warn = new Set(); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inb(c.x + dx, c.y + dy)) V.warn.add((c.y + dy) * W + c.x + dx); V.at = st.turn + 1; } } }
  if (st.squall && team === 'player') { st.squall.x += st.squall.dir; if (st.squall.x > st.map.w || st.squall.x < -st.squall.w) { st.squall = null; (st.eventLines = st.eventLines || []).push(['', 'The squall blows itself out past the edge of the field.']); } }
  if (st.traps && st.traps.size) for (const u of st.units) { if (u.team !== team || u.hp <= 0 || u.x < 0 || !/thief|rogue|assassin/i.test(className(u))) continue; for (const k of st.traps) if (!st.trapsShown.has(k) && Math.abs(k % W - u.x) + Math.abs(Math.floor(k / W) - u.y) <= 3) st.trapsShown.add(k); }
  if (st.beast && team === 'player' && st.turn >= 3 && (st.chasm || []).length < 10) { const b = st.units.find(u => u.beast && u.hp > 0); let k2 = 0;
    for (let t = 0; t < 30 && k2 < 2; t++) { const x = st.rng.int(0, st.map.w - 1), y = st.rng.int(0, st.map.h - 1); if (b && Math.abs(x - b.x) + Math.abs(y - b.y) < 3) continue; if (st.map.terr[y * W + x] === 0x15) continue; if (chasmAt(st, y * W + x)) k2++; }
    if (k2) (st.eventLines = st.eventLines || []).push(['', 'Part of the lair floor gives way into the dark below.']); }
  if (team === 'player' && st.dawn && st.turn >= st.dawn && st.fog) { st.fog = false; st.night = false; st.dawn = null; (st.eventLines = st.eventLines || []).push(['', `Dawn breaks over ${st.place}. The dark lifts, and both armies can finally see each other.`]); }
  if (st.curse && team !== 'neutral') for (const u of st.units) { if (u.team !== team || u.hp <= 0 || u.x < 0) continue; const k = u.y * W + u.x;
    if (st.curse.has(k)) { const a = Math.min(3, u.hp - 1); if (a > 0) { u.hp -= a; heals.push({ id: u.id, amount: -a, curse: true }); } }
    else if (st.bless.has(k) && u.hp < u.maxhp) { const h = Math.min(5, u.maxhp - u.hp); u.hp += h; heals.push({ id: u.id, amount: h, bless: true }); } }
  if (st.dragon && team === 'player' && st.dragon.warn && st.turn >= st.dragon.at) { for (const u of st.units) { if (u.hp <= 0 || u.x < 0) continue; const hit = [[0, 0], ...(u.big ? [[1, 0], [0, 1], [1, 1]] : [])].some(([dx, dy]) => st.dragon.warn.has((u.y + dy) * W + u.x + dx));
      if (hit) { const a = Math.min(8, u.hp - 1); if (a > 0) { u.hp -= a; heals.push({ id: u.id, amount: -a, fire: true }); } } }
    st.dragon.burnt = st.dragon.warn; st.dragon.warn = null; st.dragon.next = st.turn + 2; }
  if (st.dragon && team === 'player' && !st.dragon.warn && st.dragon.next && st.turn >= st.dragon.next) { markDragon(st); st.dragon.next = 0; (st.eventLines = st.eventLines || []).push(['', 'The dragon turns for another pass.']); }
  if (st.fire && team === 'player') { const rng = st.rng, next = new Map(st.fire);
    for (const [k, t] of st.fire) { if (t <= 1) { next.delete(k); st.map.terr[k] = 0x01; continue; } next.set(k, t - 1);
      for (const [dx, dy] of N4) { const x = k % W + dx, y = Math.floor(k / W) + dy; if (!inb(x, y)) continue; const nk = y * W + x; if (!next.has(nk) && (st.map.terr[nk] === 0x0C || st.map.terr[nk] === 0x0D) && rng.chance(35)) next.set(nk, 3); } }
    st.fire = next; }
  if (st.fire) for (const u of st.units) { if (u.team !== team || u.hp <= 0 || u.carriedBy) continue; if (st.fire.has(u.y * W + u.x)) { const a = Math.min(4, u.hp - 1); if (a > 0) { u.hp -= a; heals.push({ id: u.id, amount: -a, fire: true }); } } }
}
// a map is outdoors when most of it is open ground rather than floor, wall and pillar
const OUTDOOR_T = new Set([0x01, 0x02, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x15, 0x16, 0x26, 0x2F, 0x31]);
function isOutdoor(st) { if (!st.map.terr) return true; let o = 0; for (const t of st.map.terr) if (OUTDOOR_T.has(t)) o++; return o > st.map.terr.length * 0.5; }
function scheduleMapEvents(camp, st, rng, n) {
  const forests = [], doors = []; for (let i = 0; i < W * H; i++) { const t = st.map.terr ? st.map.terr[i] : -1; if (t === 0x0C || t === 0x0D) forests.push(i); if (t === 0x1E) doors.push(i); }
  const outdoor = isOutdoor(st); st.outdoor = outdoor;
  const cursedFit = /barrow|tomb|crypt|ruin|temple|shrine|chapel|grave|abbey|catacomb|haunt|curse|old|sanct|altar|cairn/i.test(st.place || '') || /curse|plague|undead|dark|shadow|grave|dead|ruin/i.test(JSON.stringify((camp.story && [camp.story.motive, camp.story.villainWant]) || ''));
  const opts = [['squall', 4, outdoor && n >= 5], ['rift', 3, n >= 8], ['traps', 4, n >= 5], ['eclipse', 4, n >= 6], ['dragon', 4, outdoor && n >= 8], ['graveyard', 4, n >= 7], ['cursed', 5, n >= 5 && cursedFit], ['fire', 6, forests.length > 10 && outdoor && n >= 4], ['snow', 5, outdoor && n >= 3], ['ambush', 7, n >= 3], ['door', 7, doors.length > 0 && n >= 3], ['thief', 7, (st.chests || []).some(v => st.map.terr[v] === 0x21) && n >= 2]].filter(o => o[2]);
  if (!opts.length || !rng.chance(n <= 3 ? 25 : 40)) return;
  const tot = opts.reduce((a, o) => a + o[1], 0); let r = rng.int(1, tot), i = 0; while (r > opts[i][1]) r -= opts[i++][1];
  st.mapEvent = { kind: opts[i][0], turn: opts[i][0] === 'thief' ? 1 : rng.int(2, 4), forests, doors };
}
function fireMapEvent(st) {
  const ev = st.mapEvent, camp = st._camp; if (!ev || ev.done || ev.turn !== st.turn || !camp) return [];
  ev.done = true; const rng = camp.rng, n = st.chapter, lv = Math.max(1, Math.min(20, Math.round(1 + n * 0.7))), lines = [], lord = st.units.find(u => u.leader);
  const pick = f => POOL ? poolPick(rng, f, n >= 12 && rng.chance(25)) : 'Fighter';
  if (ev.kind === 'fire') { const far = ev.forests.filter(k => !st.units.some(u => u.team === 'player' && Math.abs(u.x - k % W) + Math.abs(u.y - Math.floor(k / W)) < 5)); if (!far.length) return [];
    st.fire = new Map([[rng.pick(far), 3]]); lines.push(['', mvLine(st, 'fire_n')]); }
  if (ev.kind === 'snow') { st.snow = true; lines.push(['', mvLine(st, 'snow_n')]); }
  if (ev.kind === 'squall') { const fromW = rng.chance(50); st.squall = { x: fromW ? 0 : st.map.w - 3, dir: fromW ? 1 : -1, w: 3 }; lines.push(['', `A squall rolls in from the ${fromW ? 'west' : 'east'}. Wherever it passes, rain blinds the archers and the mud slows everyone.`]); }
  if (ev.kind === 'rift') { const made = carveRift(st, rng); if (made) lines.push(['', 'The ground splits with a sound like thunder. A chasm opens across the field, and only fliers can cross it now.']); }
  if (ev.kind === 'traps') { placeTraps(st, rng); lines.push(['', 'Old snares lie hidden in this ground. Whoever steps on one will know it.']); }
  if (ev.kind === 'eclipse') { st.eclipse = st.turn + 2; lines.push(['', 'The moon slides across the sun. For three turns every spell burns twice as hot.']); }
  if (ev.kind === 'dragon') { st.dragon = { warn: null, at: 0 }; markDragon(st); lines.push(['', 'A dragon circles over the field. Its shadow marks where the fire will fall next turn.']); }
  if (ev.kind === 'graveyard') { st.graveyard = true; st.graveQueue = []; lines.push(['', 'This is old burial ground. Whoever falls here will not stay down for long.']); }
  if (ev.kind === 'cursed') { makeCurse(st, rng); lines.push(['', 'Dark stains spread over the ground and drain whoever stands in them; a few old shrines still keep their blessing.']); }
  if (ev.kind === 'ambush') { const back = (st.pSlots || []).slice(-1)[0] || [lord.x, lord.y]; const spots = freeTiles(st, back, 3, 5).filter(([x, y]) => !st.units.some(u => u.team === 'player' && Math.abs(u.x - x) + Math.abs(u.y - y) < 2));
    for (const at of spots.slice(0, 2 + rng.int(0, 1))) spawn(st, pick(c => !c.healer && !c.dancer), 'enemy', lv, at, { ai: 'pursue' });
    if (spots.length) { lines.push(['', mvLine(st, 'ambush_n')]); lines.push([lord.name, mvLine(st, 'ambush_l')]); } }
  if (ev.kind === 'door') { let k = 0; for (const d of ev.doors.slice(0, 2)) { openDoor(st, d); const spot = freeTiles(st, [d % W, Math.floor(d / W)], 1, 2)[0]; if (spot) { spawn(st, pick(c => !c.healer), 'enemy', lv, spot, { ai: 'pursue' }); k++; } } if (k) lines.push(['', mvLine(st, 'door_n')]); }
  if (ev.kind === 'thief') { const E0 = (st.eSlots || [])[0]; if (!E0) return []; const spot = freeTiles(st, E0, 1, 4)[0]; if (!spot) return [];
    const t = spawn(st, pick(c => /thief|rogue/i.test(c.name || '')) , 'enemy', lv, spot, { role: 'stealer' }); lines.push(['', mvLine(st, 'thief_n')]); lines.push([t.name, mvLine(st, 'thief_l')]); }
  return lines;
}
// an enemy thief makes for a chest, takes what is inside, then runs for the edge; a fleeing commander runs for its exit
function planRunner(st, u) {
  let goal = null, act = 'wait';
  if (u.role === 'stealer' && !u.stole) { const live = (st.chests || []).filter(v => st.map.terr[v] === 0x21); if (!live.length) { u.stole = true; } else { const v = live.sort((a, b) => (Math.abs(a % W - u.x) + Math.abs(Math.floor(a / W) - u.y)) - (Math.abs(b % W - u.x) + Math.abs(Math.floor(b / W) - u.y)))[0]; goal = [v % W, Math.floor(v / W)]; act = 'steal'; } }
  if (u.role === 'stealer' && u.stole) { goal = u.escapeTo || (u.escapeTo = farEdge(st, [u.x, u.y]) || [0, 0]); act = 'flee'; }
  if (u.fleeing) { goal = st.fleeExit; act = 'flee'; }
  if (!goal) return null;
  const dist = reach(st, u), fd = field(st, u, goal[0], goal[1]); let best = [u.x, u.y], bd = fd.get(u.y * W + u.x) ?? 1e9;
  for (const k of dist.keys()) { const o = unitAt(st, k % W, Math.floor(k / W)); if (o && o !== u) continue; const d = fd.get(k); if (d !== undefined && d < bd) { bd = d; best = [k % W, Math.floor(k / W)]; } }
  return { type: bd === 0 ? act : 'wait', path: pathTo(dist, best[0], best[1]) };
}

// ---------------------------------------------------------------- PROGRESSION: bonus EXP, stat boosters, welcomes, the final act and epilogues
const BOOSTERS = { seraph_robe: ['maxhp', 7, 'HP'], energy_ring: ['str', 2, 'Str'], spirit_dust: ['mag', 2, 'Mag'], secret_book: ['skl', 2, 'Skl'], speedwings: ['spd', 2, 'Spd'], goddess_icon: ['lck', 2, 'Lck'], dragonshield: ['def', 2, 'Def'], talisman: ['res', 2, 'Res'] };
const PR = {
  welcome: ['Welcome, {name}. We will be glad of you.', 'Then you march with us, {name}. Stay close at first.', 'Good. We need everyone who still believes this war can be won.', 'Glad to have you, {name}. Ask anyone here if you need anything.', 'Then welcome to the army, {name}. It is smaller than it should be, but it is good.', 'I will not promise it is safe. I can promise you will not fight alone.', 'You are one of us now, {name}.', 'We have room in the line. Take your place.', "Stay near me for the first few battles, {name}. You will learn fast.", "We are glad of every sword, {name}. Yours more than most.", "Rest tonight, {name}. Tomorrow we march.", "There is a place by the fire for you, {name}.", "Then fight beside us, {name}, and we will fight beside you.", "Welcome. Find the quartermaster and get yourself a proper weapon.", "I am glad you found us, {name}.", "The army is stronger for you, {name}. Thank you.", "Keep your head down at first, {name}. The rest will come.", "Good. Tell me about yourself on the march.", "We have all lost something to this war, {name}. Let us win it together.", "You are welcome here, {name}, for as long as you want to stay.", "Then let us give {faction} one more reason to fear us.", "Stand with us, {name}. That is all I ask.", "Pick a place in the line and hold it. Welcome.", "Every one of us started where you are, {name}."],
  final_brief: ['This is the end of the road. {vtitle} {villain} waits at {place}, and with {villain} the whole war.', 'Every battle has led here. {vtitle} {villain} holds {place} with what is left of {faction}.'],
  final_villain: ['So the little army from {home} made it all this way. It ends here, {lord}.', '{relic} is mine. You are only the last thing standing between us.', 'I built {faction} from nothing. I will not watch a child of {home} tear it down.'],
  final_won: ['{villain} is dead. {faction} breaks apart within days, and {relic} is safe at last.', 'With {villain} fallen, the war is over. The soldiers of {faction} lay down their arms across the land.'],
  new_book: ['Peace lasts a season. Then word comes from the far border: a new power is rising, and it wants {relic} too.', 'The army barely has time to rest. A new enemy has crossed the border, and the chronicle goes on.'],
  epi: {
    lord: ['{name} returned to {home} and spent the rest of a long life rebuilding it.', '{name} refused a crown and took a seat on the council instead. {home} was better for it.', "{name} kept the peace for thirty years, and the chronicle of the war was read aloud at {home} every spring.", "{name} rode the length of the realm after the war, thanking every village that had sheltered the army.", "{name} married late, ruled gently, and was buried beside the fallen of the war."],
    knight: ['{name} took command of the new guard at {home} and drilled them for twenty years.', '{name} hung up the armour, but people still asked {name} to stand at the gate on festival days.', "{name} escorted pilgrims along the old roads, and no band of brigands dared trouble them.", "{name} became the realm\u2019s marshal, and was known for never sending soldiers anywhere {name} would not go.", "{name} returned to a family farm and kept a lance over the door, just in case."],
    mage: ['{name} opened a school of magic in the old capital. Its first students came from the villages the war had burned.', '{name} spent years studying {relic}, and wrote the only honest account of it.', "{name} catalogued every spell used in the war so no one would have to rediscover them.", "{name} advised the new council on matters of magic, and lost every argument about the budget.", "{name} vanished into the archives of {home}, and emerged years later with a book nobody understood."],
    healer: ['{name} founded a hospital in a town the war had passed through, and kept it open through two plagues.', '{name} travelled the border villages for the rest of their days, healing anyone who asked.', "{name} trained a generation of healers, and asked each of them to remember the war.", "{name} kept a small chapel on the road home, its doors open day and night.", "{name} tended the wounded of both armies after the war, and was thanked by neither and loved by many."],
    thief: ['{name} disappeared the morning after the victory feast, along with most of the silverware.', '{name} became a respectable merchant. Nobody asked where the starting money came from.', "{name} returned every stolen thing, one at a time, over many years. Mostly.", "{name} ran the best inn on the trade road, and somehow always knew the news first.", "{name} was offered a royal pardon, laughed, and took a royal job instead."],
    fighter: ['{name} went back to the hills and cut timber, and was happier than anyone expected.', '{name} became a blacksmith, and made the best axes anyone had ever seen.', "{name} won every strength contest at the harvest fair until nobody would compete.", "{name} built a mill on the river and fed half the valley through a hard winter.", "{name} raised a large family and told the war stories louder every year."],
    archer: ['{name} became a hunter in the northern woods and was rarely seen in town again.', '{name} trained the village militias in archery, and none of those villages was ever raided again.', "{name} won the royal archery tournament five years running, then retired from boredom.", "{name} kept watch over the border forests, and the raiders learned to avoid them.", "{name} taught children to shoot, and to know when not to."],
    flier: ['{name} carried messages across the realm for years, the fastest courier anyone had known.', '{name} flew home and never left the sky for long.', "{name} bred the finest mounts in the realm, and never sold one to anyone unkind.", "{name} mapped the mountains from the air, and the maps were still in use a century later.", "{name} led the royal skyguard for many years, then flew home one evening and stayed."],
    sword: ['{name} wandered the roads as a duellist, and was never beaten.', '{name} opened a fencing school, and turned away anyone who only wanted to learn to kill.', "{name} guarded the new council, and nobody ever saw {name} draw a blade in anger again.", "{name} travelled far beyond the realm, and sent back letters full of strange places.", "{name} retired to the mountains and practised one sword form every morning until the end."],
    other: ['{name} settled in a quiet village and was remembered there as a kind neighbour.', '{name} was last seen heading toward the sea, looking for whatever came next.', "{name} found work in the rebuilt capital and was content.", "{name} kept a journal of the war, which was found and treasured long after.", "{name} went home, and was the first to help whenever a neighbour needed it."],
  },
  pair: ['{a} and {b} were never apart for long after the war. They built a house together on the edge of {home}.', 'Everyone expected {a} and {b} to go their separate ways. Instead, they spent the rest of their lives side by side.', '{a} and {b} kept fighting for others long after the war, always together.'],
  memorial: ['A stone stands at {home} with the names of the fallen: {names}.', 'The army never forgot the ones it lost: {names}.'],
};
function epiKind(u) { const n = className(u).toLowerCase();
  if (u.leader) return 'lord'; if (/knight|general|paladin|cavalier|great/.test(n)) return 'knight'; if (/mage|sage|shaman|druid|summoner|sorcer|monk/.test(n)) return 'mage';
  if (/cleric|priest|troubadour|bishop|valkyrie|saint/.test(n)) return 'healer'; if (/thief|rogue|assassin/.test(n)) return 'thief'; if (/fighter|warrior|brigand|pirate|berserker|axe/.test(n)) return 'fighter';
  if (/archer|sniper|ranger|nomad|hunter/.test(n)) return 'archer'; if (CLASSES[u.cls].flier) return 'flier'; if (/myrmidon|swordmaster|mercenary|hero/.test(n)) return 'sword'; return 'other'; }
function epilogue(camp) {
  const rng = camp.rng, f = facts(camp, null), lines = [];
  const pairs = Object.entries(camp.supports || {}).filter(([, p]) => rankOf(p) >= 3).sort((x, y) => y[1] - x[1]).map(([k]) => k.split('-').map(Number)).map(([a, b]) => [camp.army.find(u => u.id === a), camp.army.find(u => u.id === b)]).filter(([a, b]) => a && b);
  const paired = new Set(); for (const [a, b] of pairs) { if (paired.has(a.id) || paired.has(b.id)) continue; paired.add(a.id); paired.add(b.id); lines.push(['', STORY.pick(camp, 'epipair', PR.pair, rng, Object.assign({}, f, { a: a.name, b: b.name }))]); }
  for (const u of camp.army) { if (paired.has(u.id)) continue; const k = epiKind(u); lines.push(['', STORY.pick(camp, 'epi' + k, PR.epi[k], rng, Object.assign({}, f, { name: u.name }))]); }
  const fallen = (camp.fallen || []).map(x => x.name); if (fallen.length) lines.push(['', STORY.pick(camp, 'epimem', PR.memorial, rng, Object.assign({}, f, { names: listJoin(fallen.slice(0, 12)) }))]);
  return lines;
}
function progression(camp, st, result, lines, rng) {
  if (result !== 'victory') return;
  // bonus EXP: more for quick clears and no losses, given to the units who are furthest behind
  const lost = st.units.filter(u => u.team === 'player' && u.hp <= 0).length; let pool = 60 + Math.max(0, 20 - st.turn) * 5 + (lost ? 0 : 50);
  const got = []; for (const u of camp.army.slice().sort((a, b) => a.level - b.level)) { if (pool < 15) break; const give = Math.min(30, pool); pool -= give; const r = gainExp(st, u, give); got.push(u.name + (r.levels.length ? ' (level up)' : '')); }
  if (got.length) lines.push(['', `Bonus EXP went to ${listJoin(got)}.`]);
  // stat boosters are used on the unit who gains most from them
  const carriers = [...camp.army.map(u => [u, u.items || []]), [null, camp.convoy || []]];
  for (const [holder, items] of carriers) for (const it of [...items]) { const b = BOOSTERS[it.id]; if (!b) continue;
    const score = u => (u.growth && u.growth[b[0] === 'maxhp' ? 'hp' : b[0]] || 30) + ((b[0] === 'str' && !WEAPONS[u.weapon].magic) || (b[0] === 'mag' && WEAPONS[u.weapon].magic) ? 25 : 0) + (u.leader ? 10 : 0);
    const best = camp.army.slice().sort((x, y) => score(y) - score(x))[0]; if (!best) continue;
    items.splice(items.indexOf(it), 1); best[b[0]] += b[1]; if (b[0] === 'maxhp') best.hp = best.maxhp; lines.push(['', `${best.name} used the ${WEAPONS[it.id].name}: ${b[2]} +${b[1]}.`]); }
}

// ---------------------------------------------------------------- PRESENTATION: briefing card, results card, battle commentary
const NARR = {
  crit_kill: ['{a} finds the gap in {b}\u2019s guard and ends it in one blow.', 'A single perfect strike from {a}, and {b} goes down.', '{a} does not waste the opening. {b} falls.'],
  close_call: ['{a} is still standing, barely, with {hp} HP left.', '{a} staggers but stays on their feet. That was too close.', 'Somehow {a} survives that. {hp} HP to spare.'],
  dual_kill: ['{a} and {c} finish {b} together.', '{c} steps in beside {a}, and between them {b} does not stand a chance.'],
  first_blood: ['{a} draws first blood at {place}.', 'The first enemy falls to {a}.'],
  boss_down: ['{b} falls, and the soldiers around {b} lose heart.', 'The commander is down. {a} struck the final blow.'],
  big_level: ['{a} has grown stronger. Much stronger.', 'That fight taught {a} a great deal.'],
  streak: ['{a} has three enemies down already today.', 'Nobody wants to face {a} right now.'],
};
function narrate(camp, kind, f) { return STORY.pick(camp, 'nr' + kind, NARR[kind], camp.rng, Object.assign(facts(camp, null), f || {})); }
function briefing(camp, st) {
  const boss = st.units.find(u => u.boss && u.hp > 0), enemies = st.units.filter(u => u.team === 'enemy' && u.hp > 0).length, lines = [];
  lines.push(st.goalText);
  lines.push(`${enemies} enemies${boss ? `, led by ${st.bossTitle ? st.bossTitle + ' ' : ''}${boss.name} (${prose(className(boss))})` : ''}`);
  const terrain = st.outdoor === false ? 'Indoors' : 'Open ground'; const notes = [terrain];
  if (st.fog) notes.push('fog'); if (st.reinforce) notes.push('reinforcements expected'); if (st.major) notes.push('major battle'); if (st.final) notes.push('final battle');
  lines.push(notes.join(', '));
  return { title: `Chapter ${st.chapter}: ${st.title}`, lines };
}
function results(camp, st, result, summary) {
  const ours = st.units.filter(u => u.team === 'player'), mvp = ours.filter(u => u.hp > 0 || true).sort((a, b) => (b.chKills || 0) - (a.chKills || 0))[0];
  const defeated = st.units.filter(u => u.team === 'enemy' && u.hp <= 0 && !u.escaped).length;
  return { title: result === 'victory' ? 'Victory' : result === 'retreat' ? 'Retreat' : 'Defeat', lines: [
    `Turns: ${st.turn}   Enemies defeated: ${defeated}`,
    mvp && mvp.chKills ? `MVP: ${mvp.name}, ${mvp.chKills} defeated` : 'MVP: none this time',
    `Lost: ${summary.lost.length ? summary.lost.join(', ') : 'none'}`,
    `Joined: ${summary.recruits.length ? summary.recruits.join(', ') : 'none'}`,
    `New supports: ${st.quietSupports && st.quietSupports.length ? st.quietSupports.length : 0}   Gold: ${camp.gold || 0}`] };
}

// ---------------------------------------------------------------- WORLD MAP AND SKIRMISHES
const SK = {
  brief: ['Monsters have been seen on the road near {place}. Clearing them out will cost a day, and give the army some practice.', 'A band of brigands has made camp at {place}. Nobody is paying the army to deal with them, but somebody should.', 'Scouts report creatures prowling around {place}. Better to meet them now than in the dark.', 'The army takes a detour through {place} to train, and finds it is not empty.'],
  lord: ['A short fight, then back to the road.', 'Use this one to learn. Nobody take risks.', 'Clear them out. The villages here will thank us.', 'Stay sharp. Practice is still a fight.'],
};
function worldNode(camp, place, skirmish) {
  const w = camp.world || (camp.world = { nodes: [] }), rng = camp.rng, last = w.nodes.filter(x => !x.skirmish).slice(-1)[0];
  const x = last ? Math.min(0.94, last.x + (skirmish ? 0.02 : 0.06) + rng.int(0, 3) / 100) : 0.06, y = last ? Math.max(0.12, Math.min(0.88, last.y + (rng.int(0, 30) - 15) / 100)) : 0.5;
  if (w.nodes.length && x >= 0.94 && !skirmish) for (const nd of w.nodes) nd.x = Math.max(0.02, nd.x - 0.3);   // long campaigns scroll the map
  w.nodes.push({ name: place, x: skirmish ? x : x, y: skirmish ? Math.max(0.1, Math.min(0.9, y + (rng.chance(50) ? 0.12 : -0.12))) : y, chapter: camp.chapter, skirmish: !!skirmish, book: camp.story ? camp.story.book || 1 : 1 });
  if (w.nodes.length > 60) w.nodes.splice(0, w.nodes.length - 60);
}
// the army fights a skirmish when it is falling behind, or now and then by choice
function wantSkirmish(camp) {
  { const c = convOf(camp); if (c.on && (c.state === 'side' || c.state === 'reunite')) return false; }
  if (camp.ambushOffer && !camp.ambushOffer.fought) return true;   // the road ambush on an allied army marching to join the enemy
  const n = camp.chapter + 1; if (n < 4 || (n % 30) === 0 || camp.chapter - (camp.lastSkirmish ?? -9) < 2) return false;
  const eff = u => u.level + (CLASSES[u.cls] && CLASSES[u.cls].promoted ? 10 : 0), want = 1 + n * 0.7, have = camp.army.reduce((a, u) => a + eff(u), 0) / Math.max(1, camp.army.length);
  return have < want - 2 ? camp.rng.chance(35) : camp.rng.chance(5);
}

const TONES = {"grim": {"label": "A grim war", "rule": "Plain and tired. Say exactly what is wrong.", "intro": ["{land} has been at war for eleven years, and most people no longer remember why it started.", "In {country}, nobody can remember a harvest without soldiers on the roads."], "sit": [["time", "This war started before the youngest soldiers in this army were born."], ["ground", "The wheat fields at {place} have been burned twice this year."], ["time", "{country} has been fighting for eleven years."], ["ground", "The salt road runs through {place}, and both armies need salt to survive the winter."], ["people", "The grave diggers of {land} worked all winter and still could not keep up."], ["supply", "The army has not been paid since the last harvest."], ["supply", "The quartermaster keeps counting the arrows, and there are fewer each time."], ["people", "The village at {place} has no young men left. They all went to war."], ["ground", "{faction} took {place} last autumn and has held it ever since."], ["time", "The banners over {other} have changed hands twice this year."], ["supply", "Food has been cut to half rations, and then cut again."], ["people", "Most of the people following the army are widows now."], ["ground", "The bridge at {place} has been rebuilt and burned four times."], ["supply", "The smiths are melting down horseshoes to make arrowheads."]], "wrong": [["time", "The experienced soldiers are dead, and the new ones are barely old enough to shave."], ["ground", "Whoever controls the salt road decides who has food this winter."], ["supply", "Only eleven horses are left, and nine of them are lame."], ["people", "The villagers bury soldiers from both armies in the same field."], ["supply", "The supply wagons turned back at the river and never came."], ["time", "The order to hold this position came from a captain who died months ago."], ["ground", "The ground is thick mud here, and it slows everyone down."], ["people", "Two of the farms here have no one left to work them."], ["supply", "There are not enough boots, so the back ranks are marching with rags tied round their feet."], ["ground", "The only well for a day in any direction is behind the enemy line."], ["ground", "The enemy is dug in behind a ditch full of rainwater."], ["supply", "The water barrels are half empty, and the river is on the enemy side."], ["people", "The scouts sent out last night have not come back."], ["ground", "The ground between the two armies is wide open, and the enemy archers can hit anything on it."]], "task": [["ground", ["rout", "boss", "seize", "flee", "rescue", "escape"], "Clear the road, then count how many of us are still standing at the end of it."], ["supply", ["survive", "defend", "escort"], "Hold the river crossing until all the wagons are across."], ["people", ["rout", "boss"], "Clear the field. The wounded cannot be carried any further."], ["time", ["rout", "boss", "seize", "survive", "defend", "escape", "rescue", "escort", "flee"], "Win before dark. The last battle fought here at night cost forty lives."], ["time", ["rout", "boss", "flee"], "Break their line, and let the ones who run away go."], ["ground", ["seize", "rout"], "Take the mill without destroying it. People here need it to make flour."], ["supply", ["survive", "defend", "escort"], "Hold this ground until the supply column has passed, then follow it."], ["people", ["rescue", "escort"], "Get them out alive. Nothing else matters today."], ["ground", ["rout", "boss"], "Take the ridge and hold it until the wagons can climb up."], ["supply", ["seize", "rout"], "Take the storehouse before they burn the food inside."], ["time", ["rout", "boss", "seize", "survive", "defend", "escape", "rescue", "escort", "flee"], "Finish this before the rain turns the field to mud."]]}, "revenge": {"label": "A personal revenge", "rule": "Close and quiet. Say who did what, and who is being hunted.", "intro": ["When {country} was burned, {lord} learned the name of the one responsible, and has been hunting them ever since.", "This war is not about {land}. For {lord}, it is about paying back the people who destroyed home."], "sit": [["hunt", "The riders who burned the mill came this way. Their horses still had winter shoes on."], ["hunt", "Their tracks end at the river crossing below {place}."], ["name", "The dead captain wrote down the name of the one who gave the order."], ["shelter", "{country} let them through the border because they paid."], ["name", "This army keeps marching because one soldier will not give up the hunt."], ["shelter", "Nobody in {land} would open their door when we asked about them."], ["hunt", "Someone at {place} sold them fresh horses three days ago."], ["name", "{villain} signed the order to burn the village. The seal is still on the paper."], ["name", "The dying captain wrote three names. Two of them have now been crossed out."], ["hunt", "Their campfires at {place} are still warm."], ["shelter", "The people of {place} gave them food and a guide, and will not say which road they took."], ["hunt", "A burned saddle was found in a ditch outside {place}."], ["name", "A ring taken from the burned house turned up in a shop in {other}."], ["shelter", "The soldiers at {place} say they saw nobody, but they all say it in exactly the same words."]], "wrong": [["hunt", "They have been riding for two months, but their horses are in better shape than ours."], ["name", "The person on that list now commands a garrison, so they will be well guarded."], ["shelter", "The people hiding them will fight to protect them."], ["hunt", "They know they are being followed, and people who are afraid set traps."], ["name", "No one else in this army has a personal reason to be here."], ["shelter", "The shutters in this village have been nailed shut from the inside."], ["hunt", "The trail splits here, and both paths look fresh."], ["shelter", "{other} has offered them shelter, and {other} keeps its promises."], ["hunt", "They have had a whole day to prepare the river crossing."], ["name", "The person we want is not here, but some of the soldiers here know where they are."], ["shelter", "The village chief has a son riding with them."], ["hunt", "They paid a guide who knows these hills better than anyone in this army."], ["name", "There are more names on the list than there are days left before winter."], ["shelter", "{faction} has posted guards at every door the trail leads to."]], "task": [["hunt", ["rout", "boss", "flee"], "Block the road before they reach the fork above the river."], ["hunt", ["rout", "boss", "seize", "flee", "rescue"], "Win before their scout can reach the garrison and warn them."], ["name", ["boss", "flee"], "End it here. Behind them are walls we cannot climb."], ["shelter", ["seize", "rout", "rescue"], "Get past the soldiers standing in front of the gate."], ["name", ["boss", "flee", "rout"], "Defeat them, and close this chapter of the hunt."], ["shelter", ["survive", "defend", "escort"], "Hold this position. They will come to us, and we will be ready."], ["hunt", ["escape"], "Get past them. The real hunt is further down the road."], ["hunt", ["rout", "boss"], "Take their camp, and leave no one to carry a warning."], ["name", ["boss", "flee"], "Find the one who signed the order, and make sure it is the right person."], ["shelter", ["survive", "defend", "escort"], "Hold the road until the riders show themselves."], ["hunt", ["escape", "rescue"], "Get through quickly. The trail will be cold by tomorrow."]]}, "hopeful": {"label": "A hopeful time, with something wrong underneath", "rule": "Warm on the surface, with one worrying detail in each briefing.", "intro": ["{land} is rebuilding, and most days it feels as if the worst is over.", "The roads of {country} are open again, and people are glad to see soldiers who pay for their food."], "sit": [["road", "The road to {place} was cleared of rocks last month."], ["welcome", "The people of {place} sent bread and a cart to meet the army."], ["welcome", "{country} rebuilt every one of its bridges in a single season."], ["welcome", "There is paid work here, and a dry barn to sleep in."], ["buried", "The maps of {land} were redrawn last year, and the old ones were burned."], ["buried", "A farmer ploughing the orchard dug up old armour, and the field was left unplanted."], ["road", "The new milestones on the road to {place} still smell of fresh paint."], ["welcome", "Children followed the army out of {place}, asking questions about the horses."], ["welcome", "The innkeeper at {place} keeps a room ready for any soldier who needs one."], ["road", "There is a new well in every village between here and {place}."], ["welcome", "{other} sent seed grain across the border as a gift."], ["road", "Someone planted roses all along the road to {place}."], ["buried", "The church at {place} was rebuilt, but the old graveyard was left where it was."], ["welcome", "There was music in the square at {place} last night."]], "wrong": [["welcome", "The people here answer every question except who used to own the barn."], ["road", "The rocks from the road were piled into a pit and covered over."], ["buried", "There are forty new graves here, but no one remembers a battle."], ["buried", "The bell tower still has its rope, but the bell is gone."], ["road", "They rebuilt the bridges before they rebuilt the houses."], ["welcome", "They brought grain to the camp before anyone asked for it."], ["buried", "Every house in the village has a lock, and every lock is new."], ["road", "The road was cleared, but nobody can say who ordered it."], ["buried", "The new well was dug where the old gallows used to stand."], ["road", "The roses along the road were planted over a ditch that no one will talk about."], ["welcome", "The people are kind, but every one of them keeps watching the road behind us."], ["buried", "The gift of grain was counted, and one cart of it is missing."], ["road", "The road was paved with stones taken from a ruined fort."], ["welcome", "The music stopped when the army arrived, and started again when it left."]], "task": [["road", ["rout", "escape", "seize"], "Clear the road, and look in the pit on the way past."], ["welcome", ["rout", "boss"], "Win the battle, then ask about the barn."], ["buried", ["seize", "rout"], "Take the orchard before they hide whatever is buried there."], ["road", ["escape", "escort", "rescue"], "Get everyone over the bridge, and count them twice."], ["welcome", ["survive", "defend", "escort"], "Hold the barn until the carts are loaded."], ["buried", ["boss", "flee"], "Find the one giving the orders, and ask what is buried under the orchard."], ["road", ["rout", "seize"], "Clear the road, then ask about the ditch."], ["welcome", ["survive", "defend", "escort"], "Hold the town square until the market closes."], ["buried", ["rescue", "escort"], "Bring them out, and do not look in the cellars on the way."], ["road", ["rout", "boss", "seize", "survive", "defend", "escape", "rescue", "escort", "flee"], "Win, and try not to damage the roses."]]}, "unify": {"label": "A war to unite the land", "rule": "Formal but plain. Borders, taxes, promises of loyalty, food stores.", "intro": ["{land} used to be one kingdom. Now it is split into many small realms, and every border has a toll gate.", "{lord} wants to make {land} one kingdom again, one province at a time."], "sit": [["divided", "{land} has been split into separate realms for three generations."], ["border", "{country} still charges travellers a toll at the old border stones."], ["divided", "The lords here still obey a royal court that burned down forty years ago."], ["border", "{place} pays taxes to two different capitals, and says both are the rightful ruler."], ["turning", "Six villages have already sent promises of loyalty without being asked twice."], ["turning", "There are four messengers from other realms in the camp, and two of them are brothers."], ["border", "The old border at {place} is just a ditch now, but both sides still guard it."], ["turning", "{other} has sent a messenger, but he has not yet said what he wants."], ["border", "The toll gate at {place} charges travellers going in both directions."], ["divided", "{country} and {other} were one realm before their grandfathers fell out."], ["turning", "A lord from {other} has offered to discuss surrender, but only in writing."], ["divided", "The maps of {land} show seven different borders, and no two maps agree."], ["border", "The border stone at {place} has been moved twice in living memory."], ["turning", "The people guarding the food stores at {place} have already painted over the old crest."]], "wrong": [["divided", "The people here would rather keep a bad lord of their own than accept a good one from outside."], ["border", "The border follows a river that changed course in the last flood."], ["turning", "Their captains have not yet decided which side to join."], ["turning", "Every lord in this province is counting the dead on both sides before choosing."], ["divided", "Winning this battle takes a day. Holding the province will take ten years."], ["border", "The bridge behind us is the only way across the river for thirty miles."], ["divided", "{faction} pays the soldiers here in coins that {other} will not accept."], ["divided", "The lord of this province made an agreement with {faction} last spring."], ["border", "The only road crosses a river guarded by a lord who has not chosen a side."], ["turning", "The messengers will only sign if they see the battle won with their own eyes."], ["divided", "This province pays taxes to two rulers and resents both of them."], ["border", "The border soldiers are loyal to whoever paid them last."], ["turning", "Half the lords are waiting to see whether this army is stronger than {faction}."], ["divided", "The last army that tried to unite {land} was destroyed here."]], "task": [["turning", ["rout", "boss"], "Win this battle with as few deaths as you can. If you do, the next province may surrender without a fight."], ["border", ["survive", "defend", "escort"], "Hold the border stones until the messengers have signed."], ["divided", ["rout", "seize"], "Defeat their army, but do not touch their food stores. The people will need them."], ["turning", ["rout", "boss", "seize", "survive", "defend", "escape", "rescue", "escort", "flee"], "Win here. Six villages are watching to see who wins before they choose a side."], ["border", ["seize", "escape", "rescue"], "Clear the crossing, and do not destroy the bridge."], ["divided", ["boss", "flee"], "Capture their lord alive if you can. A lord who surrenders is worth more than ten who die."], ["border", ["seize", "rout"], "Take the toll gate and raise our banner over it."], ["turning", ["survive", "defend", "escort"], "Hold the line until the messengers arrive, so they can see it stand."], ["divided", ["boss", "flee"], "Defeat their lord, then offer them peace before the fighting is over."], ["border", ["escape", "escort", "rescue"], "Get the messenger across the border with the peace treaty safe."]]}, "succession": {"label": "A crisis over who should rule", "rule": "Cold and exact. Royal seals, tax records, rival claims to the throne.", "intro": ["The crown of {land} is locked in a box in a guarded room, and four different people claim it belongs to them.", "When the old ruler of {country} died, no heir was named. Ever since, everyone has been claiming the throne for themselves."], "sit": [["claim", "The king died in the night without naming who should rule after him."], ["claim", "{country} declared this morning that the younger daughter should be queen."], ["silence", "{other} has not chosen anyone to support, and keeps its army in the barracks."], ["claim", "There are four people claiming the throne, three armies, and only one crown."], ["silence", "{place} still sends its taxes to a treasury that no longer has anyone in charge."], ["proof", "The royal seal disappeared from the treasury on the night the king died."], ["claim", "{villain} has started wearing a crown, and nobody dares ask where it came from."], ["proof", "The record office at {place} holds the only copy of the old law about who inherits the throne."], ["proof", "The record office at {place} holds the only record of the old king’s marriage."], ["claim", "{other} has crowned a child and is ruling in the child’s name."], ["silence", "The soldiers at {place} have kept their barracks locked for a month."], ["claim", "{villain} has been seen wearing the dead ruler’s ring."], ["proof", "A sealed box was taken from the treasury on the night of the funeral."], ["silence", "The chief minister resigned, and took the official seal with him."]], "wrong": [["claim", "Whoever holds the capital by midwinter will be accepted as the rightful ruler."], ["proof", "The king’s will exists, and three different men claim to have read it."], ["silence", "Their soldiers swore loyalty to a king who is now dead."], ["claim", "Two different claimants sent riders to this camp in the same week."], ["proof", "The clerks ran away with the tax records, and those records decide who gets the crown."], ["silence", "The innkeepers here refuse to say any claimant’s name out loud."], ["proof", "The seal on the order is real, but the signature is a forgery."], ["claim", "Every lord who swears loyalty today will want people to forget it tomorrow."], ["proof", "The record office is guarded by soldiers who cannot read what they are guarding."], ["silence", "The garrison is still following orders from a ruler who is dead."], ["claim", "A third claimant has appeared, and nobody knows who is paying for their army."], ["proof", "Everyone who witnessed the king’s will is locked in the same prison."], ["silence", "Nobody in the city will say out loud which claimant they would support."], ["claim", "The capital will open its gates to whichever army arrives first."]], "task": [["claim", ["rout", "boss", "seize", "flee", "rescue"], "Win the battle before the second army arrives."], ["proof", ["survive", "defend", "escort"], "Hold this ground and let the clerks finish counting."], ["silence", ["rout", "boss", "seize", "survive", "defend", "escape", "rescue", "escort", "flee"], "Win without making a show of it. A loud victory will frighten the lords who have not chosen a side yet."], ["claim", ["rout", "boss"], "Defeat them here, and this whole province will declare for us within a month."], ["proof", ["seize", "rescue", "rout"], "Capture the tax records before anyone burns them."], ["claim", ["escape", "escort"], "Get our claimant out safely. Nobody can argue for the throne from a prison cell."], ["proof", ["seize", "rescue"], "Take the record office with the records still intact."], ["claim", ["boss", "flee"], "Defeat the false claimant before the coronation bells ring."], ["silence", ["survive", "defend", "escort"], "Hold the gate, and let the lords inside make their choice in their own time."], ["claim", ["rout"], "Defeat their army before their claimant reaches the capital."]]}, "after": {"label": "After the war", "rule": "Everything is already lost. Fighting over a well, a barn, seed grain, a roof.", "intro": ["The great war of {land} is over. Nobody won it, and nobody has stopped fighting.", "The peace treaty is two years old, and {country} is still burying the people who died before it was signed."], "sit": [["ended", "The peace treaty was signed two years ago, but nobody told the soldiers in the forts."], ["scraps", "There are more armed men in {land} than there is food to feed them."], ["scraps", "People are fighting over {place} now just for a well and a stone barn."], ["ended", "Nobody has been paid since the surrender was announced in the town square."], ["ended", "{country} has no government left, only tax collectors who never stopped collecting."], ["scraps", "The food store here is the last one still standing for four days’ ride."], ["scraps", "The orchards at {place} were cut down for firewood during the second winter of the war."], ["ended", "The fort at {place} still flies the flag of a country that no longer exists."], ["scraps", "{place} has one working mill, and three different gangs want it."], ["ended", "Some of the soldiers here fought on the other side in the war, and nobody asks which."], ["scraps", "The roads of {land} are full of people carrying everything they own."], ["ended", "The bell that rang for the surrender at {place} still hangs there, and nobody will take it down."], ["scraps", "{other} closed its border last month and has not said why."], ["ended", "The armies broke up, but most of the soldiers kept their weapons."]], "wrong": [["ended", "Half of these soldiers fought on our side at the river last year."], ["ended", "They are not soldiers any more. People with nothing left to lose are hard to predict."], ["scraps", "The food in that store will not feed this valley past midwinter."], ["ended", "There is no court left to complain to about any of this."], ["scraps", "The villagers buried their seed grain to keep it safe, and will not say where."], ["ended", "Everyone on this field has already lost the farm they were fighting to keep."], ["scraps", "The mill keeper has been paying all three gangs to leave him alone."], ["ended", "Their captain still thinks the war is going on, and his soldiers let him believe it."], ["scraps", "The key to the food store was buried with the last man who looked after it."], ["ended", "The deserters are hungry, armed, and a very long way from home."], ["scraps", "The well at the crossroads has been poisoned, and the next one is behind their lines."], ["ended", "The peace was signed by people who never had to live with it."], ["scraps", "The bandits have taken the only bridge, and charge anyone who wants to cross."], ["ended", "Nobody here trusts a soldier, whatever colours they wear."]], "task": [["ended", ["rout", "flee"], "Drive them off, but do not chase them past the trees."], ["scraps", ["survive", "defend", "escort"], "Hold the food store until the carts are loaded."], ["scraps", ["rout", "boss"], "End this quickly. Neither side has enough food for a long fight."], ["scraps", ["seize", "rout"], "Clear them out, and do not damage the barn."], ["ended", ["rout", "boss", "seize", "survive", "defend", "escape", "rescue", "escort", "flee"], "Win, and leave the valley able to plant its crops in spring."], ["ended", ["rescue", "escort", "escape"], "Get the families out before the next gang arrives."], ["scraps", ["seize", "rout"], "Take the mill and keep it running for the village."], ["ended", ["boss", "flee"], "Defeat their captain, and tell his soldiers the war is over."], ["scraps", ["survive", "defend", "escort"], "Hold the crossroads until the families are through."], ["ended", ["escape", "rescue", "escort"], "Get them out, and do not wait around for the next gang."]]}};
const DOCTRINES = {"cavalry": {"kinds": ["plains", "hills"], "test": "cavalry", "lore": ["{realm} bred the horses for the old order. Its soldiers still fight on horseback: they charge, ride away, and charge again somewhere else.", "The soldiers of {realm} rarely stand and hold a line. They fight on horseback and are gone before you can strike back."]}, "archers": {"kinds": ["forest", "marsh"], "test": "archers", "lore": ["{realm} is covered in forest, and its people never learned to fight in the open. They shoot from under the trees, and you cannot see how many there are.", "In {realm} there are always more enemies than you can see, and most of them carry bows."]}, "armour": {"kinds": ["mountain", "hills", "plains"], "test": "armour", "lore": ["The old order kept its best heavily armoured soldiers in {realm}, and they are still there, waiting on the high ground.", "The soldiers of {realm} wear heavy armour and do not hurry. They wait for the enemy to attack them uphill."]}, "fliers": {"kinds": ["coast", "snow", "mountain"], "test": "fliers", "lore": ["{realm} is a land of mountains and cliffs, so its soldiers ride pegasi and wyverns. They prefer to fight over water, where soldiers on foot cannot follow.", "In {realm}, you see the shadows of the riders on the ground before you see the riders in the sky."]}, "axemen": {"kinds": ["forest", "hills"], "test": "axemen", "lore": ["{realm} cut the timber for the old order’s ships and halls, and its woodcutters carried axes long before anyone paid them to fight.", "The soldiers of {realm} are strong but untrained. They are big, slow fighters who trust one heavy blow to be enough."]}, "mages": {"kinds": ["desert", "marsh", "snow"], "test": "mages", "lore": ["{realm} looked after the old order’s libraries. When the order fell, its scholars kept studying magic, and now they fight with it.", "Armour does little good against the soldiers of {realm}. They fight with magic, and aim for the heavily armoured."]}, "duelists": {"kinds": ["plains", "coast", "river"], "test": "duelists", "lore": ["{realm} guards the main roads, and its sword schools still train fighters fast enough to strike twice before you can react.", "In {realm}, swordfighting is a profession. Its soldiers are fast, skilled, and like to fight one on one."]}, "healers": {"kinds": ["river", "plains", "coast"], "test": "healers", "lore": ["{realm} ran the old order’s hospitals, and its healers learned their skills on soldiers from every province. Its towns are walled, and the gates stay shut to strangers.", "Do not let a fight drag on in {realm}. Its healers will have the wounded back on their feet by morning."]}, "raiders": {"kinds": ["coast", "marsh", "desert"], "test": "raiders", "lore": ["{realm} has always cared more about the sea than about any king. When the old order fell, it closed its harbours and sent its ships out raiding.", "{realm} pays its soldiers with whatever they can steal, and they fight like it."]}};

const TONES_MORE = {};
for (const [k, m] of Object.entries(TONES_MORE)) for (const l of ['sit', 'wrong', 'task']) TONES[k][l].push(...m[l]);
const DOCTRINE_FLAVOR = {"cavalry": ["a group of lands ruled by horse lords", "a land of open grassland, famous for its horses"], "archers": ["a land of forest clans", "a land of small villages hidden among the trees"], "armour": ["a kingdom ruled by old noble families", "the land the old order ruled directly"], "fliers": ["a mountain realm where riders keep pegasi and wyverns", "a kingdom that keeps its stables high on the cliffs"], "axemen": ["a land of timber towns", "a land of woodcutters and sawmills"], "mages": ["a realm of cities built around great libraries", "a land ruled by scholars"], "duelists": ["a group of independent cities", "a land of roadside forts and sword schools"], "healers": ["a holy kingdom of walled towns", "a land of hospitals and great churches"], "raiders": ["a coast of harbour towns", "a land of ships and docks, run by hired soldiers"]};
const DOCTRINE_TEST = { cavalry: c => c.canto && !c.flier && c.wpn !== 'staff', archers: c => c.wpn === 'bow' || /thief|rogue/i.test(c.name || ''), armour: c => /knight|general|armou?r/i.test(c.name || '') && !c.canto,
  fliers: c => !!c.flier, axemen: c => c.wpn === 'axe', mages: c => c.wpn === 'fire', duelists: c => c.wpn === 'sword' && !c.canto, healers: c => c.healer, raiders: c => /pirate|brigand|berserker|bandit|corsair|fighter/i.test(c.name || '') };
// a tone briefing in ABTO's three parts: the situation, what has gone wrong (on the same subject when possible), and a task that fits this chapter's objective
// tone sentences remember the exact text already used in this campaign, so filtered lists never repeat a line while fresh ones remain
function freshPick(camp, key, list, rng, f) { if (!list.length) return null; const used = camp.usedLines[key] = camp.usedLines[key] || []; const fresh = list.filter(s => !used.includes(s)), pool = fresh.length ? fresh : list;
  const s = pool[rng.int(0, pool.length - 1)]; used.push(s); if (used.length > 200) used.splice(0, 50); return STORY.fill(s, f); }
function toneParts(camp, st, f) {
  const T0 = TONES[camp.story && camp.story.tone]; if (!T0) return null; const rng = camp.rng, can = s => !/\{(\w+)\}/.test(s.replace(/\{(\w+)\}/g, (m, k) => f[k] ? '' : m));
  const sits = T0.sit.filter(e => can(e[1])), sit = sits.length ? freshPick(camp, 'tn_sit_' + camp.story.tone, sits.map(e => e[1]), rng, f) : null; if (!sit) return null;
  const subj = (T0.sit.find(e => STORY.fill(e[1], f) === sit) || [])[0], wr = T0.wrong.filter(e => can(e[1])), same = wr.filter(e => e[0] === subj);
  const wrong = freshPick(camp, 'tn_wr_' + camp.story.tone, (same.length ? same : wr).map(e => e[1]), rng, f);
  const tasks = T0.task.filter(e => e[1].includes(st.goal) && can(e[2])), task = tasks.length ? freshPick(camp, 'tn_tk_' + camp.story.tone, tasks.map(e => e[2]), rng, f) : null;
  return { sit, wrong, task };
}

// ---------------------------------------------------------------- THE CAMPAIGN'S WORLD: realms, landmarks, chapter locations
const WG = typeof WorldGen !== 'undefined' ? WorldGen : (typeof require !== 'undefined' ? require('./worldgen.js') : null);
const ROOT_A = ['Za', 'I', 'Se', 'Mel', 'Tai', 'Je', 'Lag', 'Val', 'Ad', 'Bor', 'Ra', 'Ca', 'Ren', 'Fre', 'Gra', 'Ri', 'Lo', 'Ni', 'Ta', 'Ul', 'Vo', 'Ke', 'Hal', 'Mo', 'Ar', 'Es', 'Dun', 'Pel', 'Sar', 'Tor'];
const ROOT_B = ['ha', 'de', 'rafew', 'kaen', 'zel', 'hanna', 'dou', 'ni', 'las', 'go', 'nos', 'mel', 'vas', 'ra', 'lia', 'tan', 'mir', 'dor', 'ven', 'kar', 'sel', 'brin', 'thal', 'gar', 'nell', 'ros', 'quin', 'mar', 'ith', 'olt'];
const KIND_WORDS = {
  forest: ['Woods', 'Forest', 'Wood', 'Thicket', 'Glade', 'Wilds'], plains: ['Plains', 'Fields', 'Meadows', 'Steppe', 'Heath', 'Moor'], coast: ['Coast', 'Shore', 'Strand', 'Bay', 'Cove', 'Cape'],
  river: ['Ford', 'Crossing', 'Bridge', 'Banks', 'Falls'], mountain: ['Pass', 'Peaks', 'Heights', 'Crags', 'Ridge'], snow: ['Snowfield', 'Frostlands', 'Glacier', 'Tundra'],
  marsh: ['Marsh', 'Fens', 'Mire', 'Bog'], desert: ['Desert', 'Dunes', 'Wastes', 'Sands'], hills: ['Hills', 'Downs', 'Highlands', 'Uplands'] };
const STRUCT = { castle: n => 'Castle ' + n, fort: n => 'Fort ' + n, ruins: n => n + ' Ruins', temple: n => n + ' Temple', tower: n => 'Tower of ' + n, port: n => 'Port ' + n, mine: n => n + ' Mines', keep: n => n + ' Keep', town: n => n };
const INDOOR_SITE = new Set(['castle', 'fort', 'ruins', 'temple', 'tower', 'mine', 'keep']);
const REALM_FLAVOR = ['a group of walled trading cities run by merchants', 'a holy kingdom ruled from its great church', 'a group of lands ruled by horse lords', 'a republic run by hired soldiers', 'a kingdom ruled by old noble families', 'a group of independent cities', 'a land ruled by its priests, where outsiders are not trusted', 'a small duchy that has always given in to stronger neighbours'];
const TERRAIN_WORD = { forest: 'deep forests', plains: 'open plains', coast: 'long coasts', river: 'river valleys', mountain: 'high mountains', snow: 'frozen highlands', marsh: 'wide marshes', desert: 'desert sands', hills: 'rolling hills' };
function rootName(rng) { return rng.pick(ROOT_A) + rng.pick(ROOT_B); }
function realmKind(world, k) { const cnt = {}; for (let i = 0; i < world.owner.length; i += 7) if (world.owner[i] === k) { const s = WG.siteAt(world, [i % world.W, (i / world.W) | 0]).kind; cnt[s] = (cnt[s] || 0) + 1; } return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || 'plains'; }
function toneFacts(camp, st) { const w = camp.world ? bookInfo(camp) : {}, names = w.realmNames || [], here = st && st.site ? st.site.realm : -1, other = here >= 0 && here !== w.home ? names[here] : names.find((n, k) => k !== w.home);
  return Object.assign(facts(camp, st), { land: w.continent, country: names[w.home], other, place: st ? st.place : undefined }); }
const grownCache = new Map();
const sizeOf = seed => { const r = RNG(seed ^ 0x3c6ef372); return { W: 200 + r.int(0, 17) * 8, H: 140 + r.int(0, 12) * 8 }; };
function bookWorld(camp, b) {
  const w = camp.world, info = b > 1 && w.books && w.books[b];
  if (!info) return WG.get(w.seed, sizeOf(w.seed));
  if (info.mode === 'same') return bookWorld(camp, b - 1);
  if (info.mode === 'foreign') return WG.get(info.seed, sizeOf(info.seed));
  const key = info.seed + ':' + b; if (!grownCache.has(key)) { if (grownCache.size > 3) grownCache.clear(); grownCache.set(key, WG.grow(bookWorld(camp, b - 1), info.seed, info.dir) || bookWorld(camp, b - 1)); } return grownCache.get(key);
}
// at the start of a new book, decide how its world relates to the last one, and name what is new
function planBook(camp, b, force) {
  const w = camp.world; if (!WG || !w || b < 2) return; w.books = w.books || {}; if (w.books[b] && !force) return;
  const r = RNG((w.seed ^ Math.imul(b, 40503)) >>> 0), prev = bookWorld(camp, b - 1), foreign = (w.foreign || []).filter(f => !f.used);
  let mode = r.pick(['same', 'same', 'same', 'grow', 'grow', 'grow', 'grow', 'grow', 'foreign', 'foreign', 'foreign']); if (force) mode = force; if (mode === 'foreign' && !foreign.length) mode = 'grow';
  const dirs = ['east', 'west', 'north', 'south'].filter(d => (d === 'east' || d === 'west') ? prev.W + 60 <= 480 : prev.H + 60 <= 320); if (mode === 'grow' && !dirs.length) mode = foreign.length ? 'foreign' : 'same';
  const info = { mode, seed: (w.seed + Math.imul(b, 2654435761)) >>> 0 }; if (mode === 'grow') info.dir = r.pick(dirs);
  if (mode === 'foreign') { const f = foreign[0]; f.used = true; info.seed = f.seed; info.continent = f.name; }
  w.books[b] = info;
  const world = bookWorld(camp, b), names = mode === 'foreign' ? [] : (w.books[b - 1] && w.books[b - 1].realmNames || w.realmNames).slice(), doct = mode === 'foreign' ? [] : (w.books[b - 1] && w.books[b - 1].doctrine || w.doctrine).slice();
  while (names.length < world.realms) { let nm; do nm = rootName(r) + r.pick(['', '', 'ia', 'and', 'or', 'ea']); while (names.includes(nm)); names.push(nm); }
  for (let k = doct.length; k < world.realms; k++) { const kind = realmKind(world, k), fit = Object.keys(DOCTRINES).filter(d => DOCTRINES[d].kinds.includes(kind)); doct.push(r.pick(fit.length ? fit : Object.keys(DOCTRINES))); }
  const rt = WG.route(world, routeSeed(w, b), mode === 'grow' && world.newRealms ? world.newRealms : null);
  Object.assign(info, { realmNames: names, doctrine: doct, home: rt.startRealm, enemy: rt.endRealm, continent: mode === 'foreign' ? info.continent : w.continent, newContinent: mode === 'grow' ? world.newContinent : null });
}
// the facts of the current book's world, for the page and the narration
// the enemy's allies in this book's world: realms bordering the enemy where possible, each with a reason
const ALLY_REASON = ['{E} pays {A} well in silver', 'the royal families of {A} and {E} are joined by marriage', '{E} has promised {A} land taken from its neighbours', '{A} is afraid of what {E} will do if it refuses', '{A} owes {E} a debt it cannot pay back',
  '{E} has promised {A} control of the trade roads', '{A} hopes {E} will leave it alone when the war is over', '{A} and {E} made a promise to each other long ago'];
function alliancesOf(camp) { const info = bookInfo(camp), world = worldOf(camp); if (!world || !info) return []; if (info.alliances) return info.alliances;
  const r = RNG((camp.world.seed ^ 0x51ed27) + (camp.story && camp.story.book || 1) * 131), names = info.realmNames || [], en = info.enemy, home = info.home, border = new Set();
  for (let i = 0; i < world.owner.length; i++) if (world.owner[i] === en) for (const d of [1, -1, world.W, -world.W]) { const j = i + d, o = world.owner[j]; if (o >= 0 && o !== en && o !== home) border.add(o); }
  const pool = [...border].concat(names.map((_, k) => k).filter(k => k !== en && k !== home && !border.has(k))), n = Math.min(pool.length, names.length >= 5 ? 2 : 1), out = [];
  for (let k = 0; k < pool.length && out.length < n; k++) if (k < border.size || out.length < n) out.push({ realm: pool[k], name: names[pool[k]], reason: r.pick(ALLY_REASON).replace(/\{E\}/g, names[en]).replace(/\{A\}/g, names[pool[k]]) });
  return (info.alliances = out); }
function bookInfo(camp) { const w = camp.world, b = camp.story && camp.story.book || 1; return b > 1 && w.books && w.books[b] ? w.books[b] : w; }
function bookRoute(camp) { const w = camp.world, b = camp.story && camp.story.book || 1, world = bookWorld(camp, b), info = bookInfo(camp); return WG.route(world, routeSeed(w, b), info.mode === 'grow' && world.newRealms ? world.newRealms : null); }
function worldOf(camp) {
  if (!WG) return null;
  const w = camp.world || (camp.world = { nodes: [] }); if (!w.seed) w.seed = ((camp.seed >>> 0) * 2654435761 + 977) >>> 0;
  if (!w.foreign) { const r = RNG(w.seed ^ 0x1234567); w.foreign = [0, 1].map(k => ({ name: rootName(r) + r.pick(['ia', 'ar', 'is', 'ond', 'ea']), seed: (w.seed + 7777 * (k + 1)) >>> 0, side: r.pick(['east', 'west', 'north', 'south']) })); }
  const b = camp.story && camp.story.book || 1; if (b > 1) { if (!w.books || !w.books[b]) planBook(camp, b); return bookWorld(camp, b); }
  const world = WG.get(w.seed, sizeOf(w.seed));
  if (!w.realmNames || w.realmNames.length !== world.realms) { const r = RNG(w.seed ^ 0x5bd1e995), rt = WG.route(world, routeSeed(w, 1));
    w.realmNames = []; for (let k = 0; k < world.realms; k++) { let nm; do nm = rootName(r) + r.pick(['', '', 'ia', 'and', 'or', 'ea']); while (w.realmNames.includes(nm)); w.realmNames.push(nm); }
    w.realmNames[rt.startRealm] = camp.realm; w.home = rt.startRealm; w.enemy = rt.endRealm;
    w.flavor = w.realmNames.map(() => r.pick(REALM_FLAVOR)); w.continent = world.continent; }
  if (!w.doctrine || w.doctrine.length !== world.realms) { const r = RNG(w.seed ^ 0x27d4eb2d), used = new Set(); w.doctrine = [];
    for (let k = 0; k < world.realms; k++) { const kind = realmKind(world, k), fit = Object.keys(DOCTRINES).filter(d => DOCTRINES[d].kinds.includes(kind) && !used.has(d)), pool2 = fit.length ? fit : Object.keys(DOCTRINES).filter(d => !used.has(d)), d = r.pick(pool2.length ? pool2 : Object.keys(DOCTRINES)); used.add(d); w.doctrine.push(d); } }
  return world;
}
const routeSeed = (w, book) => (w.seed + book * 7919) >>> 0;
// a chapter's place: the terrain at its stop decides the name, story landmarks get their own
function chapterSite(camp, skirmish) {
  const world = worldOf(camp); if (!world) return null;
  const w = camp.world, book = camp.story && camp.story.book || 1, rt = bookRoute(camp), rng = camp.rng, BI = bookInfo(camp);
  const j = Math.min(rt.stops.length - 1, ((Math.max(1, camp.chapter) - 1) % 30)), stop = rt.stops[j];
  const pos = skirmish ? WG.offRoad(world, stop, w.nodes.length) : stop, site = WG.siteAt(world, pos), root = rootName(rng);
  let name, kind = site.kind, struct = null, sea = false, pos2 = pos;
  if (!skirmish && j > 0) { const prev = rt.stops[j - 1], ca = world.comp[prev[1] * world.W + prev[0]], cb = world.comp[stop[1] * world.W + stop[0]];
    if (ca !== cb && ca >= 0 && cb >= 0 && rng.chance(55)) { let best = null; for (let t = 0.3; t <= 0.71; t += 0.05) { const x = Math.round(prev[0] + (stop[0] - prev[0]) * t), y = Math.round(prev[1] + (stop[1] - prev[1]) * t); if (!world.land[y * world.W + x]) { const d = Math.abs(t - 0.5); if (!best || d < best.d) best = { d, p: [x, y] }; } }
      if (best) { sea = true; pos2 = best.p; } } }
  const S = camp.story; const landmark = !skirmish && S ? (j === 9 ? 'order' : j === 19 ? 'war' : j === 29 ? 'capital' : null) : null;
  if (sea) { struct = 'ship'; kind = 'coast'; name = rng.pick([`${root} Strait`, `The ${root} Crossing`, `Waters off ${BI.realmNames[site.realm] || root}`, `Aboard the ${rng.pick(['Grey Lady', 'Sea Wolf', 'Tidecaller', 'Saltwind', 'Merrow', 'Gull', 'Red Heron', 'Long Night'])}`]); }
  else if (landmark === 'order') { struct = 'ruins'; name = `${S.order.replace(/^the (Order of )?(the )?/i, '')} Ruins`; }
  else if (landmark === 'war') { name = `${root} ${rng.pick(['Fields', 'Plains', 'Moor'])}`; }
  else if (landmark === 'capital') { struct = 'castle'; name = `Castle ${BI.realmNames[site.realm] || root}`; }
  else if (!skirmish && rng.chance(30)) { struct = kind === 'coast' ? rng.pick(['port', 'fort', 'town']) : kind === 'mountain' ? rng.pick(['mine', 'fort', 'keep']) : rng.pick(['castle', 'fort', 'ruins', 'temple', 'tower', 'keep', 'town']); name = STRUCT[struct](root); }
  else name = `${root} ${rng.pick(KIND_WORDS[kind] || KIND_WORDS.plains)}`;
  return { name, kind, struct, sea, landmark, pos: pos2, realm: site.realm, realmName: BI.realmNames[site.realm] };
}
// battle maps that suit the place: forests for woods, water for coasts and fords, sand for deserts, interiors for castles and ruins
function mapFeatures(m) { if (m._feat) return m._feat; const t = m.terr || [], n = t.length || 1; let f = 0, s = 0, d = 0, mo = 0, dk = 0;
  for (const v of t) { if (v === 0x0C || v === 0x0D) f++; else if (v === 0x10 || v === 0x15 || v === 0x16 || v === 0x3C) s++; else if (v === 0x0E || v === 0x0F) d++; else if (v === 0x11 || v === 0x12) mo++; else if (v === 0x3E) dk++; }
  return (m._feat = { forest: f / n, water: s / n, sand: d / n, mount: mo / n, deck: dk / n, indoor: !isOutdoor({ map: { terr: t } }) }); }
// a window cut from a larger real map, when nothing of the right size exists
function cropMap(rng, pool, w, h, indoor, needWater) { const big = pool.filter(m => m.cells && m.w >= w && m.h >= h && (indoor ? !isOutdoor({ map: { terr: m.terr } }) : isOutdoor({ map: { terr: m.terr } })) && (!needWater || mapFeatures(m).water >= 0.15));
  for (let t = 0; t < 40 && big.length; t++) { const m = rng.pick(big), x0 = rng.int(0, m.w - w), y0 = rng.int(0, m.h - h), cells = [], terr = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { cells.push(m.cells[(y0 + y) * m.w + x0 + x]); terr.push(m.terr[(y0 + y) * m.w + x0 + x]); }
    if (needWater && terr.filter(t => t === 0x10 || t === 0x15 || t === 0x16).length < w * h * 0.12) continue;
    const c = Object.assign({}, m, { w, h, cells, terr, ox: (m.ox || 0) + x0, oy: (m.oy || 0) + y0, _q: undefined, _feat: undefined, src: m.src || 'rom', credit: (m.credit ? m.credit + ', ' : '') + 'part of a larger map' }); delete c._q; delete c._feat;
    if (mapQuality(c)) return c; }
  return null; }
// deploy slots across a book (Casim): 5 at chapter 1, 16 by chapters 29-30
const deploySlots = j => Math.min(16, 5 + Math.round((j - 1) * 11 / 28));
// enemies (and so map size) follow the deploy slots from chapter 4: 1.6 a slot + 1 (11 at ch 4, 15 at 10, 22 at 20, 27 at 29)
// Casim's minimum enemies: 10 at chapters 1-2, then deploy slots x 2.1 (ch 3-4), 2.2 (5-11), 2.4 (12-17), 2.6 (18-23),
// 2.8 (24-27), 3 (28+, so 48 there); the actual count is the minimum plus a random spread, never the previous chapter's
const enemyMin = j => j <= 2 ? 10 : Math.ceil(deploySlots(j) * (j <= 4 ? 2.1 : j <= 11 ? 2.2 : j <= 17 ? 2.4 : j <= 23 ? 2.6 : j <= 27 ? 2.8 : 3));
let ENEMY_SPREAD = 0.50;   // tested (Oct 2026): 25%/35% ~94-95% wins, 0.25-0.29 deaths a chapter; 50% 89% wins, 0.35 deaths: the first that bites
// the expected count, which sizes the map
function enemyTarget(j) { return Math.round(enemyMin(j) * (1 + ENEMY_SPREAD / 2)); }
// map size for a chapter of a book: 100-140 tiles, then 160-200, 180-225, then growing with the number of enemies
// (Casim's enemy minimums) every chapter's map is sized from its expected enemy count, about 20 tiles an enemy, so the minimum fits
function areaRange(j) { const c = 20 * enemyTarget(j) + 20; return [Math.round(c * 0.85), Math.round(c * 1.18)]; }
// a map is usable when most of it can be walked, its walkable ground is one connected area, and its middle is not blocked
const BLOCK_T = new Set([0x00, 0x15, 0x16, 0x1A, 0x1B, 0x12, 0x26, 0x10, 0x3C, 0x19, 0x32]);
function mapQuality(m) { if (m._q !== undefined) return m._q; const W = m.w, H = m.h, t = m.terr || []; if (!t.length) return (m._q = false);
  const ok = i => !BLOCK_T.has(t[i]); let pass = 0; for (let i = 0; i < W * H; i++) if (ok(i)) pass++; if (pass < W * H * 0.5) return (m._q = false);
  const seen = new Uint8Array(W * H); let best = 0; for (let s = 0; s < W * H; s++) { if (seen[s] || !ok(s)) continue; let n = 0; const q = [s]; seen[s] = 1; while (q.length) { const i = q.pop(); n++; const x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!seen[j] && ok(j)) { seen[j] = 1; q.push(j); } } } best = Math.max(best, n); }
  if (best < pass * 0.85) return (m._q = false);
  let mid = 0, midN = 0; for (let y = Math.floor(H * 0.25); y < Math.ceil(H * 0.75); y++) for (let x = Math.floor(W * 0.25); x < Math.ceil(W * 0.75); x++) { midN++; if (ok(y * W + x)) mid++; }
  return (m._q = mid >= midN * 0.45); }
function pickMapFor(rng, pool, site) {
  if (!site || !pool.length) return rng.pick(pool);
  const want = m => { const F = mapFeatures(m); if (site.sea) return F.deck > 0.03 ? 40 : 0.2 + F.water * 30;
    if (site.struct && INDOOR_SITE.has(site.struct)) return F.indoor ? 6 : 0.3; if (F.indoor) return 0.15;
    return 1 + ({ forest: F.forest * 14, coast: F.water * 12, river: F.water * 14, desert: F.sand * 16, mountain: F.mount * 14, hills: F.mount * 8 + F.forest * 3, marsh: F.water * 6 + F.forest * 4, snow: F.mount * 6, plains: (1 - F.forest - F.mount) * 2 }[site.kind] || 1); };
  const ws = pool.map(want), tot = ws.reduce((a, b) => a + b, 0); let x = rng.int(0, 9999) / 10000 * tot; for (let i = 0; i < pool.length; i++) { x -= ws[i]; if (x <= 0) return pool[i]; } return pool[pool.length - 1];
}
// the opening of a run: the continent, its realms, and what is at stake
function worldIntro(camp) {
  const world = worldOf(camp); if (!world) return [];
  const b = camp.story && camp.story.book || 1, w = b > 1 ? Object.assign({}, camp.world, bookInfo(camp)) : camp.world, S = camp.story, rng = RNG((camp.world.seed ^ 77) + b), rt = bookRoute(camp), out = [];
  const where = l => { const dx = l.x / world.W - 0.5, dy = l.y / world.H - 0.5; if (Math.hypot(dx, dy) < 0.13) return 'at the heart of the land'; const ns = dy < -0.15 ? 'north' : dy > 0.15 ? 'south' : '', ew = dx < -0.15 ? 'west' : dx > 0.15 ? 'east' : ''; return (ns || ew) ? 'in the ' + ((ns && ew) ? ns + '-' + ew : ns || ew) : 'near the middle of the land'; };
  const kindOf = k => { const cnt = {}; for (let i = 0; i < world.owner.length; i += 7) if (world.owner[i] === k) { const s = WG.siteAt(world, [i % world.W, (i / world.W) | 0]).kind; cnt[s] = (cnt[s] || 0) + 1; } return Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]?.[0] || 'plains'; };
  if (b === 1) out.push({ line: `This is ${w.continent}, a land of ${NUM[world.realms] || world.realms} realms${world.sizes.filter(s => s > 250).length > 1 ? ' scattered across the sea' : ''}.`, focus: null });
  else if (w.mode === 'grow') out.push({ line: `Book ${NUM[b] || b} of the chronicle. Beyond the ${w.dir === 'east' ? 'eastern' : w.dir === 'west' ? 'western' : w.dir === 'north' ? 'northern' : 'southern'} sea of ${camp.world.continent} lies ${w.newContinent}, and the war has followed the army there.`, focus: rt.stops[Math.floor(rt.stops.length / 2)] || null });
  else if (w.mode === 'foreign') out.push({ line: `Book ${NUM[b] || b} of the chronicle. The old songs of ${camp.world.continent} spoke of ${w.continent}. Now the army has crossed the sea to see it for itself.`, focus: null });
  else out.push({ line: `Book ${NUM[b] || b} of the chronicle. Years have passed in ${w.continent}, and the old roads lead to new places.`, focus: null });
  const T0 = TONES[S.tone]; if (T0) out.push({ line: STORY.fill(rng.pick(T0.intro), Object.assign(toneFacts(camp, null), { country: w.realmNames[w.home] })), focus: null });
  const L = world.labels;
  if (L[w.home]) out.push({ line: `${w.realmNames[w.home]} lies ${where(L[w.home])}, a land of ${TERRAIN_WORD[kindOf(w.home)]}. ${S.fall.replace(/\.?$/, '.')}`.replace(/\s+/g, ' '), focus: [L[w.home].x, L[w.home].y], realm: w.home });
  const told = new Set(); for (const k of rt.order) { if (k === w.home || k === w.enemy || !L[k] || told.has(k)) continue; told.add(k); out.push({ line: `${w.realmNames[k]}, ${where(L[k])}, is ${rng.pick(DOCTRINE_FLAVOR[w.doctrine[k]])}. ` + STORY.fill(rng.pick(DOCTRINES[w.doctrine[k]].lore), { realm: w.realmNames[k] }), focus: [L[k].x, L[k].y], realm: k }); }
  if (L[w.enemy]) out.push({ line: `And ${where(L[w.enemy])} lies ${w.realmNames[w.enemy]}, where ${S.villain.title} ${S.villain.name} rules, and where ${S.relic} is kept.`, focus: [L[w.enemy].x, L[w.enemy].y], realm: w.enemy });
  out.push({ line: `${S.villain.title} ${S.villain.name} ${S.villain.goal}`.replace(/\.?$/, '.'), focus: null });
  out.push({ line: `Long ago, ${S.war} was fought on these lands, and ${S.order} kept the peace until it fell. Their ruins still stand along the road ahead.`, focus: rt.stops[9] || null });
  for (const A of alliancesOf(camp)) out.push({ line: `${A.name} has joined ${w.realmNames[w.enemy]}'s side, because ${A.reason}.`, focus: L[A.realm] ? [L[A.realm].x, L[A.realm].y] : null, realm: A.realm });
  if (b === 1 && camp.world.foreign) out.push({ line: `Beyond the sea, the old songs tell of ${camp.world.foreign.map(f => f.name).join(' and ')}, lands nobody here has seen.`, focus: null });
  out.push({ line: b === 1 ? `The road runs from ${w.realmNames[w.home]} to ${w.realmNames[w.enemy]}. This is where the chronicle begins.` : `The road runs from ${w.realmNames[w.home]} to ${w.realmNames[w.enemy]}. This is where the new book begins.`, focus: rt.stops[0] || null });
  return out;
}

// ---------------------------------------------------------------- BOOK PROGRESSION: time, ages, and how the army changes between books
const PROGRESSIONS = ['carry', 'generation', 'reclass', 'core'];
const PROG_NAME = { carry: 'the whole army marches on', generation: 'a new generation takes up the fight', reclass: 'every soldier learns a new way to fight', core: 'a few veterans lead a new army' };
// enemy strength: no cap; each book can restart it from a new base level
function enemyLevel(camp, n) { const base = camp.lvBase || 1, start = camp.lvStart || 0; return Math.max(1, Math.round(base + Math.max(0, n - start) * 0.7)); }
function ageFor(rng, u) { const n = className(u).toLowerCase(), c = CLASSES[u.cls] || {};
  if (/journeyman|pupil|recruit|trainee/.test(n)) return 13 + rng.int(0, 3); if (c.promoted) return 24 + rng.int(0, 16); if (/lord/.test(n)) return 17 + rng.int(0, 5); return 15 + rng.int(0, 15); }
function ensureAges(camp, rng) { for (const u of camp.army) if (!u.age) u.age = ageFor(rng, u); }
function baseClassOf(clsKey) { const c = CLASSES[clsKey]; if (!c || !c.promoted) return clsKey;
  const from = Object.entries(CLASSES).find(([k, o]) => !o.promoted && (o.promoTo === clsKey || (o.branches || []).includes(clsKey)) && o.game === c.game); return from ? from[0] : clsKey; }
const LN = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty' };
const yearsWord = y => (LN[y] || String(y)) + (y === 1 ? ' year' : ' years');
// children of the army's strongest bonds
function nextGeneration(camp, rng, gap, lines) {
  const army = camp.army, lord = army.find(u => u.id === camp.lord) || army[0], made = [], used = new Set();
  const pairs = Object.entries(camp.supports || {}).map(([k, p]) => [k.split('-').map(Number), p]).filter(([[x, y], p]) => rankOf(p) >= 2 && !((camp.army.find(u => u.id === x) || {}).sworn || []).includes(y)).sort((a, b) => b[1] - a[1])
    .map(([[a, b], p]) => [army.find(u => u.id === a), army.find(u => u.id === b), p]).filter(([a, b]) => a && b);
  const child = (a, b, p) => { const par = rng.chance(50) ? a : b, cls = rng.chance(25) && POOL ? (poolPick(rng, c => /journeyman|pupil|recruit/i.test(c.name || ''), false) || baseClassOf(par.cls)) : baseClassOf(par.cls);
    const k = makeUnit(rng, cls, 'player', 1 + rng.int(0, 2)); k.name = uniqueName(camp, rng); k.age = 15 + rng.int(0, 4); k.parents = [a.name, b.name];
    { const from = [a, b].filter(q => q && q.crest).sort((x, y) => (y.crest.major ? 1 : 0) - (x.crest.major ? 1 : 0))[0]; k.crest = from && rng.chance(80) ? { id: from.crest.id, major: from.crest.major && rng.chance(50) } : null; }
    for (const s of S) { const g = Math.round(((a.growth[s] || 30) + (b.growth[s] || 30)) / 2 + rng.int(-10, 10)); k.growth[s] = Math.max(5, Math.min(95, g)); }
    for (const s of ['str', 'mag', 'skl', 'spd', 'lck', 'def', 'res']) k[s] += Math.max(0, Math.floor(((a[s] || 0) + (b[s] || 0)) / 2 * 0.12));
    k.maxhp += Math.floor(((a.maxhp || 0) + (b.maxhp || 0)) / 2 * 0.1); k.hp = k.maxhp;
    if (rng.chance(50) && par.mbti) k.mbti = par.mbti; voice(camp, k); return k; };
  for (const [a, b, p] of pairs) { if (used.has(a.id) || used.has(b.id)) continue; used.add(a.id); used.add(b.id);
    const n = rankOf(p) >= 3 && rng.chance(40) ? 2 : 1, kids = []; for (let i = 0; i < n; i++) kids.push(child(a, b, p));
    if (kids.length > 1) camp.supports[pairKey(kids[0], kids[1])] = 14;
    made.push(...kids); lines.push(['', `${a.name} and ${b.name}'s ${kids.length > 1 ? 'children ' + kids.map(k => k.name).join(' and ') + ' are' : 'child ' + kids[0].name + ' is'} grown now, and ready to fight.`]); if (made.length >= 10) break; }
  // the lord's heir leads; if the lord had no great bond, a young relative takes up the banner
  let heir = made.find(k => k.parents.includes(lord.name));
  if (!heir) { const fake = { name: '', growth: lord.growth }; heir = child(lord, Object.assign({}, lord, { name: 'an unnamed spouse' }), 0); heir.cls = baseClassOf(lord.cls); heir.fe8 = lord.fe8; heir.parents = [lord.name]; made.unshift(heir); lines.push(['', `${lord.name}'s ${rng.pick(['child', 'heir', 'youngest'])} ${heir.name} takes up the banner of ${camp.realm}.`]); }
  heir.leader = true; camp.lord = heir.id;
  // one or two veterans stay on as mentors
  const vets = army.filter(u => u !== lord).sort((a, b) => (b.level + (b.kills || 0)) - (a.level + (a.kills || 0))).slice(0, 1 + rng.int(0, 1));
  for (const v of vets) { v.mentor = true; v.age += gap; v.leader = false; } lord.leader = false;
  const retired = army.filter(u => !vets.includes(u)).map(u => u.name);
  lines.push(['', `${listJoin(retired.slice(0, 8))}${retired.length > 8 ? ' and the rest of the old army' : ''} ${retired.length > 1 ? 'have' : 'has'} laid down ${retired.length > 1 ? 'their' : 'their'} weapons.`]);
  if (vets.length) lines.push(['', `${listJoin(vets.map(v => v.name))} ${vets.length > 1 ? 'stay' : 'stays'} on to teach the young.`]);
  camp.army = [...made, ...vets]; camp.generation = (camp.generation || 1) + 1;
  while (camp.army.length < 8) { const cls = POOL ? poolPick(rng, c => !c.promoted && !c.monster, false) : 'Fighter', r = makeUnit(rng, cls, 'player', 1 + rng.int(0, 2)); r.name = uniqueName(camp, rng); r.age = 15 + rng.int(0, 6); voice(camp, r); camp.army.push(r); }
  return { retired, children: made.map(k => ({ name: k.name, parents: k.parents })), mentors: vets.map(v => v.name), heir: heir.name };
}
function reclassAll(camp, rng, lines) { const changed = [];
  for (const u of camp.army) { const old = CLASSES[u.cls]; if (!old || u.id === camp.lord) continue; const want = c => !c.promoted && !c.monster && c.wpn !== old.wpn && c.name !== old.name;
    const to = POOL ? poolPick(rng, want, false) : null; if (!to || !CLASSES[to]) continue; const nb = CLASSES[to].base, ob = old.base;
    for (const s of ['str', 'mag', 'skl', 'spd', 'lck', 'def', 'res']) u[s] = (nb[s] || 0) + Math.max(0, Math.floor(((u[s] || 0) - (ob[s] || 0)) / 2));
    u.maxhp = (nb.hp || 18) + Math.max(0, Math.floor((u.maxhp - (ob.hp || 18)) / 2)); u.hp = u.maxhp; const from = old.name; u.cls = to; u.fe8 = CLASSES[to].fe8 ?? u.fe8; u.level = 1; u.exp = 0;
    u.items = (u.items || []).filter(it => !WEAPONS[it.id] || WEAPONS[it.id].consumable || canWield(u, it.id)); u.weapon = null; changed.push(`${u.name} (${prose(from)} to ${prose(CLASSES[to].name)})`); }
  lines.push(['', `Every soldier in the army took up a new way of fighting: ${listJoin(changed.slice(0, 6))}${changed.length > 6 ? ', and more' : ''}.`]); return { reclassed: changed }; }
function keepCore(camp, rng, lines) { const lord = camp.army.find(u => u.id === camp.lord) || camp.army[0];
  const bond = u => Object.entries(camp.supports || {}).filter(([k]) => k.split('-').map(Number).includes(u.id)).reduce((a, [, p]) => a + p, 0);
  const rest = camp.army.filter(u => u !== lord).sort((a, b) => (bond(b) + (b.kills || 0) * 3) - (bond(a) + (a.kills || 0) * 3)), keep = rest.slice(0, 3 + rng.int(0, 2)), retired = rest.slice(keep.length).map(u => u.name);
  camp.army = [lord, ...keep];
  const lv = Math.max(1, Math.round(((camp.lvBase || 1) + enemyLevel(camp, camp.chapter)) / 2));
  while (camp.army.length < 10) { const cls = POOL ? poolPick(rng, c => !c.promoted && !c.monster, false) : 'Fighter', r = makeUnit(rng, cls, 'player', lv); r.name = uniqueName(camp, rng); r.age = ageFor(rng, r); voice(camp, r); camp.army.push(r); }
  lines.push(['', `${listJoin(retired.slice(0, 8))}${retired.length > 8 ? ' and others' : ''} went home. ${lord.name} kept ${listJoin(keep.map(u => u.name))} close, and new soldiers answered the call.`]); return { retired, kept: keep.map(u => u.name), lvRestart: lv }; }
// called when a book ends in victory: time passes, and the army changes as this run's chosen way (or a new generation, when it is time)
function advanceBook(camp, rng, lines, nextBook) {
  ensureAges(camp, rng); camp.progression = camp.progression || rng.pick(PROGRESSIONS); camp.genLimit = camp.genLimit || 15 + rng.int(0, 5); camp.genStartYear = camp.genStartYear || 0;
  let mode = camp.progression; const inBook = 1 + rng.int(0, 1); camp.years = (camp.years || 0) + inBook;
  let gap = { carry: 1 + rng.int(0, 2), reclass: 1 + rng.int(0, 1), core: 3 + rng.int(0, 5), generation: 17 + rng.int(0, 3) }[mode];
  const forced = (nextBook === 3 && !camp.book3Gen) || (camp.years + gap - camp.genStartYear >= camp.genLimit);   // Casim kept: book 3 is a new generation, and so is 15-20 years on
  if (forced && mode !== 'generation') { mode = 'generation'; gap = 17 + rng.int(0, 3); } if (nextBook === 3) camp.book3Gen = true;
  const young = camp.army.filter(u => u.hp > 0 && !u.leader && (u.age || 20) + inBook < 25);   // Casim: under 25 at the end of the book
  camp.years += gap; for (const u of camp.army) u.age = (u.age || 20) + inBook + gap;
  lines.push(['', `${yearsWord(gap)[0].toUpperCase() + yearsWord(gap).slice(1)} pass.`]);
  let rec;
  if (mode === 'generation') { rec = nextGeneration(camp, rng, gap, lines); camp.genStartYear = camp.years; camp.lvBase = 2; camp.lvStart = camp.chapter;
    // (Casim) the old book's youngest, under 25 when it ended, move on with the children instead of laying down their weapons
    const going = young.filter(y => !camp.army.includes(y)); for (const y of going) { y.leader = false; camp.army.push(y); }
    // (Casim) mentors are 40-45 by now: they step down to their base class at level 1-2, keeping name, supports, skills,
    // crests and relics, with the class's level-1 stats plus 10% of each stat they ended the last book with
    for (const m of camp.army.filter(u => u.mentor || going.includes(u))) { const old = {}; for (const k of STATK) old[k] = m[k] || 0;
      const base = CLASSES[m.cls] && CLASSES[m.cls].promoted ? baseClassOf(m.cls) : m.cls, f = makeUnit(rng, base, 'player', 1);
      m.cls = base; m.fe8 = base; m.gCls = base; m.level = 1; m.exp = 0; m.mentor = true;
      for (const k of ['maxhp', 'str', 'mag', 'skl', 'spd', 'lck', 'def', 'res']) m[k] = (f[k] || 0) + Math.round(old[k] * 0.1); m.hp = m.maxhp;
      if (f.items && f.items.length) { m.items = f.items; m.weapon = f.weapon; } if (rng.chance(50)) levelUp(rng, m); m.hp = m.maxhp; }
    for (const k of camp.army) if (!k.mentor) k.joinedBook = nextBook;
    if (going.length) lines.push(['', `${listJoin(going.slice(0, 6).map(y => y.name))}${going.length > 6 ? ` and ${going.length - 6} more` : ''}, still young when the last war ended, ${going.length > 1 ? 'march' : 'marches'} on with the new generation.`]); rec.youngCarried = going.map(y => y.name); }
  else if (mode === 'reclass') { rec = reclassAll(camp, rng, lines); camp.lvBase = 4; camp.lvStart = camp.chapter; }
  else if (mode === 'core') { rec = keepCore(camp, rng, lines); camp.lvBase = rec.lvRestart; camp.lvStart = camp.chapter; }
  else { lines.push(['', 'The army that won the last war marches on, older and more dangerous.']); rec = {}; }
  (camp.bookLog = camp.bookLog || []).push(Object.assign({ book: nextBook, mode, forced: forced && camp.progression !== 'generation', years: camp.years, gap }, rec));
  return mode;
}

// ---------------------------------------------------------------- MAP GENERATOR: new battle maps learned from real ones, with the terrain laid out first
// Each tileset's model comes from every map in the library that uses it. Landscape tiles are grown from the pairings seen in real maps,
// and buildings (villages, houses, forts, gates, shops) are cut whole out of real maps and placed on open ground.
const MapGen = (() => {
  const models = new Map();
  const LAND = new Set([0x01, 0x02, 0x0C, 0x0D, 0x0E, 0x0F, 0x10, 0x11, 0x12, 0x15, 0x16, 0x26, 0x3C, 0x13, 0x14, 0x19, 0x1A, 0x1B, 0x32]);
  const TCLASS = t => t === 0x13 || t === 0x14 || t === 0x34 ? 'bridge' : t === 0x0C || t === 0x0D ? 'cover' : t === 0x11 || t === 0x12 || t === 0x26 ? 'rough' : t === 0x10 || t === 0x15 || t === 0x16 || t === 0x3C ? 'water' : t === 0x1A || t === 0x1B || t === 0x19 || t === 0x32 ? 'wall' : t === 0x0E || t === 0x0F ? 'sand' : 'open';
  const keyOf = m => (m.game && m.game.code || 'X') + ':' + (m.ids || []).join(',');
  function model(key) {
    if (models.has(key)) return models.get(key);
    const maps = (ROMD && ROMD.maps || []).filter(m => m.cells && m.ids && keyOf(m) === key && m.src !== 'gen');
    if (!maps.length || maps.every(m => !isOutdoor({ map: { terr: m.terr } }))) { models.set(key, null); return null; }
    const freq = new Map(), right = new Map(), down = new Map(), left = new Map(), up = new Map(), terr = new Map(), quad = new Map(); let cells = 0;
    const add = (M, a, b) => { let r = M.get(a); if (!r) M.set(a, r = new Map()); r.set(b, (r.get(b) || 0) + 1); };
    for (const m of maps) for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const i = y * m.w + x, tl = m.cells[i]; cells++; freq.set(tl, (freq.get(tl) || 0) + 1); terr.set(tl, m.terr[i]);
      if (x + 1 < m.w) { add(right, tl, m.cells[i + 1]); add(left, m.cells[i + 1], tl); } if (y + 1 < m.h) { add(down, tl, m.cells[i + m.w]); add(up, m.cells[i + m.w], tl); } if (x && y) add(quad, m.cells[i - 1] + ',' + m.cells[i - m.w] + ',' + m.cells[i - m.w - 1], tl); }
    // plain ground: the most common open tiles, covering most of the open ground in real maps
    const openT = [...freq.entries()].filter(([tl]) => TCLASS(terr.get(tl)) === 'open' && LAND.has(terr.get(tl))).sort((a, b) => b[1] - a[1]); const openTotal = openT.reduce((a, [, c]) => a + c, 0);
    const plain = new Set(); let acc = 0; for (const [tl, c] of openT) { if (acc > openTotal * 0.8) break; plain.add(tl); acc += c; }
    // buildings: anything whose terrain is not landscape, grown out to the decorated tiles around it; cut whole, with plain ground around
    const stamps = [], seenKey = new Set();
    for (const m of maps) { const done = new Uint8Array(m.w * m.h);
      for (let i = 0; i < m.w * m.h; i++) { if (done[i] || LAND.has(m.terr[i])) continue; const comp = [i]; done[i] = 1;
        for (let k = 0; k < comp.length; k++) { const x = comp[k] % m.w, y = (comp[k] / m.w) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue; const j = ny * m.w + nx; if (done[j]) continue; if (!LAND.has(m.terr[j]) || (!plain.has(m.cells[j]) && TCLASS(m.terr[j]) === 'open')) { done[j] = 1; comp.push(j); } } }
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (const j of comp) { const x = j % m.w, y = (j / m.w) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
        const sw = x1 - x0 + 1, sh = y1 - y0 + 1; if (sw > 6 || sh > 6 || x0 < 1 || y0 < 1 || x1 >= m.w - 1 || y1 >= m.h - 1) continue;
        let ringOk = true; for (let y = y0 - 1; y <= y1 + 1 && ringOk; y++) for (let x = x0 - 1; x <= x1 + 1; x++) { if (x >= x0 && x <= x1 && y >= y0 && y <= y1) continue; if (!plain.has(m.cells[y * m.w + x])) { ringOk = false; break; } }
        if (!ringOk) continue; const cellsS = [], terrS = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { cellsS.push(m.cells[y * m.w + x]); terrS.push(m.terr[y * m.w + x]); }
        if (terrS.filter(t => !LAND.has(t)).every(t => t === 0x00)) continue;   // a lone blank ('no terrain') tile is not a building
        const k2 = sw + 'x' + sh + ':' + cellsS.join(','); if (seenKey.has(k2)) continue; seenKey.add(k2); stamps.push({ w: sw, h: sh, cells: cellsS, terr: terrS }); } }
    // features: what stands in open ground in real maps (groves, peaks and mountain clusters, cliffs, ponds), each cut with the
    // ring of open ground around it, so a generated map can be dressed with real pieces that meet its grass cleanly
    const features = [], seenF = new Set(), kindOf = t => t === 0x0C || t === 0x0D ? 'grove' : t === 0x11 ? 'mountain' : t === 0x12 || t === 0x26 ? 'peak' : t === 0x15 || t === 0x16 ? 'water' : null;
    const openG = t => t === 0x01 || t === 0x02 || t === 0x0E || t === 0x0F;
    for (const m of maps) { const done = new Uint8Array(m.w * m.h);
      for (let i = 0; i < m.w * m.h; i++) { if (done[i] || !kindOf(m.terr[i])) continue; const comp = [i]; done[i] = 1;
        for (let k = 0; k < comp.length; k++) { const x = comp[k] % m.w, y = (comp[k] / m.w) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue; const j = ny * m.w + nx; if (done[j] || !kindOf(m.terr[j])) continue; done[j] = 1; comp.push(j); } }
        if (comp.length < 2) continue; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (const j of comp) { const x = j % m.w, y = (j / m.w) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
        x0--; y0--; x1++; y1++; if (x0 < 0 || y0 < 0 || x1 >= m.w || y1 >= m.h || x1 - x0 + 1 > 12 || y1 - y0 + 1 > 12) continue;
        const inC = new Set(comp); let ok = true; const cl = [], tr = [];
        for (let y = y0; y <= y1 && ok; y++) for (let x = x0; x <= x1; x++) { const j = y * m.w + x, t = m.terr[j]; if (!LAND.has(t) || (!inC.has(j) && !plain.has(m.cells[j]))) { ok = false; break; } cl.push(m.cells[j]); tr.push(t); }
        if (!ok) continue; const key = (x1 - x0 + 1) + 'x' + (y1 - y0 + 1) + ':' + cl.join(','); if (seenF.has(key)) continue; seenF.add(key);
        const kinds = {}; for (const j of comp) { const kd = kindOf(m.terr[j]); kinds[kd] = (kinds[kd] || 0) + 1; }
        features.push({ w: x1 - x0 + 1, h: y1 - y0 + 1, cells: cl, terr: tr, size: comp.length, kind: kinds.peak ? 'peak' : Object.entries(kinds).sort((a, b) => b[1] - a[1])[0][0] }); } }
    const tiles = [...freq.keys()].filter(tl => LAND.has(terr.get(tl))), byClass = {}; for (const tl of tiles) (byClass[TCLASS(terr.get(tl))] = byClass[TCLASS(terr.get(tl))] || []).push(tl);
    // rivers: each line across a real river (the river, 1 to 3 squares wide, and two squares of bank on each side), linked to the
    // next line of the same river; generated rivers are grown from these, so every river and bank tile comes from a real map
    const rivers = [[], []], isRv = t => t === 0x10, isBr = t => t === 0x13 || t === 0x14 || t === 0x34;
    for (const m of maps) for (const vert of [0, 1]) { const Ln = vert ? m.h : m.w, Sn = vert ? m.w : m.h, idx = (a, s2) => vert ? a * m.w + s2 : s2 * m.w + a; let prev = null;
      for (let a = 0; a < Ln; a++) { let seg = null, segs = 0, river = 0;
        for (let s2 = 0; s2 < Sn; s2++) { const t = m.terr[idx(a, s2)], wv = isRv(t) || isBr(t); if (wv) river++; if (wv && (s2 === 0 || !(isRv(m.terr[idx(a, s2 - 1)]) || isBr(m.terr[idx(a, s2 - 1)])))) { segs++; seg = [s2, s2]; } else if (wv) seg[1] = s2; }
        if (segs !== 1 || !river || seg[1] - seg[0] > 2 || seg[0] < 1 || seg[1] > Sn - 2) { prev = null; continue; }
        // (a bridge's line counts as river: across a river it is all bridge, no water)
        const lo = Math.max(0, seg[0] - 2), hi = Math.min(Sn - 1, seg[1] + 2), cl = [], tr = []; for (let s2 = lo; s2 <= hi; s2++) { cl.push(m.cells[idx(a, s2)]); tr.push(m.terr[idx(a, s2)]); }
        if (!tr.every(t => LAND.has(t) || isBr(t))) { prev = null; continue; }   // only landscape and bridge tiles: never a blank 'no terrain' tile
        const col = { lo, hi, s0: seg[0], s1: seg[1], cells: cl, terr: tr, bridge: tr.some(isBr), next: null };
        if (prev && seg[0] <= prev.s1 && seg[1] >= prev.s0) prev.next = col; prev = col; rivers[vert].push(col); } }
    const md = { key, maps, cells, tiles, land: new Set(tiles), freq, right, down, left, up, quad, terr, byClass, plain, stamps, rivers, features, game: maps[0].game, ids: maps[0].ids };
    models.set(key, md); return md;
  }
  // a river grown line by line from real ones: it mostly carries on along the same real river, and changes to another real
  // river's line only where the two lines' tiles sit side by side in real maps. Returns [line, offset] per step, or null.
  function riverChain(rng, md, vert, L, S) {
    const cols = md.rivers ? md.rivers[vert ? 1 : 0] : []; if (cols.length < 6) return null;
    const M = vert ? md.down : md.right, pair = (a, b) => { const r = M.get(a); return !!(r && r.has(b)); };
    const fitsIn = (c, o) => c.lo + o >= 0 && c.hi + o <= S - 1 && c.s0 + o >= 2 && c.s1 + o <= S - 3;
    // the river and the bank square beside it must sit side by side in real maps; the outer bank square may differ once per seam
    const joins = (A, oA, B, oB) => { if (B.s0 + oB > A.s1 + oA || B.s1 + oB < A.s0 + oA) return false; let loose = 0;
      for (let t = Math.max(A.lo + oA, B.lo + oB); t <= Math.min(A.hi + oA, B.hi + oB); t++) { if (pair(A.cells[t - oA - A.lo], B.cells[t - oB - B.lo])) continue;
        const outer = t < Math.min(A.s0 + oA, B.s0 + oB) - 1 || t > Math.max(A.s1 + oA, B.s1 + oB) + 1; if (!outer || ++loose > 1) return false; } return true; };
    // whether one line can follow another depends only on their relative position, so it is worked out once per tileset
    const memo = (md.riverJoins || (md.riverJoins = [new Map(), new Map()]))[vert ? 1 : 0];
    const followers = A => { let f = memo.get(A); if (f) return f; f = [];
      for (const B of cols) { if (B === A.next) continue; for (const d of [0, -1, 1]) { const rel = A.s0 - B.s0 + d; if (joins(A, 0, B, rel)) f.push([B, rel]); } }   // every offset that fits, so the river can wander both ways
      memo.set(A, f); return f; };
    const pickOrder = opts => { const out = [], left = opts.slice(); while (left.length) { let x = rng.int(0, 9999) / 10000 * left.reduce((a, o) => a + o[2], 0), j = left.length - 1;
        for (let q = 0; q < left.length; q++) { x -= left[q][2]; if (x <= 0) { j = q; break; } } out.push(left.splice(j, 1)[0]); } return out; };
    for (let attempt = 0; attempt < 12; attempt++) {
      const first = rng.pick(cols), off = Math.floor(S * (0.3 + rng.int(0, 35) / 100)) - first.s0; if (first.bridge || !fitsIn(first, off)) continue;
      // depth first along the map's length, backing up from dead ends, within a budget of steps
      const chain = [[first, off]], stack = [null], course = first.s0 + off; let budget = 60 * L;
      const near = (c, o) => 1 / (1 + Math.abs(c.s0 + o - course) / 2);       // a gentle pull back toward the river's planned course
      const recent = c => { for (let q = Math.max(0, chain.length - 12); q < chain.length; q++) if (chain[q][0] === c) return true; return false; };   // no short repeating wiggles
      const bridgesSoFar = () => chain.filter(([c]) => c.bridge).length, lastBridge = () => { for (let q = chain.length - 1; q >= 0; q--) if (chain[q][0].bridge) return q; return -9; };
      while (chain.length && chain.length < L && budget-- > 0) { const k = chain.length;
        if (!stack[k]) { const [A, oA] = chain[k - 1], nb = bridgesSoFar(), wantB = (!nb && k > L * 0.3) || (nb === 1 && k > L * 0.6 && k - lastBridge() >= L * 0.25), bridgeOk = k < L - 1 && !A.bridge && k - lastBridge() >= 5, opts = [];
          if (A.next && fitsIn(A.next, oA) && (!A.next.bridge || bridgeOk)) opts.push([A.next, oA, (wantB && A.next.bridge ? 40 : 8) * near(A.next, oA)]);
          for (const [B, rel] of followers(A)) { if (B.bridge && !bridgeOk) continue; const oB = oA + rel; if (fitsIn(B, oB)) opts.push([B, oB, (wantB && B.bridge ? 6 : 1) * near(B, oB) * (recent(B) ? 0.1 : 1)]); }
          // a river splits the map, so it needs a bridge before it reaches the far side
          if (!nb && k >= L - 2) { stack[k] = []; } else stack[k] = pickOrder(opts); }
        const nx = stack[k].shift();
        if (nx) { chain.push([nx[0], nx[1]]); stack[k + 1] = null; } else { chain.pop(); stack.length = k; } }
      if (chain.length === L && bridgesSoFar() >= 1) return chain; }
    return null;
  }
  // how much of a generated map is dressed with real features, and which kinds each theme favours
  const FEATURE_SHARE = { mountain: 0.18, hills: 0.16, snow: 0.14, plains: 0.18, forest: 0.14, river: 0.1, desert: 0.16, marsh: 0.1 };
  const FEATURE_PREF = { mountain: { peak: 6, mountain: 6, grove: 1 }, hills: { peak: 3, mountain: 3, grove: 2 }, snow: { peak: 3, mountain: 2, grove: 2 },
    plains: { grove: 2, peak: 4, mountain: 3, water: 2 }, forest: { grove: 6, peak: 1 }, river: { grove: 3, peak: 1, water: 1 }, desert: { peak: 5, mountain: 3, grove: 1 }, marsh: { grove: 2, water: 3 } };
  const BELT_SHARE = { mountain: 0.14, hills: 0.14, snow: 0.12, plains: 0.16, forest: 0.1, river: 0.1, desert: 0.08, marsh: 0.08 };
  function layout(rng, w, h, theme, md) {
    const want = Array(w * h).fill('open'), n = noise2(rng.int(1, 1e9)), n2 = noise2(rng.int(1, 1e9)), has = c => (md.byClass[c] || []).length > 0;
    const fbm2 = (x, y, s) => (n(x / s, y / s) * 0.65 + n2(x / (s / 2), y / (s / 2)) * 0.35);
    const cover = { forest: 0.5, marsh: 0.32, hills: 0.28, plains: 0.2, river: 0.22, coast: 0.18, mountain: 0.22, snow: 0.22, desert: 0.08 }[theme] ?? 0.22;
    const rough = { mountain: 0.34, hills: 0.26, snow: 0.24, desert: 0.12 }[theme] ?? 0.1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x, a = fbm2(x, y, 5), b = fbm2(x + 40, y + 40, 6);
      const ridge = 1 - Math.abs(2 * n(x / 7 + 13, y / 7 + 29) - 1), ridgy = theme === 'mountain' || theme === 'hills';
      if (has('rough') && b > 1 - rough * 1.2) want[i] = 'rough'; else if (has('cover') && a > 1 - cover * 1.1) want[i] = 'cover'; else if (theme === 'desert' && has('sand') && a < 0.45) want[i] = 'sand'; }
    if (has('water') && (theme === 'coast' || theme === 'marsh')) { const side = theme === 'coast' ? 0 : rng.int(0, 3), depth = theme === 'coast' ? 4 + rng.int(0, 2) : 2 + rng.int(0, 2); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = [y, h - 1 - y, x, w - 1 - x][side] + (n(x / 3, y / 3) - 0.5) * 2.5; if (d < depth) want[y * w + x] = 'water'; } want.seaSide = side; }
    if (has('water') && theme === 'river') { const v0 = rng.chance(50);
      for (const vert of [v0, !v0]) { const L = vert ? h : w, S = vert ? w : h, chain = riverChain(rng, md, vert, L, S); if (!chain) continue;
        const stamp = []; chain.forEach(([c, o], k) => c.cells.forEach((tl, j) => { const s2 = c.lo + j + o, x = vert ? s2 : k, y = vert ? k : s2, i = y * w + x, t = c.terr[j];
          stamp.push([i, tl]); want[i] = t === 0x10 ? 'water' : (t === 0x13 || t === 0x14 || t === 0x34) ? 'bridge' : 'open'; }));
        want.riverStamp = stamp; want.riverPlan = { vert, ending: 'edge', L, S }; break; } }
    if (has('water') && theme === 'river' && !want.riverPlan) { const vert = rng.chance(50), L = vert ? h : w, S = vert ? w : h; let c = Math.floor(S * (0.3 + rng.int(0, 35) / 100));
      const ending = rng.pick(['edge', 'edge', 'lake']), stopAt = ending === 'lake' ? Math.floor(L * (0.6 + rng.int(0, 15) / 100)) : L;
      const crossings = new Set([Math.floor(stopAt * (0.25 + rng.int(0, 15) / 100)), Math.floor(stopAt * (0.55 + rng.int(0, 15) / 100))]); let drift = 0, endC = c;
      for (let k = 0; k < stopAt; k++) { const stay = crossings.has(k) || crossings.has(k - 1); if (!stay && k % 2 === 0) { drift = Math.max(-1, Math.min(1, drift + rng.int(-1, 1))); c = Math.max(2, Math.min(S - 5, c + (rng.chance(45) ? drift : 0))); } endC = c;
        for (let d = 0; d < 3; d++) { const x = vert ? c + d : k, y = vert ? k : c + d; want[y * w + x] = crossings.has(k) && has('bridge') ? 'bridge' : 'water'; } }
      // the river's end: a coast along the far edge, or a lake it runs into
      if (ending === 'sea') for (let k = L - 3; k < L; k++) for (let s2 = 0; s2 < S; s2++) { const wob = (n(s2 / 3, k / 3) - 0.5) * 2; if (k >= L - 2 + wob) { const x = vert ? s2 : k, y = vert ? k : s2; if (x >= 0 && y >= 0 && x < w && y < h) want[y * w + x] = 'water'; } }
      if (ending === 'lake') { const cxL = vert ? endC + 1 : stopAt + 1, cyL = vert ? stopAt + 1 : endC + 1, rL = 2 + rng.int(0, 1); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.hypot(x - cxL, y - cyL) + (n(x / 2, y / 2) - 0.5) * 1.5; if (d <= rL) want[y * w + x] = 'water'; } }
      want.riverPlan = { vert, ending, L, S }; }
    // lanes and chokepoints, as real maps have: ridge-shaped belts of forest, broken by passes. Everyone crosses forest slowly
    // (mounted units most of all) and is harder to hit inside it, so the battle runs along the open lanes between the belts.
    if (theme !== 'coast' && (has('rough') || has('cover'))) { const share = BELT_SHARE[theme] ?? BELT_SHARE.plains, n3 = noise2(rng.int(1, 1e9)), sc = 6 + rng.int(0, 3), cand = [];
      const core = has('cover') ? 'cover' : 'rough', side = core;     // forest builds cleanly from real tilesets; mountain tiles mostly do not
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (want[i] === 'water' || want[i] === 'bridge' || want[i] === 'sand' && theme !== 'desert') continue;
        if (want.riverStamp && want.riverStamp.some(([j]) => j === i)) continue; if (n2(x / 4 + 50, y / 4 + 50) > 0.7) continue;     // passes through the belts
        cand.push([1 - Math.abs(2 * n3(x / sc + 7, y / sc + 3) - 1), i]); }
      cand.sort((a, b) => b[0] - a[0]); const belt = cand.slice(0, Math.round(share * w * h)).map(c => c[1]);
      for (const i of belt) want[i] = core;
      for (const i of belt) { const x = i % w, y = Math.floor(i / w); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, j = ny * w + nx;
          if (nx >= 0 && ny >= 0 && nx < w && ny < h && want[j] === 'open' && rng.chance(40)) want[j] = side; } } }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if ((x < 3 || x >= w - 3) && want[y * w + x] !== 'water' && rng.chance(65)) want[y * w + x] = 'open';
    return want;
  }
  function pickWeighted(rng, cand) { let tot = 0; for (const [, wg] of cand) tot += wg; let r = rng.int(0, 1e6) / 1e6 * tot; for (const [tl, wg] of cand) { r -= wg; if (r <= 0) return tl; } return cand[cand.length - 1][0]; }
  function build(rng, md, w, h, want, theme) {
    const cells = new Array(w * h).fill(-1), fixed = new Uint8Array(w * h), fits = (a, M, b) => { const r = M.get(a); return !!(r && r.has(b)); };
    const edgeW = new Uint8Array(w * h), nearRough = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (want[y * w + x] === 'rough') for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h) nearRough[ny * w + nx] = 1; }
    if (theme === 'river') for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (want[i] !== 'water') continue; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && want[ny * w + nx] !== 'river' && want[ny * w + nx] !== 'water' && want[ny * w + nx] !== 'bridge') edgeW[i] = 1; } }
    const bias = (tl, i) => { const t0 = md.terr.get(tl), c = TCLASS(t0); if (c === 'bridge') return want[i] === 'bridge' ? 12 : 0.002;
      if (t0 === 0x26 && !nearRough[i]) return 0.03;
      if (edgeW[i] && c === 'open') return 1.5;
      // water stays where the layout planned it
      if (c === 'water' && want[i] !== 'water' && want[i] !== 'bridge') return 0.006; return c === want[i] ? 9 : c === 'open' && want[i] !== 'water' && want[i] !== 'bridge' ? 0.6 : want[i] === 'bridge' && (c === 'water' || c === 'river') ? 0.5 : 0.08; };
    if (want.riverStamp) for (const [i, tl] of want.riverStamp) { cells[i] = tl; fixed[i] = 1; }
    if (md.features && md.features.length) { const pref = FEATURE_PREF[theme] || FEATURE_PREF.plains, target = (FEATURE_SHARE[theme] ?? FEATURE_SHARE.plains) * w * h;
      const pool = md.features.filter(F => (pref[F.kind] || 0) > 0 && F.w <= w - 2 && F.h <= h - 2), tot = pool.reduce((a, F) => a + pref[F.kind], 0); let covered = 0;
      for (let tries = 0; pool.length && covered < target && tries < 300; tries++) { let r = rng.int(0, 9999) / 10000 * tot, F = pool[pool.length - 1]; for (const f of pool) { r -= pref[f.kind]; if (r <= 0) { F = f; break; } }
        const x0 = rng.int(1, Math.max(1, w - F.w - 1)), y0 = rng.int(1, Math.max(1, h - F.h - 1)); let ok = true;
        for (let y = y0 - 2; y <= y0 + F.h + 1 && ok; y++) for (let x = x0 - 2; x <= x0 + F.w + 1; x++) { if (x < 0 || y < 0 || x >= w || y >= h) continue; const i = y * w + x; if (fixed[i] || want[i] === 'water' || want[i] === 'bridge') { ok = false; break; } }
        if (!ok) continue;
        for (let y = 0; y < F.h; y++) for (let x = 0; x < F.w; x++) { const i = (y0 + y) * w + x0 + x; cells[i] = F.cells[y * F.w + x]; fixed[i] = 1; want[i] = TCLASS(F.terr[y * F.w + x]); }
        covered += F.size; } }
    // buildings first, on open ground, with room around them
    const nStamps = md.stamps.length ? ({ plains: 4, forest: 2, hills: 3, river: 3, coast: 3, mountain: 2, desert: 2, marsh: 2, snow: 2 }[theme] ?? 3) + rng.int(0, 2) : 0;
    for (let k = 0, tries = 0; k < nStamps && tries < 60; tries++) { const S = rng.pick(md.stamps), x0 = rng.int(1, Math.max(1, w - S.w - 1)), y0 = rng.int(1, Math.max(1, h - S.h - 1)); let ok = x0 + S.w < w - 1 && y0 + S.h < h - 1;
      for (let y = y0 - 1; y <= y0 + S.h && ok; y++) for (let x = x0 - 1; x <= x0 + S.w; x++) if (want[y * w + x] === 'water' || fixed[y * w + x]) { ok = false; break; }
      if (!ok) continue; for (let y = 0; y < S.h; y++) for (let x = 0; x < S.w; x++) { const i = (y0 + y) * w + x0 + x; cells[i] = S.cells[y * S.w + x]; fixed[i] = 1; }
      const pl = [...md.plain][0]; for (let y = y0 - 1; y <= y0 + S.h; y++) for (let x = x0 - 1; x <= x0 + S.w; x++) { const i = y * w + x; if (!fixed[i]) { cells[i] = pl; fixed[i] = 2; want[i] = 'open'; } } k++; }
    // landscape grown from the pairings seen in real maps
    const sideS = want.seaSide, upward = sideS === 1, leftward = sideS === 3, plain = !upward && !leftward;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) { const y = upward ? h - 1 - yy : yy, x = leftward ? w - 1 - xx : xx, i = y * w + x; if (fixed[i]) continue;
      const hx = leftward ? x + 1 : x - 1, vy = upward ? y + 1 : y - 1, L = hx >= 0 && hx < w ? cells[y * w + hx] : -1, U = vy >= 0 && vy < h ? cells[vy * w + x] : -1; let cand = [];
      const fromL = L >= 0 ? (leftward ? md.left : md.right).get(L) : null, fromU = U >= 0 ? (upward ? md.up : md.down).get(U) : null, Q = plain && x && y ? md.quad.get(L + ',' + U + ',' + cells[i - w - 1]) : null;
      // tiles that fit both neighbours; those that also complete a 2x2 pattern seen in real maps are preferred, never required
      if (fromL && fromU) for (const [tl, c] of fromL) if (md.land.has(tl) && fromU.has(tl)) cand.push([tl, Math.sqrt(c * fromU.get(tl)) * bias(tl, i) * (Q && Q.has(tl) ? 4 : 1)]);
      if (!cand.length && (fromL || fromU)) for (const [tl, c] of (fromL || fromU)) if (md.land.has(tl)) cand.push([tl, c * bias(tl, i)]);
      if (!cand.length) for (const tl of md.tiles) cand.push([tl, Math.sqrt(md.freq.get(tl)) * bias(tl, i)]);
      cells[i] = pickWeighted(rng, cand); }
    const bad = i => { const x = i % w, y = (i / w) | 0, tl = cells[i]; let b = 0; if (x && !fits(cells[i - 1], md.right, tl)) b++; if (x + 1 < w && !fits(tl, md.right, cells[i + 1])) b++; if (y && !fits(cells[i - w], md.down, tl)) b++; if (y + 1 < h && !fits(tl, md.down, cells[i + w])) b++; return b; };
    for (let pass = 0; pass < 8; pass++) { let changed = 0;
      for (let i = 0; i < w * h; i++) { if (fixed[i] === 1 || !bad(i)) continue; const x = i % w, y = (i / w) | 0, keep = cells[i]; let best = keep, bb = bad(i);
        const pool = new Set(); for (const [nb, M, dir] of [[x ? cells[i - 1] : -1, md.right, 0], [y ? cells[i - w] : -1, md.down, 0]]) if (nb >= 0) for (const tl of (M.get(nb) || new Map()).keys()) if (md.land.has(tl)) pool.add(tl);
        const allowed = [...pool].filter(tl => bias(tl, i) > 0.01), suits = window.__MG_STRICT ? allowed.filter(tl => bias(tl, i) >= 0.5) : [], use = suits.length ? suits : allowed.length ? allowed : [...pool];
        for (const tl of use) { cells[i] = tl; const b = bad(i) - (TCLASS(md.terr.get(tl)) === want[i] ? 0.3 : 0); if (b < bb || (suits.length && bias(keep, i) < 0.5 && bias(best, i) < 0.5)) { bb = b; best = tl; } } cells[i] = best; if (best !== keep) changed++; }
      if (!changed) break; }
    let pairs = 0, unseen = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (x + 1 < w) { pairs++; if (!fits(cells[i], md.right, cells[i + 1])) unseen++; } if (y + 1 < h) { pairs++; if (!fits(cells[i], md.down, cells[i + w])) unseen++; } }
    let quads = 0, qUnseen = 0; for (let y = 1; y < h; y++) for (let x = 1; x < w; x++) { const i = y * w + x, Q = md.quad.get(cells[i - 1] + ',' + cells[i - w] + ',' + cells[i - w - 1]); quads++; if (!Q || !Q.has(cells[i])) qUnseen++; }
    return { cells, terr: cells.map(tl => md.terr.get(tl)), unseen: unseen / pairs, quadUnseen: qUnseen / quads };
  }
  // Casim: always a way between the two halves. Walkable ground is judged by the ROM's own foot movement table (doors
  // open); the largest connected area (found square by square, not seeded from a whole edge, which joined separate areas)
  // must hold at least 97% of the walkable ground and every throne, fort, gate, village, house, chest and door, and touch
  // all four edges of the map
  function playable(w, h, terr) { const pass = t => footWalk(t);
    const open = terr.filter(pass).length / terr.length; if (open < 0.55) return false;
    const rid = new Int32Array(w * h).fill(-1), sizes = [];
    for (let i0 = 0; i0 < w * h; i0++) { if (rid[i0] >= 0 || !pass(terr[i0])) continue; const r = sizes.length, q = [i0]; rid[i0] = r; let n = 0;
      while (q.length) { const i = q.pop(); n++; const x = i % w, y = (i / w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (rid[j] < 0 && pass(terr[j])) { rid[j] = r; q.push(j); } } } sizes.push(n); }
    if (!sizes.length) return false; const walk = sizes.reduce((a2, b2) => a2 + b2, 0), main = sizes.indexOf(Math.max(...sizes)); if (sizes[main] < walk * 0.97) return false;
    const key = t => t === 0x1F || t === 0x0A || t === 0x0B || t === 0x23 || t === 0x03 || t === 0x04 || t === 0x05 || t === 0x21 || t === 0x1E;
    let L = 0, R = 0, T = 0, B = 0; for (let i = 0; i < w * h; i++) { if (key(terr[i]) && rid[i] !== main) return false; if (rid[i] !== main) continue; const x = i % w, y = (i / w) | 0; if (x === 0) L++; if (x === w - 1) R++; if (y === 0) T++; if (y === h - 1) B++; }
    return L >= 2 && R >= 2 && T >= 1 && B >= 1; }
  function generate(rng, base, theme, size) {
    if (theme === 'coast') return null;     // coasts come from real maps, which draw shorelines properly
    const md = model(keyOf(base)); if (!md || md.cells < 300 || md.tiles.length < 20) return null;
    // the main way: stitched from blocks of real maps (patchwork); the tile-by-tile builder below is the fallback (and grows rivers)
    { const pw = patchwork(rng, base, theme, size || { w: Math.max(12, Math.min(28, base.w + rng.int(-3, 3))), h: Math.max(10, Math.min(22, base.h + rng.int(-3, 3))) }); if (pw) return pw; }
    for (let attempt = 0; attempt < 14; attempt++) {
      const w = size ? size.w : Math.max(12, Math.min(28, base.w + rng.int(-3, 3))), h = size ? size.h : Math.max(10, Math.min(22, base.h + rng.int(-3, 3)));
      const want = layout(rng, w, h, theme, md), r = build(rng, md, w, h, want, theme);
      if (r.unseen > 0.04 || !playable(w, h, r.terr)) continue;
      const isW = t => t === 0x10 || t === 0x15 || t === 0x16 || t === 0x3C || t === 0x13 || t === 0x14 || t === 0x34;
      if (theme === 'river' && want.riverPlan) { const vertR = want.riverPlan.vert, isB = t => t === 0x13 || t === 0x14 || t === 0x34, isWt = t => t === 0x10 || t === 0x15 || t === 0x16;
        let bad = false, bridges = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const t0 = r.terr[y * w + x]; if (!isB(t0)) continue; bridges++; if (x === 0 || x === w - 1) bad = true;
          if (vertR && y + 1 < h && isB(r.terr[(y + 1) * w + x])) bad = true; if (!vertR && x + 1 < w && isB(r.terr[y * w + x + 1])) bad = true; }
        if (!vertR && bridges === 0) bad = true;
        const runOn = cellsAlong => { let run = 0, best = 0; for (const i of cellsAlong) { if (isWt(r.terr[i]) || isB(r.terr[i])) { run++; best = Math.max(best, run); } else run = 0; } return best; };
        const top = [], bot = [], lef = [], rig = []; for (let x = 0; x < w; x++) { top.push(x); bot.push((h - 1) * w + x); } for (let y = 0; y < h; y++) { lef.push(y * w); rig.push(y * w + w - 1); }
        if ([top, bot, lef, rig].some(line => runOn(line) >= 4)) bad = true;
        if (bad) continue; }
      if (want.riverPlan) { const P = want.riverPlan, seen = new Uint8Array(w * h), q = []; for (let s2 = 0; s2 < P.S; s2++) { const x = P.vert ? s2 : 0, y = P.vert ? 0 : s2, i = y * w + x; if (isW(r.terr[i])) { seen[i] = 1; q.push(i); } }
        let reach = false, lakeN = 0, mainN = 0; while (q.length) { const i = q.pop(), x = i % w, y = (i / w) | 0; const along = P.vert ? y : x; mainN++; if (r.terr[i] === 0x16 || r.terr[i] === 0x15) lakeN++; if (along >= P.L - 1) reach = true;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!seen[j] && isW(r.terr[j])) { seen[j] = 1; q.push(j); } } }
        // the river must really end somewhere (the bottom edge or a real lake), and be one river, not pieces
        if (P.ending === 'lake' && lakeN >= 4) reach = true; let allW = 0; for (let i = 0; i < w * h; i++) if (isW(r.terr[i])) allW++;
        if (!reach || mainN < allW * 0.85) continue; }
      if (theme === 'mountain' || theme === 'hills') { let planned = 0, got = 0; for (let i = 0; i < w * h; i++) if (want[i] === 'rough') { planned++; if (TCLASS(r.terr[i]) === 'rough') got++; } if (planned > 10 && got < planned * 0.5) continue; }
      return { src: 'gen', game: md.game, ids: md.ids, w, h, cells: r.cells, terr: r.terr, name: '', credit: `Generated from ${md.maps.length} map${md.maps.length > 1 ? 's' : ''}`, unseen: r.unseen, quadUnseen: r.quadUnseen };
    }
    return null;
  }
  // ---- patchwork (prototype): a map stitched from blocks of real maps of the same tileset. Each block is a 6x6 window of a real
  // map; a block goes down only where its edges meet the blocks already placed with tile pairs seen in real maps, so the seams
  // match by construction and every area looks like part of an official map. The theme decides which blocks are favoured.
  const PATCH_B = 6, PATCH_BAD = new Set([0x00, 0x17, 0x18, 0x1A, 0x1B, 0x1E, 0x1F, 0x20, 0x21, 0x23, 0x2C, 0x2D, 0x2E]);
  function patchBlocks(md) {
    if (md.blocks) return md.blocks; const B = PATCH_B, out = [];
    for (let mi = 0; mi < md.maps.length; mi++) { const m = md.maps[mi];
      for (let y = 0; y + B <= m.h; y++) for (let x = 0; x + B <= m.w; x++) { const cl = new Array(B * B), tr = new Array(B * B); let ok = true;
        for (let j = 0; j < B * B && ok; j++) { const i = (y + Math.floor(j / B)) * m.w + x + j % B, t = m.terr[i]; if (PATCH_BAD.has(t)) ok = false; cl[j] = m.cells[i]; tr[j] = t; }
        if (ok) out.push({ cells: cl, terr: tr, src: mi * 10000 + y * 100 + x }); } }
    md.blocks = out; return out;
  }
  // how much a theme wants a block: its features (forest, mountain, peaks, water, villages, forts, snags) by the theme's taste
  const PATCH_TASTE = { mountain: { 0x11: 2, 0x12: 3, 0x26: 2, 0x0C: 0.5, 0x10: -0.15, 0x13: -0.3, 0x14: -0.3 }, hills: { 0x11: 1.5, 0x12: 2, 0x26: 1.5, 0x0C: 1, 0x10: -0.15, 0x13: -0.3, 0x14: -0.3 }, forest: { 0x0C: 2, 0x0D: 2.5, 0x11: 0.3, 0x10: -0.15, 0x13: -0.3, 0x14: -0.3 },
    plains: { 0x0C: 1, 0x11: 1, 0x12: 1, 0x26: 1, 0x03: 2, 0x05: 2, 0x0A: 2, 0x33: 2, 0x10: -0.15, 0x13: -0.3, 0x14: -0.3 }, river: { 0x10: 2, 0x13: 3, 0x14: 3, 0x0C: 1, 0x33: 2 },
    desert: { 0x0E: 1.5, 0x0F: 1.5, 0x11: 1, 0x12: 1.5, 0x10: -0.15, 0x13: -0.3, 0x14: -0.3 }, snow: { 0x11: 1.5, 0x12: 2, 0x0C: 1 }, marsh: { 0x16: 2, 0x0C: 1 } };
  function patchwork(rng, base, theme, size) {
    const md = model(keyOf(base)); if (!md || md.cells < 300) return null; const blocks = patchBlocks(md); if (blocks.length < 60) return null;
    const B = PATCH_B, taste = PATCH_TASTE[theme] || PATCH_TASTE.plains, fits = (a, M, b) => { const r = M.get(a); return !!(r && r.has(b)); };
    const like = bl => { let v = 0; for (const t of bl.terr) v += taste[t] || 0; return v; };
    const w = size ? size.w : base.w, h = size ? size.h : base.h;
    for (let attempt = 0; attempt < 6; attempt++) {
      const cells = new Array(w * h).fill(-1), terr = new Array(w * h).fill(0x01), used = new Map(); let seams = 0;
      for (let by = 0; by < h; by += B) for (let bx = 0; bx < w; bx += B) { const bw = Math.min(B, w - bx), bh = Math.min(B, h - by);
        // the blocks whose edges meet what is already down with the fewest unseen pairs; among those, favour the theme's taste
        let best = 1e9, cand = [];
        for (const bl of blocks) { let c = 0;
          if (bx > 0) for (let r = 0; r < bh && c <= best; r++) if (!fits(cells[(by + r) * w + bx - 1], md.right, bl.cells[r * B])) c++;
          if (by > 0) for (let q = 0; q < bw && c <= best; q++) if (!fits(cells[(by - 1) * w + bx + q], md.down, bl.cells[q])) c++;
          if (c < best) { best = c; cand = [bl]; } else if (c === best) cand.push(bl); }
        // bridges should not pile up side by side across a seam: a block whose bridges would touch bridges already down is unlikely
        const isBr = t => t === 0x13 || t === 0x14 || t === 0x34, brNear = bl => { let n = 0; for (let r = 0; r < bh; r++) for (let q = 0; q < bw; q++) { if (!isBr(bl.terr[r * B + q])) continue;
            for (const [dx, dy] of [[-1, 0], [0, -1], [1, 0], [0, 1]]) { const xx = bx + q + dx, yy = by + r + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h || (xx >= bx && xx < bx + bw && yy >= by && yy < by + bh)) continue; if (isBr(terr[yy * w + xx])) n++; } } return n; };
        // on themes that are not about rivers, a block that would start a new river (river inside it, none flowing in at its edges) is rare
        const wet = t => t === 0x10, inflow = (bx > 0 && [...Array(bh).keys()].some(r => wet(terr[(by + r) * w + bx - 1]))) || (by > 0 && [...Array(bw).keys()].some(q => wet(terr[(by - 1) * w + bx + q])));
        const startsRiver = bl => theme !== 'river' && !inflow && bl.terr.some(wet);
        let tot = 0; const wts = cand.map(bl => { const v = Math.max(0.05, 0.4 + like(bl)) / (1 + 4 * (used.get(bl.src) || 0)) / (1 + 6 * brNear(bl)) * (startsRiver(bl) ? 0.03 : 1); tot += v; return v; });
        let x = rng.int(0, 9999) / 10000 * tot, pick = cand[cand.length - 1]; for (let k = 0; k < cand.length; k++) { x -= wts[k]; if (x <= 0) { pick = cand[k]; break; } }
        used.set(pick.src, (used.get(pick.src) || 0) + 1); seams += best;
        for (let r = 0; r < bh; r++) for (let q = 0; q < bw; q++) { const i = (by + r) * w + bx + q; cells[i] = pick.cells[r * B + q]; terr[i] = pick.terr[r * B + q]; } }
      let pairs = 0, unseen = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (x + 1 < w) { pairs++; if (!fits(cells[i], md.right, cells[i + 1])) unseen++; } if (y + 1 < h) { pairs++; if (!fits(cells[i], md.down, cells[i + w])) unseen++; } }
      if (unseen / pairs > 0.04 || !playable(w, h, terr)) continue;
      // a river-themed map has a river with a crossing; otherwise the generator's grown rivers do the job
      if (theme === 'river' && (terr.filter(t => t === 0x10).length < 8 || !terr.some(t => t === 0x13 || t === 0x14 || t === 0x34))) continue;
      return { src: 'gen', game: md.game, ids: md.ids, w, h, cells, terr, name: '', credit: `Generated from ${md.maps.length} map${md.maps.length > 1 ? 's' : ''}`, unseen: unseen / pairs, patch: true, seams };
    }
    return null;
  }
  return { generate, model, keyOf, layout, build, playable, patchwork };
})();
// a small value-noise helper the map generator shares
function noise2(seed) { const r = RNG(seed), P = []; for (let i = 0; i < 256; i++) P.push(r.int(0, 1e6) / 1e6);
  const h = (x, y) => P[((x * 73856093) ^ (y * 19349663)) & 255], f = t => t * t * (3 - 2 * t);
  return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = f(x - xi), v = f(y - yi), a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }; }

function lastWords(camp, u) { return speak(camp, u, 'last', facts(camp, null)); }

function endChapter(camp, st, result) {
  const rng = camp.rng, lord = camp.army[0];
  for (const u of camp.army) if (u._relicBoost || u.awake) relicSleep(u);
  remount(camp.army); remount(st.units);
  let dead = st.units.filter(u => u.team === 'player' && u.hp <= 0);
  const traitorLines = []; { const tr = camp.army.filter(u => u.traitorTurned); for (const t of tr) { camp.army.splice(camp.army.indexOf(t), 1); traitorLines.push(['', t.hp > 0 ? `${t.name} slipped away with the enemy. Nobody will trust a recruit so quickly again.` : `${t.name} died a traitor. The army does not mourn.`]); } }   // before the dead are cleared, and never mourned
  const lines = []; lines.push(...traitorLines); camp._sideCap = st.side ? st.sideLvCap : null;   // the second army's level cap reaches its recruits
  for (const r of camp.relics || []) { if (r.owner === 'enemy') continue; const h = camp.army.find(u => u.id === r.holder && u.relic === r.id); if (!h || dead.includes(h)) continue;      // held chapters count whether or not the holder was deployed
    const before = bondRank(r); r.held = (r.held || 0) + 1; const after = bondRank(r); if (after > before) lines.push(['', `${h.name}'s bond with ${r.name} deepens to rank ${BOND_NAME[after]}.`]);
    // fifteen chapters with one holder: a title and a second name (so a book's first three or four relics can earn it)
    if (r.held >= 15 && !r.alias) { const ar = RNG(((camp.seed || 0) ^ 0xA11A5) + r.id * 101); r.alias = `${h.name}'s ${ar.pick(RELIC_ALIAS)}`; h.title = `${h.name} the ${RELIC_TITLE[relicKind(r)] || 'Bearer'}`;
      const t = relicDeed(r, 'After fifteen battles in the hands of {holder}, the army began calling it {alias}.', { holder: h.name, alias: r.alias, place: '' }); lines.push(['', t + ` They call its bearer ${h.title}.`]); } }
  { const jb = ((st.chapter - 1) % 30) + 1, r = (camp.relics || []).find(x => x.owner === 'enemy' && x.chapter === (st.relicKey ?? st.chapter));
    for (const t of st.relicDeeds || []) lines.push(['', t]);
    if (r && result === 'victory') { r.owner = 'army'; const pr = RNG(((camp.seed || 0) ^ 0x51EC7) + st.chapter * 613), lordU = camp.army.find(u => u.leader && u.hp > 0 && !dead.includes(u));
      const free = camp.army.filter(u => u.hp > 0 && !dead.includes(u) && (u.relic === undefined || u.relic === null));
      // the first relic of a book goes to the lord; the rest to a random free unit, five times likelier if its crest matches the relic's hero
      let who = jb === 5 && lordU && (lordU.relic === undefined || lordU.relic === null) ? lordU : null;
      if (!who && free.length) { const w = free.map(u => resonant(camp, u, r) ? 5 : 1), tot = w.reduce((x, y) => x + y, 0); let x = pr.int(0, 9999) / 10000 * tot; who = free[free.length - 1]; for (let i = 0; i < free.length; i++) { x -= w[i]; if (x <= 0) { who = free[i]; break; } } }
      r.found = { chapter: st.chapter, place: st.place || '' }; lines.push(['', `Among the things ${r.holderName || 'the commander'} carried lay ${r.name}. ${r.lore}`]); r.holder = null; r.holderName = '';
      if (who) { bondRelic(camp, r, who); lines.push(['', resonant(camp, who, r) ? `${r.name} answers to ${who.name}, who carries the Crest of ${r.hero}.` : `${r.name} answers to ${who.name}.`]); }
      else lines.push(['', `No one is free to take up ${r.name} yet. It waits with the baggage.`]);
      (camp.history = camp.history || []).push({ type: 'relic', chapter: st.chapter, relic: r.name, holder: who ? who.name : '' }); } }
  if ((OPTIONS.casual === 'on' || OPTIONS.casual === true) && result !== 'defeat') { for (const d of dead) { d.hp = d.maxhp; lines.push(['', `${d.name} was carried from the field and will recover before the next battle.`]); } dead = []; }
  for (const d of dead) { camp.fallen.push({ name: d.name, cls: className(d), level: d.level, chapter: st.chapter, place: st.place });
    lines.push([lord.name, STORY.pick(camp, 'mo', STORY.P.lord_mourns, rng, facts(camp, st, { name: d.name }))]);
    const mate = Object.entries(camp.supports || {}).filter(([k, p]) => k.split('-').map(Number).includes(d.id) && p >= 12).sort((a, b) => b[1] - a[1]).map(([k]) => camp.army.find(o => o.id === k.split('-').map(Number).find(x => x !== d.id) && o.hp > 0)).find(Boolean);
    if (mate) lines.push([mate.name, speak(camp, mate, 'mourn', facts(camp, st, { name: d.name }))]); }
  const rivalUnit = st.units.find(u => u.rival);
  const spareRival = (() => { const c = convOf(camp); return c.on && c.kind === 'rival' && c.state === 'before'; })();
  if (rivalUnit && camp.rival) { if (rivalUnit.hp <= 0 && !rivalUnit.escaped && !spareRival) { camp.rival.defeated = true; lines.push([lord.name, STORY.pick(camp, 'rd', STORY.P.rival_down, rng, facts(camp, st, { rival: camp.rival.name }))]); } else { camp.rival.meetings++; if (rivalUnit.escaped || rivalUnit.hp <= 0) lines.push([camp.rival.name, STORY.pick(camp, 're', STORY.P.rival_escape, rng, facts(camp, st))]); } }
  camp.gold = Math.max(0, (camp.gold || 0) + (st.gold || 0) - (st.spent || 0) + (result === 'victory' ? 300 + st.chapter * 40 : 0) + (st.refugees || 0) * 300);
  if (st.gold) lines.push(['', `The villages gave ${st.gold} gold. The army now has ${camp.gold}.`]);
  camp.army = camp.army.filter(u => u.hp > 0);
  // people met during the chapter: joiners stay, the ally leader may follow, saved villages and refugees are thanked
  const fit = u => { u.team = 'player'; u.role = null; u.hunted = false; u.hp = u.maxhp; voice(camp, u); restock(rng, u, st.chapter, camp); };
  const sideFull = () => !!st.side && camp.army.filter(u => u.hp > 0).length >= 15;   // the second army holds at most 15 (Casim)
  for (const id of st.joined || []) { const u = st.units.find(o => o.id === id); if (u && u.hp > 0 && !camp.army.includes(u)) { fit(u); camp.army.push(u); (st.newRecruits = st.newRecruits || []).push(u.name); lines.push(['', STORY.pick(camp, 'joinnote', ['{name} joins the army.', '{name} is now part of the army.', '{name} takes a place in the line.', '{name} marches with the army from here on.'], rng, Object.assign(facts(camp, st), { name: u.name }))]); } }
  if (result === 'victory' && st.allyLeader && !sideFull()) { const a = st.units.find(o => o.id === st.allyLeader); if (a && a.hp > 0) { fit(a); camp.army.push(a); (st.newRecruits = st.newRecruits || []).push(a.name); lines.push([a.name, STORY.pick(camp, 'evalliance_join', EV.alliance_join, rng, facts(camp, st))]); } }
  if (st.refugees) lines.push(['', STORY.pick(camp, 'evrefugee_end', EV.refugee_end, rng, facts(camp, st, { count: NUM[st.refugees] ? NUM[st.refugees].charAt(0).toUpperCase() + NUM[st.refugees].slice(1) : st.refugees, reward: st.refugees * 300 }))]);
  if (st.pleaSaved && result === 'victory' && !sideFull()) { const cls = POOL ? poolPick(rng, c => !c.promoted && !c.monster, false) : 'Fighter'; const r = makeUnit(rng, cls, 'player', Math.max(1, Math.round(avgLevel(camp.army)) - 1)); r.name = uniqueName(camp, rng); voice(camp, r); camp.army.push(r); (st.newRecruits = st.newRecruits || []).push(r.name);
    lines.push(['', STORY.pick(camp, 'evplea_saved', EV.plea_saved, rng, facts(camp, st))]); lines.push([r.name, speak(camp, r, 'recruit', facts(camp, st))]); }
  for (const it of st.convoy || []) { const who = camp.army.slice().sort((a, b) => (a.items || []).length - (b.items || []).length).find(u => (u.items || []).length < MAXITEMS && (canWield(u, it.id) || WEAPONS[it.id].consumable));
    if (who) { who.items.push(it); (st.handed = st.handed || []).push(`the ${WEAPONS[it.id].name} to ${who.name}`); } else { (camp.convoy = camp.convoy || []).push(it); (st.stored = st.stored || []).push(WEAPONS[it.id].name); } }
  if (st.handed || st.stored) lines.push(['', [st.handed ? `Spoils went out: ${listJoin(st.handed)}.` : '', st.stored ? `Stored in the convoy: ${listJoin(counted(st.stored))}.` : ''].filter(Boolean).join(' ')]);
  // supports: pairs who fought side by side reach C, B and A
  const ranks = [[12, 'C'], [28, 'B'], [48, 'A']];
  for (const [k, pts] of Object.entries(camp.supports || {})) {
    const [ia, ib] = k.split('-').map(Number), A = camp.army.find(u => u.id === ia), B = camp.army.find(u => u.id === ib); if (!A || !B) continue;
    const reached = ranks.filter(([p]) => pts >= p).map(([, r]) => r).pop(); if (!reached || (camp.supportSeen || (camp.supportSeen = {}))[k] === reached) continue;
    camp.supportSeen[k] = reached;
    (st.quietSupports = st.quietSupports || []).push(`${A.name} and ${B.name} (${reached})`); if ((st.talks = (st.talks || 0) + 1) > 2) continue;
    const sf = facts(camp, st), va = voice(camp, A), vb = voice(camp, B);
    const talk = [[A.name, speak(camp, A, 'open', sf, reached)], [B.name, speak(camp, B, 'reply', sf, reached)]];
    lines.push(...talk);
  }
  if (st.quietSupports && st.quietSupports.length) lines.push(['', `New support ranks: ${listJoin(st.quietSupports)}.`]);
  for (const u of camp.army) if (u.level > 20) { u.level = 20; u.exp = 0; }   // late recruits are generated past 20; each tier stops at 20 (shown 20 / 40)
  // certification (SRR+, opened at level 10 by Casim's choice): a trainee moves up at level 10; anyone else may sit the Advanced
  // exam from level 10, needing an Advanced Seal and the target class's ranks. Odds (Casim: most promoted by a book's chapter
  // 20, nearly all by 28): 30% at level 10 + 7% a level, + 10% per weapon rank above the need, + 10% per earlier failure,
  // + 5% a chapter from the book's chapter 16; capped at 98. One try a chapter; the seal is spent only on a pass.
  for (const u of camp.army) {
    const c = CLASSES[u.cls]; if (!c || c.promoted || u.level < 10) continue;
    let to = c.promoTo && CLASSES[c.promoTo] ? c.promoTo : null;
    let br = c.branches; if (!br && c.trainee) { const twins = Object.values(CLASSES).filter(o => o !== c && o.name === c.name && o.game === c.game && o.branches); const twin = twins.find(o => o.branches.every(k => CLASSES[k] && !CLASSES[k].promoted && CLASSES[k].name !== c.name)) || twins[0]; if (twin) br = twin.branches; }
    const opts = (br || []).filter(k => CLASSES[k] && k !== u.cls && CLASSES[k].name !== c.name);
    if (opts.length) { const fit = k => { const t = CLASSES[k], g = u.growth || {}; let s = 0; for (const st2 of ['hp', 'str', 'mag', 'skl', 'spd', 'def', 'res']) s += (t.base[st2] || 0) * (g[st2] || 30); return s + (wtype(t.wpn) === wtype(c.wpn) ? 400 : 0) + rng.int(0, 150); };
      to = opts.sort((a, b) => fit(b) - fit(a))[0]; }
    if (!to && POOL) { const same = POOL.advanced.filter(k => CLASSES[k].game === c.game && CLASSES[k].wpn === c.wpn); const any = POOL.advanced.filter(k => CLASSES[k].wpn === c.wpn); to = same.length ? rng.pick(same) : any.length ? rng.pick(any) : null; }
    if (to && !c.trainee && !CLASSES[to].promoted) to = null;
    if (!to) continue;
    if (!c.trainee) { const cands = [to, ...(br || [])].filter((k, i, a) => k && CLASSES[k] && CLASSES[k].promoted && a.indexOf(k) === i), pass = cands.map(k => [k, examNeeds(u, CLASSES[k])]).find(([, nd]) => nd.ok);
      if (!pass) { if (!u._examNote && u.level >= 20) { u._examNote = true; lines.push(['', `${u.name} is ready for the Advanced exam but still needs ${examNeeds(u, CLASSES[to]).why}.`]); } continue; }
      if (!((camp.seals || 0) > 0)) { if (!u._sealNote && u.level >= 20) { u._sealNote = true; lines.push(['', `${u.name} is ready for the Advanced exam and waits for an Advanced Seal.`]); } continue; }
      to = pass[0]; const jbE = ((st.chapter - 1) % 30) + 1, odds = Math.min(98, 30 + (Math.min(20, u.level) - 10) * 7 + pass[1].over * 10 + (u.examFails || 0) * 10 + Math.max(0, jbE - 15) * 5);
      if (!rng.chance(odds)) { u.examFails = (u.examFails || 0) + 1; lines.push(['', `${u.name} sits the Advanced exam for ${prose(CLASSES[to].name)} and fails (${odds}% odds). There will be another try after the next battle.`]); continue; }
      camp.seals--; u.examFails = 0; u._examNote = u._sealNote = false; lines.push(['', `${u.name} passes the Advanced exam for ${prose(CLASSES[to].name)} (${odds}% odds), spending an Advanced Seal.`]); }
    const from = c.name; u.cls = to; u.fe8 = to; u.level = 1; u.exp = 0; { const nr = startRanks(CLASSES[to]); u.wexp = u.wexp || {}; for (const k in nr) u.wexp[k] = Math.max(u.wexp[k] || 0, nr[k]); } u.maxhp += 3; u.str += 2; u.mag += c.wpn === 'fire' || c.healer ? 2 : 0; u.skl += 1; u.spd += 1; u.def += 2; u.res += 1; u.hp = u.maxhp;
    { lines.push([u.name, speak(camp, u, 'promote', facts(camp, st))], ['', `${u.name} is now a ${prose(CLASSES[to].name)}, promoted from ${prose(from)}.`]); }
  }
  let summary0 = false; progression(camp, st, result, lines, rng);
  if (st.final && result === 'victory' && camp.story) { const ff = facts(camp, st); lines.push(['', STORY.pick(camp, 'fw', PR.final_won, rng, ff)]); lines.push(...epilogue(camp));
    const book = (camp.story.book || 1) + 1, old = camp.story; advanceBook(camp, rng, lines, book); camp.story = STORY.premise(rng, camp, () => uniqueName(camp, rng)); camp.story.book = book; camp.story.relic = old.relic; camp.story.home = old.home; camp.story.tone = old.tone;
    lines.push(['', STORY.pick(camp, 'nb', PR.new_book, rng, facts(camp, st))]); lines.push(['', `Book ${book} of the chronicle begins.`]); summary0 = true; if (camp.world) planBook(camp, book); }
  const summary = { chapter: st.chapter, title: st.title, result, turns: st.turn, lost: dead.map(d => d.name), recruits: [...(st.newRecruits || [])] };
  if (result === 'retreat') lines.push([lord.name, STORY.pick(camp, 'rt', STORY.P.retreat, rng, facts(camp, st))]);
  if (result === 'victory') {
    const want = st.skirmish ? 0 : st.chapter <= 3 ? Math.min(3, Math.max(1, [8, 10, 12][st.chapter - 1] - camp.army.length)) : 1 + (rng.chance(45) ? 1 : 0);
    const bookNow = (camp.story && camp.story.book) || 1, noLimit = camp.progression === 'carry' && bookNow >= 2;
    for (let rc = 0; rc < want; rc++) if (camp.army.filter(u => u.hp > 0).length < (st.side ? 15 : noLimit ? 9999 : 45)) {   // the second army holds at most 15; the main army 45 (Casim: ~42+ by a book's end)
      const wild = OPTIONS.recruits === 'anything' && POOL, roll = rng.int(0, 99);
      const cls = !POOL ? rng.pick(PLAYER_POOL) : POOL.dancers.length && roll < 8 && !camp.army.some(u => CLASSES[u.cls].dancer) ? rng.pick(POOL.dancers)
        : wild && POOL.monsters.length && roll < 30 ? rng.pick(POOL.monsters) : poolPick(rng, () => true, camp.chapter >= 10 && rng.chance(30)); const r = makeUnit(rng, cls, 'player', Math.max(1, Math.round(avgLevel(camp.army)) + rng.int(-1, 0))); r.name = uniqueName(camp, rng);
      r.joined = st.chapter; growRecruit(camp, r); camp.army.push(r); summary.recruits.push(r.name);
      const rf = facts(camp, st, { cls: prose(CLASSES[cls].name || cls).toLowerCase() }), rv2 = voice(camp, r);
      lines.push(['', STORY.pick(camp, 'rr', STORY.P.recruit_reason, rng, rf)]); lines.push([r.name, speak(camp, r, 'recruit', rf)]); if (rng.chance(65)) lines.push([lord.name, STORY.pick(camp, 'welcome', PR.welcome, rng, Object.assign({}, rf, { name: r.name }))]);
    }
    { const ff = facts(camp, st), lost = dead.length; const key = st.general ? 'vm' : lost ? 'vl' : st.turn <= 8 ? 'vc' : 'vp'; lines.unshift([lord.name, STORY.pick(camp, key, { vm: STORY.P.victory_major, vl: STORY.P.victory_losses, vc: STORY.P.victory_clean, vp: STORY.P.victory_plain }[key], rng, ff)]); }
  }
  { camp.bondsSeen = camp.bondsSeen || {}; summary.bonds = summary.bonds || []; const byId = id => camp.army.find(u => u.id === id && u.hp > 0);
    for (const [k, p] of Object.entries(camp.supports || {})) { if (rankOf(p) < 3 || camp.bondsSeen[k]) continue; const [ia, ib] = k.split('-').map(Number), a = byId(ia), b = byId(ib); if (!a || !b) continue; camp.bondsSeen[k] = true;
      if (!a.hadA && !b.hadA) { a.beloved = b.id; b.beloved = a.id; summary.bonds.push(`${a.name} and ${b.name} fell in love`);
        lines.push(['', `${a.name} and ${b.name} have become more than comrades. The army is already arguing over who will stand witness at the wedding.`]); }
      else { const w = bondWord(a, b); (a.sworn = a.sworn || []).push(b.id); (b.sworn = b.sworn || []).push(a.id); (camp.oaths = camp.oaths || []).push({ a: a.name, b: b.name, word: w, chapter: st.chapter, place: st.place });
        summary.bonds.push(`${a.name} and ${b.name} swore themselves ${w === 'kin' ? 'sworn kin' : w}`);
        lines.push(['', `${a.name} and ${b.name} swear an oath as ${w === 'kin' ? 'sworn kin' : 'sworn ' + w}. From today each stands guard over the other.`]); }
      a.hadA = b.hadA = true; }
    if (st.wedding && result === 'victory') { const a = camp.army.find(u => u.id === st.wedding.a); if (a && a.spouse) summary.bonds.push(`${st.wedding.names.join(' and ')} married`); } }
  for (const u of camp.army) if (u._grief) { u.str -= 3; u.mag -= 3; delete u._grief; }   // grief lasts the chapter only
  if (result === 'victory' && !st.skirmish) { const got = st.major ? 2 : 1; camp.seals = (camp.seals || 0) + got; lines.push(['', `The army comes away with ${got === 2 ? 'two Advanced Seals' : 'an Advanced Seal'} (${camp.seals} held).`]); }
  // victory EXP (Casim: most of the army promoted by a book's chapter 20, nearly all by 28): after a won chapter every living
  // unit, the bench included (it trains alongside), gains a flat bonus, so the whole army keeps pace without changing what a hit or a kill pays
  if (result === 'victory' && !st.skirmish) for (const u of camp.army) if (u.hp > 0 && !u.traitorTurned && !(st.sideLvCap && lvShown(u) >= st.sideLvCap)) { const vst = { _camp: camp }; u.exp = (u.exp || 0) + Math.round(expReq(u) * VICTORY_EXP / 100); for (let gg = 0; gg < 10; gg++) { if (atLevelCap(vst, u)) { u.exp = 0; break; } const rq = expReq(u); if (u.exp < rq) break; u.exp -= rq; levelUp(rng, u); } }
  // Instruct (SRR+): a lesson budget after each chapter (12 after chapter 1, +3 a chapter, up to 48), at most 3 lessons a unit.
  // Units whose exam is held back by a missing rank are taught that rank first; the rest train their class's weapon. Results
  // follow SRR+'s Bad / Good / Great / Perfect, scaled to this game's rank points: +2 / +6 / +10 / +20.
  { const budget = Math.min(48, 12 + 3 * Math.max(0, (camp.chapter || 1) - 1)), alive = camp.army.filter(u => u.hp > 0 && CLASSES[u.cls]);
    const blockedBy = u => { const c = CLASSES[u.cls]; if (c.promoted || u.level < 10) return null; for (const k of [c.promoTo, ...(c.branches || [])]) { if (!k || !CLASSES[k] || !CLASSES[k].promoted) continue; const nd = examNeeds(u, CLASSES[k]); if (nd.ok) return null; if (nd.key || nd.mob) return nd; } return null; };
    const order = alive.map(u => [u, blockedBy(u)]).sort((a2, b2) => (b2[1] ? 1 : 0) - (a2[1] ? 1 : 0) || Object.values(a2[0].wexp || {}).reduce((x, y) => x + y, 0) - Object.values(b2[0].wexp || {}).reduce((x, y) => x + y, 0));
    let left = budget; const ups = [];
    for (let round = 0; round < 3 && left > 0; round++) for (const [u, nd] of order) { if (left <= 0) break; const c = CLASSES[u.cls];
      const r = rng.int(0, 99), gain = r < 10 ? 2 : r < 60 ? 6 : r < 90 ? 10 : 20; left--;
      if (nd && nd.mob) { const P = profOf(u), before = rankLetter(P[nd.mob]); P[nd.mob] = Math.min(251, P[nd.mob] + gain); if (rankLetter(P[nd.mob]) !== before) ups.push(`${u.name} ${nd.mob === 'mounted' ? 'Mounted' : nd.mob === 'flying' ? 'Flying' : 'Armored'} ${rankLetter(P[nd.mob])}`); }
      else { const key = nd && nd.key ? nd.key : rankKey(c.wpn); if (!key || key === 'none') continue; u.wexp = u.wexp || {}; const before = rankLetter(u.wexp[key] || 0); u.wexp[key] = Math.min(251, (u.wexp[key] || 0) + gain); if (rankLetter(u.wexp[key]) !== before) ups.push(`${u.name} ${prose(key)} ${rankLetter(u.wexp[key])}`); } }
    if (ups.length) lines.push(['', `Instruct: ${budget - left} lessons. New ranks: ${listJoin(ups.slice(0, 8))}${ups.length > 8 ? ` and ${ups.length - 8} more` : ''}.`]); }
  { const c = camp.conv; if (c && c.on && !st.side && !st.skirmish && ((st.chapter - 1) % 30) + 1 === 11 && c.lv11 === undefined) { const al = camp.army.filter(u => u.hp > 0); c.lv11 = Math.max(1, Math.round(al.reduce((a, u) => a + lvShown(u), 0) / Math.max(1, al.length))); } }   // Casim 1A
  // the second army holds at most 15 (Casim): any join path that slipped past the limit is settled here, newest first
  if (st.side) { const al = camp.army.filter(u => u.hp > 0 && !u.leader); while (al.length + 1 > 15) { const x = al.pop(); camp.army.splice(camp.army.indexOf(x), 1); lines.push(['', `${x.name} parts ways with the second army; it cannot feed any more mouths on the road.`]); } }
  // BEXP (Casim): no limit a chapter; 100 banked levels up the lowest unit, again and again, but never past the army's current highest level
  { const lv = x => x.level + (CLASSES[x.cls] && CLASSES[x.cls].promoted ? 20 : 0), alive = camp.army.filter(u => u.hp > 0), caught = new Map();
    const top = alive.length ? Math.max(...alive.map(lv)) : 0;
    while (alive.length) { const low = alive.filter(u => lv(u) + 1 <= top && !atLevelCap({ _camp: camp }, u)).sort((a2, b2) => lv(a2) - lv(b2))[0]; if (!low || (camp.bexp || 0) < expReq(low)) break;
      camp.bexp -= expReq(low); levelUp(rng, low); caught.set(low, low.level); }
    for (const [u, l] of caught) lines.push(['', `${u.name} catches up on the army's banked experience and reaches level ${l}.`]); }
  for (const u of camp.army) if (u._stash) { u.items = u._stash.concat(u.items); delete u._stash; equipBest(u); }   // a prison break never costs anyone their weapons
  summary.card = results(camp, st, result, summary);
  camp.log.push(summary);
  let record = null;
  if (result !== 'victory') { const all = [...camp.army, ...st.units.filter(u => u.team === 'player')];
    const mvp = all.slice().sort((a, b) => (b.kills || 0) - (a.kills || 0))[0];
    record = { chapters: camp.log.filter(l => l.result === 'victory').length, fallen: camp.fallen.length, mvp: mvp ? `${mvp.name} (${className(mvp)}, ${mvp.kills || 0} kills)` : '', faction: camp.faction, rival: camp.rival && camp.rival.defeated ? 'defeated' : 'still out there', date: Date.now() }; }
  if (st.wedding && result !== 'victory') lines.push(['', `The wedding at ${st.place} broke apart under the attack. ${st.wedding.names.join(' and ')} will have to find another morning.`]);
  if (st.wedding && result === 'victory') { const a = camp.army.find(u => u.id === st.wedding.a), b = camp.army.find(u => u.id === st.wedding.b);
    if (a && b && a.hp > 0 && b.hp > 0 && !dead.includes(a) && !dead.includes(b)) { a.spouse = b.id; b.spouse = a.id; (camp.marriages = camp.marriages || []).push({ a: a.name, b: b.name, chapter: st.chapter, place: st.place });
      lines.push(['', `${a.name} and ${b.name} say their vows among the fallen standards at ${st.place}. Nobody in the army will forget this wedding.`]); }
    else lines.push(['', `The wedding at ${st.place} did not end in vows. The army will remember why.`]); }
  if (st.caravan && result === 'victory') { camp.gold = (camp.gold || 0) + 400; lines.push(['', 'The caravan rolls in with its loads intact. 400 gold of supplies the army will not have to buy.']); }
  if (st.cubKind && result === 'victory' && camp.army.length < 30 && !(st.side && camp.army.filter(u => u.hp > 0).length >= 15)) { const kd = WILD_KINDS.find(k => k.key === st.cubKind), parent = rng.chance(50);
    const r = makeUnit(rng, st.cubCls, 'player', Math.max(1, Math.round(avgLevel(camp.army)) + (parent ? 1 : -2))); r.wild = st.cubKind; r.name = uniqueName(camp, rng); camp.army.push(r); summary.recruits.push(r.name);
    lines.push(['', parent ? `The pack's great ${kd.name.toLowerCase().split(' ').pop()} follows the cub out of the trees and does not leave. ${r.name}, the soldiers call it, and it marches with the army now.` : `The cub will not go back to its pack. It has decided the army is its pack now; the soldiers name it ${r.name}.`]); }
  if (st.tribunal) { const t = st.tribunal, alive = t.civ.filter(id => { const o = st.units.find(q => q.id === id); return o && (o.hp > 0 || o.escaped || o.saved); }).length;
    if (alive * 2 >= t.civ.length && result === 'victory') { camp.gold = (camp.gold || 0) + 300; camp.courierEffect = { kind: 'ally', ally: t.realm, cmd: t.judge, at: st.chapter + 1 };
      lines.push(['', `${t.judge} rules for the army: ${alive} of ${t.civ.length} townsfolk lived because of it. 300 gold, and guards of ${t.realm} for the next battle.`]); }
    else lines.push(['', `${t.judge} rides away unconvinced. Only ${alive} of ${t.civ.length} townsfolk lived through the battle.`]); }
  if (st.ambush) { const A = camp.ambushOffer; camp.ambushOffer = null;
    if (result === 'victory') lines.push(['', `${A.leader}'s column is broken on the road. It will not reach the battle.`]);
    else { camp.ambushJoin = A; lines.push(['', `${A.leader}'s column got past the ambush. It will be on the field in the next battle.`]); } }
  else if (!st.skirmish && !st.side && result === 'victory' && !camp.ambushOffer && !camp.ambushJoin && st.chapter >= 6 && ((st.chapter % 30) + 1) % 30 !== 0 && rng.chance(10)) {
    camp.ambushOffer = { leader: uniqueName(camp, rng), realm: makePlace(rng), size: 6 }; lines.push(['', `Scouts report that ${camp.ambushOffer.leader} of ${camp.ambushOffer.realm} is marching to join the enemy. A detachment can catch the column on the road first.`]); }
  if (st.courier) { const first = result === 'victory' && !st.enemyCourierArrived ? 'ally' : 'hostile'; camp.courierEffect = { kind: first, ally: st.courier.ally, cmd: st.courier.cmd, at: st.chapter + 1 };
    lines.push(['', first === 'ally' ? `${st.courier.ours} reached ${st.courier.cmd} first. ${st.courier.ally} will send soldiers to the next battle.` : `${st.courier.cmd} heard the enemy first. ${st.courier.ally} has chosen the other side.`]); }
  if (st.stealth && result === 'victory' && !st.stealth.alarm) { camp.gold = (camp.gold || 0) + 600; lines.push(['', 'The camp never knew the army was there until it was over. Its pay chest, 600 gold, goes to the army.']); }
  if (st.beast && result === 'victory') { const b = st.units.find(u => u.beast); lines.push(['', `${st.beast} falls at ${st.place}. The land around it will remember this day.`]);
    (camp.beasts = camp.beasts || []).push({ name: st.beast, place: st.place, chapter: st.chapter, lore: b && b.lore }); }
  { const c = convOf(camp), jb = ((st.chapter - 1) % 30) + 1, rv = camp.rival;
    if (st.side) { // the second lord's chapter is over: their army stands down, the main army returns
      camp.sideArmy = camp.army; camp.army = camp._mainArmy || camp.army; camp.lord = camp._mainLord ?? camp.lord; camp._mainArmy = null; c.sideDone++;
      c.sideWins = (c.sideWins || 0) + (result === 'victory' ? 1 : 0); const sl = camp.sideArmy.find(u => u.sideLord && u.hp > 0);
      if (!sl) { c.sideOutcome = 'fallen'; c.state = 'reunite'; lines.push(['', `${st.side.lord} fell on the road. What remains of that army turns toward the main host.`]); }
      else if (c.sideDone >= c.sideLen) { c.sideOutcome = 'done'; c.state = 'reunite'; c.freed = c.kind === 'ally' ? c.allyRealm : st.place; c.freedBy = sl.name;
        lines.push(['', `${sl.name}'s road ends here, and ${c.freed} is free. Word is sent ahead: the two armies will meet.`]); }
      if (st.roadGeneral && result === 'victory') { st.roadGeneral.fallen = true; c.generalFelled = st.roadGeneral.name; lines.push(['', `${st.roadGeneral.name} will not command another battle. ${st.side.lord}'s soldiers saw to that on the road.`]); } }
    else if (!st.skirmish && c.on) {
      if (c.state === 'before' && jb === 10) { c.state = 'apart';
        if (c.kind === 'rival' && rv && !rv.defeated && (rv.meetings || 0) >= 2) { rv.turned = true; lines.push(['', `${rv.name} does not fall back to the enemy camp this time. They lower their weapon and ride off alone.`]); }
        else { c.kind = 'ally'; lines.push(['', `${c.allyName} turns toward ${c.allyRealm} with the soldiers who came from there. Their own war will not wait.`]); } }
      else if (c.state === 'apart' && jb === c.meetAt - 1) { c.state = 'side'; lines.push(['', `Far from here, ${c.kind === 'rival' && rv ? rv.name : c.allyName} has been fighting a war of their own. The chronicle turns to that road.`]); } } }
  return { summary, lines, record };
}

function romClass(id) { return ROMD.classes[id]; }
// classes read from the player's games: register them so units can be generated from them
let POOL = null;
const OPTIONS = { leader: 'lord', recruits: 'standard', difficulty: 'normal', casual: false };
const DIFF = { easy: { lv: -1, st: 0, n: 0.85 }, normal: { lv: 0, st: 0, n: 1 }, hard: { lv: 3, st: 2, n: 1.3 }, lunatic: { lv: 5, st: 3, n: 1.45 } };
function setOptions(o) { Object.assign(OPTIONS, o || {}); }
function setClassPool(list) {
  POOL = { lords: [], basic: [], advanced: [], dancers: [], monsters: [], monstersHi: [] };
  for (const c of list) {
    const b = c.base, g = c.gr;
    if (/^(great lord|paladin|great knight|general|assassin|rogue|hero|ranger|swordmaster|sniper|wyvern lord|wyvern kn|sage|mage knight|druid|summoner|bishop|valkyrie|falcoknight|warrior|berserker|nmd trooper|nomad trooper|marshall|baron|dark druid|master lord|blade lord|knight lord)/i.test(c.name || '')) c.promoted = true;
    CLASSES[c.key] = { branches: c.branches, trainee: c.trainee, canto: c.canto, ranks: c.ranks, promoTo: c.promoTo, name: c.name, wpn: c.wpn, mov: b.mov, mt: c.flier ? 'fly' : 'foot', flier: c.flier, healer: c.healer, dancer: c.dancer, monster: c.monster, lord: c.lord, promoted: c.promoted, game: c.game,
      base: { hp: b.hp, str: c.magic ? Math.max(0, b.str - 3) : b.str, mag: c.magic || c.healer || c.dancer ? b.str : 0, skl: b.skl, spd: b.spd, lck: 0, def: b.def, res: b.res },
      gr: { hp: g.hp, str: c.magic ? 15 : g.str, mag: c.magic || c.healer ? g.str : 10, skl: g.skl, spd: g.spd, lck: g.lck, def: g.def, res: g.res } };
    ROMD.classes[c.key] = c.terrain;
    if (c.dancer) POOL.dancers.push(c.key); else if (c.monster) (c.promoted ? POOL.monstersHi : POOL.monsters).push(c.key); else (c.lord ? (c.promoted ? null : POOL.lords) : c.promoted ? POOL.advanced : POOL.basic)?.push(c.key);
  }
  if (!POOL.basic.length) POOL = null;
}
function className(u) { return (CLASSES[u.cls] && CLASSES[u.cls].name) || u.cls; }
function mapCount() { return ROMD ? ROMD.maps.length : 0; }
function mapList() { return ROMD ? ROMD.maps : []; }
function terrainId(st, x, y) { return st.map.terr ? tid(st, x, y) : -1; }
function sceneKind(st, x, y) {
  if (st.map.terr) { const t = tid(st, x, y);
    if ([0x0C, 0x0D].includes(t)) return 'forest'; if ([0x11, 0x12, 0x26].includes(t)) return 'mountain'; if ([0x0E, 0x0F].includes(t)) return 'desert';
    if ([0x10, 0x13, 0x15, 0x16].includes(t)) return 'water'; if ([0x17, 0x1D, 0x1E, 0x1F, 0x20, 0x1A, 0x1B].includes(t)) return 'indoor'; return 'plains'; }
  const t = st.map.tiles[y][x]; return t === 'forest' ? 'forest' : t === 'hill' ? 'mountain' : t === 'water' || t === 'bridge' ? 'water' : t === 'floor' || t === 'throne' || t === 'wall' ? 'indoor' : 'plains';
}
// where a node from an earlier book sits on the current book's map: shifted when the world grew, absent when the book moved to another continent
function posInBook(camp, fromBook, pos) { const w = camp.world, b = camp.story && camp.story.book || 1; let p = [pos[0], pos[1]];
  for (let k = fromBook + 1; k <= b; k++) { const info = w.books && w.books[k]; if (!info || info.mode === 'same') continue; if (info.mode === 'foreign') return null; const g = bookWorld(camp, k); if (g.offset) p = [p[0] + g.offset[0], p[1] + g.offset[1]]; }
  return p; }
const api = { expReq, expReqAt, footFor, classTables, capOf, profTable, profOf, lvShown, examNeeds, nextPart, footWalk, MapGen, IntGen, tileFor, bondWord, sexOf, WILD_KINDS, convOf, BATTALIONS, batText, batLive, bondRank, BOND_AT, BOND_NAME, relicFull, relicRemembers, resonant, RELIC_TIERS, relicLore, relicOf, relicText, registerRelics, ARTS, artsFor, artUses, artText, crestsOf, crestInfo, CREST_FX, MapGen, breakTargets, breakBlow, breakHp, canOpenDoors, advanceBook, enemyLevel, PROGRESSIONS, PROG_NAME, posInBook, planBook, bookInfo, bookRoute, TONES, DOCTRINES, worldOf, worldIntro, WG, PLACES1, PLACES2, wantSkirmish, narrate, briefing, results, epilogue, BOOSTERS, isOutdoor, farEdge, tri, dualPartner, PSKILLS, PSKILL_TEXT, STATUS_NAME, hasStatus, staffHit, canCarry, carriable, visionOf, stillWinnable, PHASES, persona, lastWords, STORY, endPhase, DIFF, canWield, visible, armory, skillsOf, rankLetter, rankKey, rankReq, wtype, weaponsOf, MAXITEMS, terrainId, AFF, supportBonus, rankOf, supportLevel, sceneKind, unitLabel, setOptions, OPTIONS, setClassPool, className, romClass, mapCount, mapList, saveCampaign, loadCampaign, pathTo, inRange, foes, danger, get W() { return W; }, get H() { return H; }, setRomData, RNG, TERRAIN, WEAPONS, CLASSES, newCampaign, newChapter, moveCost, endChapter, plan, apply, outcome, phaseOrder, startPhase, forecast, reach };
if (typeof module !== 'undefined') module.exports = api; else root.Chronicle = api;
})(this);
