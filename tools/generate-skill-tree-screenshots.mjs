import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "assets", "skill-tree");
const INDEX_PATH = path.join(process.cwd(), "index.html");
const DATA_URL = "https://raw.githubusercontent.com/grindinggear/poe2-skilltree-export/0.5.0/data.json";

const LEVEL_BUDGETS = {
  "1-12": 15,
  "13-22": 27,
  "23-31": 40,
  "32-44": 59,
  "45-60": 77,
  "61-75": 98,
  endgame: 113
};

const ASCENDANCY_STARTS = {
  Warrior1: "32534",
  Warrior3: "5852",
  Ranger1: "46990",
  Ranger3: "1583"
};

const OPTIMIZED_CANDIDATE_LIMIT = 220;

const BASE_WEIGHTS = {
  additionalProjectile: 7,
  ailmentChance: 0,
  ailmentDuration: 0,
  ailmentMagnitude: 0,
  ailmentAvoid: 0,
  armour: 0.8,
  attackDamage: 0.7,
  attackSpeed: 2.4,
  blockChance: 0.8,
  bowDamage: 1.2,
  chain: 3,
  chaosDamage: 0,
  coldDamage: 0,
  coldPenetration: 0,
  critical: 0.6,
  criticalDamage: 0,
  culling: 0,
  dexterity: 0.4,
  enemyDamageTaken: 0,
  elementalDamage: 0.8,
  evasion: 0.8,
  farShot: 0,
  fireDamage: 0,
  firePenetration: 0,
  flask: 0,
  freeze: 0,
  fork: 0,
  frenzy: 0,
  gainAsCold: 0,
  genericDamage: 0.7,
  intelligence: 0.2,
  leech: 0,
  life: 1.4,
  lightningDamage: 0,
  lightningPenetration: 0,
  lowLife: 0,
  mark: 0,
  movement: 1.2,
  physicalDamage: 0.5,
  pierce: 0,
  poison: 0,
  projectileDamage: 1.4,
  projectileSpeed: 0.8,
  recovery: 0.8,
  reducedPenalty: 0,
  resist: 1,
  shock: 0,
  shield: 0,
  skillEffectDuration: 0.3,
  stun: 0.2,
  strength: 0.4
};

const GUIDES = {
  "shield-wall": {
    title: "Shield Wall Warrior",
    start: "47175",
    weights: {
      ...BASE_WEIGHTS,
      armour: 2.8,
      attackDamage: 0.9,
      blockChance: 3.4,
      elementalDamage: 0.2,
      evasion: 0.2,
      genericDamage: 0.7,
      life: 4.4,
      meleeDamage: 1.1,
      movement: 1,
      physicalDamage: 0.7,
      projectileDefence: 2.2,
      recovery: 2.6,
      resist: 2.4,
      shield: 4,
      skillEffectDuration: 0.7,
      stun: 2.2,
      strength: 1.8
    },
    panels: {
      "1-12": { seeds: ["5710", "7721"], ascendancy: [] },
      "13-22": { seeds: ["5710", "7721", "32416", "45363", "64327", "27950"], ascendancy: [] },
      "23-31": { seeds: ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "25482", "50609"], ascendancy: [] },
      "32-44": { seeds: ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "22967", "62034", "19236", "53921"], ascendancy: [] },
      "45-60": { seeds: ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "22967", "62034", "19236", "53921", "53823", "59589", "10500", "45751"], ascendancy: ["12000"] },
      "61-75": { seeds: ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "22967", "62034", "19236", "53921", "53823", "59589", "10500", "45751", "36808", "37244", "25482"], ascendancy: ["12000", "24807", "60634"] },
      endgame: { label: "Final Form", seeds: ["5710", "7721", "32416", "45363", "64327", "27950", "33978", "22967", "62034", "19236", "53921", "53823", "59589", "10500", "45751", "36808", "37244", "25482", "50609", "25429"], ascendancy: ["12000", "24807", "60634", "30115"] }
    }
  },
  "ice-shot": {
    title: "Ice Shot Deadeye",
    start: "50459",
    route: "optimized",
    targetEnemyLifeRatio: 0.95,
    weights: {
      ...BASE_WEIGHTS,
      accuracy: 2.2,
      ailmentAvoid: 1.2,
      ailmentMagnitude: 1.5,
      attackDamage: 2.8,
      attackSpeed: 5.6,
      bowDamage: 4.2,
      chain: 3.6,
      coldDamage: 3.2,
      coldPenetration: 8.2,
      critical: 2.8,
      criticalDamage: 2.3,
      culling: -8,
      dexterity: 1.2,
      enemyDamageTaken: 3.4,
      elementalDamage: 2.4,
      evasion: 2.8,
      farShot: 5,
      freeze: 3.4,
      fork: 2.8,
      frenzy: 2.4,
      gainAsCold: 5.6,
      genericDamage: 2.2,
      leech: 1.4,
      life: 3,
      lightningDamage: 0.2,
      lightningPenetration: 0.4,
      lowLife: -40,
      mark: 3.8,
      movement: 4.2,
      physicalDamage: 4.6,
      pierce: 2.6,
      projectileDamage: 3.6,
      projectileSpeed: 1.7,
      recovery: 1.1,
      reducedPenalty: 2,
      resist: 1.8
    },
    panels: {
      "1-12": { ascendancy: [] },
      "13-22": { ascendancy: [] },
      "23-31": { ascendancy: ["30"] },
      "32-44": { ascendancy: ["30", "59913"] },
      "45-60": { ascendancy: ["30", "59913", "24226"] },
      "61-75": { ascendancy: ["30", "59913", "24226", "5817"] },
      endgame: { label: "Final Form", ascendancy: ["30", "59913", "24226", "5817"] }
    }
  },
  "lightning-arrow": {
    title: "Lightning Arrow Deadeye",
    start: "50459",
    weights: {
      ...BASE_WEIGHTS,
      accuracy: 1.8,
      attackSpeed: 4.8,
      bowDamage: 2.4,
      chain: 5,
      critical: 2.2,
      dexterity: 1.1,
      elementalDamage: 2.2,
      electrocute: 2.2,
      evasion: 2.1,
      genericDamage: 1.5,
      life: 2.4,
      lightningDamage: 3.6,
      lightningPenetration: 7,
      movement: 4,
      projectileDamage: 2.8,
      projectileSpeed: 1.6,
      resist: 1.4,
      shock: 3.2
    },
    panels: {
      "1-12": { seeds: ["28992", "35987", "42781", "20831"], ascendancy: [] },
      "13-22": { seeds: ["28992", "35987", "42781", "20831", "50795", "56493"], ascendancy: [] },
      "23-31": { seeds: ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578"], ascendancy: ["30"] },
      "32-44": { seeds: ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "63585", "36479", "42065"], ascendancy: ["30", "59913"] },
      "45-60": { seeds: ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "63585", "36479", "42065", "336", "12611", "17854", "40480"], ascendancy: ["30", "12033"] },
      "61-75": { seeds: ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "63585", "36479", "42065", "336", "12611", "17854", "40480", "8904", "11526", "60764", "23221"], ascendancy: ["30", "12033", "5817"] },
      endgame: { label: "Final Form", seeds: ["28992", "35987", "42781", "20831", "50795", "56493", "27875", "11578", "63585", "36479", "42065", "336", "12611", "17854", "40480", "8904", "11526", "60764", "23221", "56999", "47560"], ascendancy: ["30", "12033", "5817"] }
    }
  },
  "bow-variants": {
    title: "Bow Variants",
    start: "50459",
    weights: {
      ...BASE_WEIGHTS,
      accuracy: 1.2,
      ailmentChance: 2.8,
      ailmentDuration: 3.4,
      ailmentMagnitude: 4.6,
      attackSpeed: 3.8,
      bowDamage: 1.8,
      chaosDamage: 2.8,
      dexterity: 0.9,
      evasion: 2.1,
      flask: 3.4,
      genericDamage: 1.4,
      life: 2.5,
      physicalDamage: 1.2,
      poison: 5.2,
      projectileDamage: 2.1,
      projectileSpeed: 1.2,
      resist: 1.5
    },
    panels: {
      "1-12": { seeds: ["28992", "35987", "42781", "10053"], ascendancy: [] },
      "13-22": { seeds: ["28992", "35987", "42781", "10053", "43677"], ascendancy: [] },
      "23-31": { seeds: ["28992", "35987", "42781", "10053", "43677", "42959", "63759"], ascendancy: ["41619"] },
      "32-44": { seeds: ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "46182", "61741", "51213", "46692"], ascendancy: ["41619", "29074"] },
      "45-60": { seeds: ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "46182", "61741", "51213", "46692", "50912", "38895"], ascendancy: ["41619", "29074", "40"] },
      "61-75": { seeds: ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "46182", "61741", "51213", "46692", "50912", "38895", "50795", "19337", "41210", "60764", "23221", "47560"], ascendancy: ["41619", "29074", "40", "24868"] },
      endgame: { label: "Final Form", seeds: ["28992", "35987", "42781", "10053", "43677", "42959", "63759", "46182", "61741", "51213", "46692", "50912", "38895", "50795", "19337", "41210", "60764", "23221", "47560", "8904", "11526", "35477"], ascendancy: ["41619", "29074", "40", "24868"] }
    }
  }
};

const data = await fetchSkillTreeData();

const nodes = data.nodes;
const adjacency = buildAdjacency();
const optimizedCandidateCache = new Map();

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [slug, guide] of Object.entries(GUIDES)) {
  for (const [level, panel] of Object.entries(guide.panels)) {
    const budget = LEVEL_BUDGETS[level];
    const route = buildRoute(guide, panel, budget);
    const label = panel.label || level;
    const svg = renderSvg(`${guide.title} ${label}`, route, budget);
    fs.writeFileSync(path.join(OUT_DIR, `${slug}-${level}.svg`), svg);
  }
}

writeImageHashesToIndex();

function buildAdjacency() {
  const result = new Map();

  for (const [id, node] of Object.entries(nodes)) {
    result.set(id, new Set([...(node.out || []), ...(node.in || [])].map(String)));
  }

  return result;
}

function writeImageHashesToIndex() {
  const html = fs.readFileSync(INDEX_PATH, "utf8");
  const hashes = formatImageHashes(buildImageHashes());
  const hashBlockPattern = /const SKILL_TREE_IMAGE_HASHES = \{[\s\S]*?\};/;

  if (!hashBlockPattern.test(html)) {
    throw new Error("Could not find SKILL_TREE_IMAGE_HASHES in index.html");
  }

  const nextHtml = html.replace(hashBlockPattern, `const SKILL_TREE_IMAGE_HASHES = ${hashes};`);
  fs.writeFileSync(INDEX_PATH, nextHtml);
}

function buildImageHashes() {
  const hashes = [];

  for (const [slug, guide] of Object.entries(GUIDES)) {
    for (const level of Object.keys(guide.panels)) {
      const imagePath = `assets/skill-tree/${slug}-${level}.svg`;
      const filePath = path.join(process.cwd(), imagePath);
      const hash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 12);
      hashes.push([imagePath, hash]);
    }
  }

  return hashes.sort(([left], [right]) => left.localeCompare(right));
}

function formatImageHashes(hashes) {
  const entries = hashes.map(([imagePath, hash]) => `  "${imagePath}": "${hash}"`);
  return `{\n${entries.join(",\n")}\n}`;
}

async function fetchSkillTreeData() {
  const response = await fetch(DATA_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch tree data: ${response.status}`);
  }

  return response.json();
}

function buildRoute(guide, panel, budget) {
  const regular = buildRegularRoute(guide, panel, budget);
  const ascendancy = buildAscendancyRoute(panel.ascendancy);
  const selected = new Set([...regular.selected, ...ascendancy.selected]);
  const targets = new Set([...(panel.seeds || []), ...panel.ascendancy, ...regular.fillTargets]);
  const labels = new Set(panel.labels || []);

  return {
    labelAliases: panel.labelAliases || {},
    optimizeLabels: guide.route === "optimized",
    regularStart: guide.start,
    selected,
    labels,
    targets
  };
}

function buildRegularRoute(guide, panel, budget) {
  if (guide.route === "optimized") {
    return buildOptimizedRegularRoute(guide, budget);
  }

  const selected = new Set([guide.start]);

  for (const target of panel.seeds || []) {
    addPath(selected, shortestPath(guide.start, target, null));
  }

  const seedCount = countRegularSkillPoints(selected, guide.start);

  if (seedCount > budget) {
    throw new Error(`${guide.title} seeds use ${seedCount} regular skill points, budget is ${budget}`);
  }

  const fillTargets = [];

  while (countRegularSkillPoints(selected, guide.start) < budget) {
    const next = findBestFrontierNode(selected, guide);

    if (!next) {
      throw new Error(`Could not fill ${guide.title} to ${budget} skill points`);
    }

    selected.add(next);

    if (isUsefulTarget(next)) {
      fillTargets.push(next);
    }
  }

  return { selected, fillTargets: fillTargets.slice(-14) };
}

function buildOptimizedRegularRoute(guide, budget) {
  const selected = new Set([guide.start]);

  while (countRegularSkillPoints(selected, guide.start) < budget) {
    const remaining = budget - countRegularSkillPoints(selected, guide.start);
    const expansion = findBestOptimizedExpansion(selected, guide, remaining);

    if (!expansion) {
      throw new Error(`Could not optimize ${guide.title} to ${budget} skill points`);
    }

    addPath(selected, expansion.pathIds);
  }

  return { selected, fillTargets: getOptimizedRouteTargets(selected, guide) };
}

function findBestOptimizedExpansion(selected, guide, remaining) {
  let best = null;
  const pathTree = buildShortestPathTreeFromSelected(selected, guide, remaining);

  for (const candidate of getOptimizedCandidates(guide)) {
    if (selected.has(candidate.id)) {
      continue;
    }

    const pathIds = getPathFromSelectedTree(pathTree, selected, candidate.id);

    if (!pathIds.length) {
      continue;
    }

    const score = scoreOptimizedPath(pathIds, guide);
    const cost = pathIds.length;
    const rank = score / cost + candidate.score * 0.04 + countSelectedNeighbours(candidate.id, selected) * 0.15 - cost * 0.03;

    if (!best || rank > best.rank || (rank === best.rank && score > best.score)) {
      best = { pathIds, rank, score };
    }
  }

  return best || findBestOptimizedFrontierExpansion(selected, guide);
}

function getOptimizedCandidates(guide) {
  if (optimizedCandidateCache.has(guide.title)) {
    return optimizedCandidateCache.get(guide.title);
  }

  const candidates = Object.entries(nodes)
    .filter(([, node]) => canUseRegularNodeForGuide(node, guide))
    .map(([id, node]) => ({ id, node, score: scoreNode(node, guide.weights) }))
    .filter(({ id, node, score }) => id !== guide.start && score > 0 && (node.isNotable || score >= 18))
    .sort((a, b) => b.score - a.score || Number(a.id) - Number(b.id))
    .slice(0, OPTIMIZED_CANDIDATE_LIMIT);

  optimizedCandidateCache.set(guide.title, candidates);
  return candidates;
}

function buildShortestPathTreeFromSelected(selected, guide, maxCost) {
  const queue = [...selected];
  const previous = new Map(queue.map((id) => [id, null]));
  const cost = new Map(queue.map((id) => [id, 0]));

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];

    for (const next of adjacency.get(current) || []) {
      if (previous.has(next)) {
        continue;
      }

      const node = nodes[next];

      if (!canUseRegularNodeForGuide(node, guide)) {
        continue;
      }

      const nextCost = cost.get(current) + (selected.has(next) ? 0 : 1);

      if (nextCost > maxCost) {
        continue;
      }

      previous.set(next, current);
      cost.set(next, nextCost);
      queue.push(next);
    }
  }

  return { previous };
}

function getPathFromSelectedTree(pathTree, selected, target) {
  if (!pathTree.previous.has(target)) {
    return [];
  }

  const pathIds = [];

  for (let current = target; current; current = pathTree.previous.get(current)) {
    if (!selected.has(current)) {
      pathIds.push(current);
    }
  }

  return pathIds.reverse();
}

function canUseRegularNodeForGuide(node, guide) {
  if (!node || !canVisit(node, null)) {
    return false;
  }

  if (guide.route !== "optimized") {
    return true;
  }

  if (node.x < 0) {
    return false;
  }

  const text = getSearchableStatText(`${node.name || ""} ${(node.stats || []).join(" ")}`);

  if (!text) {
    return true;
  }

  const targetEnemyLifeRatio = guide.targetEnemyLifeRatio ?? 1;

  if (targetEnemyLifeRatio < 1 && text.includes("full life")) {
    return false;
  }

  if (targetEnemyLifeRatio > 0.5 && (text.includes("low life") || text.includes("culling strike"))) {
    return false;
  }

  if (text.includes("within 2m") || text.includes("exited your presence")) {
    return false;
  }

  if (text.includes("maximum life is 1") || text.includes("never deal critical")) {
    return false;
  }

  if (text.includes("reduced armour") || text.includes("reduced evasion") || text.includes("reduced critical") || text.includes("more damage over time")) {
    return false;
  }

  if (text.includes("spell damage") || text.includes("spell skills") || text.includes("cast speed")) {
    return false;
  }

  if (text.includes("crossbow") || text.includes("bolt") || text.includes("quarterstaff") || text.includes("spear") || text.includes("dagger") || text.includes("flail") || text.includes("one-handed")) {
    return false;
  }

  if (text.includes("minion") || text.includes("totem") || text.includes("companion") || text.includes("shapeshift") || text.includes("unarmed") || text.includes("empty hand") || text.includes("rage")) {
    return false;
  }

  return scoreNodeForPath(node, guide.weights) > -20;
}

function findBestOptimizedFrontierExpansion(selected, guide) {
  const candidates = [];

  for (const id of selected) {
    for (const next of adjacency.get(id) || []) {
      if (selected.has(next)) {
        continue;
      }

      const node = nodes[next];

      if (!canUseRegularNodeForGuide(node, guide)) {
        continue;
      }

      candidates.push({ id: next, score: scoreNodeForPath(node, guide.weights) });
    }
  }

  const best = candidates.sort((a, b) => b.score - a.score || Number(a.id) - Number(b.id))[0];
  return best ? { pathIds: [best.id], rank: best.score, score: best.score } : null;
}

function scoreOptimizedPath(pathIds, guide) {
  return pathIds.reduce((total, id) => total + scoreNodeForPath(nodes[id], guide.weights), 0);
}

function scoreNodeForPath(node, weights) {
  if (!node?.stats?.length) {
    return 0.15;
  }

  return scoreNode(node, weights);
}

function getOptimizedRouteTargets(selected, guide) {
  return [...selected]
    .filter((id) => id !== guide.start && isUsefulTarget(id))
    .map((id) => ({ id, node: nodes[id], score: scoreNode(nodes[id], guide.weights) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => Number(b.node.isNotable) - Number(a.node.isNotable) || b.score - a.score || Number(a.id) - Number(b.id))
    .slice(0, 22)
    .map(({ id }) => id);
}

function buildAscendancyRoute(targets) {
  const selected = new Set();

  for (const target of targets) {
    const node = nodes[target];

    if (!node?.ascendancyId) {
      throw new Error(`Ascendancy target ${target} is not an ascendancy node`);
    }

    const start = ASCENDANCY_STARTS[node.ascendancyId];
    addPath(selected, shortestPath(start, target, node.ascendancyId));
  }

  return { selected };
}

function addPath(selected, pathIds) {
  for (const id of pathIds) {
    selected.add(id);
  }
}

function shortestPath(start, target, ascendancyId) {
  if (!start) {
    throw new Error(`Missing start for target ${target}`);
  }

  const queue = [start];
  const previous = new Map([[start, null]]);

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];

    if (current === target) {
      break;
    }

    for (const next of adjacency.get(current) || []) {
      if (previous.has(next)) {
        continue;
      }

      const node = nodes[next];

      if (!node || !canVisit(node, ascendancyId)) {
        continue;
      }

      previous.set(next, current);
      queue.push(next);
    }
  }

  if (!previous.has(target)) {
    throw new Error(`No path ${start} -> ${target}`);
  }

  const pathIds = [];

  for (let current = target; current; current = previous.get(current)) {
    pathIds.push(current);
  }

  return pathIds.reverse();
}

function canVisit(node, ascendancyId) {
  if (ascendancyId) {
    return node.ascendancyId === ascendancyId || node.isAscendancyStart;
  }

  return !node.ascendancyId && !node.isAscendancyStart && node.id !== null;
}

function findBestFrontierNode(selected, guide) {
  const candidates = new Map();

  for (const id of selected) {
    for (const next of adjacency.get(id) || []) {
      if (selected.has(next)) {
        continue;
      }

      const node = nodes[next];

      if (!node || !canVisit(node, null)) {
        continue;
      }

      const score = scoreNode(node, guide.weights) + countSelectedNeighbours(next, selected) * 0.08;
      const existing = candidates.get(next);

      if (!existing || score > existing.score) {
        candidates.set(next, { id: next, score });
      }
    }
  }

  return [...candidates.values()]
    .sort((a, b) => b.score - a.score || Number(a.id) - Number(b.id))[0]?.id;
}

function countSelectedNeighbours(id, selected) {
  let count = 0;

  for (const next of adjacency.get(id) || []) {
    if (selected.has(next)) {
      count++;
    }
  }

  return count;
}

function scoreNode(node, weights) {
  if (!node.stats?.length) {
    return -1000;
  }

  let score = 0;

  for (const stat of node.stats) {
    score += scoreStat(normalizeStat(stat), weights);
  }

  return score;
}

function scoreStat(stat, weights) {
  const numbers = [...stat.matchAll(/[-+]?\d+(?:\.\d+)?/g)].map((match) => Number(match[0]));
  const value = numbers.length ? Math.max(...numbers.map(Math.abs)) : 1;
  let score = 0;

  if (stat.includes("low life")) {
    score += value * weights.lowLife;
  }

  if (stat.includes("culling strike")) {
    score += value * weights.culling;
  }

  if (stat.includes("reduced damage") || stat.includes("reduced critical")) {
    score -= value * weights.genericDamage * weights.reducedPenalty;
  }

  if (stat.includes("more")) {
    score += value * (weights.moreDamage || weights.genericDamage || 1) * 2.2;
  }

  if (stat.includes("additional projectile") || stat.includes("fire an additional projectile")) {
    score += value * weights.additionalProjectile;
  }

  if (stat.includes("surpassing chance") || stat.includes("chain")) {
    score += value * weights.chain;
  }

  if (stat.includes("pierce")) {
    score += value * weights.pierce;
  }

  if (stat.includes("fork")) {
    score += value * weights.fork;
  }

  if (stat.includes("attack speed") || stat.includes("skill speed")) {
    score += value * weights.attackSpeed;
  }

  if (stat.includes("movement speed") || stat.includes("movement speed penalty") || stat.includes("tailwind")) {
    score += value * weights.movement;
  }

  if (stat.includes("projectile damage")) {
    score += value * weights.projectileDamage;
  }

  if (stat.includes("projectile speed")) {
    score += value * weights.projectileSpeed;
  }

  if (stat.includes("bow") || stat.includes("arrow")) {
    score += value * weights.bowDamage;
  }

  if (stat.includes("melee damage")) {
    score += value * (weights.meleeDamage || weights.attackDamage);
  }

  if (stat.includes("attack damage")) {
    score += value * weights.attackDamage;
  }

  if (stat.includes("physical damage")) {
    score += value * weights.physicalDamage;
  }

  if (stat.includes("physical") && stat.includes("extra cold")) {
    score += value * weights.gainAsCold;
  }

  if (stat.includes("cold damage") || stat.includes("extra cold")) {
    score += value * weights.coldDamage;
  }

  if (stat.includes("lightning damage") || stat.includes("extra lightning")) {
    score += value * weights.lightningDamage;
  }

  if (stat.includes("fire damage") || stat.includes("extra fire")) {
    score += value * weights.fireDamage;
  }

  if (stat.includes("chaos damage") || stat.includes("extra chaos")) {
    score += value * weights.chaosDamage;
  }

  if (stat.includes("elemental damage") || stat.includes("elemental resistance")) {
    score += value * weights.elementalDamage;
  }

  if (stat.includes("damage penetrates") && stat.includes("cold resistance")) {
    score += value * weights.coldPenetration;
  }

  if (stat.includes("damage penetrates") && stat.includes("lightning resistance")) {
    score += value * weights.lightningPenetration;
  }

  if (stat.includes("damage penetrates") && (stat.includes("fire resistance") || stat.includes("elemental resistance"))) {
    score += value * weights.firePenetration;
  }

  if (stat.includes("critical")) {
    score += value * weights.critical;
  }

  if (stat.includes("critical damage")) {
    score += value * weights.criticalDamage;
  }

  if (stat.includes("accuracy")) {
    score += value * (weights.accuracy || weights.dexterity);
  }

  if (stat.includes("marked") || stat.includes("mark effect") || stat.includes("critical weakness")) {
    score += value * weights.mark;
  }

  if (stat.includes("farther") || stat.includes("distance travelled")) {
    score += value * weights.farShot;
  }

  if (stat.includes("chilled enemies") || stat.includes("frozen by you take") || stat.includes("damage with hits against")) {
    score += value * weights.enemyDamageTaken;
  }

  if (stat.includes("freeze") || stat.includes("frozen") || stat.includes("chill")) {
    score += value * weights.freeze;
  }

  if (stat.includes("shock")) {
    score += value * weights.shock;
  }

  if (stat.includes("electrocute")) {
    score += value * (weights.electrocute || weights.shock);
  }

  if (stat.includes("poison")) {
    score += value * weights.poison;
  }

  if (stat.includes("ailment")) {
    score += value * (stat.includes("duration") ? weights.ailmentDuration : weights.ailmentChance);
  }

  if (stat.includes("magnitude")) {
    score += value * weights.ailmentMagnitude;
  }

  if (stat.includes("flask") || stat.includes("charm")) {
    score += value * weights.flask;
  }

  if (stat.includes("armour")) {
    score += value * weights.armour;
  }

  if (stat.includes("evasion")) {
    score += value * weights.evasion;
  }

  if (stat.includes("block")) {
    score += value * weights.blockChance;
  }

  if (stat.includes("maximum block")) {
    score += value * weights.blockChance * 2.5;
  }

  if (stat.includes("shield")) {
    score += value * weights.shield;
  }

  if (stat.includes("maximum life") || stat.includes("life recovery") || stat.includes("life gained")) {
    score += value * weights.life;
  }

  if (stat.includes("life leeched") || stat.includes("mana leeched") || stat.includes("leeching")) {
    score += value * weights.leech;
  }

  if (stat.includes("regenerate")) {
    score += value * weights.recovery * 12;
  }

  if (stat.includes("resistance") || stat.includes("resistances")) {
    score += value * weights.resist;
  }

  if (stat.includes("stun") || stat.includes("daze")) {
    score += value * weights.stun;
  }

  if (stat.includes("skill effect duration")) {
    score += value * weights.skillEffectDuration;
  }

  if (stat.includes("avoid") || stat.includes("reduced duration of ailments") || stat.includes("reduced effect of chill")) {
    score += value * weights.ailmentAvoid;
  }

  if (stat.includes("frenzy charge") || stat.includes("power charge")) {
    score += value * weights.frenzy;
  }

  if (stat.includes("strength")) {
    score += value * weights.strength;
  }

  if (stat.includes("dexterity")) {
    score += value * weights.dexterity;
  }

  if (stat.includes("intelligence")) {
    score += value * weights.intelligence;
  }

  if (stat.includes("increased damage") || stat.includes("damage with hits")) {
    score += value * weights.genericDamage;
  }

  return score;
}

function normalizeStat(stat) {
  return stat
    .replace(/\[[^\]|]+\|([^\]]+)\]/g, "$1")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[{}]/g, "")
    .toLowerCase();
}

function getSearchableStatText(stat) {
  return `${normalizeStat(stat)} ${stat.toLowerCase().replace(/[\[\]{}|<>]/g, " ")}`.replace(/\s+/g, " ");
}

function countRegularSkillPoints(selected, start) {
  return [...selected].filter((id) => id !== start && !nodes[id].ascendancyId && !nodes[id].isAscendancyStart).length;
}

function countAscendancySkillPoints(selected) {
  return [...selected].filter((id) => nodes[id].ascendancyId && !nodes[id].isAscendancyStart).length;
}

function getRegularNodes(selected, start) {
  return [...selected].filter((id) => id === start || (!nodes[id].ascendancyId && !nodes[id].isAscendancyStart));
}

function getAscendancyNodes(selected) {
  return [...selected].filter((id) => nodes[id].ascendancyId || nodes[id].isAscendancyStart);
}

function isUsefulTarget(id) {
  const node = nodes[id];

  if (!node?.stats?.length || !node.name) {
    return false;
  }

  return !["Strength", "Dexterity", "Intelligence"].includes(node.name);
}

function renderSvg(title, route, budget) {
  const normal = getRegularNodes(route.selected, route.regularStart);
  const normalCount = countRegularSkillPoints(route.selected, route.regularStart);
  const ascendancyIds = getAscendancyNodes(route.selected);
  const hasAscendancy = ascendancyIds.length > 0;
  const ascendancyCount = countAscendancySkillPoints(route.selected);
  const width = 1440;
  const height = 900;
  const headerHeight = 88;
  const panes = [];

  if (normal.length) {
    panes.push({
      title: "Passive tree route",
      ids: normal,
      x: 36,
      y: headerHeight,
      width: hasAscendancy ? 948 : 1368,
      height: 760,
      type: "normal"
    });
  }

  if (hasAscendancy) {
    panes.push({
      title: "Ascendancy choices",
      ids: ascendancyIds,
      x: 1014,
      y: headerHeight,
      width: 390,
      height: 760,
      type: "ascendancy"
    });
  }

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)} selected skill tree nodes">`,
    '<defs><pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M 44 0 L 0 0 0 44" fill="none" stroke="#263040" stroke-width="1"/></pattern><filter id="glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>',
    '<rect width="100%" height="100%" fill="#0f1218"/>',
    '<rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" opacity="0.16"/>',
    `<text x="36" y="42" fill="#f5d28d" font-family="Segoe UI, Arial, sans-serif" font-size="28" font-weight="700">${escapeXml(title)}</text>`,
    `<text x="36" y="70" fill="#aeb7c8" font-family="Segoe UI, Arial, sans-serif" font-size="17">Gold path = allocated route, cyan ring = priority node, regular skill points: ${normalCount}/${budget}, ascendancy points: ${ascendancyCount}/8 separate</text>`
  ];

  panes.forEach((pane, index) => parts.push(renderPane(pane, route.selected, route.targets, route.labels, route.labelAliases, route.optimizeLabels, index)));
  parts.push("</svg>");

  return parts.join("\n");
}

function renderPane(pane, selected, targets, labels, labelAliases, optimizeLabels, index) {
  const coords = pane.ids.map((id) => nodes[id]).filter((node) => Number.isFinite(node.x) && Number.isFinite(node.y));
  const minX = Math.min(...coords.map((node) => node.x));
  const maxX = Math.max(...coords.map((node) => node.x));
  const minY = Math.min(...coords.map((node) => node.y));
  const maxY = Math.max(...coords.map((node) => node.y));
  const margin = pane.type === "normal" ? 700 : 240;
  const bounds = { minX: minX - margin, maxX: maxX + margin, minY: minY - margin, maxY: maxY + margin };
  const background = getBackgroundNodes(bounds, pane.type, pane.ids);
  const paneSelected = new Set(pane.ids);
  const targetIds = new Set([...targets].filter((id) => paneSelected.has(id)));
  const defaultLabelIds = [...targetIds].filter((id) => nodes[id].name).slice(0, 18);
  const priorityLabelIds = [...labels].filter((id) => paneSelected.has(id) && nodes[id].name && !defaultLabelIds.includes(id));
  const labelIds = getLabelIds([...defaultLabelIds, ...priorityLabelIds], labelAliases, optimizeLabels);
  const scale = Math.min(
    pane.width / Math.max(1, bounds.maxX - bounds.minX),
    (pane.height - 52) / Math.max(1, bounds.maxY - bounds.minY)
  );
  const contentWidth = (bounds.maxX - bounds.minX) * scale;
  const contentHeight = (bounds.maxY - bounds.minY) * scale;
  const offsetX = pane.x + (pane.width - contentWidth) / 2;
  const offsetY = pane.y + 52 + (pane.height - 52 - contentHeight) / 2;
  const clipId = `pane-${index}`;
  const parts = [
    "<g>",
    `<clipPath id="${clipId}"><rect x="${pane.x}" y="${pane.y + 52}" width="${pane.width}" height="${pane.height - 52}" rx="14"/></clipPath>`,
    `<rect x="${pane.x}" y="${pane.y}" width="${pane.width}" height="${pane.height}" rx="18" fill="#151a22" stroke="#31394a"/>`,
    `<text x="${pane.x + 22}" y="${pane.y + 34}" fill="#dbe5f4" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(pane.title)}</text>`,
    `<g clip-path="url(#${clipId})">`
  ];
  const project = (node) => ({
    x: offsetX + (node.x - bounds.minX) * scale,
    y: offsetY + (node.y - bounds.minY) * scale
  });

  for (const [a, b] of getEdges(background)) {
    const from = project(nodes[a]);
    const to = project(nodes[b]);
    const selectedEdge = paneSelected.has(a) && paneSelected.has(b);
    parts.push(`<line x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}" stroke="${selectedEdge ? "#e9b95f" : "#30394a"}" stroke-width="${selectedEdge ? 3.2 : 1.2}" opacity="${selectedEdge ? 0.95 : 0.42}"/>`);
  }

  for (const id of background) {
    const node = nodes[id];
    const point = project(node);
    const isSelected = paneSelected.has(id);
    const isTarget = targetIds.has(id);
    const radius = isTarget ? 10 : isSelected ? 6.5 : 3.2;
    const fill = isTarget ? "#45e3ff" : isSelected ? "#e9b95f" : "#485269";
    const stroke = isTarget ? "#f8d987" : isSelected ? "#f8d987" : "#202838";
    const opacity = isSelected || isTarget ? 1 : 0.42;
    const filter = isTarget ? ' filter="url(#glow)"' : "";
    parts.push(`<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${isTarget ? 3 : 1.4}" opacity="${opacity}"${filter}/>`);
  }

  for (const label of getLabelPlacements(labelIds, pane, project, labelAliases, optimizeLabels)) {
    parts.push(renderLabel(label));
  }

  parts.push("</g>", "</g>");
  return parts.join("\n");
}

function getLabelIds(ids, labelAliases, dedupe) {
  if (!dedupe) {
    return ids;
  }

  const seen = new Set();
  return ids.filter((id) => {
    const label = labelAliases[id] || nodes[id].name;

    if (seen.has(label)) {
      return false;
    }

    seen.add(label);
    return true;
  });
}

function getLabelPlacements(labelIds, pane, project, labelAliases, avoidCollisions) {
  const placedBoxes = [];
  const labels = [];

  labelIds.forEach((id, index) => {
    const node = nodes[id];
    const point = project(node);
    const anchorRight = point.x < pane.x + pane.width * 0.64;
    const label = labelAliases[id] || node.name;
    const text = label.length > 26 ? `${label.slice(0, 24)}...` : label;
    const placement = avoidCollisions
      ? placeReadableLabel(point, pane, text, anchorRight, placedBoxes)
      : placeLegacyLabel(point, text, anchorRight, index);

    placedBoxes.push(placement.box);
    labels.push(placement);
  });

  return labels;
}

function placeReadableLabel(point, pane, text, anchorRight, placedBoxes) {
  const sides = [anchorRight, !anchorRight];
  const xOffsets = [16, 42, 70];
  const yOffsets = [0, -22, 22, -44, 44, -66, 66, -88, 88];

  for (const side of sides) {
    for (const xOffset of xOffsets) {
      for (const yOffset of yOffsets) {
        const labelX = side ? point.x + xOffset : point.x - xOffset;
        const labelY = point.y + yOffset;
        const box = getLabelBox(labelX, labelY, text, side);

        if (labelBoxFitsPane(box, pane) && !labelBoxCollides(box, placedBoxes)) {
          return { anchorRight: side, box, labelX, labelY, text };
        }
      }
    }
  }

  return placeLegacyLabel(point, text, anchorRight, placedBoxes.length);
}

function placeLegacyLabel(point, text, anchorRight, index) {
  const labelX = anchorRight ? point.x + 14 : point.x - 14;
  const labelY = point.y + ((index % 3) - 1) * 18;
  return { anchorRight, box: getLabelBox(labelX, labelY, text, anchorRight), labelX, labelY, text };
}

function getLabelBox(labelX, labelY, text, anchorRight) {
  const width = Math.min(220, text.length * 8.2);
  return {
    x1: anchorRight ? labelX : labelX - width,
    x2: anchorRight ? labelX + width : labelX,
    y1: labelY - 20,
    y2: labelY + 8
  };
}

function labelBoxFitsPane(box, pane) {
  const minX = pane.x + 8;
  const maxX = pane.x + pane.width - 8;
  const minY = pane.y + 60;
  const maxY = pane.y + pane.height - 8;
  return box.x1 >= minX && box.x2 <= maxX && box.y1 >= minY && box.y2 <= maxY;
}

function labelBoxCollides(box, placedBoxes) {
  return placedBoxes.some((placed) => box.x1 < placed.x2 && box.x2 > placed.x1 && box.y1 < placed.y2 && box.y2 > placed.y1);
}

function renderLabel(label) {
  return `<text x="${label.labelX.toFixed(1)}" y="${label.labelY.toFixed(1)}" text-anchor="${label.anchorRight ? "start" : "end"}" fill="#f8f2df" stroke="#0f1218" stroke-width="4" paint-order="stroke" font-family="Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">${escapeXml(label.text)}</text>`;
}

function getBackgroundNodes(bounds, type, ids) {
  const selected = new Set(ids);
  const background = new Set(ids);

  for (const [id, node] of Object.entries(nodes)) {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) {
      continue;
    }

    const isAscendancy = node.ascendancyId || node.isAscendancyStart;

    if (type === "normal" && isAscendancy) {
      continue;
    }

    if (type === "ascendancy" && !isAscendancy) {
      continue;
    }

    if (node.x < bounds.minX || node.x > bounds.maxX || node.y < bounds.minY || node.y > bounds.maxY) {
      continue;
    }

    background.add(id);
  }

  for (const id of selected) {
    for (const next of adjacency.get(id) || []) {
      if (!nodeIsInPane(nodes[next], bounds, type)) {
        continue;
      }

      background.add(next);
    }
  }

  return [...background].filter((id) => nodes[id] && Number.isFinite(nodes[id].x) && Number.isFinite(nodes[id].y));
}

function nodeIsInPane(node, bounds, type) {
  if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) {
    return false;
  }

  const isAscendancy = node.ascendancyId || node.isAscendancyStart;

  if (type === "normal" && isAscendancy) {
    return false;
  }

  if (type === "ascendancy" && !isAscendancy) {
    return false;
  }

  return node.x >= bounds.minX && node.x <= bounds.maxX && node.y >= bounds.minY && node.y <= bounds.maxY;
}

function getEdges(ids) {
  const idSet = new Set(ids);
  const seen = new Set();
  const edges = [];

  for (const id of ids) {
    for (const next of adjacency.get(id) || []) {
      if (!idSet.has(next)) {
        continue;
      }

      const key = [id, next].sort().join("-");

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      edges.push([id, next]);
    }
  }

  return edges;
}

function escapeXml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  })[char]);
}
